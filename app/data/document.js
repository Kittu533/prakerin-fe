export const documents = [
  {
    id: 1,
    name: 'Surat Pengajuan',
    description: 'Surat pengajuan prakerin ke perusahaan',
    status: 'Disetujui',
    statusColor: 'green',
    uploadDate: '15 Nov 2024',
    fileSize: '256 KB',
    icon: 'i-heroicons-document-text',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 2,
    name: 'Laporan Mingguan',
    description: 'Laporan kegiatan mingguan prakerin',
    status: 'Perlu Review',
    statusColor: 'amber',
    uploadDate: '20 Nov 2024',
    fileSize: '1.2 MB',
    icon: 'i-heroicons-clipboard-document-check',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  {
    id: 3,
    name: 'Laporan Akhir',
    description: 'Laporan akhir prakerin',
    status: 'Belum Upload',
    statusColor: 'red',
    uploadDate: '-',
    fileSize: '-',
    icon: 'i-heroicons-document-chart-bar',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  {
    id: 4,
    name: 'Sertifikat',
    description: 'Sertifikat kelulusan prakerin',
    status: 'Disetujui',
    statusColor: 'green',
    uploadDate: '25 Nov 2024',
    fileSize: '512 KB',
    icon: 'i-heroicons-academic-cap',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    id: 5,
    name: 'Form Nilai',
    description: 'Form penilaian dari pembimbing',
    status: 'Disetujui',
    statusColor: 'green',
    uploadDate: '22 Nov 2024',
    fileSize: '128 KB',
    icon: 'i-heroicons-clipboard-document-list',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 6,
    name: 'Dokumentasi',
    description: 'Foto kegiatan prakerin',
    status: 'Perlu Review',
    statusColor: 'amber',
    uploadDate: '24 Nov 2024',
    fileSize: '4.8 MB',
    icon: 'i-heroicons-photo',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  }
]

export const requirements = [
  {
    id: 1,
    name: 'Surat Pengajuan PKL',
    description: 'Surat pengajuan PKL yang ditandatangani oleh kepala sekolah',
    completed: true
  },
  {
    id: 2,
    name: 'Laporan Mingguan (12 laporan)',
    description: 'Laporan kegiatan mingguan selama prakerin berlangsung',
    completed: true
  },
  {
    id: 3,
    name: 'Laporan Akhir PKL',
    description: 'Laporan lengkap kegiatan prakerin dengan format yang ditentukan',
    completed: false
  },
  {
    id: 4,
    name: 'Form Penilaian',
    description: 'Form penilaian dari pembimbing lapangan yang sudah diisi dan ditandatangani',
    completed: true
  },
  {
    id: 5,
    name: 'Sertifikat PKL',
    description: 'Sertifikat kelulusan prakerin dari perusahaan',
    completed: true
  },
  {
    id: 6,
    name: 'Dokumentasi Kegiatan',
    description: 'Minimal 20 foto kegiatan selama prakerin',
    completed: true
  }
]
