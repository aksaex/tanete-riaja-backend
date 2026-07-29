// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
  let token;

  // Cek apakah ada header Authorization dengan format Bearer Token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Ambil token dari string (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi token dengan JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Simpan data admin yang sedang login ke objek request
      req.admin = await Admin.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Sesi login tidak sah atau sudah kedaluwarsa, silakan login kembali.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Akses ditolak! Token otorisasi tidak ditemukan.',
    });
  }
};