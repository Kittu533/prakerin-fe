<template>
  <div class="space-y-6">
    <!-- Welcome Card -->
    <div class="bg-sky-500 rounded-2xl p-5 lg:p-6 text-white">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sky-100 text-sm">Selamat datang,</p>
          <h1 class="text-xl lg:text-2xl font-bold mt-1">Administrator 👋</h1>
          <p class="text-sky-100 text-sm mt-1">Panel Admin SIM Prakerin</p>
        </div>
        <UButton color="white" variant="solid" size="sm" class="shrink-0">
          <Icon name="lucide:download" class="w-4 h-4 mr-1" />
          Export
        </UButton>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="stat.bg">
            <Icon :name="stat.icon" class="w-5 h-5" :class="stat.color" />
          </div>
          <UBadge v-if="stat.change" :color="stat.change > 0 ? 'success' : 'error'" variant="subtle" size="xs">
            {{ stat.change > 0 ? '+' : '' }}{{ stat.change }}%
          </UBadge>
        </div>
        <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
        <p class="text-sm text-slate-500">{{ stat.label }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-4 lg:gap-6">
      <!-- Penempatan per Jurusan Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 min-w-0 overflow-hidden">
        <h3 class="font-semibold text-slate-900 mb-4">Penempatan per Jurusan</h3>
        <div v-if="loading">
          <USkeleton class="h-48 lg:h-64 rounded-lg" />
        </div>
        <div v-else class="w-full overflow-x-auto">
          <ClientOnly>
            <apexchart type="bar" height="200" :options="placementChartOptions" :series="placementChartSeries" />
          </ClientOnly>
        </div>
      </div>

      <!-- Trend Pengajuan Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 lg:p-5 min-w-0 overflow-hidden">
        <h3 class="font-semibold text-slate-900 mb-4">Trend Pengajuan PKL</h3>
        <div v-if="loading">
          <USkeleton class="h-48 lg:h-64 rounded-lg" />
        </div>
        <div v-else class="w-full overflow-x-auto">
          <ClientOnly>
            <apexchart type="line" height="200" :options="trendChartOptions" :series="trendChartSeries" />
          </ClientOnly>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Status Siswa Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-900 mb-4">Status Siswa PKL</h3>
        <div v-if="loading">
          <USkeleton class="h-64 rounded-lg" />
        </div>
        <ClientOnly v-else>
          <apexchart type="donut" height="250" :options="statusChartOptions" :series="statusChartSeries" />
        </ClientOnly>
      </div>

      <!-- Recent Alerts -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="font-semibold text-slate-900 mb-4">Notifikasi Terbaru</h3>
        <div v-if="loading" class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-14 rounded-lg" />
        </div>
        <div v-else class="space-y-3">
          <UAlert v-for="alert in alerts" :key="alert.id" :color="alert.color" :icon="alert.icon" :title="alert.title" :description="alert.desc" />
        </div>
      </div>
    </div>

    <!-- Recent Applications -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-semibold text-slate-900">Pengajuan Terbaru</h3>
        <UButton variant="ghost" color="primary" size="xs" to="/admin/verification">Lihat Semua</UButton>
      </div>
      <div v-if="loading" class="p-4 space-y-3">
        <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
      </div>
      <UTable v-else :data="recentApps" :columns="columns">
        <template #siswa-cell="{ row }">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold">
              {{ row.original.siswa.split(' ').map((n: string) => n[0]).join('') }}
            </div>
            <span class="text-sm font-medium text-slate-900">{{ row.original.siswa }}</span>
          </div>
        </template>
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'Menunggu' ? 'warning' : row.original.status === 'Disetujui' ? 'success' : 'error'" variant="subtle" size="xs">
            {{ row.original.status }}
          </UBadge>
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const loading = ref(true)

const stats = ref([
  { label: 'Total Siswa PKL', value: 245, icon: 'lucide:users', bg: 'bg-sky-100', color: 'text-sky-600', change: 12 },
  { label: 'Menunggu Verifikasi', value: 18, icon: 'lucide:clock', bg: 'bg-amber-100', color: 'text-amber-600' },
  { label: 'Sudah Ditempatkan', value: 198, icon: 'lucide:check-circle', bg: 'bg-green-100', color: 'text-green-600', change: 8 },
  { label: 'Masalah Absensi', value: 12, icon: 'lucide:alert-triangle', bg: 'bg-red-100', color: 'text-red-600' }
])

const alerts = ref([
  { id: 1, color: 'warning' as const, icon: 'lucide:clock', title: '5 pengajuan baru', desc: 'Menunggu verifikasi' },
  { id: 2, color: 'error' as const, icon: 'lucide:alert-circle', title: '3 siswa absensi rendah', desc: 'Kehadiran < 80%' },
  { id: 3, color: 'primary' as const, icon: 'lucide:info', title: 'Kuota PT Telkom hampir penuh', desc: 'Sisa 1 slot' }
])

// Chart Options
const placementChartOptions = {
  chart: { 
    type: 'bar', 
    toolbar: { show: false },
    redrawOnParentResize: true,
    redrawOnWindowResize: true
  },
  plotOptions: { bar: { borderRadius: 4, horizontal: true } },
  colors: ['#0ea5e9'],
  xaxis: { 
    categories: ['RPL', 'TKJ', 'MM', 'AKL'],
    labels: { style: { fontSize: '11px' } }
  },
  yaxis: { labels: { style: { fontSize: '11px' } } },
  dataLabels: { enabled: true, formatter: (val: number) => `${val}%`, style: { fontSize: '11px' } },
  grid: { borderColor: '#f1f5f9', padding: { left: 0, right: 0 } },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: { height: 180 },
      dataLabels: { style: { fontSize: '10px' } }
    }
  }]
}

