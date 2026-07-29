// models/Berita.js
const mongoose = require('mongoose');

const beritaSchema = new mongoose.Schema(
  {
    judul: {
      type: String,
      required: [true, 'Judul berita wajib diisi'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    ringkasan: {
      type: String,
      required: [true, 'Ringkasan berita wajib diisi'],
    },
    konten: {
      type: String,
      required: [true, 'Konten berita wajib diisi'],
    },
    gambar: {
      type: String,
      required: [true, 'Gambar berita wajib ada'],
    },
    kategori: {
      type: String,
      required: true,
      enum: ['Pemerintahan', 'Pertanian', 'Ekonomi', 'Wisata', 'Umum'],
      default: 'Umum',
    },
    tanggal: {
      type: String,
      required: true,
    },
    penulis: {
      type: String,
      default: 'Admin Kecamatan',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  {
    timestamps: true, // Otomatis menambah createdAt dan updatedAt
  }
);

module.exports = mongoose.model('Berita', beritaSchema);