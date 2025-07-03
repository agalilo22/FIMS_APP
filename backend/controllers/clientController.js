// backend/controllers/clientController.js
const Client = require('../models/Client');

// Helper function for numeric validation (keep this as is)
const isValidNumber = (value) => {
    const MAX_ALLOWED_VALUE = 1e15; // Example: 1,000,000,000,000,000
    const MIN_ALLOWED_VALUE = 0;
    return typeof value === 'number' && Number.isFinite(value) && value >= MIN_ALLOWED_VALUE && value <= MAX_ALLOWED_VALUE;
};

// Create a new client (NO CHANGE NEEDED HERE, as it correctly uses .save())
exports.createClient = async (req, res) => {
    try {
        const { name, email, phone, financials, notes, tags } = req.body;

        // Numeric value validation (Server-side)
        if (financials && !isValidNumber(financials.revenue)) {
            return res.status(400).json({ message: 'Revenue must be a valid non-negative number and not excessively large.' });
        }
        if (financials && !isValidNumber(financials.expenses)) {
            return res.status(400).json({ message: 'Expenses must be a valid non-negative number and not excessively large.' });
        }

        // Duplicate email check for creation
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(409).json({ message: 'Client with this email already exists.' });
        }

        const newClient = new Client({
            name,
            email,
            phone,
            financials,
            notes,
            tags,
            createdBy: req.user.id,
        });
        await newClient.save(); // This will trigger the pre('save') hook for netProfit
        res.status(201).json(newClient);
    } catch (error) {
        console.error('Error creating client:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ message: 'Client with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all clients (NO CHANGE NEEDED HERE)
exports.getClients = async (req, res) => {
    try {
        const { search, minRevenue, maxRevenue, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const parsedMinRevenue = parseFloat(minRevenue);
        const parsedMaxRevenue = parseFloat(maxRevenue);

        if (minRevenue && (!isNaN(parsedMinRevenue) && Number.isFinite(parsedMinRevenue))) {
            query['financials.revenue'] = { ...query['financials.revenue'], $gte: parsedMinRevenue };
        }
        if (maxRevenue && (!isNaN(parsedMaxRevenue) && Number.isFinite(parsedMaxRevenue))) {
            query['financials.revenue'] = { ...query['financials.revenue'], $lte: parsedMaxRevenue };
        }

        const clients = await Client.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalClients = await Client.countDocuments(query);

        res.status(200).json({
            clients,
            totalPages: Math.ceil(totalClients / limit),
            currentPage: parseInt(page),
            totalClients,
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single client by ID (NO CHANGE NEEDED HERE)
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a client (***UPDATED LOGIC HERE***)
exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, financials, notes, tags } = req.body;

        // --- Validation for provided fields ---
        if (financials) {
            if (financials.revenue !== undefined && !isValidNumber(financials.revenue)) {
                return res.status(400).json({ message: 'Revenue must be a valid non-negative number and not excessively large.' });
            }
            if (financials.expenses !== undefined && !isValidNumber(financials.expenses)) {
                return res.status(400).json({ message: 'Expenses must be a valid non-negative number and not excessively large.' });
            }
        }

        // --- Duplicate email check for update (ensure it's not another client's email) ---
        if (email) { // Only check if email is being updated
            const existingClientWithEmail = await Client.findOne({ email, _id: { $ne: id } });
            if (existingClientWithEmail) {
                return res.status(409).json({ message: 'Another client with this email already exists.' });
            }
        }
        // --- END Duplicate email check ---

        // 1. Fetch the client document
        const clientToUpdate = await Client.findById(id);

        if (!clientToUpdate) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // 2. Apply updates to the fetched document's properties
        if (name !== undefined) clientToUpdate.name = name;
        if (email !== undefined) clientToUpdate.email = email;
        if (phone !== undefined) clientToUpdate.phone = phone;
        if (notes !== undefined) clientToUpdate.notes = notes;
        if (tags !== undefined) clientToUpdate.tags = tags;
        // Do not update `createdBy` here unless it's a specific requirement.

        // Update nested financials fields if provided
        if (financials) {
            if (financials.revenue !== undefined) clientToUpdate.financials.revenue = financials.revenue;
            if (financials.expenses !== undefined) clientToUpdate.financials.expenses = financials.expenses;
            // netProfit is automatically handled by the pre('save') hook
        }

        // Update the `updatedAt` timestamp (also handled by pre('save'), but good for clarity)
        clientToUpdate.updatedAt = Date.now();

        // 3. Save the document - this will trigger the pre('save') hook
        const updatedClient = await clientToUpdate.save();

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ message: 'Another client with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a client (NO CHANGE NEEDED HERE)
exports.deleteClient = async (req, res) => {
    try {
        const deletedClient = await Client.findByIdAndDelete(req.params.id);
        if (!deletedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};