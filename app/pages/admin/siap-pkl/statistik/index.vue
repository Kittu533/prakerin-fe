<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

// 1. Placement Status Chart (Donut)
const placementStatusOptions = {
  chart: { type: 'donut' },
  labels: ['Sudah Penempatan', 'Proses Pengajuan', 'Belum Penempatan'],
  colors: ['#039855', '#F79009', '#D1D5DB'],
  legend: { position: 'bottom' },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Siswa',
            formatter: () => '450'
          }
        }
      }
    }
  }
}
const placementStatusSeries = [320, 80, 50]

// 2. Monthly Trend Chart (Area)
const monthlyTrendOptions = {
  chart: { 
    type: 'area',
    toolbar: { show: false }
  },
  colors: ['#2563EB'],
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul']
  },
  dataLabels: { enabled: false },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [50, 100, 100]
    }
  }
}
const monthlyTrendSeries = [
  { name: 'Siswa Berangkat', data: [30, 45, 120, 80, 60, 40, 20] }
]

// 3. Industry Category Chart (Bar)
const industryCategoryOptions = {
  chart: { type: 'bar', toolbar: { show: false } },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
    }
  },
  colors: ['#0284C7'],
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Teknologi Informasi', 'Otomotif', 'Konstruksi', 'Perhotelan', 'Manufaktur', 'Jasa'],
  }
}
const industryCategorySeries = [
  { name: 'Jumlah Mitra', data: [45, 32, 28, 20, 18, 15] }
]

// 4. Department Distribution (Radial Bar)
const deptDistributionOptions = {
  chart: { type: 'radialBar' },
  plotOptions: {
    radialBar: {
      offsetY: 0,
      startAngle: 0,
      endAngle: 270,
      hollow: {
        margin: 5,
        size: '30%',
        background: 'transparent',
        image: undefined,
      },
      dataLabels: {
        name: { show: false },
        value: { show: false },
      }
    }
  },
  colors: ['#1E1B4B', '#2563EB', '#3B82F6', '#60A5FA'],
  labels: ['PPLG', 'TKR', 'TEK', 'TME'],
  legend: {
    show: true,
    floating: true,
    fontSize: '12px',
    position: 'left',
    offsetX: 0,
    offsetY: 15,
    labels: { useSeriesColors: true },
    markers: { size: 0 },
    formatter: function(seriesName: string, opts: any) {
      return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
    },
    itemMargin: { vertical: 3 }
  }
}
const deptDistributionSeries = [76, 67, 61, 90]

// Filters
const selectedYear = ref('2025/2026')
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <!-- Header Section -->
    <div class="bg-white rounded-3xl shadow-sm p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-6">
        <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-100 shadow-inner">
          <img src="/assets/img/logo-skanda.png" alt="Logo" class="w-14 h-14 object-contain" />
        </div>
        <div>
          <h1 class="text-3xl font-black text-blue-600 tracking-tight uppercase">STATISTIK & ANALITIK PKL</h1>
          <div class="flex items-center gap-3 mt-1">
            <span class="bg-blue-600 text-white text-[10px] px-4 py-1 rounded font-black uppercase tracking-widest">SMK GITA LARAS</span>
            <div class="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
              <Icon name="lucide:calendar" class="w-4 h-4" />
              Tahun Ajaran {{ selectedYear }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <select v-model="selectedYear" class="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
          <option>2025/2026</option>
          <option>2024/2025</option>
        </select>
        <button class="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95">
          <Icon name="lucide:download" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, idx) in [
        { label: 'Total Siswa', value: '450', color: 'blue', icon: 'lucide:users' },
        { label: 'Siswa PKL', value: '320', color: 'green', icon: 'lucide:user-check' },
        { label: 'Total Mitra', value: '158', color: 'indigo', icon: 'lucide:building-2' },
        { label: 'MoU Aktif', value: '142', color: 'amber', icon: 'lucide:file-signature' }
      ]" :key="idx" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div :class="`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`">
            <Icon :name="stat.icon" :class="`w-6 h-6 text-${stat.color}-600`" />
          </div>
          <span class="text-xs font-black text-green-500 bg-green-50 px-2 py-1 rounded">+12%</span>
        </div>
        <div class="mt-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ stat.label }}</p>
          <p class="text-3xl font-black text-slate-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 1. Status Penempatan -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Icon name="lucide:pie-chart" class="w-4 h-4 text-blue-600" />
            Status Penempatan Siswa
          </h2>
        </div>
        <div class="min-h-[300px] flex items-center justify-center">
          <ClientOnly>
            <apexchart
              width="100%"
              height="350"
              :options="placementStatusOptions"
              :series="placementStatusSeries"
            ></apexchart>
          </ClientOnly>
        </div>
      </div>

      <!-- 2. Tren Keberangkatan -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Icon name="lucide:trending-up" class="w-4 h-4 text-blue-600" />
            Tren Keberangkatan Bulanan
          </h2>
        </div>
        <div class="min-h-[300px]">
          <ClientOnly>
            <apexchart
              width="100%"
              height="350"
              :options="monthlyTrendOptions"
              :series="monthlyTrendSeries"
            ></apexchart>
          </ClientOnly>
        </div>
      </div>

      <!-- 3. Distribusi Bidang Industri -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Icon name="lucide:bar-chart-2" class="w-4 h-4 text-blue-600" />
            Distribusi Bidang Industri
          </h2>
        </div>
        <div class="min-h-[300px]">
          <ClientOnly>
            <apexchart
              width="100%"
              height="350"
              :options="industryCategoryOptions"
              :series="industryCategorySeries"
            ></apexchart>
          </ClientOnly>
        </div>
      </div>

      <!-- 4. Penempatan per Jurusan -->
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Icon name="lucide:layout-grid" class="w-4 h-4 text-blue-600" />
            Persentase Penempatan per Jurusan
          </h2>
        </div>
        <div class="min-h-[300px] flex items-center justify-center">
          <ClientOnly>
            <apexchart
              width="100%"
              height="350"
              :options="deptDistributionOptions"
              :series="deptDistributionSeries"
            ></apexchart>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center py-4">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TIM KEMITRAAN &copy; 2026 | SMKN 7 SEMARANG</p>
    </div>
  </div>
</template>

<style scoped>
.apexcharts-canvas {
  margin: 0 auto;
}
</style>
