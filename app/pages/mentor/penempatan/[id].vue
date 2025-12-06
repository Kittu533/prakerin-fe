<template>
  <NuxtLayout name="mentor">
    <div class="p-6">
      <!-- Header with Back Button -->
      <div class="mb-6">
        <div class="flex items-center gap-4 mb-4">
          <button
            @click="$router.back()"
            class="flex items-center text-slate-600 hover:text-slate-900"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
            Kembali
          </button>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Detail Penempatan Siswa</h1>
        <p class="text-slate-600 mt-1">Informasi lengkap penempatan PKL</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Student Info Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-4">Informasi Siswa</h2>
            <div class="flex items-start space-x-4">
              <img 
                :src="`https://ui-avatars.com/api/?name=${siswa.nama}&background=0ea5e9&color=fff`" 
                :alt="siswa.nama"
                class="w-16 h-16 rounded-full"
              />
              <div class="flex-1">
                <h3 class="text-xl font-semibold text-slate-900">{{ siswa.nama }}</h3>
                <p class="text-slate-600">{{ siswa.kelas }}</p>
                <div class="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-slate-500">NIS</p>
                    <p class="font-medium">{{ siswa.nis }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500">No. HP</p>
                    <p class="font-medium">{{ siswa.noHp }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500">Email</p>
                    <p class="font-medium">{{ siswa.email }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-500">Alamat</p>
                    <p class="font-medium">{{ siswa.alamat }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Company Info Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-4">Informasi Perusahaan</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-slate-500">Nama Perusahaan</p>
                <p class="font-medium">{{ siswa.perusahaan.nama }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Bidang Usaha</p>
                <p class="font-medium">{{ siswa.perusahaan.bidangUsaha }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Alamat</p>
                <p class="font-medium">{{ siswa.perusahaan.alamat }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Telepon</p>
                <p class="font-medium">{{ siswa.perusahaan.telepon }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Mentor Lapangan</p>
                <p class="font-medium">{{ siswa.perusahaan.mentorLapangan }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Jabatan Mentor</p>
                <p class="font-medium">{{ siswa.perusahaan.jabatanMentor }}</p>
              </div>
            </div>
          </div>

          <!-- Progress Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-4">Progress PKL</h2>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-sm text-slate-600">Progress Keseluruhan</span>
                  <span class="text-sm font-medium">{{ siswa.progress }}%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all"
                    :class="getProgressColor(siswa.progress)"
                    :style="`width: ${siswa.progress}%`"
                  ></div>
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">{{ siswa.stats.hariMasuk }}</div>
                  <div class="text-sm text-blue-600">Hari Masuk</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">{{ siswa.stats.logbookSubmitted }}</div>
                  <div class="text-sm text-green-600">Logbook Submitted</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                  <div class="text-2xl font-bold text-purple-600">{{ siswa.stats.nilaiRataRata }}</div>
                  <div class="text-sm text-purple-600">Nilai Rata-rata</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activities -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-4">Aktivitas Terbaru</h2>
            <div class="space-y-4">
              <div v-for="activity in siswa.recentActivities" :key="activity.id" class="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0">
                <div class="flex-shrink-0">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getActivityColor(activity.type)"
                  >
                    <UIcon :name="getActivityIcon(activity.type)" class="w-4 h-4" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-900">{{ activity.title }}</p>
                  <p class="text-sm text-slate-600">{{ activity.description }}</p>
                  <p class="text-xs text-slate-500 mt-1">{{ formatDate(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Status PKL</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Status</span>
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusColor(siswa.status)"
                >
                  {{ siswa.status }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Tanggal Mulai</span>
                <span class="text-sm font-medium">{{ formatDate(siswa.tanggalMulai) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Tanggal Selesai</span>
                <span class="text-sm font-medium">{{ formatDate(siswa.tanggalSelesai) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Durasi</span>
                <span class="text-sm font-medium">{{ siswa.durasi }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button
                @click="viewAbsensi"
                class="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <UIcon name="i-heroicons-calendar-days" class="w-4 h-4 mr-2" />
                Lihat Absensi
              </button>
              <button
                @click="viewLogbook"
                class="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <UIcon name="i-heroicons-document-text" class="w-4 h-4 mr-2" />
                Lihat Logbook
              </button>
              <button
                @click="contactSiswa"
                class="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <UIcon name="i-heroicons-phone" class="w-4 h-4 mr-2" />
                Hubungi Siswa
              </button>
              <button
                @click="contactPerusahaan"
                class="w-full flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                <UIcon name="i-heroicons-building-office" class="w-4 h-4 mr-2" />
                Hubungi Perusahaan
              </button>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Kontak Darurat</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-slate-500">Orang Tua/Wali</p>
                <p class="font-medium">{{ siswa.kontakDarurat.nama }}</p>
                <p class="text-sm text-slate-600">{{ siswa.kontakDarurat.telepon }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Hubungan</p>
                <p class="font-medium">{{ siswa.kontakDarurat.hubungan }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const siswaId = route.params.id

// Mock data - in real app, fetch from API
const siswa = ref({
  id: 1,
  nama: 'Ahmad Wijaya',
  nis: '2021001',
  kelas: 'XII RPL 1',
  noHp: '081234567890',
  email: 'ahmad.wijaya@student.edu',
  alamat: 'Jl. Kenanga No. 15, Wonogiri',
  perusahaan: {
    nama: 'PT. Maju Bersama',
    bidangUsaha: 'Software Development',
    alamat: 'Jl. Sudirman No. 123, Surakarta',
    telepon: '(0271) 123456',
    mentorLapangan: 'Budi Santoso',
    jabatanMentor: 'Senior Developer'
  },
  status: 'aktif',
  progress: 75,
  tanggalMulai: new Date('2024-01-15'),
  tanggalSelesai: new Date('2024-04-15'),
  durasi: '3 bulan',
  stats: {
    hariMasuk: 45,
    logbookSubmitted: 42,
    nilaiRataRata: 85
  },
  kontakDarurat: {
    nama: 'Siti Aminah',
    telepon: '081234567891',
    hubungan: 'Ibu Kandung'
  },
  recentActivities: [
    {
      id: 1,
      type: 'absensi',
      title: 'Absensi Masuk',
      description: 'Masuk pada 08:00 WIB',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
      id: 2,
      type: 'logbook',
      title: 'Logbook Submitted',
      description: 'Mengerjakan fitur login sistem',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
    },
    {
      id: 3,
      type: 'penilaian',
      title: 'Penilaian Mingguan',
      description: 'Nilai: 88/100',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    }
  ]
})

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'aktif': return 'bg-green-100 text-green-800'
    case 'bermasalah': return 'bg-red-100 text-red-800'
    case 'selesai': return 'bg-blue-100 text-blue-800'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'absensi': return 'bg-blue-100 text-blue-600'
    case 'logbook': return 'bg-green-100 text-green-600'
    case 'penilaian': return 'bg-purple-100 text-purple-600'
    default: return 'bg-slate-100 text-slate-600'
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'absensi': return 'i-heroicons-calendar-days'
    case 'logbook': return 'i-heroicons-document-text'
    case 'penilaian': return 'i-heroicons-star'
    default: return 'i-heroicons-information-circle'
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Action methods
const viewAbsensi = () => {
  navigateTo(`/mentor/verifikasi/absensi?siswa=${siswaId}`)
}

const viewLogbook = () => {
  navigateTo(`/mentor/verifikasi/logbook?siswa=${siswaId}`)
}

const contactSiswa = () => {
  window.open(`tel:${siswa.value.noHp}`)
}

const contactPerusahaan = () => {
  window.open(`tel:${siswa.value.perusahaan.telepon}`)
}

definePageMeta({
  layout: false
})
</script>