<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useGuruApi } from "~/composables/api/use-academic";
import { usePerusahaanApi } from "~/composables/api/use-partner";
import { usePeriodePKLApi } from "~/composables/api/use-periode-pkl";

definePageMeta({
  layout: "admin",
});

interface PlotItem {
  id_siswa: string;
  nama_siswa: string;
  nis: string;
  kelas: string;
  jurusan: string;
  durasi_bulan: number;
  selected: boolean;
}

const toast = useToast();
const route = useRoute();

const guruApi = useGuruApi();
const perusahaanApi = usePerusahaanApi();
const periodeApi = usePeriodePKLApi();

const loading = ref(false);
const plotting = ref(false);

const search = ref("");
const selectedKelas = ref("");
const selectedMitra = ref("");
const selectedGuru = ref("");

const activePeriodeId = ref("");
const activePeriodeLabel = ref("-");
const activeTahunAjaranId = ref("");
const activeTanggalMulai = ref("");
const activeTanggalSelesai = ref("");
const defaultDurasiBulan = ref(1);
const hasAppliedRouteFocus = ref(false);

const siswaItems = ref<PlotItem[]>([]);

const mitraOptions = ref<Array<{ value: string; label: string }>>([]);
const guruOptions = ref<Array<{ value: string; label: string }>>([]);
const focusedSiswaId = computed(() =>
  typeof route.query.siswa_id === "string" ? route.query.siswa_id : "",
);

const kelasOptions = computed(() => {
  const unique = new Set(siswaItems.value.map((item) => item.kelas));
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
});

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  return siswaItems.value.filter((item) => {
    const matchKeyword =
      !keyword ||
      item.nama_siswa.toLowerCase().includes(keyword) ||
      item.nis.toLowerCase().includes(keyword);

    const matchKelas = !selectedKelas.value || item.kelas === selectedKelas.value;

    return matchKeyword && matchKelas;
  });
});

const selectedCount = computed(
  () => filteredRows.value.filter((item) => item.selected).length,
);

const totalSelectedCount = computed(
  () => siswaItems.value.filter((item) => item.selected).length,
);

const isAllFilteredSelected = computed({
  get: () =>
    filteredRows.value.length > 0 &&
    filteredRows.value.every((item) => item.selected),
  set: (checked: boolean) => {
    filteredRows.value.forEach((item) => {
      item.selected = checked;
    });
  },
});

