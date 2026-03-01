<script setup lang="ts">
import {
    useTahunAjaranApi,
    type TahunAjaran,
} from "~/composables/api/use-academic";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const toast = useToast();
const tahunAjaranApi = useTahunAjaranApi();

const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<TahunAjaran[]>([]);

const form = reactive({
    id_tahun_ajaran: null as number | null,
    nama_tahun_ajaran: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
});

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const columns: ColumnDef<TahunAjaran, any>[] = [
    {
        id: "nama_tahun_ajaran",
        header: "Tahun Ajaran",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm font-medium text-slate-900" },
                row.original.nama_tahun_ajaran,
            );
        },
    },
    {
        id: "tanggal_mulai",
        header: "Mulai",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600" },
                formatDate(row.original.tanggal_mulai),
            );
        },
    },
    {
        id: "tanggal_selesai",
        header: "Selesai",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600" },
                formatDate(row.original.tanggal_selesai),
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
                !row.original.status_aktif &&
                    h(
                        "button",
                        {
                            class: "p-1.5 rounded hover:bg-green-50 text-green-600",
                            onClick: () => setActive(row.original),
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
                                    d: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
                                }),
                                h("polyline", {
                                    points: "22 4 12 14.01 9 11.01",
                                }),
                            ],
                        ),
                    ),
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-slate-100 text-slate-600",
                        onClick: () => openModal(row.original),
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

async function fetchData() {
    loading.value = true;
    try {
        const response = await tahunAjaranApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch tahun ajaran:", error);
        toast.add({ title: "Gagal memuat data tahun ajaran", color: "error" });
    } finally {
        loading.value = false;
    }
}

function openModal(item?: TahunAjaran) {
    editing.value = !!item;
    if (item) {
        form.id_tahun_ajaran = item.id_tahun_ajaran;
        form.nama_tahun_ajaran = item.nama_tahun_ajaran;
        form.tanggal_mulai = item.tanggal_mulai || "";
        form.tanggal_selesai = item.tanggal_selesai || "";
    } else {
        form.id_tahun_ajaran = null;
        form.nama_tahun_ajaran = "";
        form.tanggal_mulai = "";
        form.tanggal_selesai = "";
    }
    modalOpen.value = true;
}

async function save() {
    if (!form.nama_tahun_ajaran) {
        toast.add({ title: "Nama tahun ajaran wajib diisi", color: "error" });
        return;
    }
    if (!editing.value && (!form.tanggal_mulai || !form.tanggal_selesai)) {
        toast.add({
            title: "Tanggal mulai dan selesai wajib diisi",
            color: "error",
        });
        return;
    }

    processing.value = true;
    try {
        if (editing.value && form.id_tahun_ajaran) {
            const payload: any = { nama_tahun_ajaran: form.nama_tahun_ajaran };
            if (form.tanggal_mulai) payload.tanggal_mulai = form.tanggal_mulai;
            if (form.tanggal_selesai)
                payload.tanggal_selesai = form.tanggal_selesai;

            const response = await tahunAjaranApi.update(
                form.id_tahun_ajaran,
                payload,
            );
            if (response.success) {
                toast.add({
                    title: "Tahun ajaran diperbarui",
                    color: "success",
                });
                modalOpen.value = false;
                fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal memperbarui",
                    color: "error",
                });
            }
        } else {
            const response = await tahunAjaranApi.create({
                nama_tahun_ajaran: form.nama_tahun_ajaran,
                tanggal_mulai: form.tanggal_mulai,
                tanggal_selesai: form.tanggal_selesai,
            });
            if (response.success) {
                toast.add({
                    title: "Tahun ajaran ditambahkan",
                    color: "success",
                });
                modalOpen.value = false;
                fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal menambahkan",
                    color: "error",
                });
            }
        }
    } catch (error: any) {
        toast.add({
            title: error.message || "Terjadi kesalahan",
            color: "error",
        });
    } finally {
        processing.value = false;
    }
}

async function setActive(item: TahunAjaran) {
    try {
        const response = await tahunAjaranApi.update(item.id_tahun_ajaran, {
            status_aktif: true,
        });
        if (response.success) {
            toast.add({
                title: `${item.nama_tahun_ajaran} diaktifkan`,
                color: "success",
            });
            fetchData();
        } else {
            toast.add({
                title: response.message || "Gagal mengaktifkan",
                color: "error",
            });
        }
    } catch (error) {
        toast.add({ title: "Gagal mengaktifkan tahun ajaran", color: "error" });
    }
}

onMounted(() => fetchData());

useHead({ title: "Tahun Ajaran | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Tahun Ajaran
                </h1>
                <p class="text-sm text-slate-500">Kelola data tahun ajaran</p>
            </div>
            <UButton color="primary" @click="openModal()">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
            </UButton>
        </div>

        <CommonAppDataTable
            :data="data"
            :columns="columns"
            :loading="loading"
            title="Daftar Tahun Ajaran"
            description="Kelola data tahun ajaran"
            searchable
            search-placeholder="Cari tahun ajaran..."
        />

        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            {{ editing ? "Edit" : "Tambah" }} Tahun Ajaran
                        </h3>
                    </template>
                    <div class="space-y-4">
                        <UFormField label="Nama Tahun Ajaran" required>
                            <UInput
                                v-model="form.nama_tahun_ajaran"
                                placeholder="2024/2025"
                            />
                        </UFormField>
                        <div class="grid grid-cols-2 gap-3">
                            <UFormField label="Tanggal Mulai" required>
                                <UInput
                                    v-model="form.tanggal_mulai"
                                    type="date"
                                />
                            </UFormField>
                            <UFormField label="Tanggal Selesai" required>
                                <UInput
                                    v-model="form.tanggal_selesai"
                                    type="date"
                                />
                            </UFormField>
                        </div>
                    </div>
                    <template #footer>
                        <div class="flex gap-3">
                            <UButton
                                variant="outline"
                                color="neutral"
                                class="flex-1"
                                @click="modalOpen = false"
                                >Batal</UButton
                            >
                            <UButton
                                color="primary"
                                class="flex-1"
                                :loading="processing"
                                @click="save"
                                >Simpan</UButton
                            >
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
