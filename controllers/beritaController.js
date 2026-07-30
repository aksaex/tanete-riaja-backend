// controllers/beritaController.js
const Berita = require('../models/Berita');

// ============================================================
// 1. GET: Ambil Semua Berita (Publik)
// ============================================================
exports.getSemuaBerita = async (req, res) => {
  try {
    console.log('📡 GET /api/berita - Mengambil semua berita');
    const berita = await Berita.find().sort({ createdAt: -1 });
    console.log(`✅ Ditemukan ${berita.length} berita`);
    res.status(200).json({
      status: 'success',
      jumlah: berita.length,
      data: berita,
    });
  } catch (error) {
    console.error('❌ Error getSemuaBerita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data berita',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

// ============================================================
// 2. GET: Ambil Detail Satu Berita Berdasarkan Slug (Publik)
// ============================================================
exports.getDetailBerita = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`📡 GET /api/berita/${slug} - Mencari detail berita`);

    if (!slug) {
      return res.status(400).json({
        status: 'error',
        message: 'Slug tidak boleh kosong',
      });
    }

    // 🔥 PERBAIKAN: Gunakan regex case-insensitive dan trim
    const slugTrimmed = slug.trim();
    const berita = await Berita.findOne({
      slug: { $regex: new RegExp(`^${slugTrimmed}$`), $options: 'i' },
    });

    if (!berita) {
      console.log(`❌ Berita dengan slug "${slugTrimmed}" tidak ditemukan`);
      return res.status(404).json({
        status: 'error',
        message: 'Berita tidak ditemukan',
      });
    }

    console.log(`✅ Berita ditemukan: "${berita.judul}" (ID: ${berita._id})`);
    res.status(200).json({
      status: 'success',
      data: berita,
    });
  } catch (error) {
    console.error('❌ Error getDetailBerita:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat mengambil detail berita',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

// ============================================================
// 3. POST: Buat Berita Baru + Upload Gambar (Admin)
// ============================================================
exports.buatBerita = async (req, res) => {
  try {
    const { judul, ringkasan, konten, kategori, penulis } = req.body;

    console.log(`📡 POST /api/berita - Membuat berita baru: "${judul}"`);

    // Validasi input
    if (!judul || !ringkasan || !konten) {
      return res.status(400).json({
        status: 'error',
        message: 'Judul, ringkasan, dan konten wajib diisi!',
      });
    }

    // Generate slug otomatis dari judul
    const slug = judul
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Ambil URL gambar hasil upload dari Cloudinary (melalui Multer)
    const gambarUrl = req.file ? req.file.path : '';

    if (!gambarUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Gambar wajib diupload!',
      });
    }

    // Format tanggal Indonesia
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
      kategori: kategori || 'Umum',
      tanggal: tanggalSekarang,
      penulis: penulis || 'Admin Kecamatan',
      status: 'published',
    });

    console.log(`✅ Berita berhasil dibuat: "${beritaBaru.judul}" (ID: ${beritaBaru._id})`);
    res.status(201).json({
      status: 'success',
      message: 'Berita berhasil dipublikasikan!',
      data: beritaBaru,
    });
  } catch (error) {
    console.error('❌ Error buatBerita:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Gagal membuat berita',
    });
  }
};

// ============================================================
// 4. PUT: Update Berita (Admin)
// ============================================================
exports.updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUpdate = { ...req.body };

    console.log(`📡 PUT /api/berita/${id} - Update berita`);

    // Hapus field yang tidak boleh diupdate
    delete dataUpdate._id;
    delete dataUpdate.createdAt;
    delete dataUpdate.__v;

    // Jika ada upload gambar baru, ganti URL gambarnya
    if (req.file) {
      dataUpdate.gambar = req.file.path;
      console.log('🖼️ Gambar baru diupload:', dataUpdate.gambar);
    } else {
      // Jika tidak ada file gambar, hapus field gambar dari update
      delete dataUpdate.gambar;
    }

    // Jika judul diubah, update juga slug-nya
    if (dataUpdate.judul) {
      dataUpdate.slug = dataUpdate.judul
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      console.log(`🔄 Slug diperbarui menjadi: "${dataUpdate.slug}"`);
    }

    // 🔥 PERBAIKAN: Gunakan returnDocument: 'after'
    const berita = await Berita.findByIdAndUpdate(
      id,
      dataUpdate,
      {
        returnDocument: 'after',
        runValidators: true,
        new: false, // Agar kompatibel dengan versi lama
      }
    );

    if (!berita) {
      console.log(`❌ Berita dengan ID "${id}" tidak ditemukan`);
      return res.status(404).json({
        status: 'error',
        message: 'Berita tidak ditemukan',
      });
    }

    console.log(`✅ Berita berhasil diperbarui: "${berita.judul}"`);
    res.status(200).json({
      status: 'success',
      message: 'Berita berhasil diperbarui!',
      data: berita,
    });
  } catch (error) {
    console.error('❌ Error updateBerita:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Gagal memperbarui berita',
    });
  }
};

// ============================================================
// 5. DELETE: Hapus Berita (Admin)
// ============================================================
exports.hapusBerita = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📡 DELETE /api/berita/${id} - Hapus berita`);

    const berita = await Berita.findByIdAndDelete(id);

    if (!berita) {
      console.log(`❌ Berita dengan ID "${id}" tidak ditemukan`);
      return res.status(404).json({
        status: 'error',
        message: 'Berita tidak ditemukan',
      });
    }

    console.log(`✅ Berita berhasil dihapus: "${berita.judul}"`);
    res.status(200).json({
      status: 'success',
      message: 'Berita berhasil dihapus dari sistem!',
      data: {
        id: berita._id,
        judul: berita.judul,
      },
    });
  } catch (error) {
    console.error('❌ Error hapusBerita:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Gagal menghapus berita',
    });
  }
};