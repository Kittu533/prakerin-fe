<script setup lang="ts">
import { ref, onMounted, h, computed } from "vue";
import {
    useMonitoringApi,
    type MonitoringSiswa,
    type MonitoringStats,
} from "~/composables/api/use-internship";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const { getSiswaMonitoring, getStats } = useMonitoringApi();

const loading = ref(true);
const apiError = ref(false);
const search = ref("");
const filterYear = ref("2024/2025");
const filterJurusan = ref("Semua");
const filterKelas = ref("Semua");
const filterStatus = ref("Semua");

const stats = reactive<MonitoringStats>({
    total: 0,
    aktif: 0,
    selesai: 0,
    baik: 0,
    perhatian: 0,
    kritis: 0,
});

const data = ref<MonitoringSiswa[]>([]);

// Column helper for TanStack Table
const columnHelper = createColumnHelper<MonitoringSiswa>();

// Define columns using TanStack Table format
const columns: ColumnDef<MonitoringSiswa, any>[] = [
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
            const initials = row.original.siswa
                .split(" ")
                .map((n: string) => n[0])
                .join("");
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
                        row.original.siswa,
                    ),
                    h(
                        "p",
                        { class: "text-xs text-slate-500 truncate" },
                        `${row.original.kelas} • ${row.original.jurusan}`,
                    ),
                ]),
            ]);
        },
    },
    {
        id: "perusahaan",
        header: "Perusahaan",
        cell: ({ row }) => {
            return h("div", {}, [
                h(
                    "p",
                    { class: "text-sm font-medium text-slate-900" },
                    row.original.perusahaan,
                ),
                h(
                    "p",
                    { class: "text-xs text-slate-500" },
                    row.original.bidang_usaha,
                ),
            ]);
        },
    },
    {
        id: "absensi",
        header: "Absensi",
        cell: ({ row }) => {
            const percentage = row.original.persentase_hadir;
            const colorClass =
                percentage >= 85
                    ? "bg-green-500"
                    : percentage >= 70
                      ? "bg-amber-500"
                      : "bg-red-500";
            const textClass =
                percentage >= 85
                    ? "text-green-600"
                    : percentage >= 70
                      ? "text-amber-600"
                      : "text-red-600";
            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "div",
                    {
                        class: "w-16 h-2 bg-slate-100 rounded-full overflow-hidden",
                    },
                    [
                        h("div", {
                            class: `h-full rounded-full ${colorClass}`,
                            style: { width: `${percentage}%` },
                        }),
                    ],
                ),
                h("span", { class: `text-sm ${textClass}` }, `${percentage}%`),
            ]);
        },
    },
    {
        id: "logbook",
        header: "Logbook",
        cell: ({ row }) => {
            const total = row.original.total_logbook;
            const target = row.original.target_logbook;
            const percentage = row.original.persentase_logbook;
            const colorClass =
                percentage >= 75
                    ? "bg-green-500"
                    : percentage >= 50
                      ? "bg-amber-500"
                      : "bg-red-500";
            return h("div", { class: "flex flex-col gap-1" }, [
                h("div", { class: "flex items-center gap-2" }, [
                    h(
                        "div",
                        {
                            class: "w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden",
                        },
                        [
                            h("div", {
                                class: `h-full rounded-full ${colorClass}`,
                                style: { width: `${percentage}%` },
                            }),
                        ],
                    ),
                    h(
                        "span",
                        { class: "text-xs text-slate-600" },
                        `${total}/${target}`,
                    ),
                ]),
            ]);
        },
    },
    {
        id: "kunjungan",
        header: "Kunjungan",
        cell: ({ row }) => {
            return h("div", { class: "flex items-center gap-1" }, [
                h(
                    "svg",
                    {
                        class: "w-3.5 h-3.5 text-slate-400",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": 2,
                    },
                    [
                        h("path", { d: "M15 10l5 5-5 5" }),
                        h("path", { d: "M4 4v7a4 4 0 0 0 4 4h12" }),
                    ],
                ),
                h(
                    "span",
                    { class: "text-sm text-slate-600" },
                    row.original.total_kunjungan,
                ),
            ]);
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status_monitoring;
            const statusConfig = {
                baik: { label: "Baik", class: "bg-green-50 text-green-700" },
                perhatian: {
                    label: "Perhatian",
                    class: "bg-amber-50 text-amber-700",
                },
                kritis: { label: "Kritis", class: "bg-red-50 text-red-700" },
            };
            const config = statusConfig[status] || statusConfig.baik;
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.class}`,
                },
                config.label,
            );
        },
    },
    {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => {
            return h(
                "button",
                {
                    class: "text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1",
                    onClick: () => viewDetail(row.original),
                },
                [
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
                    h("span", "Detail"),
                ],
            );
        },
    },
];

// Computed for local filtering
const filteredData = computed(() => {
    return data.value.filter((d) => {
        const matchSearch =
            !search.value ||
            d.siswa.toLowerCase().includes(search.value.toLowerCase()) ||
            d.perusahaan.toLowerCase().includes(search.value.toLowerCase());
        const matchJurusan =
            filterJurusan.value === "Semua" ||
            d.jurusan.toLowerCase().includes(filterJurusan.value.toLowerCase());
        const matchKelas =
            filterKelas.value === "Semua" || d.kelas === filterKelas.value;
        const matchStatus =
            filterStatus.value === "Semua" ||
            d.status_monitoring === filterStatus.value.toLowerCase();
        return matchSearch && matchJurusan && matchKelas && matchStatus;
    });
});

async function fetchData() {
    loading.value = true;
    apiError.value = false;

    try {
        const [statsRes, dataRes] = await Promise.allSettled([
            getStats(),
            getSiswaMonitoring({ limit: 100, status_penempatan: "aktif" }),
        ]);

        // Process stats
        if (statsRes.status === "fulfilled" && statsRes.value?.success) {
            Object.assign(stats, statsRes.value.data);
        }

        // Process data
        if (dataRes.status === "fulfilled" && dataRes.value?.success) {
            data.value = dataRes.value.data;
        }

        // If both failed, show empty state
        if (statsRes.status === "rejected" && dataRes.status === "rejected") {
            console.warn("[Monitoring] API failed, showing empty state");
            data.value = [];
            Object.assign(stats, {
                total: 0,
                aktif: 0,
                selesai: 0,
                baik: 0,
                perhatian: 0,
                kritis: 0,
            });
        }
    } catch (err) {
        console.error("[Monitoring] Error fetching data:", err);
        apiError.value = true;
        data.value = [];
        Object.assign(stats, {
            total: 0,
            aktif: 0,
            selesai: 0,
            baik: 0,
            perhatian: 0,
            kritis: 0,
        });
    } finally {
        loading.value = false;
    }
}

const viewDetail = (item: MonitoringSiswa) => {
    navigateTo(`/admin/monitoring/${item.id_penempatan}`);
};

onMounted(() => {
    fetchData();
});

useHead({ title: "Monitoring | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                Monitoring PKL
            </h1>
            <p class="text-sm text-slate-500">Pantau progress siswa PKL</p>
        </div>

        <!-- Stats -->
        <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <USkeleton v-for="i in 4" :key="i" class="h-20 rounded-xl" />
        </div>
        <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-slate-900">
                    {{ stats.total }}
                </p>
                <p class="text-sm text-slate-500">Total Siswa</p>
            </div>
            <div
                class="bg-white rounded-xl border border-green-200 bg-green-50/50 p-4 text-center"
            >
                <p class="text-2xl font-bold text-green-600">
                    {{ stats.baik }}
                </p>
                <p class="text-sm text-green-600/70">Baik</p>
            </div>
            <div
                class="bg-white rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-center"
            >
                <p class="text-2xl font-bold text-amber-600">
                    {{ stats.perhatian }}
                </p>
                <p class="text-sm text-amber-600/70">Perlu Perhatian</p>
            </div>
            <div
                class="bg-white rounded-xl border border-red-200 bg-red-50/50 p-4 text-center"
            >
                <p class="text-2xl font-bold text-red-600">
                    {{ stats.kritis }}
                </p>
                <p class="text-sm text-red-600/70">Kritis</p>
            </div>
        </div>

        <!-- Table -->
        <CommonAppDataTable
            :data="filteredData"
            :columns="columns"
            :loading="loading"
            title="Daftar Siswa"
            description="Pantau progress siswa PKL"
            :searchable="false"
            empty-title="Tidak ada data siswa"
            empty-description="Belum ada siswa yang dipantau"
            empty-icon="lucide:users"
        >
            <template #toolbar-left>
                <UInput
                    v-model="search"
                    placeholder="Cari siswa atau perusahaan..."
                    class="flex-1"
                >
                    <template #leading
                        ><Icon
                            name="lucide:search"
                            class="w-4 h-4 text-slate-400"
                    /></template>
                </UInput>
                <USelectMenu
                    v-model="filterStatus"
                    :items="['Semua', 'Baik', 'Perhatian', 'Kritis']"
                    class="w-full sm:w-32"
                >
                    <template #label>
                        <div class="flex items-center gap-2">
                            <Icon
                                name="lucide:filter"
                                class="w-4 h-4 text-slate-400"
                            />
                            {{ filterStatus }}
                        </div>
                    </template>
                </USelectMenu>
                <USelectMenu
                    v-model="filterJurusan"
                    :items="['Semua', 'RPL', 'TKJ', 'MM', 'AKL']"
                    class="w-full sm:w-28"
                />
            </template>
        </CommonAppDataTable>
    </div>
</template>
