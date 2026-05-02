<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePerusahaanApi, type Perusahaan } from "~/composables/api/use-partner";
import "leaflet/dist/leaflet.css";

definePageMeta({
  layout: "admin",
});

type MapStatusFilter = "semua" | "aktif" | "nonaktif";

interface MappedPerusahaan extends Perusahaan {
  latNumber: number;
  lngNumber: number;
  hasRealCoordinate: boolean;
}

const toast = useToast();
const perusahaanApi = usePerusahaanApi();

const loading = ref(true);
const perusahaanItems = ref<Perusahaan[]>([]);
const search = ref("");
const selectedKota = ref("");
const selectedStatus = ref<MapStatusFilter>("semua");
const selectedPerusahaanId = ref("");
const mapElement = ref<HTMLDivElement | null>(null);

let leaflet: any = null;
let mapInstance: any = null;
let markerLayer: any = null;

const defaultCenter: [number, number] = [-6.966667, 110.416664];

const filteredPerusahaan = computed(() => {
  const keyword = search.value.trim().toLowerCase();

  return perusahaanItems.value.filter((item) => {
    const matchKeyword =
      !keyword ||
      [
        item.nama_perusahaan,
        item.alamat,
        item.kabupaten_kota,
        item.provinsi,
        item.bidang_usaha,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    const matchKota = !selectedKota.value || item.kabupaten_kota === selectedKota.value;
    const matchStatus =
      selectedStatus.value === "semua" ||
      (selectedStatus.value === "aktif" && item.status_kerjasama !== false) ||
      (selectedStatus.value === "nonaktif" && item.status_kerjasama === false);

    return matchKeyword && matchKota && matchStatus;
  });
});

function hasCoordinate(item: Perusahaan) {
  const lat = Number(item.latitude);
  const lng = Number(item.longitude);

  return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
}

function getEstimatedCoordinate(item: Perusahaan): [number, number] {
  const source = `${item.id_perusahaan}-${item.nama_perusahaan}-${item.kabupaten_kota || ""}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 100000;
  }

  const radius = 0.025 + (hash % 28) / 1000;
  const angle = ((hash % 360) * Math.PI) / 180;
  const lat = defaultCenter[0] + Math.sin(angle) * radius;
  const lng = defaultCenter[1] + Math.cos(angle) * radius;

  return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
}

const mappedPerusahaan = computed<MappedPerusahaan[]>(() =>
  filteredPerusahaan.value.map((item) => {
    if (hasCoordinate(item)) {
      return {
        ...item,
        latNumber: Number(item.latitude),
        lngNumber: Number(item.longitude),
        hasRealCoordinate: true,
      };
    }

    const [latNumber, lngNumber] = getEstimatedCoordinate(item);

    return {
      ...item,
      latNumber,
      lngNumber,
      hasRealCoordinate: false,
    };
  }),
);

const realCoordinatePerusahaan = computed(() =>
  mappedPerusahaan.value.filter((item) => item.hasRealCoordinate),
);

const estimatedPerusahaan = computed(() =>
  mappedPerusahaan.value.filter((item) => !item.hasRealCoordinate),
);

const kotaOptions = computed(() => {
  const unique = new Set(
    perusahaanItems.value
      .map((item) => item.kabupaten_kota)
      .filter((value): value is string => Boolean(value)),
  );

  return Array.from(unique).sort((a, b) => a.localeCompare(b));
});

const selectedPerusahaan = computed(() =>
  mappedPerusahaan.value.find((item) => item.id_perusahaan === selectedPerusahaanId.value),
);

const stats = computed(() => ({
  total: filteredPerusahaan.value.length,
  titik: realCoordinatePerusahaan.value.length,
  estimasi: estimatedPerusahaan.value.length,
  aktif: filteredPerusahaan.value.filter((item) => item.status_kerjasama !== false).length,
}));

function getStatusLabel(item: Perusahaan) {
  return item.status_kerjasama === false ? "Nonaktif" : "Aktif";
}

function getStatusClass(item: Perusahaan) {
  return item.status_kerjasama === false
    ? "border-rose-100 bg-rose-50 text-rose-700"
    : "border-emerald-100 bg-emerald-50 text-emerald-700";
}

function getCoordinateLabel(item: MappedPerusahaan) {
  return item.hasRealCoordinate ? "Akurat" : "Estimasi";
}

function getCoordinateClass(item: MappedPerusahaan) {
  return item.hasRealCoordinate
    ? "border-blue-100 bg-blue-50 text-blue-700"
    : "border-amber-100 bg-amber-50 text-amber-700";
}

function resetFilters() {
  search.value = "";
  selectedKota.value = "";
  selectedStatus.value = "semua";
  selectedPerusahaanId.value = "";
}

async function loadPerusahaan() {
  loading.value = true;

  try {
    const response = await perusahaanApi.getAll({
      page: 1,
      limit: 1000,
      arsip: false,
    });

    if (!response.success) {
      throw new Error(response.message || "Gagal memuat data tempat PKL");
    }

    perusahaanItems.value = response.data || [];
    await nextTick();
    renderMarkers();
  } catch (error: any) {
    toast.add({
      title: "Gagal memuat maps PKL",
      description: error?.message || "Terjadi kesalahan saat memuat data",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}

async function initMap() {
  if (!import.meta.client || !mapElement.value || mapInstance) return;

  const leafletModule = await import("leaflet");
  leaflet = leafletModule.default || leafletModule;
  mapInstance = leaflet.map(mapElement.value, {
    zoomControl: false,
    scrollWheelZoom: true,
  }).setView(defaultCenter, 10);

  leaflet.control.zoom({ position: "bottomright" }).addTo(mapInstance);

  leaflet
    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    })
    .addTo(mapInstance);

  markerLayer = leaflet.layerGroup().addTo(mapInstance);
  window.setTimeout(() => mapInstance?.invalidateSize(), 150);
  renderMarkers();
}

function renderMarkers() {
  if (!mapInstance || !markerLayer || !leaflet) return;

  mapInstance.invalidateSize();
  markerLayer.clearLayers();

  const bounds: any[] = [];

  mappedPerusahaan.value.forEach((item) => {
    const isSelected = item.id_perusahaan === selectedPerusahaanId.value;
    const color = isSelected
      ? "#2563eb"
      : !item.hasRealCoordinate
        ? "#d97706"
        : item.status_kerjasama === false
          ? "#e11d48"
          : "#059669";
    const marker = leaflet.circleMarker([item.latNumber, item.lngNumber], {
      radius: isSelected ? 12 : item.hasRealCoordinate ? 8 : 9,
      color,
      weight: isSelected ? 4 : 3,
      opacity: 0.95,
      fillColor: color,
      fillOpacity: item.hasRealCoordinate ? 0.78 : 0.55,
      dashArray: item.hasRealCoordinate ? undefined : "6 5",
    });

    marker.bindPopup(`
      <div style="min-width: 220px">
        <strong>${item.nama_perusahaan}</strong>
        <div style="margin-top: 6px; color: ${item.hasRealCoordinate ? "#2563eb" : "#d97706"}; font-weight: 700">${getCoordinateLabel(item)} titik lokasi</div>
        <div style="margin-top: 6px; color: #475569">${item.alamat || "-"}</div>
        <div style="margin-top: 6px; color: #64748b">${item.kabupaten_kota || "-"}${item.provinsi ? `, ${item.provinsi}` : ""}</div>
      </div>
    `);

    marker.on("click", () => {
      selectedPerusahaanId.value = item.id_perusahaan;
    });

    marker.addTo(markerLayer);
    bounds.push([item.latNumber, item.lngNumber]);
  });

  if (bounds.length > 1) {
    mapInstance.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
  } else if (bounds.length === 1) {
    mapInstance.setView(bounds[0], 14);
  } else {
    mapInstance.setView(defaultCenter, 10);
  }
}

function focusPerusahaan(item: MappedPerusahaan) {
  selectedPerusahaanId.value = item.id_perusahaan;

  if (!mapInstance) return;

  mapInstance.setView([item.latNumber, item.lngNumber], 15, {
    animate: true,
  });
}

watch([mappedPerusahaan, selectedPerusahaanId], () => {
  renderMarkers();
});

onMounted(async () => {
  await nextTick();
  await initMap();
  await loadPerusahaan();
});

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markerLayer = null;
  }
});

useHead({
  title: "Maps Tempat PKL | Admin",
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 md:p-6">
    <div class="mx-auto max-w-7xl space-y-6">
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="bg-slate-950 p-6 text-white md:p-8">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-white/10">
                <Icon name="lucide:map" class="h-7 w-7" />
              </div>
              <div>
                <p class="text-[11px] font-black uppercase tracking-widest text-emerald-200">Sebaran Tempat PKL</p>
                <h1 class="mt-2 text-3xl font-black uppercase tracking-tight">Maps Tempat PKL</h1>
                <p class="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                  Pantau titik lokasi mitra PKL, status kerja sama, dan titik estimasi untuk tempat yang belum memiliki koordinat.
                </p>
              </div>
            </div>

            <NuxtLink
              to="/admin/siap-pkl/kelola-tempat"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-500"
            >
              <Icon name="lucide:building-2" class="h-4 w-4" />
              Kelola Tempat
            </NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 md:divide-y-0">
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Mitra</p>
            <p class="mt-1 text-3xl font-black text-slate-900">{{ stats.total }}</p>
          </div>
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Titik Akurat</p>
            <p class="mt-1 text-3xl font-black text-emerald-600">{{ stats.titik }}</p>
          </div>
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Titik Estimasi</p>
            <p class="mt-1 text-3xl font-black text-amber-600">{{ stats.estimasi }}</p>
          </div>
          <div class="p-5">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Kerja Sama Aktif</p>
            <p class="mt-1 text-3xl font-black text-blue-600">{{ stats.aktif }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-center gap-2">
            <Icon name="lucide:filter" class="h-5 w-5 text-emerald-600" />
            <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Filter Lokasi</h2>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
              @click="loadPerusahaan"
            >
              <Icon name="lucide:refresh-cw" class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              @click="resetFilters"
            >
              <Icon name="lucide:rotate-ccw" class="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-[1fr_240px_220px]">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Cari Tempat PKL</label>
            <div class="relative">
              <Icon name="lucide:search" class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Cari nama, bidang, alamat, kota"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Kota</label>
            <select
              v-model="selectedKota"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">Semua kota</option>
              <option v-for="kota in kotaOptions" :key="kota" :value="kota">{{ kota }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
            <select
              v-model="selectedStatus"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="semua">Semua status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>
      </section>

      <section class="maps-content-grid">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 p-5">
            <div class="flex items-center gap-2">
              <Icon name="lucide:map-pinned" class="h-5 w-5 text-emerald-600" />
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Peta Mitra PKL</h2>
            </div>
            <span class="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
              {{ mappedPerusahaan.length }} titik
            </span>
          </div>

          <div class="border-b border-amber-100 bg-amber-50 px-5 py-3">
            <div class="flex items-start gap-2 text-sm font-semibold leading-6 text-amber-800">
              <Icon name="lucide:info" class="mt-0.5 h-4 w-4 shrink-0" />
              Titik amber adalah estimasi visual untuk mitra yang belum punya latitude dan longitude. Lengkapi koordinat di data tempat PKL agar titiknya akurat.
            </div>
          </div>

          <div class="map-shell relative bg-slate-100">
            <div ref="mapElement" class="map-canvas" />
            <div
              v-if="loading"
              class="absolute inset-0 z-[500] flex items-center justify-center bg-white/75 backdrop-blur-sm"
            >
              <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 shadow-sm">
                Memuat maps tempat PKL...
              </div>
            </div>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="lucide:list" class="h-5 w-5 text-blue-600" />
                <h2 class="text-sm font-black uppercase tracking-widest text-slate-700">Lokasi Aktif</h2>
              </div>
              <span class="text-xs font-black text-slate-400">{{ mappedPerusahaan.length }}</span>
            </div>

            <div v-if="mappedPerusahaan.length === 0" class="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <Icon name="lucide:map-pin" class="mx-auto h-9 w-9 text-slate-300" />
              <p class="mt-3 text-sm font-black text-slate-700">Belum ada titik maps</p>
              <p class="mt-1 text-sm font-medium text-slate-400">Lengkapi latitude dan longitude di data tempat PKL.</p>
            </div>

            <div v-else class="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              <button
                v-for="item in mappedPerusahaan"
                :key="item.id_perusahaan"
                type="button"
                class="w-full rounded-xl border p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
                :class="selectedPerusahaanId === item.id_perusahaan ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-slate-50'"
                @click="focusPerusahaan(item)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-black text-slate-900">{{ item.nama_perusahaan }}</p>
                    <p class="mt-1 text-xs font-bold text-slate-500">
                      {{ item.kabupaten_kota || "Kota belum diisi" }}
                    </p>
                  </div>
                  <span
                    class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                    :class="getStatusClass(item)"
                  >
                    {{ getStatusLabel(item) }}
                  </span>
                </div>
                <p class="mt-3 text-sm font-medium leading-6 text-slate-500">{{ item.alamat || "Alamat belum diisi" }}</p>
                <span
                  class="mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                  :class="getCoordinateClass(item)"
                >
                  {{ getCoordinateLabel(item) }}
                </span>
              </button>
            </div>
          </div>

          <div v-if="selectedPerusahaan" class="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div class="mb-3 flex items-center gap-2 text-blue-700">
              <Icon name="lucide:building-2" class="h-5 w-5" />
              <h2 class="text-sm font-black uppercase tracking-widest">Detail Titik</h2>
            </div>
            <p class="font-black text-blue-950">{{ selectedPerusahaan.nama_perusahaan }}</p>
            <p class="mt-2 text-sm font-semibold leading-6 text-blue-800">{{ selectedPerusahaan.alamat || "-" }}</p>
            <span
              class="mt-3 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest"
              :class="getCoordinateClass(selectedPerusahaan)"
            >
              {{ getCoordinateLabel(selectedPerusahaan) }}
            </span>
            <div class="mt-4 grid grid-cols-2 gap-3 text-xs font-black text-blue-900">
              <div class="rounded-xl bg-white/70 p-3">
                <p class="text-[10px] uppercase tracking-widest text-blue-400">Latitude</p>
                <p class="mt-1">{{ selectedPerusahaan.latNumber }}</p>
              </div>
              <div class="rounded-xl bg-white/70 p-3">
                <p class="text-[10px] uppercase tracking-widest text-blue-400">Longitude</p>
                <p class="mt-1">{{ selectedPerusahaan.lngNumber }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-amber-700">
                <Icon name="lucide:map-pin" class="h-5 w-5" />
                <h2 class="text-sm font-black uppercase tracking-widest">Titik Estimasi</h2>
              </div>
              <span class="text-sm font-black text-amber-800">{{ estimatedPerusahaan.length }}</span>
            </div>

            <div v-if="estimatedPerusahaan.length === 0" class="text-sm font-semibold text-amber-800">
              Semua data pada filter ini sudah memiliki koordinat.
            </div>
            <div v-else class="max-h-[190px] space-y-2 overflow-y-auto pr-1">
              <button
                v-for="item in estimatedPerusahaan"
                :key="item.id_perusahaan"
                type="button"
                class="w-full rounded-xl bg-white/70 p-3 text-left transition hover:bg-white"
                @click="focusPerusahaan(item)"
              >
                <p class="text-sm font-black text-amber-950">{{ item.nama_perusahaan }}</p>
                <p class="mt-1 text-xs font-bold text-amber-700">{{ item.kabupaten_kota || "Kota belum diisi" }}</p>
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<style scoped>
.maps-content-grid {
  display: grid;
  gap: 1.5rem;
}

.map-shell {
  height: 520px;
  min-height: 520px;
  overflow: hidden;
}

.map-canvas {
  display: block;
  height: 100%;
  min-height: 520px;
  width: 100%;
}

@media (min-width: 1280px) {
  .maps-content-grid {
    align-items: start;
    grid-template-columns: minmax(0, 1fr) 380px;
  }
}

:deep(.leaflet-container) {
  font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  height: 100%;
  min-height: 520px;
  width: 100%;
}
</style>
