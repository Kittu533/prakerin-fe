<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { usePerusahaanApi } from "~/composables/api/use-partner";
import {
    reverseGeocode,
    searchLocation,
    type AddressDetails,
    type SearchResult,
} from "~/composables/useGeocoding";
import { Map, TileLayer, Marker, type LatLngExpression } from "leaflet";

definePageMeta({ layout: "admin" });

const router = useRouter();
const toast = useToast();
const perusahaanApi = usePerusahaanApi();

const submitting = ref(false);
const isMapInitialized = ref(false);
const isFetchingAddress = ref(false);

// Search state
const searchQuery = ref("");
const searchResults = ref<SearchResult[]>([]);
const isSearching = ref(false);
const showSearchResults = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);

// Map refs
const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
let tileLayer: TileLayer | null = null;
let marker: Marker | null = null;

const form = reactive({
    nama_perusahaan: "",
    // Detail alamat
    jalan: "",
    desa: "",
    kecamatan: "",
    kelurahan: "",
    kabupaten_kota: "",
    provinsi: "",
    kode_pos: "",
    // Alamat lengkap (read-only, generated)
    alamat: "",
    // Kontak
    no_hp: "",
    email: "",
    // Info perusahaan
    bidang_usaha: "",
    kapasitas_siswa: 10,
    // Koordinat
    latitude: null as number | null,
    longitude: null as number | null,
});

// Generate alamat lengkap from components
const fullAddress = computed(() => {
    const parts: string[] = [];
    if (form.jalan) parts.push(form.jalan);
    if (form.kelurahan) parts.push(`Kel. ${form.kelurahan}`);
    if (form.kecamatan) parts.push(`Kec. ${form.kecamatan}`);
    if (form.kabupaten_kota) parts.push(form.kabupaten_kota);
    if (form.provinsi) parts.push(form.provinsi);
    if (form.kode_pos) parts.push(form.kode_pos);
    return parts.join(", ") || "";
});

// Debounce search function
let searchTimeout: NodeJS.Timeout | null = null;

// Watch search query and perform search
watch(searchQuery, (newQuery) => {
    if (!newQuery?.trim()) {
        searchResults.value = [];
        showSearchResults.value = false;
        return;
    }

    isSearching.value = true;

    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Debounce search
    searchTimeout = setTimeout(async () => {
        const results = await searchLocation(newQuery);
        searchResults.value = results;
        showSearchResults.value = results.length > 0;
        isSearching.value = false;
    }, 500);
});

async function selectSearchResult(result: SearchResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    form.latitude = parseFloat(lat.toFixed(6));
    form.longitude = parseFloat(lng.toFixed(6));

    // Pan map to location
    if (map) {
        const latLng: LatLngExpression = [lat, lng];
        map.setView(latLng, 16);

        if (marker) {
            marker.setLatLng(latLng);
        } else {
            marker = new Marker(latLng).addTo(map);
        }
    }

    // Clear search
    searchQuery.value = result.display_name.split(",")[0]; // Show short name
    searchResults.value = [];
    showSearchResults.value = false;

    // Fetch address from coordinates
    await fetchAddressFromCoordinates(lat, lng);
}

function clearSearch() {
    searchQuery.value = "";
    searchResults.value = [];
    showSearchResults.value = false;
}

// Close search results when clicking outside
function handleClickOutside(event: MouseEvent) {
    if (
        searchInputRef.value &&
        !searchInputRef.value.contains(event.target as Node)
    ) {
        showSearchResults.value = false;
    }
}

/**
 * Fetch address from coordinates using reverse geocoding
 */
async function fetchAddressFromCoordinates(lat: number, lng: number) {
    isFetchingAddress.value = true;

    try {
        const addressData = await reverseGeocode(lat, lng);

        if (addressData) {
            // Update form dengan data alamat dari geocoding
            form.jalan = addressData.jalan || "";
            form.desa = addressData.desa || "";
            form.kecamatan = addressData.kecamatan || "";
            form.kelurahan = addressData.kelurahan || "";
            form.kabupaten_kota = addressData.kabupaten_kota || "";
            form.provinsi = addressData.provinsi || "";
            form.kode_pos = addressData.kode_pos || "";

            toast.add({
                title: "Alamat berhasil ditemukan",
                description: "Data alamat telah diisi otomatis",
                color: "success",
            });
        } else {
            toast.add({
                title: "Gagal mendapatkan alamat",
                description: "Silakan isi alamat secara manual",
                color: "warning",
            });
        }
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        toast.add({
            title: "Gagal mendapatkan alamat",
            description: "Terjadi kesalahan saat mengambil data alamat",
            color: "error",
        });
    } finally {
        isFetchingAddress.value = false;
    }
}

