<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <UButton v-if="selectedSiswa" variant="ghost" color="neutral" size="sm" @click="backToList">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </UButton>
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
          {{ selectedSiswa ? `Absensi ${selectedSiswa.nama}` : 'Absensi Siswa Bimbingan' }}
        </h1>
        <p class="text-sm text-slate-500">{{ selectedSiswa ? `${selectedSiswa.kelas} • ${selectedSiswa.industri}` :
          'Pilih siswa untuk melihat detail absensi' }}</p>
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
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Hadir</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.hadir }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:file-text" class="w-4 h-4" />
            <span class="text-sm">Izin</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.izin }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:thermometer" class="w-4 h-4" />
            <span class="text-sm">Sakit</span>
          </div>
          <p class="text-xl font-bold text-sky-600">{{ stats.sakit }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:x-circle" class="w-4 h-4" />
            <span class="text-sm">Alpa</span>
          </div>
          <p class="text-xl font-bold text-red-600">{{ stats.alpa }}</p>
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
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-slate-900">{{ siswa.totalAbsensi }} hari</p>
                <p class="text-xs text-slate-500">Total absensi</p>
              </div>
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium" :class="siswa.kehadiran >= 80 ? 'text-green-600' : siswa.kehadiran >= 60 ? 'text-amber-600' : 'text-red-600'">{{ siswa.kehadiran }}%</p>
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
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Keterangan</th>
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
                <td class="px-4 py-3 text-sm text-slate-500">{{ item.keterangan || '-' }}</td>
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
            </div>
            <p v-if="item.keterangan" class="text-xs text-slate-500 mt-2">{{ item.keterangan }}</p>
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

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'
import { useAbsensiApi } from '~/composables/api/use-internship'

definePageMeta({ layout: 'guru' })

const guruApi = useGuruApi()
const { getAll: getAbsensi } = useAbsensiApi()

const toast = useToast()
const loading = ref(true)
const loadingAbsensi = ref(false)
const searchSiswa = ref('')
const filterStatus = ref<string | null>(null)
const filterDate = ref('')
const selectedSiswa = ref<any>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const statusOptions = ['Hadir', 'Izin', 'Sakit', 'Alpa']
const perPageOptions = [5, 10, 25, 50]
const stats = reactive({ hadir: 0, izin: 0, sakit: 0, alpa: 0, total: 0 })

// Data
const siswaList = ref<any[]>([])
const absensiData = ref<any[]>([])

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

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

watch([filterStatus, itemsPerPage], () => { currentPage.value = 1 })

function formatTime(dt: string | null): string {
  if (!dt) return '-'
  try {
    const d = new Date(dt)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dt
  }
}

function formatStatus(raw: string): string {
  const map: Record<string, string> = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpa: 'Alpa' }
  return map[raw] || raw
}

const selectSiswa = async (siswa: any) => {
  selectedSiswa.value = siswa
  loadingAbsensi.value = true
  currentPage.value = 1

  try {
    const res = await getAbsensi({ id_penempatan: siswa.id_penempatan, limit: 100 })
    if (res?.data) {
      absensiData.value = res.data.map((a: any) => ({
        id: a.id_absensi,
        tanggal: new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        checkIn: formatTime(a.waktu_masuk),
        checkOut: formatTime(a.waktu_keluar),
        durasi: a.waktu_masuk && a.waktu_keluar ? calculateDuration(a.waktu_masuk, a.waktu_keluar) : '-',
        status: formatStatus(a.status_absensi),
        statusRaw: a.status_absensi,
        keterangan: a.keterangan || ''
      }))

      // Update stats for selected student
      const counts = { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
      for (const a of absensiData.value) {
        const key = a.statusRaw as keyof typeof counts
        if (key in counts) counts[key]++
      }
      stats.hadir = counts.hadir
      stats.izin = counts.izin
      stats.sakit = counts.sakit
      stats.alpa = counts.alpa
      stats.total = absensiData.value.length
    }
  } catch (e) {
    console.warn('Failed to fetch absensi:', e)
    absensiData.value = []
  } finally {
    loadingAbsensi.value = false
  }
}

function calculateDuration(start: string, end: string): string {
  try {
    const s = new Date(start)
    const e = new Date(end)
    const diffMs = e.getTime() - s.getTime()
    const hours = Math.floor(diffMs / 3600000)
    const mins = Math.round((diffMs % 3600000) / 60000)
    if (hours > 0 && mins > 0) return `${hours}j ${mins}m`
    if (hours > 0) return `${hours} jam`
    return `${mins} menit`
  } catch {
    return '-'
  }
}

const backToList = () => {
  selectedSiswa.value = null
  absensiData.value = []
  filterStatus.value = null
  filterDate.value = ''
  currentPage.value = 1
  // Reset stats to overall
  recalcOverallStats()
}

type BadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

const getStatusColor = (status: string): BadgeColor => {
  const colors: Record<string, BadgeColor> = { Hadir: 'success', Izin: 'warning', Sakit: 'info', Alpa: 'error' }
  return colors[status] || 'neutral'
}

const getStatusBg = (status: string) => {
  const bgs: Record<string, string> = {
    Hadir: 'bg-green-100 text-green-600',
    Izin: 'bg-amber-100 text-amber-600',
    Sakit: 'bg-sky-100 text-sky-600',
    Alpa: 'bg-red-100 text-red-600'
  }
  return bgs[status] || 'bg-slate-100 text-slate-600'
}

function recalcOverallStats() {
  let h = 0, i = 0, s = 0, a = 0
  for (const siswa of siswaList.value) {
    h += siswa.countHadir
    i += siswa.countIzin
    s += siswa.countSakit
    a += siswa.countAlpa
  }
  stats.hadir = h
  stats.izin = i
  stats.sakit = s
  stats.alpa = a
  stats.total = h + i + s + a
}

async function fetchData() {
  try {
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })

    if (res?.data) {
      siswaList.value = res.data
        .filter((p: any) => p.status_penempatan === 'aktif')
        .map((p: any) => {
          const absensiArr = p.absensi || []
          const countHadir = absensiArr.filter((a: any) => a.status_absensi === 'hadir').length
          const countIzin = absensiArr.filter((a: any) => a.status_absensi === 'izin').length
          const countSakit = absensiArr.filter((a: any) => a.status_absensi === 'sakit').length
          const countAlpa = absensiArr.filter((a: any) => a.status_absensi === 'alpa').length
          const total = absensiArr.length
          const kehadiran = total > 0 ? Math.round((countHadir / total) * 100) : 0

          return {
            id: p.siswa?.id_siswa || p.id_penempatan,
            id_penempatan: p.id_penempatan,
            nama: p.siswa?.nama_siswa || '-',
            inisial: getInitials(p.siswa?.nama_siswa || 'XX'),
            kelas: p.siswa?.kelas?.nama_kelas || '-',
            industri: p.perusahaan?.nama_perusahaan || '-',
            kehadiran,
            totalAbsensi: total,
            countHadir,
            countIzin,
            countSakit,
            countAlpa,
          }
        })

      recalcOverallStats()
    }
  } catch (e) {
    console.warn('Failed to fetch data:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

useHead({ title: 'Absensi Siswa | Guru PKL' })
</script>
