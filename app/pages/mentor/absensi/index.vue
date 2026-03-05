<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                Verifikasi Absensi
            </h1>
            <p class="text-sm text-slate-500">
                Verifikasi kehadiran siswa PKL di perusahaan Anda
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
                    {{ stats.rejected }}
                </p>
                <p class="text-sm text-slate-500">Ditolak</p>
            </div>
        </div>

        <!-- Data Table -->
        <CommonAppDataTable
            v-if="!error"
            :data="data"
            :columns="columns"
            :loading="loading"
            :searchable="true"
            search-placeholder="Cari nama siswa atau NIS..."
            empty-title="Tidak ada data absensi"
            empty-description="Belum ada data absensi siswa"
            empty-icon="lucide:calendar-check"
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

        <!-- Reject Modal -->
        <UModal v-model:open="rejectModal">
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="font-semibold text-slate-900">
                            Tolak Absensi
                        </h3>
                    </template>
                    <div class="space-y-4">
                        <UFormField label="Siswa" required>
                            <p class="text-sm text-slate-700">
                                {{
                                    selectedItem?.penempatan?.siswa?.nama_siswa
                                }}
                            </p>
                        </UFormField>
                        <UFormField label="Tanggal" required>
                            <p class="text-sm text-slate-700">
                                {{ formatDate(selectedItem?.tanggal) }}
                            </p>
                        </UFormField>
                        <UFormField label="Alasan Penolakan" required>
                            <UTextarea
                                v-model="rejectReason"
                                placeholder="Masukkan alasan penolakan..."
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
                                @click="rejectModal = false"
                                >Batal</UButton
                            >
                            <UButton
                                color="error"
                                class="flex-1"
                                :disabled="!rejectReason"
                                @click="confirmReject"
                                >Tolak</UButton
                            >
                        </div>
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
const rejectModal = ref(false);
const rejectReason = ref("");
const selectedItem = ref<any>(null);

const stats = reactive({ pending: 0, approved: 0, rejected: 0 });

const statusOptions = [
    { label: "Semua", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Disetujui", value: "hadir" },
    { label: "Ditolak", value: "tidak_hadir" },
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

function formatTime(timeStr: string | Date) {
    if (!timeStr) return "-";
    const date = typeof timeStr === "string" ? new Date(timeStr) : timeStr;
    return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
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
        pending: { color: "warning", label: "Pending" },
        hadir: { color: "success", label: "Disetujui" },
        tidak_hadir: { color: "error", label: "Ditolak" },
        izin: { color: "neutral", label: "Izin" },
        sakit: { color: "neutral", label: "Sakit" },
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
            const nis = siswa?.nis || "-";
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
                    h("p", { class: "text-xs text-slate-500 truncate" }, nis),
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
    columnHelper.accessor("waktu_masuk", {
        id: "waktu_masuk",
        header: "Check In",
        cell: (info) => {
            return h(
                "span",
                { class: "text-sm text-slate-700" },
                formatTime(info.getValue() as string),
            );
        },
    }),
    columnHelper.accessor("waktu_keluar", {
        id: "waktu_keluar",
        header: "Check Out",
        cell: (info) => {
            return h(
                "span",
                { class: "text-sm text-slate-700" },
                formatTime(info.getValue() as string),
            );
        },
    }),
    columnHelper.accessor("status_absensi", {
        id: "status",
        header: "Status",
        cell: (info) => getStatusBadge(info.getValue() as string),
    }),
    columnHelper.display({
        id: "aksi",
        header: "",
        cell: (info) => {
            const row = info.row.original;
            const status = row.status_absensi;

            if (status !== "pending") {
                return h("span", { class: "text-xs text-slate-400" }, "-");
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
                        onClick: () => openReject(row),
                        class: "p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors",
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
                                h("path", { d: "M18 6 6 18" }),
                                h("path", { d: "M6 6l12 12" }),
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
    return data.value.filter((d) => d.status_absensi === filterStatus.value);
});

// Update stats
function updateStats() {
    stats.pending = data.value.filter(
        (d) => d.status_absensi === "pending",
    ).length;
    stats.approved = data.value.filter(
        (d) => d.status_absensi === "hadir",
    ).length;
    stats.rejected = data.value.filter(
        (d) => d.status_absensi === "tidak_hadir",
    ).length;
}

// Fetch data
async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
        const response = await apiFetch<any>(
            "PlacementService",
            "/absensi/mentor/me",
        );

        if (response.data.success) {
            data.value = response.data.data || [];
            updateStats();
        } else {
            error.value = response.data.message || "Gagal memuat data absensi";
        }
    } catch (e: any) {
        console.error("Error fetching absensi:", e);
        error.value = e.response?.data?.message || "Gagal memuat data absensi";
        toast.add({
            title: "Error",
            description: error.value,
            color: "red",
        });
    } finally {
        loading.value = false;
    }
}

// Approve absensi
async function approve(item: any) {
    try {
        const response = await apiFetch<any>(
            "PlacementService",
            `/absensi/${item.id_absensi}`,
            {
                method: "PUT",
                data: { status_absensi: "hadir" },
            },
        );

        if (response.data.success) {
            item.status_absensi = "hadir";
            updateStats();
            toast.add({
                title: "Berhasil",
                description: "Absensi disetujui",
                color: "success",
            });
        }
    } catch (e: any) {
        toast.add({
            title: "Error",
            description:
                e.response?.data?.message || "Gagal menyetujui absensi",
            color: "red",
        });
    }
}

// Open reject modal
function openReject(item: any) {
    selectedItem.value = item;
    rejectReason.value = "";
    rejectModal.value = true;
}

// Confirm reject
async function confirmReject() {
    if (!rejectReason.value) {
        toast.add({
            title: "Error",
            description: "Masukkan alasan penolakan",
            color: "error",
        });
        return;
    }

    try {
        const response = await apiFetch<any>(
            "PlacementService",
            `/absensi/${selectedItem.value.id_absensi}`,
            {
                method: "PUT",
                data: {
                    status_absensi: "tidak_hadir",
                    keterangan: rejectReason.value,
                },
            },
        );

        if (response.data.success) {
            selectedItem.value.status_absensi = "tidak_hadir";
            updateStats();
            rejectModal.value = false;
            toast.add({
                title: "Berhasil",
                description: "Absensi ditolak",
                color: "success",
            });
        }
    } catch (e: any) {
        toast.add({
            title: "Error",
            description: e.response?.data?.message || "Gagal menolak absensi",
            color: "red",
        });
    }
}

onMounted(() => {
    fetchData();
});

useHead({ title: "Verifikasi Absensi | Mentor" });
</script>
