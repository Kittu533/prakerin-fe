<template>
    <div class="space-y-6">
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Logbook Harian
                </h1>
                <p class="text-sm text-slate-500 mt-1">
                    Catat kegiatan PKL harianmu
                </p>
            </div>
            <UButton color="primary" @click="openModal()">
                <Icon name="lucide:plus" class="w-4 h-4 mr-2" />
                Tambah Kegiatan
            </UButton>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-slate-900">
                    {{ stats.total }}
                </p>
                <p class="text-xs text-slate-500">Total</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-green-600">
                    {{ stats.approved }}
                </p>
                <p class="text-xs text-slate-500">Disetujui</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-amber-600">
                    {{ stats.pending }}
                </p>
                <p class="text-xs text-slate-500">Pending</p>
            </div>
        </div>

        <!-- AppDataTable -->
        <AppDataTable
            :data="filteredLogbooks"
            :columns="columns"
            title="Daftar Logbook"
            description="Riwayat kegiatan PKL harian"
            :loading="loading"
            :searchable="true"
            search-placeholder="Cari kegiatan..."
            empty-title="Belum ada logbook"
            empty-description="Mulai catat kegiatan PKL harianmu dengan klik tombol Tambah Kegiatan"
            empty-icon="lucide:book-open"
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

        <!-- Modal Form -->
        <UModal v-model:open="modalOpen">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="font-semibold text-slate-900">
                                {{
                                    editingLog
                                        ? "Edit Logbook"
                                        : "Tambah Logbook"
                                }}
                            </h3>
                            <UButton
                                variant="ghost"
                                color="neutral"
                                size="xs"
                                @click="modalOpen = false"
                            >
                                <Icon name="lucide:x" class="w-4 h-4" />
                            </UButton>
                        </div>
                    </template>

                    <!-- Revision Alert -->
                    <UAlert
                        v-if="editingLog?.status === 'Ditolak'"
                        color="error"
                        icon="lucide:alert-circle"
                        class="mb-4"
                    >
                        <template #title>Catatan Pembimbing</template>
                        <template #description>{{
                            editingLog.catatan
                        }}</template>
                    </UAlert>

                    <form @submit.prevent="submitForm" class="space-y-4">
                        <UFormField label="Tanggal" required>
                            <UInput
                                v-model="form.tanggal"
                                type="date"
                                :max="today"
                                class="w-full"
                            />
                        </UFormField>

                        <div class="grid grid-cols-2 gap-3">
                            <UFormField label="Jam Mulai" required>
                                <UInput
                                    v-model="form.jamMulai"
                                    type="time"
                                    class="w-full"
                                />
                            </UFormField>
                            <UFormField label="Jam Selesai" required>
                                <UInput
                                    v-model="form.jamSelesai"
                                    type="time"
                                    class="w-full"
                                />
                            </UFormField>
                        </div>

                        <UFormField label="Judul Kegiatan" required>
                            <UInput
                                v-model="form.judul"
                                placeholder="Min. 5 karakter"
                                class="w-full"
                            />
                        </UFormField>

                        <UFormField label="Deskripsi" required>
                            <UTextarea
                                v-model="form.deskripsi"
                                placeholder="Min. 20 karakter"
                                :rows="4"
                                autoresize
                                class="w-full"
                            />
                        </UFormField>

                        <UFormField label="Foto Kegiatan">
                            <div
                                class="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-sky-400 transition-colors"
                                @click="fileInput?.click()"
                                @dragover.prevent
                                @drop.prevent="handleDrop"
                            >
                                <input
                                    ref="fileInput"
                                    type="file"
                                    accept="image/*"
                                    class="hidden"
                                    @change="handleFileChange"
                                />
                                <div v-if="form.fotoPreview">
                                    <img
                                        :src="form.fotoPreview"
                                        class="w-20 h-20 mx-auto rounded-lg object-cover mb-2"
                                    />
                                    <p class="text-xs text-slate-500">
                                        Klik untuk ganti
                                    </p>
                                </div>
                                <div v-else>
                                    <Icon
                                        name="lucide:upload"
                                        class="w-8 h-8 text-slate-300 mx-auto mb-2"
                                    />
                                    <p class="text-sm text-slate-500">
                                        Drag & drop atau klik untuk upload
                                    </p>
                                    <p class="text-xs text-slate-400">
                                        Max 2MB, format gambar
                                    </p>
                                </div>
                            </div>
                        </UFormField>

                        <div class="flex gap-3 pt-2">
                            <UButton
                                type="button"
                                variant="outline"
                                color="neutral"
                                class="flex-1"
                                @click="modalOpen = false"
                                >Batal</UButton
                            >
                            <UButton
                                type="submit"
                                color="primary"
                                class="flex-1"
                                :loading="submitting"
                            >
                                {{ editingLog ? "Simpan Perubahan" : "Simpan" }}
                            </UButton>
                        </div>
                    </form>
                </UCard>
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";
import AppDataTable from "~/components/common/AppDataTable.vue";
import {
    useSiswaLogbookApi,
    type SiswaLogbook,
} from "~/composables/api/use-siswa";

