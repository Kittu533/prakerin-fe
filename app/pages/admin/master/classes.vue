<script setup lang="ts">
import {
    useKelasApi,
    useJurusanApi,
    useTahunAjaranApi,
    useTingkatApi,
    type Kelas,
    type Jurusan,
    type TahunAjaran,
    type Tingkat,
} from "~/composables/api/use-academic";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const toast = useToast();
const kelasApi = useKelasApi();
const jurusanApi = useJurusanApi();
const tahunAjaranApi = useTahunAjaranApi();
const tingkatApi = useTingkatApi();

const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(false);
const processing = ref(false);

const data = ref<Kelas[]>([]);
const allJurusan = ref<Jurusan[]>([]);
const allTahunAjaran = ref<TahunAjaran[]>([]);
const allTingkat = ref<Tingkat[]>([]);

const selectedJurusanId = ref<number | undefined>(undefined);
const selectedTingkatId = ref<number | undefined>(undefined);
const selectedTahunAjaranId = ref<number | undefined>(undefined);

const form = reactive({
    id_kelas: null as number | null,
    nama_kelas: "",
});

const columns: ColumnDef<Kelas, any>[] = [
    {
        id: "nama_kelas",
        header: "Nama Kelas",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm font-medium text-slate-900" },
                row.original.nama_kelas,
            );
        },
    },
    {
        id: "jurusan",
        header: "Jurusan",
        cell: ({ row }) => {
            const nama = row.original.jurusan?.nama_jurusan;
            if (nama) {
                return h(
                    "span",
                    {
                        class: "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700",
                    },
                    nama,
                );
            }
            return h("span", { class: "text-slate-400" }, "-");
        },
    },
    {
        id: "tingkat",
        header: "Tingkat",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600" },
                row.original.tingkat?.kode_tingkat || "-",
            );
        },
    },
    {
        id: "tahun",
        header: "Tahun Ajaran",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-500" },
                row.original.tahun_ajaran?.nama_tahun_ajaran || "-",
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
        const response = await kelasApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch kelas:", error);
        toast.add({ title: "Gagal memuat data kelas", color: "error" });
    } finally {
        loading.value = false;
    }
}

async function fetchDropdownData() {
    try {
        const [jurusanRes, tahunRes, tingkatRes] = await Promise.all([
            jurusanApi.getAll({ limit: 100 }),
            tahunAjaranApi.getAll({ limit: 100 }),
            tingkatApi.getAll(),
        ]);
        if (jurusanRes.success) allJurusan.value = jurusanRes.data;
        if (tahunRes.success) allTahunAjaran.value = tahunRes.data;
        if (tingkatRes.success) allTingkat.value = tingkatRes.data;
    } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
    }
}

function openModal(item?: Kelas) {
    editing.value = !!item;
    if (item) {
        form.id_kelas = item.id_kelas;
        form.nama_kelas = item.nama_kelas;
        selectedJurusanId.value = item.id_jurusan;
        selectedTingkatId.value = item.id_tingkat;
        selectedTahunAjaranId.value = item.id_tahun_ajaran;
    } else {
        form.id_kelas = null;
        form.nama_kelas = "";
        selectedJurusanId.value = undefined;
        selectedTingkatId.value = undefined;
        selectedTahunAjaranId.value = undefined;
    }
    modalOpen.value = true;
}

