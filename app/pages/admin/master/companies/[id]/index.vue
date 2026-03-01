<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import {
    usePerusahaanApi,
    type Perusahaan,
} from "~/composables/api/use-partner";
import { Map, TileLayer, Marker, type LatLngExpression } from "leaflet";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const perusahaanApi = usePerusahaanApi();

const id = computed(() => route.params.id as string);
const loading = ref(true);
const isMapInitialized = ref(false);
const perusahaanData = ref<Perusahaan | null>(null);

// Map refs
const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
let tileLayer: TileLayer | null = null;
let marker: Marker | null = null;

// Initialize map for detail view (read-only)
async function initMap() {
    if (isMapInitialized.value || !mapContainer.value) return;

    // Wait for DOM to be ready
    await nextTick();

    if (!mapContainer.value) return;

    try {
        const defaultCenter: LatLngExpression = [-2.5489, 118.0149];
        const defaultZoom = 5;

        // Create map instance with Leaflet 2.0 constructor style
        map = new Map(mapContainer.value, {
            zoomControl: true,
            scrollWheelZoom: false,
        }).setView(defaultCenter, defaultZoom);

        // Add OpenStreetMap tiles using TileLayer constructor
        tileLayer = new TileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            },
        ).addTo(map);

        // If has coordinates, show marker
        if (perusahaanData.value?.latitude && perusahaanData.value?.longitude) {
            const latLng: LatLngExpression = [
                perusahaanData.value.latitude,
                perusahaanData.value.longitude,
            ];
            map.setView(latLng, 15);
            marker = new Marker(latLng, {
                interactive: false,
            }).addTo(map);
        }

        // Invalidate size after initialization to ensure proper rendering
        requestAnimationFrame(() => {
            map?.invalidateSize();
        });

        isMapInitialized.value = true;
    } catch (error) {
        console.error("Failed to initialize map:", error);
    }
}

function cleanupMap() {
    if (marker) {
        marker.remove();
        marker = null;
    }
    if (tileLayer) {
        tileLayer.remove();
        tileLayer = null;
    }
    if (map) {
        map.remove();
        map = null;
    }
    isMapInitialized.value = false;
}

async function fetchPerusahaan() {
    loading.value = true;
    try {
        const response = await perusahaanApi.getById(id.value);
        if (response.success && response.data) {
            perusahaanData.value = response.data;
        } else {
            toast.add({
                title: "Data tidak ditemukan",
                color: "error",
            });
            router.push("/admin/master/companies");
        }
    } catch (error) {
        console.error("Failed to fetch perusahaan:", error);
        toast.add({ title: "Gagal memuat data", color: "error" });
        router.push("/admin/master/companies");
    } finally {
        loading.value = false;
    }
}

function navigateToEdit() {
    cleanupMap();
    router.push(`/admin/master/companies/${id.value}/edit`);
}

function handleBack() {
    cleanupMap();
    router.push("/admin/master/companies");
}

