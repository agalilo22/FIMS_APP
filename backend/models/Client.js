// backend/models/Client.js
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    financials: {
        revenue: {
            type: Number,
            default: 0,
        },
        expenses: {
            type: Number,
            default: 0,
        },
        netProfit: { // Derived field, can be calculated on read
            type: Number,
            default: 0,
        },
        // Add more financial metrics as needed
    },
    notes: {
        type: String,
        trim: true,
    },
    tags: [String], // Array of strings for custom tags
    fileUrls: [
        {
            fileName: String,
            url: String,
            uploadedBy: mongoose.Schema.Types.ObjectId, // Link to user who uploaded
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    createdBy: { // To track who created the client
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to calculate netProfit
clientSchema.pre('save', function (next) {
    this.financials.netProfit = this.financials.revenue - this.financials.expenses;
    this.updatedAt = Date.now();
    next();
});

// Add an index for faster searching by name or email
clientSchema.index({ name: 1, email: 1 });

module.exports = mongoose.model('Client', clientSchema);