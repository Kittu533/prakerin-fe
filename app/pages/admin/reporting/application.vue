<template>
    <div class="space-y-6">

        <!-- Hero Header -->
        <div
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 p-6 text-white shadow-xl">
            <div class="absolute inset-0 opacity-10"
                style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 30px 30px;">
            </div>
            <div class="relative flex items-center justify-between flex-wrap gap-4">
                <div class="flex items-center gap-4">
                    <div
                        class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                        <Icon name="lucide:file-text" class="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight">Laporan Pengajuan Mandiri</h1>
                        <p class="text-indigo-200 text-sm mt-0.5">Memantau pergerakan siswa mencari tempat magang
                            sendiri
                        </p>
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
                    <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Icon name="lucide:clipboard-list" class="w-5 h-5 text-indigo-600" />
                    </div>
                    <span class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">Total</span>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.total_applications ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Total Pengajuan</p>
            </div>

            <div
                class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Icon name="lucide:clock" class="w-5 h-5 text-amber-600" />
                    </div>
                    <span class="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Proses</span>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.pending_applications ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Menunggu Konfirmasi</p>
            </div>

            <div
                class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Icon name="lucide:check-circle" class="w-5 h-5 text-emerald-600" />
                    </div>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.approved_applications ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Diterima</p>
                <div class="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all"
                        :style="{ width: `${Math.min(((statistics.approved_applications || 0) / (statistics.total_applications || 1)) * 100, 100)}%` }">
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-1">dari {{ statistics.total_applications ?? 0 }} total</p>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
                :class="{ 'border-red-200 bg-red-50/50': (statistics.rejected_applications ?? 0) > 0 }">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                        :class="(statistics.rejected_applications ?? 0) > 0 ? 'bg-red-100' : 'bg-orange-50'">
                        <Icon name="lucide:x-circle" class="w-5 h-5"
                            :class="(statistics.rejected_applications ?? 0) > 0 ? 'text-red-600' : 'text-orange-500'" />
                    </div>
                    <span v-if="(statistics.rejected_applications ?? 0) > 0"
                        class="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">
                        Ditolak
                    </span>
                </div>
                <p class="text-3xl font-extrabold"
                    :class="(statistics.rejected_applications ?? 0) > 0 ? 'text-red-700' : 'text-slate-900'">
                    {{ statistics.rejected_applications ?? 0 }}
                </p>
                <p class="text-sm text-slate-500 mt-1">Ditolak</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button @click="isFilterOpen = !isFilterOpen"
                class="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors focus:outline-none">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Icon name="lucide:sliders-horizontal" class="w-4 h-4 text-indigo-600" />
                    </div>
                    <span class="font-semibold text-slate-800 text-sm">Filter & Pencarian</span>
                    <span v-if="activeFilterCount > 0"
                        class="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
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
                                    class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Status
                                    Pengajuan</label>
                                <select v-model="filterDraft.status_pengajuan"
                                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50 focus:bg-white">
                                    <option value="">Semua Status</option>
                                    <option value="menunggu">Menunggu</option>
                                    <option value="disetujui">Disetujui</option>
                                    <option value="ditolak">Ditolak</option>
                                </select>
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
                    <h2 class="font-semibold text-slate-900">Daftar Pengajuan Mandiri</h2>
                    <p class="text-xs text-slate-400 mt-0.5">{{ filteredData.length }} pengajuan ditemukan</p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="relative">
                        <input v-model="searchQuery" placeholder="Cari siswa / perusahaan..."
                            class="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white w-56 transition-all" />
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
                    <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin">
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
                                Perusahaan Tujuan</th>
                            <th
                                class="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Tgl Pengajuan</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr v-for="(row, i) in filteredData" :key="i"
                            class="hover:bg-indigo-50/40 transition-colors group">
                            <td class="px-5 py-4 text-slate-400 font-medium text-xs">{{ i + 1 }}</td>
                            <td class="px-5 py-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                        {{ (row.siswa?.nama_siswa || '?').charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-semibold text-slate-800">{{ row.siswa?.nama_siswa }}</p>
                                        <p class="text-xs text-slate-400">NIS: {{ row.siswa?.nis || '-' }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-4">
                                <p class="font-semibold text-slate-800">{{ row.perusahaan?.nama_perusahaan || '-' }}</p>
                            </td>
                            <td class="px-5 py-4">
                                <span
                                    class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                    <Icon name="lucide:calendar" class="w-3 h-3" />
                                    {{ formatDate(row.tanggal_pengajuan) }}
                                </span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <template v-if="row.status_pengajuan === 'disetujui'">
                                    <span
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                        <span
                                            class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Diterima
                                    </span>
                                </template>
                                <template v-else-if="row.status_pengajuan === 'ditolak'">
                                    <span
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Ditolak
                                    </span>
                                </template>
                                <template v-else-if="row.status_pengajuan === 'menunggu'">
                                    <span
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        <span
                                            class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>Menunggu
                                    </span>
                                </template>
                                <template v-else>
                                    <span
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>{{
                                        row.status_pengajuan || '-' }}
                                    </span>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="filteredData.length === 0"
                    class="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <Icon name="lucide:file-x" class="w-12 h-12 opacity-30" />
                    <p class="font-medium">Tidak ada data yang ditemukan</p>
                    <p class="text-xs">Coba ubah filter atau reset pencarian</p>
                </div>
            </div>

            <!-- Table Footer -->
            <div v-if="!loading && filteredData.length > 0"
                class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Menampilkan <strong class="text-slate-700">{{ filteredData.length }}</strong> dari <strong
                        class="text-slate-700">{{ reportData.length }}</strong> pengajuan</span>
                <span>Diperbarui: {{ lastUpdated }}</span>
            </div>
        </div>

        <!-- Export Modal -->
        <UModal v-model:open="showExportModal">
            <template #content>
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Icon name="lucide:download" class="w-5 h-5 text-indigo-600" />
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
                        <div class="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin">
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

                    <!-- PDF Viewer -->
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
    status_pengajuan: "",
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
    if (filterDraft.value.status_pengajuan) {
        data = data.filter((r) => r.status_pengajuan === filterDraft.value.status_pengajuan);
    }
    return data;
});

