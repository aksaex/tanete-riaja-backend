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
  'http://localhost:3001',
  'https://tanete-riaja-frontend.vercel.app',
  'https://tanete-riaja-frontendd.vercel.app', // 👈 Tambahkan domain Anda (double 'd')
  'https://taneteriaja.go.id',
  // Tambahkan domain lain jika perlu
];

// Middleware CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all origins during development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS request secara eksplisit
app.options('*', cors());

// Middleware logging untuk debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📡 ${req.method} ${req.url} → ${res.statusCode} (${duration}ms) - Origin: ${req.headers.origin || 'N/A'}`);
  });
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
const adminRoutes = require('./routes/adminRoutes');

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
app.use('/api/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  console.error('❌ Global Error:', err.stack || err.message);
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
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 CORS allowed origins:`, allowedOrigins);
  });
}

// Export aplikasi Express untuk Vercel Serverless Function
module.exports = app;