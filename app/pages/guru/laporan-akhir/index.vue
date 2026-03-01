<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Laporan Akhir PKL</h1>
        <p class="text-sm text-slate-500 mt-1">Rekap laporan akhir siswa bimbingan</p>
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
            <Icon name="lucide:users" class="w-4 h-4" />
            <span class="text-sm">Total Siswa</span>
          </div>
          <p class="text-xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span class="text-sm">Aktif</span>
          </div>
          <p class="text-xl font-bold text-sky-600">{{ stats.aktif }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-sm">Selesai</span>
          </div>
          <p class="text-xl font-bold text-green-600">{{ stats.selesai }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:star" class="w-4 h-4" />
            <span class="text-sm">Sudah Dinilai</span>
          </div>
          <p class="text-xl font-bold text-amber-600">{{ stats.dinilai }}</p>
        </div>
      </template>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <UInput v-model="search" placeholder="Cari nama siswa..." class="flex-1">
          <template #leading>
            <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
          </template>
        </UInput>
        <USelectMenu v-model="filterStatus" :items="statusOptions" placeholder="Filter Status" class="w-full sm:w-48" />
      </div>
    </div>

    <!-- List -->
    <div class="space-y-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-start gap-4">
            <USkeleton class="w-10 h-10 rounded-xl" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-32" />
            </div>
            <USkeleton class="h-6 w-20 rounded-full" />
          </div>
        </div>
      </template>

      <template v-else>
        <div v-for="item in filteredData" :key="item.id_penempatan" class="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm shrink-0">
              {{ getInisial(item.siswa?.nama_siswa) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p class="font-medium text-slate-900">{{ item.siswa?.nama_siswa || '-' }}</p>
                  <p class="text-sm text-slate-500">
                    {{ item.siswa?.kelas?.nama_kelas || '-' }}
                    <span v-if="item.siswa?.kelas?.jurusan"> • {{ item.siswa.kelas.jurusan.nama_jurusan }}</span>
                    • {{ item.perusahaan?.nama_perusahaan || '-' }}
                  </p>
                </div>
                <UBadge :color="getLaporanStatusColor(item)" variant="subtle" size="xs">
                  {{ getLaporanStatus(item) }}
                </UBadge>
              </div>
              
              <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:calendar" class="w-4 h-4" />
                  {{ formatDate(item.tanggal_mulai) }} - {{ formatDate(item.tanggal_selesai) }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="lucide:book-open" class="w-4 h-4" />
                  {{ item.logbook?.length || 0 }} logbook
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="lucide:bar-chart-2" class="w-4 h-4" />
                  Kehadiran {{ item.stats?.kehadiran || 0 }}%
                </span>
                <span v-if="item.penilaian?.nilai_akhir" class="flex items-center gap-1">
                  <Icon name="lucide:star" class="w-4 h-4" />
                  Nilai: {{ Number(item.penilaian.nilai_akhir).toFixed(1) }}
                </span>
              </div>

              <!-- Progress indicators -->
              <div class="flex flex-wrap gap-2 mb-3">
                <div class="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                  :class="item.logbook?.length > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'">
                  <Icon :name="item.logbook?.length > 0 ? 'lucide:check-circle' : 'lucide:circle'" class="w-3 h-3" />
                  Logbook
                </div>
                <div class="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                  :class="item.absensi?.length > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'">
                  <Icon :name="item.absensi?.length > 0 ? 'lucide:check-circle' : 'lucide:circle'" class="w-3 h-3" />
                  Absensi
                </div>
                <div class="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                  :class="item.monitoring?.length > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'">
                  <Icon :name="item.monitoring?.length > 0 ? 'lucide:check-circle' : 'lucide:circle'" class="w-3 h-3" />
                  Monitoring
                </div>
                <div class="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
                  :class="item.penilaian ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'">
                  <Icon :name="item.penilaian ? 'lucide:check-circle' : 'lucide:circle'" class="w-3 h-3" />
                  Penilaian
                </div>
              </div>

              <div class="flex gap-2">
                <UButton size="sm" variant="soft" color="neutral" @click="viewDetail(item.id_penempatan)">
                  <Icon name="lucide:eye" class="w-4 h-4 mr-1" />
                  Detail
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!filteredData.length" class="bg-white rounded-xl border border-slate-200 py-12 text-center">
          <Icon name="lucide:file-x" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500">Tidak ada data siswa bimbingan</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'

definePageMeta({ layout: 'guru' })

const toast = useToast()
const guruApi = useGuruApi()
const loading = ref(true)
const search = ref('')
const filterStatus = ref<string | null>(null)

const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Aktif (Berlangsung)', value: 'aktif' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Sudah Dinilai', value: 'dinilai' },
]

const penempatan = ref<any[]>([])

const stats = computed(() => {
  const total = penempatan.value.length
  const aktif = penempatan.value.filter(p => p.status_penempatan === 'aktif').length
  const selesai = penempatan.value.filter(p => p.status_penempatan === 'selesai').length
  const dinilai = penempatan.value.filter(p => p.penilaian != null).length
  return { total, aktif, selesai, dinilai }
})

const filteredData = computed(() => {
  return penempatan.value.filter(item => {
    const nama = item.siswa?.nama_siswa || ''
    const matchSearch = !search.value || nama.toLowerCase().includes(search.value.toLowerCase())
    
    let matchStatus = true
    if (filterStatus.value === 'aktif') {
      matchStatus = item.status_penempatan === 'aktif'
    } else if (filterStatus.value === 'selesai') {
      matchStatus = item.status_penempatan === 'selesai'
    } else if (filterStatus.value === 'dinilai') {
      matchStatus = item.penilaian != null
    }
    
    return matchSearch && matchStatus
  })
})

function getInisial(nama?: string) {
  if (!nama) return '?'
  return nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function getLaporanStatus(item: any) {
  if (item.penilaian?.nilai_akhir) return 'Selesai & Dinilai'
  if (item.status_penempatan === 'selesai') return 'Selesai'
  return 'Berlangsung'
}

function getLaporanStatusColor(item: any) {
  if (item.penilaian?.nilai_akhir) return 'success'
  if (item.status_penempatan === 'selesai') return 'primary'
  return 'warning'
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function viewDetail(id: string) {
  navigateTo(`/guru/laporan-akhir/${id}`)
}

onMounted(async () => {
  try {
    const res = await guruApi.getSiswaBimbingan({ limit: 100 })
    penempatan.value = res?.data || []
  } catch (e: any) {
    console.error('Failed to load data:', e)
    toast.add({ title: 'Gagal memuat data siswa bimbingan', color: 'error' })
  } finally {
    loading.value = false
  }
})

useHead({ title: 'Laporan Akhir | Guru PKL' })
</script>
