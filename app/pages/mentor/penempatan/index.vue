<template>
  <NuxtLayout name="mentor">
    <div class="bg-white min-h-screen">
      <div class="p-6">
        <!-- Breadcrumb -->
        <UBreadcrumb class="mb-6" :links="[
          {
            label: 'Dashboard',
            icon: 'i-heroicons-squares-2x2',
            to: '/mentor'
          },
          {
            label: 'Monitoring Penempatan Siswa',
            icon: 'i-heroicons-map-pin'
          }
        ]" />

        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-900">Monitoring Penempatan Siswa</h1>
          <p class="text-slate-600 mt-1">Pantau status dan lokasi penempatan PKL siswa</p>
        </div>

      <!-- Filter and Search -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Cari Siswa</label>
            <div class="relative">
              <UIcon name="i-heroicons-magnifying-glass" class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Nama siswa atau perusahaan..."
                class="pl-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Perusahaan</label>
            <select
              v-model="filterPerusahaan"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Perusahaan</option>
              <option v-for="perusahaan in perusahaanList" :key="perusahaan" :value="perusahaan">
                {{ perusahaan }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              v-model="filterStatus"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="bermasalah">Bermasalah</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="w-full px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Penempatan Aktif</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.aktif }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Bermasalah</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.bermasalah }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-building-office" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Total Perusahaan</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.totalPerusahaan }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Total Siswa</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.totalSiswa }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-900">Daftar Penempatan Siswa</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Siswa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Perusahaan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Periode</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="siswa in filteredSiswa" :key="siswa.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      :src="`https://ui-avatars.com/api/?name=${siswa.nama}&background=0ea5e9&color=fff`" 
                      :alt="siswa.nama"
                      class="w-10 h-10 rounded-full"
                    />
                    <div class="ml-4">
                      <div class="text-sm font-medium text-slate-900">{{ siswa.nama }}</div>
                      <div class="text-sm text-slate-500">{{ siswa.kelas }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ siswa.perusahaan }}</div>
                  <div class="text-sm text-slate-500">{{ siswa.alamatPerusahaan }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ formatDate(siswa.tanggalMulai) }}</div>
                  <div class="text-sm text-slate-500">{{ siswa.durasi }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusColor(siswa.status)"
                  >
                    {{ siswa.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-20 bg-slate-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all"
                        :class="getProgressColor(siswa.progress)"
                        :style="`width: ${siswa.progress}%`"
                      ></div>
                    </div>
                    <span class="ml-2 text-sm text-slate-600">{{ siswa.progress }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewDetail(siswa.id)"
                    class="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Detail
                  </button>
                  <button
                    @click="contactMentor(siswa.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Hubungi
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-slate-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-slate-700">
              Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - 
              {{ Math.min(currentPage * itemsPerPage, filteredSiswa.length) }} dari {{ filteredSiswa.length }} data
            </div>
            <div class="flex space-x-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                @click="currentPage++"
                :disabled="currentPage * itemsPerPage >= filteredSiswa.length"
                class="px-3 py-1 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Reactive data
const searchQuery = ref('')
const filterPerusahaan = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Mock data
const stats = ref({
  aktif: 35,
  bermasalah: 5,
  totalPerusahaan: 12,
  totalSiswa: 45
})

const siswaData = ref([
  {
    id: 1,
    nama: 'Ahmad Wijaya',
    kelas: 'XII RPL 1',
    perusahaan: 'PT. Maju Bersama',
    alamatPerusahaan: 'Jl. Sudirman No. 123',
    tanggalMulai: new Date('2024-01-15'),
    durasi: '3 bulan',
    status: 'aktif',
    progress: 75
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    kelas: 'XII RPL 2',
    perusahaan: 'CV. Digital Solution',
    alamatPerusahaan: 'Jl. Gatot Subroto No. 45',
    tanggalMulai: new Date('2024-01-20'),
    durasi: '3 bulan',
    status: 'bermasalah',
    progress: 45
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    kelas: 'XII RPL 1',
    perusahaan: 'PT. Tech Nusantara',
    alamatPerusahaan: 'Jl. Imam Bonjol No. 67',
    tanggalMulai: new Date('2024-01-10'),
    durasi: '3 bulan',
    status: 'aktif',
    progress: 80
  },
  {
    id: 4,
    nama: 'Rina Permata',
    kelas: 'XII RPL 2',
    perusahaan: 'PT. Kreasi Digital',
    alamatPerusahaan: 'Jl. Ahmad Yani No. 89',
    tanggalMulai: new Date('2024-02-01'),
    durasi: '3 bulan',
    status: 'aktif',
    progress: 60
  },
  {
    id: 5,
    nama: 'Dimas Pratama',
    kelas: 'XII RPL 3',
    perusahaan: 'CV. Solusi Prima',
    alamatPerusahaan: 'Jl. Diponegoro No. 12',
    tanggalMulai: new Date('2024-01-25'),
    durasi: '3 bulan',
    status: 'selesai',
    progress: 100
  }
])

// Computed
const perusahaanList = computed(() => {
  return [...new Set(siswaData.value.map(s => s.perusahaan))]
})

const filteredSiswa = computed(() => {
  let filtered = siswaData.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(siswa => 
      siswa.nama.toLowerCase().includes(query) ||
      siswa.perusahaan.toLowerCase().includes(query)
    )
  }

  if (filterPerusahaan.value) {
    filtered = filtered.filter(siswa => siswa.perusahaan === filterPerusahaan.value)
  }

  if (filterStatus.value) {
    filtered = filtered.filter(siswa => siswa.status === filterStatus.value)
  }

  return filtered
})

// Methods
const resetFilters = () => {
  searchQuery.value = ''
  filterPerusahaan.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewDetail = (id: number) => {
  navigateTo(`/mentor/penempatan/${id}`)
}

const contactMentor = (id: number) => {
  // Implement contact functionality
  console.log('Contact siswa:', id)
}

definePageMeta({
  layout: false
})
</script>