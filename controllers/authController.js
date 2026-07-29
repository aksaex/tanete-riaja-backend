// controllers/authController.js
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Fungsi untuk generate token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token berlaku selama 7 hari
  });
};

// POST: Login Admin (/api/auth/login)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cek apakah username dan password dikirim
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan password wajib diisi!',
      });
    }

    // Cari admin berdasarkan username
    const admin = await Admin.findOne({ username });

    // Jika admin ditemukan dan password cocok
    if (admin && (await admin.matchPassword(password))) {
      res.status(200).json({
        status: 'success',
        message: 'Login berhasil!',
        data: {
          id: admin._id,
          username: admin.username,
          role: admin.role,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Username atau password salah!',
      });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};