function formatDateId(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function calculateDefaultDurationMonths(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return Math.max(1, Math.min(12, months));
}

function calculatePreviewEndDate(startDate: string, durasiBulan: number) {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return null;

  const months = Math.max(1, Math.min(12, Number(durasiBulan) || 1));
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  end.setDate(end.getDate() - 1);
  return end;
}

function getDurasiRangePreview(durasiBulan: number) {
  if (!activeTanggalMulai.value) return "-";

  const endDate = calculatePreviewEndDate(activeTanggalMulai.value, durasiBulan);
  if (!endDate) return "-";

  return `${formatDateId(activeTanggalMulai.value)} - ${formatDateId(endDate.toISOString())}`;
}

function applyRouteFocusToRows() {
  if (!focusedSiswaId.value || hasAppliedRouteFocus.value) return;

  hasAppliedRouteFocus.value = true;

  const target = siswaItems.value.find(
    (item) => item.id_siswa === focusedSiswaId.value,
  );

  if (!target) {
    toast.add({
      title: "Siswa belum siap diplot",
      description:
        "Siswa ini belum masuk shortlist siswa siap PKL pada periode aktif.",
      color: "warning",
    });
    return;
  }

  search.value = target.nama_siswa;
  target.selected = true;
}

async function loadInitialData() {
  loading.value = true;

  try {
    const [periodeRes, mitraRes, guruRes] = await Promise.all([
      periodeApi.getActive(),
      perusahaanApi.getAll({
        limit: 1000,
        status_kerjasama: true,
        mou_aktif: true,
        arsip: false,
      }),
      guruApi.getAll({ limit: 1000 }),
    ]);

    if (!periodeRes.success || !periodeRes.data) {
      throw new Error(
        periodeRes.message ||
          "Periode PKL aktif belum tersedia. Aktifkan periode terlebih dahulu.",
      );
    }

    const active = periodeRes.data;
    activePeriodeId.value = active.id_periode_pkl;
    activePeriodeLabel.value = active.nama_periode;
    activeTahunAjaranId.value = active.id_tahun_ajaran;
    activeTanggalMulai.value = active.tanggal_mulai;
    activeTanggalSelesai.value = active.tanggal_selesai;
    defaultDurasiBulan.value = calculateDefaultDurationMonths(
      active.tanggal_mulai,
      active.tanggal_selesai,
    );

    if (mitraRes.success) {
      mitraOptions.value = (mitraRes.data || []).map((mitra) => ({
        value: mitra.id_perusahaan,
        label: mitra.nama_perusahaan,
      }));
    }

    if (guruRes.success) {
      guruOptions.value = (guruRes.data || [])
        .filter((guru) => guru.status_aktif !== false)
        .map((guru) => ({
          value: guru.id_guru,
          label: guru.nama_guru,
        }));
    }

    await loadSiswaAvailable();
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat data kelola tempat",
      description: error?.message || "Terjadi kesalahan saat memuat data",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function loadSiswaAvailable() {
  if (!activePeriodeId.value) {
    siswaItems.value = [];
    return;
  }

  const siswaRes = await periodeApi.getSiswaAvailable(activePeriodeId.value);

  if (!siswaRes.success) {
    throw new Error(siswaRes.message || "Gagal memuat siswa tersedia");
  }

  siswaItems.value = (siswaRes.data || []).map((item) => ({
    id_siswa: item.id_siswa,
    nama_siswa: item.nama_siswa,
    nis: item.nis,
    kelas: item.kelas?.nama_kelas || "-",
    jurusan: item.kelas?.jurusan?.nama_jurusan || "-",
    durasi_bulan: defaultDurasiBulan.value,
    selected: false,
  }));

  applyRouteFocusToRows();
}

async function handlePlotSelected() {
  if (!activePeriodeId.value || !activeTahunAjaranId.value) {
    toast.add({
      title: "Periode aktif belum tersedia",
      color: "error",
    });
    return;
  }

  if (!selectedMitra.value) {
    toast.add({
      title: "Pilih mitra terlebih dahulu",
      color: "warning",
    });
    return;
  }

  const selectedItems = siswaItems.value.filter((item) => item.selected);
  const siswaIds = selectedItems.map((item) => item.id_siswa);

  if (siswaIds.length === 0) {
    toast.add({
      title: "Pilih minimal 1 siswa",
      color: "warning",
    });
    return;
  }

  const invalidDurasi = selectedItems.find(
    (item) => Number(item.durasi_bulan) < 1 || Number(item.durasi_bulan) > 12,
  );

  if (invalidDurasi) {
    toast.add({
      title: "Durasi tidak valid",
      description: "Durasi magang per siswa wajib 1 sampai 12 bulan",
      color: "error",
    });
    return;
  }

  plotting.value = true;

  try {
    const response = await periodeApi.batchPenempatan({
      id_periode_pkl: activePeriodeId.value,
      siswa_penempatan: selectedItems.map((item) => ({
        siswa_id: item.id_siswa,
        durasi_bulan: Number(item.durasi_bulan),
      })),
      perusahaan_id: selectedMitra.value,
      guru_pembimbing_id: selectedGuru.value || undefined,
    });

    if (!response.success) {
      throw new Error(response.message || "Gagal membuat plot penempatan");
    }

    toast.add({
      title: "Plot siswa berhasil",
      description:
        response.message || `${siswaIds.length} siswa berhasil ditempatkan`,
      color: "success",
    });

    await loadSiswaAvailable();
  } catch (error: any) {
    toast.add({
      title: "Gagal melakukan plot siswa",
      description: error?.message || "Terjadi kesalahan saat memproses plot",
      color: "error",
    });
  } finally {
    plotting.value = false;
  }
}

watch(selectedKelas, () => {
  isAllFilteredSelected.value = false;
});

onMounted(() => {
  loadInitialData();
});

useHead({
  title: "Kelola Tempat PKL | Admin",
});
</script>

<template>
  <div class="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
    <div class="bg-white rounded-3xl shadow-sm p-8 border border-slate-100 space-y-6">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="space-y-1">
          <h1 class="text-2xl font-black text-blue-600 tracking-tight uppercase">
            Kelola Tempat PKL
          </h1>
          <p class="text-sm text-slate-500">
            Plot siswa siap PKL ke mitra yang memiliki MoU aktif.
          </p>
        </div>
        <div class="text-sm font-semibold text-slate-600 bg-blue-50 px-4 py-2 rounded-xl">
          Periode Aktif: {{ activePeriodeLabel }}
          <span class="text-slate-400">({{ formatDateId(activeTanggalMulai) }} - {{ formatDateId(activeTanggalSelesai) }})</span>
        </div>
      </div>

      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl text-sm text-amber-800">
        Hanya mitra dengan MoU aktif yang tampil. Siswa yang sudah terplot pada periode aktif tidak ditampilkan.
      </div>
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl text-sm text-blue-800">
          Durasi magang diisi per siswa (1-12 bulan). Tanggal selesai dihitung otomatis dari tanggal mulai periode aktif.
        </div>
        <div
          v-if="focusedSiswaId"
          class="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-xl text-sm text-emerald-800"
        >
          Halaman dibuka dari detail siswa. Jika siswa memenuhi syarat PKL pada periode aktif, datanya akan otomatis difokuskan di shortlist ini.
        </div>
      </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="space-y-2 lg:col-span-2">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cari Nama/NIS</label>
          <input
            v-model="search"
            type="text"
            placeholder="Ketik nama atau NIS"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="space-y-2">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kelas</label>
          <select
            v-model="selectedKelas"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Semua Kelas</option>
            <option v-for="kelas in kelasOptions" :key="kelas" :value="kelas">
              {{ kelas }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mitra PKL</label>
          <select
            v-model="selectedMitra"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Pilih Mitra</option>
            <option v-for="mitra in mitraOptions" :key="mitra.value" :value="mitra.value">
              {{ mitra.label }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guru Pembimbing</label>
          <select
            v-model="selectedGuru"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none"
          >
            <option value="">Auto Pilih Sistem</option>
            <option v-for="guru in guruOptions" :key="guru.value" :value="guru.value">
              {{ guru.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-3">
        <p class="text-sm text-slate-500">
          Terpilih: <span class="font-bold text-slate-800">{{ totalSelectedCount }}</span> siswa
        </p>
        <button
          :disabled="plotting || totalSelectedCount === 0"
          @click="handlePlotSelected"
          class="bg-green-700 hover:bg-green-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
        >
          <Icon name="lucide:users" class="w-4 h-4" />
          {{ plotting ? "Memproses..." : "Plot Siswa ke Mitra" }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
        <span class="text-sm text-slate-600 font-medium">
          Menampilkan {{ filteredRows.length }} siswa siap PKL
        </span>
        <span class="text-xs text-slate-400">
          Tercentang (filter aktif): {{ selectedCount }}
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/30">
              <th class="px-6 py-4 w-10">
                <input v-model="isAllFilteredSelected" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </th>
              <th class="px-4 py-4 w-16 text-center">No</th>
              <th class="px-4 py-4">Nama Siswa</th>
              <th class="px-4 py-4">NIS</th>
              <th class="px-4 py-4">Kelas</th>
              <th class="px-4 py-4">Jurusan</th>
              <th class="px-4 py-4 w-40">Durasi (Bulan)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-10 text-center text-slate-500">Memuat data...</td>
            </tr>
            <tr v-else-if="filteredRows.length === 0">
              <td colspan="7" class="px-6 py-10 text-center text-slate-500">
                Tidak ada siswa siap PKL yang cocok dengan filter.
              </td>
            </tr>
            <tr
              v-for="(row, index) in filteredRows"
              v-else
              :key="row.id_siswa"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <input v-model="row.selected" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </td>
              <td class="px-4 py-4 text-center text-sm text-slate-500">{{ index + 1 }}</td>
              <td class="px-4 py-4 font-semibold text-slate-800">{{ row.nama_siswa }}</td>
              <td class="px-4 py-4 text-slate-600">{{ row.nis }}</td>
              <td class="px-4 py-4 text-slate-600">{{ row.kelas }}</td>
              <td class="px-4 py-4 text-slate-600">{{ row.jurusan }}</td>
              <td class="px-4 py-4">
                <div class="space-y-1.5">
                  <input
                    v-model.number="row.durasi_bulan"
                    type="number"
                    min="1"
                    max="12"
                    :disabled="!row.selected"
                    class="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <p class="text-[10px] leading-tight" :class="row.selected ? 'text-blue-700 font-semibold' : 'text-slate-400'">
                    {{ getDurasiRangePreview(row.durasi_bulan) }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
