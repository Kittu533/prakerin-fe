<script setup lang="ts">
import {
    useSiswaApi,
    useKelasApi,
    type Siswa,
} from "~/composables/api/use-academic";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const router = useRouter();
const toast = useToast();
const siswaApi = useSiswaApi();
const kelasApi = useKelasApi();

const loading = ref(true);

const data = ref<Siswa[]>([]);
const allKelas = ref<any[]>([]);

const navigateToCreate = () => {
    router.push("/admin/master/students/create");
};

const navigateToEdit = (item: Siswa) => {
    router.push(`/admin/master/students/${item.id_siswa}/edit`);
};

const navigateToDetail = (item: Siswa) => {
    router.push(`/admin/master/students/${item.id_siswa}`);
};

const getInitials = (nama: string) => {
    return nama
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const columns: ColumnDef<Siswa, any>[] = [
    {
        id: "nama",
        header: "Siswa",
        cell: ({ row }) => {
            return h("div", { class: "flex items-center gap-3" }, [
                h(
                    "div",
                    {
                        class: "w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm font-semibold shrink-0",
                    },
                    getInitials(row.original.nama_siswa),
                ),
                h("div", { class: "" }, [
                    h(
                        "p",
                        { class: "text-sm font-medium text-slate-900" },
                        row.original.nama_siswa,
                    ),
                    h(
                        "p",
                        { class: "text-xs text-slate-500" },
                        `NIS: ${row.original.nis}`,
                    ),
                ]),
            ]);
        },
    },
    {
        id: "nis",
        header: "NIS",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600 font-mono" },
                row.original.nis,
            );
        },
    },
    {
        id: "kelas",
        header: "Kelas",
        cell: ({ row }) => {
            const namaKelas = row.original.kelas?.nama_kelas;
            if (namaKelas) {
                return h(
                    "span",
                    {
                        class: "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700",
                    },
                    namaKelas,
                );
            }
            return h("span", { class: "text-slate-400" }, "-");
        },
    },
    {
        id: "jenis_kelamin",
        header: "L/P",
        cell: ({ row }) => {
            const jk = row.original.jenis_kelamin;
            const isLaki = jk === "L";
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${isLaki ? "bg-sky-50 text-sky-700" : "bg-pink-50 text-pink-700"}`,
                },
                isLaki ? "Laki-laki" : "Perempuan",
            );
        },
    },
    {
        id: "email",
        header: "Email",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600" },
                row.original.email || "-",
            );
        },
    },
    {
        id: "no_hp",
        header: "No HP",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600" },
                row.original.no_hp || "-",
            );
        },
    },
    {
        id: "aksi",
        header: "",
        cell: ({ row }) => {
            return h("div", { class: "flex gap-1" }, [
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-slate-100 text-slate-600",
                        onClick: () => navigateToDetail(row.original),
                        title: "Lihat detail",
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
                        title: "Edit",
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
                        class: "p-1.5 rounded hover:bg-red-50 text-red-600",
                        onClick: () => confirmDelete(row.original),
                        title: "Hapus",
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
                            h("path", { d: "M3 6h18" }),
                            h("path", {
                                d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
                            }),
                            h("path", {
                                d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
                            }),
                        ],
                    ),
                ),
            ]);
        },
    },
];

async function fetchData() {
    loading.value = true;
    try {
        const response = await siswaApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch siswa:", error);
        toast.add({ title: "Gagal memuat data siswa", color: "error" });
    } finally {
        loading.value = false;
    }
}

async function fetchKelas() {
    try {
        const response = await kelasApi.getAll({ limit: 100 });
        if (response.success) {
            allKelas.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch kelas:", error);
    }
}

function confirmDelete(item: Siswa) {
    if (!confirm(`Hapus siswa "${item.nama_siswa}"?`)) return;

    siswaApi
        .remove(item.id_siswa)
        .then((response) => {
            if (response.success) {
                toast.add({ title: "Siswa dihapus", color: "success" });
                fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal menghapus",
                    color: "error",
                });
            }
        })
        .catch(() => {
            toast.add({ title: "Gagal menghapus siswa", color: "error" });
        });
}

onMounted(async () => {
    await Promise.all([fetchData(), fetchKelas()]);
});

useHead({ title: "Siswa | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Data Siswa
                </h1>
                <p class="text-sm text-slate-500">Kelola data siswa sekolah</p>
            </div>
            <div class="flex gap-2">
                <UButton color="neutral" variant="outline" icon="lucide:upload">
                    Import
                </UButton>
                <UButton
                    color="primary"
                    icon="lucide:plus"
                    @click="navigateToCreate"
                >
                    Tambah Siswa
                </UButton>
            </div>
        </div>

        <CommonAppDataTable
            :data="data"
            :columns="columns"
            :loading="loading"
            title="Daftar Siswa"
            description="Kelola data siswa sekolah"
            searchable
            search-placeholder="Cari siswa..."
            with-time
        >
            <template #toolbar-right>
                <USelectMenu
                    :items="[
                        { label: 'Semua Kelas', value: undefined },
                        ...allKelas.map((k) => ({
                            label: k.nama_kelas,
                            value: k.id_kelas,
                        })),
                    ]"
                    value-key="value"
                    class="w-48"
                    placeholder="Filter Kelas"
                />
            </template>
        </CommonAppDataTable>
    </div>
</template>
