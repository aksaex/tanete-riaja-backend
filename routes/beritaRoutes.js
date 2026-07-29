// routes/beritaRoutes.js
const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  getSemuaBerita,
  getDetailBerita,
  buatBerita,
  updateBerita,
  hapusBerita,
} = require('../controllers/beritaController');

// Jalur Publik (Tanpa Proteksi)
router.get('/', getSemuaBerita);
router.get('/:slug', getDetailBerita);

// Jalur Admin (Upload Gambar menggunakan middleware upload.single('gambar'))
router.post('/', upload.single('gambar'), buatBerita);
router.put('/:id', upload.single('gambar'), updateBerita);
router.delete('/:id', hapusBerita);

module.exports = router;