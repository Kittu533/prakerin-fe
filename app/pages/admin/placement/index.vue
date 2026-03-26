<script setup lang="ts">
import { ref, onMounted, computed, watch, h } from "vue";
import {
    usePenempatanApi,
    type Penempatan,
} from "~/composables/api/use-internship";
import { useSiswaApi, useGuruApi, useTahunAjaranApi } from "~/composables/api/use-academic";
import { usePeriodePKLApi } from "~/composables/api/use-periode-pkl";
import { usePerusahaanApi } from "~/composables/api/use-partner";
import {
    getInitials,
    extractKelasFromLabel,
    extractNameFromLabel,
} from "~/utils/string-helpers";
import { formatDate } from "~/utils/format-date";
import { getStatusColor, getStatusLabel } from "~/utils/status-helpers";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const router = useRouter();
const toast = useToast();
const penempatanApi = usePenempatanApi();
const siswaApi = useSiswaApi();
const guruApi = useGuruApi();
const perusahaanApi = usePerusahaanApi();
const periodePKLApi = usePeriodePKLApi();
const tahunAjaranApi = useTahunAjaranApi();

// State
const loading = ref(true);
const search = ref("");
const filterStatus = ref("Semua");
const filterPeriode = ref<string | null>(null);

const data = ref<Penempatan[]>([]);

// Smart Draft State
const isSmartDraftModalOpen = ref(false);
const isGeneratingDraft = ref(false);
const selectedTahunAjaranForDraft = ref("");
const smartDraftResult = ref<{
    summary: {
        total_unplaced_students: number;
        total_matched: number;
        total_remaining: number;
    };
    drafts: any[];
} | null>(null);

// Stats
const stats = reactive({ aktif: 0, selesai: 0, dibatalkan: 0 });

// Options
const siswaOptions = ref<{ label: string; value: string }[]>([]);
const perusahaanOptions = ref<{ label: string; value: string }[]>([]);
const guruOptions = ref<{ label: string; value: string }[]>([]);

const periodeOptions = ref<{ label: string; value: string }[]>([]);
const tahunAjaranOptionsForDraft = ref<{ label: string; value: string }[]>([]);

const handleGetSmartDraft = async () => {
    if (!selectedTahunAjaranForDraft.value) return;

    isGeneratingDraft.value = true;
    try {
        const response = await penempatanApi.getSmartDraft(selectedTahunAjaranForDraft.value);
        if (response.success) {
            smartDraftResult.value = response.data;
        } else {
            toast.add({
                title: "Gagal!",
                description: response.message || "Gagal menghasilkan draf cerdas.",
                color: "error"
            });
        }
    } catch (error: any) {
        toast.add({
            title: "Error",
            description: error.data?.message || "Terjadi kesalahan server.",
            color: "error"
        });
    } finally {
        isGeneratingDraft.value = false;
    }
};

// Exporting state
const exporting = ref(false);

// Column helper for TanStack Table
const columnHelper = createColumnHelper<Penempatan>();

