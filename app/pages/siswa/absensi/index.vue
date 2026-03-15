<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                Absensi PKL
            </h1>
            <ClientOnly>
                <p class="text-sm text-slate-500 mt-1">{{ currentDate || 'Memuat tanggal...' }}</p>
                <template #fallback>
                    <div class="h-5 w-32 bg-slate-100 animate-pulse mt-1 rounded"></div>
                </template>
            </ClientOnly>
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

        <!-- Attendance Steps Guide -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Icon name="lucide:list-checks" class="w-5 h-5 text-sky-500" />
                Prosedur Absensi
            </h2>
            <div class="relative flex justify-between">
                <!-- Step 1: Location -->
                <div class="flex flex-col items-center gap-2 z-10 flex-1">
                    <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500',
                        isLocating ? 'bg-sky-500 border-sky-100 text-white animate-pulse' : 
                        userCoords ? 'bg-green-500 border-green-100 text-white' : 'bg-slate-100 border-white text-slate-400'
                    ]">
                        <Icon :name="isLocating ? 'lucide:loader-2' : 'lucide:map-pin'" :class="['w-5 h-5', isLocating ? 'animate-spin' : '']" />
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-tight text-center" :class="userCoords ? 'text-green-600' : 'text-slate-400'">
                        1. Verifikasi<br/>Lokasi
                    </span>
                </div>
                
                <!-- Connector 1-2 -->
                <div class="absolute top-5 left-[20%] right-[50%] h-0.5 bg-slate-100 -z-0">
                    <div class="h-full bg-green-500 transition-all duration-1000" :style="{ width: userCoords ? '100%' : '0%' }"></div>
                </div>

                <!-- Step 2: Distance Check -->
                <div class="flex flex-col items-center gap-2 z-10 flex-1">
                    <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500',
                        userCoords && !isInRange ? 'bg-amber-500 border-amber-100 text-white animate-bounce' :
                        isInRange ? 'bg-green-500 border-green-100 text-white' : 'bg-slate-100 border-white text-slate-400'
                    ]">
                        <Icon :name="isInRange ? 'lucide:shrink' : 'lucide:maximize'" class="w-5 h-5" />
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-tight text-center" :class="isInRange ? 'text-green-600' : 'text-slate-400'">
                        2. Cek<br/>Radius
                    </span>
                </div>

                <!-- Connector 2-3 -->
                <div class="absolute top-5 left-[50%] right-[20%] h-0.5 bg-slate-100 -z-0">
                    <div class="h-full bg-green-500 transition-all duration-1000" :style="{ width: isInRange ? '100%' : '0%' }"></div>
                </div>

                <!-- Step 3: Action -->
                <div class="flex flex-col items-center gap-2 z-10 flex-1">
                    <div :class="[
                        'w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500',
                        todayAttendance ? 'bg-indigo-600 border-indigo-100 text-white' : 
                        isInRange ? 'bg-sky-500 border-sky-100 text-white' : 'bg-slate-100 border-white text-slate-400'
                    ]">
                        <Icon :name="todayAttendance ? 'lucide:user-check' : 'lucide:fingerprint'" class="w-5 h-5" />
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-tight text-center" :class="todayAttendance ? 'text-indigo-600' : 'text-slate-400'">
                        3. Klik<br/>Absensi
                    </span>
                </div>
            </div>
        </div>

        <!-- Map Card -->
        <div
            class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
            <div class="relative group min-h-[320px] lg:min-h-[400px]">
                <ClientOnly>
                    <div v-if="isMounted && officeCoords" style="height: 320px; width: 100%" class="lg:h-80">
                        <LMap
                            ref="map"
                            :zoom="15"
                            :center="mapCenter"
                            :use-global-leaflet="false"
                            class="z-0 transition-all duration-500"
                            style="height: 100%; width: 100%"
                        >
                            <LTileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            <!-- Connecting Line -->
                            <LPolyline
                                v-if="userCoords && officeCoords"
                                :lat-lngs="[userCoords, officeCoords]"
                                color="#94a3b8"
                                :dash-array="'10, 10'"
                                :weight="2"
                                :opacity="0.6"
                            />

                            <!-- Office marker & radius -->
                            <LCircle
                                v-if="officeCoords"
                                :lat-lng="officeCoords"
                                :radius="validRadius"
                                color="#0ea5e9"
                                :weight="2"
                                :fill-opacity="0.08"
                            />
                            <LMarker v-if="officeCoords" :lat-lng="officeCoords">
                                <LIcon :options="{
                                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                                    iconSize: [32, 32],
                                    iconAnchor: [16, 32],
                                    popupAnchor: [1, -34],
                                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                    shadowSize: [41, 41]
                                }" />
                                <LTooltip :options="{ permanent: true, direction: 'top', offset: [0, -32] }">
                                    <span class="font-bold text-[10px] text-slate-700 uppercase">Lokasi PKL</span>
                                </LTooltip>
                            </LMarker>

                            <!-- User marker -->
                            <template v-if="userCoords">
                                <LCircle
                                    :lat-lng="userCoords"
                                    :radius="15"
                                    color="#3b82f6"
                                    :weight="1"
                                    :fill-opacity="0.2"
                                />
                                <LMarker :lat-lng="userCoords">
                                    <LIcon :options="{
                                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                                        iconSize: [28, 28],
                                        iconAnchor: [14, 28],
                                        popupAnchor: [1, -34],
                                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                        shadowSize: [41, 41]
                                    }" />
                                    <LTooltip :options="{ direction: 'top', offset: [0, -28] }">
                                        <span class="font-bold text-[10px] text-blue-600 uppercase">Posisi Anda</span>
                                    </LTooltip>
                                </LMarker>
                            </template>
                        </LMap>
                    </div>
                    <template #fallback>
                        <div
                            class="h-64 lg:h-80 bg-slate-100 flex items-center justify-center"
                        >
                            <div class="text-center">
                                <Icon
                                    name="lucide:map"
                                    class="w-10 h-10 text-slate-300 animate-pulse mx-auto mb-2"
                                />
                                <p class="text-xs text-slate-400 font-medium tracking-wide">Inisialisasi Peta...</p>
                            </div>
                        </div>
                    </template>
                </ClientOnly>
                
                <!-- Floating Map Controls -->
                <div v-if="isMounted && userCoords" class="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                    <UButton
                        size="xs"
                        color="white"
                        class="shadow-lg rounded-xl font-bold border-2 border-slate-100"
                        @click="recalibrate"
                    >
                        <Icon name="lucide:refresh-cw" class="w-4 h-4 mr-1 text-amber-500" />
                        Kalibrasi
                    </UButton>
                    <UButton
                        size="xs"
                        color="white"
                        class="shadow-lg rounded-xl font-bold border-2 border-slate-100"
                        @click="requestLocation"
                    >
                        <Icon name="lucide:locate-fixed" class="w-4 h-4 mr-1 text-blue-500" />
                        Fokus
                    </UButton>
                </div>
                
                <!-- Floating Distance Badge -->
                <div v-if="isMounted && userCoords" class="absolute top-4 right-4 z-10 transition-all duration-500">
                    <div :class="[
                        'px-4 py-2 rounded-2xl text-xs font-black shadow-xl backdrop-blur-md flex items-center gap-2 border-2',
                        isInRange ? 'bg-green-600/90 text-white border-green-400' : 'bg-rose-600/90 text-white border-rose-400'
                    ]">
                        <Icon :name="isInRange ? 'lucide:map-pin' : 'lucide:map-pin-off'" class="w-4 h-4" />
                        {{ Math.round(distance) }} METERS
                    </div>
                </div>
            </div>

            <!-- Status & Action -->
            <div class="p-6">
                <!-- Location Status Card -->
                <div class="mb-6 p-5 rounded-2xl border transition-all duration-500 shadow-sm" :class="[
                    !isMounted || isLocating ? 'bg-sky-50/50 border-sky-100' :
                    geoError ? 'bg-rose-50 border-rose-100' :
                    isInRange ? 'bg-emerald-50/80 border-emerald-100' : 'bg-slate-50 border-slate-200'
                ]">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-4">
                            <div :class="[
                                'w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transform transition-transform duration-500',
                                !isMounted || isLocating ? 'bg-sky-500 text-white' :
                                geoError ? 'bg-rose-500 text-white scale-110' :
                                isInRange ? 'bg-emerald-500 text-white scale-105' : 'bg-slate-500 text-white'
                            ]">
                                <Icon v-if="!isMounted || isLocating" name="lucide:satellite-dish" class="w-7 h-7 animate-pulse" />
                                <Icon v-else :name="geoError ? 'lucide:shield-alert' : isInRange ? 'lucide:badge-check' : 'lucide:map-pinned'" class="w-7 h-7" />
                            </div>
                            <div>
                                <h3 class="font-black text-slate-900 leading-none text-lg tracking-tight">
                                    {{ 
                                        !isMounted || isLocating ? 'Verifikasi GPS...' : 
                                        geoError ? 'Akses GPS Ditolak' :
                                        isInRange ? 'Radius Terverifikasi' : 'Di Luar Radius' 
                                    }}
                                </h3>
                                <p class="text-[13px] text-slate-500 mt-1 font-medium">
                                    <template v-if="!isMounted || isLocating">Harap tunggu sebentar, mencocokkan koordinat...</template>
                                    <template v-else-if="geoError">Klik "Coba Lagi" dan berikan izin lokasi di browser.</template>
                                    <template v-else-if="isInRange">Anda berada di area yang benar. Silakan absen.</template>
                                    <template v-else>Jarak Anda <strong>{{ Math.round(distance - validRadius) }}m</strong> lagi dari batas radius.</template>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Progress Bar -->
                    <div v-if="isMounted && !geoError" class="space-y-2">
                        <div class="flex justify-between text-[11px] font-black uppercase tracking-widest">
                            <span class="text-slate-400">Akurasi Jarak</span>
                            <span v-if="isLocating" class="text-sky-500 animate-pulse">SEARCHING...</span>
                            <span v-else :class="isInRange ? 'text-emerald-600' : 'text-slate-600'">
                                {{ isInRange ? 'OPTIMAL' : 'BELUM TERCAPAI' }}
                            </span>
                        </div>
                        <div class="h-3 bg-slate-200/50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                            <div 
                                class="h-full rounded-full transition-all duration-1000 ease-in-out shadow-inner"
                                :class="isLocating ? 'bg-sky-500' : isInRange ? 'bg-emerald-500' : 'bg-amber-500'"
                                :style="{ width: isLocating ? '100%' : `${distanceProgress}%` }"
                            ></div>
                        </div>
                    </div>
                </div>

                <!-- Today Status Details -->
                <div v-if="todayAttendance" class="mb-6 bg-linear-to-r from-indigo-50 to-sky-50 rounded-2xl p-5 border border-indigo-100/50 shadow-inner">
                    <div class="flex items-center gap-5">
                        <div class="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-indigo-50">
                            <Icon name="lucide:clock-9" class="w-8 h-8 text-indigo-500" />
                        </div>
                        <div class="flex-1">
                            <p class="text-[11px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1.5">Record Absensi Hari Ini</p>
                            <div class="flex items-center gap-3">
                                <span class="text-2xl font-black text-slate-800 tabular-nums">{{ todayAttendance.checkIn }}</span>
                                <UBadge color="indigo" variant="soft" size="xs" class="font-bold">SUDAH MASUK</UBadge>
                            </div>
                        </div>
                        <div v-if="todayAttendance.checkOut" class="text-right pr-2">
                             <p class="text-[10px] font-black text-slate-400 uppercase mb-0.5">Check-out</p>
                             <p class="text-lg font-black text-slate-700 tabular-nums">{{ todayAttendance.checkOut }}</p>
                        </div>
                    </div>
                </div>

                <!-- Primary Action Buttons -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UButton
                        size="xl"
                        :color="isInRange ? 'primary' : 'neutral'"
                        block
                        class="rounded-2xl shadow-lg h-14 text-base font-bold transition-all active:scale-95"
                        :class="{ 'sm:col-span-2': !todayAttendance }"
                        :disabled="!isInRange || !!todayAttendance || submitting"
                        :loading="submitting && !todayAttendance"
                        @click="handleCheckIn"
                    >
                        <template #leading>
                            <Icon :name="todayAttendance ? 'lucide:user-check' : 'lucide:log-in'" class="w-6 h-6" />
                        </template>
                        {{ todayAttendance ? 'Check-in Selesai' : 'Absen Masuk Sekarang' }}
                    </UButton>

                    <UButton
                        v-if="todayAttendance && !todayAttendance.checkOut"
                        size="xl"
                        color="rose"
                        variant="soft"
                        block
                        class="rounded-2xl h-14 text-base font-bold transition-all active:scale-95"
                        :loading="submitting && todayAttendance.checkOut === null"
                        @click="handleCheckOut"
                    >
                        <template #leading>
                            <Icon name="lucide:log-out" class="w-6 h-6" />
                        </template>
                        Absen Pulang
                    </UButton>
                    
                    <!-- Helper Text for Disabled States -->
                    <div v-if="!isInRange && !todayAttendance" class="sm:col-span-2 text-center">
                        <p class="text-xs font-semibold text-slate-400 animate-pulse flex items-center justify-center gap-1.5">
                            <Icon name="lucide:info" class="w-4 h-4" />
                            Dekati lokasi industri untuk mengaktifkan tombol absen
                        </p>
                    </div>

                    <!-- Calibration Tip -->
                    <div class="sm:col-span-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p class="text-[10px] text-slate-400 font-medium leading-relaxed">
                            <strong class="text-slate-500">Tips Akurasi:</strong> Jika lokasi tidak pas, klik tombol <strong>Kalibrasi</strong> pada peta, pastikan Anda berada di luar ruangan, atau buka Google Maps sebentar untuk membantu mengunci sinyal GPS.
                        </p>
                    </div>
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
    LPolyline,
    LTooltip,
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
const isLocating = ref(false); // Start false, will be true in onMounted
const isMounted = ref(false);
const currentDate = ref("");

