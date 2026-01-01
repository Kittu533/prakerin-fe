<template>
  <div class="space-y-6">
    <!-- Welcome & Attendance Status -->
    <div class="bg-sky-500 rounded-2xl p-5 lg:p-6 text-white">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sky-100 text-sm">{{ currentDate }}</p>
          <h1 v-if="!loading" class="text-xl lg:text-2xl font-bold mt-1">Halo, {{ siswa.nama }}! 👋</h1>
          <USkeleton v-else class="h-7 w-48 mt-1" :ui="{ background: 'bg-white/20' }" />
          <p class="text-sky-100 text-sm mt-1">{{ siswa.kelas }} • {{ siswa.industri }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold shrink-0">
          {{ siswa.inisial }}
        </div>
      </div>

      <!-- Attendance Card -->
      <div class="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sky-100 text-sm">Status Absensi Hari Ini</p>
            <p v-if="attendance.checkedIn" class="font-semibold mt-1">
              <Icon name="lucide:check-circle" class="w-4 h-4 inline mr-1" />
              Sudah Absen • {{ attendance.checkInTime }}
            </p>
            <p v-else class="font-semibold mt-1 text-amber-300">
              <Icon name="lucide:alert-circle" class="w-4 h-4 inline mr-1" />
              Belum Absen Hari Ini
            </p>
          </div>
          <UButton 
            v-if="!attendance.checkedIn"
            color="white" 
            size="sm"
            @click="navigateTo('/siswa/absensi')"
          >
            <Icon name="lucide:map-pin" class="w-4 h-4 mr-1" />
            Absen Sekarang
          </UButton>
          <UBadge v-else color="white" variant="subtle">
            <Icon name="lucide:check" class="w-3 h-3 mr-1" />
            Hadir
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-4 border border-slate-200">
          <USkeleton class="h-4 w-16 mb-2" />
          <USkeleton class="h-7 w-12" />
        </div>
      </template>
      <template v-else>
        <div class="bg-white rounded-xl p-4 border border-slate-200">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:book-open" class="w-4 h-4" />
            <span class="text-xs">Total Logbook</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ stats.totalLogbook }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-200">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:check-circle" class="w-4 h-4" />
            <span class="text-xs">Disetujui</span>
          </div>
          <p class="text-2xl font-bold text-green-600">{{ stats.approved }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-200">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:clock" class="w-4 h-4" />
            <span class="text-xs">Pending</span>
          </div>
          <p class="text-2xl font-bold text-amber-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-slate-200">
          <div class="flex items-center gap-2 text-slate-500 mb-1">
            <Icon name="lucide:calendar" class="w-4 h-4" />
            <span class="text-xs">Hari PKL</span>
          </div>
          <p class="text-2xl font-bold text-sky-600">{{ stats.days }}</p>
        </div>
      </template>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Logbook Status Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-900 mb-4">Status Logbook</h2>
        <div v-if="loading">
          <USkeleton class="h-48 rounded-lg" />
        </div>
        <ClientOnly v-else>
          <apexchart type="donut" height="200" :options="logbookChartOptions" :series="logbookChartSeries" />
        </ClientOnly>
      </div>

      <!-- Kehadiran Mingguan Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-900 mb-4">Kehadiran Mingguan</h2>
        <div v-if="loading">
          <USkeleton class="h-48 rounded-lg" />
        </div>
        <ClientOnly v-else>
          <apexchart type="area" height="200" :options="attendanceChartOptions" :series="attendanceChartSeries" />
        </ClientOnly>
      </div>
    </div>

    <!-- Progress PKL -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-semibold text-slate-900">Progress PKL</h2>
        <span class="text-sm font-medium text-sky-600">{{ progress }}%</span>
      </div>
      <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-sky-500 rounded-full transition-all" :style="{ width: `${progress}%` }" />
      </div>
      <p class="text-xs text-slate-500 mt-2">{{ stats.days }} dari 180 hari PKL selesai</p>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="font-semibold text-slate-900">Menu Cepat</h2>
      </div>
      <div class="p-4 grid grid-cols-4 gap-3">
        <NuxtLink to="/siswa/logbook/create" class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-sky-50 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Icon name="lucide:plus" class="w-6 h-6" />
          </div>
          <span class="text-xs font-medium text-slate-700 text-center">Tulis Logbook</span>
        </NuxtLink>
        <NuxtLink to="/siswa/absensi" class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <Icon name="lucide:map-pin" class="w-6 h-6" />
          </div>
          <span class="text-xs font-medium text-slate-700 text-center">Absensi</span>
        </NuxtLink>
        <NuxtLink to="/siswa/dokumen" class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-amber-50 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Icon name="lucide:upload" class="w-6 h-6" />
          </div>
          <span class="text-xs font-medium text-slate-700 text-center">Upload</span>
        </NuxtLink>
        <NuxtLink to="/siswa/nilai" class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors">
          <div class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Icon name="lucide:award" class="w-6 h-6" />
          </div>
          <span class="text-xs font-medium text-slate-700 text-center">Nilai</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Recent Logbook -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-900">Logbook Terbaru</h2>
        <UButton to="/siswa/logbook" variant="ghost" color="primary" size="xs" trailing-icon="i-lucide-arrow-right">
          Lihat Semua
        </UButton>
      </div>
      
      <div v-if="loading" class="p-4 space-y-3">
        <div v-for="i in 3" :key="i" class="flex gap-3">
          <USkeleton class="w-10 h-10 rounded-lg shrink-0" />
          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </div>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div v-for="log in recentLogbooks" :key="log.id" class="px-5 py-3 hover:bg-slate-50 transition-colors">
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-lg shrink-0" :class="getLogStatusBg(log.status)">
              <Icon name="lucide:file-text" class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ log.kegiatan }}</p>
              <p class="text-xs text-slate-500">{{ log.tanggal }}</p>
            </div>
            <UBadge :color="getLogStatusColor(log.status)" variant="subtle" size="xs">
              {{ log.status }}
            </UBadge>
          </div>
        </div>
        
        <div v-if="!recentLogbooks.length" class="py-8 text-center">
          <Icon name="lucide:book-open" class="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p class="text-sm text-slate-500">Belum ada logbook</p>
        </div>
      </div>
    </div>

    <!-- Info Mentor & Industri -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-900 mb-3">Info Mentor</h3>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-semibold">
            AS
          </div>
          <div class="flex-1">
            <p class="font-medium text-slate-900">Pak Agus Santoso</p>
            <p class="text-sm text-slate-500">Mentor Industri</p>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <UButton size="xs" variant="soft" color="success" class="flex-1">
            <Icon name="lucide:message-circle" class="w-4 h-4 mr-1" />
            WhatsApp
          </UButton>
          <UButton size="xs" variant="soft" color="primary" class="flex-1">
            <Icon name="lucide:mail" class="w-4 h-4 mr-1" />
            Email
          </UButton>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-900 mb-3">Info Industri</h3>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Icon name="lucide:building-2" class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-slate-900">PT. Telkom Indonesia</p>
            <p class="text-sm text-slate-500">Jl. Gatot Subroto, Jakarta</p>
          </div>
        </div>
        <div class="mt-3">
          <UButton size="xs" variant="soft" color="neutral" class="w-full">
            <Icon name="lucide:map" class="w-4 h-4 mr-1" />
            Lihat Lokasi
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'siswa' })

