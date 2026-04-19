import { computed, onMounted, ref, watch } from "vue";
import {
  usePerusahaanApi,
  type Perusahaan,
  type PerusahaanStats,
} from "~/composables/api/use-partner";
import { useSweetAlert } from "~/composables/use-sweet-alert";

const DEFAULT_FILTER_KOTA = "Semua Kota";
const DEFAULT_FILTER_PROVINSI = "Semua Provinsi";
const DEFAULT_FILTER_BIDANG = "Semua Bidang";
const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

interface IndustriRow {
  id: string;
  nama: string;
  bidang: string;
  kota: string;
  provinsi: string;
  alamat: string;
  kk: string[];
  pic: string | null;
  maps: string;
  noHp: string | null;
}

interface DudiFilters {
  nama: string;
  alamat: string;
  kota: string;
  provinsi: string;
  bidang: string;
  page: number;
  limit: number;
}

interface DudiForm {
  nama_perusahaan: string;
  bidang_usaha: string;
  keterangan: string;
  kompetensi_keahlian: string;
  kabupaten_kota: string;
  provinsi: string;
  alamat: string;
  no_hp: string;
  maps: string;
  pic_nama: string;
  pic_wa: string;
}

type DudiFormErrors = Partial<Record<keyof DudiForm, string>>;

interface DudiStats {
  totalMitra: number;
  totalJenisIndustri: number;
  totalKabupaten: number;
  totalProvinsi: number;
  bidang: Array<{ label: string; count: number }>;
  provinsi: Array<{ label: string; count: number }>;
  kota: Array<{ label: string; count: number }>;
}

