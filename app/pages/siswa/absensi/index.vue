<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                Absensi PKL
            </h1>
            <p class="text-sm text-slate-500 mt-1">{{ currentDate }}</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-4 gap-3">
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-slate-900">
                    {{ stats.hadir }}
                </p>
                <p class="text-xs text-slate-500">Hadir</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-amber-600">
                    {{ stats.izin }}
                </p>
                <p class="text-xs text-slate-500">Izin/Sakit</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-red-600">{{ stats.alpha }}</p>
                <p class="text-xs text-slate-500">Alpha</p>
            </div>
            <div
                class="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
                <p class="text-2xl font-bold text-slate-900">
                    {{ stats.total }}
                </p>
                <p class="text-xs text-slate-500">Total</p>
            </div>
        </div>

        <!-- Map Card -->
        <div
            class="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
            <ClientOnly>
                <LMap
                    ref="map"
                    :zoom="17"
                    :center="userCoords || officeCoords"
                    :use-global-leaflet="false"
                    class="h-48 lg:h-64 w-full z-0"
                >
                    <LTileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <!-- Office marker & radius -->
                    <LCircle
                        :lat-lng="officeCoords"
                        :radius="validRadius"
                        color="#0ea5e9"
                        :fill-opacity="0.15"
                    />
                    <LMarker :lat-lng="officeCoords">
                        <LIcon
                            :icon-url="officeIcon"
                            :icon-size="[32, 32]"
                            :icon-anchor="[16, 32]"
                        />
                    </LMarker>
                    <!-- User marker -->
                    <LMarker v-if="userCoords" :lat-lng="userCoords">
                        <LIcon
                            :icon-url="userIcon"
                            :icon-size="[32, 32]"
                            :icon-anchor="[16, 32]"
                        />
                    </LMarker>
                </LMap>
                <template #fallback>
                    <div
                        class="h-48 lg:h-64 bg-slate-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:map"
                            class="w-8 h-8 text-slate-300"
                        />
                    </div>
                </template>
            </ClientOnly>

            <!-- Status & Action -->
            <div class="p-5">
                <!-- Location Status Alert -->
                <UAlert
                    :color="isInRange ? 'success' : 'error'"
                    :icon="
                        isInRange
                            ? 'lucide:check-circle'
                            : 'lucide:alert-circle'
                    "
                    :title="
                        isInRange
                            ? `Posisi Valid (${Math.round(distance)}m)`
                            : `Terlalu Jauh (${Math.round(distance)}m)`
                    "
                    :description="
                        isInRange
                            ? 'Kamu berada dalam radius lokasi PKL'
                            : `Jarak minimal ${validRadius}m dari lokasi PKL`
                    "
                    class="mb-4"
                />

                <!-- Today Status -->
                <div v-if="todayAttendance" class="text-center mb-4">
                    <div
                        class="w-16 h-16 rounded-full mx-auto mb-3 bg-green-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:check"
                            class="w-8 h-8 text-green-600"
                        />
                    </div>
                    <p class="font-semibold text-slate-900">
                        Sudah absen hari ini
                    </p>
                    <p class="text-sm text-slate-500">
                        Check-in: {{ todayAttendance.checkIn }}
                    </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <UButton
                        color="primary"
                        class="flex-1"
                        :disabled="!isInRange || !!todayAttendance"
                        @click="handleCheckIn"
                    >
                        <Icon name="lucide:map-pin" class="w-4 h-4 mr-2" />
                        Check In
                    </UButton>
                    <UButton
                        v-if="todayAttendance && !todayAttendance.checkOut"
                        color="neutral"
                        variant="outline"
                        class="flex-1"
                        @click="handleCheckOut"
                    >
                        <Icon name="lucide:log-out" class="w-4 h-4 mr-2" />
                        Check Out
                    </UButton>
                </div>
            </div>
        </div>

        <!-- AppDataTable -->
        <AppDataTable
            :data="absensi"
            :columns="columns"
            title="Riwayat Absensi"
            description="Daftar kehadiran PKL kamu"
            :loading="loading"
            :searchable="true"
            search-placeholder="Cari tanggal..."
            empty-title="Belum ada absensi"
            empty-description="Mulai catat kehadiran PKL kamu"
            empty-icon="lucide:calendar-check"
        />
    </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";
import {
    LMap,
    LTileLayer,
    LMarker,
    LCircle,
    LIcon,
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import AppDataTable from "~/components/common/AppDataTable.vue";
import {
    useSiswaAbsensiApi,
    type SiswaAbsensi,
} from "~/composables/api/use-siswa";
import {
    useSiswaPenempatanApi,
    type SiswaPenempatan,
} from "~/composables/api/use-siswa";

definePageMeta({ layout: "siswa" });

const toast = useToast();
const columnHelper = createColumnHelper<any>();

// API composables
const absensiApi = useSiswaAbsensiApi();
const penempatanApi = useSiswaPenempatanApi();

// State
const loading = ref(true);
const submitting = ref(false);

// Penempatan data
const penempatan = ref<SiswaPenempatan | null>(null);

// Office location
const officeCoords = ref<[number, number]>([-6.2088, 106.8456]);
const validRadius = 100;

// Icons
const officeIcon =
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
const userIcon =
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png";

// Geolocation
const { coords, resume } = useGeolocation({ enableHighAccuracy: true });
const userCoords = computed(() => {
    if (coords.value) {
        return [coords.value.latitude, coords.value.longitude];
    }
    return null;
});

// Distance calculation
const distance = computed(() => {
    if (!userCoords.value) return 9999;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (userCoords.value[0] * Math.PI) / 180;
    const φ2 = (officeCoords.value[0] * Math.PI) / 180;
    const Δφ = ((officeCoords.value[0] - userCoords.value[0]) * Math.PI) / 180;
    const Δλ = ((officeCoords.value[1] - userCoords.value[1]) * Math.PI) / 180;
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
});

const isInRange = computed(() => distance.value <= validRadius);

// Current date
const currentDate = computed(() => {
    return new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
});

// Stats
const stats = reactive({ hadir: 0, izin: 0, alpha: 0, total: 0 });

// Today attendance
const todayAttendance = ref<{
    id: string | number;
    checkIn: string;
    checkOut: string | null;
} | null>(null);

// Absensi history
const absensi = ref<any[]>([]);

// Format status
function formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
        hadir: "Hadir",
        izin: "Izin",
        sakit: "Sakit",
        alpa: "Alpha",
    };
    return statusMap[status] || status;
}