// Initialize map
async function initMap() {
    if (isMapInitialized.value || !mapContainer.value) return;

    // Wait for DOM to be ready
    await nextTick();

    if (!mapContainer.value) return;

    try {
        // Default center (Indonesia)
        const defaultCenter: LatLngExpression = [-2.5489, 118.0149];
        const defaultZoom = 5;

        // Create map instance with Leaflet 2.0 constructor style
        map = new Map(mapContainer.value, {
            zoomControl: true,
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

        // Click handler to set marker and fetch address
        const onMapClick = async (e: any) => {
            const { lat, lng } = e.latlng;
            form.latitude = parseFloat(lat.toFixed(6));
            form.longitude = parseFloat(lng.toFixed(6));

            if (marker) {
                marker.setLatLng(e.latlng);
            } else {
                marker = new Marker(e.latlng).addTo(map);
            }

            // Fetch address dari koordinat
            await fetchAddressFromCoordinates(form.latitude, form.longitude);
        };

        map.on("click", onMapClick);

        // Invalidate size after initialization to ensure proper rendering
        requestAnimationFrame(() => {
            map?.invalidateSize();
        });

        isMapInitialized.value = true;
    } catch (error) {
        console.error("Failed to initialize map:", error);
    }
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                form.latitude = parseFloat(latitude.toFixed(6));
                form.longitude = parseFloat(longitude.toFixed(6));

                if (map) {
                    const latLng: LatLngExpression = [latitude, longitude];
                    map.setView(latLng, 15);
                    if (marker) {
                        marker.setLatLng(latLng);
                    } else {
                        marker = new Marker(latLng).addTo(map);
                    }
                }

                // Fetch address dari koordinat
                await fetchAddressFromCoordinates(
                    form.latitude,
                    form.longitude,
                );

                toast.add({
                    title: "Lokasi berhasil ditemukan",
                    color: "success",
                });
            },
            (error) => {
                toast.add({
                    title: "Gagal mendapatkan lokasi",
                    color: "error",
                });
                console.error("Geolocation error:", error);
            },
        );
    } else {
        toast.add({
            title: "Browser tidak mendukung geolokasi",
            color: "error",
        });
    }
}

// Clean up map
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

async function handleSubmit() {
    // Validasi
    if (!form.nama_perusahaan) {
        toast.add({ title: "Nama perusahaan wajib diisi", color: "error" });
        return;
    }

    submitting.value = true;
    try {
        const payload: any = {
            nama_perusahaan: form.nama_perusahaan,
            alamat: fullAddress.value || undefined,
            no_hp: form.no_hp || undefined,
            email: form.email || undefined,
            bidang_usaha: form.bidang_usaha || undefined,
            kapasitas_siswa: form.kapasitas_siswa || 10,
        };

        // Add detail alamat
        if (form.jalan) payload.jalan = form.jalan;
        if (form.desa) payload.desa = form.desa;
        if (form.kecamatan) payload.kecamatan = form.kecamatan;
        if (form.kelurahan) payload.kelurahan = form.kelurahan;
        if (form.kabupaten_kota) payload.kabupaten_kota = form.kabupaten_kota;
        if (form.provinsi) payload.provinsi = form.provinsi;
        if (form.kode_pos) payload.kode_pos = form.kode_pos;

        // Add coordinates if set
        if (form.latitude !== null && form.longitude !== null) {
            payload.latitude = form.latitude;
            payload.longitude = form.longitude;
        }

        const response = await perusahaanApi.create(payload);

        if (response.success) {
            toast.add({
                title: "Perusahaan berhasil ditambahkan",
                color: "success",
            });
            cleanupMap();
            router.push("/admin/master/companies");
        } else {
            toast.add({
                title: "Gagal menambahkan perusahaan",
                description: response.message || "Terjadi kesalahan",
                color: "error",
            });
        }
    } catch (error: any) {
        toast.add({
            title: "Terjadi kesalahan",
            description: error.message || "Silakan coba lagi",
            color: "error",
        });
    } finally {
        submitting.value = false;
    }
}

