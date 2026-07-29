// seederBerita.js
const dotenv = require('dotenv');
const Berita = require('./models/Berita');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importBerita = async () => {
  try {
    await Berita.deleteMany(); // Bersihkan berita lama jika ada

    const beritaData = [
      {
        judul: "Musrenbang Tahun 2026 Tingkat Kecamatan Tanete Riaja Sukses Digelar",
        slug: "musrenbang-2026-kecamatan-tanete-riaja",
        ringkasan: "Pembahasan rencana pembangunan daerah fokus pada perbaikan infrastruktur jalan desa dan peningkatan saluran irigasi pertanian.",
        konten: "Kecamatan Tanete Riaja resmi menggelar Musyawarah Perencana Pembangunan (Musrenbang) untuk Rencana Kerja Pemerintah Daerah (RKPD) tahun 2026. Acara ini dihadiri oleh Camat Tanete Riaja, seluruh Kepala Desa dan Lurah, tokoh masyarakat, serta perwakilan dari dinas terkait di lingkungan Pemerintah Kabupaten Barru.\n\nFokus utama dari perencanaan tahun ini adalah peningkatan ketahanan pangan melalui swasembada hasil pertanian serta perbaikan akses infrastruktur desa yang memadai.",
        gambar: "https://images.unsplash.com/photo-1541888946425-d0ebb18086f6?q=80&w=1000&auto=format&fit=crop",
        kategori: "Pemerintahan",
        tanggal: "28 Juli 2026",
        penulis: "Admin Kecamatan"
      },
      {
        judul: "Panen Raya Padi di Desa Kading, Hasil Pertanian Meningkat 20%",
        slug: "panen-raya-padi-desa-kading",
        ringkasan: "Dukungan pupuk subsidi dan kondisi cuaca yang kondusif membuat hasil panen gabah kering panen musim ini mengalami peningkatan signifikan.",
        konten: "Masyarakat petani di Desa Kading, Kecamatan Tanete Riaja, menyambut gembira hasil panen raya padi musim ini. Dibandingkan periode sebelumnya, tercatat ada kenaikan produksi hingga 20% per hektar lahan sawah.\n\nPeningkatannya tidak lepas dari pendampingan penyuluh pertanian lapangan (PPL) dan penyaluran pupuk bersubsidi yang tepat waktu oleh pemerintah daerah.",
        gambar: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
        kategori: "Pertanian",
        tanggal: "25 Juli 2026",
        penulis: "Admin Kecamatan"
      }
    ];

    await Berita.create(beritaData);
    console.log('✅ Berhasil: 2 Data Berita Asli telah dimasukkan ke MongoDB!');
    process.exit();
  } catch (error) {
    console.error(`❌ Gagal: ${error.message}`);
    process.exit(1);
  }
};

importBerita();