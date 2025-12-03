const express = require('express');
const router = express.Router();
const { createTransaction, paymentSuccess } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-transaction', protect, createTransaction);
router.post('/success', protect, paymentSuccess);

module.exports = router;