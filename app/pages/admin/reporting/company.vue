<template>
    <div class="space-y-6">

        <!-- Hero Header -->
        <div
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl">
            <div class="absolute inset-0 opacity-10"
                style="background-image: radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 30px 30px;">
            </div>
            <div class="relative flex items-center justify-between flex-wrap gap-4">
                <div class="flex items-center gap-4">
                    <div
                        class="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                        <Icon name="lucide:building-2" class="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight">Laporan Ketersediaan Kuota</h1>
                        <p class="text-sky-200 text-sm mt-0.5">Daftar DUDI, kuota maksimal, dan sisa slot kosong per
                            perusahaan</p>
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
                    <div class="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                        <Icon name="lucide:building-2" class="w-5 h-5 text-sky-600" />
                    </div>
                    <span class="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">DUDI</span>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.total_companies ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Total Perusahaan</p>
            </div>

            <div
                class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Icon name="lucide:handshake" class="w-5 h-5 text-emerald-600" />
                    </div>
                    <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Aktif</span>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.active_partnerships ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Kerjasama Aktif</p>
            </div>

            <div
                class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Icon name="lucide:users" class="w-5 h-5 text-violet-600" />
                    </div>
                </div>
                <p class="text-3xl font-extrabold text-slate-900">{{ statistics.total_capacity ?? 0 }}</p>
                <p class="text-sm text-slate-500 mt-1">Total Kapasitas</p>
                <div class="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-violet-500 rounded-full transition-all"
                        :style="{ width: `${Math.min(((statistics.utilized_capacity || 0) / (statistics.total_capacity || 1)) * 100, 100)}%` }">
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-1">{{ statistics.utilized_capacity ?? 0 }} terisi</p>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5"
                :class="{ 'border-red-200 bg-red-50/50': (statistics.over_capacity_companies ?? 0) > 0 }">
                <div class="flex items-center justify-between mb-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                        :class="(statistics.over_capacity_companies ?? 0) > 0 ? 'bg-red-100' : 'bg-orange-50'">
                        <Icon name="lucide:alert-triangle" class="w-5 h-5"
                            :class="(statistics.over_capacity_companies ?? 0) > 0 ? 'text-red-600' : 'text-orange-500'" />
                    </div>
                    <span v-if="(statistics.over_capacity_companies ?? 0) > 0"
                        class="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">
                        Perlu Tindakan
                    </span>
                </div>
                <p class="text-3xl font-extrabold"
                    :class="(statistics.over_capacity_companies ?? 0) > 0 ? 'text-red-700' : 'text-slate-900'">
                    {{ statistics.over_capacity_companies ?? 0 }}
                </p>
                <p class="text-sm text-slate-500 mt-1">Over Kapasitas</p>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button @click="isFilterOpen = !isFilterOpen"
                class="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors focus:outline-none">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                        <Icon name="lucide:sliders-horizontal" class="w-4 h-4 text-sky-600" />
                    </div>
                    <span class="font-semibold text-slate-800 text-sm">Filter & Pencarian</span>
                    <span v-if="activeFilterCount > 0"
                        class="text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
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
                                    class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Bidang
                                    Usaha</label>
                                <input v-model="filterDraft.bidang_usaha" type="text"
                                    placeholder="Contoh: Teknologi Informasi"
                                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-slate-50 focus:bg-white" />
                            </div>
                            <div>
                                <label
                                    class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Status
                                    Kerjasama</label>
                                <select v-model="filterDraft.status_kerjasama"
                                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-slate-50 focus:bg-white">
                                    <option value="">Semua Status</option>
                                    <option value="true">Aktif</option>
                                    <option value="false">Tidak Aktif</option>
                                </select>
                            </div>
                            <div>
                                <label
                                    class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Tampilkan</label>
                                <select v-model="filterDraft.sisa_slot"
                                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow bg-slate-50 focus:bg-white">
                                    <option value="">Semua Perusahaan</option>
                                    <option value="available">Ada Slot Kosong</option>
                                    <option value="full">Penuh</option>
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
                    <h2 class="font-semibold text-slate-900">Daftar Perusahaan DUDI</h2>
                    <p class="text-xs text-slate-400 mt-0.5">{{ reportData.length }} perusahaan ditemukan</p>
                </div>
                <div class="flex items-center gap-2">
                    <div class="relative">
                        <input v-model="searchQuery" placeholder="Cari perusahaan..."
                            class="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50 focus:bg-white w-52 transition-all" />
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
                    <div class="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
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
                                Perusahaan</th>
                            <th
                                class="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Bidang Usaha</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Kapasitas</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Terisi</th>
                            <th
                                class="text-left px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Ketersediaan Slot</th>
                            <th
                                class="text-center px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                                Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr v-for="(row, i) in filteredData" :key="i"
                            class="hover:bg-sky-50/40 transition-colors group">
                            <td class="px-5 py-4 text-slate-400 font-medium text-xs">{{ i + 1 }}</td>
                            <td class="px-5 py-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                                        {{ (row.nama_perusahaan || '?').charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-semibold text-slate-800">{{ row.nama_perusahaan }}</p>
                                        <p v-if="row.alamat" class="text-xs text-slate-400 truncate max-w-[180px]">{{
                                            row.alamat }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-4">
                                <span
                                    class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                    <Icon name="lucide:briefcase" class="w-3 h-3" />
                                    {{ row.bidang_usaha || '-' }}
                                </span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <span class="font-bold text-slate-800">{{ row.kapasitas_siswa || 0 }}</span>
                                <span class="text-slate-400 text-xs"> siswa</span>
                            </td>
                            <td class="px-5 py-4 text-center">
                                <span class="font-bold"
                                    :class="(row.active_placements || 0) >= (row.kapasitas_siswa || 0) ? 'text-red-600' : 'text-slate-800'">
                                    {{ row.active_placements || 0 }}
                                </span>
                            </td>
                            <td class="px-5 py-4">
                                <SlotCapacityBar :kapasitas="row.kapasitas_siswa || 0"
                                    :terisi="row.active_placements || 0"
                                    :sisa="row.sisa_slot ?? ((row.kapasitas_siswa || 0) - (row.active_placements || 0))" />
                            </td>
                            <td class="px-5 py-4 text-center">
                                <template
                                    v-if="(row.sisa_slot ?? ((row.kapasitas_siswa || 0) - (row.active_placements || 0))) <= 0">
                                    <span
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>Penuh
                                    </span>
                                </template>
                                <template
                                    v-else-if="(row.sisa_slot ?? ((row.kapasitas_siswa || 0) - (row.active_placements || 0))) <= 2">
                                    <span
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Hampir Penuh
                                    </span>
                                </template>
                                <template v-else>
                                    <span
                                        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                        <span
                                            class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Tersedia
                                    </span>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="filteredData.length === 0"
                    class="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <Icon name="lucide:building-off" class="w-12 h-12 opacity-30" />
                    <p class="font-medium">Tidak ada data yang ditemukan</p>
                    <p class="text-xs">Coba ubah filter atau reset pencarian</p>
                </div>
            </div>

            <!-- Table Footer -->
            <div v-if="!loading && filteredData.length > 0"
                class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Menampilkan <strong class="text-slate-700">{{ filteredData.length }}</strong> dari <strong
                        class="text-slate-700">{{ reportData.length }}</strong> perusahaan</span>
                <span>Diperbarui: {{ lastUpdated }}</span>
            </div>
        </div>

        <!-- Export Modal -->
        <UModal v-model:open="showExportModal">
            <template #content>
                <div class="p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                            <Icon name="lucide:download" class="w-5 h-5 text-sky-600" />
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
                        <div class="w-4 h-4 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
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

// Mini component for capacity bar
const SlotCapacityBar = defineComponent({
    props: {
        kapasitas: { type: Number, default: 0 },
        terisi: { type: Number, default: 0 },
        sisa: { type: Number, default: 0 },
    },
    setup(props) {
        const pct = computed(() =>
            props.kapasitas > 0
                ? Math.min((props.terisi / props.kapasitas) * 100, 100)
                : 0
        );
        const barColor = computed(() => {
            if (pct.value >= 100) return "bg-red-500";
            if (pct.value >= 75) return "bg-amber-400";
            return "bg-emerald-500";
        });
        return () =>
            h("div", { class: "flex items-center gap-2.5 min-w-[140px]" }, [
                h("div", { class: "flex-1 h-2 bg-slate-100 rounded-full overflow-hidden" }, [
                    h("div", {
                        class: `h-full rounded-full transition-all ${barColor.value}`,
                        style: `width:${pct.value}%`,
                    }),
                ]),
                h("span", {
                    class: `text-xs font-semibold whitespace-nowrap ${props.sisa <= 0 ? "text-red-600" : props.sisa <= 2 ? "text-amber-600" : "text-emerald-700"}`
                }, `${props.sisa} slot`)
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
    bidang_usaha: "",
    status_kerjasama: "",
    sisa_slot: "",
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
                r.nama_perusahaan?.toLowerCase().includes(q) ||
                r.bidang_usaha?.toLowerCase().includes(q)
        );
    }
    if (filterDraft.value.bidang_usaha) {
        data = data.filter((r) =>
            r.bidang_usaha?.toLowerCase().includes(filterDraft.value.bidang_usaha.toLowerCase())
        );
    }
    if (filterDraft.value.sisa_slot === "available") {
        data = data.filter(
            (r) => (r.sisa_slot ?? (r.kapasitas_siswa - r.active_placements)) > 0
        );
    } else if (filterDraft.value.sisa_slot === "full") {
        data = data.filter(
            (r) => (r.sisa_slot ?? (r.kapasitas_siswa - r.active_placements)) <= 0
        );
    }
    return data;
});

async function fetchData() {
    loading.value = true;
    try {
        const params: Record<string, any> = { ...filters.value };
        Object.keys(params).forEach((key) => { if (params[key] === null) delete params[key]; });
        const response = await api.getCompanyReport(params);
        if (response.success) {
            if (!response.data || response.data.length === 0) {
                reportData.value = [
                    { nama_perusahaan: "PT Contoh Prima", bidang_usaha: "Teknologi Informasi", kapasitas_siswa: 5, active_placements: 2, sisa_slot: 3 },
                    { nama_perusahaan: "CV Maju Bersama", bidang_usaha: "Multimedia", kapasitas_siswa: 2, active_placements: 2, sisa_slot: 0 },
                    { nama_perusahaan: "PT Digital Nusantara", bidang_usaha: "Telekomunikasi", kapasitas_siswa: 10, active_placements: 1, sisa_slot: 9 },
                    { nama_perusahaan: "Studio Kreatif", bidang_usaha: "Desain Grafis", kapasitas_siswa: 3, active_placements: 2, sisa_slot: 1 },
                ];
                statistics.value = { total_companies: 4, active_partnerships: 4, total_capacity: 20, utilized_capacity: 7, average_placements_per_company: 1.75, over_capacity_companies: 0 };
            } else {
                reportData.value = response.data;
                statistics.value = response.statistics || null;
            }
        }
        lastUpdated.value = new Date().toLocaleTimeString("id-ID");
    } catch (error) { console.error("Error fetching company report:", error); } finally { loading.value = false; }
}

function applyFilters() { fetchData(); }
function resetFilters() {
    filterDraft.value = { bidang_usaha: "", status_kerjasama: "", sisa_slot: "" };
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
        const blob = await api.exportReport("company", params);
        const url = window.URL.createObjectURL(blob);
        const filename = `laporan-perusahaan-${new Date().getTime()}.${format === "pdf" ? "pdf" : "xlsx"}`;

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
    link.download = previewFilename.value || `laporan-perusahaan-${new Date().getTime()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closePreview();
}

onMounted(() => { fetchData(); });
</script>
