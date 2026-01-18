<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-sky-500 rounded-2xl p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sky-100 text-sm">{{ currentDate }}</p>
          <h1 class="text-2xl lg:text-3xl font-bold mt-1">Halo, Pak Joko! 👋</h1>
          <p class="text-sky-100 text-sm mt-1">Mentor Industri • PT. Telkom Indonesia</p>
        </div>
        <div class="hidden sm:flex w-16 h-16 rounded-2xl bg-white/20 items-center justify-center text-2xl font-bold">
          JK
        </div>
      </div>
      
      <!-- Quick Summary in Header -->
      <div class="mt-4 grid grid-cols-3 gap-3">
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p class="text-2xl font-bold">5</p>
          <p class="text-xs text-sky-100">Siswa Bimbingan</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p class="text-2xl font-bold text-amber-300">20</p>
          <p class="text-xs text-sky-100">Perlu Verifikasi</p>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
          <p class="text-2xl font-bold text-green-300">86%</p>
          <p class="text-xs text-sky-100">Rata-rata Kehadiran</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
    </div>
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="stat in stats" 
        :key="stat.label" 
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-slate-500 mb-1">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-slate-900">{{ stat.value }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" :class="stat.bg">
            <Icon :name="stat.icon" class="w-6 h-6" :class="stat.color" />
          </div>
        </div>
        <div class="mt-3 flex items-center gap-1" v-if="stat.trend">
          <Icon :name="stat.trend > 0 ? 'lucide:trending-up' : 'lucide:trending-down'" class="w-4 h-4" :class="stat.trend > 0 ? 'text-success-500' : 'text-error-500'" />
          <span class="text-xs" :class="stat.trend > 0 ? 'text-success-600' : 'text-error-600'">{{ Math.abs(stat.trend) }}% dari minggu lalu</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Kehadiran Siswa Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Kehadiran Siswa Bimbingan</h3>
          <UBadge color="success" variant="subtle" size="xs">
            <Icon name="lucide:check-circle" class="w-3 h-3 mr-1" />
            Baik
          </UBadge>
        </div>
        <div v-if="loading">
          <USkeleton class="h-64 rounded-lg" />
        </div>
        <ClientOnly v-else>
          <apexchart type="radialBar" height="250" :options="attendanceChartOptions" :series="attendanceChartSeries" />
        </ClientOnly>
      </div>

      <!-- Verifikasi Progress Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900">Progress Verifikasi</h3>
          <UBadge color="warning" variant="subtle" size="xs">
            <Icon name="lucide:clock" class="w-3 h-3 mr-1" />
            20 Pending
          </UBadge>
        </div>
        <div v-if="loading">
          <USkeleton class="h-64 rounded-lg" />
        </div>
        <ClientOnly v-else>
          <apexchart type="bar" height="250" :options="verificationChartOptions" :series="verificationChartSeries" />
        </ClientOnly>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Pending Verifications -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <h3 class="font-semibold text-slate-900">Menunggu Verifikasi</h3>
          </div>
          <UButton variant="ghost" color="primary" size="xs" to="/mentor/absensi" trailing-icon="i-lucide-arrow-right">Lihat Semua</UButton>
        </div>
        <div v-if="loading" class="p-5 space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-16 rounded-lg" />
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="item in pendingItems" :key="item.id" class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="item.type === 'absensi' ? 'bg-warning-100 text-warning-600' : 'bg-primary-100 text-primary-600'">
              <Icon :name="item.type === 'absensi' ? 'lucide:calendar-check' : 'lucide:book-open'" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900">{{ item.siswa }}</p>
              <p class="text-xs text-slate-500">{{ item.desc }}</p>
            </div>
            <div class="flex items-center gap-2">
              <UButton size="xs" variant="soft" color="success">
                <Icon name="lucide:check" class="w-3 h-3" />
              </UButton>
              <UButton size="xs" variant="soft" color="error">
                <Icon name="lucide:x" class="w-3 h-3" />
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Siswa Bimbingan -->
      <div class="bg-white rounded-xl border border-slate-200">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 class="font-semibold text-slate-900">Siswa Bimbingan</h3>
          <UButton variant="ghost" color="primary" size="xs" to="/mentor/siswa" trailing-icon="i-lucide-arrow-right">Lihat Semua</UButton>
        </div>
        <div v-if="loading" class="p-5 space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-14 rounded-lg" />
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="siswa in siswaList" :key="siswa.id" class="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
            <div class="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white text-sm font-semibold">
              {{ siswa.nama.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900">{{ siswa.nama }}</p>
              <p class="text-xs text-slate-500">{{ siswa.kelas }}</p>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-1">
                <div class="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="siswa.absensi >= 80 ? 'bg-success-500' : 'bg-error-500'" :style="{ width: `${siswa.absensi}%` }"></div>
                </div>
                <span class="text-sm font-medium" :class="siswa.absensi >= 80 ? 'text-success-600' : 'text-error-600'">{{ siswa.absensi }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-xl border border-slate-200">
      <div class="px-5 py-4 border-b border-slate-100">
        <h3 class="font-semibold text-slate-900">Aksi Cepat</h3>
      </div>
      <div class="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <NuxtLink to="/mentor/absensi" class="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-warning-200 hover:bg-warning-50/50 transition-all group">
          <div class="w-14 h-14 rounded-xl bg-warning-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon name="lucide:calendar-check" class="w-7 h-7 text-warning-600" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-900">Verifikasi Absensi</p>
            <p class="text-xs text-slate-500">8 pending</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/mentor/logbook" class="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-primary-200 hover:bg-primary-50/50 transition-all group">
          <div class="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon name="lucide:book-open" class="w-7 h-7 text-primary-600" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-900">Verifikasi Logbook</p>
            <p class="text-xs text-slate-500">12 pending</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/mentor/penilaian" class="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-success-200 hover:bg-success-50/50 transition-all group">
          <div class="w-14 h-14 rounded-xl bg-success-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon name="lucide:star" class="w-7 h-7 text-success-600" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-900">Input Penilaian</p>
            <p class="text-xs text-slate-500">2 belum dinilai</p>
          </div>
        </NuxtLink>
        <NuxtLink to="/mentor/siswa" class="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-slate-300 hover:bg-slate-50 transition-all group">
          <div class="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon name="lucide:users" class="w-7 h-7 text-slate-600" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-900">Lihat Siswa</p>
            <p class="text-xs text-slate-500">5 siswa</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'mentor' })

const loading = ref(true)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const stats = ref([
  { label: 'Siswa Bimbingan', value: 5, icon: 'lucide:users', bg: 'bg-primary-100', color: 'text-primary-600' },
  { label: 'Absensi Pending', value: 8, icon: 'lucide:calendar-check', bg: 'bg-warning-100', color: 'text-warning-600' },
  { label: 'Logbook Pending', value: 12, icon: 'lucide:book-open', bg: 'bg-warning-100', color: 'text-warning-600' },
  { label: 'Sudah Dinilai', value: 3, icon: 'lucide:star', bg: 'bg-success-100', color: 'text-success-600' }
])

const pendingItems = ref([
  { id: 1, siswa: 'Budi Santoso', type: 'absensi', desc: 'Absensi 16 Des 2024' },
  { id: 2, siswa: 'Ani Wijaya', type: 'logbook', desc: 'Logbook: Membuat UI Dashboard' },
  { id: 3, siswa: 'Deni Pratama', type: 'absensi', desc: 'Absensi 15 Des 2024' }
])

const siswaList = ref([
  { id: 1, nama: 'Budi Santoso', kelas: 'XII RPL 1', absensi: 95 },
  { id: 2, nama: 'Ani Wijaya', kelas: 'XII RPL 1', absensi: 88 },
  { id: 3, nama: 'Deni Pratama', kelas: 'XII RPL 2', absensi: 72 },
  { id: 4, nama: 'Siti Aminah', kelas: 'XII TKJ 1', absensi: 90 }
])

// Chart Options
const attendanceChartOptions = {
  chart: { type: 'radialBar' },
  plotOptions: {
    radialBar: {
      hollow: { size: '60%' },
      dataLabels: {
        name: { fontSize: '14px', offsetY: -10 },
        value: { fontSize: '24px', fontWeight: 'bold' }
      }
    }
  },
  labels: ['Rata-rata Kehadiran'],
  colors: ['#0ea5e9']
}

const attendanceChartSeries = [86]

const verificationChartOptions = {
  chart: { type: 'bar', toolbar: { show: false }, stacked: true },
  plotOptions: { bar: { borderRadius: 4, horizontal: true } },
  colors: ['#22c55e', '#f59e0b', '#ef4444'],
  xaxis: { categories: ['Absensi', 'Logbook'] },
  yaxis: { labels: { style: { fontSize: '12px' } } },
  legend: { position: 'top' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9' }
}

const verificationChartSeries = [
  { name: 'Disetujui', data: [45, 38] },
  { name: 'Pending', data: [8, 12] },
  { name: 'Ditolak', data: [2, 3] }
]

onMounted(async () => {
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
})

useHead({ title: 'Dashboard | Mentor' })
</script>
