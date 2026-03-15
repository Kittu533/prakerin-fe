<script setup lang="ts">
import {
    useMentorApi,
    usePerusahaanApi,
    type Mentor,
    type Perusahaan,
} from "~/composables/api/use-partner";
import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const toast = useToast();
const mentorApi = useMentorApi();
const perusahaanApi = usePerusahaanApi();

const loading = ref(true);
const modalOpen = ref(false);
const passwordModal = ref(false);
const editing = ref(false);
const processing = ref(false);
const generatedPassword = ref("");

const data = ref<Mentor[]>([]);
const allPerusahaan = ref<Perusahaan[]>([]);

const form = reactive({
    id_mentor: null as number | null,
    nama_mentor: "",
    jabatan: "",
    email: "",
    no_hp: "",
});

const selectedPerusahaanId = ref<number | undefined>(undefined);

const getInitials = (nama: string) => {
    return nama
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const columns: ColumnDef<Mentor, any>[] = [
    {
        id: "nama",
        header: "Mentor",
        cell: ({ row }) => {
            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "div",
                    {
                        class: "w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-semibold",
                    },
                    getInitials(row.original.nama_mentor),
                ),
                h("div", { class: "" }, [
                    h(
                        "p",
                        { class: "text-sm font-medium text-slate-900" },
                        row.original.nama_mentor,
                    ),
                    h("p", { class: "text-xs text-slate-500" }, row.original.jabatan || "-"),
                ]),
            ]);
        },
    },
    {
        id: "perusahaan",
        header: "Perusahaan",
        cell: ({ row }) => {
            const nama = row.original.perusahaan?.nama_perusahaan;
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
        id: "email",
        header: "Email",
        cell: ({ row }) => {
            return h("span", { class: "text-sm text-slate-600" }, row.original.email || "-");
        },
    },
    {
        id: "no_hp",
        header: "No HP",
        cell: ({ row }) => {
            return h("span", { class: "text-sm text-slate-600" }, row.original.no_hp || "-");
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
                        [h("path", { d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" })],
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
                            h("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
                            h("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
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
        const response = await mentorApi.getAll({ limit: 1000 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error) {
        console.error("Failed to fetch mentor:", error);
        toast.add({ title: "Gagal memuat data mentor", color: "error" });
    } finally {
        loading.value = false;
    }
}

async function fetchPerusahaan() {
    try {
        const response = await perusahaanApi.getAll({ limit: 100 });
        if (response.success) {
            allPerusahaan.value = response.data;
        }
    } catch (error) {
        console.error("Failed to fetch perusahaan:", error);
    }
}

function openModal(item?: Mentor) {
    editing.value = !!item;
    if (item) {
        form.id_mentor = item.id_mentor;
        form.nama_mentor = item.nama_mentor;
        form.jabatan = item.jabatan || "";
        form.email = item.email || "";
        form.no_hp = item.no_hp || "";
        selectedPerusahaanId.value = item.id_perusahaan;
    } else {
        form.id_mentor = null;
        form.nama_mentor = "";
        form.jabatan = "";
        form.email = "";
        form.no_hp = "";
        selectedPerusahaanId.value = undefined;
    }
    modalOpen.value = true;
}

async function save() {
    if (!form.nama_mentor || !form.email || !selectedPerusahaanId.value) {
        toast.add({
            title: "Lengkapi Nama, Email, dan Perusahaan",
            color: "error",
        });
        return;
    }

    processing.value = true;
    try {
        if (editing.value && form.id_mentor) {
            const response = await mentorApi.update(form.id_mentor, {
                nama_mentor: form.nama_mentor,
                jabatan: form.jabatan || undefined,
                email: form.email,
                no_hp: form.no_hp || undefined,
                id_perusahaan: selectedPerusahaanId.value,
            });
            if (response.success) {
                toast.add({
                    title: "Data mentor diperbarui",
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
            const response = await mentorApi.create({
                nama_mentor: form.nama_mentor,
                jabatan: form.jabatan || undefined,
                email: form.email,
                no_hp: form.no_hp || undefined,
                id_perusahaan: selectedPerusahaanId.value,
            });
            if (response.success) {
                modalOpen.value = false;
                if (response.data.generated_password) {
                    generatedPassword.value = response.data.generated_password;
                    passwordModal.value = true;
                } else {
                    toast.add({
                        title: "Mentor berhasil ditambahkan",
                        color: "success",
                    });
                }
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

async function confirmDelete(item: Mentor) {
    if (!confirm(`Nonaktifkan mentor "${item.nama_mentor}"?`)) return;

    try {
        const response = await mentorApi.remove(item.id_mentor);
        if (response.success) {
            toast.add({ title: "Mentor dinonaktifkan", color: "success" });
            fetchData();
        } else {
            toast.add({
                title: response.message || "Gagal menonaktifkan",
                color: "error",
            });
        }
    } catch (error) {
        toast.add({ title: "Gagal menonaktifkan mentor", color: "error" });
    }
}

onMounted(async () => {
    await Promise.all([fetchData(), fetchPerusahaan()]);
});

useHead({ title: "Mentor | Admin" });
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Mentor Industri
                </h1>
                <p class="text-sm text-slate-500">
                    Kelola data mentor dari perusahaan
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
            title="Daftar Mentor"
            description="Kelola data mentor dari perusahaan"
            searchable
            search-placeholder="Cari mentor..."
            with-time
        >
            <template #toolbar-right>
                <USelectMenu
                    :items="[
                        { id: undefined, nama_perusahaan: 'Semua Perusahaan' },
                        ...allPerusahaan.map((p) => ({ id: p.id_perusahaan, nama_perusahaan: p.nama_perusahaan }))
                    ]"
                    value-key="id"
                    class="w-48"
                >
                    <template #default>{{ allPerusahaan.find((p) => p.id_perusahaan === selectedPerusahaanId)?.nama_perusahaan || 'Semua Perusahaan' }}</template>
                </USelectMenu>
            </template>
        </CommonAppDataTable>

        <!-- Form Modal -->
        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard>
                    <template #header
                        ><h3 class="font-semibold text-slate-900">
                            {{ editing ? "Edit" : "Tambah" }} Mentor
                        </h3></template
                    >
                    <div class="space-y-4">
                        <UFormField label="Nama Lengkap" required>
                            <UInput
                                v-model="form.nama_mentor"
                                placeholder="Nama mentor"
                            />
                        </UFormField>
                        <UFormField label="Perusahaan" required>
                            <USelectMenu
                                v-model="selectedPerusahaanId"
                                :items="allPerusahaan"
                                value-key="id_perusahaan"
                                class="w-full"
                            >
                                <template #default>{{
                                    allPerusahaan.find(
                                        (p) =>
                                            p.id_perusahaan ===
                                            selectedPerusahaanId,
                                    )?.nama_perusahaan || "Pilih Perusahaan"
                                }}</template
                            >
                                <template #item="{ item }">{{
                                    item.nama_perusahaan
                                }}</template>
                            </USelectMenu>
                        </UFormField>
                        <UFormField label="Jabatan">
                            <UInput
                                v-model="form.jabatan"
                                placeholder="Manager / Supervisor"
                            />
                        </UFormField>
                        <UFormField label="Email" required>
                            <UInput
                                v-model="form.email"
                                type="email"
                                placeholder="email@company.com"
                            />
                        </UFormField>
                        <UFormField label="No HP">
                            <UInput
                                v-model="form.no_hp"
                                type="tel"
                                placeholder="08xxx"
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

        <!-- Password Info Modal -->
        <UModal v-model:open="passwordModal">
            <template #content>
                <UCard>
                    <template #header
                        ><h3 class="font-semibold text-slate-900">
                            Mentor Berhasil Ditambahkan
                        </h3></template
                    >
                    <div class="space-y-4">
                        <div
                            class="p-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                            <p class="text-sm text-green-700 mb-2">
                                Password default untuk login:
                            </p>
                            <p
                                class="font-mono text-lg font-bold text-green-800"
                            >
                                {{ generatedPassword }}
                            </p>
                        </div>
                        <p class="text-sm text-slate-500">
                            Mentor dapat login menggunakan email dan password di
                            atas.
                        </p>
                    </div>
                    <template #footer>
                        <UButton
                            color="primary"
                            class="w-full"
                            @click="passwordModal = false"
                            >Mengerti</UButton
                        >
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
