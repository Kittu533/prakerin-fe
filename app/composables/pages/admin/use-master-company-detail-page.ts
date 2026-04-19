import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { Map, Marker, TileLayer, type LatLngExpression } from "leaflet";
import { usePerusahaanApi, type Perusahaan } from "~/composables/api/use-partner";

export function useMasterCompanyDetailPage() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const perusahaanApi = usePerusahaanApi();

  const id = computed(() => route.params.id as string);
  const loading = ref(true);
  const isMapInitialized = ref(false);
  const perusahaanData = ref<Perusahaan | null>(null);

  const mapContainer = ref<HTMLDivElement | null>(null);
  let map: Map | null = null;
  let tileLayer: TileLayer | null = null;
  let marker: Marker | null = null;

  async function initMap() {
    if (isMapInitialized.value || !mapContainer.value) return;

    await nextTick();
    if (!mapContainer.value) return;

    try {
      const defaultCenter: LatLngExpression = [-2.5489, 118.0149];
      const defaultZoom = 5;

      map = new Map(mapContainer.value, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView(defaultCenter, defaultZoom);

      tileLayer = new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      if (perusahaanData.value?.latitude && perusahaanData.value?.longitude) {
        const latLng: LatLngExpression = [perusahaanData.value.latitude, perusahaanData.value.longitude];
        map.setView(latLng, 15);
        marker = new Marker(latLng, { interactive: false }).addTo(map);
      }

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
        toast.add({ title: "Data tidak ditemukan", color: "error" });
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
    await initMap();
  });

  onUnmounted(() => {
    cleanupMap();
  });

  useHead({ title: "Detail Perusahaan | Admin" });

  return {
    loading,
    isMapInitialized,
    perusahaanData,
    mapContainer,
    navigateToEdit,
    handleBack,
    formatDate,
  };
}
