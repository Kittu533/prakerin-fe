<script setup lang="ts">
import { useTingkatApi, type Tingkat } from "~/composables/api/use-academic";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const toast = useToast();
const tingkatApi = useTingkatApi();

const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<Tingkat[]>([]);

const form = reactive({
    id_tingkat: null as number | null,
    kode_tingkat: "",
    urutan: 1,
});

const columns: ColumnDef<Tingkat, any>[] = [
    {
        id: "kode_tingkat",
        header: "Kode Tingkat",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm font-medium text-slate-900" },
                row.original.kode_tingkat,
            );
        },
    },
    {
        id: "urutan",
        header: "Urutan",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600" },
                row.original.urutan,
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
        const response = await tingkatApi.getAll();
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch tingkat:", error);
        toast.add({ title: "Gagal memuat data tingkat", color: "error" });
    } finally {
        loading.value = false;
    }
}

function openModal(item?: Tingkat) {
    editing.value = !!item;
    if (item) {
        form.id_tingkat = item.id_tingkat;
        form.kode_tingkat = item.kode_tingkat;
        form.urutan = item.urutan;
    } else {
        form.id_tingkat = null;
        form.kode_tingkat = "";
        form.urutan = data.value.length + 1;
    }
    modalOpen.value = true;
}

async function save() {
    if (!form.kode_tingkat || !form.urutan) {
        toast.add({
            title: "Lengkapi Kode Tingkat dan Urutan",
            color: "error",
        });
        return;
    }

    processing.value = true;
    try {
        if (editing.value && form.id_tingkat) {
            const response = await tingkatApi.update(form.id_tingkat, {
                kode_tingkat: form.kode_tingkat,
                urutan: form.urutan,
            });
            if (response.success) {
                toast.add({ title: "Tingkat diperbarui", color: "success" });
                modalOpen.value = false;
                fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal memperbarui",
                    color: "error",
                });
            }
        } else {
            const response = await tingkatApi.create({
                kode_tingkat: form.kode_tingkat,
                urutan: form.urutan,
            });
            if (response.success) {
                toast.add({ title: "Tingkat ditambahkan", color: "success" });
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

async function confirmDelete(item: Tingkat) {
    if (!confirm(`Hapus tingkat "${item.kode_tingkat}"?`)) return;

    try {
        const response = await tingkatApi.remove(item.id_tingkat);
        if (response.success) {
            toast.add({ title: "Tingkat dihapus", color: "success" });
            fetchData();
        } else {
            toast.add({
                title: response.message || "Gagal menghapus",
                color: "error",
            });
        }
    } catch (error) {
        toast.add({ title: "Gagal menghapus tingkat", color: "error" });
    }
}

onMounted(() => fetchData());

useHead({ title: "Tingkat | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Tingkat
                </h1>
                <p class="text-sm text-slate-500">
                    Kelola data tingkat kelas (X, XI, XII)
                </p>
            </div>
            <UButton color="primary" @click="openModal()">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
            </UButton>
        </div>

        <CommonAppDataTable
            :data="data"
            :columns="columns"
            :loading="loading"
            title="Daftar Tingkat"
            description="Kelola data tingkat kelas"
            searchable
            search-placeholder="Cari tingkat..."
        />

        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            {{ editing ? "Edit" : "Tambah" }} Tingkat
                        </h3>
                    </template>
                    <div class="space-y-4">
                        <UFormField label="Kode Tingkat" required>
                            <UInput
                                v-model="form.kode_tingkat"
                                placeholder="X, XI, XII"
                            />
                        </UFormField>
                        <UFormField label="Urutan" required>
                            <UInput
                                v-model.number="form.urutan"
                                type="number"
                                min="1"
                                placeholder="1"
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
