<template>
    <div class="space-y-6">
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Siswa Bimbingan
                </h1>
                <p class="text-sm text-slate-500 mt-1">
                    Kelola dan pantau siswa PKL bimbingan Anda
                </p>
            </div>
            <UButton color="primary" disabled>
                <Icon name="lucide:download" class="w-4 h-4 mr-2" />
                Export Data
            </UButton>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-3">
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-slate-900">
                    {{ stats.totalSiswa }}
                </p>
                <p class="text-xs text-slate-500">Total Siswa</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-green-600">
                    {{ stats.aktif }}
                </p>
                <p class="text-xs text-slate-500">Aktif PKL</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-blue-600">
                    {{ stats.selesai }}
                </p>
                <p class="text-xs text-slate-500">Selesai</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-slate-500">
                    {{ stats.belowTarget }}
                </p>
                <p class="text-xs text-slate-500">Kehadiran < 80%</p>
            </div>
        </div>

        <!-- AppDataTable -->
        <AppDataTable
            :data="filteredStudents"
            :columns="columns"
            title="Daftar Siswa Bimbingan"
            description="Siswa yang sedang Anda bimbing selama PKL"
            :loading="loading"
            :searchable="true"
            search-placeholder="Cari nama siswa..."
            empty-title="Tidak ada siswa bimbingan"
            empty-description="Belum ada siswa yang ditugaskan kepada Anda"
            empty-icon="lucide:users"
        >
            <template #toolbar-right>
                <USelectMenu
                    v-model="filterStatus"
                    :items="statusOptions"
                    placeholder="Filter Status"
                    class="w-full sm:w-36"
                />
            </template>
        </AppDataTable>
    </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";
import AppDataTable from "~/components/common/AppDataTable.vue";
import { usePenempatanApi } from "~/composables/api/use-internship";

definePageMeta({ layout: "guru" });

const toast = useToast();
const columnHelper = createColumnHelper<any>();
const Icon = resolveComponent("Icon");

// API
const { getMyStudents } = usePenempatanApi();

// State
const loading = ref(true);
const filterStatus = ref<string | null>(null);
const students = ref<any[]>([]);
const stats = reactive({ totalSiswa: 0, aktif: 0, selesai: 0, belowTarget: 0 });

const statusOptions = ["Aktif", "Selesai", "Dibatalkan"];

// Filter students
const filteredStudents = computed(() => {
    if (!filterStatus.value) return students.value;
    return students.value.filter((s) => s.status === filterStatus.value);
});

// Helper function to get initials
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// Generate URL-friendly ID from UUID — use full UUID as the path segment
function generateUrlId(id: string, _nama: string): string {
    return id;
}

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        Aktif: "bg-green-100 text-green-800",
        Selesai: "bg-blue-100 text-blue-800",
        Dibatalkan: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
};

// Define columns for AppDataTable
const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("nama", {
        id: "nama",
        header: () => "Siswa",
        cell: (info) => {
            const row = info.row.original;
            return h("div", { class: "flex items-center gap-3" }, [
                h(
                    "div",
                    {
                        class: "w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-sm shrink-0",
                    },
                    row.inisial,
                ),
                h("div", { class: "min-w-0" }, [
                    h(
                        "p",
                        { class: "font-medium text-slate-900 truncate" },
                        row.nama,
                    ),
                    h("p", { class: "text-xs text-slate-500" }, row.nis),
                ]),
            ]);
        },
    }),
    columnHelper.accessor("kelas", {
        id: "kelas",
        header: () => "Kelas",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("industri", {
        id: "industri",
        header: () => "Industri",
        cell: (info) => {
            const val = info.getValue() as string;
            return h(
                "span",
                {
                    class: "text-sm text-slate-600 truncate max-w-[200px] block",
                },
                val,
            );
        },
    }),
    columnHelper.accessor("kehadiran", {
        id: "kehadiran",
        header: () => "Kehadiran",
        cell: (info) => {
            const percent = info.getValue() as number;
            const color = percent >= 80 ? "bg-green-500" : "bg-red-500";
            const textColor = percent >= 80 ? "text-green-600" : "text-red-600";
            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "div",
                    {
                        class: "w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden",
                    },
                    [
                        h("div", {
                            class: `h-full rounded-full ${color}`,
                            style: { width: `${percent}%` },
                        }),
                    ],
                ),
                h(
                    "span",
                    {
                        class: `text-sm font-medium whitespace-nowrap ${textColor}`,
                    },
                    `${percent}%`,
                ),
            ]);
        },
    }),
    columnHelper.accessor("status", {
        id: "status",
        header: () => "Status",
        cell: (info) => {
            const status = info.getValue() as string;
            const color = getStatusColor(status);
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`,
                },
                status,
            );
        },
    }),
    columnHelper.accessor("aksi", {
        id: "aksi",
        header: () => "Aksi",
        cell: (info) => {
            const row = info.row.original;
            return h(
                "button",
                {
                    class: "p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors",
                    onClick: () =>
                        navigateTo(
                            `/guru/siswa-bimbingan/${generateUrlId(row.id, row.nama)}`,
                        ),
                },
                h(Icon, {
                    name: "lucide:eye",
                    class: "w-4 h-4",
                }),
            );
        },
    }),
];

// Load data
async function loadData() {
    loading.value = true;

    try {
        const res = await getMyStudents({ limit: 100 });

        if (res?.success && res?.data) {
            students.value = res.data.map((p: any) => ({
                id: p.id_penempatan,
                nama: p.siswa?.nama_siswa || "Unknown",
                inisial: getInitials(p.siswa?.nama_siswa || "U"),
                nis: p.siswa?.nis || "-",
                kelas: p.siswa?.kelas?.nama_kelas || "-",
                industri: p.perusahaan?.nama_perusahaan || "-",
                kehadiran: p.stats?.kehadiran || 0,
                status:
                    p.status_penempatan === "aktif"
                        ? "Aktif"
                        : p.status_penempatan === "selesai"
                          ? "Selesai"
                          : "Dibatalkan",
            }));

            // Calculate stats
            stats.totalSiswa = students.value.length;
            stats.aktif = students.value.filter(
                (s) => s.status === "Aktif",
            ).length;
            stats.selesai = students.value.filter(
                (s) => s.status === "Selesai",
            ).length;
            stats.belowTarget = students.value.filter(
                (s) => s.kehadiran < 80,
            ).length;
        }
    } catch (err) {
        console.error("Failed to load students:", err);
        toast.add({ title: "Gagal memuat data siswa", color: "error" });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadData();
});

useHead({ title: "Siswa Bimbingan | Guru PKL" });
</script>
