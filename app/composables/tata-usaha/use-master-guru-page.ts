import { useGuruApi, type Guru } from "~/composables/api/use-academic";
import { useSweetAlert } from "~/composables/use-sweet-alert";
import MassManagementCard from "~/components/master/MassManagementCard.vue";

interface GuruFilters {
  search: string;
  kelompok: string;
}

function getKelompokFromJabatan(jabatan?: string, fallback?: string): string {
  if (fallback) return fallback;
  const normalized = (jabatan || "").toLowerCase();
  if (!normalized) return "Lainnya";
  if (
    normalized.includes("kepala") ||
    normalized.includes("wakil") ||
    normalized.includes("waka") ||
    normalized.includes("manajemen")
  ) {
    return "Manajemen";
  }
  if (normalized.includes("tata usaha") || normalized === "tu" || normalized.includes("staf tu")) {
    return "Tata Usaha";
  }
  if (normalized.includes("produktif")) return "Guru Produktif";
  if (normalized.includes("guru")) return "Guru Umum";
  return "Lainnya";
}

function toExportRows(rows: Guru[]) {
  return rows.map((row, index) => ({
    NO: index + 1,
    NIP: row.nip,
    NAMA_GURU: row.nama_guru,
    JABATAN: row.jabatan || "",
    KELOMPOK: row.kelompok || getKelompokFromJabatan(row.jabatan),
    PANGKAT: row.pangkat || "",
    GOLONGAN: row.golongan || "",
    NO_HP: row.no_hp || "",
    EMAIL: row.email || "",
  }));
}

export function useMasterGuruPage() {
  const { getAll: getAllGuru, importExcel, downloadTemplate, exportGuru, remove } = useGuruApi();
  const toast = useToast();
  const { showSuccess, showError, showConfirmation } = useSweetAlert();

  const massCard = ref<InstanceType<typeof MassManagementCard> | null>(null);
  const loading = ref(false);
  const uploading = ref(false);

  const showDetailModal = ref(false);
  const selectedGuru = ref<Guru | null>(null);

  const guruList = ref<Guru[]>([]);
  const pagination = ref({ page: 1, limit: 20, total: 0 });

  const filters = ref<GuruFilters>({
    search: "",
    kelompok: "Semua Kelompok",
  });

  const kelompokOptions = [
    "Semua Kelompok",
    "Manajemen",
    "Guru Produktif",
    "Guru Umum",
    "Tata Usaha",
  ];

  const columns = [
    { accessorKey: "index", header: "No" },
    { accessorKey: "nama_guru", header: "Nama & NIP" },
    { accessorKey: "jabatan", header: "Jabatan / Kelompok" },
    { accessorKey: "pangkat", header: "Pangkat" },
    { accessorKey: "golongan", header: "Gol/Ruang" },
    { accessorKey: "no_hp", header: "WhatsApp" },
    { accessorKey: "actions", header: "Aksi" },
  ];

  const guruListView = computed(() =>
    guruList.value.map((guru) => ({
      ...guru,
      jabatan: guru.jabatan || "Guru",
      kelompok: guru.kelompok || getKelompokFromJabatan(guru.jabatan),
      pangkat: guru.pangkat || "-",
      golongan: guru.golongan || "-",
      no_hp: guru.no_hp || "",
    })),
  );

  async function fetchData() {
    loading.value = true;
    try {
      const result = await getAllGuru({
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search || undefined,
        kelompok: filters.value.kelompok || undefined,
      });

      if (!result.success || !result.data) return;

      guruList.value = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
      const meta = (result as any).meta || (result as any).pagination;
      pagination.value.total = meta?.total || 0;
    } catch (error) {
      console.error("[MasterGuru] Error fetching:", error);
      await showError("Gagal", "Terjadi kesalahan saat mengambil data guru.");
    } finally {
      loading.value = false;
    }
  }

  async function handleUpload(file: File, mode: "append" | "replace") {
    uploading.value = true;
    try {
      const result = await importExcel(file, mode);

      if (!result.success) {
        toast.add({
          title: "Gagal",
          description: result.message || "Gagal mengunggah data guru",
          color: "error",
        });
        return;
      }

      toast.add({
        title: "Berhasil",
        description: result.message || "Data guru berhasil diunggah",
        color: "success",
      });
      massCard.value?.reset();
      await fetchData();
    } catch (error: any) {
      console.error("[MasterGuru] Error uploading:", error);
      toast.add({
        title: "Error",
        description: error?.message || "Terjadi kesalahan sistem saat mengunggah",
        color: "error",
      });
    } finally {
      uploading.value = false;
    }
  }

  async function handleDownloadTemplate() {
    const result = await downloadTemplate();
    if (!result.success) {
      await showError("Gagal", result.message || "Gagal mengunduh template");
    }
  }

  async function exportFiltered() {
    const ids = guruListView.value.map((item) => item.id_guru);
    const result = await exportGuru(ids);
    if (!result.success || !result.data) {
      await showError("Gagal", result.message || "Gagal mengekspor data terfilter");
      return;
    }
    const XLSX = await import("xlsx").then((m) => m.default || m);
    const sheet = XLSX.utils.json_to_sheet(toExportRows(result.data));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Guru_Terfilter");
    XLSX.writeFile(book, "Data_Guru_Terfilter.xlsx");
    await showSuccess("Berhasil", "Data terfilter berhasil diunduh.");
  }

  async function exportAll() {
    const result = await exportGuru();
    if (!result.success || !result.data) {
      await showError("Gagal", result.message || "Gagal mengekspor semua data");
      return;
    }
    const XLSX = await import("xlsx").then((m) => m.default || m);
    const sheet = XLSX.utils.json_to_sheet(toExportRows(result.data));
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Semua_Guru");
    XLSX.writeFile(book, "Data_Guru_Semua.xlsx");
    await showSuccess("Berhasil", "Semua data guru berhasil diunduh.");
  }

  function viewDetail(guru: Guru) {
    selectedGuru.value = guru;
    showDetailModal.value = true;
  }

  async function confirmDelete(guru: Guru) {
    const confirmResult = await showConfirmation(
      "Konfirmasi Hapus",
      `Hapus data guru ${guru.nama_guru} (${guru.nip})?`,
    );
    if (!confirmResult.isConfirmed) return;

    const result = await remove(guru.id_guru);
    if (!result.success) {
      await showError("Gagal", result.message || "Gagal menghapus data guru.");
      return;
    }

    await showSuccess("Berhasil", "Data guru berhasil dihapus.");
    if (showDetailModal.value && selectedGuru.value?.id_guru === guru.id_guru) {
      showDetailModal.value = false;
      selectedGuru.value = null;
    }
    await fetchData();
  }

  function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
  }

  onMounted(() => {
    fetchData();
  });

  return {
    massCard,
    loading,
    uploading,
    showDetailModal,
    selectedGuru,
    guruListView,
    pagination,
    filters,
    kelompokOptions,
    columns,
    fetchData,
    handleUpload,
    handleDownloadTemplate,
    exportFiltered,
    exportAll,
    viewDetail,
    confirmDelete,
    changePage,
  };
}
