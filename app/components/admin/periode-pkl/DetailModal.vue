<script setup lang="ts">
import { ref, computed } from "vue";
import {
    usePeriodePKLApi,
    type PeriodePKL,
} from "~/composables/api/use-periode-pkl";
import { formatDate } from "~/utils/format-date";

const props = defineProps<{
    periode: PeriodePKL | null;
}>();

const emit = defineEmits<{
    close: [];
    edit: [];
    clone: [];
    archive: [];
    restore: [];
    "status-change": [status: string];
}>();

const api = usePeriodePKLApi();
const toast = useToast();
const processing = ref(false);

const stats = computed(() => props.periode?.stats);

const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string; icon: string }
> = {
    draft: {
        label: "Draft",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50 border-yellow-200",
        icon: "lucide:file-text",
    },
    aktif: {
        label: "Aktif",
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200",
        icon: "lucide:rocket",
    },
    selesai: {
        label: "Selesai",
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200",
        icon: "lucide:check-circle-2",
    },
    arsip: {
        label: "Arsip",
        color: "text-slate-700",
        bgColor: "bg-slate-100 border-slate-200",
        icon: "lucide:archive",
    },
};

// Get next status action
const nextAction = computed(() => {
    if (!props.periode) return null;
    const status = props.periode.status;

    if (status === "draft") {
        return {
            label: "Aktifkan Periode",
            icon: "lucide:rocket",
            color: "green",
            description:
                "Mulai periode PKL. Setelah diaktifkan, periode tidak dapat dihapus.",
            status: "aktif",
        };
    }

    if (status === "aktif") {
        return {
            label: "Selesaikan Periode",
            icon: "lucide:check-circle-2",
            color: "blue",
            description:
                "Tandai periode sebagai selesai. Pastikan semua penempatan sudah selesai.",
            status: "selesai",
        };
    }

    if (status === "selesai") {
        return {
            label: "Arsipkan Periode",
            icon: "lucide:archive",
            color: "slate",
            description: "Arsipkan periode yang sudah selesai.",
            status: "arsip",
        };
    }

    return null;
});

// Can edit?
const canEdit = computed(() => {
    return (
        props.periode?.status === "draft" || props.periode?.status === "aktif"
    );
});

// Close modal
const close = () => {
    emit("close");
};

// Handle backdrop click
const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
        close();
    }
};

