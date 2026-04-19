import { useSuratMasuk, type SuratMasuk } from "~/composables/api/use-surat-masuk";
import { useGuruApi } from "~/composables/api/use-academic";
import { useSweetAlert } from "~/composables/use-sweet-alert";

interface SuratMasukFilters {
  search: string;
  start_date: string;
  end_date: string;
}

interface SuratMasukForm {
  nomor_agenda: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  asal_surat: string;
  perihal: string;
  klasifikasi_surat: string | undefined;
  sifat_surat: string;
  ditujukan_kepada: string;
  keterangan: string;
  teruskan_ke: string[];
  arsipkan: boolean;
  file: File | null;
}

function createDefaultForm(): SuratMasukForm {
  const today = new Date().toISOString().split("T")[0];
  return {
    nomor_agenda: "",
    nomor_surat: "",
    tanggal_surat: today,
    tanggal_diterima: today,
    asal_surat: "",
    perihal: "",
    klasifikasi_surat: undefined,
    sifat_surat: "biasa",
    ditujukan_kepada: "",
    keterangan: "",
    teruskan_ke: [],
    arsipkan: false,
    file: null,
  };
}

export function useSuratMasukPage() {
  const { getAll, create, update, remove, getPdfById } = useSuratMasuk();
  const { getAll: getAllGuru } = useGuruApi();
  const { showConfirmation, showSuccess } = useSweetAlert();

  const loading = ref(false);
  const saving = ref(false);
  const showCreateModal = ref(false);
  const showDetailModal = ref(false);
  const isEditing = ref(false);
  const selectedSurat = ref<SuratMasuk | null>(null);
  const isSearchPanelExpanded = ref(false);

  const suratMasuk = ref<SuratMasuk[]>([]);
  const pagination = ref({ page: 1, limit: 10, total: 0 });
  const filters = ref<SuratMasukFilters>({
    search: "",
    start_date: "",
    end_date: "",
  });
  const form = ref<SuratMasukForm>(createDefaultForm());

  const managementList = ref<Array<{ id: string; name: string; role: string }>>([]);

  const columns = [
    { accessorKey: "nomor_agenda", header: "No. Agenda" },
    { accessorKey: "nomor_surat", header: "No. Surat" },
    { accessorKey: "tanggal_surat", header: "Tanggal" },
    { accessorKey: "asal_surat", header: "Asal Surat" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "actions", header: "Aksi" },
  ];

  const klasifikasiOptions = [
    { label: "Undangan", value: "undangan" },
    { label: "Edaran", value: "ebaran" },
    { label: "Permohonan", value: "permohonan" },
    { label: "Pemberitahuan", value: "pemberitahuan" },
    { label: "Laporan", value: "laporan" },
    { label: "Lainnya", value: "lainnya" },
  ];

  const sifatOptions = [
    { label: "Biasa", value: "biasa" },
    { label: "Penting", value: "penting" },
    { label: "Rahasia", value: "rahasia" },
    { label: "Segera", value: "segera" },
  ];

  function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "selesai":
        return "success";
      case "didisposisikan":
        return "warning";
      case "baru":
        return "info";
      default:
        return "neutral";
    }
  }

  function resetForm() {
    form.value = createDefaultForm();
    isEditing.value = false;
    selectedSurat.value = null;
  }

  function openCreateModal() {
    resetForm();
    showCreateModal.value = true;
  }

  function resetFilters() {
    filters.value = {
      search: "",
      start_date: "",
      end_date: "",
    };
    pagination.value.page = 1;
    fetchData();
  }

  async function fetchData() {
    loading.value = true;
    try {
      const result = await getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search || undefined,
        start_date: filters.value.start_date || undefined,
        end_date: filters.value.end_date || undefined,
      });

      if (!result.success || !result.data) {
        return;
      }

      suratMasuk.value = result.data.data;
      pagination.value.page = result.data.page;
      pagination.value.limit = result.data.limit;
      pagination.value.total = result.data.total;
    } catch (error) {
      console.error("[SuratMasuk] Error fetching:", error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchManagementList() {
    try {
      const result = await getAllGuru({
        page: 1,
        limit: 200,
        kelompok: "Manajemen",
      });

      if (!result.success || !result.data) {
        managementList.value = [];
        return;
      }

      const guruRows = Array.isArray(result.data)
        ? result.data
        : (result.data as any).data || [];

      managementList.value = guruRows.map((guru: any) => ({
        id: guru.id_guru,
        name: guru.nama_guru,
        role: guru.jabatan || "Manajemen",
      }));
    } catch (error) {
      console.error("[SuratMasuk] Error fetching management list:", error);
      managementList.value = [];
    }
  }

  function viewDetail(surat: SuratMasuk) {
    selectedSurat.value = surat;
    showDetailModal.value = true;
  }

  function editSurat(surat: SuratMasuk) {
    selectedSurat.value = surat;
    isEditing.value = true;
    form.value = {
      nomor_agenda: surat.nomor_agenda,
      nomor_surat: surat.nomor_surat,
      tanggal_surat: surat.tanggal_surat.split("T")[0],
      tanggal_diterima: surat.tanggal_diterima.split("T")[0],
      asal_surat: surat.asal_surat,
      perihal: surat.perihal ?? surat.perkara ?? "",
      klasifikasi_surat: surat.klasifikasi_surat,
      sifat_surat: surat.sifat_surat,
      ditujukan_kepada: surat.ditujukan_kepada,
      keterangan: surat.keterangan || "",
      teruskan_ke: [],
      arsipkan: surat.status === "selesai",
      file: null,
    };
    showCreateModal.value = true;
  }

  async function saveSurat() {
    const required =
      form.value.nomor_agenda &&
      form.value.nomor_surat &&
      form.value.asal_surat &&
      form.value.perihal &&
      form.value.klasifikasi_surat &&
      form.value.sifat_surat &&
      form.value.ditujukan_kepada;

    if (!required) {
      await showConfirmation("Data belum lengkap", "Mohon lengkapi seluruh field wajib.", {
        showCancelButton: false,
      });
      return;
    }

    saving.value = true;
    try {
      const payload = {
        nomor_agenda: form.value.nomor_agenda,
        nomor_surat: form.value.nomor_surat,
        tanggal_surat: new Date(form.value.tanggal_surat).toISOString(),
        tanggal_diterima: new Date(form.value.tanggal_diterima).toISOString(),
        asal_surat: form.value.asal_surat,
        perihal: form.value.perihal,
        klasifikasi_surat: form.value.klasifikasi_surat,
        sifat_surat: form.value.sifat_surat,
        ditujukan_kepada: form.value.ditujukan_kepada,
        keterangan: form.value.keterangan || undefined,
        teruskan_ke: form.value.teruskan_ke,
        status: form.value.arsipkan ? "selesai" : "baru",
      };

      const result =
        isEditing.value && selectedSurat.value
          ? await update(selectedSurat.value.id, payload)
          : await create(payload);

      if (!result.success) {
        await showConfirmation("Gagal", result.message, { showCancelButton: false });
        return;
      }

      await showSuccess(
        "Berhasil",
        `Surat masuk berhasil ${isEditing.value ? "diperbarui" : "disimpan"}`,
      );

      showCreateModal.value = false;
      resetForm();
      await fetchData();
    } catch (error) {
      console.error("[SuratMasuk] Error saving:", error);
    } finally {
      saving.value = false;
    }
  }

  async function confirmDelete(surat: SuratMasuk) {
    const result = await showConfirmation(
      "Konfirmasi Hapus",
      `Apakah Anda yakin ingin menghapus surat ${surat.nomor_surat}? Data yang dihapus tidak dapat dikembalikan.`,
    );

    if (!result.isConfirmed) return;

    const deleteResult = await remove(surat.id);
    if (!deleteResult.success) {
      await showConfirmation("Gagal", deleteResult.message, { showCancelButton: false });
      return;
    }

    await showSuccess("Berhasil", "Surat masuk berhasil dihapus");
    await fetchData();
  }

  function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
  }

  function toggleStaff(name: string) {
    const index = form.value.teruskan_ke.indexOf(name);
    if (index > -1) {
      form.value.teruskan_ke.splice(index, 1);
      return;
    }
    form.value.teruskan_ke.push(name);
  }

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    form.value.file = target.files?.[0] ?? null;
  }

  async function openGeneratedPdf(surat: SuratMasuk) {
    try {
      const result = await getPdfById(surat.id);
      if (!result.success || !result.data) {
        await showConfirmation("Gagal", result.message || "PDF surat tidak tersedia.", {
          showCancelButton: false,
        });
        return;
      }

      const blobUrl = URL.createObjectURL(result.data);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch (error) {
      console.error("[SuratMasuk] Error opening generated PDF:", error);
      await showConfirmation("Gagal", "Terjadi kesalahan saat membuka PDF surat.", {
        showCancelButton: false,
      });
    }
  }

  onMounted(() => {
    fetchData();
    fetchManagementList();
  });

  return {
    loading,
    saving,
    showCreateModal,
    showDetailModal,
    selectedSurat,
    isSearchPanelExpanded,
    suratMasuk,
    pagination,
    filters,
    form,
    managementList,
    columns,
    klasifikasiOptions,
    sifatOptions,
    formatDate,
    getStatusColor,
    openCreateModal,
    resetFilters,
    fetchData,
    viewDetail,
    editSurat,
    saveSurat,
    confirmDelete,
    changePage,
    toggleStaff,
    handleFileChange,
    openGeneratedPdf,
  };
}