definePageMeta({ layout: "siswa" });

const toast = useToast();
const columnHelper = createColumnHelper<any>();

// API composables
const logbookApi = useSiswaLogbookApi();

// State
const loading = ref(true);
const submitting = ref(false);
const modalOpen = ref(false);
const filterStatus = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const statusOptions = ["Disetujui", "Pending", "Ditolak"];
const stats = reactive({ total: 0, approved: 0, pending: 0 });
const logbooks = ref<any[]>([]);
const editingLog = ref<any>(null);

const form = reactive({
    tanggal: "",
    jamMulai: "",
    jamSelesai: "",
    judul: "",
    deskripsi: "",
    foto: null as File | null,
    fotoPreview: "",
});

const today = computed(() => new Date().toISOString().split("T")[0]);

// Filter logbooks based on status filter
const filteredLogbooks = computed(() => {
    if (!filterStatus.value) return logbooks.value;
    return logbooks.value.filter((log) => log.status === filterStatus.value);
});

// Define columns for AppDataTable
const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("tanggal", {
        id: "tanggal",
        header: () => "Tanggal",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("waktu", {
        id: "waktu",
        header: () => "Waktu",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("judul", {
        id: "judul",
        header: () => "Judul Kegiatan",
        cell: (info) => h("span", { class: "font-medium" }, info.getValue()),
    }),
    columnHelper.accessor("status", {
        id: "status",
        header: () => "Status",
        cell: (info) => {
            const status = info.getValue() as string;
            const colorMap: Record<string, string> = {
                Disetujui: "bg-green-100 text-green-800",
                Pending: "bg-amber-100 text-amber-800",
                Ditolak: "bg-red-100 text-red-800",
            };
            const color = colorMap[status] || "bg-gray-100 text-gray-800";
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
            return h("div", { class: "flex gap-1" }, [
                h(
                    "button",
                    {
                        class: "p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors",
                        onClick: () => openModal(row),
                    },
                    h(
                        "svg",
                        {
                            class: "w-4 h-4",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                        },
                        [
                            h("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": 2,
                                d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                            }),
                        ],
                    ),
                ),
                h(
                    "button",
                    {
                        class: "p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors",
                        onClick: () => deleteLogbook(row.id),
                    },
                    h(
                        "svg",
                        {
                            class: "w-4 h-4",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                        },
                        [
                            h("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": 2,
                                d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
                            }),
                        ],
                    ),
                ),
            ]);
        },
    }),
];

function openModal(log?: any) {
    editingLog.value = log || null;
    if (log) {
        form.tanggal = log.tanggalRaw || "";
        form.jamMulai = log.jamMulai || "";
        form.jamSelesai = log.jamSelesai || "";
        form.judul = log.judul || "";
        form.deskripsi = log.deskripsi || "";
        form.fotoPreview = log.foto || "";
    } else {
        Object.assign(form, {
            tanggal: "",
            jamMulai: "",
            jamSelesai: "",
            judul: "",
            deskripsi: "",
            foto: null,
            fotoPreview: "",
        });
    }
    modalOpen.value = true;
}

function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) processFile(file);
}

