<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                Siswa Bimbingan
            </h1>
            <p class="text-sm text-slate-500">
                Daftar siswa PKL yang Anda bimbing
            </p>
        </div>

        <!-- Error State -->
        <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-xl p-4 text-center"
        >
            <Icon
                name="lucide:alert-circle"
                class="w-8 h-8 text-red-400 mx-auto mb-2"
            />
            <p class="text-red-600">{{ error }}</p>
            <UButton
                color="primary"
                variant="soft"
                size="sm"
                class="mt-2"
                @click="fetchData"
                >Coba Lagi</UButton
            >
        </div>

        <!-- Data Table -->
        <CommonAppDataTable
            v-else
            :data="data"
            :columns="columns"
            :loading="loading"
            :searchable="true"
            search-placeholder="Cari nama siswa atau NIS..."
            empty-title="Tidak ada siswa bimbingan"
            empty-description="Belum ada siswa PKL yang sedang menjalankan magang di perusahaan Anda"
            empty-icon="lucide:users"
            page-size="10"
        >
            <template #toolbar-right>
                <UButton
                    icon="i-lucide-refresh-cw"
                    size="sm"
                    color="neutral"
                    variant="outline"
                    :loading="loading"
                    @click="fetchData"
                >
                    Refresh
                </UButton>
            </template>
        </CommonAppDataTable>
    </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";
import { apiFetch } from "~/composables/api-fetch";

definePageMeta({ layout: "mentor" });

const toast = useToast();

const loading = ref(true);
const error = ref<string | null>(null);
const data = ref<any[]>([]);

const columnHelper = createColumnHelper<any>();

// Helper functions
function getInitials(name: string) {
    return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("siswa.nama_siswa", {
        id: "nama",
        header: "Siswa",
        cell: (info) => {
            const row = info.row.original;
            const namaSiswa = row.siswa?.nama_siswa;
            const nis = row.siswa?.nis;
            const initials = getInitials(namaSiswa || "XX");

            return h("div", { class: "flex items-center gap-3" }, [
                h(
                    "div",
                    {
                        class: "w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold",
                    },
                    initials,
                ),
                h("div", { class: "min-w-0" }, [
                    h(
                        "p",
                        {
                            class: "text-sm font-medium text-slate-900 truncate",
                        },
                        namaSiswa || `Siswa #${row.siswa_id}`,
                    ),
                    h(
                        "p",
                        { class: "text-xs text-slate-500 truncate" },
                        nis || "-",
                    ),
                ]),
            ]);
        },
    }),
    columnHelper.accessor("siswa.kelas.nama_kelas", {
        id: "kelas",
        header: "Kelas",
        cell: (info) => {
            const kelas = info.row.original.siswa?.kelas;
            return h(
                "span",
                { class: "text-sm text-slate-700" },
                kelas?.nama_kelas || "-",
            );
        },
    }),
    columnHelper.accessor("tanggal_mulai", {
        id: "periode",
        header: "Periode PKL",
        cell: (info) => {
            const row = info.row.original;
            const mulai = formatDate(row.tanggal_mulai);
            const selesai = formatDate(row.tanggal_selesai);
            return h(
                "span",
                { class: "text-sm text-slate-700" },
                `${mulai} - ${selesai}`,
            );
        },
    }),
    columnHelper.accessor("status_penempatan", {
        id: "status",
        header: "Status",
        cell: (info) => {
            const status = info.getValue() as string;
            const isActive = status === "aktif";
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                    }`,
                },
                isActive ? "Aktif" : status,
            );
        },
    }),
    columnHelper.display({
        id: "aksi",
        header: "",
        cell: (info) => {
            const id = info.row.original.id_penempatan;
            return h(
                "a",
                {
                    href: `/mentor/siswa/${id}`,
                    class: "inline-flex items-center justify-center p-1.5 rounded-lg text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors",
                },
                [
                    h(
                        "svg",
                        {
                            xmlns: "http://www.w3.org/2000/svg",
                            width: "16",
                            height: "16",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            "stroke-width": "2",
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                        },
                        [
                            h("path", {
                                d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",
                            }),
                            h("circle", { cx: "12", cy: "12", r: "3" }),
                        ],
                    ),
                ],
            );
        },
    }),
];

// Fetch data
async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
        const response = await apiFetch<any>(
            "PlacementService",
            "/penempatan/mentor/me",
        );

        if (response.data.success) {
            data.value = response.data.data || [];
        } else {
            error.value = response.data.message || "Gagal memuat data siswa";
        }
    } catch (e: any) {
        console.error("Error fetching mentor students:", e);
        error.value = e.response?.data?.message || "Gagal memuat data siswa";
        toast.add({
            title: "Error",
            description: error.value,
            color: "red",
        });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchData();
});

useHead({ title: "Siswa Bimbingan | Mentor" });
</script>