const loading = ref(true)

const siswa = reactive({
  nama: 'Ryobi',
  inisial: 'RS',
  kelas: 'XII RPL 1',
  industri: 'PT. Telkom Indonesia'
})

const attendance = reactive({
  checkedIn: false,
  checkInTime: ''
})

const stats = reactive({
  totalLogbook: 0,
  approved: 0,
  pending: 0,
  days: 0
})

const recentLogbooks = ref([])

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const progress = computed(() => Math.round((stats.days / 180) * 100))

// Chart Options
const logbookChartOptions = {
  chart: { type: 'donut' },
  labels: ['Disetujui', 'Pending', 'Revisi'],
  colors: ['#22c55e', '#f59e0b', '#ef4444'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: { show: true, label: 'Total', fontSize: '14px' }
        }
      }
    }
  }
}

const logbookChartSeries = computed(() => [stats.approved, stats.pending, 2])

const attendanceChartOptions = {
  chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
  colors: ['#0ea5e9'],
  xaxis: { categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'], labels: { style: { fontSize: '11px' } } },
  yaxis: { show: false },
  grid: { show: false },
  dataLabels: { enabled: false },
  tooltip: { y: { formatter: (val) => `${val} jam` } }
}

const attendanceChartSeries = [{ name: 'Jam Kerja', data: [8, 8, 7, 8, 8, 4] }]

const getLogStatusColor = (status) => {
  const colors = { Disetujui: 'success', Pending: 'warning', Revisi: 'error' }
  return colors[status] || 'neutral'
}

const getLogStatusBg = (status) => {
  const bgs = { 
    Disetujui: 'bg-green-100 text-green-600', 
    Pending: 'bg-amber-100 text-amber-600', 
    Revisi: 'bg-red-100 text-red-600' 
  }
  return bgs[status] || 'bg-slate-100 text-slate-600'
}

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  
  Object.assign(stats, { totalLogbook: 48, approved: 42, pending: 4, days: 85 })
  
  recentLogbooks.value = [
    { id: 1, kegiatan: 'Membuat UI Dashboard Admin', tanggal: '15 Des 2024', status: 'Pending' },
    { id: 2, kegiatan: 'Meeting dengan tim development', tanggal: '14 Des 2024', status: 'Disetujui' },
    { id: 3, kegiatan: 'Implementasi REST API', tanggal: '13 Des 2024', status: 'Disetujui' }
  ]
  
  loading.value = false
})

useHead({ title: 'Dashboard | Siswa PKL' })
</script>