function handleDrop(e: DragEvent) {
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
}

function processFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
        toast.add({ title: "File terlalu besar (max 2MB)", color: "error" });
        return;
    }
    if (!file.type.startsWith("image/")) {
        toast.add({ title: "Format file harus gambar", color: "error" });
        return;
    }
    form.foto = file;
    form.fotoPreview = URL.createObjectURL(file);
}

async function submitForm() {
    // Validation
    if (
        !form.tanggal ||
        !form.jamMulai ||
        !form.jamSelesai ||
        !form.judul ||
        !form.deskripsi
    ) {
        toast.add({ title: "Lengkapi semua field", color: "error" });
        return;
    }
    if (form.judul.length < 5) {
        toast.add({ title: "Judul minimal 5 karakter", color: "error" });
        return;
    }
    if (form.deskripsi.length < 20) {
        toast.add({ title: "Deskripsi minimal 20 karakter", color: "error" });
        return;
    }
    if (form.jamMulai >= form.jamSelesai) {
        toast.add({
            title: "Jam mulai harus sebelum jam selesai",
            color: "error",
        });
        return;
    }

    submitting.value = true;

    try {
        if (editingLog.value) {
            // Update existing logbook
            const fotoUrl = form.fotoPreview && !form.fotoPreview.startsWith('blob:') ? form.fotoPreview : undefined;
            const res = await logbookApi.update(editingLog.value.id, {
                judul_kegiatan: form.judul,
                isi_kegiatan: form.deskripsi,
                foto_kegiatan: fotoUrl,
            });

            if (res?.success) {
                const oldStatus = logbooks.value.find(
                    (l) => l.id === editingLog.value.id,
                )?.status;
                const idx = logbooks.value.findIndex(
                    (l) => l.id === editingLog.value.id,
                );
                if (idx !== -1) {
                    logbooks.value[idx] = {
                        ...logbooks.value[idx],
                        tanggal: new Date(form.tanggal).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" },
                        ),
                        tanggalRaw: form.tanggal,
                        jamMulai: form.jamMulai,
                        jamSelesai: form.jamSelesai,
                        waktu: `${form.jamMulai} - ${form.jamSelesai}`,
                        judul: form.judul,
                        deskripsi: form.deskripsi,
                        foto: form.fotoPreview,
                        status: "Pending",
                    };

                    // Update stats if status changed from approved/pending
                    if (oldStatus === "Disetujui") {
                        stats.approved--;
                        stats.pending++;
                    }
                }
                toast.add({
                    title: "Logbook berhasil diperbarui",
                    color: "success",
                });
            } else {
                toast.add({
                    title: "Gagal memperbarui logbook",
                    description: res.message,
                    color: "error",
                });
            }
        } else {
            // Create new logbook
            const fotoUrl = form.fotoPreview && !form.fotoPreview.startsWith('blob:') ? form.fotoPreview : undefined;
            const res = await logbookApi.create({
                tanggal: form.tanggal,
                judul_kegiatan: form.judul,
                isi_kegiatan: form.deskripsi,
                foto_kegiatan: fotoUrl,
            });

            if (res?.success && res?.data) {
                const newLogbook = {
                    id: res.data.id_logbook,
                    tanggal: new Date(form.tanggal).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "short", year: "numeric" },
                    ),
                    tanggalRaw: form.tanggal,
                    jamMulai: form.jamMulai,
                    jamSelesai: form.jamSelesai,
                    waktu: `${form.jamMulai} - ${form.jamSelesai}`,
                    judul: form.judul,
                    deskripsi: form.deskripsi,
                    foto: form.fotoPreview,
                    status: "Pending",
                };
                logbooks.value.unshift(newLogbook);
                stats.total++;
                stats.pending++;
                toast.add({
                    title: "Logbook berhasil ditambahkan",
                    color: "success",
                });
            } else {
                toast.add({
                    title: "Gagal menambah logbook",
                    description: res?.message || "Terjadi kesalahan",
                    color: "error",
                });
            }
        }
    } catch (err) {
        console.error("Submit error:", err);
        toast.add({ title: "Terjadi kesalahan", color: "error" });
    } finally {
        submitting.value = false;
        modalOpen.value = false;
    }
}

