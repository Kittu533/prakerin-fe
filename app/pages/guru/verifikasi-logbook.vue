<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton v-if="selectedSiswa" variant="ghost" color="neutral" size="sm" @click="backToList">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </UButton>
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
          {{ selectedSiswa ? `Logbook ${selectedSiswa.nama}` : 'Verifikasi Logbook' }}
        </h1>
        <p class="text-sm text-slate-500">
          {{ selectedSiswa ? `${selectedSiswa.kelas} • ${selectedSiswa.industri}` : 'Pilih siswa untuk melihat logbook'
          }}
        </p>
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
            <span class="text-sm">Revisi</span>
          </div>
          <p class="text-xl font-bold text-red-600">{{ stats.revision }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:file-text" class="w-4 h-4" />
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
          <p class="text-xs text-slate-500">Klik untuk melihat logbook siswa</p>
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

    <!-- Logbook List View -->
    <template v-else>
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <UInput v-model="search" placeholder="Cari kegiatan..." class="flex-1">
            <template #leading>
              <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
            </template>
          </UInput>
          <USelectMenu v-model="filterStatus" :options="statusOptions" placeholder="Filter Status"
            class="w-full sm:w-40" />
          <USelectMenu v-model="itemsPerPage" :options="perPageOptions" class="w-full sm:w-28" />
        </div>
      </div>

      <!-- Data Table (Desktop) -->
      <div class="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div v-if="loadingLogbook" class="p-4 space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-14 rounded-lg" />
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">No</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kegiatan</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Jam</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, index) in paginatedLogbooks" :key="item.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm text-slate-600">{{ startIndex + index + 1 }}</td>
                <td class="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">{{ item.tanggal }}</td>
                <td class="px-4 py-3">
                  <div class="max-w-[300px]">
                    <p class="text-sm font-medium text-slate-900 truncate">{{ item.kegiatan }}</p>
                    <p class="text-xs text-slate-500 truncate">{{ item.deskripsi }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{{ item.jamMulai }} - {{ item.jamSelesai
                  }}
                </td>
                <td class="px-4 py-3">
                  <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
                </td>
                <td class="px-4 py-3">
                  <div v-if="item.status === 'Pending'" class="flex justify-center gap-1">
                    <UButton size="xs" color="success" variant="soft" @click="approve(item.id)">
                      <Icon name="lucide:check" class="w-4 h-4" />
                    </UButton>
                    <UButton size="xs" color="warning" variant="soft" @click="openRevision(item)">
                      <Icon name="lucide:edit" class="w-4 h-4" />
                    </UButton>
                  </div>
                  <span v-else class="text-xs text-slate-400 flex justify-center">-</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!paginatedLogbooks.length" class="py-12 text-center">
            <Icon name="lucide:book-open" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada logbook</p>
          </div>
        </div>
      </div>

      <!-- Card List (Mobile) -->
      <div class="lg:hidden space-y-3">
        <template v-if="loadingLogbook">
          <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 p-4">
            <USkeleton class="h-4 w-3/4 mb-2" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </template>
        <template v-else>
          <div v-for="item in paginatedLogbooks" :key="item.id" class="bg-white rounded-xl border border-slate-200 p-4">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg" :class="getStatusBg(item.status)">
                  <Icon name="lucide:book-open" class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-medium text-slate-900 text-sm">{{ item.kegiatan }}</p>
                  <p class="text-xs text-slate-500">{{ item.tanggal }} • {{ item.jamMulai }} - {{ item.jamSelesai }}</p>
                </div>
              </div>
              <UBadge :color="getStatusColor(item.status)" variant="subtle" size="xs">{{ item.status }}</UBadge>
            </div>

            <p class="text-sm text-slate-600 mb-3 line-clamp-2">{{ item.deskripsi }}</p>

            <div v-if="item.status === 'Pending'" class="flex gap-2">
              <UButton size="xs" color="success" class="flex-1" @click="approve(item.id)">
                <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                Setujui
              </UButton>
              <UButton size="xs" color="warning" variant="soft" class="flex-1" @click="openRevision(item)">
                <Icon name="lucide:edit" class="w-3 h-3 mr-1" />
                Revisi
              </UButton>
            </div>
          </div>

          <div v-if="!paginatedLogbooks.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
            <Icon name="lucide:book-open" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p class="text-slate-500">Tidak ada logbook</p>
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

    <!-- Revision Modal -->
    <UModal v-model:open="revisionModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-slate-900">Minta Revisi</h3>
              <UButton variant="ghost" color="neutral" size="xs" @click="revisionModal = false">
                <Icon name="lucide:x" class="w-4 h-4" />
              </UButton>
            </div>
          </template>

          <UFormField label="Catatan Revisi" required>
            <UTextarea v-model="revisionNote" placeholder="Tulis catatan revisi..." :rows="3" class="w-full" />
          </UFormField>

          <template #footer>
            <div class="flex gap-3">
              <UButton variant="outline" color="neutral" class="flex-1" @click="revisionModal = false">Batal</UButton>
              <UButton color="warning" class="flex-1" @click="submitRevision">Kirim</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'guru' })

const toast = useToast()
const loading = ref(true)
const loadingLogbook = ref(false)
const search = ref('')
const searchSiswa = ref('')
const filterStatus = ref(null)
const revisionModal = ref(false)
const revisionNote = ref('')
const selectedItem = ref(null)
const selectedSiswa = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const statusOptions = ['Pending', 'Disetujui', 'Revisi']
const perPageOptions = [5, 10, 25, 50]
const stats = reactive({ pending: 0, approved: 0, revision: 0, total: 0 })

