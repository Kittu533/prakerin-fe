<script setup lang="ts">
import { useGuruApi, type Guru } from "~/composables/api/use-academic";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const router = useRouter();
const toast = useToast();
const guruApi = useGuruApi();

const loading = ref(true);
const syncingAccounts = ref(false);

const data = ref<Guru[]>([]);

const navigateToCreate = () => {
    router.push("/admin/master/teachers/create");
};

const navigateToEdit = (item: Guru) => {
    router.push(`/admin/master/teachers/${item.id_guru}/edit`);
};

const navigateToDetail = (item: Guru) => {
    router.push(`/admin/master/teachers/${item.id_guru}`);
};

const getInitials = (nama: string) => {
    return nama
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

async function syncAccounts() {
    if (!confirm("Sinkronkan akun untuk semua guru yang belum memiliki akun?")) return;
    
    syncingAccounts.value = true;
    try {
        const response = await guruApi.syncAccounts();
        if (response.success) {
            const result = response.data;
            if (result.processed > 0) {
                toast.add({ 
                    title: "Sinkronisasi berhasil", 
                    description: `${result.processed} akun guru berhasil dibuat/diperbarui`,
                    color: "success" 
                });
            } else {
                toast.add({ 
                    title: "Tidak ada perubahan", 
                    description: "Semua guru sudah memiliki akun",
                    color: "info" 
                });
            }
        } else {
            toast.add({ title: "Gagal sinkronisasi", color: "error" });
        }
    } catch (error) {
        console.error("Failed to sync accounts:", error);
        toast.add({ title: "Gagal sinkronisasi akun", color: "error" });
    } finally {
        syncingAccounts.value = false;
    }
}

const columns: ColumnDef<Guru, any>[] = [
    {
        id: "nama",
        header: "Guru",
        cell: ({ row }) => {
            return h("div", { class: "flex items-center gap-3" }, [
                h(
                    "div",
                    {
                        class: "w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 text-sm font-semibold shrink-0",
                    },
                    getInitials(row.original.nama_guru),
                ),
                h("div", { class: "" }, [
                    h(
                        "p",
                        { class: "text-sm font-medium text-slate-900" },
                        row.original.nama_guru,
                    ),
                    h(
                        "p",
                        { class: "text-xs text-slate-500" },
                        `NIP: ${row.original.nip}`,
                    ),
                ]),
            ]);
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
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.status_aktif;
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${isActive ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-700"}`,
                },
                isActive ? "Aktif" : "Nonaktif",
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
        const response = await guruApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch guru:", error);
        toast.add({ title: "Gagal memuat data guru", color: "error" });
    } finally {
        loading.value = false;
    }
}

function confirmDelete(item: Guru) {
    if (!confirm(`Nonaktifkan guru "${item.nama_guru}"?`)) return;

    guruApi
        .remove(item.id_guru)
        .then((response) => {
            if (response.success) {
                toast.add({ title: "Guru dinonaktifkan", color: "success" });
                fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal menonaktifkan",
                    color: "error",
                });
            }
        })
        .catch(() => {
            toast.add({ title: "Gagal menonaktifkan guru", color: "error" });
        });
}

onMounted(() => fetchData());

useHead({ title: "Guru Pembimbing | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Guru Pembimbing
                </h1>
                <p class="text-sm text-slate-500">
                    Kelola data guru pembimbing PKL
                </p>
            </div>
            <div class="flex gap-2">
                <UButton
                    color="neutral"
                    variant="outline"
                    icon="lucide:refresh-cw"
                    :loading="syncingAccounts"
                    @click="syncAccounts"
                >
                    Sync Akun
                </UButton>
                <UButton
                    color="primary"
                    icon="lucide:plus"
                    @click="navigateToCreate"
                >
                    Tambah Guru
                </UButton>
            </div>
        </div>

        <CommonAppDataTable
            :data="data"
            :columns="columns"
            :loading="loading"
            title="Daftar Guru"
            description="Kelola data guru pembimbing PKL"
            searchable
            search-placeholder="Cari guru..."
            with-time
        />
    </div>
</template>
