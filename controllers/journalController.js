const Journal = require('../models/Journal');
const User = require('../models/User');
const { analyzeJournal } = require('../services/geminiService');

// @desc    Analisis & Simpan Jurnal Baru
// @route   POST /api/journal/analyze
// @access  Private (Perlu Login)
const createAnalysis = async (req, res) => {
    const { text } = req.body;
    const user = req.user; // Didapat dari middleware auth (protect)

    // 1. Validasi Input
    if (!text) {
        return res.status(400).json({ message: 'Isi dulu curhatannya dong!' });
    }

    try {
        // 2. LOGIKA PAYWALL / PEMBATASAN
        // Jika user masih FREE, cek apakah sudah mencapai limit harian
        if (!user.isPremium) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set waktu ke jam 00:00 hari ini

            // Hitung berapa jurnal yang dibuat user hari ini
            const count = await Journal.countDocuments({
                user: user.id,
                createdAt: { $gte: today }
            });

            // Jika sudah ada 1 (atau lebih), tolak request
            if (count >= 1) {
                return res.status(403).json({
                    message: 'Limit Harian Habis! Upgrade ke Premium untuk curhat sepuasnya.',
                    requiresUpgrade: true // Flag khusus untuk Frontend memunculkan popup bayar
                });
            }
        }

        // 3. Panggil AI Service (Gemini)
        const aiResult = await analyzeJournal(text);

        // 4. Simpan ke Database
        const newEntry = await Journal.create({
            user: req.user.id, // Hubungkan jurnal dengan ID pemiliknya
            originalText: text,
            ...aiResult // Masukkan semua data dari AI (mood, xp_gained, stats, dll)
        });

        console.log(`Jurnal baru dibuat oleh ${user.username}:`, newEntry._id);

        // 5. Kirim respon sukses ke Frontend
        res.status(200).json({
            success: true,
            data: newEntry
        });

    } catch (error) {
        console.error("Server Error di createAnalysis:", error);
        res.status(500).json({ message: 'Gagal memproses analisis jurnal.' });
    }
};

// @desc    Ambil semua riwayat jurnal milik user yang login
// @route   GET /api/journal
// @access  Private
const getAllJournals = async (req, res) => {
    try {
        // Cari jurnal yang field 'user'-nya sama dengan ID user yang sedang login
        // Sort: -1 artinya urutan menurun (terbaru paling atas)
        const journals = await Journal.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: journals
        });
    } catch (error) {
        console.error("Server Error di getAllJournals:", error);
        res.status(500).json({ message: 'Gagal mengambil data history.' });
    }
};

module.exports = { createAnalysis, getAllJournals };