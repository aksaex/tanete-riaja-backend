// controllers/adminController.js
const Admin = require('../models/Admin');

// POST: /api/admin/setup - Membuat admin pertama (hanya jika belum ada admin)
exports.createFirstAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan password wajib diisi!',
      });
    }

    // Cek apakah sudah ada admin di database
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin sudah ada! Gunakan endpoint login biasa.',
      });
    }

    // Buat admin baru
    const admin = await Admin.create({
      username,
      password,
      role: 'superadmin',
    });

    res.status(201).json({
      status: 'success',
      message: '✅ Admin pertama berhasil dibuat! Silakan login.',
      data: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};