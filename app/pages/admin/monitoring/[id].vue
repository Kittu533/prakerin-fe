<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
    useMonitoringApi,
    type DetailMonitoringSiswa,
    type MonitoringSiswa,
    type MonitoringStats,
    type RiwayatAbsensiBulan,
} from "~/composables/api/use-internship";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const {
    getDetailSiswa,
    getRiwayatAbsensiBulan,
    getStats,
    create: createMonitoring,
} = useMonitoringApi();

const loading = ref(true);
const detailLoading = ref(false);
const data = ref<DetailMonitoringSiswa | null>(null);
const riwayatAbsensi = ref<RiwayatAbsensiBulan[]>([]);
const activeTab = ref("overview");

// Modal tambah monitoring
const modalOpen = ref(false);
const processing = ref(false);
const formMonitoring = ref({
    tanggal_monitoring: "",
    hasil_monitoring: "",
    foto_monitoring: "",
    kendala: "",
    solusi: "",
});

// Stats card data
const statsCards = computed(() => {
    if (!data.value) return [];
    const s = data.value.summary;
    return [
        {
            label: "Kehadiran",
            value: `${s.kehadiran_percent}%`,
            total: `${s.total_absensi} hari`,
            color:
                s.kehadiran_percent >= 85
                    ? "green"
                    : s.kehadiran_percent >= 70
                      ? "amber"
                      : "red",
            icon: "lucide:user-check",
        },
        {
            label: "Logbook",
            value: `${s.logbook_percent}%`,
            total: `${s.total_logbook} entri`,
            color:
                s.logbook_percent >= 75
                    ? "green"
                    : s.logbook_percent >= 50
                      ? "amber"
                      : "red",
            icon: "lucide:book-open",
        },
        {
            label: "Kunjungan",
            value: s.total_kunjungan.toString(),
            total: "kali",
            color: "blue",
            icon: "lucide:footprints",
        },
        {
            label: "Nilai",
            value: data.value.penilaian?.nilai_akhir || "-",
            total: "nilai akhir",
            color: "purple",
            icon: "lucide:award",
        },
    ];
});

// Status monitoring
const statusMonitoring = computed(() => {
    if (!data.value)
        return { label: "Unknown", class: "bg-gray-50 text-gray-700" };
    const kehadiran = data.value.summary.kehadiran_percent;
    const logbook = data.value.summary.logbook_percent;

    if (kehadiran < 70 || logbook < 50) {
        return { label: "Kritis", class: "bg-red-50 text-red-700" };
    } else if (kehadiran < 85 || logbook < 75) {
        return {
            label: "Perlu Perhatian",
            class: "bg-amber-50 text-amber-700",
        };
    }
    return { label: "Baik", class: "bg-green-50 text-green-700" };
});

// Fetch detail data
async function fetchDetail() {
    const id = route.params.id as string;
    if (!id) {
        toast.add({ title: "ID tidak valid", color: "error" });
        router.push("/admin/monitoring");
        return;
    }

    loading.value = true;
    try {
        const response = await getDetailSiswa(id);
        if (response.success) {
            data.value = response.data;
        } else {
            toast.add({
                title: response.message || "Gagal memuat data",
                color: "error",
            });
        }
    } catch (error: any) {
        console.error("Failed to fetch detail:", error);
        toast.add({ title: "Gagal memuat data", color: "error" });
    } finally {
        loading.value = false;
    }
}

// Fetch riwayat absensi per bulan
async function fetchRiwayatAbsensi() {
    const id = route.params.id as string;
    if (!id) return;

    detailLoading.value = true;
    try {
        const response = await getRiwayatAbsensiBulan(id);
        if (response.success) {
            riwayatAbsensi.value = response.data;
        }
    } catch (error) {
        console.error("Failed to fetch riwayat absensi:", error);
    } finally {
        detailLoading.value = false;
    }
}

// Open modal tambah monitoring
function openAddMonitoring() {
    formMonitoring.value = {
        tanggal_monitoring: new Date().toISOString().split("T")[0],
        hasil_monitoring: "",
        foto_monitoring: "",
        kendala: "",
        solusi: "",
    };
    modalOpen.value = true;
}