export function useMitraDudiPage() {
  const router = useRouter();
  const { getAll, getStats, getById, create, update, remove } = usePerusahaanApi();
  const { showConfirmation, showError, showSuccess, showWarning } = useSweetAlert();

  const loading = ref(false);
  const saving = ref(false);
  const deletingId = ref<string | null>(null);
  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const selectedId = ref<string | null>(null);

  const filters = ref<DudiFilters>(createDefaultFilters());
  const form = ref<DudiForm>(createDefaultForm());
  const formErrors = ref<DudiFormErrors>({});

  const industriData = ref<IndustriRow[]>([]);
  const stats = ref<DudiStats>(createDefaultStats());
  const perusahaanMap = ref<Record<string, Perusahaan>>({});

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

  const modalTitle = computed(() =>
    isEditing.value ? "Edit Mitra Industri" : "Tambah Mitra Industri",
  );

  const modalDescription = computed(() =>
    isEditing.value
      ? "Perbarui data mitra industri yang sudah terdaftar"
      : "Formulir untuk menambahkan data mitra industri baru",
  );

  const submitButtonLabel = computed(() =>
    isEditing.value ? "SIMPAN PERUBAHAN" : "SIMPAN DATA",
  );

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

  function createDefaultFilters(): DudiFilters {
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

  function createDefaultForm(): DudiForm {
    return {
      nama_perusahaan: "",
      bidang_usaha: "",
      keterangan: "PKL",
      kompetensi_keahlian: "",
      kabupaten_kota: "",
      provinsi: "",
      alamat: "",
      no_hp: "",
      maps: "",
      pic_nama: "",
      pic_wa: "",
    };
  }

  function createDefaultStats(): DudiStats {
    return {
      totalMitra: 0,
      totalJenisIndustri: 0,
      totalKabupaten: 0,
      totalProvinsi: 0,
      bidang: [],
      provinsi: [],
      kota: [],
    };
  }

  function normalizeFilterValue(value: string, defaultValue: string) {
    return value === defaultValue ? undefined : value;
  }

  function splitMultiValue(value?: string | null) {
    if (!value) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function buildMapLink(perusahaan: Perusahaan) {
    const addressParts = [
      perusahaan.alamat,
      perusahaan.kabupaten_kota,
      perusahaan.provinsi,
    ]
      .map((item) => (item || "").trim())
      .filter(Boolean)
      .join(", ");

    return addressParts
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressParts)}`
      : "";
  }

  function mapPerusahaanToRow(perusahaan: Perusahaan): IndustriRow {
    return {
      id: perusahaan.id_perusahaan,
      nama: perusahaan.nama_perusahaan,
      bidang: perusahaan.bidang_usaha || "-",
      kota: perusahaan.kabupaten_kota || "-",
      provinsi: perusahaan.provinsi || "-",
      alamat: perusahaan.alamat || "-",
      kk: splitMultiValue(perusahaan.bidang_usaha),
      pic: null,
      maps: buildMapLink(perusahaan),
      noHp: perusahaan.no_hp || null,
    };
  }

  function mapStatsPayload(payload: PerusahaanStats): DudiStats {
    return {
      totalMitra: payload.total,
      totalJenisIndustri: payload.bidang.length,
      totalKabupaten: payload.kota.length,
      totalProvinsi: payload.provinsi.length,
      bidang: payload.bidang,
      provinsi: payload.provinsi,
      kota: payload.kota,
    };
  }

  function toText(value: unknown): string {
    return String(value || "").trim();
  }

  function resetFormErrors() {
    formErrors.value = {};
  }

  function validateForm() {
    resetFormErrors();

    const nextErrors: DudiFormErrors = {};
    if (!toText(form.value.nama_perusahaan)) {
      nextErrors.nama_perusahaan = "Nama instansi/perusahaan wajib diisi.";
    }
    if (!toText(form.value.alamat)) {
      nextErrors.alamat = "Alamat lengkap wajib diisi.";
    }
    if (!toText(form.value.bidang_usaha)) {
      nextErrors.bidang_usaha = "Bidang usaha wajib diisi.";
    }

    const mapsValue = toText(form.value.maps);
    if (mapsValue && !/^https?:\/\//i.test(mapsValue)) {
      nextErrors.maps = "Link Google Maps harus diawali http:// atau https://";
    }

    const phoneValue = toText(form.value.no_hp);
    if (phoneValue && !/^[0-9+\-()\s]{8,20}$/.test(phoneValue)) {
      nextErrors.no_hp = "Nomor telepon tidak valid.";
    }

    formErrors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  function hydrateForm(perusahaan: Perusahaan) {
    form.value = {
      nama_perusahaan: perusahaan.nama_perusahaan || "",
      bidang_usaha: perusahaan.bidang_usaha || "",
      keterangan: "PKL",
      kompetensi_keahlian: "",
      kabupaten_kota: perusahaan.kabupaten_kota || "",
      provinsi: perusahaan.provinsi || "",
      alamat: perusahaan.alamat || "",
      no_hp: perusahaan.no_hp || "",
      maps: buildMapLink(perusahaan),
      pic_nama: "",
      pic_wa: "",
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
      });

      const rows = response.data || [];
      industriData.value = rows.map(mapPerusahaanToRow);
      perusahaanMap.value = rows.reduce<Record<string, Perusahaan>>((acc, item) => {
        acc[item.id_perusahaan] = item;
        return acc;
      }, {});
      pagination.value.page = response.meta?.page || pagination.value.page;
      pagination.value.limit = response.meta?.limit || pagination.value.limit;
      pagination.value.total = response.meta?.total || rows.length;
      pagination.value.totalPages = response.meta?.totalPages || 1;
    } catch (error) {
      console.error("[MitraDudi] Failed to fetch perusahaan data", error);
      industriData.value = [];
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
      });

      stats.value = mapStatsPayload(response.data);
    } catch (error) {
      console.error("[MitraDudi] Failed to fetch perusahaan stats", error);
      stats.value = createDefaultStats();
    }
  }

  function resetForm() {
    form.value = createDefaultForm();
    resetFormErrors();
    selectedId.value = null;
    isEditing.value = false;
  }

  function openModal() {
    resetForm();
    isModalOpen.value = true;
  }

  function openArchivePage() {
    router.push("/admin/mitra/dudi/arsip");
  }

  function closeModal() {
    isModalOpen.value = false;
    resetForm();
  }

  async function handleEdit(id: string) {
    const cached = perusahaanMap.value[id];
    let perusahaan = cached;

    if (!perusahaan) {
      try {
        const response = await getById(id);
        if (!response.success || !response.data) {
          await showError("Data gagal dimuat", response.message || "Data tidak ditemukan.");
          return;
        }
        perusahaan = response.data;
      } catch (error) {
        console.error("[MitraDudi] Failed to get detail perusahaan", error);
        await showError("Data gagal dimuat", "Terjadi kesalahan saat mengambil data mitra.");
        return;
      }
    }

    selectedId.value = id;
    isEditing.value = true;
    hydrateForm(perusahaan);
    resetFormErrors();
    isModalOpen.value = true;
  }

  function handleManage(id: string) {
    router.push(`/admin/master/companies/${id}/edit`);
  }

  async function handleDeactivate(id: string, nama: string) {
    const confirmed = await showConfirmation(
      "Nonaktifkan Mitra?",
      `Data ${nama} akan dinonaktifkan dari daftar aktif.`,
      {
        confirmButtonText: "Ya, Nonaktifkan",
        cancelButtonText: "Batal",
      },
    );

    if (!confirmed.isConfirmed) return;

    deletingId.value = id;
    try {
      const response = await remove(id);
      if (!response.success) {
        await showError("Gagal menonaktifkan", response.message || "Silakan coba lagi.");
        return;
      }

      await showSuccess("Berhasil", "Mitra berhasil dinonaktifkan.", { timer: 1800 });
      await Promise.all([fetchData(), fetchStats()]);
    } catch (error) {
      console.error("[MitraDudi] Failed to deactivate perusahaan", error);
      await showError("Gagal menonaktifkan", "Terjadi kesalahan saat menonaktifkan mitra.");
    } finally {
      deletingId.value = null;
    }
  }

  async function handleSave() {
    if (!validateForm()) {
      await showWarning("Form belum lengkap", "Periksa kembali field yang wajib diisi.");
      return;
    }

    const nama = toText(form.value.nama_perusahaan);
    const alamat = toText(form.value.alamat);

    saving.value = true;
    try {
      const payload = {
        nama_perusahaan: nama,
        alamat,
        bidang_usaha: toText(form.value.bidang_usaha) || undefined,
        kabupaten_kota: toText(form.value.kabupaten_kota) || undefined,
        provinsi: toText(form.value.provinsi) || undefined,
        no_hp: toText(form.value.no_hp) || undefined,
        kapasitas_siswa: 0,
        status_kerjasama: true,
      };

      const response = isEditing.value && selectedId.value
        ? await update(selectedId.value, payload)
        : await create(payload);

      if (response.success) {
        await showSuccess(
          "Berhasil",
          isEditing.value ? "Data mitra berhasil diperbarui." : "Data mitra berhasil ditambahkan.",
          { timer: 1800 },
        );
        closeModal();
        await Promise.all([fetchData(), fetchStats()]);
      } else {
        await showError("Gagal menyimpan", response.message || "Silakan coba lagi.");
      }
    } catch (error) {
      console.error("[MitraDudi] Failed to save perusahaan", error);
      await showError("Gagal menyimpan", "Terjadi kesalahan saat menyimpan data mitra.");
    } finally {
      saving.value = false;
    }
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
    saving,
    deletingId,
    isModalOpen,
    isEditing,
    filters,
    form,
    formErrors,
    industriData,
    stats,
    pagination,
    provinceOptions,
    kotaOptions,
    bidangOptions,
    modalTitle,
    modalDescription,
    submitButtonLabel,
    openModal,
    openArchivePage,
    closeModal,
    handleEdit,
    handleManage,
    handleDeactivate,
    handleSave,
    changePage,
  };
}
