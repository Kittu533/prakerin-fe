<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton v-if="selectedSiswa" variant="ghost" color="neutral" size="sm" @click="backToList">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </UButton>
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
          {{ selectedSiswa ? `Absensi ${selectedSiswa.nama}` : 'Validasi Absensi' }}
        </h1>
        <p class="text-sm text-slate-500">{{ selectedSiswa ? `${selectedSiswa.kelas} • ${selectedSiswa.industri}` :
          'Pilih siswa' }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
          <USkeleton class="h-4 w-20 mb-2" />
          <USkeleton class="h-6 w-12" />
        </div>
      </template>
      <template v-else>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span class="text-sm">Pending</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Disetujui</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.approved }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:x-circle" class="w-4 h-4" />
            <span class="text-sm">Ditolak</span>
          </div>
          <p class="text-xl font-bold text-red-600">{{ stats.rejected }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:calendar" class="w-4 h-4" />
            <span class="text-sm">Total</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
      </template>
    </div>

    <!-- Student List View -->
    <template v-if="!selectedSiswa">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <UInput v-model="searchSiswa" placeholder="Cari nama siswa..." class="w-full">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
      </div>

      <div class="bg-white rounded-xl border border-slate-200">
        <div class="px-5 py-4 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900">Siswa Bimbingan</h2>
          <p class="text-xs text-slate-500">Klik untuk melihat riwayat absensi siswa</p>
        </div>

        <div v-if="loading" class="divide-y divide-slate-100">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-5 py-4">
            <USkeleton class="w-12 h-12 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-32" />
            </div>
            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="siswa in filteredSiswa" :key="siswa.id"
            class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
            @click="selectSiswa(siswa)">
            <div
              class="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold shrink-0">
              {{ siswa.inisial }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900">{{ siswa.nama }}</p>
              <p class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.industri }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="siswa.pending > 0" class="flex items-center gap-1">
                <span class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                <span class="text-sm font-medium text-amber-600">{{ siswa.pending }} pending</span>
              </div>
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-slate-900">{{ siswa.kehadiran }}%</p>
                <p class="text-xs text-slate-500">Kehadiran</p>
              </div>
              <Icon name="lucide:chevron-right" class="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div v-if="!filteredSiswa.length" class="py-12 text-center">
            <Icon name="lucide:users" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada siswa</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Absensi List View -->
    <template v-else>
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <UInput v-model="filterDate" type="date" class="flex-1 sm:flex-none sm:w-44" />
          <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status"
            class="w-full sm:w-40" />
          <USelectMenu v-model="itemsPerPage" :options="perPageOptions" class="w-full sm:w-28" />
        </div>
      </div>

      <!-- Data Table (Desktop) -->
      <div class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div v-if="loadingAbsensi" class="p-4 space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Check In</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Check Out</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durasi</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in paginatedAbsensi" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-600">{{ startIndex + index + 1 }}</td>
                <td class="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">{{ item.tanggal }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ item.checkIn }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ item.checkOut || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ item.durasi }}</td>
                <td class="px-4 py-3">
                  <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
                </td>
                <td class="px-4 py-3">
                  <div v-if="item.status === 'Pending'" class="flex justify-center gap-1">
                    <UButton size="xs" color="success" variant="soft" @click="approve(item.id)">
                      <Icon name="lucide:check" class="w-4 h-4" />
                    </UButton>
                    <UButton size="xs" color="error" variant="soft" @click="reject(item.id)">
                      <Icon name="lucide:x" class="w-4 h-4" />
                    </UButton>
                  </div>
                  <span v-else class="text-xs text-slate-400 flex justify-center">-</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!paginatedAbsensi.length" class="py-12 text-center">
            <Icon name="lucide:calendar-x" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada data absensi</p>
          </div>
        </div>
      </div>

      <!-- Card List (Mobile) -->
      <div class="lg:hidden space-y-3">
        <template v-if="loadingAbsensi">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
            <USkeleton class="h-4 w-3/4 mb-2" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </template>
        <template v-else>
          <div v-for="item in paginatedAbsensi" :key="item.id" class="bg-white rounded-xl border border-slate-200 p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg" :class="getStatusBg(item.status)">
                  <Icon name="lucide:calendar-check" class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-medium text-slate-900 text-sm">{{ item.tanggal }}</p>
                  <p class="text-xs text-slate-500">{{ item.durasi }}</p>
                </div>
              </div>
              <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex gap-4 text-sm">
                <div>
                  <p class="text-xs text-slate-500">Check In</p>
                  <p class="font-medium text-slate-900">{{ item.checkIn }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Check Out</p>
                  <p class="font-medium text-slate-900">{{ item.checkOut || '-' }}</p>
                </div>
              </div>
              <div v-if="item.status === 'Pending'" class="flex gap-2">
                <UButton size="sm" color="success" variant="soft" @click="approve(item.id)">
                  <Icon name="lucide:check" class="w-4 h-4" />
                </UButton>
                <UButton size="sm" color="error" variant="soft" @click="reject(item.id)">
                  <Icon name="lucide:x" class="w-4 h-4" />
                </UButton>
              </div>
            </div>
          </div>

          <div v-if="!paginatedAbsensi.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
            <Icon name="lucide:calendar-x" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada data absensi</p>
          </div>
        </template>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1"
        class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p class="text-sm text-slate-500">
          Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ totalItems }} data
        </p>
        <UPagination v-model:page="currentPage" :total="totalItems" :items-per-page="itemsPerPage" size="sm" />
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const toast = useToast()
const loading = ref(true)
const loadingAbsensi = ref(false)
const searchSiswa = ref('')
const filterStatus = ref(null)
const filterDate = ref('')
const selectedSiswa = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const statusOptions = ['Pending', 'Disetujui', 'Ditolak']
const perPageOptions = [5, 10, 25, 50]
const stats = reactive({ pending: 0, approved: 0, rejected: 0, total: 0 })