function deleteLogbook(id: string | number) {
    deleteLogbookFromApi(id);
}

async function deleteLogbookFromApi(id: string | number) {
    try {
        const res = await logbookApi.remove(id.toString());
        if (res.success) {
            const deletedLog = logbooks.value.find((l) => l.id === id);
            logbooks.value = logbooks.value.filter((l) => l.id !== id);

            // Update stats
            stats.total = logbooks.value.length;
            stats.approved = logbooks.value.filter(
                (l) => l.status === "Disetujui",
            ).length;
            stats.pending = logbooks.value.filter(
                (l) => l.status === "Pending",
            ).length;

            toast.add({ title: "Logbook dihapus", color: "neutral" });
        } else {
            toast.add({
                title: "Gagal menghapus logbook",
                description: res.message,
                color: "error",
            });
        }
    } catch (err) {
        console.error("Delete error:", err);
        toast.add({
            title: "Terjadi kesalahan saat menghapus",
            color: "error",
        });
    }
}

// Load data from API
async function loadData() {
    loading.value = true;

    try {
        // Get logbooks directly - backend will filter by authenticated user's active placement
        const logbooksRes = await logbookApi.getByPenempatan("", {
            limit: 100,
        });

        console.log("[LoadData] logbooksRes:", logbooksRes);

        if (logbooksRes?.success && logbooksRes?.data) {
            // safeFetch returns data directly as array
            const logbookArray = Array.isArray(logbooksRes.data)
                ? logbooksRes.data
                : [];

            logbooks.value = logbookArray.map((log: any) => ({
                id: log.id_logbook,
                tanggal: new Date(log.tanggal).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                }),
                tanggalRaw: log.tanggal?.split?.("T")?.[0] || log.tanggal,
                jamMulai: "08:00",
                jamSelesai: "17:00",
                waktu: "08:00 - 17:00",
                judul: log.judul_kegiatan,
                deskripsi: log.isi_kegiatan,
                foto: log.foto_kegiatan || "",
                status: formatStatus(log.status_persetujuan),
                catatan: log.catatan_pembimbing || "",
            }));

            // Calculate stats from logbooks
            stats.total = logbooks.value.length;
            stats.approved = logbooks.value.filter(
                (l) => l.status === "Disetujui",
            ).length;
            stats.pending = logbooks.value.filter(
                (l) => l.status === "Pending",
            ).length;
        } else {
            console.warn(
                "[LoadData] Failed to load logbooks:",
                logbooksRes?.message,
            );
            logbooks.value = [];
            stats.total = 0;
            stats.approved = 0;
            stats.pending = 0;
        }
    } catch (err) {
        console.error("[LoadData] Error loading logbooks:", err);
        toast.add({ title: "Gagal memuat data", color: "error" });
        logbooks.value = [];
        stats.total = 0;
        stats.approved = 0;
        stats.pending = 0;
    } finally {
        loading.value = false;
    }
}

function formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
        disetujui: "Disetujui",
        menunggu: "Pending",
        revisi: "Ditolak",
    };
    return statusMap[status] || status;
}

onMounted(() => {
    loadData();
});

useHead({ title: "Logbook | Siswa PKL" });
</script>
