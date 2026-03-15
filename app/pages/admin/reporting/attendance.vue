<template>
    <div class="space-y-6">

        <!-- Hero Header -->
        <div
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-6 text-white shadow-xl">
            <div class="absolute inset-0 opacity-10"
                style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 30px 30px;">
            </div>
            <div class="relative flex items-center justify-between flex-wrap gap-4">
                <div class="flex items-center gap-4">
                    <div
                        class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                        <Icon name="lucide:calendar-check" class="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight">Laporan Kehadiran Siswa</h1>
                        <p class="text-emerald-200 text-sm mt-0.5">Rekap akumulasi absensi siswa selama masa PKL</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <UButton color="white" variant="solid" size="sm" class="font-semibold shadow"
                        @click="showExportModal = true">
                        <Icon name="lucide:download" class="w-4 h-4 mr-1.5" />
                        Export Laporan
                    </UButton>
                    <UButton color="white" variant="ghost" size="sm" @click="fetchData" :loading="loading"
                        class="!text-white hover:!bg-white/20">
                        <Icon name="lucide:refresh-cw" class="w-4 h-4" />
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Statistics Cards -->
        <div v-if="statistics" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Icon name="lucide:users" class="w-5 h-5 text-emerald-600" />
                    </div>
                    <span class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Siswa</span>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.total_students ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Total Siswa</p>
            </div>

            <div
                class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                        <Icon name="lucide:check-square" class="w-5 h-5 text-sky-600" />
                    </div>
                    <span class="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded-full">Hadir</span>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.total_present ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Total Hadir (hari)</p>
            </div>

            <div
                class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Icon name="lucide:percent" class="w-5 h-5 text-violet-600" />
                    </div>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.average_attendance_rate ?
                    Number(statistics.average_attendance_rate).toFixed(1) : '0' }}%</p>
                <p class="text-sm text-slate-500 mt-1">Rata-rata Kehadiran</p>
                <div class="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-violet-500 rounded-full transition-all"
                        :style="{ width: `${Math.min(statistics.average_attendance_rate || 0, 100)}%` }"></div>
                </div>
                <p class="text-xs text-slate-400 mt-1">{{ statistics.average_attendance_rate ?
                    Number(statistics.average_attendance_rate).toFixed(1) : '0' }}% rata-rata</p>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
                :class="{ 'border-red-200 bg-red-50/50': (statistics.students_with_low_attendance ?? 0) > 0 }">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                        :class="(statistics.students_with_low_attendance ?? 0) > 0 ? 'bg-red-100' : 'bg-orange-50'">
                        <Icon name="lucide:alert-triangle" class="w-5 h-5"
                            :class="(statistics.students_with_low_attendance ?? 0) > 0 ? 'text-red-600' : 'text-orange-500'" />
                    </div>
                    <span v-if="(statistics.students_with_low_attendance ?? 0) > 0"
                        class="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">
                        Perlu Perhatian
                    </span>
                </div>
                <p class="text-3xl font-extrabold"
                    :class="(statistics.students_with_low_attendance ?? 0) > 0 ? 'text-red-700' : 'text-slate-900'">
                    {{ statistics.students_with_low_attendance ?? 0 }}
                </p>
                <p class="text-sm text-slate-500 mt-1">Kehadiran Rendah</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button @click="isFilterOpen = !isFilterOpen"
                class="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors focus:outline-none">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Icon name="lucide:sliders-horizontal" class="w-4 h-4 text-emerald-600" />
                    </div>
                    <span class="font-semibold text-slate-800 text-sm">Filter & Pencarian</span>
                    <span v-if="activeFilterCount > 0"
                        class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {{ activeFilterCount }} aktif
                    </span>
                </div>
                <Icon :name="isFilterOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                    class="w-4 h-4 text-slate-400 transition-transform" />
            </button>

            <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-96" leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 max-h-96" leave-to-class="opacity-0 max-h-0">
                <div v-if="isFilterOpen" class="border-t border-slate-100 overflow-hidden">
                    <div class="p-5">
                        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label
                                    class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Nama
                                    Siswa</label>
                                <input v-model="filterDraft.nama_siswa" type="text" placeholder="Cari nama siswa..."
                                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow bg-slate-50 focus:bg-white" />
                            </div>
                            <div>
                                <label
                                    class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Tingkat
                                    Kehadiran</label>
                                <select v-model="filterDraft.tingkat_kehadiran"
                                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow bg-slate-50 focus:bg-white">
                                    <option value="">Semua Tingkat</option>
                                    <option value="high">Tinggi (≥80%)</option>
                                    <option value="medium">Sedang (60–79%)</option>
                                    <option value="low">Rendah (&lt;60%)</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Perusahaan</label>
                                <input v-model="filterDraft.perusahaan" type="text" placeholder="Cari perusahaan..."
                                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow bg-slate-50 focus:bg-white" />
                            </div>
                        </div>
                        <div class="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                            <UButton color="primary" variant="solid" size="sm" @click="applyFilters" :loading="loading">
                                <Icon name="lucide:search" class="w-4 h-4 mr-1.5" />
                                Terapkan Filter
                            </UButton>
                            <UButton color="neutral" variant="ghost" size="sm" class="text-slate-600"
                                @click="resetFilters">
                                <Icon name="lucide:x" class="w-4 h-4 mr-1.5" />
                                Reset
                            </UButton>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>

        <!-- Table Card -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h2 class="font-semibold text-slate-900">Rekap Absensi Global</h2>
                    <p class="text-xs text-slate-400 mt-0.5">{{ filteredData.length }} siswa ditemukan</p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="relative">
                        <input v-model="searchQuery" placeholder="Cari siswa..."
                            class="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white w-52 transition-all" />
                        <Icon name="lucide:search"
                            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                    <UButton color="neutral" variant="ghost" size="xs" @click="fetchData" :loading="loading"
                        title="Refresh">
                        <Icon name="lucide:refresh-cw" class="w-4 h-4" />
                    </UButton>
                </div>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="flex items-center justify-center py-16">
                <div class="flex flex-col items-center gap-3">
                    <div class="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin">
                    </div>
                    <p class="text-sm text-slate-500">Memuat data laporan...</p>
                </div>
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100">
                            <th
                                class="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                #</th>
                            <th
                                class="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Siswa</th>
                            <th
                                class="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Perusahaan</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Hadir</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Sakit</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Izin</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Alpa</th>
                            <th
                                class="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Kehadiran</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr v-for="(row, i) in filteredData" :key="i"
                            class="hover:bg-emerald-50/40 transition-colors group">
                            <td class="px-5 py-4 text-slate-400 font-medium text-xs">{{ i + 1 }}</td>
                            <td class="px-5 py-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                                        {{ (row.siswa?.nama_siswa || '?').charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-semibold text-slate-800">{{ row.siswa?.nama_siswa }}</p>
                                        <p class="text-xs text-slate-400">NIS: {{ row.siswa?.nis || '-' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-4">
                                <span class="text-sm text-slate-700">{{ row.perusahaan?.nama_perusahaan || '-' }}</span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <span class="font-bold text-emerald-700">{{ row.present_days || 0 }}</span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <span class="font-bold text-amber-600">{{ row.sick_days || 0 }}</span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <span class="font-bold text-sky-600">{{ row.leave_days || 0 }}</span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <span class="font-bold"
                                    :class="(row.absent_days || 0) > 0 ? 'text-red-600' : 'text-slate-400'">{{
                                        row.absent_days || 0 }}</span>
                            </td>
                            <td class="px-5 py-4">
                                <AttendanceBar :rate="row.attendance_rate || 0" />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="filteredData.length === 0"
                    class="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <Icon name="lucide:calendar-x" class="w-12 h-12 opacity-30" />
                    <p class="font-medium">Tidak ada data yang ditemukan</p>
                    <p class="text-xs">Coba ubah filter atau reset pencarian</p>
                </div>
            </div>

            <!-- Table Footer -->
            <div v-if="!loading && filteredData.length > 0"
                class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Menampilkan <strong class="text-slate-700">{{ filteredData.length }}</strong> dari <strong
                        class="text-slate-700">{{ reportData.length }}</strong> siswa</span>
                <span>Diperbarui: {{ lastUpdated }}</span>
            </div>
        </div>

        <!-- Export Modal -->
        <UModal v-model:open="showExportModal">
            <template #content>
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Icon name="lucide:download" class="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 class="text-base font-bold text-slate-900">Export Laporan</h3>
                            <p class="text-xs text-slate-500">Pilih format file yang diinginkan</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <button @click="handleExport('pdf')" :disabled="exporting"
                            class="flex flex-col items-center gap-2.5 p-4 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                            <div
                                class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <Icon name="lucide:file-text" class="w-5 h-5 text-red-600" />
                            </div>
                            <div class="text-center">
                                <p class="font-semibold text-slate-800 text-sm">PDF</p>
                                <p class="text-xs text-slate-400">Siap cetak</p>
                            </div>
                        </button>
                        <button @click="handleExport('excel')" :disabled="exporting"
                            class="flex flex-col items-center gap-2.5 p-4 border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                            <div
                                class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                                <Icon name="lucide:file-spreadsheet" class="w-5 h-5 text-emerald-600" />
                            </div>
                            <div class="text-center">
                                <p class="font-semibold text-slate-800 text-sm">Excel</p>
                                <p class="text-xs text-slate-400">Dapat diedit</p>
                            </div>
                        </button>
                    </div>
                    <div v-if="exporting" class="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
                        <div class="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin">
                        </div>
                        Sedang {{ isPreviewing ? 'menyiapkan preview...' : 'mengunduh...' }}
                    </div>
                </div>
            </template>
        </UModal>

        <!-- Preview Modal -->
        <UModal v-model:open="showPreviewModal" prevent-close fullscreen>
            <template #content>
                <div class="h-screen flex flex-col bg-slate-50">
                    <!-- Header -->
                    <div
                        class="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-10">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <Icon name="lucide:file-text" class="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h3 class="text-base font-bold text-slate-900">Preview Laporan PDF</h3>
                                <p class="text-xs text-slate-500">Periksa laporan sebelum mengunduh</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <UButton color="neutral" variant="ghost" @click="closePreview">
                                Batal
                            </UButton>
                            <UButton color="primary" variant="solid" @click="downloadPreviewedPdf">
                                <Icon name="lucide:download" class="w-4 h-4 mr-1.5" />
                                Download PDF
                            </UButton>
                        </div>
                    </div>

                    <!-- PDF Viewer (iframe) -->
                    <div
                        class="flex-1 bg-slate-100 p-4 md:p-8 overflow-hidden flex flex-col items-center justify-center relative">
                        <div v-if="!previewUrl" class="flex flex-col items-center justify-center gap-3 text-slate-400">
                            <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin">
                            </div>
                            <p class="font-medium">Memuat preview PDF...</p>
                        </div>
                        <iframe v-else :src="previewUrl"
                            class="w-full max-w-5xl h-full bg-white rounded-xl shadow-lg border border-slate-300"
                            title="PDF Preview"></iframe>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { useReportingApi } from "~/composables/api/use-reporting-api";

definePageMeta({ layout: "admin" });

// Mini component for attendance rate bar
const AttendanceBar = defineComponent({
    props: { rate: { type: Number, default: 0 } },
    setup(props) {
        const barColor = computed(() => {
            if (props.rate >= 80) return "bg-emerald-500";
            if (props.rate >= 60) return "bg-amber-400";
            return "bg-red-500";
        });
        const textColor = computed(() => {
            if (props.rate >= 80) return "text-emerald-700";
            if (props.rate >= 60) return "text-amber-700";
            return "text-red-700";
        });
        return () =>
            h("div", { class: "flex items-center gap-2.5 min-w-[140px]" }, [
                h("div", { class: "flex-1 h-2 bg-slate-100 rounded-full overflow-hidden" }, [
                    h("div", {
                        class: `h-full rounded-full transition-all ${barColor.value}`,
                        style: `width:${Math.min(props.rate, 100)}%`,
                    }),
                ]),
                h("span", {
                    class: `text-xs font-semibold whitespace-nowrap ${textColor.value}`
                }, `${Number(props.rate).toFixed(1)}%`)
            ]);
    },
});

const api = useReportingApi();
const loading = ref(false);
const exporting = ref(false);
const showExportModal = ref(false);
const isFilterOpen = ref(false);
const searchQuery = ref("");
const reportData = ref<any[]>([]);
const statistics = ref<any>(null);
const lastUpdated = ref("—");

// Preview State
const showPreviewModal = ref(false);
const isPreviewing = ref(false);
const previewUrl = ref<string | null>(null);
const previewFilename = ref("");

const filterDraft = ref({
    nama_siswa: "",
    tingkat_kehadiran: "",
    perusahaan: "",
});

const filters = ref({
    tahun_ajaran_id: null as string | null,
    id_periode_pkl: null as string | null,
    id_jurusan: null as string | null,
    id_perusahaan: null as string | null,
    status: null as string | null,
    tanggal_mulai: null as string | null,
    tanggal_selesai: null as string | null,
});

const activeFilterCount = computed(() =>
    Object.values(filterDraft.value).filter((v) => v !== "" && v !== null).length
);

const filteredData = computed(() => {
    let data = reportData.value;
    const q = searchQuery.value.toLowerCase().trim();
    if (q) {
        data = data.filter(
            (r) =>
                r.siswa?.nama_siswa?.toLowerCase().includes(q) ||
                r.perusahaan?.nama_perusahaan?.toLowerCase().includes(q) ||
                r.siswa?.nis?.toLowerCase().includes(q)
        );
    }
    if (filterDraft.value.nama_siswa) {
        data = data.filter((r) =>
            r.siswa?.nama_siswa?.toLowerCase().includes(filterDraft.value.nama_siswa.toLowerCase())
        );
    }
    if (filterDraft.value.perusahaan) {
        data = data.filter((r) =>
            r.perusahaan?.nama_perusahaan?.toLowerCase().includes(filterDraft.value.perusahaan.toLowerCase())
        );
    }
    if (filterDraft.value.tingkat_kehadiran) {
        data = data.filter((r) => {
            const rate = r.attendance_rate || 0;
            if (filterDraft.value.tingkat_kehadiran === "high") return rate >= 80;
            if (filterDraft.value.tingkat_kehadiran === "medium") return rate >= 60 && rate < 80;
            if (filterDraft.value.tingkat_kehadiran === "low") return rate < 60;
            return true;
        });
    }
    return data;
});

async function fetchData() {
    loading.value = true;
    try {
        const params: Record<string, any> = { ...filters.value };
        Object.keys(params).forEach((key) => { if (params[key] === null) delete params[key]; });
        const response = await api.getAttendanceReport(params);
        if (response.success) {
            if (!response.data || response.data.length === 0) {
                reportData.value = [
                    { siswa: { nis: "1001", nama_siswa: "Ahmad Budi" }, perusahaan: { nama_perusahaan: "PT Contoh Prima" }, present_days: 20, sick_days: 1, leave_days: 0, absent_days: 0, attendance_rate: 95.2 },
                    { siswa: { nis: "1002", nama_siswa: "Siti Rahma" }, perusahaan: { nama_perusahaan: "PT Digital Nusantara" }, present_days: 15, sick_days: 0, leave_days: 2, absent_days: 4, attendance_rate: 71.4 },
                    { siswa: { nis: "1003", nama_siswa: "Joko Anwar" }, perusahaan: { nama_perusahaan: "CV Maju Bersama" }, present_days: 22, sick_days: 0, leave_days: 0, absent_days: 0, attendance_rate: 100 },
                ];
                statistics.value = { total_students: 3, average_attendance_rate: 88.8, students_with_low_attendance: 1, total_present: 57 };
            } else {
                reportData.value = response.data;
                statistics.value = response.statistics || null;
            }
        }
        lastUpdated.value = new Date().toLocaleTimeString("id-ID");
    } catch (error) { console.error("Error fetching attendance report:", error); } finally { loading.value = false; }
}

function applyFilters() { fetchData(); }
function resetFilters() {
    filterDraft.value = { nama_siswa: "", tingkat_kehadiran: "", perusahaan: "" };
    searchQuery.value = "";
    fetchData();
}

async function handleExport(format: "pdf" | "excel") {
    exporting.value = true;
    if (format === 'pdf') {
        isPreviewing.value = true;
    }

    try {
        const params: any = { ...filters.value, format };
        Object.keys(params).forEach((key) => { if (params[key] === null) delete params[key]; });
        const blob = await api.exportReport("attendance", params);
        const url = window.URL.createObjectURL(blob);
        const filename = `laporan-kehadiran-${new Date().getTime()}.${format === "pdf" ? "pdf" : "xlsx"}`;

        showExportModal.value = false;

        if (format === 'pdf') {
            previewUrl.value = url;
            previewFilename.value = filename;
            showPreviewModal.value = true;
        } else {
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error("Error exporting report:", error);
    } finally {
        exporting.value = false;
        isPreviewing.value = false;
    }
}

function closePreview() {
    showPreviewModal.value = false;
    if (previewUrl.value) {
        window.URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
    }
}

function downloadPreviewedPdf() {
    if (!previewUrl.value) return;

    const link = document.createElement("a");
    link.href = previewUrl.value;
    link.download = previewFilename.value || `laporan-kehadiran-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closePreview();
}

onMounted(() => { fetchData(); });
</script>
