const midtransClient = require('midtrans-client');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// Setup Midtrans
const snap = new midtransClient.Snap({
    isProduction: false, // Pakai Sandbox
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

// @desc    Buat Token Pembayaran
// @route   POST /api/payment/create-transaction
const createTransaction = async (req, res) => {
    try {
        const orderId = `ORDER-${uuidv4()}`; // ID Transaksi unik
        const grossAmount = 50000; // Harga Premium Rp 50.000

        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount
            },
            customer_details: {
                first_name: req.user.username,
                email: req.user.email
            }
        };

        const transaction = await snap.createTransaction(parameter);

        res.status(200).json({
            token: transaction.token,
            orderId: orderId
        });

    } catch (error) {
        console.error("Midtrans Error:", error);
        res.status(500).json({ message: 'Gagal membuat transaksi' });
    }
};

// @desc    Verifikasi Pembayaran Sukses (Sederhana)
// @route   POST /api/payment/success
const paymentSuccess = async (req, res) => {
    try {
        // Di produksi, harusnya pakai Webhook Notification Midtrans agar aman.
        // Untuk tahap belajar/simple, kita percaya frontend dulu.

        const user = await User.findById(req.user.id);
        user.isPremium = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Akun berhasil diupgrade!' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal update status user' });
    }
};

module.exports = { createTransaction, paymentSuccess };