// Define columns for AppDataTable
const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("tanggal", {
        id: "tanggal",
        header: () => "Tanggal",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("checkIn", {
        id: "checkIn",
        header: () => "Check In",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("checkOut", {
        id: "checkOut",
        header: () => "Check Out",
        cell: (info) => {
            const val = info.getValue();
            return h(
                "span",
                { class: val ? "text-slate-700" : "text-slate-400 italic" },
                val || "-",
            );
        },
    }),
    columnHelper.accessor("status", {
        id: "status",
        header: () => "Status",
        cell: (info) => {
            const status = info.getValue() as string;
            const colorMap: Record<string, string> = {
                Hadir: "bg-green-100 text-green-800",
                Izin: "bg-amber-100 text-amber-800",
                Sakit: "bg-blue-100 text-blue-800",
                Alpha: "bg-red-100 text-red-800",
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
];

// Check in
async function handleCheckIn() {
    if (!penempatan.value || !userCoords.value) {
        toast.add({
            title: "Gagal",
            description: "Pastikan lokasi terdeteksi",
            color: "error",
        });
        return;
    }

    submitting.value = true;
    try {
        const res = await absensiApi.create({
            id_penempatan: Number(penempatan.value.id_penempatan),
            tanggal: new Date().toISOString().split("T")[0],
            status_absensi: "hadir",
            metode_absensi: "gps",
            latitude: userCoords.value[0],
            longitude: userCoords.value[1],
        });

        if (res) {
            toast.add({ title: "Check-in berhasil", color: "success" });
            await loadData();
        }
    } catch (err) {
        console.error("Check-in error:", err);
        toast.add({ title: "Gagal check-in", color: "error" });
    } finally {
        submitting.value = false;
    }
}

// Check out
async function handleCheckOut() {
    if (!todayAttendance.value) return;

    submitting.value = true;
    try {
        const now = new Date();
        const waktuKeluar = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        const res = await absensiApi.update(todayAttendance.value.id, {
            waktu_keluar: waktuKeluar,
        });

        if (res) {
            toast.add({ title: "Check-out berhasil", color: "success" });
            await loadData();
        }
    } catch (err) {
        console.error("Check-out error:", err);
        toast.add({ title: "Gagal check-out", color: "error" });
    } finally {
        submitting.value = false;
    }
}

// Load data
async function loadData() {
    loading.value = true;

    try {
        // Get penempatan first
        const penempatanRes = await penempatanApi.getMyPenempatan();
        if (penempatanRes?.success && penempatanRes?.data) {
            penempatan.value = penempatanRes.data;

            // Set office coords from perusahaan
            if (
                penempatanRes.data.perusahaan?.latitude &&
                penempatanRes.data.perusahaan?.longitude
            ) {
                officeCoords.value = [
                    penempatanRes.data.perusahaan.latitude,
                    penempatanRes.data.perusahaan.longitude,
                ];
            }
        }

        // Get absensi history
        const absensiRes = await absensiApi.getAll({ limit: 50 });
        if (absensiRes?.success && absensiRes?.data) {
            const today = new Date().toISOString().split("T")[0];
            const todayStr = new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "short",
                year: "numeric",
            });

            absensi.value = absensiRes.data.map((item: SiswaAbsensi) => {
                const itemDate = new Date(item.tanggal)
                    .toISOString()
                    .split("T")[0];
                const formattedDate = new Date(item.tanggal).toLocaleDateString(
                    "id-ID",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    },
                );

                // Format waktu
                const formatWaktu = (waktu: Date | null) => {
                    if (!waktu) return null;
                    const d = new Date(waktu);
                    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                };

                const checkIn = formatWaktu(item.waktu_masuk);
                const checkOut = formatWaktu(item.waktu_keluar);

                // Check if today
                if (itemDate === today) {
                    todayAttendance.value = {
                        id: item.id_absensi,
                        checkIn: checkIn || "-",
                        checkOut: checkOut,
                    };
                }

                return {
                    id: item.id_absensi,
                    tanggal: formattedDate,
                    checkIn: checkIn || "-",
                    checkOut: checkOut,
                    status: formatStatus(item.status_absensi),
                };
            });

            // Calculate stats
            stats.total = absensi.value.length;
            stats.hadir = absensi.value.filter(
                (a: any) => a.status === "Hadir",
            ).length;
            stats.izin = absensi.value.filter(
                (a: any) => a.status === "Izin" || a.status === "Sakit",
            ).length;
            stats.alpha = absensi.value.filter(
                (a: any) => a.status === "Alpha",
            ).length;
        }
    } catch (err) {
        console.error("[LoadData] Error loading absensi:", err);
        toast.add({ title: "Gagal memuat data", color: "error" });
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadData();
    resume();
});

useHead({ title: "Absensi | Siswa PKL" });
</script>
