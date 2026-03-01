<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
    usePeriodePKLApi,
    type PeriodePKL,
    type PeriodeReport,
} from "~/composables/api/use-periode-pkl";
import { formatDate } from "~/utils/format-date";

// ============================================================
// PROPS & EMITS
// ============================================================
const props = defineProps<{
    periode: PeriodePKL | null;
}>();

const emit = defineEmits<{
    close: [];
}>();

// ============================================================
// API & STATE
// ============================================================
const api = usePeriodePKLApi();
const toast = useToast();

const loading = ref(false);
const reportData = ref<PeriodeReport | null>(null);

// ============================================================
// CONSTANTS
// ============================================================
const WHITESPACE_REGEX = /\s+/g;

// ============================================================
// HELPERS
// ============================================================
/**
 * Sanitize filename by replacing whitespace with dashes
 */
const filenameSafe = (str: string): string => {
    return str.replace(WHITESPACE_REGEX, "-").toLowerCase();
};

/**
 * Calculate percentage safely (no division by zero)
 */
const calculatePercentage = (value: number, total: number): number => {
    if (total <= 0) return 0;
    return Math.round((value / total) * 100);
};

// ============================================================
// COMPUTED
// ============================================================
const hasReport = computed(() => reportData.value !== null);

// ============================================================
// METHODS
// ============================================================
/**
 * Fetch report data from API
 */
const fetchReport = async (): Promise<void> => {
    if (!props.periode) return;

    loading.value = true;
    try {
        const response = await api.getReport(props.periode.id_periode_pkl);
        if (response.success) {
            reportData.value = response.data;
        }
    } catch (error: unknown) {
        console.error("Failed to fetch report:", error);
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Terjadi kesalahan yang tidak diketahui";
        toast.add({
            title: "Gagal memuat laporan",
            description: errorMessage,
            color: "error",
        });
    } finally {
        loading.value = false;
    }
};

/**
 * Close the modal
 */
const close = (): void => {
    emit("close");
};

/**
 * Handle backdrop click to close modal
 */
const handleBackdropClick = (e: MouseEvent): void => {
    if (e.target === e.currentTarget) {
        close();
    }
};

/**
 * Download report as text file
 */
const downloadReport = (): void => {
    if (!reportData.value) return;

    const lines: string[] = [];

    // Header
    lines.push("LAPORAN PERIODE PKL");
    lines.push(`Nama Periode: ${reportData.value.periode.nama_periode}`);
    lines.push(
        `Tanggal: ${formatDate(reportData.value.periode.tanggal_mulai)} - ${formatDate(reportData.value.periode.tanggal_selesai)}`,
    );
    lines.push(`Status: ${reportData.value.periode.status}`);
    lines.push("");

    // Statistik
    lines.push("STATISTIK");
    lines.push(
        `Total Siswa Kelas 12: ${reportData.value.statistik.total_siswa_kelas_12}`,
    );
    lines.push(
        `Siswa Ditempatkan: ${reportData.value.statistik.siswa_ditempatkan}`,
    );
    lines.push(
        `Siswa Belum Ditempatkan: ${reportData.value.statistik.siswa_belum_ditempatkan}`,
    );
    lines.push(`Progress: ${reportData.value.statistik.progress_percentage}%`);
    lines.push("");

    // Perusahaan
    lines.push("PERUSAHAAN MITRA");
    reportData.value.perusahaan.forEach((p) => {
        lines.push(`- ${p.nama_perusahaan}: ${p.jumlah_siswa} siswa`);
    });
    lines.push("");

    // Jurusan
    lines.push("REKAP PER JURUSAN");
    reportData.value.jurusan.forEach((j) => {
        const percent = calculatePercentage(j.siswa_ditempatkan, j.total_siswa);
        lines.push(
            `- ${j.nama_jurusan}: ${j.siswa_ditempatkan}/${j.total_siswa} (${percent}%)`,
        );
    });

    // Create blob and download
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const filename = `laporan-${filenameSafe(reportData.value.periode.nama_periode)}.txt`;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Get jurusan percentage for progress bar
 */
const getJurusanPercentage = (
    siswaDitempatkan: number,
    totalSiswa: number,
): number => {
    return calculatePercentage(siswaDitempatkan, totalSiswa);
};

// ============================================================
// WATCHERS
// ============================================================
watch(
    () => props.periode,
    (newPeriode) => {
        if (newPeriode) {
            fetchReport();
        }
    },
    { immediate: true },
);
</script>

<template>
    <div
        v-if="periode"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click="handleBackdropClick"
    >
        <div
            class="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
            <!-- Header -->
            <div
                class="flex items-center justify-between p-4 border-b border-slate-200"
            >
                <div>
                    <h2 class="text-lg font-semibold text-slate-900">
                        Laporan Periode PKL
                    </h2>
                    <p class="text-sm text-slate-500">
                        {{ periode.nama_periode }}
                    </p>
                </div>
                <button
                    type="button"
                    class="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    @click="close"
                >
                    <Icon name="lucide:x" class="w-5 h-5" />
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4">
                <!-- Loading State -->
                <div
                    v-if="loading"
                    class="flex items-center justify-center py-8"
                >
                    <Icon
                        name="lucide:loader-2"
                        class="w-6 h-6 animate-spin text-slate-400"
                    />
                </div>

                <!-- Report Content -->
                <div v-else-if="reportData" class="space-y-6">
                    <!-- Periode Info -->
                    <div class="bg-slate-50 rounded-lg p-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-xs text-slate-500">
                                    Nama Periode
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ reportData.periode.nama_periode }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">Status</p>
                                <p
                                    class="text-sm font-medium text-slate-900 capitalize"
                                >
                                    {{ reportData.periode.status }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">
                                    Tanggal Mulai
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{
                                        formatDate(
                                            reportData.periode.tanggal_mulai,
                                        )
                                    }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500">
                                    Tanggal Selesai
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{
                                        formatDate(
                                            reportData.periode.tanggal_selesai,
                                        )
                                    }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Statistik -->
                    <div>
                        <h3 class="text-sm font-semibold text-slate-900 mb-3">
                            Statistik Penempatan
                        </h3>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div class="bg-blue-50 rounded-lg p-3">
                                <p class="text-xs text-blue-600">
                                    Total Siswa Kelas 12
                                </p>
                                <p class="text-xl font-bold text-blue-700">
                                    {{
                                        reportData.statistik
                                            .total_siswa_kelas_12
                                    }}
                                </p>
                            </div>
                            <div class="bg-green-50 rounded-lg p-3">
                                <p class="text-xs text-green-600">
                                    Siswa Ditempatkan
                                </p>
                                <p class="text-xl font-bold text-green-700">
                                    {{ reportData.statistik.siswa_ditempatkan }}
                                </p>
                            </div>
                            <div class="bg-orange-50 rounded-lg p-3">
                                <p class="text-xs text-orange-600">
                                    Belum Ditempatkan
                                </p>
                                <p class="text-xl font-bold text-orange-700">
                                    {{
                                        reportData.statistik
                                            .siswa_belum_ditempatkan
                                    }}
                                </p>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-3">
                                <p class="text-xs text-purple-600">
                                    Perusahaan
                                </p>
                                <p class="text-xl font-bold text-purple-700">
                                    {{ reportData.statistik.total_perusahaan }}
                                </p>
                            </div>
                            <div class="bg-sky-50 rounded-lg p-3">
                                <p class="text-xs text-sky-600">
                                    Guru Pembimbing
                                </p>
                                <p class="text-xl font-bold text-sky-700">
                                    {{
                                        reportData.statistik
                                            .total_guru_pembimbing
                                    }}
                                </p>
                            </div>
                            <div class="bg-teal-50 rounded-lg p-3">
                                <p class="text-xs text-teal-600">Progress</p>
                                <p class="text-xl font-bold text-teal-700">
                                    {{
                                        reportData.statistik
                                            .progress_percentage
                                    }}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Perusahaan -->
                    <div>
                        <h3 class="text-sm font-semibold text-slate-900 mb-3">
                            Perusahaan Mitra ({{
                                reportData.perusahaan.length
                            }})
                        </h3>
                        <div
                            class="bg-white border border-slate-200 rounded-lg overflow-hidden"
                        >
                            <table class="min-w-full divide-y divide-slate-200">
                                <thead class="bg-slate-50">
                                    <tr>
                                        <th
                                            class="px-4 py-2 text-left text-xs font-medium text-slate-700"
                                        >
                                            Perusahaan
                                        </th>
                                        <th
                                            class="px-4 py-2 text-right text-xs font-medium text-slate-700"
                                        >
                                            Jumlah Siswa
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200">
                                    <tr
                                        v-for="p in reportData.perusahaan"
                                        :key="p.id_perusahaan"
                                    >
                                        <td
                                            class="px-4 py-2 text-sm text-slate-900"
                                        >
                                            {{ p.nama_perusahaan }}
                                        </td>
                                        <td
                                            class="px-4 py-2 text-sm text-right font-medium text-slate-900"
                                        >
                                            {{ p.jumlah_siswa }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Jurusan -->
                    <div>
                        <h3 class="text-sm font-semibold text-slate-900 mb-3">
                            Rekap per Jurusan ({{ reportData.jurusan.length }})
                        </h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div
                                v-for="j in reportData.jurusan"
                                :key="j.id_jurusan"
                                class="bg-white border border-slate-200 rounded-lg p-3"
                            >
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900"
                                    >
                                        {{ j.nama_jurusan }}
                                    </p>
                                    <span class="text-xs text-slate-500">
                                        {{ j.siswa_ditempatkan }}/{{
                                            j.total_siswa
                                        }}
                                    </span>
                                </div>
                                <div
                                    class="w-full bg-slate-200 rounded-full h-2"
                                >
                                    <div
                                        class="bg-sky-500 h-2 rounded-full transition-all duration-300"
                                        :style="{
                                            width: `${getJurusanPercentage(j.siswa_ditempatkan, j.total_siswa)}%`,
                                        }"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div
                    v-else
                    class="flex flex-col items-center justify-center py-12 text-slate-500"
                >
                    <Icon
                        name="lucide:file-text"
                        class="w-12 h-12 mb-3 text-slate-300"
                    />
                    <p>Tidak ada data laporan</p>
                </div>
            </div>

            <!-- Footer -->
            <div
                class="flex items-center justify-end gap-2 p-4 border-t border-slate-200"
            >
                <UButton
                    icon="lucide:download"
                    variant="outline"
                    color="neutral"
                    :disabled="loading || !hasReport"
                    @click="downloadReport"
                >
                    Download Laporan
                </UButton>
                <UButton variant="outline" color="neutral" @click="close">
                    Tutup
                </UButton>
            </div>
        </div>
    </div>
</template>
