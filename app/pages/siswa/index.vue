<template>
    <div class="space-y-6">
        <!-- Welcome & Attendance Status -->
        <div class="bg-sky-500 rounded-2xl p-5 lg:p-6 text-white">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <p class="text-sky-100 text-sm">{{ currentDate }}</p>
                    <h1
                        v-if="!loading"
                        class="text-xl lg:text-2xl font-bold mt-1"
                    >
                        Halo, {{ siswa.nama }}! 👋
                    </h1>
                    <USkeleton
                        v-else
                        class="h-7 w-48 mt-1"
                        :ui="{ background: 'bg-white/20' }"
                    />
                    <p class="text-sky-100 text-sm mt-1">
                        {{ siswa.kelas }} • {{ siswa.industri }}
                    </p>
                </div>
                <div
                    class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold shrink-0"
                >
                    {{ siswa.inisial }}
                </div>
            </div>

            <!-- Attendance Card -->
            <div class="mt-4 p-4 rounded-xl bg-white/10 backdrop-blur">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sky-100 text-sm">
                            Status Absensi Hari Ini
                        </p>
                        <p
                            v-if="attendance.checkedIn"
                            class="font-semibold mt-1"
                        >
                            <Icon
                                name="lucide:check-circle"
                                class="w-4 h-4 inline mr-1"
                            />
                            Sudah Absen • {{ attendance.checkInTime }}
                        </p>
                        <p v-else class="font-semibold mt-1 text-amber-300">
                            <Icon
                                name="lucide:alert-circle"
                                class="w-4 h-4 inline mr-1"
                            />
                            Belum Absen Hari Ini
                        </p>
                    </div>
                    <UButton
                        v-if="!attendance.checkedIn"
                        color="neutral"
                        size="sm"
                        @click="navigateTo('/siswa/aktivitas-harian')"
                    >
                        <Icon name="lucide:map-pin" class="w-4 h-4 mr-1" />
                        Absen Sekarang
                    </UButton>
                    <UBadge v-else color="neutral" variant="subtle">
                        <Icon name="lucide:check" class="w-3 h-3 mr-1" />
                        Hadir
                    </UBadge>
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <template v-if="loading">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="bg-white rounded-xl p-4 border border-slate-200"
                >
                    <USkeleton class="h-4 w-16 mb-2" />
                    <USkeleton class="h-7 w-12" />
                </div>
            </template>
            <template v-else>
                <div class="bg-white rounded-xl p-4 border border-slate-200">
                    <div class="flex items-center gap-2 text-slate-500 mb-1">
                        <Icon name="lucide:book-open" class="w-4 h-4" />
                        <span class="text-xs">Total Logbook</span>
                    </div>
                    <p class="text-2xl font-bold text-slate-900">
                        {{ stats.totalLogbook }}
                    </p>
                </div>
                <div class="bg-white rounded-xl p-4 border border-slate-200">
                    <div class="flex items-center gap-2 text-slate-500 mb-1">
                        <Icon name="lucide:check-circle" class="w-4 h-4" />
                        <span class="text-xs">Disetujui</span>
                    </div>
                    <p class="text-2xl font-bold text-green-600">
                        {{ stats.approved }}
                    </p>
                </div>
                <div class="bg-white rounded-xl p-4 border border-slate-200">
                    <div class="flex items-center gap-2 text-slate-500 mb-1">
                        <Icon name="lucide:clock" class="w-4 h-4" />
                        <span class="text-xs">Pending</span>
                    </div>
                    <p class="text-2xl font-bold text-amber-600">
                        {{ stats.pending }}
                    </p>
                </div>
                <div class="bg-white rounded-xl p-4 border border-slate-200">
                    <div class="flex items-center gap-2 text-slate-500 mb-1">
                        <Icon name="lucide:calendar" class="w-4 h-4" />
                        <span class="text-xs">Hari PKL</span>
                    </div>
                    <p class="text-2xl font-bold text-sky-600">
                        {{ stats.days }}
                    </p>
                </div>
            </template>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Logbook Status Chart -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <h2 class="font-semibold text-slate-900 mb-4">
                    Status Logbook
                </h2>
                <div v-if="loading">
                    <USkeleton class="h-48 rounded-lg" />
                </div>
                <div
                    v-else-if="stats.totalLogbook === 0"
                    class="h-48 flex items-center justify-center text-slate-400 text-sm"
                >
                    Belum ada data logbook
                </div>
                <ClientOnly v-else>
                    <apexchart
                        type="donut"
                        height="200"
                        :options="logbookChartOptions"
                        :series="logbookChartSeries"
                    />
                </ClientOnly>
            </div>

            <!-- Kehadiran Mingguan Chart -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <h2 class="font-semibold text-slate-900 mb-4">
                    Kehadiran Mingguan
                </h2>
                <div v-if="loading">
                    <USkeleton class="h-48 rounded-lg" />
                </div>
                <ClientOnly v-else>
                    <apexchart
                        type="area"
                        height="200"
                        :options="attendanceChartOptions"
                        :series="attendanceChartSeries"
                    />
                </ClientOnly>
            </div>
        </div>

        <!-- Progress PKL -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
            <div class="flex items-center justify-between mb-3">
                <h2 class="font-semibold text-slate-900">Progress PKL</h2>
                <span class="text-sm font-medium text-sky-600"
                    >{{ progress }}%</span
                >
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    class="h-full bg-sky-500 rounded-full transition-all"
                    :style="{ width: `${progress}%` }"
                />
            </div>
            <p class="text-xs text-slate-500 mt-2">
                {{ stats.days }} dari {{ stats.totalDays }} hari PKL selesai
            </p>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl border border-slate-200">
            <div class="px-5 py-4 border-b border-slate-100">
                <h2 class="font-semibold text-slate-900">Menu Cepat</h2>
            </div>
            <div class="p-4 grid grid-cols-3 sm:grid-cols-6 gap-3">
                <NuxtLink
                    to="/siswa/aktivitas-harian"
                    class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-sky-50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center"
                    >
                        <Icon name="lucide:list-checks" class="w-6 h-6" />
                    </div>
                    <span class="text-xs font-medium text-slate-700 text-center"
                        >Flow Harian</span
                    >
                </NuxtLink>
                <NuxtLink
                    to="/siswa/aktivitas-harian"
                    class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"
                    >
                        <Icon name="lucide:map-pin" class="w-6 h-6" />
                    </div>
                    <span class="text-xs font-medium text-slate-700 text-center"
                        >Absen + Logbook</span
                    >
                </NuxtLink>
                <NuxtLink
                    to="/siswa/internship/status"
                    class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"
                    >
                        <Icon name="lucide:briefcase" class="w-6 h-6" />
                    </div>
                    <span class="text-xs font-medium text-slate-700 text-center"
                        >Status PKL</span
                    >
                </NuxtLink>
                <NuxtLink
                    to="/siswa/nilai"
                    class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center"
                    >
                        <Icon name="lucide:award" class="w-6 h-6" />
                    </div>
                    <span class="text-xs font-medium text-slate-700 text-center"
                        >Nilai PKL</span
                    >
                </NuxtLink>
            </div>
        </div>

        <!-- Recent Logbook -->
        <div class="bg-white rounded-xl border border-slate-200">
            <div
                class="px-5 py-4 border-b border-slate-100 flex items-center justify-between"
            >
                <h2 class="font-semibold text-slate-900">Logbook Terbaru</h2>
                <UButton
                    to="/siswa/aktivitas-harian"
                    variant="ghost"
                    color="primary"
                    size="xs"
                    trailing-icon="i-lucide-arrow-right"
                >
                    Lihat Semua
                </UButton>
            </div>

            <div v-if="loading" class="p-4 space-y-3">
                <div v-for="i in 3" :key="i" class="flex gap-3">
                    <USkeleton class="w-10 h-10 rounded-lg shrink-0" />
                    <div class="flex-1 space-y-2">
                        <USkeleton class="h-4 w-3/4" />
                        <USkeleton class="h-3 w-1/2" />
                    </div>
                </div>
            </div>

            <div v-else class="divide-y divide-slate-100">
                <div
                    v-for="log in paginatedLogbooks"
                    :key="log.id"
                    class="px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                    <div class="flex items-start gap-3">
                        <div
                            class="p-2 rounded-lg shrink-0"
                            :class="getLogStatusBg(log.status)"
                        >
                            <Icon name="lucide:file-text" class="w-4 h-4" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p
                                class="text-sm font-medium text-slate-900 truncate"
                            >
                                {{ log.kegiatan }}
                            </p>
                            <p class="text-xs text-slate-500">
                                {{ log.tanggal }}
                            </p>
                        </div>
                        <UBadge
                            :color="getLogStatusColor(log.status)"
                            variant="subtle"
                            size="xs"
                        >
                            {{ log.status }}
                        </UBadge>
                    </div>
                </div>

                <div v-if="!allLogbooks.length" class="py-8 text-center">
                    <Icon
                        name="lucide:book-open"
                        class="w-10 h-10 text-slate-300 mx-auto mb-2"
                    />
                    <p class="text-sm text-slate-500">Belum ada logbook</p>
                </div>
            </div>

            <!-- Pagination -->
            <div
                v-if="totalLogbookPages > 1"
                class="px-5 py-3 border-t border-slate-100 flex items-center justify-between"
            >
                <p class="text-xs text-slate-500">
                    Menampilkan {{ logbookStartIndex + 1 }}-{{
                        logbookEndIndex
                    }}
                    dari {{ allLogbooks.length }}
                </p>
                <UPagination
                    v-model:page="logbookPage"
                    :total="allLogbooks.length"
                    :items-per-page="logbookPerPage"
                    size="xs"
                />
            </div>
        </div>

        <!-- Info Guru Pembimbing & Industri -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <h3 class="font-semibold text-slate-900 mb-3">
                    Guru Pembimbing
                </h3>
                <template v-if="loading">
                    <div class="flex items-center gap-3">
                        <USkeleton class="w-12 h-12 rounded-xl" />
                        <div class="flex-1 space-y-2">
                            <USkeleton class="h-4 w-32" />
                            <USkeleton class="h-3 w-24" />
                        </div>
                    </div>
                </template>
                <template v-else-if="guruInfo.nama">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-semibold"
                        >
                            {{ guruInfo.inisial }}
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-slate-900">
                                {{ guruInfo.nama }}
                            </p>
                            <p class="text-sm text-slate-500">
                                Guru Pembimbing
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="guruInfo.no_hp || guruInfo.email"
                        class="mt-3 flex gap-2"
                    >
                        <UButton
                            v-if="guruInfo.no_hp"
                            size="xs"
                            variant="soft"
                            color="success"
                            class="flex-1"
                            :to="`https://wa.me/${guruInfo.no_hp.replace(/[^0-9]/g, '')}`"
                            target="_blank"
                        >
                            <Icon
                                name="lucide:message-circle"
                                class="w-4 h-4 mr-1"
                            />
                            WhatsApp
                        </UButton>
                        <UButton
                            v-if="guruInfo.email"
                            size="xs"
                            variant="soft"
                            color="primary"
                            class="flex-1"
                            :to="`mailto:${guruInfo.email}`"
                        >
                            <Icon name="lucide:mail" class="w-4 h-4 mr-1" />
                            Email
                        </UButton>
                    </div>
                </template>
                <p v-else class="text-sm text-slate-400">
                    Belum ada data guru pembimbing
                </p>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 p-5">
                <h3 class="font-semibold text-slate-900 mb-3">Info Industri</h3>
                <template v-if="loading">
                    <div class="flex items-center gap-3">
                        <USkeleton class="w-12 h-12 rounded-xl" />
                        <div class="flex-1 space-y-2">
                            <USkeleton class="h-4 w-40" />
                            <USkeleton class="h-3 w-32" />
                        </div>
                    </div>
                </template>
                <template v-else-if="industriInfo.nama">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"
                        >
                            <Icon name="lucide:building-2" class="w-6 h-6" />
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-slate-900">
                                {{ industriInfo.nama }}
                            </p>
                            <p class="text-sm text-slate-500">
                                {{ industriInfo.alamat || "-" }}
                            </p>
                            <p
                                v-if="industriInfo.mentor"
                                class="text-xs text-slate-400 mt-0.5"
                            >
                                Mentor: {{ industriInfo.mentor }}
                            </p>
                        </div>
                    </div>
                </template>
                <p v-else class="text-sm text-slate-400">
                    Belum ada data industri
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSiswaProfileApi } from "~/composables/api/use-siswa";
import { apiFetch } from "~/composables/api-fetch";

