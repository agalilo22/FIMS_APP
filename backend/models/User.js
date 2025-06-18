// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: { // Added for better user experience
        type: String,
    },
    picture: { // Added for better user experience
        type: String,
    },
    role: {
        type: String,
        enum: ['admin', 'analyst', 'viewer'],
        default: 'viewer', // Default role for new users
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);