// Submit monitoring
async function submitMonitoring() {
    const id = route.params.id as string;
    if (!id) return;

    processing.value = true;
    try {
        const response = await createMonitoring({
            id_penempatan: id,
            tanggal_monitoring: formMonitoring.value.tanggal_monitoring,
            hasil_monitoring:
                formMonitoring.value.hasil_monitoring || undefined,
            foto_monitoring: formMonitoring.value.foto_monitoring || undefined,
            kendala: formMonitoring.value.kendala || undefined,
            solusi: formMonitoring.value.solusi || undefined,
        });

        if (response.success) {
            toast.add({
                title: "Monitoring berhasil ditambahkan",
                color: "success",
            });
            modalOpen.value = false;
            await fetchDetail();
        } else {
            toast.add({
                title: response.message || "Gagal menambahkan monitoring",
                color: "error",
            });
        }
    } catch (error: any) {
        console.error("Failed to create monitoring:", error);
        toast.add({ title: "Gagal menambahkan monitoring", color: "error" });
    } finally {
        processing.value = false;
    }
}

// Format tanggal
function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// Get status absensi class
function getAbsensiStatusClass(status: string) {
    const classes: Record<string, string> = {
        hadir: "bg-green-50 text-green-700",
        sakit: "bg-amber-50 text-amber-700",
        izin: "bg-blue-50 text-blue-700",
        alpa: "bg-red-50 text-red-700",
        alpha: "bg-red-50 text-red-700",
    };
    return classes[status] || "bg-gray-50 text-gray-700";
}

// Watch tab change
watch(activeTab, (newTab) => {
    if (newTab === "absensi" && riwayatAbsensi.value.length === 0) {
        fetchRiwayatAbsensi();
    }
});

onMounted(() => {
    fetchDetail();
});

useHead({ title: "Detail Monitoring | Admin" });
</script>