definePageMeta({ layout: "siswa" });

const toast = useToast();

const profileApi = useSiswaProfileApi();

// State
const loading = ref(true);

const siswa = reactive({
    nama: "",
    inisial: "",
    kelas: "",
    industri: "",
});

const attendance = reactive({
    checkedIn: false,
    checkInTime: "",
});

const stats = reactive({
    totalLogbook: 0,
    approved: 0,
    pending: 0,
    revisi: 0,
    days: 0,
    totalDays: 180,
});

const guruInfo = reactive({
    nama: "",
    inisial: "",
    no_hp: "",
    email: "",
});

const industriInfo = reactive({
    nama: "",
    alamat: "",
    mentor: "",
});

// Pagination for logbooks
const logbookPage = ref(1);
const logbookPerPage = 5;
const allLogbooks = ref<any[]>([]);

const currentDate = computed(() => {
    return new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
});

const progress = computed(() => {
    if (stats.totalDays <= 0) return 0;
    return Math.min(100, Math.round((stats.days / stats.totalDays) * 100));
});

// Pagination computed
const paginatedLogbooks = computed(() => {
    const start = (logbookPage.value - 1) * logbookPerPage;
    return allLogbooks.value.slice(start, start + logbookPerPage);
});

const totalLogbookPages = computed(() =>
    Math.ceil(allLogbooks.value.length / logbookPerPage),
);
const logbookStartIndex = computed(
    () => (logbookPage.value - 1) * logbookPerPage,
);
const logbookEndIndex = computed(() =>
    Math.min(logbookPage.value * logbookPerPage, allLogbooks.value.length),
);

