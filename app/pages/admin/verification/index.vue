<script setup lang="ts">
import { ref, onMounted, h, computed, watch } from "vue";
import {
    usePengajuanApi,
    type Pengajuan,
} from "~/composables/api/use-internship";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const toast = useToast();
const pengajuanApi = usePengajuanApi();

const loading = ref(true);
const search = ref("");
const filterStatus = ref("Semua");
const modalOpen = ref(false);
const selected = ref<Pengajuan | null>(null);
const actionNote = ref("");
const processing = ref(false);

const statusOptions = ["Semua", "Menunggu", "Disetujui", "Ditolak"];
const data = ref<Pengajuan[]>([]);
const stats = reactive({ total: 0, pending: 0, approved: 0, rejected: 0 });

// Column helper for TanStack Table
const columnHelper = createColumnHelper<Pengajuan>();

// Helpers
const getInitials = (name: string) => {
    if (!name) return "??";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const statusColor = (
    s: string,
): "warning" | "success" | "error" | "neutral" => {
    const colors: Record<string, "warning" | "success" | "error" | "neutral"> =
        {
            menunggu: "warning",
            disetujui: "success",
            ditolak: "error",
        };
    return colors[s] || "neutral";
};

const statusIcon = (s: string) => {
    const icons: Record<string, string> = {
        menunggu: "lucide:clock",
        disetujui: "lucide:check-circle",
        ditolak: "lucide:x-circle",
    };
    return icons[s] || "lucide:help-circle";
};

const statusLabel = (s: string) => {
    const labels: Record<string, string> = {
        menunggu: "Menunggu",
        disetujui: "Disetujui",
        ditolak: "Ditolak",
    };
    return labels[s] || s;
};

const getStatusBadgeClass = (s: string) => {
    const classes: Record<string, string> = {
        menunggu: "bg-warning-50 text-warning-700",
        disetujui: "bg-success-50 text-success-700",
        ditolak: "bg-error-50 text-error-700",
    };
    return classes[s] || "bg-neutral-100 text-neutral-700";
};

// Define columns using TanStack Table format
const columns: ColumnDef<Pengajuan, any>[] = [
    {
        id: "no",
        header: "No",
        cell: ({ row, table }) => {
            const index = table
                .getSortedRowModel()
                .rows.findIndex((r) => r.id === row.id);
            const pageSize = table.getState().pagination.pageSize;
            const pageIndex = table.getState().pagination.pageIndex;
            return h(
                "span",
                {
                    class: "text-sm text-slate-500 w-6 text-center inline-block",
                },
                pageIndex * pageSize + index + 1,
            );
        },
    },
    {
        id: "siswa",
        header: "Siswa",
        cell: ({ row }) => {
            const namaSiswa = row.original.siswa?.nama_siswa || "-";
            const namaKelas = row.original.siswa?.kelas?.nama_kelas || "-";
            const initials = getInitials(namaSiswa);
            return h("div", { class: "flex items-center gap-3" }, [
                h(
                    "div",
                    {
                        class: "w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0",
                    },
                    initials,
                ),
                h("div", { class: "min-w-0" }, [
                    h("p", { class: "font-medium text-slate-900" }, namaSiswa),
                    h("p", { class: "text-xs text-slate-500" }, namaKelas),
                ]),
            ]);
        },
    },
    {
        id: "perusahaan",
        header: "Perusahaan",
        cell: ({ row }) => {
            const namaPerusahaan =
                row.original.perusahaan?.nama_perusahaan || "-";
            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "svg",
                    {
                        class: "w-4 h-4 text-slate-400",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": 2,
                    },
                    [
                        h("path", {
                            d: "M3 21h18 M5 21V7l8-4 8 4v14 M8 21v-9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9",
                        }),
                    ],
                ),
                h("span", { class: "text-sm text-slate-700" }, namaPerusahaan),
            ]);
        },
    },
    {
        id: "tanggal",
        header: "Tanggal",
        cell: ({ row }) => {
            return h(
                "span",
                { class: "text-sm text-slate-600" },
                formatDate(row.original.tanggal_pengajuan),
            );
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status_pengajuan;
            return h(
                "span",
                {
                    class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(status)}`,
                },
                statusLabel(status),
            );
        },
    },
    {
        id: "aksi",
        header: "",
        cell: ({ row }) => {
            const item = row.original;
            return h(
                "div",
                { class: "flex items-center justify-center gap-2" },
                [
                    h(
                        "button",
                        {
                            class: "p-1.5 rounded hover:bg-primary-50 text-primary-600",
                            onClick: () => openDetail(item),
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
                    item.status_pengajuan === "menunggu"
                        ? h(
                              "button",
                              {
                                  class: "p-1.5 rounded hover:bg-success-50 text-success-600",
                                  onClick: () => quickApprove(item),
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
                                  [h("path", { d: "M20 6 9 17l-5-5" })],
                              ),
                          )
                        : null,
                ],
            );
        },
    },
];

// Computed
const allFilteredData = computed(() => {
    return data.value.filter((d) => {
        const searchLower = search.value.toLowerCase();
        const matchSearch =
            !search.value ||
            d.siswa?.nama_siswa?.toLowerCase().includes(searchLower) ||
            d.perusahaan?.nama_perusahaan?.toLowerCase().includes(searchLower);
        const matchStatus =
            filterStatus.value === "Semua" ||
            d.status_pengajuan === filterStatus.value.toLowerCase();
        return matchSearch && matchStatus;
    });
});

watch([search, filterStatus], () => {
    // Reset handled by CommonAppDataTable
});

// Actions
const resetFilters = () => {
    search.value = "";
    filterStatus.value = "Semua";
};

const openDetail = (item: Pengajuan) => {
    selected.value = item;
    actionNote.value = "";
    modalOpen.value = true;
};

const quickApprove = async (item: Pengajuan) => {
    selected.value = item;
    actionNote.value = "";
    await handleApprove();
};

const handleApprove = async () => {
    if (!selected.value) return;
    processing.value = true;
    try {
        const response = await pengajuanApi.approve(
            selected.value.id_pengajuan,
            actionNote.value || undefined,
        );
        if (response.success) {
            // Update local data
            const index = data.value.findIndex(
                (d) => d.id_pengajuan === selected.value!.id_pengajuan,
            );
            if (index !== -1) {
                data.value[index].status_pengajuan = "disetujui";
                data.value[index].catatan_pengajuan =
                    actionNote.value || data.value[index].catatan_pengajuan;
            }
            stats.pending--;
            stats.approved++;
            modalOpen.value = false;
            toast.add({
                title: "Pengajuan Disetujui",
                description: `Pengajuan dari ${selected.value.siswa?.nama_siswa} telah disetujui`,
                color: "success",
            });
        } else {
            toast.add({
                title: response.message || "Gagal menyetujui",
                color: "error",
            });
        }
    } catch (error: any) {
        toast.add({
            title: "Terjadi kesalahan",
            description: error.message,
            color: "error",
        });
    } finally {
        processing.value = false;
    }
};

const handleReject = async () => {
    if (!selected.value) return;
    if (!actionNote.value.trim()) {
        toast.add({
            title: "Catatan wajib diisi",
            description: "Silakan masukkan alasan penolakan",
            color: "error",
        });
        return;
    }
    processing.value = true;
    try {
        const response = await pengajuanApi.reject(
            selected.value.id_pengajuan,
            actionNote.value,
        );
        if (response.success) {
            // Update local data
            const index = data.value.findIndex(
                (d) => d.id_pengajuan === selected.value!.id_pengajuan,
            );
            if (index !== -1) {
                data.value[index].status_pengajuan = "ditolak";
                data.value[index].catatan_penolakan = actionNote.value;
            }
            stats.pending--;
            stats.rejected++;
            modalOpen.value = false;
            toast.add({
                title: "Pengajuan Ditolak",
                description: `Pengajuan dari ${selected.value.siswa?.nama_siswa} telah ditolak`,
                color: "error",
            });
        } else {
            toast.add({
                title: response.message || "Gagal menolak",
                color: "error",
            });
        }
    } catch (error: any) {
        toast.add({
            title: "Terjadi kesalahan",
            description: error.message,
            color: "error",
        });
    } finally {
        processing.value = false;
    }
};

// Fetch data
const fetchData = async () => {
    loading.value = true;
    try {
        const response = await pengajuanApi.getAll({ limit: 100 });
        if (response.success) {
            data.value = response.data || [];
            // Calculate stats
            stats.total = data.value.length;
            stats.pending = data.value.filter(
                (d) => d.status_pengajuan === "menunggu",
            ).length;
            stats.approved = data.value.filter(
                (d) => d.status_pengajuan === "disetujui",
            ).length;
            stats.rejected = data.value.filter(
                (d) => d.status_pengajuan === "ditolak",
            ).length;
        }
    } catch (error: any) {
        console.error("Failed to fetch pengajuan:", error);
        toast.add({
            title: "Gagal memuat data",
            description: error.message,
            color: "error",
        });
    } finally {
        loading.value = false;
    }
};

onMounted(fetchData);

useHead({ title: "Verifikasi Pengajuan | Admin" });
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Verifikasi Pengajuan
                </h1>
                <p class="text-sm text-slate-500 mt-1">
                    Kelola dan verifikasi pengajuan PKL siswa
                </p>
            </div>
            <UButton
                color="primary"
                variant="outline"
                size="sm"
                @click="fetchData"
                :loading="loading"
            >
                <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-2" />
                Refresh
            </UButton>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                class="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-2xl font-bold text-slate-900">
                            {{ stats.total }}
                        </p>
                        <p class="text-sm text-slate-500">Total Pengajuan</p>
                    </div>
                    <div
                        class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:file-text"
                            class="w-5 h-5 text-slate-600"
                        />
                    </div>
                </div>
            </div>
            <div
                class="bg-white rounded-xl border border-amber-200 bg-amber-50/50 p-4 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-2xl font-bold text-amber-600">
                            {{ stats.pending }}
                        </p>
                        <p class="text-sm text-amber-600/70">Menunggu</p>
                    </div>
                    <div
                        class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:clock"
                            class="w-5 h-5 text-amber-600"
                        />
                    </div>
                </div>
            </div>
            <div
                class="bg-white rounded-xl border border-green-200 bg-green-50/50 p-4 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-2xl font-bold text-green-600">
                            {{ stats.approved }}
                        </p>
                        <p class="text-sm text-green-600/70">Disetujui</p>
                    </div>
                    <div
                        class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:check-circle"
                            class="w-5 h-5 text-green-600"
                        />
                    </div>
                </div>
            </div>
            <div
                class="bg-white rounded-xl border border-red-200 bg-red-50/50 p-4 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-2xl font-bold text-red-600">
                            {{ stats.rejected }}
                        </p>
                        <p class="text-sm text-red-600/70">Ditolak</p>
                    </div>
                    <div
                        class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:x-circle"
                            class="w-5 h-5 text-red-600"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <CommonAppDataTable
            :data="allFilteredData"
            :columns="columns"
            :loading="loading"
            title="Daftar Pengajuan"
            description="Kelola dan verifikasi pengajuan PKL siswa"
            :searchable="false"
            empty-title="Tidak ada data pengajuan"
            empty-description="Belum ada pengajuan PKL yang masuk"
            empty-icon="lucide:file-text"
        >
            <template #toolbar-left>
                <div class="relative flex-1">
                    <Icon
                        name="lucide:search"
                        class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <UInput
                        v-model="search"
                        placeholder="Cari nama siswa atau perusahaan..."
                        class="w-full pl-9"
                    />
                </div>
                <USelectMenu
                    v-model="filterStatus"
                    :items="statusOptions"
                    class="w-full sm:w-40"
                >
                    <template #label>
                        <div class="flex items-center gap-2">
                            <Icon
                                name="lucide:filter"
                                class="w-4 h-4 text-slate-400"
                            />
                            {{ filterStatus }}
                        </div>
                    </template>
                </USelectMenu>
            </template>
        </CommonAppDataTable>

        <!-- Detail Modal -->
        <UModal v-model:open="modalOpen" :ui="{ width: 'sm:max-w-md' }">
            <template #content>
                <UCard
                    v-if="selected"
                    :ui="{
                        body: { padding: 'p-6' },
                        footer: { padding: 'px-6 pb-6' },
                    }"
                >
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3
                                    class="font-semibold text-slate-900 text-lg"
                                >
                                    Detail Pengajuan
                                </h3>
                                <p class="text-sm text-slate-500">
                                    ID: #{{ selected.id_pengajuan }}
                                </p>
                            </div>
                            <UButton
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                @click="modalOpen = false"
                            >
                                <Icon name="lucide:x" class="w-5 h-5" />
                            </UButton>
                        </div>
                    </template>

                    <div class="space-y-5">
                        <!-- Siswa Info -->
                        <div
                            class="flex items-center gap-4 p-4 bg-gradient-to-r from-sky-50 to-slate-50 rounded-xl border border-sky-100"
                        >
                            <div
                                class="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-md"
                            >
                                {{
                                    getInitials(
                                        selected.siswa?.nama_siswa || "-",
                                    )
                                }}
                            </div>
                            <div class="flex-1">
                                <p class="font-semibold text-slate-900 text-lg">
                                    {{ selected.siswa?.nama_siswa || "-" }}
                                </p>
                                <div class="flex items-center gap-2 mt-1">
                                    <UBadge
                                        size="xs"
                                        color="neutral"
                                        variant="subtle"
                                    >
                                        {{
                                            selected.siswa?.kelas?.nama_kelas ||
                                            "-"
                                        }}
                                    </UBadge>
                                    <span class="text-slate-400">•</span>
                                    <span class="text-sm text-slate-500">{{
                                        selected.siswa?.kelas?.jurusan
                                            ?.nama_jurusan || "-"
                                    }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Details Grid -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-4 bg-slate-50 rounded-xl">
                                <div class="flex items-center gap-2 mb-2">
                                    <Icon
                                        name="lucide:building-2"
                                        class="w-4 h-4 text-slate-400"
                                    />
                                    <p
                                        class="text-xs text-slate-500 uppercase tracking-wide"
                                    >
                                        Perusahaan
                                    </p>
                                </div>
                                <p class="font-medium text-slate-900">
                                    {{
                                        selected.perusahaan?.nama_perusahaan ||
                                        "-"
                                    }}
                                </p>
                            </div>
                            <div class="p-4 bg-slate-50 rounded-xl">
                                <div class="flex items-center gap-2 mb-2">
                                    <Icon
                                        name="lucide:calendar"
                                        class="w-4 h-4 text-slate-400"
                                    />
                                    <p
                                        class="text-xs text-slate-500 uppercase tracking-wide"
                                    >
                                        Tanggal
                                    </p>
                                </div>
                                <p class="font-medium text-slate-900">
                                    {{ formatDate(selected.tanggal_pengajuan) }}
                                </p>
                            </div>
                        </div>

                        <!-- Status Display -->
                        <div
                            class="flex items-center justify-between p-4 rounded-xl border"
                            :class="{
                                'bg-amber-50 border-amber-200':
                                    selected.status_pengajuan === 'menunggu',
                                'bg-green-50 border-green-200':
                                    selected.status_pengajuan === 'disetujui',
                                'bg-red-50 border-red-200':
                                    selected.status_pengajuan === 'ditolak',
                            }"
                        >
                            <span
                                class="text-sm font-medium"
                                :class="{
                                    'text-amber-700':
                                        selected.status_pengajuan ===
                                        'menunggu',
                                    'text-green-700':
                                        selected.status_pengajuan ===
                                        'disetujui',
                                    'text-red-700':
                                        selected.status_pengajuan === 'ditolak',
                                }"
                            >
                                Status:
                                {{ statusLabel(selected.status_pengajuan) }}
                            </span>
                            <UBadge
                                :color="statusColor(selected.status_pengajuan)"
                                variant="subtle"
                            >
                                <Icon
                                    :name="
                                        statusIcon(selected.status_pengajuan)
                                    "
                                    class="w-3 h-3 mr-1"
                                />
                                {{ statusLabel(selected.status_pengajuan) }}
                            </UBadge>
                        </div>

                        <!-- Catatan Pengajuan -->
                        <div
                            v-if="selected.catatan_pengajuan"
                            class="p-4 bg-sky-50 rounded-xl border border-sky-100"
                        >
                            <div class="flex items-center gap-2 mb-2">
                                <Icon
                                    name="lucide:message-square"
                                    class="w-4 h-4 text-sky-500"
                                />
                                <p
                                    class="text-xs text-sky-700 font-medium uppercase tracking-wide"
                                >
                                    Catatan Siswa
                                </p>
                            </div>
                            <p class="text-sm text-slate-700">
                                {{ selected.catatan_pengajuan }}
                            </p>
                        </div>

                        <!-- Catatan Penolakan (if rejected) -->
                        <div
                            v-if="
                                selected.status_pengajuan === 'ditolak' &&
                                selected.catatan_penolakan
                            "
                            class="p-4 bg-red-50 rounded-xl border border-red-100"
                        >
                            <div class="flex items-center gap-2 mb-2">
                                <Icon
                                    name="lucide:alert-circle"
                                    class="w-4 h-4 text-red-500"
                                />
                                <p
                                    class="text-xs text-red-700 font-medium uppercase tracking-wide"
                                >
                                    Alasan Penolakan
                                </p>
                            </div>
                            <p class="text-sm text-slate-700">
                                {{ selected.catatan_penolakan }}
                            </p>
                        </div>

                        <!-- Action Note (for pending) -->
                        <div v-if="selected.status_pengajuan === 'menunggu'">
                            <UFormField
                                label="Catatan (opsional untuk approve, wajib untuk tolak)"
                            >
                                <UTextarea
                                    v-model="actionNote"
                                    placeholder="Masukkan catatan untuk siswa..."
                                    :rows="3"
                                    :disabled="processing"
                                />
                            </UFormField>
                        </div>
                    </div>

                    <template #footer>
                        <div
                            v-if="selected.status_pengajuan === 'menunggu'"
                            class="flex gap-3"
                        >
                            <UButton
                                color="error"
                                variant="outline"
                                class="flex-1"
                                :loading="processing"
                                :disabled="processing"
                                @click="handleReject"
                            >
                                <Icon name="lucide:x" class="w-4 h-4 mr-2" />
                                Tolak
                            </UButton>
                            <UButton
                                color="success"
                                class="flex-1"
                                :loading="processing"
                                :disabled="processing"
                                @click="handleApprove"
                            >
                                <Icon
                                    name="lucide:check"
                                    class="w-4 h-4 mr-2"
                                />
                                Setujui
                            </UButton>
                        </div>
                        <UBadge
                            v-else
                            :color="statusColor(selected.status_pengajuan)"
                            size="lg"
                        >
                            <Icon
                                :name="statusIcon(selected.status_pengajuan)"
                                class="w-4 h-4 mr-1"
                            />
                            {{ statusLabel(selected.status_pengajuan) }}
                        </UBadge>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
