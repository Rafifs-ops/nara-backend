const Journal = require('../models/Journal');
const User = require('../models/User'); // Pastikan User diimport
const { analyzeJournal } = require('../services/geminiService');

// @desc    Analisis & Simpan Jurnal Baru
// @route   POST /api/journal/analyze
// @access  Private
const createAnalysis = async (req, res) => {
    const { text } = req.body;

    // Validasi Input Kosong
    if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Tulis sesuatu dulu dong!' });
    }

    // Pastikan user ada (dari middleware)
    if (!req.user) {
        return res.status(401).json({ message: 'User tidak ditemukan.' });
    }

    try {
        const user = req.user;

        // --- LOGIKA PAYWALL (LIMIT HARIAN) ---
        // Jika user TIDAK Premium, cek limit
        if (!user.isPremium) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            // Hitung jurnal yang dibuat HARI INI
            const count = await Journal.countDocuments({
                user: user._id,
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            // Batas 1 jurnal per hari untuk free user
            if (count >= 1) {
                return res.status(403).json({
                    message: 'Kuota Harian Habis! Upgrade ke Premium untuk curhat sepuasnya.',
                    requiresUpgrade: true
                });
            }
        }
        // -------------------------------------

        // 1. Panggil AI Service
        const aiResult = await analyzeJournal(text);

        // 2. Simpan ke Database
        const newEntry = await Journal.create({
            user: user._id,
            originalText: text,
            ...aiResult // Spread operator untuk memasukkan mood, xp, stats, dll
        });

        console.log(`Jurnal baru sukses: ${newEntry._id} oleh ${user.username}`);

        // 3. Kirim respon ke Frontend
        res.status(200).json({
            success: true,
            data: newEntry
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// @desc    Ambil History Jurnal User
// @route   GET /api/journal
// @access  Private
const getAllJournals = async (req, res) => {
    try {
        const journals = await Journal.find({ user: req.user._id })
            .sort({ createdAt: -1 }); // Urutkan dari yang terbaru

        res.status(200).json({
            success: true,
            data: journals
        });
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: 'Gagal mengambil riwayat.' });
    }
};

module.exports = { createAnalysis, getAllJournals };