// ========================
// Charts
// ========================
const logbookChartOptions = {
    chart: { type: "donut" },
    labels: ["Disetujui", "Pending", "Ditolak"],
    colors: ["#22c55e", "#f59e0b", "#ef4444"],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    plotOptions: {
        pie: {
            donut: {
                size: "70%",
                labels: {
                    show: true,
                    total: { show: true, label: "Total", fontSize: "14px" },
                },
            },
        },
    },
};

const logbookChartSeries = computed(() => [
    stats.approved,
    stats.pending,
    stats.revisi,
]);

// Weekly attendance chart data (computed from absensi)
const weeklyAttendanceData = ref<{ labels: string[]; data: number[] }>({
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum"],
    data: [0, 0, 0, 0, 0],
});

const attendanceChartOptions = computed(() => ({
    chart: {
        type: "area",
        toolbar: { show: false },
        sparkline: { enabled: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 },
    },
    colors: ["#0ea5e9"],
    xaxis: {
        categories: weeklyAttendanceData.value.labels,
        labels: { style: { fontSize: "11px" } },
    },
    yaxis: { show: false },
    grid: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
        y: {
            formatter: (val: number) =>
                val === 1 ? "Hadir" : val === 0 ? "Tidak hadir" : `${val}`,
        },
    },
}));