// Define columns using TanStack Table format
const columns: ColumnDef<Penempatan, any>[] = [
    {
        id: "no",
        header: "No",
        cell: ({ row, table }) => {
            const index = table
                .getSortedRowModel()
                .rows.findIndex((r) => r.id === row.id);
            const pageSize = table.getState().pagination.pageSize;
            const pageIndex = table.getState().pagination.pageIndex;
            return h(
                "span",
                {
                    class: "text-sm text-slate-500 w-6 text-center inline-block",
                },
                pageIndex * pageSize + index + 1,
            );
        },
    },
    {
        id: "siswa",
        header: "Siswa",
        cell: ({ row }) => {
            const siswaName = getSiswaName(row.original.siswa_id);
            const kelas = getSiswaKelas(row.original.siswa_id);
            const initials = getInitials(siswaName);
            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "div",
                    {
                        class: "w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-xs font-semibold shrink-0",
                    },
                    initials,
                ),
                h("div", { class: "min-w-0" }, [
                    h(
                        "p",
                        {
                            class: "text-sm font-medium text-slate-900 truncate",
                        },
                        siswaName,
                    ),
                    h("p", { class: "text-xs text-slate-500 truncate" }, kelas),
                ]),
            ]);
        },
    },
    {
        id: "perusahaan",
        header: "Perusahaan",
        cell: ({ row }) => {
            const perusahaanName = getPerusahaanName(
                row.original.perusahaan_id,
            );
            return h("div", {}, [
                h(
                    "p",
                    { class: "text-sm font-medium text-slate-900 truncate" },
                    perusahaanName,
                ),
            ]);
        },
    },
    {
        id: "periode",
        header: "Periode",
        cell: ({ row }) => {
            return h("div", {}, [
                h(
                    "p",
                    { class: "text-sm text-slate-900" },
                    formatDate(row.original.tanggal_mulai),
                ),
                h(
                    "p",
                    { class: "text-xs text-slate-500" },
                    `s/d ${formatDate(row.original.tanggal_selesai)}`,
                ),
            ]);
        },
    },
    {
        id: "guru",
        header: "Guru Pembimbing",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-900" },
                getGuruName(row.original.guru_pembimbing_id),
            );
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const color = getStatusColor(
                row.original.status_penempatan,
                "penempatan",
            );
            const label = getStatusLabel(
                row.original.status_penempatan,
                "penempatan",
            );
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${color === "success"
                        ? "bg-success-50 text-success-700"
                        : color === "warning"
                            ? "bg-warning-50 text-warning-700"
                            : color === "error"
                                ? "bg-error-50 text-error-700"
                                : "bg-neutral-100 text-neutral-700"
                        }`,
                },
                label,
            );
        },
    },
    {
        id: "aksi",
        header: "",
        cell: ({ row }) => {
            return h("div", { class: "flex items-center gap-1" }, [
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-slate-100 text-slate-600",
                        onClick: () => navigateToDetail(row.original),
                    },
                    h(
                        "svg",
                        {
                            class: "w-4 h-4",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": 2,
                        },
                        [
                            h("path", {
                                d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",
                            }),
                            h("circle", { cx: "12", cy: "12", r: "3" }),
                        ],
                    ),
                ),
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-primary-50 text-primary-600",
                        onClick: () => navigateToEdit(row.original),
                    },
                    h(
                        "svg",
                        {
                            class: "w-4 h-4",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": 2,
                        },
                        [
                            h("path", {
                                d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
                            }),
                        ],
                    ),
                ),
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-error-50 text-error-600",
                        onClick: () => confirmDelete(row.original),
                    },
                    h(
                        "svg",
                        {
                            class: "w-4 h-4",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": 2,
                        },
                        [
                            h("path", {
                                d: "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6",
                            }),
                        ],
                    ),
                ),
            ]);
        },
    },
];

// Status options
const statusOptions = ["Semua", "Aktif", "Selesai", "Dibatalkan"];

const statusApiValue: Record<string, string> = {
    Aktif: "aktif",
    Selesai: "selesai",
    Dibatalkan: "dibatalkan",
};

// Filtered data (sorted ASC by created_at or id)
const filteredData = computed(() => {
    let result = data.value.filter((d) => {
        const siswaName = getSiswaName(d.siswa_id).toLowerCase();
        const perusahaanName = getPerusahaanName(d.perusahaan_id).toLowerCase();
        const matchSearch =
            !search.value ||
            siswaName.includes(search.value.toLowerCase()) ||
            perusahaanName.includes(search.value.toLowerCase());
        const matchStatus =
            filterStatus.value === "Semua" ||
            d.status_penempatan === statusApiValue[filterStatus.value];

        // Filter by periode
        const matchPeriode =
            !filterPeriode.value || d.id_periode_pkl === filterPeriode.value;

        return matchSearch && matchStatus && matchPeriode;
    });

    // Sort ASC by id_penempatan
    result.sort((a, b) => a.id_penempatan - b.id_penempatan);

    return result;
});

// Name resolvers
const getSiswaName = (siswaId: number) => {
    const siswa = siswaOptions.value.find((s) => s.value === siswaId);
    return siswa ? extractNameFromLabel(siswa.label) : `Siswa #${siswaId}`;
};

