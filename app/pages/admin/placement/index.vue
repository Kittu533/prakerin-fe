<script setup lang="ts">
import { ref, onMounted, computed, watch, h } from "vue";
import {
    usePenempatanApi,
    type Penempatan,
} from "~/composables/api/use-internship";
import { useSiswaApi, useGuruApi } from "~/composables/api/use-academic";
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

// State
const loading = ref(true);
const search = ref("");
const filterStatus = ref("Semua");
const data = ref<Penempatan[]>([]);

// Stats
const stats = reactive({ aktif: 0, selesai: 0, dibatalkan: 0 });

// Options
const siswaOptions = ref<{ label: string; value: string }[]>([]);
const perusahaanOptions = ref<{ label: string; value: string }[]>([]);
const guruOptions = ref<{ label: string; value: string }[]>([]);

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
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        color === "success"
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
        return matchSearch && matchStatus;
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
        const [siswaRes, perusahaanRes, guruRes] = await Promise.all([
            siswaApi.getAll({ limit: 1000 }),
            perusahaanApi.getAll({ limit: 100 }),
            guruApi.getAll({ limit: 100 }),
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
    } catch (error) {
        console.error("Failed to fetch options:", error);
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
            <UButton icon="lucide:plus" @click="navigateToCreate">
                Tambah Penempatan
            </UButton>
        </div>

        <!-- Stats -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <USkeleton v-for="i in 3" :key="i" class="h-20 rounded-xl" />
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-green-600">
                    {{ stats.aktif }}
                </p>
                <p class="text-sm text-slate-500">Aktif</p>
            </div>
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-blue-600">
                    {{ stats.selesai }}
                </p>
                <p class="text-sm text-slate-500">Selesai</p>
            </div>
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-red-600">
                    {{ stats.dibatalkan }}
                </p>
                <p class="text-sm text-slate-500">Dibatalkan</p>
            </div>
        </div>

        <!-- Table -->
        <CommonAppDataTable
            :data="filteredData"
            :columns="columns"
            :loading="loading"
            title="Daftar Penempatan"
            description="Kelola penempatan siswa di industri"
            :searchable="false"
            empty-title="Tidak ada data penempatan"
            empty-description="Belum ada penempatan siswa di industri"
            empty-icon="lucide:building-2"
        >
            <template #toolbar-left>
                <UInput
                    v-model="search"
                    placeholder="Cari siswa atau perusahaan..."
                    class="flex-1"
                >
                    <template #leading>
                        <Icon
                            name="lucide:search"
                            class="w-4 h-4 text-slate-400"
                        />
                    </template>
                </UInput>
                <USelectMenu
                    v-model="filterStatus"
                    :items="statusOptions"
                    class="w-full sm:w-40"
                />
            </template>
        </CommonAppDataTable>

        <!-- Empty State -->
        <div
            v-if="!loading && data.length === 0"
            class="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200"
        >
            <Icon
                name="lucide:building-2"
                class="w-12 h-12 mx-auto mb-3 text-slate-300"
            />
            <p>Belum ada data penempatan</p>
            <p class="text-sm mt-2">
                Klik "Tambah Penempatan" untuk menambah data baru
            </p>
        </div>
    </div>
</template>