const attendanceChartSeries = computed(() => [
    {
        name: "Kehadiran",
        data: weeklyAttendanceData.value.data,
    },
]);

// ========================
// Helpers
// ========================
const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        disetujui: "Disetujui",
        menunggu: "Pending",
        ditolak: "Ditolak",
    };
    return statusMap[status] || status;
};

const getLogStatusColor = (status: string): any => {
    const statusMap: Record<string, string> = {
        Disetujui: "success",
        disetujui: "success",
        Pending: "warning",
        menunggu: "warning",
        Ditolak: "error",
        ditolak: "error",
    };
    return statusMap[status] || "neutral";
};

const getLogStatusBg = (status: string) => {
    const bgs: Record<string, string> = {
        Disetujui: "bg-green-100 text-green-600",
        disetujui: "bg-green-100 text-green-600",
        Pending: "bg-amber-100 text-amber-600",
        menunggu: "bg-amber-100 text-amber-600",
        Ditolak: "bg-red-100 text-red-600",
        ditolak: "bg-red-100 text-red-600",
    };
    return bgs[status] || "bg-slate-100 text-slate-600";
};

function getInisial(nama: string) {
    return nama
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

/**
 * Compute weekly attendance from absensi array.
 * Takes the last 5 working days (Mon-Fri) from absensi data
 * and shows 1 = hadir / 0 = tidak hadir per day.
 */
function computeWeeklyAttendance(
    absensiList: Array<{
        tanggal: string;
        status_absensi: string;
        waktu_masuk?: string;
    }>,
) {
    const dayNames: string[] = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    // Get current week's Mon-Fri
    const today = new Date();
    const currentDay = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((currentDay === 0 ? 7 : currentDay) - 1));
    monday.setHours(0, 0, 0, 0);

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        labels.push(dayNames[d.getDay()]!);

        // Check if there's "hadir" attendance for this date
        const dateStr = d.toISOString().split("T")[0];
        const found = absensiList.find((a) => {
            const aDate = new Date(a.tanggal).toISOString().split("T")[0];
            return aDate === dateStr && a.status_absensi === "hadir";
        });
        data.push(found ? 1 : 0);
    }

    weeklyAttendanceData.value = { labels, data };
}