const getSiswaKelas = (siswaId: number) => {
    const siswa = siswaOptions.value.find((s) => s.value === siswaId);
    return siswa ? extractKelasFromLabel(siswa.label) : "-";
};

const getPerusahaanName = (perusahaanId: number) => {
    const perusahaan = perusahaanOptions.value.find(
        (p) => p.value === perusahaanId,
    );
    return perusahaan?.label || `Perusahaan #${perusahaanId}`;
};

const getGuruName = (guruId: number) => {
    const guru = guruOptions.value.find((g) => g.value === guruId);
    return guru?.label || `Guru #${guruId}`;
};

// Actions
const navigateToCreate = () => {
    router.push("/admin/placement/create");
};

const navigateToDetail = (item: Penempatan) => {
    router.push(`/admin/placement/${item.id_penempatan}`);
};

const navigateToEdit = (item: Penempatan) => {
    router.push(`/admin/placement/${item.id_penempatan}/edit`);
};

// Delete confirmation state
const isDeleteModalOpen = ref(false);
const itemToDelete = ref<Penempatan | null>(null);
const isDeleting = ref(false);

const confirmDelete = (item: Penempatan) => {
    itemToDelete.value = item;
    isDeleteModalOpen.value = true;
};

const handleDelete = async () => {
    if (!itemToDelete.value) return;

    isDeleting.value = true;
    try {
        const response = await penempatanApi.delete(itemToDelete.value.id_penempatan);
        if (response.success) {
            toast.add({
                title: "Berhasil!",
                description: "Data penempatan PKL berhasil dihapus.",
                color: "success",
                icon: "i-heroicons-check-circle"
            });
            await fetchData();
        } else {
            toast.add({
                title: "Gagal Menghapus!",
                description: response.message || "Terjadi kesalahan saat menghapus data.",
                color: "error",
                icon: "i-heroicons-x-circle"
            });
        }
    } catch (error) {
        toast.add({
            title: "Gagal Menghapus!",
            description: "Terjadi kesalahan jaringan atau server.",
            color: "error",
            icon: "i-heroicons-x-circle"
        });
    } finally {
        isDeleting.value = false;
        isDeleteModalOpen.value = false;
        itemToDelete.value = null;
    }
};

// Fetch data
const fetchData = async () => {
    loading.value = true;
    try {
        const response = await penempatanApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
            stats.aktif = data.value.filter(
                (d) => d.status_penempatan === "aktif",
            ).length;
            stats.selesai = data.value.filter(
                (d) => d.status_penempatan === "selesai",
            ).length;
            stats.dibatalkan = data.value.filter(
                (d) => d.status_penempatan === "dibatalkan",
            ).length;
        }
    } catch (error) {
        console.error("Failed to fetch penempatan:", error);
        toast.add({ title: "Gagal memuat data", color: "error" });
    } finally {
        loading.value = false;
    }
};

