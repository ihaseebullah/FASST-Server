const SOCIAL_USER = require("../Models/Social");
const USER = require("../Models/User");
const { sendVerificationEmail } = require("../Utils/sendMail");

async function Register(req, res) {
    try {
        const { email, password } = req.body;
        // Ensure email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const newUser = new USER({ email, password });
        await newUser.save()
        // Send verification email
        sendVerificationEmail(newUser.email, newUser.OTP);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 11000 && err.keyPattern?.email) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: err.message });
    }
}

module.exports = { Register };
