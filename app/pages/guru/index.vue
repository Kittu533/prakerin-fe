<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-sky-500 rounded-2xl p-6 text-white">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Dashboard Aktif
          </div>
          <h1 v-if="!loading" class="text-2xl lg:text-3xl font-bold mb-1">Selamat {{ greeting }}, {{ guru.nama }}</h1>
          <USkeleton v-else class="h-9 w-72 mb-2" :ui="{ background: 'bg-white/20' }" />
          <p class="text-sky-100">{{ currentDate }}</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="hidden lg:block text-right">
            <p class="text-sky-200 text-sm">Periode PKL</p>
            <p class="font-semibold">Juli - Desember 2024</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
            {{ guru.inisial }}
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-5 border border-slate-200">
          <USkeleton class="h-4 w-20 mb-3" />
          <USkeleton class="h-8 w-16 mb-2" />
          <USkeleton class="h-3 w-24" />
        </div>
      </template>
      <template v-else>
        <div
          class="bg-white rounded-xl p-5 border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
          @click="navigateTo('/guru/siswa-bimbingan')">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 rounded-lg bg-sky-100 text-sky-600">
              <Icon name="lucide:users" class="w-5 h-5" />
            </div>
            <Icon name="lucide:arrow-up-right" class="w-4 h-4 text-slate-400" />
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ stats.totalSiswa }}</p>
          <p class="text-sm text-slate-500">Siswa Bimbingan</p>
        </div>

        <div
          class="bg-white rounded-xl p-5 border border-slate-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
          @click="navigateTo('/guru/absensi')">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 rounded-lg bg-green-100 text-green-600">
              <Icon name="lucide:bar-chart-3" class="w-5 h-5" />
            </div>
            <UBadge color="success" variant="subtle" size="xs">{{ stats.kehadiran }}%</UBadge>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ stats.kehadiran }}%</p>
          <p class="text-sm text-slate-500">Rata-rata Kehadiran</p>
        </div>

        <div
          class="bg-white rounded-xl p-5 border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer"
          @click="navigateTo('/guru/verifikasi-logbook')">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Icon name="lucide:book-open" class="w-5 h-5" />
            </div>
            <UBadge v-if="stats.logbookPending" color="warning" variant="subtle" size="xs">Pending</UBadge>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ stats.logbookPending }}</p>
          <p class="text-sm text-slate-500">Logbook Pending</p>
        </div>

        <div
          class="bg-white rounded-xl p-5 border border-slate-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
          @click="navigateTo('/guru/absensi')">
          <div class="flex items-center justify-between mb-3">
            <div class="p-2 rounded-lg bg-red-100 text-red-600">
              <Icon name="lucide:alert-circle" class="w-5 h-5" />
            </div>
            <UBadge v-if="stats.absensiPending" color="error" variant="subtle" size="xs">{{ stats.absensiPending }} baru
            </UBadge>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ stats.absensiPending }}</p>
          <p class="text-sm text-slate-500">Absensi Pending</p>
        </div>
      </template>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Kehadiran Siswa Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-900 mb-4">Kehadiran Siswa Mingguan</h2>
        <div v-if="loading">
          <USkeleton class="h-64 rounded-lg" />
        </div>
        <ClientOnly v-else>
          <apexchart type="bar" height="250" :options="attendanceChartOptions" :series="attendanceChartSeries" />
        </ClientOnly>
      </div>

      <!-- Logbook Status Chart -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="font-semibold text-slate-900 mb-4">Status Logbook Siswa</h2>
        <div v-if="loading">
          <USkeleton class="h-64 rounded-lg" />
        </div>
        <ClientOnly v-else>
          <apexchart type="donut" height="250" :options="logbookChartOptions" :series="logbookChartSeries" />
        </ClientOnly>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Left -->
      <div class="xl:col-span-2 space-y-6">
        <!-- Quick Actions -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100">
            <h2 class="font-semibold text-slate-900">Menu Cepat</h2>
            <p class="text-xs text-slate-500">Akses semua fitur dengan cepat</p>
          </div>
          <div class="p-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            <NuxtLink to="/guru/verifikasi-logbook"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-sky-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:book-open" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">Logbook</span>
            </NuxtLink>

            <NuxtLink to="/guru/absensi"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:calendar-check" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">Absensi</span>
            </NuxtLink>

            <NuxtLink to="/guru/penilaian-nilai"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-amber-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:award" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">Nilai PKL</span>
            </NuxtLink>

            <NuxtLink to="/guru/siswa-bimbingan"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-indigo-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:users" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">Siswa</span>
            </NuxtLink>

            <!-- Menu tidak ada di bottom nav -->
            <NuxtLink to="/guru/penempatan"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:building-2" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">Penempatan</span>
            </NuxtLink>

            <NuxtLink to="/guru/kunjungan"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:map-pin" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">Kunjungan</span>
            </NuxtLink>

            <NuxtLink to="/guru/laporan-akhir"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-teal-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:file-text" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">Laporan Akhir</span>
            </NuxtLink>

            <NuxtLink to="/guru/kunjungan/create"
              class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-rose-50 transition-all group">
              <div
                class="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon name="lucide:plus-circle" class="w-6 h-6" />
              </div>
              <span class="text-xs font-medium text-slate-700 text-center">+ Kunjungan</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Students Table -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="font-semibold text-slate-900">Siswa Bimbingan</h2>
              <p class="text-sm text-slate-500">Daftar siswa PKL yang Anda bimbing</p>
            </div>
            <UButton to="/guru/siswa-bimbingan" variant="ghost" color="primary" size="sm"
              trailing-icon="i-lucide-arrow-right">
              Lihat Semua
            </UButton>
          </div>

          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 p-3">
              <USkeleton class="w-10 h-10 rounded-xl" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>
              <USkeleton class="h-6 w-16 rounded-full" />
            </div>
          </div>

          <div v-else class="divide-y divide-slate-100">
            <div v-for="siswa in students" :key="siswa.id"
              class="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
              @click="navigateTo(`/guru/siswa-bimbingan/${siswa.id}`)">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm"
                :class="siswa.status === 'Aktif' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'">
                {{ siswa.inisial }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900 truncate">{{ siswa.nama }}</p>
                <p class="text-sm text-slate-500">{{ siswa.kelas }} • {{ siswa.industri }}</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="hidden sm:flex items-center gap-1.5">
                  <div class="w-8 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" :class="siswa.kehadiran >= 80 ? 'bg-green-500' : 'bg-red-500'"
                      :style="{ width: `${siswa.kehadiran}%` }" />
                  </div>
                  <span class="text-xs font-medium"
                    :class="siswa.kehadiran >= 80 ? 'text-green-600' : 'text-red-600'">{{
                    siswa.kehadiran }}%</span>
                </div>
                <UBadge :color="siswa.status === 'Aktif' ? 'success' : 'neutral'" variant="subtle" size="xs">{{
                  siswa.status
                  }}</UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="space-y-6">
        <!-- Notifications -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">Notifikasi</h2>
            <UBadge v-if="notifications.length" color="error" variant="solid" size="xs">{{ notifications.length }}
            </UBadge>
          </div>

          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="i in 3" :key="i" class="flex gap-3">
              <USkeleton class="w-8 h-8 rounded-lg shrink-0" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-full" />
                <USkeleton class="h-3 w-20" />
              </div>
            </div>
          </div>

          <div v-else class="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            <div v-for="notif in notifications" :key="notif.id"
              class="px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
              <div class="flex gap-3">
                <div class="p-2 rounded-lg shrink-0" :class="notifStyle[notif.type]">
                  <Icon :name="notif.icon" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-700">{{ notif.message }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ notif.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity -->
        <div class="bg-white rounded-xl border border-slate-200">
          <div class="px-5 py-4 border-b border-slate-100">
            <h2 class="font-semibold text-slate-900">Ringkasan Aktivitas</h2>
          </div>
          <div v-if="loading" class="p-5 space-y-4">
            <USkeleton v-for="i in 3" :key="i" class="h-4 w-full" />
          </div>
          <div v-else class="p-5 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-green-500" />
                <span class="text-sm text-slate-600">Kunjungan Bulan Ini</span>
              </div>
              <span class="font-semibold text-slate-900">{{ activity.kunjungan }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-sky-500" />
                <span class="text-sm text-slate-600">Logbook Diverifikasi</span>
              </div>
              <span class="font-semibold text-slate-900">{{ activity.logbook }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500" />
                <span class="text-sm text-slate-600">Nilai Diinput</span>
              </div>
              <span class="font-semibold text-slate-900">{{ activity.nilai }}</span>
            </div>
          </div>
        </div>

        <!-- Schedule -->
        <div class="bg-sky-500 rounded-xl p-5 text-white">
          <div class="flex items-center gap-2 mb-4">
            <Icon name="lucide:calendar" class="w-5 h-5" />
            <h3 class="font-semibold">Jadwal Kunjungan</h3>
          </div>
          <div v-if="nextVisit">
            <p class="text-sky-100 text-sm">Kunjungan berikutnya</p>
            <p class="font-semibold text-lg">{{ nextVisit.industri }}</p>
            <div class="flex items-center gap-2 text-sm text-sky-100 mt-1">
              <Icon name="lucide:clock" class="w-4 h-4" />
              <span>{{ nextVisit.tanggal }}</span>
            </div>
          </div>
          <div v-else class="text-sky-100 text-sm">Belum ada jadwal</div>
          <UButton to="/guru/kunjungan/create" color="white" variant="soft" size="sm" class="mt-4 w-full">
            <Icon name="lucide:plus" class="w-4 h-4 mr-1" />
            Tambah Jadwal
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuruApi } from '~/composables/api/use-guru'
import { usePenempatanApi, useLogbookApi, useAbsensiApi } from '~/composables/api/use-internship'

definePageMeta({ layout: 'guru' })

const { getSiswaBimbingan, getDashboardStats } = useGuruApi()
const { getAll: getPenempatan } = usePenempatanApi()
const { getAll: getLogbooks } = useLogbookApi()
const { getAll: getAbsensi } = useAbsensiApi()

const loading = ref(true)
const guru = reactive({ nama: '', inisial: '' })
const stats = reactive({ totalSiswa: 0, kehadiran: 0, logbookPending: 0, absensiPending: 0 })
const activity = reactive({ kunjungan: 0, logbook: 0, nilai: 0 })
const notifications = ref<any[]>([])
const students = ref<any[]>([])
const nextVisit = ref<{ industri: string; tanggal: string } | null>(null)

// Get auth user from store or cookie
const authUser = useCookie('auth_user')

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Pagi' : h < 15 ? 'Siang' : h < 18 ? 'Sore' : 'Malam'
})

