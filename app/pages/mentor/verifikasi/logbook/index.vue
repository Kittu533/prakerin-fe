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
            label: 'Verifikasi',
            icon: 'i-heroicons-shield-check'
          },
          {
            label: 'Verifikasi Logbook',
            icon: 'i-heroicons-document-text'
          }
        ]" />

        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-900">Verifikasi Logbook</h1>
          <p class="text-slate-600 mt-1">Review dan verifikasi logbook harian siswa PKL</p>
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
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              v-model="filterStatus"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="revision">Need Revision</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Periode</label>
            <select
              v-model="filterPeriode"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua Periode</option>
              <option value="minggu-1">Minggu ke-1</option>
              <option value="minggu-2">Minggu ke-2</option>
              <option value="minggu-3">Minggu ke-3</option>
              <option value="minggu-4">Minggu ke-4</option>
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
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Pending Review</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Approved</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.approved }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Need Revision</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.revision }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Total Logbook</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-900">Daftar Logbook</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Siswa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Judul</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Periode</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="logbook in filteredLogbook" :key="logbook.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      :src="`https://ui-avatars.com/api/?name=${logbook.siswa.nama}&background=0ea5e9&color=fff`" 
                      :alt="logbook.siswa.nama"
                      class="w-10 h-10 rounded-full"
                    />
                    <div class="ml-4">
                      <div class="text-sm font-medium text-slate-900">{{ logbook.siswa.nama }}</div>
                      <div class="text-sm text-slate-500">{{ logbook.siswa.kelas }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-900 font-medium">{{ logbook.judul }}</div>
                  <div class="text-sm text-slate-500 truncate max-w-xs">{{ logbook.deskripsi }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ logbook.periode }}</div>
                  <div class="text-sm text-slate-500">{{ formatDateRange(logbook.tanggalMulai, logbook.tanggalSelesai) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ formatDate(logbook.tanggalSubmit) }}</div>
                  <div class="text-sm text-slate-500">{{ getTimeAgo(logbook.tanggalSubmit) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusColor(logbook.status)"
                  >
                    {{ getStatusText(logbook.status) }}
                  </span>
                  <div v-if="logbook.feedback" class="text-xs text-slate-500 mt-1">
                    {{ logbook.feedback.substring(0, 50) }}...
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-2">
                    <button
                      @click="reviewLogbook(logbook)"
                      class="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Review
                    </button>
                    <button
                      @click="downloadLogbook(logbook.id)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Download
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
              {{ Math.min(currentPage * itemsPerPage, filteredLogbook.length) }} dari {{ filteredLogbook.length }} data
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
                :disabled="currentPage * itemsPerPage >= filteredLogbook.length"
                class="px-3 py-1 rounded-md text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 z-50 overflow-y-auto" @click="showReviewModal = false">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-slate-500 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6" @click.stop>
          <div class="mb-4">
            <h3 class="text-lg font-medium text-slate-900">Review Logbook</h3>
            <p class="text-sm text-slate-600">{{ selectedLogbook?.siswa.nama }} - {{ selectedLogbook?.judul }}</p>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Logbook Content -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Periode</label>
                <p class="text-sm text-slate-900">{{ selectedLogbook?.periode }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Deskripsi Kegiatan</label>
                <div class="p-3 bg-slate-50 rounded-md">
                  <p class="text-sm text-slate-900">{{ selectedLogbook?.deskripsi }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Pembelajaran</label>
                <div class="p-3 bg-slate-50 rounded-md">
                  <p class="text-sm text-slate-900">{{ selectedLogbook?.pembelajaran }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Kendala</label>
                <div class="p-3 bg-slate-50 rounded-md">
                  <p class="text-sm text-slate-900">{{ selectedLogbook?.kendala || 'Tidak ada kendala' }}</p>
                </div>
              </div>
            </div>
            
            <!-- Review Form -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Status Review</label>
                <select
                  v-model="reviewData.status"
                  class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="approved">Approved</option>
                  <option value="revision">Need Revision</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Rating (1-10)</label>
                <input
                  v-model="reviewData.rating"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Feedback</label>
                <textarea
                  v-model="reviewData.feedback"
                  rows="6"
                  placeholder="Berikan feedback untuk siswa..."
                  class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div class="flex space-x-3">
                <button
                  @click="submitReview"
                  class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Submit Review
                </button>
                <button
                  @click="showReviewModal = false"
                  class="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
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
const filterStatus = ref('')
const filterPeriode = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showReviewModal = ref(false)
const selectedLogbook = ref(null)
const reviewData = ref({
  status: 'approved',
  rating: 8,
  feedback: ''
})

// Mock data
const stats = ref({
  pending: 8,
  approved: 67,
  revision: 5,
  total: 80
})

const logbookData = ref([
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
  },
  {
    id: 3,
    siswa: {
      nama: 'Budi Santoso',
      kelas: 'XII RPL 1'
    },
    judul: 'Dokumentasi API dan User Manual',
    deskripsi: 'Membuat dokumentasi untuk API yang telah dikembangkan dan user manual untuk pengguna akhir aplikasi.',
    pembelajaran: 'Belajar cara membuat dokumentasi yang baik, penggunaan tools seperti Swagger untuk API documentation.',
    kendala: 'Perlu perbaikan dalam struktur dokumentasi dan penambahan contoh penggunaan yang lebih detail.',
    periode: 'Minggu ke-3',
    tanggalMulai: new Date('2024-11-11'),
    tanggalSelesai: new Date('2024-11-15'),
    tanggalSubmit: new Date('2024-11-15'),
    status: 'revision',
    feedback: 'Good effort, but documentation needs more detailed examples and better structure.',
    rating: 7
  }
])

// Computed
const filteredLogbook = computed(() => {
  let filtered = logbookData.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(logbook => 
      logbook.siswa.nama.toLowerCase().includes(query) ||
      logbook.judul.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    filtered = filtered.filter(logbook => logbook.status === filterStatus.value)
  }

  if (filterPeriode.value) {
    filtered = filtered.filter(logbook => logbook.periode.toLowerCase().includes(filterPeriode.value.split('-')[1]))
  }

  return filtered
})

// Methods
const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterPeriode.value = ''
  currentPage.value = 1
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'revision': return 'bg-orange-100 text-orange-800'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending Review'
    case 'approved': return 'Approved'
    case 'revision': return 'Need Revision'
    default: return status
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateRange = (start: Date, end: Date) => {
  return `${start.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}`
}

const getTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  return `${days} hari lalu`
}

const reviewLogbook = (logbook) => {
  selectedLogbook.value = logbook
  reviewData.value = {
    status: logbook.status === 'pending' ? 'approved' : logbook.status,
    rating: logbook.rating || 8,
    feedback: logbook.feedback || ''
  }
  showReviewModal.value = true
}

const submitReview = () => {
  if (selectedLogbook.value) {
    const logbook = logbookData.value.find(l => l.id === selectedLogbook.value.id)
    if (logbook) {
      logbook.status = reviewData.value.status
      logbook.rating = reviewData.value.rating
      logbook.feedback = reviewData.value.feedback
    }
  }
  showReviewModal.value = false
}

const downloadLogbook = (id: number) => {
  // Implement download functionality
  console.log('Download logbook:', id)
}

definePageMeta({
  layout: false
})
</script>