<script setup lang="ts">
import { usePenempatanApi } from "~/composables/api/use-internship";
import { useTahunAjaranApi } from "~/composables/api/use-academic";
import { formatDate } from "~/utils/format-date";
import { getStatusConfig } from "~/utils/status-helpers";

definePageMeta({ layout: "admin" });

const toast = useToast();
const penempatanApi = usePenempatanApi();
const tahunAjaranApi = useTahunAjaranApi();

const loading = ref(true);
const stats = ref<any>(null);
const students = ref<any[]>([]);
const selectedYear = ref<string>("");
const academicYears = ref<any[]>([]);

// Filters
const filterStatusSiswa = ref("all");
const filterStatusPKL = ref("all");
const search = ref("");
const showProblemsOnly = ref(false);

// Stats cards for student status
const studentStatusCards = computed(() => [
  {
    label: "Total Siswa",
    value: stats.value?.stats?.siswa_aktif + stats.value?.stats?.siswa_lulus + stats.value?.stats?.siswa_pindah + stats.value?.stats?.siswa_dikeluarkan || 0,
    color: "slate",
    icon: "lucide:users",
  },
  {
    label: "Aktif",
    value: stats.value?.stats?.siswa_aktif || 0,
    color: "green",
    icon: "lucide:user-check",
  },
  {
    label: "Lulus",
    value: stats.value?.stats?.siswa_lulus || 0,
    color: "blue",
    icon: "lucide:graduation-cap",
  },
  {
    label: "Pindah",
    value: stats.value?.stats?.siswa_pindah || 0,
    color: "amber",
    icon: "lucide:arrow-right-circle",
  },
  {
    label: "Dikeluarkan",
    value: stats.value?.stats?.siswa_dikeluarkan || 0,
    color: "red",
    icon: "lucide:user-x",
  },
]);

// Stats cards for PKL status
const pklStatusCards = computed(() => [
  {
    label: "PKL Aktif",
    value: stats.value?.stats?.pkl_aktif || 0,
    color: "green",
    icon: "lucide:check-circle",
  },
  {
    label: "PKL Selesai",
    value: stats.value?.stats?.pkl_selesai || 0,
    color: "blue",
    icon: "lucide:flag",
  },
  {
    label: "Akan PKL",
    value: stats.value?.stats?.akan_pkl || 0,
    color: "cyan",
    icon: "lucide:clock",
  },
  {
    label: "Belum PKL",
    value: stats.value?.stats?.belum_pkl || 0,
    color: "amber",
    icon: "lucide:user-plus",
  },
  {
    label: "PKL Batal",
    value: stats.value?.stats?.pkl_batal || 0,
    color: "red",
    icon: "lucide:x-circle",
  },
]);

// Problem stats
const problemCards = computed(() => [
  {
    label: "Lulus Tanpa PKL",
    value: stats.value?.stats?.problem_belum_pkl_lulus || 0,
    color: "red",
    icon: "lucide:alert-triangle",
    description: "Siswa sudah lulus tapi belum pernah PKL",
  },
  {
    label: "Expired",
    value: stats.value?.stats?.problem_expired || 0,
    color: "orange",
    icon: "lucide:alert-circle",
    description: "PKL aktif tapi periode sudah berakhir",
  },
]);

const filteredStudents = computed(() => {
  let result = students.value;

  // Filter by student status
  if (filterStatusSiswa.value !== "all") {
    result = result.filter((s) => s.status_siswa === filterStatusSiswa.value);
  }

  // Filter by PKL status
  if (filterStatusPKL.value !== "all") {
    result = result.filter((s) => s.status_pkl === filterStatusPKL.value);
  }

  // Filter by problems only
  if (showProblemsOnly.value) {
    result = result.filter((s) => s.is_problem);
  }

  // Filter by search
  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (s) =>
        s.nama_siswa.toLowerCase().includes(searchLower) ||
        s.nis.toLowerCase().includes(searchLower)
    );
  }

  return result;
});

