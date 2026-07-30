// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load .env untuk lokal
dotenv.config();

const app = express();

// =========================================================
// 🔥 CORS - Konfigurasi untuk Vercel & Local
// =========================================================
const allowedOrigins = [
  'http://localhost:3000',
  'https://tanete-riaja-frontend.vercel.app',
  'https://taneteriaja.go.id',
  // Tambahkan domain frontend Vercel Anda
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware Otomatis: Coba koneksi database pada setiap request jika MONGO_URI tersedia
app.use(async (req, res, next) => {
  if (process.env.MONGO_URI) {
    await connectDB();
  }
  next();
});

// Import Routes
const beritaRoutes = require('./routes/beritaRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); // 👈 Tambahkan ini

// =========================================================
// 🚀 ENDPOINT DIAGNOSA & PENDETEKSI ERROR (ROOT URL)
// =========================================================
app.get(['/', '/api'], (req, res) => {
  const isMongoUriExist = Boolean(process.env.MONGO_URI);
  const isJwtExist = Boolean(process.env.JWT_SECRET);
  const isCloudinaryExist = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

  let maskedUri = 'TIDAK TERDETEKSI (undefined)';
  if (isMongoUriExist) {
    const uri = process.env.MONGO_URI;
    maskedUri = `${uri.substring(0, 15)}...${uri.substring(uri.length - 12)}`;
  }

  res.status(200).json({
    status: isMongoUriExist ? 'online' : 'warning',
    message: isMongoUriExist
      ? '🚀 API Server Kecamatan Tanete Riaja Berjalan Sempurna!'
      : '⚠️ Server berjalan, TETAPI Environment Variable MONGO_URI belum terbaca oleh Vercel!',
    diagnosa_env: {
      MONGO_URI: isMongoUriExist ? `ADA (${maskedUri})` : '❌ KOSONG / UNDEFINED',
      JWT_SECRET: isJwtExist ? 'ADA' : '❌ KOSONG',
      CLOUDINARY_CLOUD_NAME: isCloudinaryExist ? 'ADA' : '❌ KOSONG',
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
    daftar_key_env_terbaca: Object.keys(process.env).filter(
      (key) => !key.startsWith('npm_') && !key.startsWith('VERCEL_')
    ),
    waktu_server: new Date().toISOString(),
  });
});

// Daftarkan Route Utama
app.use('/api/berita', beritaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // 👈 Route untuk create admin pertama

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Terjadi kesalahan pada server',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Jalankan server di lokal jika bukan di Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🔥 SERVER BERJALAN DI: http://localhost:${PORT}`);
  });
}

// Export aplikasi Express untuk Vercel Serverless Function
module.exports = app;