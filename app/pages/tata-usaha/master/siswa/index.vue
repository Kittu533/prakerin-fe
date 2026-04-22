<template>
    <div class="space-y-4">
        <!-- Mass Management Section -->
        <MassManagementCard
            ref="massCard"
            entity-name="Siswa"
            :loading="uploading"
            @upload="handleUpload"
            @download-template="downloadTemplate"
            @export-filtered="exportFilteredData"
            @export-all="exportAllData"
        />

        <!-- Filters Section -->
        <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div class="md:col-span-5 flex w-full flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700"
                        >Cari Data</label
                    >
                    <UInput
                        v-model="filters.search"
                        class="w-full"
                        placeholder="Nama, NIS, atau Kelas..."
                        icon="i-heroicons-magnifying-glass"
                        size="lg"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500',
                        }"
                    />
                </div>
                <div class="md:col-span-3 flex w-full flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700"
                        >Filter Kelas</label
                    >
                    <USelectMenu
                        v-model="filters.kelas"
                        class="w-full"
                        :items="kelasOptions"
                        value-key="value"
                        label-key="label"
                        size="lg"
                        placeholder="Pilih Kelas"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500',
                        }"
                    />
                </div>
                <div class="md:col-span-2 flex w-full flex-col gap-1.5">
                    <label class="text-sm font-semibold text-slate-700"
                        >Kelayakan PKL</label
                    >
                    <USelectMenu
                        v-model="filters.eligibilityStatus"
                        class="w-full"
                        :items="eligibilityOptions"
                        value-key="value"
                        label-key="label"
                        size="lg"
                        placeholder="Semua Status"
                        :ui="{
                            rounded: 'rounded-lg',
                            base: 'h-11 shadow-none border-slate-200 focus:ring-blue-500',
                        }"
                    />
                </div>
                <div class="md:col-span-2 flex w-full md:items-end">
                    <UButton
                        variant="outline"
                        color="neutral"
                        block
                        size="lg"
                        class="h-11 w-full justify-center whitespace-nowrap border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                        @click="fetchData"
                    >
                        <Icon
                            name="i-heroicons-arrow-path"
                            class="w-4 h-4 mr-2"
                        />
                        Refresh Data
                    </UButton>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div
            class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
        >
            <div v-if="loading" class="p-4 space-y-3">
                <USkeleton v-for="i in 5" :key="i" class="h-12 rounded-lg" />
            </div>
            <UTable
                v-else
                :data="siswaList"
                :columns="columns"
                :ui="{
                    th: {
                        base: 'bg-slate-50 text-slate-900 font-bold uppercase text-[10px] tracking-wider py-4',
                    },
                    td: { base: 'py-4 align-middle' },
                }"
            >
                <!-- No Column -->
                <template #index-cell="{ row }">
                    <span class="text-sm text-slate-500 px-2">{{
                        (pagination.page - 1) * pagination.limit + row.index + 1
                    }}</span>
                </template>

                <!-- Identitas Siswa Column -->
                <template #identitas-cell="{ row }">
                    <div class="space-y-0.5">
                        <p class="font-bold text-slate-900">
                            {{ row.original.nama_siswa }}
                        </p>
                        <div
                            class="flex items-center gap-2 text-[10px] text-slate-500 font-medium"
                        >
                            <span>NIS. {{ row.original.nis }}</span>
                            <span
                                v-if="row.original.nisn"
                                class="text-slate-300"
                                >|</span
                            >
                            <span v-if="row.original.nisn"
                                >NISN. {{ row.original.nisn }}</span
                            >
                        </div>
                    </div>
                </template>

                <!-- Kelas & Program Column -->
                <template #kelas_program-cell="{ row }">
                    <div class="space-y-0.5">
                        <p class="font-semibold text-slate-800 text-sm">
                            {{ row.original.kelas?.nama_kelas || "-" }}
                        </p>
                        <p class="text-[10px] text-slate-500 uppercase">
                            {{
                                row.original.kelas?.jurusan?.nama_jurusan || "-"
                            }}
                        </p>
                    </div>
                </template>

                <template #status_pkl-cell="{ row }">
                    <div class="space-y-1">
                        <UBadge
                            variant="subtle"
                            :color="getPKLStatusColor(row.original.pkl_status)"
                            size="xs"
                        >
                            {{ row.original.pkl_status_label || "Belum PKL" }}
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
                            {{ row.original.pkl_eligibility_label || "Belum Siap" }}
                        </UBadge>
                        <p
                            v-if="row.original.pkl_eligibility_reasons?.length"
                            class="max-w-[220px] text-[10px] leading-4 text-slate-500 line-clamp-2"
                        >
                            {{ row.original.pkl_eligibility_reasons.join(" ") }}
                        </p>
                    </div>
                </template>

                <!-- TTL & Gender Column -->
                <template #ttl_gender-cell="{ row }">
                    <div class="space-y-0.5 text-xs">
                        <p class="text-slate-700 capitalize">
                            {{ row.original.tempat_lahir || "-" }},
                            {{
                                row.original.tanggal_lahir
                                    ? formatDate(row.original.tanggal_lahir)
                                    : "-"
                            }}
                        </p>
                        <p
                            class="text-[10px] font-bold"
                            :class="
                                row.original.jenis_kelamin === 'L'
                                    ? 'text-blue-600'
                                    : 'text-pink-600'
                            "
                        >
                            {{
                                row.original.jenis_kelamin === "L"
                                    ? "LAKI-LAKI"
                                    : "PEREMPUAN"
                            }}
                        </p>
                    </div>
                </template>

                <!-- Alamat Column -->
                <template #alamat-cell="{ row }">
                    <p
                        class="text-xs text-slate-600 max-w-[200px] line-clamp-2"
                    >
                        {{ row.original.alamat || "-" }}
                    </p>
                </template>

                <!-- Kontak Column -->
                <template #kontak-cell="{ row }">
                    <div
                        v-if="row.original.no_hp"
                        class="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold"
                    >
                        <Icon
                            name="i-heroicons-chat-bubble-left-right"
                            class="w-3.5 h-3.5"
                        />
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
                            @click="viewDetail(row.original ?? row)"
                        >
                            <Icon
                                name="i-heroicons-eye"
                                class="w-4 h-4"
                            />
                        </UButton>
                        <UButton
                            variant="outline"
                            color="neutral"
                            size="xs"
                            class="p-1.5 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded"
                            @click="openEditModal(row.original ?? row)"
                        >
                            <Icon
                                name="i-heroicons-pencil-square"
                                class="w-4 h-4"
                            />
                        </UButton>
                        <UButton
                            variant="outline"
                            color="error"
                            size="xs"
                            class="p-1.5 border-red-500 text-red-500 hover:bg-red-50 rounded"
                        >
                            <Icon name="i-heroicons-trash" class="w-4 h-4" />
                        </UButton>
                    </div>
                </template>
            </UTable>

            <!-- Pagination -->
            <div
                class="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30"
            >
                <p class="text-xs text-slate-500 font-medium">
                    Showing
                    {{ (pagination.page - 1) * pagination.limit + 1 }} to
                    {{
                        Math.min(
                            pagination.page * pagination.limit,
                            pagination.total,
                        )
                    }}
                    of {{ pagination.total }}
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
                        :disabled="
                            pagination.page * pagination.limit >=
                            pagination.total
                        "
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
            title="Detail Siswa"
            description="Informasi profil siswa, status PKL, dan kelayakan mengikuti program PKL."
            size="lg"
        >
            <template #body>
                <div v-if="detailLoading" class="p-4 space-y-3">
                    <USkeleton class="h-8 w-40 rounded-lg" />
                    <USkeleton class="h-24 w-full rounded-lg" />
                    <USkeleton class="h-24 w-full rounded-lg" />
                </div>

                <div v-else-if="selectedSiswa" class="p-4 space-y-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <UBadge
                            variant="subtle"
                            :color="getPKLStatusColor(selectedSiswa.pkl_status)"
                            size="sm"
                        >
                            {{ selectedSiswa.pkl_status_label || "Belum PKL" }}
                        </UBadge>
                        <UBadge
                            variant="subtle"
                            :color="getEligibilityColor(selectedSiswa.pkl_eligibility_status)"
                            size="sm"
                        >
                            {{ selectedSiswa.pkl_eligibility_label || "Belum Siap" }}
                        </UBadge>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-slate-500 font-medium mb-1">NIS</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedSiswa.nis }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Nama</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedSiswa.nama_siswa }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Kelas</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedSiswa.kelas?.nama_kelas || "-" }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">No. HP</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedSiswa.no_hp || "-" }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Email</p>
                            <p class="font-bold text-slate-900">
                                {{ selectedSiswa.email || "-" }}
                            </p>
                        </div>
                        <div>
                            <p class="text-slate-500 font-medium mb-1">Status Siswa</p>
                            <p class="font-bold text-slate-900 uppercase">
                                {{ selectedSiswa.status_siswa || "-" }}
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="selectedSiswa.pkl_eligibility_reasons?.length"
                        class="rounded-xl border border-amber-200 bg-amber-50 p-4"
                    >
                        <p class="mb-2 text-sm font-semibold text-amber-800">
                            Alasan Belum Siap PKL
                        </p>
                        <ul class="space-y-1 text-sm text-amber-700">
                            <li
                                v-for="reason in selectedSiswa.pkl_eligibility_reasons"
                                :key="reason"
                            >
                                • {{ reason }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    v-else
                    class="px-4 py-6 text-sm text-slate-500"
                >
                    Data siswa tidak tersedia.
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end">
                    <UButton variant="neutral" @click="closeDetailModal"
                        >Tutup</UButton
                    >
                </div>
            </template>
        </UModal>

        <!-- Edit Modal -->
        <UModal
            v-model:open="showEditModal"
            title="Edit Siswa"
            description="Perbarui data siswa yang dipilih."
            size="lg"
        >
            <template #body>
                <div class="p-4 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="NIS" required>
                            <UInput v-model="editForm.nis" class="w-full" />
                        </UFormField>
                        <UFormField label="Nama Siswa" required>
                            <UInput v-model="editForm.nama_siswa" class="w-full" />
                        </UFormField>
                        <UFormField label="Kelas" required>
                            <USelectMenu
                                v-model="editForm.id_kelas"
                                :items="kelasOptions"
                                value-key="value"
                                label-key="label"
                                class="w-full"
                            />
                        </UFormField>
                        <UFormField label="Jenis Kelamin">
                            <USelectMenu
                                v-model="editForm.jenis_kelamin"
                                :items="jenisKelaminOptions"
                                value-key="value"
                                label-key="label"
                                class="w-full"
                            />
                        </UFormField>
                        <UFormField label="Tanggal Lahir">
                            <UInput
                                v-model="editForm.tanggal_lahir"
                                type="date"
                                class="w-full"
                            />
                        </UFormField>
                        <UFormField label="No. HP">
                            <UInput v-model="editForm.no_hp" class="w-full" />
                        </UFormField>
                        <UFormField label="Email" class="col-span-2">
                            <UInput v-model="editForm.email" type="email" class="w-full" />
                        </UFormField>
                        <UFormField label="Alamat" class="col-span-2">
                            <UTextarea v-model="editForm.alamat" :rows="3" class="w-full" />
                        </UFormField>
                    </div>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2">
                    <UButton
                        variant="ghost"
                        color="neutral"
                        :disabled="editSubmitting"
                        @click="closeEditModal"
                    >
                        Batal
                    </UButton>
                    <UButton
                        color="primary"
                        :loading="editSubmitting"
                        @click="saveEditSiswa"
                    >
                        Simpan Perubahan
                    </UButton>
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
import MassManagementCard from "~/components/master/MassManagementCard.vue";

definePageMeta({ layout: "tata-usaha" });

const {
    getAll: getAllSiswa,
    getById: getSiswaById,
    update: updateSiswa,
    importExcel,
    downloadTemplate,
} = useSiswaApi();
const { getAll: getAllKelas } = useKelasApi();
const toast = useToast();

const massCard = ref<InstanceType<typeof MassManagementCard> | null>(null);
const loading = ref(false);
const uploading = ref(false);
const detailLoading = ref(false);
const editSubmitting = ref(false);
const showDetailModal = ref(false);
const showEditModal = ref(false);
const selectedSiswa = ref<Siswa | null>(null);
const editingSiswaId = ref<string | null>(null);

const editForm = ref({
    nis: "",
    nama_siswa: "",
    id_kelas: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    no_hp: "",
    email: "",
    alamat: "",
});

const jenisKelaminOptions = [
    { label: "Laki-laki", value: "L" },
    { label: "Perempuan", value: "P" },
];

const ALL_FILTER_VALUE = "__all__";

const siswaList = ref<Siswa[]>([]);
const pagination = ref({ page: 1, limit: 20, total: 0 });

const filters = ref({
    search: "",
    kelas: ALL_FILTER_VALUE,
    eligibilityStatus: ALL_FILTER_VALUE,
});

const kelasOptions = ref<Array<{ label: string; value: string }>>([
    { label: "Semua Kelas", value: ALL_FILTER_VALUE },
]);
const eligibilityOptions = [
    { label: "Semua Status", value: ALL_FILTER_VALUE },
    { label: "Siap PKL", value: "siap" },
    { label: "Belum Siap", value: "belum_siap" },
    { label: "Sedang PKL", value: "sedang_pkl" },
];

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

function parseSiswaRows(result: any) {
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

function normalizeFilterParams(filteredOnly: boolean) {
    if (!filteredOnly) {
        return {
            search: undefined,
            id_kelas: undefined,
            eligibility_status: undefined as
                | "siap"
                | "belum_siap"
                | "sedang_pkl"
                | undefined,
        };
    }

    const selectedKelas = filters.value.kelas;
    const selectedEligibility = filters.value.eligibilityStatus;

    return {
        search: filters.value.search || undefined,
        id_kelas:
            selectedKelas && selectedKelas !== ALL_FILTER_VALUE
                ? selectedKelas
                : undefined,
        eligibility_status:
            selectedEligibility && selectedEligibility !== ALL_FILTER_VALUE
                ? (selectedEligibility as
                      | "siap"
                      | "belum_siap"
                      | "sedang_pkl"
                      | undefined)
                : undefined,
    };
}

async function collectSiswaForExport(filteredOnly: boolean) {
    const limit = 200;
    let page = 1;
    let totalPages = 1;
    const collected: Siswa[] = [];
    const params = normalizeFilterParams(filteredOnly);

    while (page <= totalPages) {
        const result = await getAllSiswa({
            page,
            limit,
            ...params,
        });

        if (!result?.success) {
            throw new Error(result?.message || "Gagal mengambil data siswa");
        }

        const { rows, meta } = parseSiswaRows(result);
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

function mapSiswaToExportRows(rows: Siswa[]) {
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
        STATUS_PKL:
            item.pkl_status_label ||
            (item.penempatan?.[0] ? "Sedang PKL" : "Belum PKL"),
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

async function downloadExportRows(rows: Siswa[], prefix: string) {
    const XLSX = await import("xlsx").then((m) => m.default || m);
    const worksheet = XLSX.utils.json_to_sheet(mapSiswaToExportRows(rows));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

    XLSX.writeFile(workbook, `${prefix}_${stamp}.xlsx`);
}

async function exportFilteredData() {
    try {
        const rows = await collectSiswaForExport(true);

        if (!rows.length) {
            toast.add({
                title: "Tidak ada data",
                description: "Tidak ada data sesuai filter untuk diunduh.",
                color: "warning",
            });
            return;
        }

        await downloadExportRows(rows, "Data_Siswa_Filtered");

        toast.add({
            title: "Unduh berhasil",
            description: `${rows.length} data siswa (hasil filter) berhasil diunduh.`,
            color: "success",
        });
    } catch (error: any) {
        console.error("[MasterSiswa] Error export filtered:", error);
        toast.add({
            title: "Gagal mengunduh",
            description: error?.message || "Terjadi kesalahan saat mengunduh data terpilih.",
            color: "error",
        });
    }
}

async function exportAllData() {
    try {
        const rows = await collectSiswaForExport(false);

        if (!rows.length) {
            toast.add({
                title: "Tidak ada data",
                description: "Data siswa tidak tersedia untuk backup.",
                color: "warning",
            });
            return;
        }

        await downloadExportRows(rows, "Backup_Data_Siswa");

        toast.add({
            title: "Backup berhasil",
            description: `${rows.length} data siswa berhasil diunduh sebagai backup.`,
            color: "success",
        });
    } catch (error: any) {
        console.error("[MasterSiswa] Error export all:", error);
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
        console.error("[MasterSiswa] Error fetching kelas:", error);
    }
}

async function fetchData() {
    loading.value = true;
    try {
        const selectedKelas = filters.value.kelas;
        const selectedEligibility = filters.value.eligibilityStatus;

        const result = await getAllSiswa({
            page: pagination.value.page,
            limit: pagination.value.limit,
            search: filters.value.search || undefined,
            id_kelas:
                selectedKelas && selectedKelas !== ALL_FILTER_VALUE
                    ? selectedKelas
                    : undefined,
            eligibility_status:
                selectedEligibility && selectedEligibility !== ALL_FILTER_VALUE
                    ? (selectedEligibility as
                          | "siap"
                          | "belum_siap"
                          | "sedang_pkl"
                          | undefined)
                    : undefined,
        });

        if (result.success && result.data) {
            siswaList.value = Array.isArray(result.data)
                ? result.data
                : result.data.data || [];
            const meta = result.data.meta || result.data.pagination;
            pagination.value.total = meta?.total || 0;
        }
    } catch (err) {
        console.error("[MasterSiswa] Error fetching:", err);
    } finally {
        loading.value = false;
    }
}

async function handleUpload(file: File, mode: "append" | "replace") {
    uploading.value = true;
    try {
        const result = await importExcel(file, mode);

        if (result.success) {
            toast.add({
                title: "Berhasil",
                description: result.message || "Data siswa berhasil diunggah",
                color: "success",
            });
            massCard.value?.reset();
            fetchData();
        } else {
            toast.add({
                title: "Gagal",
                description: result.message || "Gagal mengunggah data siswa",
                color: "error",
            });
        }
    } catch (err: any) {
        console.error("[MasterSiswa] Error uploading:", err);
        toast.add({
            title: "Error",
            description:
                err.message || "Terjadi kesalahan sistem saat mengunggah",
            color: "error",
        });
    } finally {
        uploading.value = false;
    }
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

async function viewDetail(siswa?: Partial<Siswa> | null) {
    if (!siswa) {
        return;
    }

    selectedSiswa.value = siswa as Siswa;
    showDetailModal.value = true;

    if (!siswa.id_siswa) {
        return;
    }

    detailLoading.value = true;
    try {
        const result = await getSiswaById(siswa.id_siswa);
        if (result.success && result.data) {
            selectedSiswa.value = result.data;
        }
    } catch (error) {
        console.error("[MasterSiswa] Error fetching detail siswa:", error);
    } finally {
        detailLoading.value = false;
    }
}

function closeDetailModal() {
    showDetailModal.value = false;
    selectedSiswa.value = null;
    detailLoading.value = false;
}

function toDateInputValue(value?: string | null) {
    if (!value) return "";
    return value.includes("T") ? value.split("T")[0] : value;
}

function openEditModal(siswa?: Partial<Siswa> | null) {
    if (!siswa?.id_siswa) {
        return;
    }

    editingSiswaId.value = siswa.id_siswa;
    editForm.value = {
        nis: siswa.nis || "",
        nama_siswa: siswa.nama_siswa || "",
        id_kelas: siswa.id_kelas || "",
        jenis_kelamin: siswa.jenis_kelamin || "",
        tanggal_lahir: toDateInputValue(siswa.tanggal_lahir),
        no_hp: siswa.no_hp || "",
        email: siswa.email || "",
        alamat: siswa.alamat || "",
    };

    showEditModal.value = true;
}

function closeEditModal() {
    showEditModal.value = false;
    editSubmitting.value = false;
    editingSiswaId.value = null;
}

async function saveEditSiswa() {
    if (!editingSiswaId.value) {
        return;
    }

    if (!editForm.value.nis.trim() || !editForm.value.nama_siswa.trim()) {
        toast.add({
            title: "Validasi gagal",
            description: "NIS dan Nama Siswa wajib diisi.",
            color: "warning",
        });
        return;
    }

    if (!editForm.value.id_kelas || editForm.value.id_kelas === ALL_FILTER_VALUE) {
        toast.add({
            title: "Validasi gagal",
            description: "Kelas wajib dipilih.",
            color: "warning",
        });
        return;
    }

    editSubmitting.value = true;
    try {
        const result = await updateSiswa(editingSiswaId.value, {
            nis: editForm.value.nis.trim(),
            nama_siswa: editForm.value.nama_siswa.trim(),
            id_kelas: editForm.value.id_kelas,
            jenis_kelamin: editForm.value.jenis_kelamin || undefined,
            tanggal_lahir: editForm.value.tanggal_lahir || undefined,
            no_hp: editForm.value.no_hp || undefined,
            email: editForm.value.email || undefined,
            alamat: editForm.value.alamat || undefined,
        });

        if (!result.success) {
            toast.add({
                title: "Gagal memperbarui",
                description: result.message || "Data siswa gagal diperbarui.",
                color: "error",
            });
            return;
        }

        toast.add({
            title: "Berhasil",
            description: "Data siswa berhasil diperbarui.",
            color: "success",
        });

        closeEditModal();
        await fetchData();
    } catch (error: any) {
        console.error("[MasterSiswa] Error update siswa:", error);
        toast.add({
            title: "Error",
            description: error?.message || "Terjadi kesalahan saat menyimpan perubahan.",
            color: "error",
        });
    } finally {
        editSubmitting.value = false;
    }
}

function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
}

watch(
    () => [filters.value.kelas, filters.value.eligibilityStatus],
    () => {
        pagination.value.page = 1;
        fetchData();
    },
);

onMounted(() => {
    fetchKelasOptions();
    fetchData();
});

useHead({ title: "Data Siswa | Tata Usaha" });
</script>
