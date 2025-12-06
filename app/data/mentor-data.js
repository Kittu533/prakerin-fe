// Mock data untuk mentor dashboard
export const mentorStats = {
  totalSiswa: 45,
  absensiVerified: 38,
  pendingVerification: 12,
  logbookVerified: 42,
  pendingAbsensi: 7,
  pendingLogbook: 5,
  pendingPenilaian: 8
}

export const recentActivities = [
  {
    id: 1,
    type: 'absensi',
    title: 'Absensi Diverifikasi',
    description: 'Ahmad Wijaya - PT. Maju Bersama',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 2,
    type: 'logbook',
    title: 'Logbook Baru',
    description: 'Siti Nurhaliza - CV. Digital Solution',
    timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    id: 3,
    type: 'penilaian',
    title: 'Penilaian Selesai',
    description: 'Budi Santoso - PT. Tech Nusantara',
    timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
  },
  {
    id: 4,
    type: 'absensi',
    title: 'Absensi Tertunda',
    description: 'Rina Permata - PT. Kreasi Digital',
    timestamp: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
  }
]

export const attentionNeeded = [
  {
    id: 1,
    nama: 'Ahmad Wijaya',
    perusahaan: 'PT. Maju Bersama',
    status: 'Absen 3 Hari',
    lastActivity: '3 hari yang lalu'
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    perusahaan: 'CV. Digital Solution',
    status: 'Logbook Kosong',
    lastActivity: '1 minggu yang lalu'
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    perusahaan: 'PT. Tech Nusantara',
    status: 'Nilai Rendah',
    lastActivity: '2 hari yang lalu'
  }
]

export const siswaList = [
  {
    id: 1,
    nama: 'Ahmad Wijaya',
    nis: '2021001',
    kelas: 'XII RPL 1',
    perusahaan: 'PT. Maju Bersama',
    alamatPerusahaan: 'Jl. Sudirman No. 123',
    tanggalMulai: new Date('2024-01-15'),
    durasi: '3 bulan',
    status: 'aktif',
    progress: 75,
    mentorLapangan: 'Budi Santoso',
    nilaiAkhir: 87,
    totalPenilaian: 8
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    nis: '2021002',
    kelas: 'XII RPL 2',
    perusahaan: 'CV. Digital Solution',
    alamatPerusahaan: 'Jl. Gatot Subroto No. 45',
    tanggalMulai: new Date('2024-01-20'),
    durasi: '3 bulan',
    status: 'bermasalah',
    progress: 45,
    mentorLapangan: 'Andi Wijaya',
    nilaiAkhir: 91,
    totalPenilaian: 10
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    nis: '2021003',
    kelas: 'XII RPL 1',
    perusahaan: 'PT. Tech Nusantara',
    alamatPerusahaan: 'Jl. Imam Bonjol No. 67',
    tanggalMulai: new Date('2024-01-10'),
    durasi: '3 bulan',
    status: 'aktif',
    progress: 80,
    mentorLapangan: 'Sari Dewi',
    nilaiAkhir: 80,
    totalPenilaian: 7
  },
  {
    id: 4,
    nama: 'Rina Permata',
    nis: '2021004',
    kelas: 'XII RPL 2',
    perusahaan: 'PT. Kreasi Digital',
    alamatPerusahaan: 'Jl. Ahmad Yani No. 89',
    tanggalMulai: new Date('2024-02-01'),
    durasi: '3 bulan',
    status: 'aktif',
    progress: 60,
    mentorLapangan: 'Dedi Kusuma',
    nilaiAkhir: 68,
    totalPenilaian: 5
  },
  {
    id: 5,
    nama: 'Dimas Pratama',
    nis: '2021005',
    kelas: 'XII RPL 3',
    perusahaan: 'CV. Solusi Prima',
    alamatPerusahaan: 'Jl. Diponegoro No. 12',
    tanggalMulai: new Date('2024-01-25'),
    durasi: '3 bulan',
    status: 'selesai',
    progress: 100,
    mentorLapangan: 'Lina Sari',
    nilaiAkhir: 95,
    totalPenilaian: 12
  }
]

export const absensiData = [
  {
    id: 1,
    siswa: {
      nama: 'Ahmad Wijaya',
      kelas: 'XII RPL 1'
    },
    perusahaan: 'PT. Maju Bersama',
    tanggal: new Date('2024-11-29'),
    jamMasuk: '08:15',
    jamPulang: null,
    lokasi: 'PT. Maju Bersama, Surakarta',
    koordinat: '-7.5556, 110.8312',
    status: 'pending',
    keterangan: 'Masuk kerja hari ini'
  },
  {
    id: 2,
    siswa: {
      nama: 'Siti Nurhaliza',
      kelas: 'XII RPL 2'
    },
    perusahaan: 'CV. Digital Solution',
    tanggal: new Date('2024-11-29'),
    jamMasuk: '08:00',
    jamPulang: '17:00',
    lokasi: 'CV. Digital Solution, Solo',
    koordinat: '-7.5556, 110.8312',
    status: 'approved',
    keterangan: 'Kerja full day'
  },
  {
    id: 3,
    siswa: {
      nama: 'Budi Santoso',
      kelas: 'XII RPL 1'
    },
    perusahaan: 'PT. Tech Nusantara',
    tanggal: new Date('2024-11-28'),
    jamMasuk: '08:30',
    jamPulang: '16:30',
    lokasi: 'PT. Tech Nusantara, Yogyakarta',
    koordinat: '-7.7956, 110.3695',
    status: 'pending',
    keterangan: 'Terlambat 30 menit'
  }
]

export const logbookData = [
  {
    id: 1,
    siswa: {
      nama: 'Ahmad Wijaya',
      kelas: 'XII RPL 1'
    },
    judul: 'Pengembangan Fitur Login Sistem',
    deskripsi: 'Hari ini saya mengerjakan pengembangan fitur login untuk sistem manajemen. Tugas yang diberikan adalah membuat halaman login dengan validasi form dan integrasi dengan backend API.',
    pembelajaran: 'Saya belajar tentang validasi form menggunakan JavaScript, penggunaan fetch API untuk komunikasi dengan backend, dan penanganan error response.',
    kendala: 'Sempat mengalami kesulitan dalam handling error response dari API, namun sudah teratasi dengan bantuan mentor.',
    periode: 'Minggu ke-1',
    tanggalMulai: new Date('2024-11-25'),
    tanggalSelesai: new Date('2024-11-29'),
    tanggalSubmit: new Date('2024-11-29'),
    status: 'pending',
    feedback: null,
    rating: null
  },
  {
    id: 2,
    siswa: {
      nama: 'Siti Nurhaliza',
      kelas: 'XII RPL 2'
    },
    judul: 'Testing dan Debugging Aplikasi Web',
    deskripsi: 'Melakukan testing pada fitur yang telah dikembangkan minggu lalu. Testing mencakup unit testing, integration testing, dan user acceptance testing.',
    pembelajaran: 'Belajar tentang berbagai jenis testing, penggunaan tools testing seperti Jest, dan best practices dalam debugging.',
    kendala: null,
    periode: 'Minggu ke-2',
    tanggalMulai: new Date('2024-11-18'),
    tanggalSelesai: new Date('2024-11-22'),
    tanggalSubmit: new Date('2024-11-22'),
    status: 'approved',
    feedback: 'Excellent work! Keep up the good performance.',
    rating: 9
  }
]