async function fetchData() {
    loading.value = true;
    try {
        const params: Record<string, any> = {};
        if (filterDraft.value.status_pengajuan) params.status_pengajuan = filterDraft.value.status_pengajuan;
        const response = await api.getApplicationReport(params);
        if (response.success) {
            reportData.value = response.data || [];
            statistics.value = response.statistics || null;
        }
        lastUpdated.value = new Date().toLocaleTimeString("id-ID");
    } catch (error) { console.error("Error fetching application report:", error); } finally { loading.value = false; }
}

function applyFilters() { fetchData(); }
function resetFilters() {
    filterDraft.value = { status_pengajuan: "" };
    searchQuery.value = "";
    fetchData();
}

async function handleExport(format: "pdf" | "excel") {
    exporting.value = true;
    if (format === 'pdf') {
        isPreviewing.value = true;
    }

    try {
        const params: any = { format };
        if (filterDraft.value.status_pengajuan) params.status_pengajuan = filterDraft.value.status_pengajuan;
        const blob = await api.exportReport("applications", params);
        const url = window.URL.createObjectURL(blob);
        const filename = `laporan-pengajuan-mandiri-${new Date().getTime()}.${format === "pdf" ? "pdf" : "xlsx"}`;

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
    link.download = previewFilename.value || `laporan-pengajuan-mandiri-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closePreview();
}

function formatDate(dateInput: Date | string) {
    if (!dateInput) return '-';
    return new Date(dateInput).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

onMounted(() => { fetchData(); });
</script>
