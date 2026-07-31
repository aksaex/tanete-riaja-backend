// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load .env
dotenv.config();

const app = express();

// =========================================================
// 🔥 CORS - Konfigurasi untuk Vercel & Local
// =========================================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://taneteriaja.vercel.app/', // domain Anda
  'https://taneteriaja.go.id',
];

// CORS middleware (sudah handle OPTIONS secara otomatis)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ❌ HAPUS baris ini → app.options('*', cors());

// Middleware logging (opsional)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Koneksi DB middleware
app.use(async (req, res, next) => {
  if (process.env.MONGO_URI) {
    await connectDB();
  }
  next();
});

// =========================================================
// 🚀 ROUTES
// =========================================================
const beritaRoutes = require('./routes/beritaRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Root endpoint
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'API Server Kecamatan Tanete Riaja',
    timestamp: new Date().toISOString(),
  });
});

// Daftarkan routes
app.use('/api/berita', beritaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// =========================================================
// 🔥 404 Handler (TANPA pattern '*')
// =========================================================
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan`,
  });
});

// =========================================================
// 🛡️ Global Error Handler
// =========================================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// =========================================================
// 🚀 Jalankan server (kecuali di Vercel)
// =========================================================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;