async function fetchStats() {
  loading.value = true;
  try {
    const response = await penempatanApi.getStudentStats(
      selectedYear.value || undefined
    );
    if (response.success && response.data) {
      stats.value = response.data;
      students.value = response.data.students || [];
    }
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat statistik",
      description: error.data?.message || "Terjadi kesalahan server",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function fetchAcademicYears() {
  try {
    const response = await tahunAjaranApi.getAll({ limit: 100 });
    if (response.success && response.data) {
      const yearsData = response.data.data || response.data;
      academicYears.value = Array.isArray(yearsData) ? yearsData : [];
    }
  } catch (error) {
    console.error("Gagal memuat tahun ajaran", error);
  }
}

function getStudentStatusBadge(status: string) {
  const config = getStatusConfig(status, "siswa");
  const colorMap: Record<string, string> = {
    success: "bg-green-50 text-green-700 border-green-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-cyan-50 text-cyan-700 border-cyan-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return {
    class: colorMap[config.color] || colorMap.neutral,
    label: config.label,
    icon: config.icon,
  };
}

function getPKLStatusBadge(status: string) {
  const config = getStatusConfig(status, "penempatan");
  const colorMap: Record<string, string> = {
    success: "bg-green-50 text-green-700 border-green-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-red-50 text-red-700 border-red-200",
    info: "bg-cyan-50 text-cyan-700 border-cyan-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return {
    class: colorMap[config.color] || colorMap.neutral,
    label: config.label,
    icon: config.icon,
  };
}

watch(selectedYear, () => {
  fetchStats();
});

onMounted(async () => {
  await fetchAcademicYears();
  await fetchStats();
});

useHead({ title: "Overview Siswa PKL | Admin" });
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
          Overview Siswa PKL
        </h1>
        <p class="text-sm text-slate-500">
          Monitoring status siswa dan penempatan PKL
        </p>
      </div>
      <div class="flex items-center gap-3">
        <USelectMenu
          v-model="showProblemsOnly"
          :options="[
            { label: 'Semua Siswa', value: false },
            { label: 'Tampilkan Masalah Saja', value: true },
          ]"
          class="w-48"
        />
        <USelectMenu
          v-model="selectedYear"
          :options="academicYears"
          value-attribute="id_tahun_ajaran"
          option-attribute="nama_tahun_ajaran"
          placeholder="Semua Tahun Ajaran"
          class="w-48"
        />
      </div>
    </div>

    <!-- Student Status Cards -->
    <div>
      <h3 class="text-sm font-semibold text-slate-600 mb-3">Status Siswa</h3>
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <USkeleton v-for="i in 5" :key="i" class="h-24 rounded-xl" />
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          v-for="(stat, index) in studentStatusCards"
          :key="index"
          class="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          :class="{ 'ring-2 ring-blue-400': filterStatusSiswa === ['aktif', 'lulus', 'pindah', 'dikeluarkan'][index] }"
          @click="filterStatusSiswa = filterStatusSiswa === ['aktif', 'lulus', 'pindah', 'dikeluarkan'][index] ? 'all' : ['aktif', 'lulus', 'pindah', 'dikeluarkan'][index]"
        >
          <div class="flex items-center gap-3">
            <div :class="`p-2 rounded-lg bg-${stat.color}-50`">
              <Icon :name="stat.icon" :class="`w-5 h-5 text-${stat.color}-600`" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
              <p class="text-xs text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PKL Status Cards -->
    <div>
      <h3 class="text-sm font-semibold text-slate-600 mb-3">Status PKL</h3>
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <USkeleton v-for="i in 5" :key="i" class="h-24 rounded-xl" />
      </div>
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          v-for="(stat, index) in pklStatusCards"
          :key="index"
          class="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="filterStatusPKL = filterStatusPKL === ['aktif', 'selesai', 'akan_pkl', 'belum_pkl', 'batal'][index] ? 'all' : ['aktif', 'selesai', 'akan_pkl', 'belum_pkl', 'batal'][index]"
        >
          <div class="flex items-center gap-3">
            <div :class="`p-2 rounded-lg bg-${stat.color}-50`">
              <Icon :name="stat.icon" :class="`w-5 h-5 text-${stat.color}-600`" />
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
              <p class="text-xs text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Problem Cards -->
    <div v-if="!loading && (stats?.stats?.problem_belum_pkl_lulus > 0 || stats?.stats?.problem_expired > 0)">
      <h3 class="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
        <Icon name="lucide:alert-triangle" class="w-4 h-4" />
        Masalah Terdeteksi
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(problem, index) in problemCards"
          :key="index"
          class="bg-red-50 rounded-xl border border-red-200 p-4"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-red-100">
              <Icon :name="problem.icon" class="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p class="text-2xl font-bold text-red-700">{{ problem.value }}</p>
              <p class="text-xs text-red-600">{{ problem.label }}</p>
              <p class="text-xs text-red-500 mt-1">{{ problem.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4 flex-wrap">
      <UInput
        v-model="search"
        placeholder="Cari nama atau NIS..."
        class="flex-1 max-w-md"
      >
        <template #leading>
          <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
        </template>
      </UInput>
      <USelectMenu
        v-model="filterStatusSiswa"
        :options="[
          { label: 'Semua Status Siswa', value: 'all' },
          { label: 'Aktif', value: 'aktif' },
          { label: 'Lulus', value: 'lulus' },
          { label: 'Pindah', value: 'pindah' },
          { label: 'Dikeluarkan', value: 'dikeluarkan' },
        ]"
        class="w-44"
      />
      <USelectMenu
        v-model="filterStatusPKL"
        :options="[
          { label: 'Semua Status PKL', value: 'all' },
          { label: 'PKL Aktif', value: 'aktif' },
          { label: 'PKL Selesai', value: 'selesai' },
          { label: 'Akan PKL', value: 'akan_pkl' },
          { label: 'Belum PKL', value: 'belum_pkl' },
          { label: 'PKL Batal', value: 'batal' },
          { label: 'Expired', value: 'expired' },
        ]"
        class="w-44"
      />
      <UButton
        v-if="filterStatusSiswa !== 'all' || filterStatusPKL !== 'all' || showProblemsOnly"
        color="neutral"
        variant="ghost"
        @click="filterStatusSiswa = 'all'; filterStatusPKL = 'all'; showProblemsOnly = false"
      >
        Reset Filter
      </UButton>
    </div>

    <!-- Student List -->
    <UCard class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th class="px-4 py-3">NIS</th>
              <th class="px-4 py-3">Nama Siswa</th>
              <th class="px-4 py-3">Kelas</th>
              <th class="px-4 py-3">Status Siswa</th>
              <th class="px-4 py-3">Status PKL</th>
              <th class="px-4 py-3">Periode</th>
              <th class="px-4 py-3">Keterangan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="student in filteredStudents"
              :key="student.id_siswa"
              class="hover:bg-slate-50"
              :class="{ 'bg-red-50': student.is_problem }"
            >
              <td class="px-4 py-3 text-slate-500 font-mono text-xs">
                {{ student.nis }}
              </td>
              <td class="px-4 py-3">
                <p class="font-medium text-slate-900">{{ student.nama_siswa }}</p>
                <p v-if="student.tahun_lulus" class="text-xs text-slate-400">Lulus {{ student.tahun_lulus }}</p>
              </td>
              <td class="px-4 py-3">
                <p class="text-slate-700">{{ student.kelas }}</p>
                <p class="text-xs text-slate-400">{{ student.jurusan }}</p>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStudentStatusBadge(student.status_siswa).class}`"
                >
                  <Icon :name="getStudentStatusBadge(student.status_siswa).icon" class="w-3 h-3" />
                  {{ getStudentStatusBadge(student.status_siswa).label }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getPKLStatusBadge(student.status_pkl).class}`"
                >
                  <Icon :name="getPKLStatusBadge(student.status_pkl).icon" class="w-3 h-3" />
                  {{ getPKLStatusBadge(student.status_pkl).label }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500 text-xs">
                <template v-if="student.tanggal_mulai">
                  {{ formatDate(student.tanggal_mulai) }} - {{ formatDate(student.tanggal_selesai) }}
                </template>
                <span v-else>-</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="student.is_problem" class="text-xs text-red-600 flex items-center gap-1">
                  <Icon name="lucide:alert-triangle" class="w-3 h-3" />
                  {{ student.problem_note }}
                </span>
                <span v-else class="text-slate-400 text-xs">-</span>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0 && !loading">
              <td colspan="7" class="px-4 py-12 text-center text-slate-500">
                <Icon name="lucide:users" class="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>Tidak ada data siswa</p>
              </td>
            </tr>
            <tr v-if="loading">
              <td colspan="7" class="px-4 py-12 text-center">
                <Icon name="lucide:loader-2" class="w-6 h-6 mx-auto animate-spin text-sky-500" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!loading" class="px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
        Menampilkan {{ filteredStudents.length }} dari {{ students.length }} siswa
        <span v-if="filterStatusSiswa !== 'all' || filterStatusPKL !== 'all' || showProblemsOnly">
          (filter aktif)
        </span>
      </div>
    </UCard>
  </div>
</template>
