const express = require('express');
const router = express.Router();
const { createAnalysis, getAllJournals } = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, createAnalysis);
router.get('/', protect, getAllJournals);
router.get('/', getAllJournals);

module.exports = router;