const placementChartSeries = [{ name: 'Penempatan', data: [85, 72, 68, 55] }]

const trendChartOptions = {
  chart: { 
    type: 'line', 
    toolbar: { show: false },
    redrawOnParentResize: true,
    redrawOnWindowResize: true
  },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#0ea5e9', '#22c55e'],
  xaxis: { 
    categories: ['Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    labels: { style: { fontSize: '10px' } }
  },
  yaxis: { labels: { formatter: (val: number) => Math.round(val).toString(), style: { fontSize: '10px' } } },
  legend: { position: 'top', fontSize: '11px' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9', padding: { left: 0, right: 0 } },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: { height: 180 },
      stroke: { width: 2 },
      legend: { fontSize: '10px' }
    }
  }]
}

const trendChartSeries = [
  { name: 'Pengajuan', data: [45, 52, 38, 65, 48, 42] },
  { name: 'Diterima', data: [40, 48, 35, 58, 45, 38] }
]

const statusChartOptions = {
  chart: { type: 'donut' },
  labels: ['Aktif PKL', 'Menunggu', 'Selesai', 'Bermasalah'],
  colors: ['#0ea5e9', '#f59e0b', '#22c55e', '#ef4444'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: { show: true, label: 'Total Siswa', fontSize: '12px' }
        }
      }
    }
  }
}

const statusChartSeries = [198, 18, 17, 12]

const columns = [
  { accessorKey: 'siswa', header: 'Siswa' },
  { accessorKey: 'jurusan', header: 'Jurusan' },
  { accessorKey: 'perusahaan', header: 'Perusahaan' },
  { accessorKey: 'tanggal', header: 'Tanggal' },
  { accessorKey: 'status', header: 'Status' }
]

const recentApps = ref([
  { siswa: 'Budi Santoso', jurusan: 'RPL', perusahaan: 'PT Telkom', tanggal: '15 Des 2024', status: 'Menunggu' },
  { siswa: 'Ani Wijaya', jurusan: 'TKJ', perusahaan: 'PT Biznet', tanggal: '14 Des 2024', status: 'Menunggu' },
  { siswa: 'Deni Pratama', jurusan: 'MM', perusahaan: 'CV Digital', tanggal: '14 Des 2024', status: 'Disetujui' },
  { siswa: 'Siti Aminah', jurusan: 'RPL', perusahaan: 'PT Astra', tanggal: '13 Des 2024', status: 'Ditolak' }
])

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
})

useHead({ title: 'Dashboard | Admin' })
</script>