async function save() {
    if (
        !form.nama_kelas ||
        !selectedJurusanId.value ||
        !selectedTingkatId.value ||
        !selectedTahunAjaranId.value
    ) {
        toast.add({ title: "Lengkapi semua field", color: "error" });
        return;
    }

    processing.value = true;
    try {
        if (editing.value && form.id_kelas) {
            const response = await kelasApi.update(form.id_kelas, {
                nama_kelas: form.nama_kelas,
                id_jurusan: selectedJurusanId.value,
                id_tingkat: selectedTingkatId.value,
                id_tahun_ajaran: selectedTahunAjaranId.value,
            });
            if (response.success) {
                toast.add({ title: "Kelas diperbarui", color: "success" });
                modalOpen.value = false;
                fetchData();
            } else {
                toast.add({
                    title: response.message || "Gagal memperbarui",
                    color: "error",
                });
            }
        } else {
            const response = await kelasApi.create({
                nama_kelas: form.nama_kelas,
                id_jurusan: selectedJurusanId.value,
                id_tingkat: selectedTingkatId.value,
                id_tahun_ajaran: selectedTahunAjaranId.value,
            });
            if (response.success) {
                toast.add({ title: "Kelas ditambahkan", color: "success" });
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

async function confirmDelete(item: Kelas) {
    if (!confirm(`Hapus kelas "${item.nama_kelas}"?`)) return;

    try {
        const response = await kelasApi.remove(item.id_kelas);
        if (response.success) {
            toast.add({ title: "Kelas dihapus", color: "success" });
            fetchData();
        } else {
            toast.add({
                title: response.message || "Gagal menghapus",
                color: "error",
            });
        }
    } catch (error) {
        toast.add({ title: "Gagal menghapus kelas", color: "error" });
    }
}

onMounted(async () => {
    await Promise.all([fetchData(), fetchDropdownData()]);
});

useHead({ title: "Kelas | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Kelas
                </h1>
                <p class="text-sm text-slate-500">Kelola data kelas</p>
            </div>
            <UButton color="primary" @click="openModal()">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />Tambah
            </UButton>
        </div>

        <CommonAppDataTable
            :data="data"
            :columns="columns"
            :loading="loading"
            title="Daftar Kelas"
            description="Kelola data kelas"
            searchable
            search-placeholder="Cari kelas..."
        />

        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard class="w-full max-w-md">
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            {{ editing ? "Edit" : "Tambah" }} Kelas
                        </h3>
                    </template>
                    <div class="space-y-4">
                        <UFormField label="Nama Kelas" required>
                            <UInput
                                v-model="form.nama_kelas"
                                placeholder="Contoh: XII RPL 1"
                            />
                        </UFormField>
                        <UFormField label="Jurusan" required>
                            <USelectMenu
                                v-model="selectedJurusanId"
                                :items="allJurusan"
                                value-key="id_jurusan"
                                class="w-full"
                            >
                                <template #default>{{
                                    allJurusan.find(
                                        (j) =>
                                            j.id_jurusan === selectedJurusanId,
                                    )?.nama_jurusan || "Pilih Jurusan"
                                }}</template>
                                <template #item="{ item }">{{
                                    item.nama_jurusan
                                }}</template>
                            </USelectMenu>
                        </UFormField>
                        <UFormField label="Tingkat" required>
                            <USelectMenu
                                v-model="selectedTingkatId"
                                :items="allTingkat"
                                value-key="id_tingkat"
                                class="w-full"
                            >
                                <template #default>{{
                                    allTingkat.find(
                                        (t) =>
                                            t.id_tingkat === selectedTingkatId,
                                    )?.kode_tingkat || "Pilih Tingkat"
                                }}</template>
                                <template #item="{ item }">{{
                                    item.kode_tingkat
                                }}</template>
                            </USelectMenu>
                        </UFormField>
                        <UFormField label="Tahun Ajaran" required>
                            <USelectMenu
                                v-model="selectedTahunAjaranId"
                                :items="allTahunAjaran"
                                value-key="id_tahun_ajaran"
                                class="w-full"
                            >
                                <template #default>{{
                                    allTahunAjaran.find(
                                        (t) =>
                                            t.id_tahun_ajaran ===
                                            selectedTahunAjaranId,
                                    )?.nama_tahun_ajaran || "Pilih Tahun Ajaran"
                                }}</template>
                                <template #item="{ item }">{{
                                    item.nama_tahun_ajaran
                                }}</template>
                            </USelectMenu>
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
