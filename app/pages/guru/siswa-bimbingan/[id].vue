<template>
  <div class="space-y-6">
    <!-- Back -->
    <UButton to="/guru/siswa-bimbingan" variant="ghost" color="neutral" size="sm">
      <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
      Kembali
    </UButton>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <Icon name="lucide:alert-circle" class="w-10 h-10 mx-auto mb-2 text-red-400" />
      <p class="text-red-600 font-medium">{{ error }}</p>
      <UButton @click="loadData" variant="outline" color="error" size="sm" class="mt-4">
        Coba Lagi
      </UButton>
    </div>

    <template v-else>
      <!-- Profile Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div v-if="loading" class="flex flex-col sm:flex-row gap-6">
          <USkeleton class="w-20 h-20 rounded-2xl" />
          <div class="flex-1 space-y-3">
            <USkeleton class="h-6 w-48" />
            <USkeleton class="h-4 w-32" />
            <div class="flex gap-2">
              <USkeleton class="h-6 w-20 rounded-full" />
              <USkeleton class="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col sm:flex-row gap-6">
          <div class="w-20 h-20 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold shrink-0">
            {{ siswaInisial }}
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-slate-900">{{ siswaData?.nama_siswa || '-' }}</h1>
            <p class="text-slate-500">{{ siswaData?.nis || '-' }} • {{ siswaData?.kelas?.nama_kelas || '-' }}</p>
            <div class="flex flex-wrap gap-2 mt-3">
              <UBadge :color="statusColor" variant="subtle">{{ statusLabel }}</UBadge>
              <UBadge color="primary" variant="subtle">
                <Icon name="lucide:building-2" class="w-3 h-3 mr-1" />
                {{ perusahaanData?.nama_perusahaan || '-' }}
              </UBadge>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton variant="outline" color="neutral" size="sm">
              <Icon name="lucide:message-square" class="w-4 h-4" />
            </UButton>
            <UButton variant="outline" color="neutral" size="sm">
              <Icon name="lucide:phone" class="w-4 h-4" />
            </UButton>
          </div>
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
            <p class="text-sm text-slate-500 mb-1">Kehadiran</p>
            <p class="text-xl font-bold" :class="stats.kehadiran >= 80 ? 'text-green-600' : 'text-red-600'">{{ stats.kehadiran }}%</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500 mb-1">Total Logbook</p>
            <p class="text-xl font-bold text-slate-900">{{ stats.totalLogbook }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500 mb-1">Hari PKL</p>
            <p class="text-xl font-bold text-slate-900">{{ stats.hariPkl }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-sm text-slate-500 mb-1">Logbook Pending</p>
            <p class="text-xl font-bold text-sky-600">{{ stats.logbookPending }}</p>
          </div>
        </template>
      </div>

      <!-- Tabs Content -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="border-b border-slate-200">
          <nav class="flex gap-4 px-6">
            <button v-for="item in tabItems" :key="item.key" @click="activeTab = item.key" class="py-4 text-sm font-medium border-b-2 transition-colors" :class="activeTab === item.key ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'">
              {{ item.label }}
              <span v-if="item.count !== undefined" class="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded-full">{{ item.count }}</span>
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Info Tab -->
          <div v-if="activeTab === 'info'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-slate-500">Jurusan</p>
                <p class="font-medium text-slate-900">{{ siswaData?.kelas?.jurusan?.nama_jurusan || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Alamat Perusahaan</p>
                <p class="font-medium text-slate-900">{{ perusahaanData?.alamat || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Guru Pembimbing</p>
                <p class="font-medium text-slate-900">{{ guruData?.nama_guru || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Periode PKL</p>
                <p class="font-medium text-slate-900">{{ formatPeriode }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Tanggal Mulai</p>
                <p class="font-medium text-slate-900">{{ formatDate(penempatan?.tanggal_mulai) }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500">Tanggal Selesai</p>
                <p class="font-medium text-slate-900">{{ formatDate(penempatan?.tanggal_selesai) }}</p>
              </div>
            </div>
          </div>

          <!-- Logbook Tab -->
          <div v-if="activeTab === 'logbook'">
            <div v-if="loadingLogbook" class="space-y-3">
              <USkeleton v-for="i in 3" :key="i" class="h-16 w-full rounded-lg" />
            </div>
            <div v-else-if="logbooks.length === 0" class="text-center py-8 text-slate-500">
              <Icon name="lucide:file-text" class="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>Belum ada logbook</p>
            </div>
            <div v-else class="space-y-3">
              <div v-for="log in logbooks" :key="log.id_logbook" class="flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div class="p-2 rounded-lg bg-sky-100 text-sky-600">
                  <Icon name="lucide:file-text" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 truncate">{{ log.kegiatan }}</p>
                  <p class="text-sm text-slate-500">{{ formatDate(log.tanggal) }} • {{ log.jam_mulai }} - {{ log.jam_selesai }}</p>
                </div>
                <UBadge :color="getLogStatusColor(log.status)" variant="subtle" size="xs">{{ getLogStatusLabel(log.status) }}</UBadge>
              </div>
            </div>
          </div>

          <!-- Absensi Tab -->
          <div v-if="activeTab === 'absensi'">
            <div v-if="loadingAbsensi" class="space-y-3">
              <USkeleton v-for="i in 5" :key="i" class="h-12 w-full rounded-lg" />
            </div>
            <div v-else-if="absensiList.length === 0" class="text-center py-8 text-slate-500">
              <Icon name="lucide:calendar" class="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>Belum ada data absensi</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="abs in absensiList" :key="abs.id_absensi" class="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                <div class="p-2 rounded-lg" :class="getAbsensiIconClass(abs.status)">
                  <Icon :name="getAbsensiIcon(abs.status)" class="w-4 h-4" />
                </div>
                <div class="flex-1">
                  <p class="font-medium text-slate-900">{{ formatDate(abs.tanggal) }}</p>
                  <p class="text-sm text-slate-500">
                    <span v-if="abs.jam_masuk">Masuk: {{ abs.jam_masuk }}</span>
                    <span v-if="abs.jam_keluar"> • Keluar: {{ abs.jam_keluar }}</span>
                  </p>
                </div>
                <UBadge :color="getAbsensiColor(abs.status)" variant="subtle" size="xs">{{ getAbsensiLabel(abs.status) }}</UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru';
import { useSiswaApi, useGuruApi as useGuruAcademicApi } from '~/composables/api/use-academic';
import { usePerusahaanApi } from '~/composables/api/use-partner';
import { decodeFromUrl } from '~/composables/use-id-encoder';

definePageMeta({ layout: 'guru' })

const route = useRoute()
const guruApi = useGuruApi()
const siswaApi = useSiswaApi()
const perusahaanApi = usePerusahaanApi()
const guruAcademicApi = useGuruAcademicApi()

const loading = ref(true)
const loadingLogbook = ref(false)
const loadingAbsensi = ref(false)
const error = ref<string | null>(null)
const activeTab = ref('info')

// Penempatan data from internship service
const penempatan = ref<any>(null)
// Related data from other services
const siswaData = ref<any>(null)
const perusahaanData = ref<any>(null)
const guruData = ref<any>(null)

const logbooks = ref<any[]>([])
const absensiList = ref<any[]>([])
const stats = ref({
  kehadiran: 0,
  totalLogbook: 0,
  hariPkl: 0,
  logbookPending: 0,
})

// Get penempatan ID from route params (decoded from obfuscated URL)
const idPenempatan = computed(() => {
  const param = route.params.id
  if (typeof param === 'string') {
    return decodeFromUrl(param)
  }
  return null
})

const tabItems = computed(() => [
  { key: 'info', label: 'Informasi' },
  { key: 'logbook', label: 'Logbook', count: stats.value.totalLogbook },
  { key: 'absensi', label: 'Absensi' }
])

// Computed properties
const siswaInisial = computed(() => {
  const nama = siswaData.value?.nama_siswa || ''
  return nama.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
})

const statusColor = computed(() => {
  const status = penempatan.value?.status_penempatan
  if (status === 'aktif') return 'success'
  if (status === 'selesai') return 'info'
  return 'neutral'
})

const statusLabel = computed(() => {
  const status = penempatan.value?.status_penempatan
  if (status === 'aktif') return 'Aktif'
  if (status === 'selesai') return 'Selesai'
  if (status === 'dibatalkan') return 'Dibatalkan'
  return '-'
})

const formatPeriode = computed(() => {
  if (!penempatan.value?.tanggal_mulai || !penempatan.value?.tanggal_selesai) return '-'
  return `${formatDate(penempatan.value.tanggal_mulai)} - ${formatDate(penempatan.value.tanggal_selesai)}`
})

// Helper functions
function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

function getLogStatusColor(status: string): 'success' | 'warning' | 'error' | 'neutral' {
  const colors: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = { 
    approved: 'success', 
    pending: 'warning', 
    revision: 'error' 
  }
  return colors[status] || 'neutral'
}

function getLogStatusLabel(status: string) {
  const labels: Record<string, string> = { approved: 'Disetujui', pending: 'Pending', revision: 'Revisi' }
  return labels[status] || status
}

function getAbsensiColor(status: string): 'success' | 'warning' | 'info' | 'error' | 'neutral' {
  const colors: Record<string, 'success' | 'warning' | 'info' | 'error' | 'neutral'> = { 
    hadir: 'success', 
    izin: 'warning', 
    sakit: 'info', 
    alpha: 'error' 
  }
  return colors[status] || 'neutral'
}

function getAbsensiLabel(status: string) {
  const labels: Record<string, string> = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpha: 'Alpha' }
  return labels[status] || status
}

function getAbsensiIcon(status: string) {
  const icons: Record<string, string> = { 
    hadir: 'lucide:check-circle', 
    izin: 'lucide:clock', 
    sakit: 'lucide:heart-pulse', 
    alpha: 'lucide:x-circle' 
  }
  return icons[status] || 'lucide:circle'
}

function getAbsensiIconClass(status: string) {
  const classes: Record<string, string> = { 
    hadir: 'bg-green-100 text-green-600', 
    izin: 'bg-yellow-100 text-yellow-600', 
    sakit: 'bg-blue-100 text-blue-600', 
    alpha: 'bg-red-100 text-red-600' 
  }
  return classes[status] || 'bg-slate-100 text-slate-600'
}

// Load data functions
async function loadData() {
  if (!idPenempatan.value) {
    error.value = 'ID Penempatan tidak valid'
    return
  }

  loading.value = true
  error.value = null

  try {
    // Step 1: Load penempatan detail (from internship service)
    const result = await guruApi.getDetailSiswaBimbingan(idPenempatan.value)
    penempatan.value = result.data
    console.log('Penempatan data:', penempatan.value)

    // Step 2: Fetch related data from other services in parallel
    const siswaId = penempatan.value?.siswa_id
    const perusahaanId = penempatan.value?.perusahaan_id
    const guruId = penempatan.value?.guru_pembimbing_id

    const fetchPromises: Promise<any>[] = []
    
    if (siswaId) {
      fetchPromises.push(
        siswaApi.getById(siswaId)
          .then(res => { siswaData.value = res.data })
          .catch(err => {
            console.warn('Failed to fetch siswa:', err)
            siswaData.value = null
          })
      )
    }
    
    if (perusahaanId) {
      fetchPromises.push(
        perusahaanApi.getById(perusahaanId)
          .then(res => { perusahaanData.value = res.data })
          .catch(err => {
            console.warn('Failed to fetch perusahaan:', err)
            perusahaanData.value = null
          })
      )
    }
    
    // Try to fetch guru data, but it might fail with 403 (permission denied)
    if (guruId) {
      fetchPromises.push(
        guruAcademicApi.getById(guruId)
          .then(res => { guruData.value = res.data })
          .catch(err => {
            console.warn('Failed to fetch guru (403 permission denied):', err)
            // Fallback: show placeholder data with ID
            guruData.value = { 
              id_guru: guruId, 
              nama_guru: `Guru Pembimbing (ID: ${guruId})`,
              nip: '-'
            }
          })
      )
    }

    await Promise.all(fetchPromises)
    console.log('Siswa:', siswaData.value)
    console.log('Perusahaan:', perusahaanData.value)
    console.log('Guru:', guruData.value)

    // Step 3: Calculate stats from embedded absensi/logbook if available
    if (penempatan.value?.absensi?.length) {
      const absensi = penempatan.value.absensi
      const hadirCount = absensi.filter((a: any) => a.status === 'hadir').length
      stats.value.kehadiran = Math.round((hadirCount / absensi.length) * 100)
      stats.value.hariPkl = absensi.length
    }

    if (penempatan.value?.logbook?.length) {
      stats.value.totalLogbook = penempatan.value.logbook.length
      stats.value.logbookPending = penempatan.value.logbook.filter((l: any) => l.status === 'pending').length
    }

  } catch (err: any) {
    console.error('Error loading penempatan:', err)
    error.value = err?.message || 'Gagal memuat data siswa'
  } finally {
    loading.value = false
  }
}

async function loadLogbook() {
  if (!idPenempatan.value) return
  
  loadingLogbook.value = true
  try {
    const result = await guruApi.getLogbookByPenempatan(idPenempatan.value)
    logbooks.value = result.data || []
    stats.value.totalLogbook = result.pagination?.total || logbooks.value.length
    stats.value.logbookPending = logbooks.value.filter((l: any) => l.status === 'pending').length
  } catch (err) {
    console.error('Error loading logbook:', err)
    // Use embedded data as fallback
    if (penempatan.value?.logbook) {
      logbooks.value = penempatan.value.logbook
    }
  } finally {
    loadingLogbook.value = false
  }
}

async function loadAbsensi() {
  if (!idPenempatan.value) return
  
  loadingAbsensi.value = true
  try {
    const result = await guruApi.getAbsensiByPenempatan(idPenempatan.value)
    absensiList.value = result.data || []
    
    // Recalculate kehadiran
    if (absensiList.value.length > 0) {
      const hadirCount = absensiList.value.filter((a: any) => a.status === 'hadir').length
      stats.value.kehadiran = Math.round((hadirCount / absensiList.value.length) * 100)
      stats.value.hariPkl = absensiList.value.length
    }
  } catch (err) {
    console.error('Error loading absensi:', err)
    // Use embedded data as fallback
    if (penempatan.value?.absensi) {
      absensiList.value = penempatan.value.absensi
    }
  } finally {
    loadingAbsensi.value = false
  }
}

// Watch tab changes to load data lazily
watch(activeTab, async (newTab) => {
  if (newTab === 'logbook' && logbooks.value.length === 0) {
    await loadLogbook()
  } else if (newTab === 'absensi' && absensiList.value.length === 0) {
    await loadAbsensi()
  }
})

// Initial load
onMounted(async () => {
  await loadData()
})

useHead({ title: 'Detail Siswa | Guru PKL' })
</script>
