<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                Verifikasi Logbook
            </h1>
            <p class="text-sm text-slate-500">
                Review dan verifikasi logbook siswa PKL
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

        <!-- Stats -->
        <div v-else class="grid grid-cols-3 gap-4">
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-warning-600">
                    {{ stats.pending }}
                </p>
                <p class="text-sm text-slate-500">Pending</p>
            </div>
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-success-600">
                    {{ stats.approved }}
                </p>
                <p class="text-sm text-slate-500">Disetujui</p>
            </div>
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 text-center"
            >
                <p class="text-2xl font-bold text-error-600">
                    {{ stats.revision }}
                </p>
                <p class="text-sm text-slate-500">Revisi</p>
            </div>
        </div>

        <!-- Data Table -->
        <CommonAppDataTable
            v-if="!error"
            :data="filteredData"
            :columns="columns"
            :loading="loading"
            :searchable="true"
            search-placeholder="Cari nama siswa atau judul..."
            empty-title="Tidak ada data logbook"
            empty-description="Belum ada logbook siswa yang perlu diverifikasi"
            empty-icon="lucide:book-open"
            page-size="10"
        >
            <template #toolbar-right>
                <USelectMenu
                    v-model="filterStatus"
                    :items="statusOptions"
                    value-attribute="value"
                    option-attribute="label"
                    size="sm"
                    class="w-32"
                />
            </template>
        </CommonAppDataTable>

        <!-- Revision Modal -->
        <UModal v-model:open="revisionModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            Minta Revisi
                        </h3>
                    </template>
                    <div class="space-y-4">
                        <div class="p-3 bg-slate-50 rounded-lg">
                            <p class="text-sm font-medium text-slate-900">
                                {{ selectedLog?.judul_kegiatan }}
                            </p>
                            <p class="text-xs text-slate-500">
                                {{ selectedLog?.penempatan?.siswa?.nama_siswa }}
                            </p>
                        </div>
                        <UFormField label="Catatan Revisi" required>
                            <UTextarea
                                v-model="revisionNote"
                                placeholder="Jelaskan apa yang perlu diperbaiki..."
                                :rows="3"
                            />
                        </UFormField>
                    </div>
                    <template #footer>
                        <div class="flex gap-3">
                            <UButton
                                variant="outline"
                                color="neutral"
                                class="flex-1"
                                @click="revisionModal = false"
                                >Batal</UButton
                            >
                            <UButton
                                color="error"
                                class="flex-1"
                                :disabled="!revisionNote"
                                @click="confirmRevision"
                                >Kirim</UButton
                            >
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <!-- Detail Modal (View Logbook) -->
        <UModal v-model:open="detailModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            Detail Logbook
                        </h3>
                    </template>
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs text-slate-500">Nama Siswa</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{
                                        selectedLog?.penempatan?.siswa
                                            ?.nama_siswa
                                    }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Tanggal</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ formatDate(selectedLog?.tanggal) }}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500 mb-1">
                                Judul Kegiatan
                            </p>
                            <p class="text-sm font-medium text-slate-900">
                                {{ selectedLog?.judul_kegiatan }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500 mb-1">Deskripsi</p>
                            <p
                                class="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg"
                            >
                                {{ selectedLog?.deskripsi_kegiatan || "-" }}
                            </p>
                        </div>
                        <div
                            v-if="selectedLog?.link_kegiatan"
                            class="p-3 bg-blue-50 rounded-lg"
                        >
                            <p class="text-xs text-slate-500 mb-1">
                                Link Kegiatan
                            </p>
                            <a
                                :href="selectedLog.link_kegiatan"
                                target="_blank"
                                class="text-sm text-blue-600 hover:underline break-all"
                            >
                                {{ selectedLog.link_kegiatan }}
                            </a>
                        </div>
                    </div>
                    <template #footer>
                        <UButton
                            variant="outline"
                            color="neutral"
                            class="w-full"
                            @click="detailModal = false"
                            >Tutup</UButton
                        >
                    </template>
                </UCard>
            </template>
        </UModal>
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
const filterStatus = ref("all");
const revisionModal = ref(false);
const revisionNote = ref("");
const selectedLog = ref<any>(null);
const detailModal = ref(false);

const stats = reactive({ pending: 0, approved: 0, revision: 0 });

const statusOptions = [
    { label: "Semua", value: "all" },
    { label: "Pending", value: "menunggu" },
    { label: "Disetujui", value: "disetujui" },
    { label: "Revisi", value: "revisi" },
];

const columnHelper = createColumnHelper<any>();

// Helper functions
function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function getStatusBadge(status: string) {
    const statusConfig: Record<string, { color: string; label: string }> = {
        menunggu: { color: "warning", label: "Pending" },
        disetujui: { color: "success", label: "Disetujui" },
        revisi: { color: "error", label: "Revisi" },
        ditolak: { color: "error", label: "Ditolak" },
    };
    const config = statusConfig[status] || { color: "neutral", label: status };
    return h(
        "span",
        {
            class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                config.color === "success"
                    ? "bg-green-100 text-green-700"
                    : config.color === "warning"
                      ? "bg-yellow-100 text-yellow-700"
                      : config.color === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
            }`,
        },
        config.label,
    );
}

const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("penempatan.siswa.nama_siswa", {
        id: "siswa",
        header: "Siswa",
        cell: (info) => {
            const siswa = info.row.original.penempatan?.siswa;
            const namaSiswa = siswa?.nama_siswa || "-";
            const kelas = siswa?.kelas?.nama_kelas || "-";
            const initials = getInitials(namaSiswa);

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
                        namaSiswa,
                    ),
                    h("p", { class: "text-xs text-slate-500 truncate" }, kelas),
                ]),
            ]);
        },
    }),
    columnHelper.accessor("tanggal", {
        id: "tanggal",
        header: "Tanggal",
        cell: (info) => {
            return h(
                "span",
                { class: "text-sm text-slate-700" },
                formatDate(info.getValue() as string),
            );
        },
    }),
    columnHelper.accessor("judul_kegiatan", {
        id: "judul",
        header: "Judul Kegiatan",
        cell: (info) => {
            const judul = info.getValue() as string;
            return h("div", { class: "max-w-xs" }, [
                h(
                    "p",
                    { class: "text-sm font-medium text-slate-900 truncate" },
                    judul,
                ),
            ]);
        },
    }),
    columnHelper.accessor("deskripsi_kegiatan", {
        id: "deskripsi",
        header: "Deskripsi",
        cell: (info) => {
            const deskripsi = info.getValue() as string;
            const truncated =
                deskripsi?.length > 80
                    ? deskripsi.substring(0, 80) + "..."
                    : deskripsi;
            return h(
                "p",
                { class: "text-sm text-slate-600 line-clamp-2 max-w-xs" },
                truncated || "-",
            );
        },
    }),
    columnHelper.accessor("status_persetujuan", {
        id: "status",
        header: "Status",
        cell: (info) => getStatusBadge(info.getValue() as string),
    }),
    columnHelper.display({
        id: "aksi",
        header: "",
        cell: (info) => {
            const row = info.row.original;
            const status = row.status_persetujuan;

            // Only show actions for pending logbooks
            if (status !== "menunggu") {
                return h(
                    "button",
                    {
                        onClick: () => openDetail(row),
                        class: "p-1.5 rounded-lg text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors",
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
                            ],
                        ),
                    ],
                );
            }

            return h("div", { class: "flex gap-1" }, [
                h(
                    "button",
                    {
                        onClick: () => approve(row),
                        class: "p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors",
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
                            [h("path", { d: "M20 6 9 17l-5-5" })],
                        ),
                    ],
                ),
                h(
                    "button",
                    {
                        onClick: () => openRevision(row),
                        class: "p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors",
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
                                    d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5",
                                }),
                                h("path", {
                                    d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-5-5",
                                }),
                            ],
                        ),
                    ],
                ),
            ]);
        },
    }),
];

// Computed filtered data
const filteredData = computed(() => {
    if (filterStatus.value === "all") return data.value;
    return data.value.filter(
        (d) => d.status_persetujuan === filterStatus.value,
    );
});

// Update stats
function updateStats() {
    stats.pending = data.value.filter(
        (d) => d.status_persetujuan === "menunggu",
    ).length;
    stats.approved = data.value.filter(
        (d) => d.status_persetujuan === "disetujui",
    ).length;
    stats.revision = data.value.filter(
        (d) => d.status_persetujuan === "revisi",
    ).length;
}

// Fetch data
async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
        const response = await apiFetch<any>(
            "PlacementService",
            "/logbook/mentor/me",
        );

        if (response.data.success) {
            data.value = response.data.data || [];
            updateStats();
        } else {
            error.value = response.data.message || "Gagal memuat data logbook";
        }
    } catch (e: any) {
        console.error("Error fetching logbook:", e);
        error.value = e.response?.data?.message || "Gagal memuat data logbook";
        toast.add({
            title: "Error",
            description: error.value,
            color: "red",
        });
    } finally {
        loading.value = false;
    }
}

// Approve logbook
async function approve(item: any) {
    try {
        const response = await apiFetch<any>(
            "PlacementService",
            `/logbook/${item.id_logbook}/review`,
            {
                method: "POST",
                data: { status_persetujuan: "disetujui" },
            },
        );

        if (response.data.success) {
            item.status_persetujuan = "disetujui";
            updateStats();
            toast.add({
                title: "Berhasil",
                description: "Logbook disetujui",
                color: "success",
            });
        }
    } catch (e: any) {
        toast.add({
            title: "Error",
            description:
                e.response?.data?.message || "Gagal menyetujui logbook",
            color: "red",
        });
    }
}

// Open revision modal
function openRevision(item: any) {
    selectedLog.value = item;
    revisionNote.value = "";
    revisionModal.value = true;
}

// Confirm revision
async function confirmRevision() {
    if (!revisionNote.value) {
        toast.add({
            title: "Error",
            description: "Masukkan catatan revisi",
            color: "error",
        });
        return;
    }

    try {
        const response = await apiFetch<any>(
            "PlacementService",
            `/logbook/${selectedLog.value.id_logbook}/review`,
            {
                method: "POST",
                data: {
                    status_persetujuan: "revisi",
                    catatan_pembimbing: revisionNote.value,
                },
            },
        );

        if (response.data.success) {
            selectedLog.value.status_persetujuan = "revisi";
            updateStats();
            revisionModal.value = false;
            toast.add({
                title: "Berhasil",
                description: "Permintaan revisi dikirim",
                color: "success",
            });
        }
    } catch (e: any) {
        toast.add({
            title: "Error",
            description:
                e.response?.data?.message || "Gagal mengirim permintaan revisi",
            color: "red",
        });
    }
}

// Open detail modal
function openDetail(item: any) {
    selectedLog.value = item;
    detailModal.value = true;
}

onMounted(() => {
    fetchData();
});

useHead({ title: "Verifikasi Logbook | Mentor" });
</script>
