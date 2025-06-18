// backend/controllers/clientController.js
const Client = require('../models/Client');

// Create a new client
exports.createClient = async (req, res) => {
    try {
        const { name, email, phone, financials, notes, tags } = req.body;
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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all clients with search, filter, and pagination
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

        if (minRevenue) {
            query['financials.revenue'] = { ...query['financials.revenue'], $gte: parseFloat(minRevenue) };
        }
        if (maxRevenue) {
            query['financials.revenue'] = { ...query['financials.revenue'], $lte: parseFloat(maxRevenue) };
        }

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

// Get a single client by ID
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
        const updatedClient = await Client.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, financials, notes, tags, updatedAt: Date.now() },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a client
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