// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import Routes
const beritaRoutes = require('./routes/beritaRoutes');
const authRoutes = require('./routes/authRoutes');

// 1. Load environment variables dari .env
dotenv.config();

// 2. Hubungkan ke MongoDB Atlas
connectDB();

// 3. Inisialisasi Aplikasi Express
const app = express();

// 4. Middleware
app.use(cors()); // Mencegah error CORS dari Frontend Next.js / Vercel
app.use(express.json()); // Agar bisa menerima Request Body berbentuk JSON
app.use(express.urlencoded({ extended: true })); // Agar bisa menerima form-data (upload gambar)

// 5. Daftarkan Route API
app.use('/api/berita', beritaRoutes);
app.use('/api/auth', authRoutes);

// 6. Tes Endpoint Sederhana (Root URL & /api)
// Dibuat 2 endpoint agar saat Vercel membuka URL root maupun /api tidak muncul error 404
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 API Server Kecamatan Tanete Riaja Berjalan Sempurna di Vercel!',
    waktu_server: new Date().toISOString(),
  });
});

// 7. Global Error Handler (Menangani error secara rapi agar selalu membalas JSON)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Terjadi kesalahan pada server',
    // Hanya tampilkan detail stack trace jika bukan di production
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// 8. Menjalankan Server (Hanya dijalankan jika TIDAK di Vercel/Serverless environment)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🔥 SERVER BERJALAN DI: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

// 9. WAJIB UNTUK VERCEL: Export aplikasi Express sebagai modul serverless
module.exports = app;