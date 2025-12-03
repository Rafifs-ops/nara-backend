const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Cek user lama
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email sudah terdaftar' });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Buat user
        const user = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        // Cek password
        if (user && (await bcrypt.compare(password, user.password))) {
            // Buat Tiket (Token)
            const token = jwt.sign(
                { id: user._id, isPremium: user.isPremium },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    isPremium: user.isPremium
                }
            });
        } else {
            res.status(401).json({ message: 'Email atau password salah' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };