<template>
    <div class="space-y-6">
        <div class="flex items-center gap-3">
            <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                to="/mentor/siswa"
            >
                <Icon name="lucide:arrow-left" class="w-4 h-4" />
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Detail Siswa
                </h1>
                <p class="text-sm text-slate-500">
                    Informasi lengkap siswa PKL
                </p>
            </div>
        </div>

        <!-- Error State -->
        <div
            v-if="error"
            class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
            <Icon
                name="lucide:alert-circle"
                class="w-12 h-12 text-red-400 mx-auto mb-3"
            />
            <p class="text-red-600 mb-3">{{ error }}</p>
            <UButton color="primary" variant="soft" @click="fetchData"
                >Coba Lagi</UButton
            >
        </div>

        <div v-else-if="loading" class="space-y-4">
            <USkeleton class="h-32 rounded-xl" />
            <USkeleton class="h-48 rounded-xl" />
        </div>

        <template v-else-if="penempatan">
            <!-- Profile Card -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <div class="flex items-start gap-4">
                    <div
                        class="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold"
                    >
                        {{ getInitials(siswaName) }}
                    </div>
                    <div class="flex-1">
                        <h2 class="text-lg font-semibold text-slate-900">
                            {{ siswaName }}
                        </h2>
                        <p class="text-sm text-slate-500">
                            {{ penempatan.siswa?.nis || "-" }} •
                            {{ penempatan.siswa?.kelas?.nama_kelas || "-" }}
                        </p>
                        <div class="flex gap-2 mt-2">
                            <UBadge
                                :color="
                                    penempatan.status_penempatan === 'aktif'
                                        ? 'success'
                                        : 'neutral'
                                "
                                variant="subtle"
                            >
                                {{
                                    penempatan.status_penempatan === "aktif"
                                        ? "Aktif"
                                        : penempatan.status_penempatan
                                }}
                            </UBadge>
                            <UBadge
                                v-if="
                                    penempatan.siswa?.kelas?.jurusan
                                        ?.nama_jurusan
                                "
                                color="primary"
                                variant="subtle"
                            >
                                {{
                                    penempatan.siswa.kelas.jurusan.nama_jurusan
                                }}
                            </UBadge>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Periode PKL -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <h3 class="font-semibold text-slate-900 mb-3">Periode PKL</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-slate-500 mb-1">Tanggal Mulai</p>
                        <p class="text-sm font-medium text-slate-900">
                            {{ formatDate(penempatan.tanggal_mulai) }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-slate-500 mb-1">
                            Tanggal Selesai
                        </p>
                        <p class="text-sm font-medium text-slate-900">
                            {{ formatDate(penempatan.tanggal_selesai) }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4">
                <div
                    class="bg-white rounded-xl border border-slate-200 p-4 text-center"
                >
                    <p
                        class="text-2xl font-bold"
                        :class="
                            stats.kehadiran >= 80
                                ? 'text-success-600'
                                : 'text-error-600'
                        "
                    >
                        {{ stats.kehadiran }}%
                    </p>
                    <p class="text-sm text-slate-500">Kehadiran</p>
                </div>
                <div
                    class="bg-white rounded-xl border border-slate-200 p-4 text-center"
                >
                    <p class="text-2xl font-bold text-primary-600">
                        {{ stats.totalLogbook }}
                    </p>
                    <p class="text-sm text-slate-500">Logbook</p>
                </div>
                <div
                    class="bg-white rounded-xl border border-slate-200 p-4 text-center"
                >
                    <p class="text-2xl font-bold text-slate-900">
                        {{ stats.nilai || "-" }}
                    </p>
                    <p class="text-sm text-slate-500">Nilai</p>
                </div>
            </div>

            <!-- Recent Logbook -->
            <div class="bg-white rounded-xl border border-slate-200">
                <div class="px-5 py-4 border-b border-slate-100">
                    <h3 class="font-semibold text-slate-900">
                        Logbook Terbaru
                    </h3>
                </div>
                <div
                    v-if="logbookData.length > 0"
                    class="divide-y divide-slate-100"
                >
                    <div
                        v-for="log in logbookData"
                        :key="log.id_logbook"
                        class="px-5 py-3 flex items-center justify-between"
                    >
                        <div>
                            <p class="text-sm font-medium text-slate-900">
                                {{ log.judul_kegiatan }}
                            </p>
                            <p class="text-xs text-slate-500">
                                {{ formatDate(log.tanggal) }}
                            </p>
                        </div>
                        <UBadge
                            :color="getStatusColor(log.status_persetujuan)"
                            variant="subtle"
                            size="xs"
                        >
                            {{ formatStatus(log.status_persetujuan) }}
                        </UBadge>
                    </div>
                </div>
                <div v-else class="px-5 py-8 text-center text-slate-500">
                    <Icon
                        name="lucide:book-open"
                        class="w-8 h-8 text-slate-300 mx-auto mb-2"
                    />
                    <p>Belum ada logbook</p>
                </div>
            </div>

            <!-- Recent Absensi -->
            <div class="bg-white rounded-xl border border-slate-200">
                <div class="px-5 py-4 border-b border-slate-100">
                    <h3 class="font-semibold text-slate-900">
                        Absensi Terbaru
                    </h3>
                </div>
                <div
                    v-if="absensiData.length > 0"
                    class="divide-y divide-slate-100"
                >
                    <div
                        v-for="absen in absensiData.slice(0, 7)"
                        :key="absen.id_absensi"
                        class="px-5 py-3 flex items-center justify-between"
                    >
                        <div>
                            <p class="text-sm font-medium text-slate-900">
                                {{ formatDate(absen.tanggal) }}
                            </p>
                            <p class="text-xs text-slate-500">
                                {{ formatTime(absen.waktu_masuk) }} -
                                {{ formatTime(absen.waktu_keluar) }}
                            </p>
                        </div>
                        <UBadge
                            :color="getAbsensiColor(absen.status_absensi)"
                            variant="subtle"
                            size="xs"
                        >
                            {{ formatAbsensiStatus(absen.status_absensi) }}
                        </UBadge>
                    </div>
                </div>
                <div v-else class="px-5 py-8 text-center text-slate-500">
                    <Icon
                        name="lucide:calendar"
                        class="w-8 h-8 text-slate-300 mx-auto mb-2"
                    />
                    <p>Belum ada data absensi</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
                <UButton
                    color="primary"
                    class="flex-1"
                    :to="`/mentor/penilaian?siswa=${penempatan.id_penempatan}`"
                >
                    <Icon name="lucide:star" class="w-4 h-4 mr-2" />
                    Beri Penilaian
                </UButton>
                <UButton color="neutral" variant="outline">
                    <Icon name="lucide:phone" class="w-4 h-4" />
                </UButton>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    usePenempatanApi,
    useLogbookApi,
    useAbsensiApi,
    type Penempatan,
    type Logbook,
    type Absensi,
} from "~/composables/api/use-internship";

definePageMeta({ layout: "mentor" });

const route = useRoute();
const penempatanApi = usePenempatanApi();
const logbookApi = useLogbookApi();
const absensiApi = useAbsensiApi();

const loading = ref(true);
const error = ref<string | null>(null);

const penempatan = ref<Penempatan | null>(null);
const logbookData = ref<Logbook[]>([]);
const absensiData = ref<Absensi[]>([]);

// Computed
const siswaName = computed(
    () =>
        penempatan.value?.siswa?.nama_siswa ||
        `Siswa #${penempatan.value?.siswa_id}`,
);

const stats = computed(() => {
    const totalAbsensi = absensiData.value.length;
    const hadirCount = absensiData.value.filter(
        (a) => a.status === "hadir",
    ).length;
    const kehadiran =
        totalAbsensi > 0 ? Math.round((hadirCount / totalAbsensi) * 100) : 0;

    return {
        kehadiran,
        totalLogbook: logbookData.value.length,
        nilai: null, // Will be fetched from penilaian if needed
    };
});

// Helpers
function getInitials(name: string) {
    return name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(timeStr: string) {
    if (!timeStr) return "-";
    // Handle both ISO datetime and time-only strings
    if (timeStr.includes("T")) {
        return new Date(timeStr).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    return timeStr.substring(0, 5);
}

function formatStatus(status: string) {
    const map: Record<string, string> = {
        menunggu: "Pending",
        disetujui: "Disetujui",
        ditolak: "Ditolak",
    };
    return map[status] || status;
}

function getStatusColor(
    status: string,
): "success" | "warning" | "error" | "neutral" {
    const map: Record<string, "success" | "warning" | "error" | "neutral"> = {
        disetujui: "success",
        menunggu: "warning",
        ditolak: "error",
    };
    return map[status] || "neutral";
}

function formatAbsensiStatus(status: string) {
    const map: Record<string, string> = {
        hadir: "Hadir",
        izin: "Izin",
        sakit: "Sakit",
        alpa: "Alpa",
    };
    return map[status] || status;
}

function getAbsensiColor(
    status: string,
): "success" | "warning" | "error" | "neutral" {
    const map: Record<string, "success" | "warning" | "error" | "neutral"> = {
        hadir: "success",
        izin: "warning",
        sakit: "warning",
        alpa: "error",
    };
    return map[status] || "neutral";
}

// Fetch data
async function fetchData() {
    loading.value = true;
    error.value = null;

    const id = route.params.id as string;

    try {
        // Fetch penempatan detail
        const penempatanResponse = await penempatanApi.getById(id);

        if (penempatanResponse.success) {
            penempatan.value = penempatanResponse.data;

            // Fetch logbook and absensi for this penempatan
            const [logbookResponse, absensiResponse] = await Promise.all([
                logbookApi.getAll({ id_penempatan: id, limit: 10 }),
                absensiApi.getAll({ id_penempatan: id, limit: 30 }),
            ]);

            if (logbookResponse.success) {
                logbookData.value = logbookResponse.data;
            }

            if (absensiResponse.success) {
                absensiData.value = absensiResponse.data;
            }
        } else {
            error.value =
                penempatanResponse.message || "Gagal memuat data siswa";
        }
    } catch (e: any) {
        console.error("Error fetching student detail:", e);
        error.value = e.response?.data?.message || "Gagal memuat data siswa";
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchData();
});

useHead({
    title: computed(() =>
        penempatan.value
            ? `${siswaName.value} | Mentor`
            : "Detail Siswa | Mentor",
    ),
});
</script>