function handleCancel() {
    cleanupMap();
    router.push("/admin/master/companies");
}

onMounted(() => {
    initMap();
    // Add click outside listener for search
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    cleanupMap();
    document.removeEventListener("click", handleClickOutside);
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
});

useHead({ title: "Tambah Perusahaan | Admin" });
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
                @click="handleCancel"
            >
                Kembali
            </UButton>
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Tambah Perusahaan
                </h1>
                <p class="text-sm text-slate-500 mt-0.5">
                    Tambah data perusahaan mitra baru
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
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

                    <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
                        <!-- Nama Perusahaan -->
                        <div class="w-full">
                            <label
                                class="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Nama Perusahaan
                                <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="form.nama_perusahaan"
                                placeholder="PT. Contoh Indonesia"
                                size="lg"
                                class="w-full"
                                required
                            />
                        </div>

                        <!-- Email & No HP -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email
                                </label>
                                <UInput
                                    v-model="form.email"
                                    type="email"
                                    placeholder="info@company.com"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    No. HP
                                </label>
                                <UInput
                                    v-model="form.no_hp"
                                    type="tel"
                                    placeholder="08xxx"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Bidang Usaha & Kapasitas -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Bidang Usaha
                                </label>
                                <UInput
                                    v-model="form.bidang_usaha"
                                    placeholder="IT & Software"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kapasitas Siswa
                                </label>
                                <UInput
                                    v-model.number="form.kapasitas_siswa"
                                    type="number"
                                    min="1"
                                    placeholder="10"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Alamat Lengkap -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Alamat Lengkap
                        </h3>
                        <UBadge
                            v-if="isFetchingAddress"
                            color="neutral"
                            variant="subtle"
                            size="sm"
                        >
                            <Icon
                                name="lucide:loader-2"
                                class="w-3 h-3 mr-1 animate-spin"
                            />
                            Mengambil alamat...
                        </UBadge>
                    </div>

                    <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
                        <!-- Provinsi & Kabupaten/Kota -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Provinsi
                                </label>
                                <UInput
                                    v-model="form.provinsi"
                                    placeholder="Jawa Barat"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kabupaten/Kota
                                </label>
                                <UInput
                                    v-model="form.kabupaten_kota"
                                    placeholder="Bandung"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Kecamatan & Kelurahan -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kecamatan
                                </label>
                                <UInput
                                    v-model="form.kecamatan"
                                    placeholder="Coblong"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div class="w-full">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kelurahan/Desa
                                </label>
                                <UInput
                                    v-model="form.kelurahan"
                                    placeholder="Dago"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Jalan & Kode Pos -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="md:col-span-2">
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Nama Jalan
                                </label>
                                <UInput
                                    v-model="form.jalan"
                                    placeholder="Jl. Ir. H. Juanda No. 123"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Kode Pos
                                </label>
                                <UInput
                                    v-model="form.kode_pos"
                                    placeholder="40135"
                                    size="lg"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Preview Alamat Lengkap -->
                        <div
                            v-if="fullAddress"
                            class="p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                            <p class="text-xs text-slate-500 mb-1">
                                Preview Alamat Lengkap
                            </p>
                            <p class="text-sm font-medium text-slate-900">
                                {{ fullAddress }}
                            </p>
                        </div>
                    </form>
                </div>

                <!-- Lokasi Peta -->
                <div
                    class="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                    <div
                        class="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                        <h3
                            class="font-semibold text-slate-900 text-sm uppercase tracking-wide"
                        >
                            Lokasi di Peta
                        </h3>
                        <UButton
                            size="xs"
                            color="neutral"
                            variant="ghost"
                            @click="getCurrentLocation"
                        >
                            <Icon
                                name="lucide:crosshair"
                                class="w-3 h-3 mr-1"
                            />
                            Lokasi Saya
                        </UButton>
                    </div>

                    <div class="p-5 space-y-4">
                        <p class="text-sm text-slate-500">
                            Klik pada peta untuk menentukan lokasi dan mengisi
                            alamat otomatis, atau cari lokasi by name
                        </p>

                        <!-- Search Input -->
                        <div class="relative" ref="searchInputRef">
                            <div class="relative">
                                <UInput
                                    v-model="searchQuery"
                                    placeholder="Cari lokasi (contoh: UTY, Universitas Teknologi Yogyakarta)"
                                    size="lg"
                                    class="w-full pr-10"
                                >
                                    <template #trailing>
                                        <button
                                            v-if="searchQuery"
                                            @click="clearSearch"
                                            class="p-1 hover:bg-slate-100 rounded"
                                        >
                                            <Icon
                                                name="lucide:x"
                                                class="w-4 h-4 text-slate-400"
                                            />
                                        </button>
                                        <Icon
                                            v-else
                                            name="lucide:search"
                                            class="w-4 h-4 text-slate-400"
                                        />
                                    </template>
                                </UInput>
                                <div
                                    v-if="isSearching"
                                    class="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <Icon
                                        name="lucide:loader-2"
                                        class="w-4 h-4 text-slate-400 animate-spin"
                                    />
                                </div>
                            </div>

                            <!-- Search Results Dropdown -->
                            <div
                                v-if="
                                    showSearchResults &&
                                    searchResults.length > 0
                                "
                                class="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg max-h-64 overflow-y-auto"
                            >
                                <div
                                    v-for="result in searchResults"
                                    :key="result.place_id"
                                    @click="selectSearchResult(result)"
                                    class="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                >
                                    <p
                                        class="text-sm font-medium text-slate-900 truncate"
                                    >
                                        {{ result.display_name.split(",")[0] }}
                                    </p>
                                    <p
                                        class="text-xs text-slate-500 truncate mt-0.5"
                                    >
                                        {{ result.display_name }}
                                    </p>
                                </div>
                            </div>

                            <!-- No Results -->
                            <div
                                v-if="
                                    showSearchResults &&
                                    searchResults.length === 0 &&
                                    !isSearching
                                "
                                class="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg p-3"
                            >
                                <p class="text-sm text-slate-500 text-center">
                                    Tidak ada hasil ditemukan
                                </p>
                            </div>
                        </div>

                        <div class="relative">
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
                                    {{ form.latitude || "-" }}
                                </p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-500 mb-1">
                                    Longitude
                                </p>
                                <p
                                    class="text-sm font-mono font-medium text-slate-900"
                                >
                                    {{ form.longitude || "-" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar Info -->
            <div class="lg:col-span-1">
                <div
                    class="bg-blue-50 border border-blue-200 rounded-xl p-4 sticky top-6"
                >
                    <div class="flex gap-3">
                        <Icon
                            name="lucide:info"
                            class="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                        />
                        <div class="text-sm text-blue-900">
                            <p class="font-semibold mb-2">Informasi:</p>
                            <ul class="space-y-1.5">
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:search"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Cari lokasi dengan mengetik nama tempat
                                        (contoh: UTY, Malioboro)</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:map-pin"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Klik pada peta untuk menentukan lokasi
                                        dan mengisi alamat otomatis</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:crosshair"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Gunakan tombol "Lokasi Saya" untuk
                                        mendeteksi lokasi otomatis</span
                                    >
                                </li>
                                <li class="flex items-start gap-2">
                                    <Icon
                                        name="lucide:edit"
                                        class="w-4 h-4 mt-0.5 shrink-0"
                                    />
                                    <span
                                        >Data alamat dapat diedit secara
                                        manual</span
                                    >
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div
            class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200"
        >
            <UButton
                variant="outline"
                color="neutral"
                size="lg"
                @click="handleCancel"
            >
                Batal
            </UButton>
            <UButton
                color="primary"
                size="lg"
                :loading="submitting"
                @click="handleSubmit"
            >
                <Icon name="lucide:check" class="w-4 h-4" />
                Simpan Perusahaan
            </UButton>
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
