import { computed, onMounted, ref, watch } from "vue";
import { usePerusahaanApi, type Perusahaan, type PerusahaanStats } from "~/composables/api/use-partner";
import { useSweetAlert } from "~/composables/use-sweet-alert";

const DEFAULT_FILTER_KOTA = "Semua Kota";
const DEFAULT_FILTER_PROVINSI = "Semua Provinsi";
const DEFAULT_FILTER_BIDANG = "Semua Bidang";
const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

interface ArsipRow {
  id: string;
  nama: string;
  bidang: string;
  kota: string;
  provinsi: string;
  alamat: string;
  noHp: string | null;
}

interface ArsipFilters {
  nama: string;
  alamat: string;
  kota: string;
  provinsi: string;
  bidang: string;
  page: number;
  limit: number;
}

interface ArsipStats {
  totalMitra: number;
  bidang: Array<{ label: string; count: number }>;
  provinsi: Array<{ label: string; count: number }>;
  kota: Array<{ label: string; count: number }>;
}

export function useMitraDudiArchivePage() {
  const router = useRouter();
  const { getAll, getStats, restore } = usePerusahaanApi();
  const { showConfirmation, showError, showSuccess } = useSweetAlert();

  const loading = ref(false);
  const restoringId = ref<string | null>(null);

  const filters = ref<ArsipFilters>(createDefaultFilters());
  const data = ref<ArsipRow[]>([]);
  const stats = ref<ArsipStats>(createDefaultStats());

  const pagination = ref({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const provinceOptions = computed(() => [
    DEFAULT_FILTER_PROVINSI,
    ...stats.value.provinsi.map((item) => item.label),
  ]);

  const kotaOptions = computed(() => [
    DEFAULT_FILTER_KOTA,
    ...stats.value.kota.map((item) => item.label),
  ]);

  const bidangOptions = computed(() => [
    DEFAULT_FILTER_BIDANG,
    ...stats.value.bidang.map((item) => item.label),
  ]);

  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    () => [filters.value.nama, filters.value.alamat],
    () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      searchTimer = setTimeout(() => {
        filters.value.page = 1;
        void fetchData();
        void fetchStats();
      }, SEARCH_DEBOUNCE_MS);
    },
  );

  watch(
    () => [filters.value.kota, filters.value.provinsi, filters.value.bidang],
    () => {
      filters.value.page = 1;
      void fetchData();
      void fetchStats();
    },
  );

  onMounted(async () => {
    await Promise.all([fetchData(), fetchStats()]);
  });

  function createDefaultFilters(): ArsipFilters {
    return {
      nama: "",
      alamat: "",
      kota: DEFAULT_FILTER_KOTA,
      provinsi: DEFAULT_FILTER_PROVINSI,
      bidang: DEFAULT_FILTER_BIDANG,
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    };
  }

  function createDefaultStats(): ArsipStats {
    return {
      totalMitra: 0,
      bidang: [],
      provinsi: [],
      kota: [],
    };
  }

  function normalizeFilterValue(value: string, defaultValue: string) {
    return value === defaultValue ? undefined : value;
  }

  function mapPerusahaanToRow(perusahaan: Perusahaan): ArsipRow {
    return {
      id: perusahaan.id_perusahaan,
      nama: perusahaan.nama_perusahaan,
      bidang: perusahaan.bidang_usaha || "-",
      kota: perusahaan.kabupaten_kota || "-",
      provinsi: perusahaan.provinsi || "-",
      alamat: perusahaan.alamat || "-",
      noHp: perusahaan.no_hp || null,
    };
  }

  function mapStatsPayload(payload: PerusahaanStats): ArsipStats {
    return {
      totalMitra: payload.total,
      bidang: payload.bidang,
      provinsi: payload.provinsi,
      kota: payload.kota,
    };
  }

  async function fetchData() {
    loading.value = true;
    try {
      const response = await getAll({
        page: filters.value.page,
        limit: filters.value.limit,
        nama: filters.value.nama || undefined,
        alamat: filters.value.alamat || undefined,
        kota: normalizeFilterValue(filters.value.kota, DEFAULT_FILTER_KOTA),
        provinsi: normalizeFilterValue(filters.value.provinsi, DEFAULT_FILTER_PROVINSI),
        bidang_usaha: normalizeFilterValue(filters.value.bidang, DEFAULT_FILTER_BIDANG),
        arsip: true,
      });

      const rows = response.data || [];
      data.value = rows.map(mapPerusahaanToRow);
      pagination.value.page = response.meta?.page || pagination.value.page;
      pagination.value.limit = response.meta?.limit || pagination.value.limit;
      pagination.value.total = response.meta?.total || rows.length;
      pagination.value.totalPages = response.meta?.totalPages || 1;
    } catch (error) {
      console.error("[MitraDudiArchive] Failed to fetch archive data", error);
      data.value = [];
      pagination.value.total = 0;
      pagination.value.totalPages = 1;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    try {
      const response = await getStats({
        nama: filters.value.nama || undefined,
        alamat: filters.value.alamat || undefined,
        kota: normalizeFilterValue(filters.value.kota, DEFAULT_FILTER_KOTA),
        provinsi: normalizeFilterValue(filters.value.provinsi, DEFAULT_FILTER_PROVINSI),
        bidang_usaha: normalizeFilterValue(filters.value.bidang, DEFAULT_FILTER_BIDANG),
        arsip: true,
      });

      stats.value = mapStatsPayload(response.data);
    } catch (error) {
      console.error("[MitraDudiArchive] Failed to fetch archive stats", error);
      stats.value = createDefaultStats();
    }
  }

  async function handleRestore(id: string, nama: string) {
    const confirmed = await showConfirmation(
      "Aktifkan Kembali Mitra?",
      `Data ${nama} akan dikembalikan ke daftar aktif.`,
      {
        confirmButtonText: "Ya, Aktifkan",
        cancelButtonText: "Batal",
      },
    );

    if (!confirmed.isConfirmed) return;

    restoringId.value = id;
    try {
      const response = await restore(id);
      if (!response.success) {
        await showError("Gagal mengaktifkan", response.message || "Silakan coba lagi.");
        return;
      }

      await showSuccess("Berhasil", "Mitra berhasil diaktifkan kembali.", { timer: 1800 });
      await Promise.all([fetchData(), fetchStats()]);
    } catch (error) {
      console.error("[MitraDudiArchive] Failed to restore perusahaan", error);
      await showError("Gagal mengaktifkan", "Terjadi kesalahan saat mengaktifkan mitra.");
    } finally {
      restoringId.value = null;
    }
  }

  function goToActivePage() {
    router.push("/admin/mitra/dudi");
  }

  async function changePage(page: number) {
    if (page < 1 || page > pagination.value.totalPages || page === filters.value.page) {
      return;
    }

    filters.value.page = page;
    await fetchData();
  }

  return {
    loading,
    restoringId,
    filters,
    data,
    stats,
    pagination,
    provinceOptions,
    kotaOptions,
    bidangOptions,
    handleRestore,
    goToActivePage,
    changePage,
  };
}
