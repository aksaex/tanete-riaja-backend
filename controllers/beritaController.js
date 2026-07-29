// controllers/beritaController.js
const Berita = require('../models/Berita');

// 1. GET: Ambil Semua Berita (Publik)
exports.getSemuaBerita = async (req, res) => {
  try {
    const berita = await Berita.find().sort({ createdAt: -1 }); // Urutkan dari yang terbaru
    res.status(200).json({
      status: 'success',
      jumlah: berita.length,
      data: berita,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. GET: Ambil Detail Satu Berita Berdasarkan Slug (Publik)
exports.getDetailBerita = async (req, res) => {
  try {
    const berita = await Berita.findOne({ slug: req.params.slug });
    if (!berita) {
      return res.status(404).json({ status: 'error', message: 'Berita tidak ditemukan' });
    }
    res.status(200).json({ status: 'success', data: berita });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. POST: Buat Berita Baru + Upload Gambar (Admin)
exports.buatBerita = async (req, res) => {
  try {
    const { judul, ringkasan, konten, kategori, penulis } = req.body;

    // Generate slug otomatis dari judul (misal: "Panen Padi" -> "panen-padi")
    const slug = judul
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Ambil URL gambar hasil upload dari Cloudinary (melalui Multer)
    const gambarUrl = req.file ? req.file.path : '';

    if (!gambarUrl) {
      return res.status(400).json({ status: 'error', message: 'Gambar wajib diupload!' });
    }

    // Format tanggal Indonesia modern (contoh: "29 Juli 2026")
    const tanggalSekarang = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const beritaBaru = await Berita.create({
      judul,
      slug,
      ringkasan,
      konten,
      gambar: gambarUrl,
      kategori,
      tanggal: tanggalSekarang,
      penulis: penulis || 'Admin Kecamatan',
    });

    res.status(201).json({
      status: 'success',
      message: 'Berita berhasil dipublikasikan!',
      data: beritaBaru,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// 4. PUT: Update Berita (Admin)
exports.updateBerita = async (req, res) => {
  try {
    const dataUpdate = { ...req.body };

    // Jika ada upload gambar baru, ganti URL gambarnya
    if (req.file) {
      dataUpdate.gambar = req.file.path;
    }

    // Jika judul diubah, update juga slug-nya
    if (dataUpdate.judul) {
      dataUpdate.slug = dataUpdate.judul
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const berita = await Berita.findByIdAndUpdate(req.params.id, dataUpdate, {
      new: true,
      runValidators: true,
    });

    if (!berita) {
      return res.status(404).json({ status: 'error', message: 'Berita tidak ditemukan' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Berita berhasil diperbarui!',
      data: berita,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// 5. DELETE: Hapus Berita (Admin)
exports.hapusBerita = async (req, res) => {
  try {
    const berita = await Berita.findByIdAndDelete(req.params.id);
    if (!berita) {
      return res.status(404).json({ status: 'error', message: 'Berita tidak ditemukan' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Berita berhasil dihapus dari sistem!',
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};