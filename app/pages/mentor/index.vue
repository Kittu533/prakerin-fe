<template>
  <NuxtLayout name="mentor">
    <div class="bg-white min-h-screen">
      <div class="p-6">
        <!-- Breadcrumb -->
        <UBreadcrumb class="mb-6" :links="[
          {
            label: 'Dashboard',
            icon: 'i-heroicons-squares-2x2'
          }
        ]" />

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-slate-900">Dashboard Mentor</h1>
          <p class="text-slate-600 mt-1">Monitoring dan verifikasi kegiatan PKL siswa</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex items-center">
              <div class="shrink-0">
                <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-slate-600">Total Siswa PKL</p>
                <p class="text-2xl font-bold text-slate-900">{{ stats.totalSiswa }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex items-center">
              <div class="shrink-0">
                <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-slate-600">Absensi Terverifikasi</p>
                <p class="text-2xl font-bold text-slate-900">{{ stats.absensiVerified }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex items-center">
              <div class="shrink-0">
                <div class="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-clock" class="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-slate-600">Menunggu Verifikasi</p>
                <p class="text-2xl font-bold text-slate-900">{{ stats.pendingVerification }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div class="flex items-center">
              <div class="shrink-0">
                <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-slate-600">Logbook Verified</p>
                <p class="text-2xl font-bold text-slate-900">{{ stats.logbookVerified }}</p>
              </div>
            </div>
          </div>
        </div>      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Activities -->
        <div class="bg-white rounded-lg shadow-sm border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-900">Aktivitas Terbaru</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start space-x-3">
                <div class="shrink-0">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getActivityColor(activity.type)"
                  >
                    <UIcon :name="getActivityIcon(activity.type)" class="w-4 h-4" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900">{{ activity.title }}</p>
                  <p class="text-sm text-slate-600">{{ activity.description }}</p>
                  <p class="text-xs text-slate-500 mt-1">{{ formatDate(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Siswa Yang Perlu Perhatian -->
        <div class="bg-white rounded-lg shadow-sm border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold text-slate-900">Siswa Perlu Perhatian</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="siswa in attentionNeeded" :key="siswa.id" class="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div class="flex items-center space-x-3">
                  <img 
                    :src="`https://ui-avatars.com/api/?name=${siswa.nama}&background=0ea5e9&color=fff`" 
                    :alt="siswa.nama"
                    class="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ siswa.nama }}</p>
                    <p class="text-xs text-slate-600">{{ siswa.perusahaan }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusColor(siswa.status)"
                  >
                    {{ siswa.status }}
                  </span>
                  <p class="text-xs text-slate-500 mt-1">{{ siswa.lastActivity }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NuxtLink
            to="/mentor/verifikasi/absensi"
            class="flex items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-900">Verifikasi Absensi</p>
              <p class="text-xs text-slate-600">{{ stats.pendingAbsensi }} pending</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/mentor/verifikasi/logbook"
            class="flex items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all group"
          >
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-900">Verifikasi Logbook</p>
              <p class="text-xs text-slate-600">{{ stats.pendingLogbook }} pending</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/mentor/penilaian"
            class="flex items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all group"
          >
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <UIcon name="i-heroicons-star" class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-slate-900">Penilaian Siswa</p>
              <p class="text-xs text-slate-600">{{ stats.pendingPenilaian }} pending</p>
            </div>
          </NuxtLink>
        </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Mock data
const stats = ref({
  totalSiswa: 45,
  absensiVerified: 38,
  pendingVerification: 12,
  logbookVerified: 42,
  pendingAbsensi: 7,
  pendingLogbook: 5,
  pendingPenilaian: 8
})

const recentActivities = ref([
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
])

const attentionNeeded = ref([
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
])

// Helper functions
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

const getStatusColor = (status: string) => {
  if (status.includes('Absen')) return 'bg-red-100 text-red-800'
  if (status.includes('Kosong')) return 'bg-yellow-100 text-yellow-800'
  if (status.includes('Rendah')) return 'bg-orange-100 text-orange-800'
  return 'bg-slate-100 text-slate-800'
}

const formatDate = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 60) {
    return `${minutes} menit yang lalu`
  } else if (hours < 24) {
    return `${hours} jam yang lalu`
  } else {
    return date.toLocaleDateString('id-ID')
  }
}

definePageMeta({
  layout: false
})
</script>
