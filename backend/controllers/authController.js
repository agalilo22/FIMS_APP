// backend/controllers/authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ALLOWED_DOMAIN = '@mmdc.mcl.edu.ph'; // Define the allowed domain

exports.googleAuth = async (req, res) => {
    const { id_token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // --- NEW: Domain Check ---
        if (!email || !email.endsWith(ALLOWED_DOMAIN)) {
            return res.status(403).json({ message: 'Authentication failed: You do not belong to the allowed domain.' });
        }
        // --- END NEW ---

        let user = await User.findOne({ googleId });

        if (!user) {
            // If user doesn't exist, create a new one with a default role
            user = new User({
                googleId,
                email,
                name,
                picture,
                role: 'viewer', // Default role for new users
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({ message: 'Login successful', token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};