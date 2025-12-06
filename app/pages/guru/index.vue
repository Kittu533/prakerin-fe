<!-- pages/guru/index.vue -->
<template>
  <div class="bg-white min-h-screen">
    <section class="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-base text-slate-500 mb-6">
        <span class="font-semibold text-blue-600">Dashboard Guru</span>
      </nav>

      <!-- HERO / HEADER -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="flex-1">
            <UBadge color="primary" variant="subtle" size="lg" class="mb-4">
              Dashboard Pembimbing
            </UBadge>
            <h1 class="text-3xl font-bold sm:text-4xl text-slate-900">
              Selamat datang, {{ guruData.nama }}
            </h1>
            <p class="mt-3 max-w-2xl text-lg text-slate-600">
              Pantau progres PKL siswa bimbingan Anda dengan visualisasi data yang komprehensif
            </p>
          </div>

          <div class="flex items-center gap-4 rounded-2xl bg-slate-50 border border-slate-200 px-6 py-4 shrink-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-semibold">
              {{ guruData.inisial }}
            </div>
            <div>
              <p class="font-semibold text-slate-900 text-lg">
                {{ guruData.nama }}
              </p>
              <p class="text-blue-600 text-base">
                {{ guruData.role }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI CARDS -->
      <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Siswa bimbingan aktif -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-blue-50 text-blue-600">
              <UIcon name="i-heroicons-user-group" class="w-8 h-8" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-slate-500 truncate">
                Siswa Bimbingan
              </p>
              <p class="mt-1 text-3xl font-bold text-slate-900">
                {{ summaryData.jumlahSiswaAktif }}
              </p>
              <p class="mt-1 text-base text-slate-500">
                Dari {{ summaryData.jumlahPenempatan }} penempatan
              </p>
            </div>
          </div>
        </div>

        <!-- Rata-rata kehadiran -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-green-50 text-green-600">
              <UIcon name="i-heroicons-check-circle" class="w-8 h-8" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-slate-500 truncate">
                Rata-rata Kehadiran
              </p>
              <p class="mt-1 text-3xl font-bold text-slate-900">
                {{ summaryData.rataRataKehadiran }}%
              </p>
              <p class="mt-1 text-base text-slate-500">
                Seluruh penempatan aktif
              </p>
            </div>
          </div>
        </div>

        <!-- Logbook pending verifikasi -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-yellow-50 text-yellow-600">
              <UIcon name="i-heroicons-clock" class="w-8 h-8" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-slate-500 truncate">
                Logbook Pending
              </p>
              <p class="mt-1 text-3xl font-bold text-slate-900">
                {{ summaryData.logbookPending }}
              </p>
              <p class="mt-1 text-base text-slate-500">
                Perlu verifikasi Anda
              </p>
            </div>
          </div>
        </div>

        <!-- Absensi pending / bermasalah -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-red-50 text-red-600">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-slate-500 truncate">
                Absensi Bermasalah
              </p>
              <p class="mt-1 text-3xl font-bold text-slate-900">
                {{ summaryData.absensiPending }}
              </p>
              <p class="mt-1 text-base text-slate-500">
                Perlu direview
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CHARTS SECTION -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Logbook Status Chart -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">
                Status Verifikasi Logbook
              </h2>
              <p class="text-base text-slate-600 mt-1">
                {{ logbookPendingItems.length }} logbook menunggu verifikasi
              </p>
            </div>
            <UButton
              color="primary"
              variant="outline"
              size="sm"
              @click="goVerifikasiLogbook"
            >
              <UIcon name="i-heroicons-eye" class="w-4 h-4 mr-2" />
              Lihat Detail
            </UButton>
          </div>
          
          <div class="relative h-80">
            <canvas ref="logbookChart" class="w-full h-full"></canvas>
          </div>

          <!-- Legend -->
          <div class="mt-6 grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm font-medium text-slate-900">{{ logbookStats.disetujui }}</p>
              <p class="text-xs text-slate-500">Disetujui</p>
            </div>
            <div class="text-center">
              <div class="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm font-medium text-slate-900">{{ logbookStats.menunggu }}</p>
              <p class="text-xs text-slate-500">Menunggu</p>
            </div>
            <div class="text-center">
              <div class="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm font-medium text-slate-900">{{ logbookStats.ditolak }}</p>
              <p class="text-xs text-slate-500">Ditolak</p>
            </div>
          </div>
        </div>

        <!-- Attendance Chart -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-slate-900">
                Overview Kehadiran Siswa
              </h2>
              <p class="text-base text-slate-600 mt-1">
                {{ absensiIssueItems.length }} absensi perlu ditinjau
              </p>
            </div>
            <UButton
              color="success"
              variant="outline"
              size="sm"
              @click="goVerifikasiAbsensi"
            >
              <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 mr-2" />
              Lihat Detail
            </UButton>
          </div>
          
          <div class="relative h-80">
            <canvas ref="attendanceChart" class="w-full h-full"></canvas>
          </div>

          <!-- Stats -->
          <div class="mt-6 grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm font-medium text-slate-900">{{ attendanceStats.hadir }}</p>
              <p class="text-xs text-slate-500">Hadir</p>
            </div>
            <div class="text-center">
              <div class="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm font-medium text-slate-900">{{ attendanceStats.izin }}</p>
              <p class="text-xs text-slate-500">Izin</p>
            </div>
            <div class="text-center">
              <div class="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm font-medium text-slate-900">{{ attendanceStats.sakit }}</p>
              <p class="text-xs text-slate-500">Sakit</p>
            </div>
            <div class="text-center">
              <div class="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p class="text-sm font-medium text-slate-900">{{ attendanceStats.alpha }}</p>
              <p class="text-xs text-slate-500">Alpha</p>
            </div>
          </div>
        </div>
      </div>

      <!-- QUICK ACCESS CARDS -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Penempatan -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" @click="navigateTo('/guru/penempatan')">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-purple-50 text-purple-600">
              <UIcon name="i-heroicons-map-pin" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">Penempatan</h3>
              <p class="text-base text-slate-500">Kelola penempatan siswa</p>
            </div>
          </div>
        </div>

        <!-- Penilaian -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" @click="navigateTo('/guru/penilaian')">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <UIcon name="i-heroicons-star" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">Penilaian</h3>
              <p class="text-base text-slate-500">Berikan nilai siswa</p>
            </div>
          </div>
        </div>

        <!-- Dokumen -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" @click="navigateTo('/guru/dokumen')">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-teal-50 text-teal-600">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">Dokumen</h3>
              <p class="text-base text-slate-500">Kelola dokumen PKL</p>
            </div>
          </div>
        </div>

        <!-- Laporan Akhir -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" @click="navigateTo('/guru/laporan-akhir')">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-orange-50 text-orange-600">
              <UIcon name="i-heroicons-document-chart-bar" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">Laporan Akhir</h3>
              <p class="text-base text-slate-500">Review laporan siswa</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { 
  GuruProfile, 
  DashboardSummary, 
  LogbookDashboardRow, 
  AbsensiDashboardRow, 
  StatusPersetujuan, 
  StatusAbsensi 
} from '~/types/guru'

// Register Chart.js components
Chart.register(...registerables)

// Import JSON data
import guruProfileData from '~/assets/data/guru_profile.json'
import summaryDataJson from '~/assets/data/guru_summary.json'
import logbookPendingData from '~/assets/data/guru_logbook_pending.json'
import absensiPendingData from '~/assets/data/guru_absensi_pending.json'

definePageMeta({
  layout: 'guru',
  title: 'Dashboard Guru',
})

/* ---------- DATA ---------- */
const guruData: GuruProfile = guruProfileData
const summaryData: DashboardSummary = summaryDataJson
const logbookPendingItems: LogbookDashboardRow[] = logbookPendingData as LogbookDashboardRow[]
const absensiIssueItems: AbsensiDashboardRow[] = absensiPendingData as AbsensiDashboardRow[]

/* ---------- CHART REFERENCES ---------- */
const logbookChart = ref<HTMLCanvasElement>()
const attendanceChart = ref<HTMLCanvasElement>()
let logbookChartInstance: Chart | null = null
let attendanceChartInstance: Chart | null = null

/* ---------- COMPUTED STATS ---------- */
const logbookStats = computed(() => {
  const stats = { disetujui: 0, menunggu: 0, ditolak: 0 }
  
  logbookPendingItems.forEach(item => {
    if (item.status === 'DISETUJUI') stats.disetujui++
    else if (item.status === 'MENUNGGU') stats.menunggu++
    else stats.ditolak++
  })
  
  return stats
})

const attendanceStats = computed(() => {
  const stats = { hadir: 0, izin: 0, sakit: 0, alpha: 0 }
  
  absensiIssueItems.forEach(item => {
    if (item.statusAbsensi === 'HADIR') stats.hadir++
    else if (item.statusAbsensi === 'IZIN') stats.izin++
    else if (item.statusAbsensi === 'SAKIT') stats.sakit++
    else stats.alpha++
  })
  
  return stats
})

/* ---------- NAVIGATION METHODS ---------- */
const goVerifikasiLogbook = () => {
  navigateTo('/guru/verifikasi/logbook')
}

const goVerifikasiAbsensi = () => {
  navigateTo('/guru/verifikasi/absensi')
}

/* ---------- CHART INITIALIZATION ---------- */
const initLogbookChart = () => {
  if (!logbookChart.value) return

  const ctx = logbookChart.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (logbookChartInstance) {
    logbookChartInstance.destroy()
  }

  const stats = logbookStats.value

  logbookChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Disetujui', 'Menunggu', 'Ditolak'],
      datasets: [{
        data: [stats.disetujui, stats.menunggu, stats.ditolak],
        backgroundColor: [
          '#10b981', // green-500
          '#eab308', // yellow-500
          '#ef4444'  // red-500
        ],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = stats.disetujui + stats.menunggu + stats.ditolak
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

const initAttendanceChart = () => {
  if (!attendanceChart.value) return

  const ctx = attendanceChart.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (attendanceChartInstance) {
    attendanceChartInstance.destroy()
  }

  const stats = attendanceStats.value

  attendanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Hadir', 'Izin', 'Sakit', 'Alpha'],
      datasets: [{
        label: 'Jumlah',
        data: [stats.hadir, stats.izin, stats.sakit, stats.alpha],
        backgroundColor: [
          '#10b981', // green-500
          '#3b82f6', // blue-500
          '#eab308', // yellow-500
          '#ef4444'  // red-500
        ],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y || 0
              const total = stats.hadir + stats.izin + stats.sakit + stats.alpha
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
              return `${value} siswa (${percentage}%)`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return Math.floor(Number(value)).toString()
            }
          },
          grid: {
            color: 'rgb(241 245 249)', // slate-100
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  })
}

/* ---------- LIFECYCLE ---------- */
onMounted(async () => {
  await nextTick()
  
  // Initialize charts with delay to ensure DOM is ready
  setTimeout(() => {
    initLogbookChart()
    initAttendanceChart()
  }, 100)
})

// Cleanup
onBeforeUnmount(() => {
  if (logbookChartInstance) {
    logbookChartInstance.destroy()
  }
  if (attendanceChartInstance) {
    attendanceChartInstance.destroy()
  }
})
</script>