// Data
const siswaList = ref([])
const absensiData = ref([])

const filteredSiswa = computed(() => {
  if (!searchSiswa.value) return siswaList.value
  return siswaList.value.filter(s =>
    s.nama.toLowerCase().includes(searchSiswa.value.toLowerCase())
  )
})

const filteredAbsensi = computed(() => {
  return absensiData.value.filter(item => {
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchStatus
  })
})

// Pagination computed
const totalItems = computed(() => filteredAbsensi.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedAbsensi = computed(() => filteredAbsensi.value.slice(startIndex.value, endIndex.value))

// Reset page when filter changes
watch([filterStatus, itemsPerPage], () => { currentPage.value = 1 })

const selectSiswa = async (siswa) => {
  selectedSiswa.value = siswa
  loadingAbsensi.value = true
  currentPage.value = 1

  // Simulate loading
  await new Promise(r => setTimeout(r, 400))

  // Generate 30 absensi entries
  const statuses = ['Pending', 'Disetujui', 'Ditolak']

  absensiData.value = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const checkInHour = 7 + Math.floor(Math.random() * 2)
    const checkInMin = Math.floor(Math.random() * 60)
    const checkOutHour = 15 + Math.floor(Math.random() * 3)
    const checkOutMin = Math.floor(Math.random() * 60)
    const durasi = checkOutHour - checkInHour

    return {
      id: i + 1,
      tanggal: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      checkIn: `${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}`,
      checkOut: i % 5 === 0 ? null : `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}`,
      durasi: i % 5 === 0 ? '-' : `${durasi} jam`,
      status: i < 3 ? 'Pending' : statuses[Math.floor(Math.random() * 3)]
    }
  })

  loadingAbsensi.value = false
}

const backToList = () => {
  selectedSiswa.value = null
  absensiData.value = []
  filterStatus.value = null
  filterDate.value = ''
  currentPage.value = 1
}

const getStatusColor = (status) => {
  const colors = { Pending: 'warning', Disetujui: 'success', Ditolak: 'error' }
  return colors[status] || 'neutral'
}

const getStatusBg = (status) => {
  const bgs = {
    Pending: 'bg-amber-100 text-amber-600',
    Disetujui: 'bg-green-100 text-green-600',
    Ditolak: 'bg-red-100 text-red-600'
  }
  return bgs[status] || 'bg-slate-100 text-slate-600'
}

const approve = (id) => {
  const item = absensiData.value.find(d => d.id === id)
  if (item) {
    item.status = 'Disetujui'
    stats.pending--
    stats.approved++

    if (selectedSiswa.value) {
      selectedSiswa.value.pending = Math.max(0, selectedSiswa.value.pending - 1)
    }

    toast.add({ title: 'Absensi disetujui', color: 'success' })
  }
}

const reject = (id) => {
  const item = absensiData.value.find(d => d.id === id)
  if (item) {
    item.status = 'Ditolak'
    stats.pending--
    stats.rejected++

    if (selectedSiswa.value) {
      selectedSiswa.value.pending = Math.max(0, selectedSiswa.value.pending - 1)
    }

    toast.add({ title: 'Absensi ditolak', color: 'error' })
  }
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { pending: 8, approved: 156, rejected: 5, total: 169 })

  siswaList.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', kelas: 'XII RPL 1', industri: 'PT. Telkom Indonesia', pending: 3, kehadiran: 95 },
    { id: 2, nama: 'Dewi Sartika', inisial: 'DS', kelas: 'XII RPL 2', industri: 'PT. Gojek Indonesia', pending: 2, kehadiran: 88 },
    { id: 3, nama: 'Ahmad Fauzi', inisial: 'AF', kelas: 'XII TKJ 1', industri: 'CV. Digital Nusantara', pending: 3, kehadiran: 72 },
    { id: 4, nama: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII MM 1', industri: 'PT. Media Kreasi', pending: 0, kehadiran: 100 },
    { id: 5, nama: 'Budi Prasetyo', inisial: 'BP', kelas: 'XII RPL 1', industri: 'PT. Tokopedia', pending: 0, kehadiran: 90 }
  ]

  loading.value = false
})

useHead({ title: 'Validasi Absensi | Guru PKL' })
</script>
