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
            label: 'Penilaian Siswa',
            icon: 'i-heroicons-star'
          }
        ]" />

        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-900">Penilaian Siswa PKL</h1>
          <p class="text-slate-600 mt-1">Kelola penilaian dan evaluasi kinerja siswa</p>
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
                placeholder="Nama siswa..."
                class="pl-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Kelas</label>
            <select
              v-model="filterKelas"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Kelas</option>
              <option value="XII RPL 1">XII RPL 1</option>
              <option value="XII RPL 2">XII RPL 2</option>
              <option value="XII RPL 3">XII RPL 3</option>
            </select>
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

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Total Siswa</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.totalSiswa }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Rata-rata Nilai</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.averageGrade }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-star" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Excellent (≥85)</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.excellentCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Perlu Perhatian</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.needAttention }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Daftar Penilaian Siswa</h2>
          <button
            @click="exportData"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <UIcon name="i-heroicons-document-arrow-down" class="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Siswa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Perusahaan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nilai Akhir</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Grade</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
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
                      <div class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.nis }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ siswa.perusahaan }}</div>
                  <div class="text-sm text-slate-500">{{ siswa.mentorLapangan }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-20 bg-slate-200 rounded-full h-2 mr-3">
                      <div 
                        class="h-2 rounded-full transition-all"
                        :class="getProgressColor(siswa.progress)"
                        :style="`width: ${siswa.progress}%`"
                      ></div>
                    </div>
                    <span class="text-sm text-slate-600">{{ siswa.progress }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900">{{ siswa.nilaiAkhir || '-' }}</div>
                  <div class="text-xs text-slate-500">
                    {{ siswa.totalPenilaian }} penilaian
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getGradeColor(siswa.nilaiAkhir)"
                  >
                    {{ getGradeText(siswa.nilaiAkhir) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusColor(siswa.status)"
                  >
                    {{ siswa.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-2">
                    <button
                      @click="viewDetail(siswa.id)"
                      class="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Detail
                    </button>
                    <button
                      @click="addPenilaian(siswa)"
                      class="text-green-600 hover:text-green-900"
                    >
                      + Nilai
                    </button>
                  </div>
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

    <!-- Add Penilaian Modal -->
    <div v-if="showPenilaianModal" class="fixed inset-0 z-50 overflow-y-auto" @click="showPenilaianModal = false">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-slate-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" @click.stop>
          <div class="mb-4">
            <h3 class="text-lg font-medium text-slate-900">Tambah Penilaian</h3>
            <p class="text-sm text-slate-600">{{ selectedSiswa?.nama }} - {{ selectedSiswa?.perusahaan }}</p>
          </div>
          
          <form @submit.prevent="submitPenilaian" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Aspek Penilaian</label>
              <select
                v-model="penilaianData.aspek"
                required
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Pilih Aspek</option>
                <option value="kedisiplinan">Kedisiplinan</option>
                <option value="kualitas_kerja">Kualitas Kerja</option>
                <option value="inisiatif">Inisiatif</option>
                <option value="kerjasama">Kerjasama</option>
                <option value="komunikasi">Komunikasi</option>
                <option value="tanggung_jawab">Tanggung Jawab</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Nilai (1-100)</label>
              <input
                v-model="penilaianData.nilai"
                type="number"
                min="1"
                max="100"
                required
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
              <textarea
                v-model="penilaianData.catatan"
                rows="3"
                placeholder="Catatan penilaian..."
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Tanggal Penilaian</label>
              <input
                v-model="penilaianData.tanggal"
                type="date"
                required
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Simpan Penilaian
              </button>
              <button
                type="button"
                @click="showPenilaianModal = false"
                class="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Reactive data
const searchQuery = ref('')
const filterKelas = ref('')
const filterPerusahaan = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showPenilaianModal = ref(false)
const selectedSiswa = ref(null)
const penilaianData = ref({
  aspek: '',
  nilai: null,
  catatan: '',
  tanggal: new Date().toISOString().split('T')[0]
})

// Mock data
const stats = ref({
  totalSiswa: 45,
  averageGrade: 82.5,
  excellentCount: 18,
  needAttention: 3
})

const siswaData = ref([
  {
    id: 1,
    nama: 'Ahmad Wijaya',
    nis: '2021001',
    kelas: 'XII RPL 1',
    perusahaan: 'PT. Maju Bersama',
    mentorLapangan: 'Budi Santoso',
    progress: 85,
    nilaiAkhir: 87,
    totalPenilaian: 8,
    status: 'Aktif'
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    nis: '2021002',
    kelas: 'XII RPL 2',
    perusahaan: 'CV. Digital Solution',
    mentorLapangan: 'Andi Wijaya',
    progress: 92,
    nilaiAkhir: 91,
    totalPenilaian: 10,
    status: 'Aktif'
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    nis: '2021003',
    kelas: 'XII RPL 1',
    perusahaan: 'PT. Tech Nusantara',
    mentorLapangan: 'Sari Dewi',
    progress: 78,
    nilaiAkhir: 80,
    totalPenilaian: 7,
    status: 'Aktif'
  },
  {
    id: 4,
    nama: 'Rina Permata',
    nis: '2021004',
    kelas: 'XII RPL 2',
    perusahaan: 'PT. Kreasi Digital',
    mentorLapangan: 'Dedi Kusuma',
    progress: 65,
    nilaiAkhir: 68,
    totalPenilaian: 5,
    status: 'Perlu Perhatian'
  },
  {
    id: 5,
    nama: 'Dimas Pratama',
    nis: '2021005',
    kelas: 'XII RPL 3',
    perusahaan: 'CV. Solusi Prima',
    mentorLapangan: 'Lina Sari',
    progress: 100,
    nilaiAkhir: 95,
    totalPenilaian: 12,
    status: 'Selesai'
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
      siswa.nis.includes(query)
    )
  }

  if (filterKelas.value) {
    filtered = filtered.filter(siswa => siswa.kelas === filterKelas.value)
  }

  if (filterPerusahaan.value) {
    filtered = filtered.filter(siswa => siswa.perusahaan === filterPerusahaan.value)
  }

  return filtered
})

// Methods
const resetFilters = () => {
  searchQuery.value = ''
  filterKelas.value = ''
  filterPerusahaan.value = ''
  currentPage.value = 1
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getGradeColor = (nilai: number) => {
  if (!nilai) return 'bg-slate-100 text-slate-800'
  if (nilai >= 85) return 'bg-green-100 text-green-800'
  if (nilai >= 75) return 'bg-blue-100 text-blue-800'
  if (nilai >= 65) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getGradeText = (nilai: number) => {
  if (!nilai) return 'Belum Dinilai'
  if (nilai >= 85) return 'Excellent'
  if (nilai >= 75) return 'Good'
  if (nilai >= 65) return 'Fair'
  return 'Poor'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Aktif': return 'bg-green-100 text-green-800'
    case 'Selesai': return 'bg-blue-100 text-blue-800'
    case 'Perlu Perhatian': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const viewDetail = (id: number) => {
  navigateTo(`/mentor/penilaian/${id}`)
}

const addPenilaian = (siswa) => {
  selectedSiswa.value = siswa
  penilaianData.value = {
    aspek: '',
    nilai: null,
    catatan: '',
    tanggal: new Date().toISOString().split('T')[0]
  }
  showPenilaianModal.value = true
}

const submitPenilaian = () => {
  // Here you would typically send the data to your API
  console.log('Submit penilaian:', {
    siswa: selectedSiswa.value.id,
    ...penilaianData.value
  })
  
  // Update the student's evaluation count
  const siswa = siswaData.value.find(s => s.id === selectedSiswa.value.id)
  if (siswa) {
    siswa.totalPenilaian++
  }
  
  showPenilaianModal.value = false
}

const exportData = () => {
  // Implement export functionality
  console.log('Export penilaian data')
}

definePageMeta({
  layout: false
})
</script>