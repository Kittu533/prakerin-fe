import {
  useDisposisi,
  type Disposisi,
  type DisposisiCreate,
  type DisposisiFormMeta,
  type DisposisiInstruksi,
  type DisposisiPrioritas,
  type DisposisiStatus,
  type DisposisiUpdate,
} from "~/composables/api/use-disposisi";
import { useGuruApi } from "~/composables/api/use-guru";
import { useSuratMasuk } from "~/composables/api/use-surat-masuk";
import { useSweetAlert } from "~/composables/use-sweet-alert";

interface DisposisiFilters {
  search: string;
  status: string;
  prioritas: string;
}

interface DisposisiForm {
  surat_masuk_id: string;
  tanggal_disposisi: string;
  penerima_disposisi_ids: string[];
  instruksi: DisposisiInstruksi[];
  instruksi_tambahan: string;
  batas_waktu: string;
  prioritas: DisposisiPrioritas;
}

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function createDefaultForm(): DisposisiForm {
  return {
    surat_masuk_id: "",
    tanggal_disposisi: todayDate(),
    penerima_disposisi_ids: [],
    instruksi: [],
    instruksi_tambahan: "",
    batas_waktu: "",
    prioritas: "normal",
  };
}

function createDefaultMeta(): DisposisiFormMeta {
  return {
    available_surat_masuk: [],
    prioritas_options: [
      { value: "normal", label: "Normal" },
      { value: "mendesak", label: "Mendesak" },
      { value: "sangat_mendesak", label: "Sangat Mendesak" },
    ],
    status_options: [
      { value: "baru", label: "Baru" },
      { value: "sedang_diproses", label: "Sedang Diproses" },
      { value: "selesai", label: "Selesai" },
      { value: "dibatalkan", label: "Dibatalkan" },
    ],
    instruksi_options: [
      { value: "untuk_diketahui", label: "Untuk Diketahui" },
      { value: "ditindaklanjuti", label: "Ditindaklanjuti" },
      { value: "dibalas", label: "Dibalas" },
      { value: "dikoordinasikan", label: "Dikoordinasikan" },
      { value: "diarsipkan", label: "Diarsipkan" },
      { value: "lainnya", label: "Lainnya" },
    ],
  };
}

