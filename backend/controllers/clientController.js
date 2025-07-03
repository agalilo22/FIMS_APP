// backend/controllers/clientController.js
const Client = require('../models/Client');

// Helper function for numeric validation
const isValidNumber = (value) => {
    // Check if it's a number, finite, and not excessively large (e.g., beyond a reasonable max or MIN_SAFE_INTEGER)
    // For practical purposes, you might set a maximum allowable value, e.g., 1 quadrillion
    const MAX_ALLOWED_VALUE = 1e15; // Example: 1,000,000,000,000,000
    const MIN_ALLOWED_VALUE = 0; // Assuming non-negative revenue/expenses

    return typeof value === 'number' && Number.isFinite(value) && value >= MIN_ALLOWED_VALUE && value <= MAX_ALLOWED_VALUE;
};

// Create a new client
exports.createClient = async (req, res) => {
    try {
        const { name, email, phone, financials, notes, tags } = req.body;

        // --- NEW: Numeric value validation (Server-side) ---
        if (!isValidNumber(financials.revenue)) {
            return res.status(400).json({ message: 'Revenue must be a valid non-negative number and not excessively large.' });
        }
        if (!isValidNumber(financials.expenses)) {
            return res.status(400).json({ message: 'Expenses must be a valid non-negative number and not excessively large.' });
        }
        // --- END NEW ---

        // --- NEW: Duplicate email check for creation ---
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(409).json({ message: 'Client with this email already exists.' });
        }
        // --- END NEW ---

        const newClient = new Client({
            name,
            email,
            phone,
            financials,
            notes,
            tags,
            createdBy: req.user.id, // Set the creator based on the authenticated user
        });
        await newClient.save();
        res.status(201).json(newClient);
    } catch (error) {
        console.error('Error creating client:', error);
        // Catch MongoDB duplicate key error (E11000) for email uniqueness in case the above check misses it
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ message: 'Client with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all clients (no change needed here for this specific error handling)
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

        // --- NEW: Validate min/max revenue filters for numeric values
        const parsedMinRevenue = parseFloat(minRevenue);
        const parsedMaxRevenue = parseFloat(maxRevenue);

        if (minRevenue && (!isNaN(parsedMinRevenue) && Number.isFinite(parsedMinRevenue))) {
            query['financials.revenue'] = { ...query['financials.revenue'], $gte: parsedMinRevenue };
        }
        if (maxRevenue && (!isNaN(parsedMaxRevenue) && Number.isFinite(parsedMaxRevenue))) {
            query['financials.revenue'] = { ...query['financials.revenue'], $lte: parsedMaxRevenue };
        }
        // --- END NEW ---


        const clients = await Client.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 }); // Sort by newest first

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

// Get a single client by ID (no change needed here)
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

// Update a client
exports.updateClient = async (req, res) => {
    try {
        const { name, email, phone, financials, notes, tags } = req.body;

        // --- NEW: Numeric value validation (Server-side) for update ---
        if (!isValidNumber(financials.revenue)) {
            return res.status(400).json({ message: 'Revenue must be a valid non-negative number and not excessively large.' });
        }
        if (!isValidNumber(financials.expenses)) {
            return res.status(400).json({ message: 'Expenses must be a valid non-negative number and not excessively large.' });
        }
        // --- END NEW ---

        // --- NEW: Duplicate email check for update (ensure it's not another client's email) ---
        const existingClientWithEmail = await Client.findOne({ email, _id: { $ne: req.params.id } });
        if (existingClientWithEmail) {
            return res.status(409).json({ message: 'Another client with this email already exists.' });
        }
        // --- END NEW ---

        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, financials, notes, tags, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        // Catch MongoDB duplicate key error (E11000) for email uniqueness
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(409).json({ message: 'Another client with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a client (no change needed here)
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