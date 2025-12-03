const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari header "Bearer eyJhbG..."
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Cari user pemilik token & simpan di req.user
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Boleh lanjut
        } catch (error) {
            res.status(401).json({ message: 'Token tidak valid, silakan login ulang.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak ada akses, silakan login.' });
    }
};

module.exports = { protect };