// Siswa data
const siswaList = ref([])
const logbooks = ref([])

const filteredSiswa = computed(() => {
  if (!searchSiswa.value) return siswaList.value
  return siswaList.value.filter(s =>
    s.nama.toLowerCase().includes(searchSiswa.value.toLowerCase())
  )
})

const filteredLogbooks = computed(() => {
  return logbooks.value.filter(item => {
    const matchSearch = !search.value ||
      item.kegiatan.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !filterStatus.value || item.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

// Pagination computed
const totalItems = computed(() => filteredLogbooks.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, totalItems.value))
const paginatedLogbooks = computed(() => filteredLogbooks.value.slice(startIndex.value, endIndex.value))

// Reset page when filter changes
watch([search, filterStatus, itemsPerPage], () => { currentPage.value = 1 })

const selectSiswa = async (siswa) => {
  selectedSiswa.value = siswa
  loadingLogbook.value = true
  currentPage.value = 1

  // Simulate loading logbook data
  await new Promise(r => setTimeout(r, 400))

  // Generate 35 logbook entries untuk demo pagination
  const activities = [
    'Membuat UI Dashboard',
    'Meeting dengan Tim',
    'Implementasi REST API',
    'Code Review',
    'Deploy ke Production',
    'Bug Fixing',
    'Database Design',
    'Documentation',
    'Unit Testing',
    'Integration Testing'
  ]

  const descriptions = [
    'Mengerjakan tampilan dashboard admin menggunakan Vue.js dan Tailwind CSS',
    'Diskusi progress project dan pembagian tugas sprint berikutnya',
    'Membangun endpoint API untuk fitur authentication dan user management',
    'Melakukan review code dari tim developer dan memberikan feedback',
    'Deploy aplikasi ke server production dengan CI/CD pipeline',
    'Memperbaiki bug yang ditemukan pada fitur login dan registrasi',
    'Merancang skema database untuk fitur baru inventory management',
    'Menulis dokumentasi API dan technical documentation',
    'Membuat unit test untuk komponen dan service layer',
    'Melakukan integration testing antar modul aplikasi'
  ]

  const statuses = ['Pending', 'Disetujui', 'Revisi']

  logbooks.value = Array.from({ length: 35 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      id: i + 1,
      kegiatan: activities[i % activities.length],
      deskripsi: descriptions[i % descriptions.length],
      tanggal: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      jamMulai: `0${7 + (i % 3)}:00`.slice(-5),
      jamSelesai: `${15 + (i % 3)}:00`,
      status: i < 5 ? 'Pending' : statuses[Math.floor(Math.random() * 3)]
    }
  })

  loadingLogbook.value = false
}

const backToList = () => {
  selectedSiswa.value = null
  logbooks.value = []
  search.value = ''
  filterStatus.value = null
  currentPage.value = 1
}

const getStatusColor = (status) => {
  const colors = { Pending: 'warning', Disetujui: 'success', Revisi: 'error' }
  return colors[status] || 'neutral'
}

const getStatusBg = (status) => {
  const bgs = {
    Pending: 'bg-amber-100 text-amber-600',
    Disetujui: 'bg-green-100 text-green-600',
    Revisi: 'bg-red-100 text-red-600'
  }
  return bgs[status] || 'bg-slate-100 text-slate-600'
}

const approve = (id) => {
  const item = logbooks.value.find(d => d.id === id)
  if (item) {
    item.status = 'Disetujui'
    stats.pending--
    stats.approved++

    // Update siswa pending count
    if (selectedSiswa.value) {
      selectedSiswa.value.pending = Math.max(0, selectedSiswa.value.pending - 1)
    }

    toast.add({ title: 'Logbook disetujui', color: 'success' })
  }
}

const openRevision = (item) => {
  selectedItem.value = item
  revisionNote.value = ''
  revisionModal.value = true
}

const submitRevision = () => {
  if (selectedItem.value && revisionNote.value) {
    selectedItem.value.status = 'Revisi'
    stats.pending--
    stats.revision++

    if (selectedSiswa.value) {
      selectedSiswa.value.pending = Math.max(0, selectedSiswa.value.pending - 1)
    }

    revisionModal.value = false
    toast.add({ title: 'Permintaan revisi dikirim', color: 'warning' })
  }
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  Object.assign(stats, { pending: 12, approved: 156, revision: 8, total: 176 })

  siswaList.value = [
    { id: 1, nama: 'Ryobi Surya Atmaja', inisial: 'RS', kelas: 'XII RPL 1', industri: 'PT. Telkom Indonesia', pending: 5 },
    { id: 2, nama: 'Dewi Sartika', inisial: 'DS', kelas: 'XII RPL 2', industri: 'PT. Gojek Indonesia', pending: 3 },
    { id: 3, nama: 'Ahmad Fauzi', inisial: 'AF', kelas: 'XII TKJ 1', industri: 'CV. Digital Nusantara', pending: 4 },
    { id: 4, nama: 'Siti Nurhaliza', inisial: 'SN', kelas: 'XII MM 1', industri: 'PT. Media Kreasi', pending: 0 },
    { id: 5, nama: 'Budi Prasetyo', inisial: 'BP', kelas: 'XII RPL 1', industri: 'PT. Tokopedia', pending: 0 }
  ]

  loading.value = false
})

useHead({ title: 'Verifikasi Logbook | Guru PKL' })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