const fetchOptions = async () => {
    try {
        const [siswaRes, perusahaanRes, guruRes, periodeRes, tahunAjaranRes] =
            await Promise.all([
                siswaApi.getAll({ limit: 1000 }),
                perusahaanApi.getAll({ limit: 100 }),
                guruApi.getAll({ limit: 100 }),
                periodePKLApi.getAll({ limit: 100 }),
                tahunAjaranApi.getAll(),
            ]);

        if (siswaRes.success) {
            siswaOptions.value = (siswaRes.data || []).map((s) => ({
                label: `${s.nama_siswa} (${s.kelas?.nama_kelas || "-"})`,
                value: s.id_siswa,
            }));
        }
        if (perusahaanRes.success) {
            perusahaanOptions.value = (perusahaanRes.data || []).map((p) => ({
                label: p.nama_perusahaan,
                value: p.id_perusahaan,
            }));
        }
        if (guruRes.success) {
            guruOptions.value = (guruRes.data || []).map((g) => ({
                label: g.nama_guru,
                value: g.id_guru,
            }));
        }
        if (periodeRes.success) {
            periodeOptions.value = (periodeRes.data || []).map((p) => ({
                label: p.nama_periode,
                value: p.id_periode_pkl,
            }));
            console.log("Periode options loaded:", periodeOptions.value);
        }
        if (tahunAjaranRes.success) {
            tahunAjaranOptionsForDraft.value = (tahunAjaranRes.data || []).map((t) => ({
                label: t.nama_tahun_ajaran,
                value: t.id_tahun_ajaran,
            }));
        }
    } catch (error) {
        console.error("Failed to fetch options:", error);
    }
};

