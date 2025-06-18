// backend/controllers/reportController.js
const Client = require('../models/Client');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs'); // For file cleanup

exports.generateClientFinancialsCsv = async (req, res) => {
    try {
        const { startDate, endDate, clientId } = req.query;
        let query = {};

        if (clientId) {
            query._id = clientId;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const clients = await Client.find(query).lean(); // .lean() for plain JS objects

        if (clients.length === 0) {
            return res.status(404).json({ message: 'No clients found for the given criteria.' });
        }

        const csvHeader = [
            { id: 'name', title: 'Client Name' },
            { id: 'email', title: 'Email' },
            { id: 'revenue', title: 'Revenue' },
            { id: 'expenses', title: 'Expenses' },
            { id: 'netProfit', title: 'Net Profit' },
            { id: 'createdAt', title: 'Created At' },
        ];

        const records = clients.map(client => ({
            name: client.name,
            email: client.email,
            revenue: client.financials.revenue,
            expenses: client.financials.expenses,
            netProfit: client.financials.netProfit,
            createdAt: client.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
        }));

        const tempFilePath = path.join(__dirname, `../temp_reports/client_financials_${Date.now()}.csv`);
        if (!fs.existsSync(path.join(__dirname, '../temp_reports'))) {
            fs.mkdirSync(path.join(__dirname, '../temp_reports'));
        }

        const csvWriter = createCsvWriter({
            path: tempFilePath,
            header: csvHeader,
        });

        await csvWriter.writeRecords(records);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="client_financials_report.csv"`);
        res.sendFile(tempFilePath, {}, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).json({ message: 'Error downloading file.' });
            }
            // Clean up the temporary file
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
            });
        });

    } catch (error) {
        console.error('Error generating CSV report:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};