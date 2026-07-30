// controllers/authController.js
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Fungsi untuk generate token JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET tidak terdefinisi!');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// POST: Login Admin (/api/auth/login)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan password wajib diisi!',
      });
    }

    console.log(`🔐 Mencoba login: ${username}`);

    // Cari admin berdasarkan username
    const admin = await Admin.findOne({ username });

    // Debug: cek apakah admin ditemukan
    if (!admin) {
      console.log(`❌ Admin "${username}" tidak ditemukan di database`);
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah!',
      });
    }

    // Verifikasi password
    const isMatch = await admin.matchPassword(password);
    console.log(`🔑 Password match: ${isMatch}`);

    if (isMatch) {
      const token = generateToken(admin._id);
      res.status(200).json({
        status: 'success',
        message: 'Login berhasil!',
        data: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          token: token,
        },
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Username atau password salah!',
      });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server: ' + error.message,
    });
  }
};

// Fungsi untuk menambahkan admin pertama (seeder - untuk testing)
exports.seedAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib' });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Admin sudah ada' });
    }

    const admin = await Admin.create({ username, password });
    res.status(201).json({
      status: 'success',
      message: 'Admin berhasil dibuat!',
      data: { username: admin.username, role: admin.role },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};