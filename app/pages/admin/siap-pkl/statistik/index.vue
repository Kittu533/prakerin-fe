<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  useReportingApi,
  type PklStatisticsOverview,
} from "~/composables/api/use-reporting-api";

definePageMeta({
  layout: "admin",
});

const toast = useToast();
const reportingApi = useReportingApi();

const loading = ref(true);
const selectedYearId = ref("");
const statistics = ref<PklStatisticsOverview | null>(null);

const selectedYearLabel = computed(
  () =>
    statistics.value?.academic_years.find((year) => year.id === selectedYearId.value)?.label ||
    statistics.value?.active_year?.label ||
    "-",
);

const quickStats = computed(() => {
  const data = statistics.value?.quick_stats;

  return [
    {
      label: "Total Siswa",
      value: data?.total_students || 0,
      caption: "Siswa aktif pada tahun ajaran",
      tone: "bg-blue-50 text-blue-600",
      icon: "lucide:users",
    },
    {
      label: "Siswa PKL",
      value: data?.placed_students || 0,
      caption: `${data?.pending_applications || 0} masih proses pengajuan`,
      tone: "bg-emerald-50 text-emerald-600",
      icon: "lucide:user-check",
    },
    {
      label: "Total Mitra",
      value: data?.total_companies || 0,
      caption: `${data?.active_companies || 0} kerja sama aktif`,
      tone: "bg-indigo-50 text-indigo-600",
      icon: "lucide:building-2",
    },
    {
      label: "MoU Aktif",
      value: data?.active_mous || 0,
      caption: "Berlaku sampai hari ini",
      tone: "bg-amber-50 text-amber-600",
      icon: "lucide:file-signature",
    },
  ];
});

// 1. Placement Status Chart (Donut)
const placementStatusOptions = computed(() => ({
  chart: { type: "donut" },
  labels: ["Sudah Penempatan", "Proses Pengajuan", "Belum Penempatan"],
  colors: ["#039855", "#F79009", "#D1D5DB"],
  legend: { position: "bottom" },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total Siswa",
            formatter: () => String(statistics.value?.quick_stats.total_students || 0),
          },
        },
      },
    },
  },
}));
const placementStatusSeries = computed(() => {
  const data = statistics.value?.placement_status;
  return [data?.placed || 0, data?.pending_applications || 0, data?.unplaced || 0];
});

// 2. Monthly Trend Chart (Area)
const monthlyTrendOptions = computed(() => ({
  chart: {
    type: "area",
    toolbar: { show: false }
  },
  colors: ["#2563EB"],
  stroke: { curve: "smooth", width: 2 },
  xaxis: {
    categories: statistics.value?.monthly_trend.map((item) => item.label) || [],
  },
  dataLabels: { enabled: false },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [50, 100, 100]
    }
  }
}));
const monthlyTrendSeries = computed(() => [
  {
    name: "Siswa Berangkat",
    data: statistics.value?.monthly_trend.map((item) => item.count) || [],
  },
]);

// 3. Industry Category Chart (Bar)
const industryCategoryOptions = computed(() => ({
  chart: { type: "bar", toolbar: { show: false } },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
    }
  },
  colors: ["#0284C7"],
  dataLabels: { enabled: false },
  xaxis: {
    categories: statistics.value?.industry_categories.map((item) => item.label) || [],
  },
}));
const industryCategorySeries = computed(() => [
  {
    name: "Jumlah Mitra",
    data: statistics.value?.industry_categories.map((item) => item.count) || [],
  },
]);

// 4. Department Distribution (Radial Bar)
const deptDistributionOptions = computed(() => ({
  chart: { type: "radialBar" },
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
  colors: ["#1E1B4B", "#2563EB", "#3B82F6", "#60A5FA", "#0F766E", "#F59E0B", "#DB2777", "#64748B"],
  labels: statistics.value?.department_distribution.map((item) => item.label) || [],
  legend: {
    show: true,
    floating: true,
    fontSize: "12px",
    position: "left",
    offsetX: 0,
    offsetY: 15,
    labels: { useSeriesColors: true },
    markers: { size: 0 },
    formatter: function(seriesName: string, opts: any) {
      const item = statistics.value?.department_distribution[opts.seriesIndex];
      return `${seriesName}: ${item?.count || 0} siswa`;
    },
    itemMargin: { vertical: 3 }
  }
}));
const deptDistributionSeries = computed(
  () => statistics.value?.department_distribution.map((item) => item.percentage) || [],
);

async function loadStatistics() {
  loading.value = true;

  try {
    const response = await reportingApi.getPklStatistics({
      tahun_ajaran_id: selectedYearId.value || undefined,
    });

    statistics.value = response.data;

    if (!selectedYearId.value && response.data.active_year) {
      selectedYearId.value = response.data.active_year.id;
    }
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat statistik PKL",
      description: error?.data?.message || error?.message || "Terjadi kesalahan saat memuat data",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStatistics();
});
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
              Tahun Ajaran {{ selectedYearLabel }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <select
          v-model="selectedYearId"
          class="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          @change="loadStatistics"
        >
          <option
            v-for="year in statistics?.academic_years || []"
            :key="year.id"
            :value="year.id"
          >
            {{ year.label }}
          </option>
        </select>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          @click="loadStatistics"
        >
          <Icon name="lucide:refresh-cw" class="w-5 h-5" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, idx) in quickStats" :key="idx" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="stat.tone">
            <Icon :name="stat.icon" class="w-6 h-6" />
          </div>
          <span class="text-xs font-black text-slate-500 bg-slate-50 px-2 py-1 rounded">Live</span>
        </div>
        <div class="mt-4">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ stat.label }}</p>
          <p class="text-3xl font-black text-slate-800">{{ stat.value }}</p>
          <p class="mt-1 text-xs font-bold text-slate-400">{{ stat.caption }}</p>
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
