import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { Map, Marker, TileLayer, type LatLngExpression } from "leaflet";
import { usePerusahaanApi } from "~/composables/api/use-partner";
import { reverseGeocode, searchLocation, type SearchResult } from "~/composables/useGeocoding";

export function useMasterCompanyCreatePage() {
  const router = useRouter();
  const toast = useToast();
  const perusahaanApi = usePerusahaanApi();

  const submitting = ref(false);
  const isMapInitialized = ref(false);
  const isFetchingAddress = ref(false);

  const searchQuery = ref("");
  const searchResults = ref<SearchResult[]>([]);
  const isSearching = ref(false);
  const showSearchResults = ref(false);
  const searchInputRef = ref<HTMLInputElement | null>(null);

  const mapContainer = ref<HTMLDivElement | null>(null);
  let map: Map | null = null;
  let tileLayer: TileLayer | null = null;
  let marker: Marker | null = null;

  const form = reactive({
    nama_perusahaan: "",
    jalan: "",
    desa: "",
    kecamatan: "",
    kelurahan: "",
    kabupaten_kota: "",
    provinsi: "",
    kode_pos: "",
    alamat: "",
    no_hp: "",
    email: "",
    bidang_usaha: "",
    kapasitas_siswa: 10,
    latitude: null as number | null,
    longitude: null as number | null,
  });

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

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(searchQuery, (newQuery) => {
    if (!newQuery?.trim()) {
      searchResults.value = [];
      showSearchResults.value = false;
      return;
    }

    isSearching.value = true;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

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

    if (map) {
      const latLng: LatLngExpression = [lat, lng];
      map.setView(latLng, 16);

      if (marker) {
        marker.setLatLng(latLng);
      } else {
        marker = new Marker(latLng).addTo(map);
      }
    }

    searchQuery.value = result.display_name.split(",")[0];
    searchResults.value = [];
    showSearchResults.value = false;

    await fetchAddressFromCoordinates(lat, lng);
  }

  function clearSearch() {
    searchQuery.value = "";
    searchResults.value = [];
    showSearchResults.value = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (searchInputRef.value && !searchInputRef.value.contains(event.target as Node)) {
      showSearchResults.value = false;
    }
  }

  async function fetchAddressFromCoordinates(lat: number, lng: number) {
    isFetchingAddress.value = true;

    try {
      const addressData = await reverseGeocode(lat, lng);

      if (addressData) {
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

  async function initMap() {
    if (isMapInitialized.value || !mapContainer.value) return;

    await nextTick();
    if (!mapContainer.value) return;

    try {
      const defaultCenter: LatLngExpression = [-2.5489, 118.0149];
      const defaultZoom = 5;

      map = new Map(mapContainer.value, {
        zoomControl: true,
      }).setView(defaultCenter, defaultZoom);

      tileLayer = new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const onMapClick = async (e: any) => {
        const { lat, lng } = e.latlng;
        form.latitude = parseFloat(lat.toFixed(6));
        form.longitude = parseFloat(lng.toFixed(6));

        if (marker) {
          marker.setLatLng(e.latlng);
        } else {
          marker = new Marker(e.latlng).addTo(map as Map);
        }

        await fetchAddressFromCoordinates(form.latitude, form.longitude);
      };

      map.on("click", onMapClick);

      requestAnimationFrame(() => {
        map?.invalidateSize();
      });

      isMapInitialized.value = true;
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }
  }

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

          await fetchAddressFromCoordinates(form.latitude, form.longitude);

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
    if (!form.nama_perusahaan) {
      toast.add({ title: "Nama perusahaan wajib diisi", color: "error" });
      return;
    }

    submitting.value = true;
    try {
      const payload: Record<string, unknown> = {
        nama_perusahaan: form.nama_perusahaan,
        alamat: fullAddress.value || undefined,
        no_hp: form.no_hp || undefined,
        email: form.email || undefined,
        bidang_usaha: form.bidang_usaha || undefined,
        kapasitas_siswa: form.kapasitas_siswa || 10,
      };

      if (form.jalan) payload.jalan = form.jalan;
      if (form.desa) payload.desa = form.desa;
      if (form.kecamatan) payload.kecamatan = form.kecamatan;
      if (form.kelurahan) payload.kelurahan = form.kelurahan;
      if (form.kabupaten_kota) payload.kabupaten_kota = form.kabupaten_kota;
      if (form.provinsi) payload.provinsi = form.provinsi;
      if (form.kode_pos) payload.kode_pos = form.kode_pos;

      if (form.latitude !== null && form.longitude !== null) {
        payload.latitude = form.latitude;
        payload.longitude = form.longitude;
      }

      const response = await perusahaanApi.create(payload as any);

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
    void initMap();
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

  return {
    submitting,
    isMapInitialized,
    isFetchingAddress,
    searchQuery,
    searchResults,
    isSearching,
    showSearchResults,
    searchInputRef,
    mapContainer,
    form,
    fullAddress,
    selectSearchResult,
    clearSearch,
    getCurrentLocation,
    handleSubmit,
    handleCancel,
  };
}
