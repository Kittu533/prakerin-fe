<script setup lang="ts">
import { useJurusanApi, type Jurusan } from "~/composables/api/use-academic";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const toast = useToast();
const jurusanApi = useJurusanApi();

const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<Jurusan[]>([]);

const form = reactive({
    id_jurusan: null as number | null,
    kode_jurusan: "",
    nama_jurusan: "",
});

const columns: ColumnDef<Jurusan, any>[] = [
    {
        id: "kode_jurusan",
        header: "Kode",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm font-mono text-slate-600" },
                row.original.kode_jurusan,
            );
        },
    },
    {
        id: "nama_jurusan",
        header: "Nama Jurusan",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm font-medium text-slate-900" },
                row.original.nama_jurusan,
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
                h(
                    "button",
                    {
                        class: "p-1.5 rounded hover:bg-red-50 text-red-600",
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
        const response = await jurusanApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch jurusan:", error);
        toast.add({ title: "Gagal memuat data jurusan", color: "error" });
    } finally {
        loading.value = false;
    }
}

function openModal(item?: Jurusan) {
    editing.value = !!item;
    if (item) {
        form.id_jurusan = item.id_jurusan;
        form.kode_jurusan = item.kode_jurusan;
        form.nama_jurusan = item.nama_jurusan;
    } else {
        form.id_jurusan = null;
        form.kode_jurusan = "";
        form.nama_jurusan = "";
    }
    modalOpen.value = true;
}

async function save() {
    if (!form.kode_jurusan || !form.nama_jurusan) {
        toast.add({ title: "Lengkapi Kode dan Nama Jurusan", color: "error" });
        return;
    }

    processing.value = true;
    try {
        if (editing.value && form.id_jurusan) {
            const response = await jurusanApi.update(form.id_jurusan, {
                kode_jurusan: form.kode_jurusan,
                nama_jurusan: form.nama_jurusan,
            });
            if (response.success) {
                toast.add({ title: "Jurusan diperbarui", color: "success" });
                modalOpen.value = false;
                fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal memperbarui",
                    color: "error",
                });
            }
        } else {
            const response = await jurusanApi.create({
                kode_jurusan: form.kode_jurusan,
                nama_jurusan: form.nama_jurusan,
            });
            if (response.success) {
                toast.add({ title: "Jurusan ditambahkan", color: "success" });
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

async function confirmDelete(item: Jurusan) {
    if (!confirm(`Hapus jurusan "${item.nama_jurusan}"?`)) return;

    try {
        const response = await jurusanApi.remove(item.id_jurusan);
        if (response.success) {
            toast.add({ title: "Jurusan dihapus", color: "success" });
            fetchData();
        } else {
            toast.add({
                title: response.message || "Gagal menghapus",
                color: "error",
            });
        }
    } catch (error) {
        toast.add({ title: "Gagal menghapus jurusan", color: "error" });
    }
}

onMounted(() => fetchData());

useHead({ title: "Jurusan | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Jurusan
                </h1>
                <p class="text-sm text-slate-500">Kelola data jurusan</p>
            </div>
            <UButton color="primary" @click="openModal()">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
            </UButton>
        </div>

        <CommonAppDataTable
            :data="data"
            :columns="columns"
            :loading="loading"
            title="Daftar Jurusan"
            description="Kelola data jurusan"
            searchable
            search-placeholder="Cari jurusan..."
        />

        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard>
                    <template #header
                        ><h3 class="font-semibold text-slate-900">
                            {{ editing ? "Edit" : "Tambah" }} Jurusan
                        </h3></template
                    >
                    <div class="space-y-4">
                        <UFormField label="Kode Jurusan" required>
                            <UInput
                                v-model="form.kode_jurusan"
                                placeholder="RPL"
                            />
                        </UFormField>
                        <UFormField label="Nama Jurusan" required>
                            <UInput
                                v-model="form.nama_jurusan"
                                placeholder="Rekayasa Perangkat Lunak"
                            />
                        </UFormField>
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