// Status change action
const handleStatusChange = async () => {
    if (!props.periode || !nextAction.value) return;

    const action = nextAction.value;
    const confirmMsg =
        action.status === "aktif"
            ? `Aktifkan periode "${props.periode.nama_periode}"?\n\n${action.description}`
            : action.status === "selesai"
              ? `Selesaikan periode "${props.periode.nama_periode}"?\n\n${action.description}`
              : `Arsipkan periode "${props.periode.nama_periode}"?\n\n${action.description}`;

    if (!confirm(confirmMsg)) return;

    processing.value = true;
    try {
        if (action.status === "arsip") {
            await api.archive(props.periode.id_periode_pkl);
            toast.add({
                title: "Periode berhasil diarsipkan",
                color: "success",
            });
        } else {
            await api.updateStatus(props.periode.id_periode_pkl, action.status);
            const label =
                action.status === "aktif" ? "diaktifkan" : "diselesaikan";
            toast.add({ title: `Periode berhasil ${label}`, color: "success" });
        }
        emit("status-change", action.status);
        close();
    } catch (error: any) {
        toast.add({
            title: "Gagal mengubah status",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        processing.value = false;
    }
};

// Edit
const handleEdit = () => {
    emit("edit");
};

// Clone
const handleClone = () => {
    emit("clone");
};

// Archive/Restore
const handleArchiveRestore = async () => {
    if (!props.periode) return;

    if (props.periode.status === "arsip") {
        // Restore
        if (
            !confirm(
                `Pulihkan periode "${props.periode.nama_periode}" dari arsip?`,
            )
        )
            return;
        processing.value = true;
        try {
            await api.restore(props.periode.id_periode_pkl);
            toast.add({
                title: "Periode berhasil dipulihkan",
                color: "success",
            });
            emit("restore");
            close();
        } catch (error: any) {
            toast.add({
                title: "Gagal memulihkan periode",
                description: error.response?.data?.message || error.message,
                color: "error",
            });
        } finally {
            processing.value = false;
        }
    } else if (props.periode.status === "selesai") {
        // Archive
        emit("archive");
        close();
    }
};

// Delete
const handleDelete = async () => {
    if (!props.periode) return;
    if (props.periode._count?.penempatan) {
        toast.add({
            title: "Tidak dapat menghapus",
            description:
                "Periode yang memiliki penempatan tidak dapat dihapus.",
            color: "error",
        });
        return;
    }

    if (!confirm(`Hapus periode "${props.periode.nama_periode}"?`)) return;

    processing.value = true;
    try {
        await api.remove(props.periode.id_periode_pkl);
        toast.add({ title: "Periode berhasil dihapus", color: "success" });
        close();
    } catch (error: any) {
        toast.add({
            title: "Gagal menghapus periode",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        processing.value = false;
    }
};
</script>

<template>
    <div
        v-if="periode"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click="handleBackdropClick"
    >
        <div
            class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
            <!-- Header with Status -->
            <div class="p-4 border-b border-slate-200">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h2 class="text-lg font-semibold text-slate-900">
                                {{ periode.nama_periode }}
                            </h2>
                            <span
                                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border"
                                :class="statusConfig[periode.status]?.bgColor"
                            >
                                <Icon
                                    :name="statusConfig[periode.status]?.icon"
                                    class="w-3.5 h-3.5"
                                />
                                {{ statusConfig[periode.status]?.label }}
                            </span>
                        </div>
                        <p class="text-sm text-slate-500">
                            {{ periode.tahun_ajaran?.nama_tahun_ajaran }}
                        </p>
                    </div>
                    <button
                        class="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                        @click="close"
                    >
                        <Icon name="lucide:x" class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <!-- Description -->
                <div
                    v-if="periode.deskripsi"
                    class="bg-slate-50 rounded-lg p-3"
                >
                    <p class="text-sm text-slate-700">
                        {{ periode.deskripsi }}
                    </p>
                </div>

                <!-- Periode Info Cards -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-slate-50 rounded-lg p-3">
                        <p
                            class="text-xs text-slate-500 mb-1 flex items-center gap-1"
                        >
                            <Icon name="lucide:calendar" class="w-3 h-3" />
                            Tanggal Mulai
                        </p>
                        <p class="text-sm font-medium text-slate-900">
                            {{ formatDate(periode.tanggal_mulai) }}
                        </p>
                    </div>
                    <div class="bg-slate-50 rounded-lg p-3">
                        <p
                            class="text-xs text-slate-500 mb-1 flex items-center gap-1"
                        >
                            <Icon
                                name="lucide:calendar-check"
                                class="w-3 h-3"
                            />
                            Tanggal Selesai
                        </p>
                        <p class="text-sm font-medium text-slate-900">
                            {{ formatDate(periode.tanggal_selesai) }}
                        </p>
                    </div>
                </div>

                <!-- Duration Card -->
                <div
                    class="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-4 border border-sky-100"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-slate-600">Durasi Periode</p>
                            <p class="text-2xl font-bold text-sky-600">
                                {{ periode.durasi_bulan || 0 }} Bulan
                            </p>
                        </div>
                        <div
                            class="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center"
                        >
                            <Icon
                                name="lucide:clock"
                                class="w-6 h-6 text-sky-600"
                            />
                        </div>
                    </div>
                </div>

                <!-- Stats if available -->
                <div v-if="stats" class="bg-slate-50 rounded-lg p-4">
                    <p
                        class="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2"
                    >
                        <Icon name="lucide:bar-chart-3" class="w-4 h-4" />
                        Statistik Penempatan
                    </p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div
                            class="bg-white rounded-lg p-3 border border-slate-100"
                        >
                            <p class="text-xs text-slate-500">
                                Total Siswa Kelas 12
                            </p>
                            <p class="text-lg font-semibold text-slate-900">
                                {{ stats.total_siswa_kelas_12 }}
                            </p>
                        </div>
                        <div
                            class="bg-white rounded-lg p-3 border border-slate-100"
                        >
                            <p class="text-xs text-slate-500">
                                Siswa Ditempatkan
                            </p>
                            <p class="text-lg font-semibold text-green-600">
                                {{ stats.siswa_ditempatkan }}
                            </p>
                        </div>
                        <div
                            class="bg-white rounded-lg p-3 border border-slate-100"
                        >
                            <p class="text-xs text-slate-500">
                                Belum Ditempatkan
                            </p>
                            <p class="text-lg font-semibold text-orange-600">
                                {{ stats.siswa_belum_ditempatkan }}
                            </p>
                        </div>
                        <div
                            class="bg-white rounded-lg p-3 border border-slate-100"
                        >
                            <p class="text-xs text-slate-500">Perusahaan</p>
                            <p class="text-lg font-semibold text-slate-900">
                                {{ stats.total_perusahaan }}
                            </p>
                        </div>
                        <div
                            class="bg-white rounded-lg p-3 border border-slate-100"
                        >
                            <p class="text-xs text-slate-500">
                                Guru Pembimbing
                            </p>
                            <p class="text-lg font-semibold text-slate-900">
                                {{ stats.total_guru_pembimbing }}
                            </p>
                        </div>
                        <div
                            class="bg-white rounded-lg p-3 border border-slate-100"
                        >
                            <p class="text-xs text-slate-500">Progress</p>
                            <p class="text-lg font-semibold text-sky-600">
                                {{ stats.progress_percentage }}%
                            </p>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mt-3">
                        <div class="w-full bg-slate-200 rounded-full h-2">
                            <div
                                class="bg-sky-500 h-2 rounded-full transition-all"
                                :style="{
                                    width: `${stats.progress_percentage}%`,
                                }"
                            />
                        </div>
                    </div>
                </div>

                <!-- Placement Count -->
                <div
                    v-if="periode._count"
                    class="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-3"
                >
                    <div
                        class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:users"
                            class="w-4 h-4 text-slate-600"
                        />
                    </div>
                    <span>
                        <strong>{{ periode._count.penempatan }}</strong>
                        penempatan terdaftar
                    </span>
                </div>

                <!-- Status Flow Guide -->
                <div
                    class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100"
                >
                    <p
                        class="text-xs font-medium text-indigo-900 mb-2 flex items-center gap-1"
                    >
                        <Icon name="lucide:info" class="w-3 h-3" />
                        Alur Status Periode
                    </p>
                    <div class="flex items-center justify-between text-xs">
                        <span
                            class="px-2 py-1 rounded bg-white border font-medium"
                            :class="
                                periode.status === 'draft'
                                    ? 'border-yellow-300 text-yellow-700'
                                    : 'border-slate-200 text-slate-500'
                            "
                            >Draft</span
                        >
                        <Icon
                            name="lucide:arrow-right"
                            class="w-4 h-4 text-slate-400"
                        />
                        <span
                            class="px-2 py-1 rounded bg-white border font-medium"
                            :class="
                                periode.status === 'aktif'
                                    ? 'border-green-300 text-green-700'
                                    : 'border-slate-200 text-slate-500'
                            "
                            >Aktif</span
                        >
                        <Icon
                            name="lucide:arrow-right"
                            class="w-4 h-4 text-slate-400"
                        />
                        <span
                            class="px-2 py-1 rounded bg-white border font-medium"
                            :class="
                                periode.status === 'selesai'
                                    ? 'border-blue-300 text-blue-700'
                                    : 'border-slate-200 text-slate-500'
                            "
                            >Selesai</span
                        >
                        <Icon
                            name="lucide:arrow-right"
                            class="w-4 h-4 text-slate-400"
                        />
                        <span
                            class="px-2 py-1 rounded bg-white border font-medium"
                            :class="
                                periode.status === 'arsip'
                                    ? 'border-slate-300 text-slate-700'
                                    : 'border-slate-200 text-slate-500'
                            "
                            >Arsip</span
                        >
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div
                class="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50"
            >
                <div class="flex items-center gap-2">
                    <!-- Primary Action Button -->
                    <UButton
                        v-if="nextAction"
                        :icon="nextAction.icon"
                        :color="nextAction.color as any"
                        :loading="processing"
                        @click="handleStatusChange"
                    >
                        {{ nextAction.label }}
                    </UButton>

                    <!-- Restore button for archived -->
                    <UButton
                        v-else-if="periode.status === 'arsip'"
                        icon="lucide:rotate-ccw"
                        color="amber"
                        variant="outline"
                        :loading="processing"
                        @click="handleArchiveRestore"
                    >
                        Pulihkan
                    </UButton>
                </div>

                <div class="flex items-center gap-2">
                    <!-- Clone -->
                    <UButton
                        icon="lucide:copy"
                        variant="outline"
                        color="neutral"
                        @click="handleClone"
                    >
                        Clone
                    </UButton>

                    <!-- Edit (only for draft/aktif) -->
                    <UButton
                        v-if="canEdit"
                        icon="lucide:pencil"
                        variant="outline"
                        color="neutral"
                        @click="handleEdit"
                    >
                        Edit
                    </UButton>

                    <!-- Delete (only for draft without placements) -->
                    <UButton
                        v-if="
                            periode.status === 'draft' &&
                            !periode._count?.penempatan
                        "
                        icon="lucide:trash-2"
                        variant="outline"
                        color="error"
                        :loading="processing"
                        @click="handleDelete"
                    >
                        Hapus
                    </UButton>

                    <!-- Close -->
                    <UButton variant="outline" color="neutral" @click="close">
                        Tutup
                    </UButton>
                </div>
            </div>
        </div>
    </div>
</template>
