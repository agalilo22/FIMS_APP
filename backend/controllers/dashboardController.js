// backend/controllers/dashboardController.js
const Client = require('../models/Client');

exports.getFinancialSummary = async (req, res) => {
    try {
        // Aggregate total revenue, expenses, net profit
        const summary = await Client.aggregate([
            {
                $group: {
                    _id: null, // Group all documents
                    totalRevenue: { $sum: '$financials.revenue' },
                    totalExpenses: { $sum: '$financials.expenses' },
                    totalNetProfit: { $sum: '$financials.netProfit' },
                },
            },
        ]);

        // Aggregate revenue and expenses by month (assuming creation date)
        const monthlyData = await Client.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    monthlyRevenue: { $sum: '$financials.revenue' },
                    monthlyExpenses: { $sum: '$financials.expenses' },
                    monthlyNetProfit: { $sum: '$financials.netProfit' },
                    clientCount: { $sum: 1 }
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 },
            },
        ]);

        res.status(200).json({
            summary: summary.length > 0 ? summary[0] : { totalRevenue: 0, totalExpenses: 0, totalNetProfit: 0 },
            monthlyData,
        });
    } catch (error) {
        console.error('Error fetching financial summary:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};