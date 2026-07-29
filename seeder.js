// seeder.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Bersihkan semua admin lama dari database
    await Admin.deleteMany();

    // 2. Buat hash password secara manual agar kita yakin 100% hasilnya tunggal
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    const hashedSuperPassword = await bcrypt.hash('superadmin123', salt);

    // 3. Masukkan menggunakan .insertMany() agar TIDAK memicu hook pre('save') ganda
    const adminData = [
      {
        username: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
      },
      {
        username: 'superadmin',
        password: hashedSuperPassword,
        role: 'superadmin',
      },
    ];

    await Admin.insertMany(adminData);

    console.log('✅ BERHASIL: 2 Akun Admin baru telah dibuat dengan enkripsi presisi!');
    process.exit();
  } catch (error) {
    console.error(`❌ Gagal: ${error.message}`);
    process.exit(1);
  }
};

importData();