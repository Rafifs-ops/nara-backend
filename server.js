require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import koneksi DB
const journalRoutes = require('./routes/journalRoutes'); // Import route

const app = express();

// Connect Database
connectDB();

// --- MIDDLEWARE WAJIB DI ATAS ---
app.use(cors()); // Izinkan semua domain (untuk development)
app.use(express.json()); // Agar bisa baca JSON body
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/journal', journalRoutes); // Prefix untuk route jurnal
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
  res.send('API Nara Berjalan...');
});

app.listen(8080, () => {
  console.log(`Server berjalan di http://localhost:8080`);
});