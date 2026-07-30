// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginAdmin, seedAdmin } = require('../controllers/authController');

// Login endpoint
router.post('/login', loginAdmin);

// Seeder endpoint (untuk membuat admin pertama - HAPUS SETELAH DIGUNAKAN)
// Akses: POST /api/auth/seed
router.post('/seed', seedAdmin);

module.exports = router;