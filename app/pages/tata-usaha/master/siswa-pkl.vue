<template>
    <div class="space-y-4">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="min-w-0 flex-1 space-y-1">
                    <h2 class="text-lg font-bold text-slate-900">Monitoring PKL Aktif</h2>
                    <p class="text-sm text-slate-500">
                        Halaman ini hanya menampilkan siswa yang sudah memiliki penempatan PKL aktif.
                        Input, impor, dan perbaikan biodata siswa tetap dilakukan dari Master Siswa.
                    </p>
                </div>
                <div class="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-[240px] lg:flex-col xl:min-w-0 xl:flex-row">
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:users"
                        class="w-full justify-center"
                        @click="navigateTo('/tata-usaha/master/siswa')"
                    >
                        Buka Master Siswa
                    </UButton>
                    <UButton
                        color="neutral"
                        variant="outline"
                        icon="lucide:filter"
                        class="w-full justify-center"
                        @click="exportFilteredData"
                    >
                        Export Filter
                    </UButton>
                    <UButton
                        color="primary"
                        icon="lucide:download"
                        class="w-full justify-center"
                        @click="exportAllData"
                    >
                        Export Semua
                    </UButton>
                </div>
            </div>
        </div>

        <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Data pada halaman ini muncul setelah penempatan PKL aktif dibuat. Jika siswa belum muncul di sini,
            cek dulu kelayakan di Master Siswa lalu lakukan plotting dari flow Admin &gt; SIAP PKL &gt; Kelola Tempat PKL.
        </div>

        <!-- Filters Section -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div class="flex w-full flex-col gap-1.5 lg:flex-[1.4]">
                    <label class="text-sm font-semibold text-slate-700">Cari Data</label>
                    <UInput
                        v-model="filters.search"
                        class="w-full"
                        placeholder="Nama, NIS, atau Perusahaan..."
                        icon="i-heroicons-magnifying-glass"
                        size="lg"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500'
                        }"
                    />
                </div>
                <div class="flex w-full flex-col gap-1.5 lg:flex-1">
                    <label class="text-sm font-semibold text-slate-700">Filter Kelas</label>
                    <USelectMenu
                        v-model="filters.kelas"
                        class="w-full"
                        :options="kelasOptions"
                        size="lg"
                        placeholder="Pilih Kelas"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500'
                        }"
                    />
                </div>
                <div class="flex w-full lg:w-auto lg:min-w-[220px]">
                    <UButton
                        variant="outline"
                        color="neutral"
                        block
                        size="lg"
                        class="h-11 w-full justify-center whitespace-nowrap border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                        @click="fetchData"
                    >
                        <Icon name="i-heroicons-arrow-path" class="w-4 h-4 mr-2" />
                        Refresh Data
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div v-if="loading" class="p-4 space-y-3">
                <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
            </div>
            <UTable
                v-else
                :data="siswaList"
                :columns="columns"
                :ui="{
                    th: { base: 'bg-slate-50 text-slate-900 font-bold uppercase text-[10px] tracking-wider py-4' },
                    td: { base: 'py-4 align-middle' }
                }"
            >
                <!-- No Column -->
                <template #index-cell="{ row }">
                    <span class="text-sm text-slate-500 px-2">{{ ((pagination.page - 1) * pagination.limit) + row.index + 1 }}</span>
                </template>

                <!-- Identitas Siswa Column -->
                <template #identitas-cell="{ row }">
                    <div class="space-y-0.5">
                        <p class="font-bold text-slate-900">{{ row.original.nama_siswa }}</p>
                        <div class="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            <span>NIS. {{ row.original.nis }}</span>
                            <span v-if="row.original.nisn" class="text-slate-300">|</span>
                            <span v-if="row.original.nisn">NISN. {{ row.original.nisn }}</span>
                        </div>
                    </div>
                </template>

                <!-- Kelas & Program Column -->
                <template #kelas_program-cell="{ row }">
                    <div class="space-y-0.5">
                        <p class="font-semibold text-slate-800 text-sm">{{ row.original.kelas?.nama_kelas || '-' }}</p>
                        <p class="text-[10px] text-slate-500 uppercase">{{ row.original.kelas?.jurusan?.nama_jurusan || '-' }}</p>
                    </div>
                </template>

                <template #status_pkl-cell="{ row }">
                    <div class="space-y-1">
                        <UBadge
                            variant="subtle"
                            :color="getPKLStatusColor(row.original.pkl_status)"
                            size="xs"
                        >
                            {{ row.original.pkl_status_label || (row.original.penempatan?.[0] ? 'Sedang PKL' : 'Belum PKL') }}
                        </UBadge>
                        <p
                            v-if="row.original.penempatan?.[0]?.perusahaan?.nama_perusahaan"
                            class="max-w-[180px] truncate text-[10px] text-slate-500"
                        >
                            {{ row.original.penempatan[0].perusahaan.nama_perusahaan }}
                        </p>
                    </div>
                </template>

                <template #kelayakan-cell="{ row }">
                    <div class="space-y-1">
                        <UBadge
                            variant="subtle"
                            :color="getEligibilityColor(row.original.pkl_eligibility_status)"
                            size="xs"
                        >
                            {{ row.original.pkl_eligibility_label || 'Belum Siap' }}
                        </UBadge>
                        <p
                            v-if="row.original.pkl_eligibility_reasons?.length"
                            class="max-w-[220px] text-[10px] leading-4 text-slate-500 line-clamp-2"
                        >
                            {{ row.original.pkl_eligibility_reasons.join(' ') }}
                        </p>
                    </div>
                </template>

                <!-- TTL & Gender Column -->
                <template #ttl_gender-cell="{ row }">
                    <div class="space-y-0.5 text-xs">
                        <p class="text-slate-700 capitalize">
                            {{ row.original.tempat_lahir || '-' }}, 
                            {{ row.original.tanggal_lahir ? formatDate(row.original.tanggal_lahir) : '-' }}
                        </p>
                        <p class="text-[10px] font-bold" :class="row.original.jenis_kelamin === 'L' ? 'text-blue-600' : 'text-pink-600'">
                            {{ row.original.jenis_kelamin === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN' }}
                        </p>
                    </div>
                </template>

                <!-- Alamat Column -->
                <template #alamat-cell="{ row }">
                    <p class="text-xs text-slate-600 max-w-[200px] line-clamp-2">
                        {{ row.original.alamat || '-' }}
                    </p>
                </template>

                <!-- Kontak Column -->
                <template #kontak-cell="{ row }">
                    <div v-if="row.original.no_hp" class="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <Icon name="i-heroicons-chat-bubble-left-right" class="w-3.5 h-3.5" />
                        {{ row.original.no_hp }}
                    </div>
                    <span v-else class="text-xs text-slate-400">-</span>
                </template>

                <!-- Aksi Column -->
                <template #actions-cell="{ row }">
                    <div class="flex items-center gap-2">
                        <UButton
                            variant="outline"
                            color="neutral"
                            size="xs"
                            class="p-1.5 border-blue-600 text-blue-600 hover:bg-blue-50 rounded"
                            @click="viewDetail(row.original)"
                        >
                            <Icon name="i-heroicons-eye" class="w-4 h-4" />
                        </UButton>
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <div class="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
                <p class="text-xs text-slate-500 font-medium">
                    Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
                </p>
                <div class="flex items-center gap-2">
                    <UButton
                        variant="neutral"
                        size="xs"
                        :disabled="pagination.page === 1"
                        class="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                        @click="changePage(pagination.page - 1)"
                    >
                        Previous
                    </UButton>
                    <UButton
                        variant="neutral"
                        size="xs"
                        :disabled="pagination.page * pagination.limit >= pagination.total"
                        class="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                        @click="changePage(pagination.page + 1)"
                    >
                        Next
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <UModal
            v-model:open="showDetailModal"
            title="Detail Penempatan PKL"
            :description="detailModalDescription"
            size="lg"
        >
            <template #body>
                <div v-if="selectedSiswa" class="p-6 space-y-6">
                    <!-- Siswa Info -->
                    <div class="flex items-center gap-4 border-b border-slate-100 pb-6">
                        <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                            <Icon name="i-heroicons-user" class="h-8 w-8" />
                        </div>
                        <div class="min-w-0">
                            <h3 class="text-lg font-bold text-slate-900">{{ selectedSiswa.nama_siswa }}</h3>
                            <p class="text-sm text-slate-500">
                                NIS. {{ selectedSiswa.nis }} | {{ selectedSiswa.kelas?.nama_kelas }}
                            </p>
                        </div>
                    </div>

                    <!-- PKL Details -->
                    <div v-if="selectedSiswa.penempatan?.[0]" class="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div class="space-y-4">
                            <div class="space-y-1">
                                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Perusahaan</p>
                                <p class="text-sm font-semibold text-slate-900">{{ selectedSiswa.penempatan[0].perusahaan.nama_perusahaan }}</p>
                                <p class="text-xs text-slate-500">{{ selectedSiswa.penempatan[0].perusahaan.alamat || '-' }}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guru Pembimbing</p>
                                <p class="text-sm font-semibold text-slate-900">{{ selectedSiswa.penempatan[0].guru.nama_guru }}</p>
                                <p class="text-xs text-slate-500">NIP. {{ selectedSiswa.penempatan[0].guru.nip }}</p>
                            </div>
                        </div>
                        <div class="space-y-4">
                            <div class="space-y-1">
                                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Periode PKL</p>
                                <p class="text-sm font-semibold text-slate-900">
                                    {{ formatDate(selectedSiswa.penempatan[0].tanggal_mulai) }} - {{ formatDate(selectedSiswa.penempatan[0].tanggal_selesai) }}
                                </p>
                                <p class="text-xs text-slate-500">Tahun Ajaran {{ selectedSiswa.penempatan[0].tahun_ajaran?.nama_tahun_ajaran }}</p>
                            </div>
                            <div class="space-y-1">
                                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                                <UBadge variant="subtle" color="success" size="xs">Aktif Melaksanakan</UBadge>
                            </div>
                        </div>
                    </div>
                    <div v-else class="py-10 text-center">
                        <Icon name="i-heroicons-information-circle" class="mx-auto mb-2 h-10 w-10 text-slate-300" />
                        <p class="text-sm text-slate-500">Siswa ini belum memiliki data penempatan PKL aktif.</p>
                    </div>
                </div>

                <div v-else class="px-6 py-8 text-sm text-slate-500">
                    Data penempatan PKL tidak tersedia.
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end">
                    <UButton variant="neutral" @click="showDetailModal = false">Tutup</UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import {
    useKelasApi,
    useSiswaApi,
    type Siswa,
} from "~/composables/api/use-academic";

definePageMeta({ layout: "tata-usaha" });

const { getPklStudents } = useSiswaApi();
const { getAll: getAllKelas } = useKelasApi();
const toast = useToast();

const loading = ref(false);
const showDetailModal = ref(false);
const selectedSiswa = ref<Siswa | null>(null);

const ALL_FILTER_VALUE = "__all__";

const siswaList = ref<Siswa[]>([]);
const pagination = ref({ page: 1, limit: 20, total: 0 });

const filters = ref({
    search: "",
    kelas: ALL_FILTER_VALUE,
});

const kelasOptions = ref<Array<{ label: string; value: string }>>([
    { label: "Semua Kelas", value: ALL_FILTER_VALUE },
]);

const columns = [
    { accessorKey: "index", header: "NO" },
    { accessorKey: "identitas", header: "IDENTITAS SISWA" },
    { accessorKey: "kelas_program", header: "KELAS & PROGRAM" },
    { accessorKey: "status_pkl", header: "STATUS PKL" },
    { accessorKey: "kelayakan", header: "KELAYAKAN" },
    { accessorKey: "ttl_gender", header: "TTL & GENDER" },
    { accessorKey: "alamat", header: "ALAMAT" },
    { accessorKey: "kontak", header: "KONTAK (WA)" },
    { accessorKey: "actions", header: "AKSI" },
];

const detailModalDescription = computed(() =>
    selectedSiswa.value
        ? `Ringkasan penempatan PKL aktif untuk ${selectedSiswa.value.nama_siswa || "siswa terpilih"}.`
        : "Ringkasan penempatan PKL aktif siswa terpilih.",
);

function parsePklRows(result: any) {
    const payload = result?.data;

    if (Array.isArray(payload)) {
        return {
            rows: payload as Siswa[],
            meta: result?.meta || result?.pagination || null,
        };
    }

    if (Array.isArray(payload?.data)) {
        return {
            rows: payload.data as Siswa[],
            meta:
                payload.meta ||
                payload.pagination ||
                result?.meta ||
                result?.pagination ||
                null,
        };
    }

    return {
        rows: [] as Siswa[],
        meta:
            payload?.meta ||
            payload?.pagination ||
            result?.meta ||
            result?.pagination ||
            null,
    };
}

function normalizePklParams(filteredOnly: boolean) {
    if (!filteredOnly) {
        return {
            search: undefined,
            id_kelas: undefined,
        };
    }

    const selectedKelas = filters.value.kelas;
    return {
        search: filters.value.search || undefined,
        id_kelas:
            selectedKelas && selectedKelas !== ALL_FILTER_VALUE
                ? selectedKelas
                : undefined,
    };
}

async function collectPklRowsForExport(filteredOnly: boolean) {
    const limit = 200;
    let page = 1;
    let totalPages = 1;
    const collected: Siswa[] = [];
    const params = normalizePklParams(filteredOnly);

    while (page <= totalPages) {
        const result = await getPklStudents({
            page,
            limit,
            ...params,
        });

        if (!result?.success) {
            throw new Error(result?.message || "Gagal mengambil data siswa PKL");
        }

        const { rows, meta } = parsePklRows(result);
        collected.push(...rows);

        const parsedTotalPages = Number(meta?.totalPages || 1);
        const parsedTotal = Number(meta?.total || collected.length);

        if (Number.isFinite(parsedTotalPages) && parsedTotalPages > 0) {
            totalPages = parsedTotalPages;
        } else {
            totalPages = Math.max(1, Math.ceil(parsedTotal / limit));
        }

        page += 1;
    }

    return collected;
}

function mapPklRowsToExport(rows: Siswa[]) {
    return rows.map((item, index) => ({
        NO: index + 1,
        NIS: item.nis || "-",
        NISN: item.nisn || "-",
        NAMA: item.nama_siswa || "-",
        JENIS_KELAMIN:
            item.jenis_kelamin === "L"
                ? "Laki-laki"
                : item.jenis_kelamin === "P"
                  ? "Perempuan"
                  : "-",
        TEMPAT_LAHIR: item.tempat_lahir || "-",
        TANGGAL_LAHIR: item.tanggal_lahir || "-",
        KELAS: item.kelas?.nama_kelas || "-",
        JURUSAN: item.kelas?.jurusan?.nama_jurusan || "-",
        STATUS_SISWA: item.status_siswa || "-",
        STATUS_PKL: item.pkl_status_label || (item.penempatan?.[0] ? "Sedang PKL" : "Belum PKL"),
        KELAYAKAN_PKL: item.pkl_eligibility_label || "Belum Siap",
        ALASAN_KELAYAKAN: item.pkl_eligibility_reasons?.join("; ") || "-",
        PERUSAHAAN_AKTIF: item.penempatan?.[0]?.perusahaan?.nama_perusahaan || "-",
        TANGGAL_MULAI_PKL: item.penempatan?.[0]?.tanggal_mulai || "-",
        TANGGAL_SELESAI_PKL: item.penempatan?.[0]?.tanggal_selesai || "-",
        ALAMAT: item.alamat || "-",
        NO_HP: item.no_hp || "-",
        EMAIL: item.email || "-",
    }));
}

async function downloadPklExport(rows: Siswa[], prefix: string) {
    const XLSX = await import("xlsx").then((m) => m.default || m);
    const worksheet = XLSX.utils.json_to_sheet(mapPklRowsToExport(rows));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

    XLSX.writeFile(workbook, `${prefix}_${stamp}.xlsx`);
}

async function exportFilteredData() {
    try {
        const rows = await collectPklRowsForExport(true);

        if (!rows.length) {
            toast.add({
                title: "Tidak ada data",
                description: "Tidak ada data siswa PKL sesuai filter untuk diunduh.",
                color: "warning",
            });
            return;
        }

        await downloadPklExport(rows, "Data_Siswa_PKL_Filtered");

        toast.add({
            title: "Unduh berhasil",
            description: `${rows.length} data siswa PKL (hasil filter) berhasil diunduh.`,
            color: "success",
        });
    } catch (error: any) {
        console.error("[SiswaPKL] Error export filtered:", error);
        toast.add({
            title: "Gagal mengunduh",
            description: error?.message || "Terjadi kesalahan saat mengunduh data terpilih.",
            color: "error",
        });
    }
}

async function exportAllData() {
    try {
        const rows = await collectPklRowsForExport(false);

        if (!rows.length) {
            toast.add({
                title: "Tidak ada data",
                description: "Data siswa PKL tidak tersedia untuk backup.",
                color: "warning",
            });
            return;
        }

        await downloadPklExport(rows, "Backup_Siswa_PKL");

        toast.add({
            title: "Backup berhasil",
            description: `${rows.length} data siswa PKL berhasil diunduh sebagai backup.`,
            color: "success",
        });
    } catch (error: any) {
        console.error("[SiswaPKL] Error export all:", error);
        toast.add({
            title: "Gagal backup",
            description: error?.message || "Terjadi kesalahan saat mengunduh backup data.",
            color: "error",
        });
    }
}

function getPKLStatusColor(status?: Siswa["pkl_status"]) {
    if (status === "placed") return "info";
    return "neutral";
}

function getEligibilityColor(status?: Siswa["pkl_eligibility_status"]) {
    switch (status) {
        case "siap":
            return "success";
        case "sedang_pkl":
            return "info";
        default:
            return "warning";
    }
}

async function fetchKelasOptions() {
    try {
        const result = await getAllKelas({ page: 1, limit: 200 });
        if (!result.success || !result.data) {
            return;
        }

        const rows = Array.isArray(result.data)
            ? result.data
            : result.data.data || [];

        const mappedKelasOptions = rows
            .map((item) => ({
                label: item.nama_kelas,
                value: String(item.id_kelas ?? "").trim(),
            }))
            .filter((item) => item.value.length > 0);

        kelasOptions.value = [
            { label: "Semua Kelas", value: ALL_FILTER_VALUE },
            ...mappedKelasOptions,
        ];
    } catch (error) {
        console.error("[SiswaPKL] Error fetching kelas:", error);
    }
}

async function fetchData() {
    loading.value = true;
    try {
        const selectedKelas = filters.value.kelas;

        const result = await getPklStudents({
            page: pagination.value.page,
            limit: pagination.value.limit,
            id_kelas:
                selectedKelas && selectedKelas !== ALL_FILTER_VALUE
                    ? selectedKelas
                    : undefined,
            search: filters.value.search || undefined,
        });

        if (result.success) {
            const { rows, meta } = parsePklRows(result);
            siswaList.value = rows;
            pagination.value.total = Number(meta?.total || rows.length);
        }
    } catch (err) {
        console.error("[SiswaPKL] Error fetching:", err);
    } finally {
        loading.value = false;
    }
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function viewDetail(siswa: Siswa) {
    selectedSiswa.value = siswa;
    showDetailModal.value = true;
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

watch(
    () => filters.value.kelas,
    () => {
        pagination.value.page = 1;
        fetchData();
    },
);

onMounted(() => {
    fetchKelasOptions();
    fetchData();
});

useHead({ title: "Monitoring Siswa PKL | Tata Usaha" });
</script>