<template>
    <div class="space-y-6">
        <!-- Back Button -->
        <UButton
            icon="lucide:arrow-left"
            variant="ghost"
            color="neutral"
            @click="router.push('/admin/monitoring')"
        >
            Kembali
        </UButton>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-6">
            <USkeleton class="h-48 rounded-xl" />
            <div class="grid grid-cols-4 gap-4">
                <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-xl" />
            </div>
            <USkeleton class="h-64 rounded-xl" />
        </div>

        <!-- Content -->
        <template v-else-if="data">
            <!-- Header Card -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
                <div class="flex flex-col md:flex-row gap-6">
                    <!-- Avatar Siswa -->
                    <div class="flex-shrink-0">
                        <div
                            class="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-bold text-2xl shadow-md"
                        >
                            {{
                                data.penempatan.siswa.nama_siswa
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                            }}
                        </div>
                    </div>

                    <!-- Info Siswa -->
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
                            <div>
                                <h1 class="text-2xl font-bold text-slate-900">
                                    {{ data.penempatan.siswa.nama_siswa }}
                                </h1>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-sm text-slate-600">
                                        {{
                                            data.penempatan.siswa.kelas
                                                ?.nama_kelas
                                        }}
                                    </span>
                                    <span class="text-slate-400">•</span>
                                    <span class="text-sm text-slate-600">
                                        {{
                                            data.penempatan.siswa.kelas?.jurusan
                                                ?.nama_jurusan
                                        }}
                                    </span>
                                </div>
                            </div>
                            <UBadge
                                :color="
                                    statusMonitoring.class.split('-')[1] ===
                                    'green'
                                        ? 'success'
                                        : statusMonitoring.class.split(
                                                '-',
                                            )[1] === 'amber'
                                          ? 'warning'
                                          : 'error'
                                "
                                variant="subtle"
                            >
                                {{ statusMonitoring.label }}
                            </UBadge>
                        </div>

                        <!-- Perusahaan -->
                        <div class="mt-4 flex items-center gap-2">
                            <Icon
                                name="lucide:building-2"
                                class="w-4 h-4 text-slate-400"
                            />
                            <span class="text-sm text-slate-700">
                                {{ data.penempatan.perusahaan.nama_perusahaan }}
                            </span>
                            <span class="text-slate-400">•</span>
                            <span class="text-xs text-slate-500">
                                {{ data.penempatan.perusahaan.bidang_usaha }}
                            </span>
                        </div>

                        <!-- Periode -->
                        <div class="mt-2 flex items-center gap-2">
                            <Icon
                                name="lucide:calendar"
                                class="w-4 h-4 text-slate-400"
                            />
                            <span class="text-sm text-slate-600">
                                {{ formatDate(data.penempatan.tanggal_mulai) }}
                                -
                                {{
                                    formatDate(data.penempatan.tanggal_selesai)
                                }}
                            </span>
                        </div>

                        <!-- Guru Pembimbing -->
                        <div class="mt-2 flex items-center gap-2">
                            <Icon
                                name="lucide:graduation-cap"
                                class="w-4 h-4 text-slate-400"
                            />
                            <span class="text-sm text-slate-600">
                                {{ data.penempatan.guru.nama_guru }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    v-for="stat in statsCards"
                    :key="stat.label"
                    class="bg-white rounded-xl border border-slate-200 p-4"
                    :class="{
                        'border-green-200 bg-green-50/30':
                            stat.color === 'green',
                        'border-amber-200 bg-amber-50/30':
                            stat.color === 'amber',
                        'border-red-200 bg-red-50/30': stat.color === 'red',
                    }"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-lg flex items-center justify-center"
                            :class="{
                                'bg-green-100': stat.color === 'green',
                                'bg-amber-100': stat.color === 'amber',
                                'bg-red-100': stat.color === 'red',
                                'bg-blue-100': stat.color === 'blue',
                                'bg-purple-100': stat.color === 'purple',
                            }"
                        >
                            <Icon
                                :name="stat.icon"
                                class="w-5 h-5"
                                :class="{
                                    'text-green-600': stat.color === 'green',
                                    'text-amber-600': stat.color === 'amber',
                                    'text-red-600': stat.color === 'red',
                                    'text-blue-600': stat.color === 'blue',
                                    'text-purple-600': stat.color === 'purple',
                                }"
                            />
                        </div>
                        <div>
                            <p class="text-2xl font-bold text-slate-900">
                                {{ stat.value }}
                            </p>
                            <p class="text-xs text-slate-500">
                                {{ stat.label }} ({{ stat.total }})
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-end">
                <UButton icon="lucide:plus" @click="openAddMonitoring">
                    Tambah Kunjungan
                </UButton>
            </div>

            <!-- Tabs Content -->
            <div class="bg-white rounded-xl border border-slate-200">
                <!-- Tabs -->
                <div class="border-b border-slate-200">
                    <div class="flex gap-1 px-4">
                        <button
                            v-for="tab in [
                                {
                                    key: 'overview',
                                    label: 'Ringkasan',
                                    icon: 'lucide:layout-dashboard',
                                },
                                {
                                    key: 'absensi',
                                    label: 'Absensi',
                                    icon: 'lucide:calendar-check',
                                },
                                {
                                    key: 'logbook',
                                    label: 'Logbook',
                                    icon: 'lucide:book-open',
                                },
                                {
                                    key: 'kunjungan',
                                    label: 'Kunjungan',
                                    icon: 'lucide:footprints',
                                },
                            ]"
                            :key="tab.key"
                            @click="activeTab = tab.key"
                            class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                            :class="
                                activeTab === tab.key
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            "
                        >
                            <Icon :name="tab.icon" class="w-4 h-4" />
                            {{ tab.label }}
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <!-- Overview Tab -->
                    <div v-if="activeTab === 'overview'" class="space-y-6">
                        <!-- Progress Bars -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Absensi Progress -->
                            <div class="p-4 bg-slate-50 rounded-xl">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <span
                                        class="text-sm font-medium text-slate-700"
                                        >Absensi</span
                                    >
                                    <span
                                        class="text-sm font-bold"
                                        :class="{
                                            'text-green-600':
                                                data.summary
                                                    .kehadiran_percent >= 85,
                                            'text-amber-600':
                                                data.summary
                                                    .kehadiran_percent >= 70 &&
                                                data.summary.kehadiran_percent <
                                                    85,
                                            'text-red-600':
                                                data.summary.kehadiran_percent <
                                                70,
                                        }"
                                        >{{
                                            data.summary.kehadiran_percent
                                        }}%</span
                                    >
                                </div>
                                <div
                                    class="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
                                >
                                    <div
                                        class="h-full rounded-full transition-all"
                                        :class="{
                                            'bg-green-500':
                                                data.summary
                                                    .kehadiran_percent >= 85,
                                            'bg-amber-500':
                                                data.summary
                                                    .kehadiran_percent >= 70 &&
                                                data.summary.kehadiran_percent <
                                                    85,
                                            'bg-red-500':
                                                data.summary.kehadiran_percent <
                                                70,
                                        }"
                                        :style="{
                                            width: `${data.summary.kehadiran_percent}%`,
                                        }"
                                    />
                                </div>
                                <p class="text-xs text-slate-500 mt-2">
                                    {{ data.summary.total_absensi }} hari
                                    tercatat
                                </p>
                            </div>

                            <!-- Logbook Progress -->
                            <div class="p-4 bg-slate-50 rounded-xl">
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <span
                                        class="text-sm font-medium text-slate-700"
                                        >Logbook</span
                                    >
                                    <span
                                        class="text-sm font-bold"
                                        :class="{
                                            'text-green-600':
                                                data.summary.logbook_percent >=
                                                75,
                                            'text-amber-600':
                                                data.summary.logbook_percent >=
                                                    50 &&
                                                data.summary.logbook_percent <
                                                    75,
                                            'text-red-600':
                                                data.summary.logbook_percent <
                                                50,
                                        }"
                                        >{{
                                            data.summary.logbook_percent
                                        }}%</span
                                    >
                                </div>
                                <div
                                    class="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
                                >
                                    <div
                                        class="h-full rounded-full transition-all"
                                        :class="{
                                            'bg-green-500':
                                                data.summary.logbook_percent >=
                                                75,
                                            'bg-amber-500':
                                                data.summary.logbook_percent >=
                                                    50 &&
                                                data.summary.logbook_percent <
                                                    75,
                                            'bg-red-500':
                                                data.summary.logbook_percent <
                                                50,
                                        }"
                                        :style="{
                                            width: `${data.summary.logbook_percent}%`,
                                        }"
                                    />
                                </div>
                                <p class="text-xs text-slate-500 mt-2">
                                    {{ data.summary.total_logbook }} dari 50
                                    entri
                                </p>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div>
                            <h3
                                class="text-sm font-semibold text-slate-700 mb-3"
                            >
                                Aktivitas Terbaru
                            </h3>
                            <div
                                v-if="data.monitoring.length > 0"
                                class="space-y-3"
                            >
                                <div
                                    v-for="item in data.monitoring.slice(0, 5)"
                                    :key="item.id_monitoring"
                                    class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                                >
                                    <div
                                        class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs"
                                    >
                                        <Icon
                                            name="lucide:footprints"
                                            class="w-4 h-4"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <p
                                            class="text-sm font-medium text-slate-900"
                                        >
                                            Kunjungan Monitoring
                                        </p>
                                        <p class="text-xs text-slate-500">
                                            {{
                                                formatDate(
                                                    item.tanggal_monitoring,
                                                )
                                            }}
                                        </p>
                                        <p
                                            v-if="item.hasil_monitoring"
                                            class="text-sm text-slate-600 mt-1"
                                        >
                                            {{ item.hasil_monitoring }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p
                                v-else
                                class="text-sm text-slate-500 text-center py-4"
                            >
                                Belum ada kunjungan
                            </p>
                        </div>
                    </div>

                    <!-- Absensi Tab -->
                    <div v-else-if="activeTab === 'absensi'" class="space-y-4">
                        <!-- Summary -->
                        <div
                            class="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl"
                        >
                            <div class="text-center">
                                <p class="text-xl font-bold text-green-600">
                                    {{
                                        data.absensi.filter(
                                            (a) => a.status_absensi === "hadir",
                                        ).length
                                    }}
                                </p>
                                <p class="text-xs text-slate-500">Hadir</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xl font-bold text-amber-600">
                                    {{
                                        data.absensi.filter(
                                            (a) => a.status_absensi === "sakit",
                                        ).length
                                    }}
                                </p>
                                <p class="text-xs text-slate-500">Sakit</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xl font-bold text-blue-600">
                                    {{
                                        data.absensi.filter(
                                            (a) => a.status_absensi === "izin",
                                        ).length
                                    }}
                                </p>
                                <p class="text-xs text-slate-500">Izin</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xl font-bold text-red-600">
                                    {{
                                        data.absensi.filter(
                                            (a) =>
                                                a.status_absensi === "alpa" ||
                                                a.status_absensi === "alpha",
                                        ).length
                                    }}
                                </p>
                                <p class="text-xs text-slate-500">Alpha</p>
                            </div>
                        </div>

                        <!-- List Absensi -->
                        <div class="border-t border-slate-200 pt-4">
                            <h4
                                class="text-sm font-semibold text-slate-700 mb-3"
                            >
                                Riwayat Kehadiran
                            </h4>
                            <div
                                v-if="data.absensi.length > 0"
                                class="space-y-2 max-h-96 overflow-y-auto"
                            >
                                <div
                                    v-for="item in data.absensi"
                                    :key="item.id_absensi"
                                    class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                                >
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                                        >
                                            <Icon
                                                name="lucide:calendar"
                                                class="w-5 h-5"
                                            />
                                        </div>
                                        <div>
                                            <p
                                                class="text-sm font-medium text-slate-900"
                                            >
                                                {{ formatDate(item.tanggal) }}
                                            </p>
                                            <p
                                                v-if="item.keterangan"
                                                class="text-xs text-slate-500"
                                            >
                                                {{ item.keterangan }}
                                            </p>
                                        </div>
                                    </div>
                                    <UBadge
                                        :class="
                                            getAbsensiStatusClass(
                                                item.status_absensi,
                                            )
                                        "
                                    >
                                        {{
                                            item.status_absensi === "alpa"
                                                ? "Alpha"
                                                : item.status_absensi
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  item.status_absensi.slice(1)
                                        }}
                                    </UBadge>
                                </div>
                            </div>
                            <p
                                v-else
                                class="text-sm text-slate-500 text-center py-4"
                            >
                                Belum ada data absensi
                            </p>
                        </div>
                    </div>

                    <!-- Logbook Tab -->
                    <div v-else-if="activeTab === 'logbook'" class="space-y-4">
                        <div
                            v-if="data.logbook.length > 0"
                            class="space-y-3 max-h-96 overflow-y-auto"
                        >
                            <div
                                v-for="item in data.logbook"
                                :key="item.id_logbook"
                                class="p-4 bg-slate-50 rounded-xl"
                            >
                                <div
                                    class="flex items-start justify-between mb-2"
                                >
                                    <div class="flex items-center gap-2">
                                        <div
                                            class="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs"
                                        >
                                            <Icon
                                                name="lucide:book-open"
                                                class="w-4 h-4"
                                            />
                                        </div>
                                        <div>
                                            <p
                                                class="text-sm font-medium text-slate-900"
                                            >
                                                {{ item.judul_kegiatan }}
                                            </p>
                                            <p class="text-xs text-slate-500">
                                                {{ formatDate(item.tanggal) }}
                                            </p>
                                        </div>
                                    </div>
                                    <UBadge
                                        :color="
                                            item.status_persetujuan ===
                                            'disetujui'
                                                ? 'success'
                                                : item.status_persetujuan ===
                                                    'ditolak'
                                                  ? 'error'
                                                  : 'warning'
                                        "
                                        variant="subtle"
                                    >
                                        {{
                                            item.status_persetujuan ===
                                            "disetujui"
                                                ? "Disetujui"
                                                : item.status_persetujuan ===
                                                    "ditolak"
                                                  ? "Ditolak"
                                                  : "Pending"
                                        }}
                                    </UBadge>
                                </div>
                                <p class="text-sm text-slate-600 line-clamp-2">
                                    {{ item.isi_kegiatan }}
                                </p>
                                <p
                                    v-if="item.catatan_pembimbing"
                                    class="text-xs text-slate-500 mt-2 italic"
                                >
                                    Catatan: {{ item.catatan_pembimbing }}
                                </p>
                            </div>
                        </div>
                        <p
                            v-else
                            class="text-sm text-slate-500 text-center py-8"
                        >
                            Belum ada logbook
                        </p>
                    </div>

                    <!-- Kunjungan Tab -->
                    <div
                        v-else-if="activeTab === 'kunjungan'"
                        class="space-y-4"
                    >
                        <div
                            v-if="data.monitoring.length > 0"
                            class="space-y-3 max-h-96 overflow-y-auto"
                        >
                            <div
                                v-for="item in data.monitoring"
                                :key="item.id_monitoring"
                                class="p-4 bg-slate-50 rounded-xl"
                            >
                                <div class="flex items-start gap-3">
                                    <div
                                        class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600"
                                    >
                                        <Icon
                                            name="lucide:footprints"
                                            class="w-5 h-5"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <div
                                            class="flex items-center justify-between"
                                        >
                                            <p
                                                class="text-sm font-medium text-slate-900"
                                            >
                                                {{
                                                    formatDate(
                                                        item.tanggal_monitoring,
                                                    )
                                                }}
                                            </p>
                                        </div>
                                        <p
                                            v-if="item.hasil_monitoring"
                                            class="text-sm text-slate-600 mt-1"
                                        >
                                            {{ item.hasil_monitoring }}
                                        </p>
                                        <div
                                            v-if="item.kendala || item.solusi"
                                            class="mt-2 space-y-1"
                                        >
                                            <div
                                                v-if="item.kendala"
                                                class="flex items-start gap-2"
                                            >
                                                <Icon
                                                    name="lucide:alert-triangle"
                                                    class="w-3 h-3 text-amber-500 mt-0.5"
                                                />
                                                <p
                                                    class="text-xs text-slate-600"
                                                >
                                                    <span class="font-medium"
                                                        >Kendala:</span
                                                    >
                                                    {{ item.kendala }}
                                                </p>
                                            </div>
                                            <div
                                                v-if="item.solusi"
                                                class="flex items-start gap-2"
                                            >
                                                <Icon
                                                    name="lucide:check-circle"
                                                    class="w-3 h-3 text-green-500 mt-0.5"
                                                />
                                                <p
                                                    class="text-xs text-slate-600"
                                                >
                                                    <span class="font-medium"
                                                        >Solusi:</span
                                                    >
                                                    {{ item.solusi }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p
                            v-else
                            class="text-sm text-slate-500 text-center py-8"
                        >
                            Belum ada kunjungan
                        </p>
                    </div>
                </div>
            </div>
        </template>

        <!-- Modal Tambah Monitoring -->
        <UModal v-model:open="modalOpen" :ui="{ width: 'sm:max-w-md' }">
            <template #content>
                <UCard
                    :ui="{
                        body: { padding: 'p-6' },
                        footer: { padding: 'px-6 pb-6' },
                    }"
                >
                    <template #header>
                        <h3 class="font-semibold text-slate-900 text-lg">
                            Tambah Kunjungan Monitoring
                        </h3>
                    </template>

                    <div class="space-y-4">
                        <UFormField label="Tanggal Kunjungan" required>
                            <UInput
                                v-model="formMonitoring.tanggal_monitoring"
                                type="date"
                            />
                        </UFormField>

                        <UFormField label="Hasil Monitoring">
                            <UTextarea
                                v-model="formMonitoring.hasil_monitoring"
                                placeholder="Deskripsikan hasil kunjungan..."
                                :rows="3"
                            />
                        </UFormField>

                        <UFormField label="Kendala yang Ditemukan">
                            <UTextarea
                                v-model="formMonitoring.kendala"
                                placeholder="Jika ada kendala..."
                                :rows="2"
                            />
                        </UFormField>

                        <UFormField label="Solusi/Tindakan">
                            <UTextarea
                                v-model="formMonitoring.solusi"
                                placeholder="Tindakan yang dilakukan..."
                                :rows="2"
                            />
                        </UFormField>

                        <UFormField label="Link Foto (opsional)">
                            <UInput
                                v-model="formMonitoring.foto_monitoring"
                                placeholder="URL foto dokumentasi..."
                            />
                        </UFormField>
                    </div>

                    <template #footer>
                        <div class="flex gap-3">
                            <UButton
                                variant="outline"
                                color="neutral"
                                @click="modalOpen = false"
                                >Batal</UButton
                            >
                            <UButton
                                :loading="processing"
                                :disabled="!formMonitoring.tanggal_monitoring"
                                @click="submitMonitoring"
                            >
                                Simpan
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </div>
</template>
