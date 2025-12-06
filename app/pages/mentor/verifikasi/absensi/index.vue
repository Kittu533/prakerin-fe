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
            label: 'Verifikasi Absensi',
            icon: 'i-heroicons-calendar-days'
          }
        ]" />

        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-slate-900">Verifikasi Absensi</h1>
          <p class="text-slate-600 mt-1">Verifikasi dan monitor absensi siswa PKL</p>
        </div>

      <!-- Filter and Search -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
            <input
              v-model="filterDate"
              type="date"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
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
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Pending</p>
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
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-x-circle" class="w-6 h-6 text-red-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Rejected</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.rejected }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-calendar-days" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-slate-600">Hari Ini</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.today }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Daftar Absensi</h2>
          <div class="flex gap-2">
            <button
              @click="bulkApprove"
              :disabled="selectedItems.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Approve Selected ({{ selectedItems.length }})
            </button>
            <button
              @click="bulkReject"
              :disabled="selectedItems.length === 0"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Reject Selected ({{ selectedItems.length }})
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="rounded border-slate-300"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Siswa</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Perusahaan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jam</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lokasi</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="absensi in filteredAbsensi" :key="absensi.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :value="absensi.id"
                    v-model="selectedItems"
                    class="rounded border-slate-300"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img 
                      :src="`https://ui-avatars.com/api/?name=${absensi.siswa.nama}&background=0ea5e9&color=fff`" 
                      :alt="absensi.siswa.nama"
                      class="w-10 h-10 rounded-full"
                    />
                    <div class="ml-4">
                      <div class="text-sm font-medium text-slate-900">{{ absensi.siswa.nama }}</div>
                      <div class="text-sm text-slate-500">{{ absensi.siswa.kelas }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ absensi.perusahaan }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ formatDate(absensi.tanggal) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">
                    <div>Masuk: {{ absensi.jamMasuk || '-' }}</div>
                    <div>Pulang: {{ absensi.jamPulang || '-' }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-slate-900">{{ absensi.lokasi }}</div>
                  <button
                    v-if="absensi.koordinat"
                    @click="openMap(absensi.koordinat)"
                    class="text-xs text-blue-600 hover:text-blue-900"
                  >
                    Lihat Peta
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusColor(absensi.status)"
                  >
                    {{ absensi.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex space-x-2">
                    <button
                      v-if="absensi.status === 'pending'"
                      @click="approveAbsensi(absensi.id)"
                      class="text-green-600 hover:text-green-900"
                    >
                      Approve
                    </button>
                    <button
                      v-if="absensi.status === 'pending'"
                      @click="rejectAbsensi(absensi.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                    <button
                      @click="viewDetail(absensi.id)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Detail
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
              {{ Math.min(currentPage * itemsPerPage, filteredAbsensi.length) }} dari {{ filteredAbsensi.length }} data
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
                :disabled="currentPage * itemsPerPage >= filteredAbsensi.length"
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
const filterStatus = ref('')
const filterDate = ref('')
const filterPerusahaan = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedItems = ref([])

// Mock data
const stats = ref({
  pending: 12,
  approved: 145,
  rejected: 3,
  today: 28
})

const absensiData = ref([
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
])

// Computed
const perusahaanList = computed(() => {
  return [...new Set(absensiData.value.map(a => a.perusahaan))]
})

const filteredAbsensi = computed(() => {
  let filtered = absensiData.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(absensi => 
      absensi.siswa.nama.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    filtered = filtered.filter(absensi => absensi.status === filterStatus.value)
  }

  if (filterDate.value) {
    const filterDateObj = new Date(filterDate.value)
    filtered = filtered.filter(absensi => 
      absensi.tanggal.toDateString() === filterDateObj.toDateString()
    )
  }

  if (filterPerusahaan.value) {
    filtered = filtered.filter(absensi => absensi.perusahaan === filterPerusahaan.value)
  }

  return filtered
})

const isAllSelected = computed(() => {
  return filteredAbsensi.value.length > 0 && 
         selectedItems.value.length === filteredAbsensi.value.length
})

// Methods
const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterDate.value = ''
  filterPerusahaan.value = ''
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = filteredAbsensi.value.map(item => item.id)
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-800'
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const approveAbsensi = (id: number) => {
  const absensi = absensiData.value.find(a => a.id === id)
  if (absensi) {
    absensi.status = 'approved'
  }
}

const rejectAbsensi = (id: number) => {
  const absensi = absensiData.value.find(a => a.id === id)
  if (absensi) {
    absensi.status = 'rejected'
  }
}

const bulkApprove = () => {
  selectedItems.value.forEach(id => {
    const absensi = absensiData.value.find(a => a.id === id)
    if (absensi && absensi.status === 'pending') {
      absensi.status = 'approved'
    }
  })
  selectedItems.value = []
}

const bulkReject = () => {
  selectedItems.value.forEach(id => {
    const absensi = absensiData.value.find(a => a.id === id)
    if (absensi && absensi.status === 'pending') {
      absensi.status = 'rejected'
    }
  })
  selectedItems.value = []
}

const openMap = (koordinat: string) => {
  const [lat, lng] = koordinat.split(', ')
  window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
}

const viewDetail = (id: number) => {
  // Navigate to detail page or open modal
  console.log('View detail absensi:', id)
}

definePageMeta({
  layout: false
})
</script>