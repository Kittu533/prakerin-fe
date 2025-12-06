

<template>
  <div class="bg-white min-h-screen">
    <section v-if="laporan" class="space-y-6 sm:space-y-8 p-4 sm:p-6">
      <!-- BREADCRUMB & HEADER -->
      <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-base text-slate-500 mb-6">
          <NuxtLink to="/guru" class="hover:text-blue-600 transition-colors">
            Dashboard
          </NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
          <NuxtLink to="/guru/laporan-akhir" class="hover:text-blue-600 transition-colors">
            Laporan Akhir
          </NuxtLink>
          <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
          <span class="text-slate-900 font-medium">{{ laporan.laporanId }}</span>
        </nav>

        <!-- Header Section -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="space-y-4">
            <UBadge 
              :color="getStatusColor(laporan.statusLaporan)" 
              variant="subtle" 
              size="lg"
            >
              {{ getStatusLabel(laporan.statusLaporan) }}
            </UBadge>
            
            <div>
              <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">
                Detail Laporan Akhir
              </h1>
              <p class="text-lg text-slate-600 mt-2">
                {{ laporan.namaSiswa }} • {{ laporan.kelas }}
              </p>
            </div>

            <div class="flex items-center gap-4 text-base text-slate-600">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-building-office" class="w-5 h-5" />
                <span>{{ laporan.perusahaan }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-calendar" class="w-5 h-5" />
                <span>ID: {{ laporan.laporanId }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              @click="navigateTo('/guru/laporan-akhir')"
            >
              <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
              Kembali
            </UButton>
            
            <UButton
              color="primary"
              size="lg"
              @click="downloadReport"
              :loading="downloadLoading"
            >
              <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 mr-2" />
              {{ downloadLoading ? 'Menyiapkan...' : 'Download PDF' }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- OVERVIEW CARDS -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <!-- Status Laporan -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-blue-50">
              <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">
                Status Laporan
              </h3>
              <p class="text-2xl font-bold text-slate-900 mt-1">
                {{ getStatusLabel(laporan.statusLaporan) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Nilai Akhir -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-green-50">
              <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">
                Nilai Akhir
              </h3>
              <p class="text-2xl font-bold text-slate-900 mt-1">
                {{ laporan.nilaiAkhir ? `${laporan.nilaiAkhir.toFixed(1)} (${laporan.grade})` : '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Kehadiran -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-emerald-50">
              <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">
                Kehadiran
              </h3>
              <p class="text-2xl font-bold text-emerald-600 mt-1">
                {{ laporan.persentaseKehadiran.toFixed(1) }}%
              </p>
              <p class="text-sm text-slate-500">
                {{ laporan.totalKehadiran }}/{{ laporan.totalHariKerja }} hari
              </p>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-purple-50">
              <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900">
                Progress PKL
              </h3>
              <p class="text-2xl font-bold text-purple-600 mt-1">
                {{ getProgressPercentage(laporan.statusLaporan) }}%
              </p>
              <p class="text-sm text-slate-500">
                Tahap {{ getStatusLabel(laporan.statusLaporan) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- CHARTS & DETAIL SECTION -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Attendance Chart -->
        <div class="lg:col-span-1">
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-full">
            <h3 class="text-lg font-bold text-slate-900 mb-4">
              Grafik Kehadiran
            </h3>
            <div class="relative h-64">
              <canvas ref="attendanceChart" class="w-full h-full"></canvas>
            </div>
            <div class="mt-4 space-y-2">
              <div class="flex justify-between items-center text-base">
                <span class="text-slate-600">Hadir</span>
                <span class="font-semibold text-green-600">{{ laporan.totalKehadiran }} hari</span>
              </div>
              <div class="flex justify-between items-center text-base">
                <span class="text-slate-600">Tidak Hadir</span>
                <span class="font-semibold text-red-600">{{ laporan.totalHariKerja - laporan.totalKehadiran }} hari</span>
              </div>
              <div class="flex justify-between items-center text-base">
                <span class="text-slate-600">Total Hari</span>
                <span class="font-semibold text-slate-900">{{ laporan.totalHariKerja }} hari</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informasi Siswa -->
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 mb-4">
              Informasi Siswa
            </h3>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="text-base font-medium text-slate-700">Nama Lengkap</label>
                <p class="text-base text-slate-900 mt-1">{{ laporan.namaSiswa }}</p>
              </div>
              <div>
                <label class="text-base font-medium text-slate-700">Kelas</label>
                <p class="text-base text-slate-900 mt-1">{{ laporan.kelas }}</p>
              </div>
              <div>
                <label class="text-base font-medium text-slate-700">Perusahaan PKL</label>
                <p class="text-base text-slate-900 mt-1">{{ laporan.perusahaan }}</p>
              </div>
              <div>
                <label class="text-base font-medium text-slate-700">ID Laporan</label>
                <p class="text-base text-slate-900 mt-1">{{ laporan.laporanId }}</p>
              </div>
            </div>
          </div>

          <!-- Progress Timeline -->
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 class="text-lg font-bold text-slate-900 mb-4">
              Timeline Progress
            </h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-check" class="w-4 h-4 text-green-600" />
                </div>
                <div class="flex-1">
                  <p class="text-base font-medium text-slate-900">Draft Laporan</p>
                  <p class="text-sm text-slate-500">Laporan telah dibuat</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  getTimelineStatus(laporan.statusLaporan, 'REVIEW')
                ]">
                  <UIcon name="i-heroicons-eye" class="w-4 h-4" />
                </div>
                <div class="flex-1">
                  <p class="text-base font-medium text-slate-900">Review Pembimbing</p>
                  <p class="text-sm text-slate-500">Sedang dalam tahap review</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  getTimelineStatus(laporan.statusLaporan, 'FINAL')
                ]">
                  <UIcon name="i-heroicons-document-check" class="w-4 h-4" />
                </div>
                <div class="flex-1">
                  <p class="text-base font-medium text-slate-900">Laporan Final</p>
                  <p class="text-sm text-slate-500">Laporan telah disetujui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DOWNLOAD SECTION -->
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 class="text-lg font-bold text-slate-900 mb-4">
          Download & Export
        </h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UButton
            color="error"
            variant="outline"
            size="lg"
            class="justify-center"
            @click="downloadPDF"
            :loading="pdfLoading"
          >
            <UIcon name="i-heroicons-document" class="w-5 h-5 mr-2" />
            {{ pdfLoading ? 'Menyiapkan...' : 'Download PDF' }}
          </UButton>
          
          <UButton
            color="success"
            variant="outline"
            size="lg"
            class="justify-center"
            @click="downloadExcel"
            :loading="excelLoading"
          >
            <UIcon name="i-heroicons-table-cells" class="w-5 h-5 mr-2" />
            {{ excelLoading ? 'Menyiapkan...' : 'Download Excel' }}
          </UButton>
          
          <UButton
            color="primary"
            variant="outline"
            size="lg"
            class="justify-center"
            @click="printReport"
          >
            <UIcon name="i-heroicons-printer" class="w-5 h-5 mr-2" />
            Print Laporan
          </UButton>
          
          <UButton
            color="warning"
            variant="outline"
            size="lg"
            class="justify-center"
            @click="shareReport"
          >
            <UIcon name="i-heroicons-share" class="w-5 h-5 mr-2" />
            Share
          </UButton>
        </div>
      </div>
    </section>

    <!-- NOT FOUND STATE -->
    <section v-else class="p-4 sm:p-6">
      <div class="rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-100">
        <div class="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-600" />
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">
          Data Laporan Tidak Ditemukan
        </h2>
        <p class="text-base text-slate-600 mb-6">
          Laporan dengan ID tersebut tidak ditemukan dalam sistem.
        </p>
        <UButton
          color="primary"
          size="lg"
          @click="navigateTo('/guru/laporan-akhir')"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5 mr-2" />
          Kembali ke Daftar Laporan
        </UButton>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import laporanData from '~/assets/data/guru_laporan_akhir.json'
import type { StatusLaporan, LaporanRow } from '~/types/laporan-akhir'

// Register Chart.js components
Chart.register(...registerables)

definePageMeta({
  layout: 'guru',
  title: 'Detail Laporan Akhir PKL'
})

const route = useRoute()
const id = computed(() => {
  const paramId = route.params.id as string
  // Extract numeric ID from LAP-001 format
  if (paramId.startsWith('LAP-')) {
    return Number(paramId.replace('LAP-', ''))
  }
  return Number(paramId)
})

const laporan = computed(() => {
  const item = (laporanData.items as LaporanRow[]).find((l) => l.idLaporan === id.value)
  if (item) {
    return {
      ...item,
      laporanId: `LAP-${String(item.idLaporan).padStart(3, '0')}`
    }
  }
  return null
})

// Chart reference
const attendanceChart = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

// Loading states
const downloadLoading = ref(false)
const pdfLoading = ref(false)
const excelLoading = ref(false)

// Helper functions
const getStatusColor = (status: StatusLaporan) => {
  switch (status) {
    case 'DRAFT': return 'neutral'
    case 'REVIEW': return 'warning'
    case 'FINAL': return 'success'
    default: return 'neutral'
  }
}

const getStatusLabel = (status: StatusLaporan) => {
  switch (status) {
    case 'DRAFT': return 'Draft'
    case 'REVIEW': return 'Review'
    case 'FINAL': return 'Final'
    default: return status
  }
}

const getProgressPercentage = (status: StatusLaporan) => {
  switch (status) {
    case 'DRAFT': return 33
    case 'REVIEW': return 66
    case 'FINAL': return 100
    default: return 0
  }
}

const getTimelineStatus = (currentStatus: StatusLaporan, targetStatus: StatusLaporan) => {
  const statusOrder = { 'DRAFT': 1, 'REVIEW': 2, 'FINAL': 3 }
  const current = statusOrder[currentStatus] || 0
  const target = statusOrder[targetStatus] || 0
  
  if (current >= target) {
    return 'bg-green-100 text-green-600'
  } else if (current === target - 1) {
    return 'bg-yellow-100 text-yellow-600'
  } else {
    return 'bg-slate-100 text-slate-400'
  }
}

// Chart initialization
const initAttendanceChart = () => {
  if (!attendanceChart.value || !laporan.value) return

  const ctx = attendanceChart.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const hadir = laporan.value.totalKehadiran
  const tidakHadir = laporan.value.totalHariKerja - laporan.value.totalKehadiran

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Hadir', 'Tidak Hadir'],
      datasets: [{
        data: [hadir, tidakHadir],
        backgroundColor: [
          '#10b981', // green-500
          '#ef4444'  // red-500
        ],
        borderWidth: 0,
        hoverOffset: 4
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
              const percentage = ((value / laporan.value!.totalHariKerja) * 100).toFixed(1)
              return `${label}: ${value} hari (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

// Download functions
const downloadReport = async () => {
  downloadLoading.value = true
  try {
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log(`Downloading report for: ${laporan.value?.namaSiswa} - ${laporan.value?.laporanId}`)
    
    // Here you would implement actual download logic
    alert(`Laporan ${laporan.value?.laporanId} - ${laporan.value?.namaSiswa} berhasil diunduh!`)
  } catch (error) {
    console.error('Download failed:', error)
  } finally {
    downloadLoading.value = false
  }
}

const downloadPDF = async () => {
  pdfLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert(`PDF Laporan ${laporan.value?.laporanId} berhasil diunduh!`)
  } catch (error) {
    console.error('PDF download failed:', error)
  } finally {
    pdfLoading.value = false
  }
}

const downloadExcel = async () => {
  excelLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert(`Excel Laporan ${laporan.value?.laporanId} berhasil diunduh!`)
  } catch (error) {
    console.error('Excel download failed:', error)
  } finally {
    excelLoading.value = false
  }
}

const printReport = () => {
  window.print()
}

const shareReport = () => {
  if (navigator.share) {
    navigator.share({
      title: `Laporan PKL - ${laporan.value?.namaSiswa}`,
      text: `Laporan Akhir PKL ${laporan.value?.namaSiswa} - ${laporan.value?.kelas}`,
      url: window.location.href
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    alert('Link laporan berhasil disalin ke clipboard!')
  }
}

// Lifecycle
onMounted(async () => {
  await nextTick()
  if (laporan.value) {
    initAttendanceChart()
  }
})

// Cleanup
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>