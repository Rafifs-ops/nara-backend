const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  user: { // <--- Tambahan Baru: Referensi ke User
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalText: { type: String, required: true },
  // ... (sisanya sama persis seperti sebelumnya) ...
  mood: String,
  xp_gained: Number,
  stats: {
    stamina: Number,
    mental: Number,
    social: Number
  },
  summary: String,
  theme: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Journal', JournalSchema);