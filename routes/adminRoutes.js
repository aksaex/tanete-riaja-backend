// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { createFirstAdmin } = require('../controllers/adminController');

// Endpoint untuk membuat admin pertama (hanya bisa diakses jika belum ada admin)
router.post('/setup', createFirstAdmin);

module.exports = router;