// Penempatan data
const penempatan = ref<SiswaPenempatan | null>(null);

// Office location - Default safely
const DEFAULT_COORDS: [number, number] = [-6.2088, 106.8456];
const officeCoords = ref<[number, number] | null>(DEFAULT_COORDS);
const validRadius = 500;

// Geolocation
const { coords, resume, pause, error: geoError } = useGeolocation({ 
    enableHighAccuracy: true,
    immediate: false 
});

const recalibrate = () => {
    if (!isMounted.value) return;
    
    pause(); 
    isLocating.value = true;
    
    toast.add({ 
        title: "Kalibrasi GPS", 
        description: "Menyegarkan sensor GPS untuk akurasi tinggi...",
        color: "warning"
    });

    setTimeout(() => {
        resume();
    }, 1000);
};

const userCoords = computed(() => {
    if (coords.value && 
        typeof coords.value.latitude === 'number' && 
        !isNaN(coords.value.latitude) &&
        typeof coords.value.longitude === 'number' && 
        !isNaN(coords.value.longitude)
    ) {
        return [Number(coords.value.latitude), Number(coords.value.longitude)] as [number, number];
    }
    return null;
});

// Center coordinate for the map - Ensure no NaN
const mapCenter = computed(() => {
    if (userCoords.value) return userCoords.value;
    if (officeCoords.value) return officeCoords.value;
    return DEFAULT_COORDS;
});