export function useDisposisiPage() {
  const { getAll, create, update, updateStatus, remove } =
    useDisposisi();
  const { getAll: getAllSuratMasuk } = useSuratMasuk();
  const { getAllGuru } = useGuruApi();
  const { showConfirmation, showError, showSuccess } =
    useSweetAlert();

  const loading = ref(false);
  const saving = ref(false);
  const showCreateModal = ref(false);
  const showDetailModal = ref(false);
  const isEditing = ref(false);
  const selectedDisposisi = ref<Disposisi | null>(null);
  const managementList = ref<Array<{ id: string; name: string; role: string }>>([]);

  const disposisiList = ref<Disposisi[]>([]);
  const pagination = ref({ page: 1, limit: 10, total: 0 });
  const filters = ref<DisposisiFilters>({
    search: "",
    status: "",
    prioritas: "",
  });
  const form = ref<DisposisiForm>(createDefaultForm());
  const formError = ref("");
  const formMeta = ref<DisposisiFormMeta>(createDefaultMeta());

  const columns = [
    { accessorKey: "surat_masuk", header: "Surat Masuk" },
    { accessorKey: "tanggal_disposisi", header: "Tanggal" },
    { accessorKey: "penerima_disposisi_text", header: "Penerima" },
    { accessorKey: "instruksi_labels", header: "Instruksi" },
    { accessorKey: "batas_waktu", header: "Batas Waktu" },
    { accessorKey: "prioritas", header: "Prioritas" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "actions", header: "Aksi" },
  ];

  const statusFilterOptions = computed(() => [
    { value: "", label: "Semua Status" },
    ...formMeta.value.status_options,
  ]);

  const prioritasFilterOptions = computed(() => [
    { value: "", label: "Semua Prioritas" },
    ...formMeta.value.prioritas_options,
  ]);

  const suratMasukSelectOptions = computed(() => {
    const baseOptions = formMeta.value.available_surat_masuk.map((item) => ({
      value: item.id,
      label: item.label,
      description: item.description,
    }));

    if (
      isEditing.value &&
      selectedDisposisi.value?.surat_masuk &&
      !baseOptions.some(
        (item) => item.value === selectedDisposisi.value?.surat_masuk_id,
      )
    ) {
      baseOptions.unshift({
        value: selectedDisposisi.value.surat_masuk_id,
        label:
          `${selectedDisposisi.value.surat_masuk.nomor_surat} • ` +
          `${selectedDisposisi.value.surat_masuk.asal_surat}`,
        description: selectedDisposisi.value.surat_masuk.perihal,
      });
    }

    return baseOptions;
  });

  const managementMap = computed(
    () =>
      new Map(
        managementList.value.map((staff) => [staff.id, staff]),
      ),
  );

  const selectedRecipientNames = computed(() =>
    form.value.penerima_disposisi_ids.map(
      (id) => managementMap.value.get(id)?.name || id,
    ),
  );

  const statusSummary = computed(() => ({
    total: pagination.value.total,
    aktif: disposisiList.value.filter((item) =>
      ["baru", "sedang_diproses"].includes(item.status),
    ).length,
    deadline: disposisiList.value.filter((item) => {
      if (!item.batas_waktu || item.status === "selesai") {
        return false;
      }

      const due = new Date(item.batas_waktu).getTime();
      const now = Date.now();
      const diffDay = (due - now) / (1000 * 60 * 60 * 24);
      return diffDay <= 3;
    }).length,
    selesai: disposisiList.value.filter((item) => item.status === "selesai")
      .length,
  }));

  function formatDate(dateStr?: string | null): string {
    if (!dateStr) {
      return "-";
    }

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
      case "sedang_diproses":
        return "warning";
      case "dibatalkan":
        return "error";
      default:
        return "info";
    }
  }

  function getPrioritasColor(prioritas: string): string {
    switch (prioritas) {
      case "sangat_mendesak":
        return "error";
      case "mendesak":
        return "warning";
      default:
        return "neutral";
    }
  }

  function blurActiveElement() {
    if (!import.meta.client) return;

    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
  }

  function resetForm() {
    form.value = createDefaultForm();
    formError.value = "";
    isEditing.value = false;
    selectedDisposisi.value = null;
  }

  function openCreateModal() {
    resetForm();
    showCreateModal.value = true;
  }

  function toggleRecipient(id: string) {
    formError.value = "";
    const index = form.value.penerima_disposisi_ids.indexOf(id);
    if (index > -1) {
      form.value.penerima_disposisi_ids.splice(index, 1);
      return;
    }
    form.value.penerima_disposisi_ids.push(id);
  }

  function toggleInstruksi(value: string) {
    formError.value = "";
    const current = new Set(form.value.instruksi);
    if (current.has(value as DisposisiInstruksi)) {
      current.delete(value as DisposisiInstruksi);
    } else {
      current.add(value as DisposisiInstruksi);
    }

    form.value.instruksi = Array.from(current) as DisposisiInstruksi[];
  }

  function resetFilters() {
    filters.value = {
      search: "",
      status: "",
      prioritas: "",
    };
    pagination.value.page = 1;
    fetchData();
  }

  async function fetchFormOptions() {
    const result = await getAllSuratMasuk({
      page: 1,
      limit: 100,
      status: "baru",
    });

    if (!result.success || !result.data) {
      return;
    }

    formMeta.value = {
      ...formMeta.value,
      available_surat_masuk: result.data.data.map((item) => ({
        id: item.id,
        nomor_agenda: item.nomor_agenda,
        nomor_surat: item.nomor_surat,
        tanggal_surat: item.tanggal_surat,
        tanggal_diterima: item.tanggal_diterima,
        asal_surat: item.asal_surat,
        perihal: item.perihal,
        sifat_surat: item.sifat_surat,
        status: item.status,
        label: `${item.nomor_surat} • ${item.asal_surat}`,
        description: item.perihal,
      })),
    };
  }

  async function fetchManagementList() {
    const result = await getAllGuru({
      page: 1,
      limit: 200,
      kelompok: "Manajemen",
    });

    if (!result.success || !result.data) {
      managementList.value = [];
      return;
    }

    const rows = Array.isArray(result.data)
      ? result.data
      : (result.data as any).data || [];

    managementList.value = rows.map((guru: any) => ({
      id: guru.id_guru,
      name: guru.nama_guru,
      role: guru.jabatan || "Manajemen",
    }));
  }

  async function fetchData() {
    loading.value = true;
    try {
      const result = await getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search || undefined,
        status: filters.value.status || undefined,
        prioritas: filters.value.prioritas || undefined,
      });

      if (!result.success || !result.data) {
        blurActiveElement();
        await showError("Gagal memuat disposisi", result.message, {
          showCancelButton: false,
        });
        return;
      }

      disposisiList.value = result.data.data;
      pagination.value.page = result.data.page;
      pagination.value.limit = result.data.limit;
      pagination.value.total = result.data.total;
    } finally {
      loading.value = false;
    }
  }

  function applyFilters() {
    pagination.value.page = 1;
    fetchData();
  }

  function viewDetail(disposisi: Disposisi) {
    selectedDisposisi.value = disposisi;
    showDetailModal.value = true;
  }

  function editDisposisi(disposisi: Disposisi) {
    const recipientIds =
      disposisi.penerima_disposisi_ids.length > 0
        ? [...disposisi.penerima_disposisi_ids]
        : disposisi.penerima_disposisi
            .map((name) =>
              managementList.value.find((staff) => staff.name === name)?.id,
            )
            .filter((id): id is string => Boolean(id));

    selectedDisposisi.value = disposisi;
    isEditing.value = true;
    formError.value = "";
    form.value = {
      surat_masuk_id: disposisi.surat_masuk_id,
      tanggal_disposisi: disposisi.tanggal_disposisi.split("T")[0],
      penerima_disposisi_ids: recipientIds,
      instruksi: [...disposisi.instruksi],
      instruksi_tambahan: disposisi.instruksi_tambahan || "",
      batas_waktu: disposisi.batas_waktu?.split("T")[0] || "",
      prioritas: disposisi.prioritas,
    };
    showCreateModal.value = true;
  }

  async function validateForm() {
    formError.value = "";

    if (!form.value.surat_masuk_id) {
      formError.value = "Pilih surat masuk yang akan didisposisikan.";
      return false;
    }

    if (form.value.penerima_disposisi_ids.length === 0) {
      formError.value = "Tambahkan minimal satu penerima disposisi.";
      return false;
    }

    if (form.value.instruksi.length === 0) {
      formError.value = "Pilih minimal satu instruksi disposisi.";
      return false;
    }

    if (form.value.batas_waktu && form.value.batas_waktu < form.value.tanggal_disposisi) {
      formError.value = "Batas waktu tidak boleh lebih awal dari tanggal disposisi.";
      return false;
    }

    return true;
  }

  async function saveDisposisi() {
    const valid = await validateForm();
    if (!valid) {
      return;
    }

    saving.value = true;
    try {
      const recipientNames = [...selectedRecipientNames.value];
      const payload: DisposisiCreate = {
        surat_masuk_id: form.value.surat_masuk_id,
        tanggal_disposisi: new Date(form.value.tanggal_disposisi).toISOString(),
        penerima_disposisi_ids: form.value.penerima_disposisi_ids,
        penerima_disposisi: recipientNames,
        instruksi: form.value.instruksi,
        instruksi_tambahan: form.value.instruksi_tambahan || undefined,
        batas_waktu: form.value.batas_waktu
          ? new Date(form.value.batas_waktu).toISOString()
          : undefined,
        prioritas: form.value.prioritas,
      };

      const result =
        isEditing.value && selectedDisposisi.value
          ? await update(selectedDisposisi.value.id, {
              tanggal_disposisi: payload.tanggal_disposisi,
              penerima_disposisi_ids: payload.penerima_disposisi_ids,
              penerima_disposisi: payload.penerima_disposisi,
              instruksi: payload.instruksi,
              instruksi_tambahan: payload.instruksi_tambahan,
              batas_waktu: payload.batas_waktu,
              prioritas: payload.prioritas,
            } satisfies DisposisiUpdate)
          : await create(payload);

      if (!result.success) {
        formError.value = result.message;
        return;
      }

      blurActiveElement();
      showCreateModal.value = false;
      await nextTick();
      await showSuccess(
        "Disposisi tersimpan",
        isEditing.value
          ? "Perubahan disposisi berhasil diperbarui."
          : "Disposisi baru berhasil dibuat.",
      );
      resetForm();
      await Promise.all([fetchData(), fetchFormOptions()]);
    } finally {
      saving.value = false;
    }
  }

  async function setStatus(disposisi: Disposisi, status: DisposisiStatus) {
    blurActiveElement();
    const confirmed = await showConfirmation(
      "Ubah status disposisi",
      `Status disposisi akan diubah menjadi "${status.replaceAll("_", " ")}". Lanjutkan?`,
    );

    if (!confirmed.isConfirmed) {
      return;
    }

    const result = await updateStatus(disposisi.id, status);
    if (!result.success) {
      blurActiveElement();
      await showError("Gagal memperbarui status", result.message, {
        showCancelButton: false,
      });
      return;
    }

    blurActiveElement();
    await showSuccess("Status diperbarui", "Status disposisi berhasil diubah.");
    showDetailModal.value = false;
    await fetchData();
  }

  async function confirmDelete(disposisi: Disposisi) {
    blurActiveElement();
    const result = await showConfirmation(
      "Hapus disposisi",
      "Disposisi akan dihapus dan status surat masuk akan dipulihkan. Lanjutkan?",
    );

    if (!result.isConfirmed) {
      return;
    }

    const deleteResult = await remove(disposisi.id);
    if (!deleteResult.success) {
      blurActiveElement();
      await showError("Gagal menghapus disposisi", deleteResult.message, {
        showCancelButton: false,
      });
      return;
    }

    blurActiveElement();
    await showSuccess("Disposisi dihapus", "Data disposisi berhasil dihapus.");
    showDetailModal.value = false;
    await Promise.all([fetchData(), fetchFormOptions()]);
  }

  function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
  }

  watch(
    () => pagination.value.limit,
    () => {
      pagination.value.page = 1;
      fetchData();
    },
  );

  onMounted(async () => {
    await Promise.all([fetchData(), fetchFormOptions(), fetchManagementList()]);
  });

  return {
    loading,
    saving,
    showCreateModal,
    showDetailModal,
    isEditing,
    selectedDisposisi,
    managementList,
    disposisiList,
    pagination,
    filters,
    form,
    formError,
    formMeta,
    columns,
    statusFilterOptions,
    prioritasFilterOptions,
    suratMasukSelectOptions,
    selectedRecipientNames,
    statusSummary,
    formatDate,
    getStatusColor,
    getPrioritasColor,
    openCreateModal,
    toggleRecipient,
    toggleInstruksi,
    applyFilters,
    resetFilters,
    viewDetail,
    editDisposisi,
    saveDisposisi,
    setStatus,
    confirmDelete,
    changePage,
  };
}