// Export to CSV
const exportToCSV = () => {
    exporting.value = true;
    try {
        // Define CSV headers
        const headers = [
            "No",
            "Nama Siswa",
            "Kelas",
            "NIS",
            "Perusahaan",
            "Bidang Usaha",
            "Guru Pembimbing",
            "Periode PKL",
            "Tanggal Mulai",
            "Tanggal Selesai",
            "Status",
        ];

        // Build CSV data
        const csvData = filteredData.value.map((d, index) => {
            const siswa = siswaOptions.value.find(
                (s) => s.value === d.siswa_id,
            );
            const perusahaan = perusahaanOptions.value.find(
                (p) => p.value === d.perusahaan_id,
            );
            const guru = guruOptions.value.find(
                (g) => g.value === d.guru_pembimbing_id,
            );
            const periode = periodeOptions.value.find(
                (p) => p.value === d.id_periode_pkl,
            );

            return [
                index + 1,
                siswa ? extractNameFromLabel(siswa.label) : `-`,
                siswa ? extractKelasFromLabel(siswa.label) : `-`,
                siswa?.nis || `-`,
                perusahaan?.label || `-`,
                perusahaan?.bidang_usaha || `-`,
                guru?.label || `-`,
                periode?.label || formatDate(d.tanggal_mulai),
                formatDate(d.tanggal_mulai),
                formatDate(d.tanggal_selesai),
                getStatusLabel(d.status_penempatan, "penempatan"),
            ];
        });

        // Add headers row
        csvData.unshift(headers);

        // Convert to CSV string
        const csvString = csvData
            .map((row) =>
                row
                    .map((cell) => {
                        // Escape quotes and wrap in quotes
                        const cellString = String(cell ?? "");
                        if (
                            cellString.includes(",") ||
                            cellString.includes('"') ||
                            cellString.includes("\n")
                        ) {
                            return `"${cellString.replace(/"/g, '""')}"`;
                        }
                        return cellString;
                    })
                    .join(","),
            )
            .join("\n");

        // Create blob and download
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `penempatan-pkl-${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.add({
            title: "Export berhasil",
            description: `${filteredData.value.length} data berhasil diexport ke CSV`,
            color: "success",
        });
    } catch (error) {
        console.error("Export error:", error);
        toast.add({
            title: "Export gagal",
            description: "Terjadi kesalahan saat export data",
            color: "error",
        });
    } finally {
        exporting.value = false;
    }
};

onMounted(async () => {
    await fetchOptions();
    await fetchData();
});

useHead({ title: "Penempatan PKL | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Penempatan PKL
                </h1>
                <p class="text-sm text-slate-500">
                    Kelola penempatan siswa di industri
                </p>
            </div>
            <div class="flex items-center gap-2">
                <UButton icon="lucide:sparkles" color="white" @click="isSmartDraftModalOpen = true">
                    Smart Draft
                </UButton>
                <UButton icon="lucide:plus" @click="navigateToCreate">
                    Tambah Penempatan
                </UButton>
            </div>
        </div>

        <!-- Stats -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <USkeleton v-for="i in 3" :key="i" class="h-20 rounded-xl" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p class="text-2xl font-bold text-green-600">
                    {{ stats.aktif }}
                </p>
                <p class="text-sm text-slate-500">Aktif</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p class="text-2xl font-bold text-blue-600">
                    {{ stats.selesai }}
                </p>
                <p class="text-sm text-slate-500">Selesai</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
                <p class="text-2xl font-bold text-red-600">
                    {{ stats.dibatalkan }}
                </p>
                <p class="text-sm text-slate-500">Dibatalkan</p>
            </div>
        </div>

        <!-- Table -->
        <CommonAppDataTable :data="filteredData" :columns="columns" :loading="loading" title="Daftar Penempatan"
            description="Kelola penempatan siswa di industri" :searchable="false" with-time
            empty-title="Tidak ada data penempatan" empty-description="Belum ada penempatan siswa di industri"
            empty-icon="lucide:building-2">
            <template #toolbar-left>
                <UInput v-model="search" placeholder="Cari siswa atau perusahaan..." class="flex-1">
                    <template #leading>
                        <Icon name="lucide:search" class="w-4 h-4 text-slate-400" />
                    </template>
                </UInput>
                <USelectMenu v-model="filterStatus" :items="statusOptions" placeholder="Status"
                    class="w-full sm:w-36" />
                <USelectMenu v-model="filterPeriode" :items="periodeOptions" placeholder="Periode PKL"
                    class="w-full sm:w-40">
                    <template #label>
                        <Icon name="lucide:calendar" class="w-4 h-4 text-slate-400 mr-1" />
                        {{
                            filterPeriode
                                ? periodeOptions.find(
                                    (p) => p.value === filterPeriode,
                                )?.label
                                : "Semua Periode"
                        }}
                    </template>
                </USelectMenu>
            </template>
            <template #toolbar-right>
                <UButton icon="lucide:download" variant="outline" :loading="exporting"
                    :disabled="filteredData.length === 0" @click="exportToCSV">
                    Export CSV
                </UButton>
            </template>
        </CommonAppDataTable>

        <!-- Empty State -->
        <div v-if="!loading && data.length === 0"
            class="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <Icon name="lucide:building-2" class="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Belum ada data penempatan</p>
            <p class="text-sm mt-2">
                Klik "Tambah Penempatan" untuk menambah data baru
            </p>
        </div>

        <!-- Delete Confirmation Modal -->
        <UModal v-model:open="isDeleteModalOpen">
            <template #content>
                <div class="p-6 text-center">
                    <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <Icon name="lucide:trash-2" class="w-6 h-6 text-red-600" />
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 mb-2">Konfirmasi Hapus</h3>
                    <p class="text-slate-500 text-sm mb-6">
                        Apakah Anda yakin ingin menghapus data penempatan ini? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div class="flex items-center justify-center gap-3">
                        <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false"
                            :disabled="isDeleting">
                            Batal
                        </UButton>
                        <UButton color="error" @click="handleDelete" :loading="isDeleting">
                            Hapus Data
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>

        <!-- Smart Draft Modal -->
        <UModal v-model:open="isSmartDraftModalOpen" size="xl">
            <template #content>
                <div class="p-6">
                    <div class="flex items-center gap-2 mb-2">
                        <Icon name="lucide:sparkles" class="w-5 h-5 text-primary-600" />
                        <h3 class="text-lg font-bold text-slate-900">Smart Placement Draft</h3>
                    </div>
                    <p class="text-slate-500 text-sm mb-6">
                        Gunakan algoritma cerdas untuk mencocokkan siswa dengan perusahaan berdasarkan jurusan dan kuota.
                    </p>

                    <div v-if="!smartDraftResult" class="space-y-4">
                        <UFormField label="Pilih Tahun Ajaran untuk Simulasi" required>
                            <div class="flex gap-2">
                                <USelectMenu 
                                    v-model="selectedTahunAjaranForDraft" 
                                    :items="tahunAjaranOptionsForDraft" 
                                    value-attribute="value"
                                    option-attribute="label"
                                    placeholder="Pilih Tahun Ajaran"
                                    class="flex-1"
                                />
                                <UButton 
                                    color="primary" 
                                    :loading="isGeneratingDraft" 
                                    :disabled="!selectedTahunAjaranForDraft"
                                    @click="handleGetSmartDraft"
                                >
                                    Generate Draft
                                </UButton>
                            </div>
                        </UFormField>
                    </div>

                    <div v-else class="space-y-6">
                        <!-- Summary Stats -->
                        <div class="grid grid-cols-3 gap-4">
                            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                <p class="text-xs text-slate-500 uppercase font-semibold">Belum Ditempatkan</p>
                                <p class="text-xl font-bold text-slate-900">{{ smartDraftResult.summary.total_unplaced_students }}</p>
                            </div>
                            <div class="p-3 bg-success-50 rounded-lg border border-success-100 text-center">
                                <p class="text-xs text-success-600 uppercase font-semibold">Berhasil Dicocokkan</p>
                                <p class="text-xl font-bold text-success-700">{{ smartDraftResult.summary.total_matched }}</p>
                            </div>
                            <div class="p-3 bg-warning-50 rounded-lg border border-warning-100 text-center">
                                <p class="text-xs text-warning-600 uppercase font-semibold">Sisa Siswa</p>
                                <p class="text-xl font-bold text-warning-700">{{ smartDraftResult.summary.total_remaining }}</p>
                            </div>
                        </div>

                        <!-- Draft Table -->
                        <div class="max-h-[400px] overflow-y-auto border border-slate-200 rounded-lg">
                            <table class="w-full text-sm text-left">
                                <thead class="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                                    <tr>
                                        <th class="px-4 py-2">Siswa</th>
                                        <th class="px-4 py-2">Rekomendasi Perusahaan</th>
                                        <th class="px-4 py-2">Kecocokan</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200">
                                    <tr v-for="(draft, idx) in smartDraftResult.drafts" :key="idx">
                                        <td class="px-4 py-3">
                                            <p class="font-medium text-slate-900">{{ draft.nama_siswa }}</p>
                                            <p class="text-xs text-slate-500">{{ draft.jurusan }}</p>
                                        </td>
                                        <td class="px-4 py-3">
                                            <p class="font-medium text-slate-900">{{ draft.nama_perusahaan }}</p>
                                            <p class="text-xs text-slate-500">{{ draft.bidang_usaha }}</p>
                                        </td>
                                        <td class="px-4 py-3">
                                            <UBadge size="xs" color="success" variant="subtle">MATCHED</UBadge>
                                        </td>
                                    </tr>
                                    <tr v-if="smartDraftResult.drafts.length === 0">
                                        <td colspan="3" class="px-4 py-8 text-center text-slate-500 italic">
                                            Tidak ada kecocokan otomatis yang ditemukan.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="flex justify-between items-center bg-sky-50 p-4 rounded-lg border border-sky-100">
                            <p class="text-sm text-sky-800">
                                <Icon name="lucide:info" class="w-4 h-4 inline mr-1" />
                                Draft ini bersifat simulasi dan tidak disimpan ke database secara otomatis.
                            </p>
                            <UButton color="primary" variant="ghost" @click="smartDraftResult = null">
                                Reset Simulasi
                            </UButton>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 mt-6">
                        <UButton color="neutral" variant="ghost" @click="isSmartDraftModalOpen = false">
                            Tutup
                        </UButton>
                    </div>
                </div>
            </template>
        </UModal>
    </div>
</template>