function formatDate(dateString?: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

onMounted(async () => {
    await fetchPerusahaan();
    initMap();
});

onUnmounted(() => {
    cleanupMap();
});

useHead({ title: "Detail Perusahaan | Admin" });
</script>

<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
            <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="lucide:arrow-left"
                class="shrink-0"
                @click="handleBack"
            >
                Kembali
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Detail Perusahaan
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Informasi lengkap perusahaan mitra
                </p>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
            <UIcon
                name="lucide:loader-2"
                class="w-8 h-8 animate-spin text-slate-400"
            />
        </div>

        <div
            v-else-if="perusahaanData"
            class="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Informasi Perusahaan -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Informasi Perusahaan
                        </h3>
                    </div>
                    <div class="p-5">
                        <div class="flex items-center gap-4 mb-6">
                            <div
                                class="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl font-bold"
                            >
                                <Icon
                                    name="lucide:building-2"
                                    class="w-8 h-8"
                                />
                            </div>
                            <div>
                                <h2 class="text-lg font-bold text-slate-900">
                                    {{ perusahaanData.nama_perusahaan }}
                                </h2>
                                <p class="text-sm text-slate-500">
                                    ID: {{ perusahaanData.id_perusahaan }}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-slate-500">Email</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.email || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">No. HP</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.no_hp || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Bidang Usaha
                                </p>
                                <UBadge
                                    v-if="perusahaanData.bidang_usaha"
                                    color="primary"
                                    variant="subtle"
                                >
                                    {{ perusahaanData.bidang_usaha }}
                                </UBadge>
                                <span v-else class="text-slate-400">-</span>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">Kapasitas</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.kapasitas_siswa || "-" }}
                                    siswa
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">Status</p>
                                <UBadge
                                    :color="
                                        perusahaanData.status_kerjasama
                                            ? 'success'
                                            : 'neutral'
                                    "
                                    variant="subtle"
                                >
                                    {{
                                        perusahaanData.status_kerjasama
                                            ? "Aktif"
                                            : "Nonaktif"
                                    }}
                                </UBadge>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Alamat Lengkap -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Alamat Lengkap
                        </h3>
                    </div>
                    <div class="p-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-slate-500">Provinsi</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.provinsi || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Kabupaten/Kota
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.kabupaten_kota || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">Kecamatan</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.kecamatan || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">
                                    Kelurahan/Desa
                                </p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.kelurahan || "-" }}
                                </p>
                            </div>
                            <div class="md:col-span-2">
                                <p class="text-sm text-slate-500">Nama Jalan</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.jalan || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">Kode Pos</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.kode_pos || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-sm text-slate-500">Desa</p>
                                <p class="text-sm font-medium text-slate-900">
                                    {{ perusahaanData.desa || "-" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Alamat (legacy, for reference) -->
                <div
                    v-if="perusahaanData.alamat"
                    class="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div class="p-4">
                        <p class="text-xs text-slate-500 mb-1">
                            Alamat Lengkap (Format Lama)
                        </p>
                        <p class="text-sm font-medium text-slate-900">
                            {{ perusahaanData.alamat }}
                        </p>
                    </div>
                </div>

                <!-- Lokasi Peta -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Lokasi
                        </h3>
                    </div>
                    <div class="p-5">
                        <div
                            v-if="
                                perusahaanData.latitude &&
                                perusahaanData.longitude
                            "
                        >
                            <div class="relative mb-4">
                                <!-- Map container - always in DOM -->
                                <div
                                    ref="mapContainer"
                                    class="h-64 w-full rounded-lg overflow-hidden border border-slate-200 z-0"
                                ></div>
                                <!-- Loading overlay -->
                                <div
                                    v-if="!isMapInitialized"
                                    class="absolute inset-0 h-64 w-full rounded-lg bg-slate-100 flex items-center justify-center"
                                >
                                    <div class="text-center text-slate-400">
                                        <Icon
                                            name="lucide:map"
                                            class="w-8 h-8 mx-auto mb-2"
                                        />
                                        <p class="text-sm">Memuat peta...</p>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg"
                            >
                                <div>
                                    <p class="text-xs text-slate-500 mb-1">
                                        Latitude
                                    </p>
                                    <p
                                        class="text-sm font-mono font-medium text-slate-900"
                                    >
                                        {{ perusahaanData.latitude }}
                                    </p>
                                </div>
                                <div>
                                    <p class="text-xs text-slate-500 mb-1">
                                        Longitude
                                    </p>
                                    <p
                                        class="text-sm font-mono font-medium text-slate-900"
                                    >
                                        {{ perusahaanData.longitude }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center py-8 text-slate-500">
                            <Icon
                                name="lucide:map-off"
                                class="w-12 h-12 mx-auto mb-3 text-slate-300"
                            />
                            <p>Lokasi belum ditentukan</p>
                        </div>
                    </div>
                </div>

                <!-- Siswa PKL -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Siswa PKL
                        </h3>
                    </div>
                    <div class="p-5 text-center text-slate-500">
                        <Icon
                            name="lucide:users"
                            class="w-12 h-12 mx-auto mb-3 text-slate-300"
                        />
                        <p>
                            Data siswa PKL akan ditampilkan setelah fitur
                            tersedia
                        </p>
                    </div>
                </div>
            </div>

            <!-- Sidebar Actions -->
            <div class="lg:col-span-1">
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-6"
                >
                    <div class="p-4 border-b border-slate-100">
                        <h3 class="font-semibold text-slate-900">Aksi</h3>
                    </div>
                    <div class="p-2 space-y-1">
                        <UButton
                            color="primary"
                            variant="ghost"
                            icon="lucide:edit"
                            class="w-full justify-start"
                            @click="navigateToEdit"
                        >
                            Edit Data Perusahaan
                        </UButton>
                        <UButton
                            :color="
                                perusahaanData.status_kerjasama
                                    ? 'error'
                                    : 'success'
                            "
                            variant="ghost"
                            :icon="
                                perusahaanData.status_kerjasama
                                    ? 'lucide:building-2'
                                    : 'lucide:building'
                            "
                            class="w-full justify-start"
                        >
                            {{
                                perusahaanData.status_kerjasama
                                    ? "Nonaktifkan"
                                    : "Aktifkan"
                            }}
                            Kerjasama
                        </UButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* Fix z-index for Leaflet */
.leaflet-pane {
    z-index: 10 !important;
}
.leaflet-top {
    z-index: 20 !important;
}
</style>