// Watch for coordinates to stop locating state
watch(userCoords, (newCoords) => {
    if (newCoords && isLocating.value) {
        isLocating.value = false;
        toast.add({ 
            title: "Lokasi Terdeteksi", 
            description: "Posisi Anda berhasil diverifikasi oleh sistem.",
            color: "success",
            timeout: 3000
        });
    }
}, { immediate: true });

// Watch for geoError
watch(geoError, (err) => {
    if (err) {
        isLocating.value = false;
        let msg = "Gagal mengakses lokasi.";
        if (err.code === 1) msg = "Izin lokasi ditolak. Harap izinkan akses lokasi di browser Anda.";
        else if (err.code === 2) msg = "Posisi tidak tersedia.";
        else if (err.code === 3) msg = "Waktu akses lokasi habis.";
        
        toast.add({ title: "Masalah Lokasi", description: msg, color: "error" });
    }
});

const requestLocation = () => {
    if (!isMounted.value) return;
    
    isLocating.value = true;
    toast.add({ 
        title: "Mengakses GPS", 
        description: "Sistem sedang meminta izin dan mencocokkan lokasi Anda...",
        color: "primary"
    });
    resume();
};

// Calculate distance percentage for progress bar (0% at office, 100% at radius edge)
const distanceProgress = computed(() => {
    if (!userCoords.value) return 0;
    const p = (distance.value / validRadius) * 100;
    return Math.min(100, Math.max(0, 100 - p));
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
    if (submitting.value) return; // Prevent multiple clicks/race conditions

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
    if (submitting.value || !todayAttendance.value) return; // Prevent multiple clicks

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
    if (loading.value && absensi.value.length > 0) return; // Prevent double load if already has data
    loading.value = true;

    try {
        // Get penempatan first
        const penempatanRes = await penempatanApi.getMyPenempatan();
        if (penempatanRes?.success && penempatanRes?.data) {
            penempatan.value = penempatanRes.data;

            // Set office coords from perusahaan
            const lat = penempatanRes.data.perusahaan?.latitude;
            const lng = penempatanRes.data.perusahaan?.longitude;
            if (lat != null && lng != null) {
                const numLat = Number(lat);
                const numLng = Number(lng);
                if (!isNaN(numLat) && !isNaN(numLng)) {
                    officeCoords.value = [numLat, numLng];
                }
            }
        }

        // Get absensi history
        const absensiRes = await absensiApi.getAll({ limit: 50 });
        if (absensiRes?.success && absensiRes?.data) {
            const today = new Date().toISOString().split("T")[0];
            
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
    isMounted.value = true;
    currentDate.value = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    loadData();
    requestLocation();
});

useHead({ title: "Absensi | Siswa PKL" });
</script>