// ========================
// Load Dashboard Data
// ========================
async function loadDashboardData() {
    loading.value = true;

    try {
        // 1) Fetch profile for name/kelas
        const profileRes = await profileApi.getMyProfile();
        if (profileRes.success && profileRes.data) {
            const p = profileRes.data;
            siswa.nama = p.nama_siswa || "Siswa";
            siswa.inisial = p.nama_siswa ? getInisial(p.nama_siswa) : "S";
            siswa.kelas = p.kelas?.nama_kelas || "-";
        }

        // 2) Fetch penempatan/me — returns ALL nested data
        const penempatanRes = await apiFetch<any>(
            "PlacementService",
            "/penempatan/me",
            { method: "GET" },
            true,
        );

        const pen = penempatanRes?.data?.data;
        if (!pen) {
            // No active penempatan
            siswa.industri = "Belum ada penempatan";
            return;
        }

        // --- Siswa & Industri info ---
        siswa.industri = pen.perusahaan?.nama_perusahaan || "-";

        // --- Guru info ---
        if (pen.guru) {
            guruInfo.nama = pen.guru.nama_guru || "";
            guruInfo.inisial = pen.guru.nama_guru
                ? getInisial(pen.guru.nama_guru)
                : "";
            guruInfo.no_hp = pen.guru.no_hp || "";
            guruInfo.email = pen.guru.email || "";
        }

        // --- Industri info ---
        if (pen.perusahaan) {
            industriInfo.nama = pen.perusahaan.nama_perusahaan || "";
            industriInfo.alamat = pen.perusahaan.alamat || "";
            const mentors = pen.perusahaan.mentor;
            if (Array.isArray(mentors) && mentors.length > 0) {
                industriInfo.mentor = mentors[0].nama_mentor || "";
            }
        }

        // --- Days PKL ---
        if (pen.tanggal_mulai && pen.tanggal_selesai) {
            const start = new Date(pen.tanggal_mulai);
            const end = new Date(pen.tanggal_selesai);
            const today = new Date();
            const totalDays = Math.ceil(
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
            );
            const elapsedDays = Math.max(
                0,
                Math.ceil(
                    (today.getTime() - start.getTime()) /
                        (1000 * 60 * 60 * 24),
                ),
            );
            stats.totalDays = Math.max(totalDays, 1);
            stats.days = Math.min(elapsedDays, totalDays);
        }

        // --- Logbook stats ---
        const logbooks: any[] = pen.logbook || [];
        stats.totalLogbook = logbooks.length;
        stats.approved = logbooks.filter(
            (l: any) => l.status_persetujuan === "disetujui",
        ).length;
        stats.pending = logbooks.filter(
            (l: any) => l.status_persetujuan === "menunggu",
        ).length;
        stats.revisi = logbooks.filter(
            (l: any) => l.status_persetujuan === "ditolak",
        ).length;

        // --- Recent logbooks (already sorted desc) ---
        allLogbooks.value = logbooks.slice(0, 20).map((l: any) => ({
            id: l.id_logbook,
            kegiatan: l.judul_kegiatan,
            tanggal: new Date(l.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            status: formatStatus(l.status_persetujuan),
        }));

        // --- Attendance: today check ---
        const absensiList: any[] = pen.absensi || [];
        const todayStr = new Date().toISOString().split("T")[0];
        const todayAbsensi = absensiList.find((a: any) => {
            const aDate = new Date(a.tanggal).toISOString().split("T")[0];
            return aDate === todayStr;
        });

        if (todayAbsensi && todayAbsensi.status_absensi === "hadir") {
            attendance.checkedIn = true;
            if (todayAbsensi.waktu_masuk) {
                // waktu_masuk is a Time field — format it
                const wm = todayAbsensi.waktu_masuk;
                if (typeof wm === "string" && wm.includes("T")) {
                    const dt = new Date(wm);
                    attendance.checkInTime = dt.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                } else if (typeof wm === "string") {
                    attendance.checkInTime = wm.slice(0, 5);
                }
            }
        }

        // --- Weekly attendance chart ---
        computeWeeklyAttendance(absensiList);
    } catch (err: any) {
        console.error("Error loading dashboard:", err);
        toast.add({
            title: "Error",
            description: "Gagal memuat data dashboard",
            color: "error",
        });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadDashboardData();
});

useHead({ title: "Dashboard | Siswa PKL" });
</script>
