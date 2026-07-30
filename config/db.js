// config/db.js
const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // Cek apakah MONGO_URI ada
  if (!mongoUri) {
    console.error('❌ ERROR DIAGNOSA: process.env.MONGO_URI bernilai UNDEFINED/KOSONG!');
    return false;
  }

  // Jika sudah terhubung, gunakan koneksi yang ada
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const db = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log(`🔥 MongoDB Terhubung Sukses: ${db.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Gagal terhubung ke MongoDB: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;