const currentDate = computed(() => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

const notifStyle = {
  warning: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600',
  success: 'bg-green-100 text-green-600',
  info: 'bg-sky-100 text-sky-600'
}

// Helper function to get initials
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Chart Options
const attendanceChartOptions = {
  chart: { type: 'bar', toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
  colors: ['#0ea5e9', '#22c55e'],
  xaxis: { categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] },
  yaxis: { max: 30, labels: { formatter: (val: number) => Math.round(val).toString() } },
  legend: { position: 'top' },
  dataLabels: { enabled: false },
  grid: { borderColor: '#f1f5f9' }
}

const attendanceChartSeries = ref([
  { name: 'Hadir', data: [0, 0, 0, 0, 0, 0] },
  { name: 'Tidak Hadir', data: [0, 0, 0, 0, 0, 0] }
])

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

const logbookChartSeries = ref([0, 0, 0])

async function fetchDashboardData() {
  try {
    // Get auth user info
    const user = authUser.value ? (typeof authUser.value === 'string' ? JSON.parse(authUser.value) : authUser.value) : null
    if (user) {
      guru.nama = user.nama || user.identifier || 'Guru'
      guru.inisial = getInitials(guru.nama)
    }

    // Fetch penempatan (siswa bimbingan) - fallback to getPenempatan if getSiswaBimbingan not available
    try {
      const penempatanRes = await getPenempatan({ limit: 10, status: 'aktif' })
      if (penempatanRes?.data) {
        students.value = penempatanRes.data.map((p: any) => ({
          id: p.id_penempatan,
          nama: p.siswa?.nama_siswa || 'Unknown',
          inisial: getInitials(p.siswa?.nama_siswa || 'U'),
          kelas: p.siswa?.kelas?.nama_kelas || '-',
          industri: p.perusahaan?.nama_perusahaan || '-',
          kehadiran: p.kehadiran_persen || 85, // Fallback if not computed
          status: p.status_penempatan === 'aktif' ? 'Aktif' : 'Selesai'
        }))
        stats.totalSiswa = penempatanRes.pagination?.total || students.value.length
      }
    } catch (e) {
      console.warn('Failed to fetch penempatan:', e)
      // Use fallback data if API fails
      students.value = []
      stats.totalSiswa = 0
    }

    // Fetch logbooks pending
    try {
      const logbookRes = await getLogbooks({ status: 'pending', limit: 100 })
      stats.logbookPending = logbookRes?.pagination?.total || logbookRes?.data?.length || 0
      
      // Also get approved and revision for chart
      const approvedRes = await getLogbooks({ status: 'approved', limit: 1 })
      const revisionRes = await getLogbooks({ status: 'revision', limit: 1 })
      logbookChartSeries.value = [
        approvedRes?.pagination?.total || 0,
        stats.logbookPending,
        revisionRes?.pagination?.total || 0
      ]
    } catch (e) {
      console.warn('Failed to fetch logbooks:', e)
    }

    // Fetch absensi pending validation
    try {
      const absensiRes = await getAbsensi({ validasi_guru: false, limit: 100 })
      stats.absensiPending = absensiRes?.pagination?.total || absensiRes?.data?.length || 0
    } catch (e) {
      console.warn('Failed to fetch absensi:', e)
    }

    // Calculate average attendance (simplified)
    stats.kehadiran = students.value.length > 0 
      ? Math.round(students.value.reduce((sum, s) => sum + s.kehadiran, 0) / students.value.length)
      : 0

    // Generate notifications based on data
    notifications.value = []
    if (stats.logbookPending > 0) {
      notifications.value.push({
        id: 1, 
        type: 'warning', 
        icon: 'lucide:clock', 
        message: `${stats.logbookPending} logbook menunggu verifikasi`, 
        time: 'Baru saja'
      })
    }
    if (stats.absensiPending > 0) {
      notifications.value.push({
        id: 2, 
        type: 'info', 
        icon: 'lucide:calendar-check', 
        message: `${stats.absensiPending} absensi perlu validasi`, 
        time: 'Baru saja'
      })
    }
    // Check for low attendance
    const lowAttendance = students.value.filter(s => s.kehadiran < 80)
    if (lowAttendance.length > 0) {
      notifications.value.push({
        id: 3, 
        type: 'error', 
        icon: 'lucide:alert-triangle', 
        message: `${lowAttendance.length} siswa kehadiran < 80%`, 
        time: 'Perlu perhatian'
      })
    }

    // Activity summary (simplified counts)
    activity.logbook = logbookChartSeries.value[0] // approved count
    activity.nilai = 0 // Would need separate API call
    activity.kunjungan = 0 // Would need monitoring API

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

useHead({ title: 'Dashboard | Guru PKL' })
</script>
