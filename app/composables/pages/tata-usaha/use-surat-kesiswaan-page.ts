import { computed, onMounted, ref, watch } from "vue";
import { useSuratKesiswaan, type SuratKesiswaan } from "~/composables/api/use-surat-kesiswaan";
import { useSuratMasuk, type SuratMasuk } from "~/composables/api/use-surat-masuk";
import { useSiswaApi, type Siswa } from "~/composables/api/use-academic";
import { useGuruApi } from "~/composables/api/use-guru";
import { useSweetAlert } from "~/composables/use-sweet-alert";
import { buildStoredFileUrl, normalizeStoredFileRef, resolveStoredFileUrl } from "~/utils/stored-file";

const DEFAULT_JENIS_DOKUMEN = "Surat Tugas (Kegiatan Luar Sekolah)";
const MAX_LOCATION_LENGTH = 200;
const MAX_WAKTU_LENGTH = 100;

function createDefaultForm() {
  return {
    jenis_dokumen: DEFAULT_JENIS_DOKUMEN,
    dasar_penugasan_id: undefined as string | undefined,
    keperluan: "",
    tempat: "",
    alamat: "",
    waktu_jam: "",
    tgl_mulai: new Date().toISOString().split("T")[0],
    tgl_selesai: "",
    penandatangan_guru_id: "",
  };
}

function pickList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  return [];
}

export function useSuratKesiswaanPage() {
  const { getTugas, createTugas, update, remove } = useSuratKesiswaan();
  const { getAll: getAllSuratMasuk } = useSuratMasuk();
  const { getAll: getAllSiswa } = useSiswaApi();
  const { getAllGuru } = useGuruApi();
  const { showConfirmation, showSuccess, showLoading, closeLoading, showWarning } = useSweetAlert();
  const loading = ref(false);
  const loadingSiswa = ref(false);
  const loadingSuratMasuk = ref(false);
  const loadingGuru = ref(false);
  const saving = ref(false);
  const showDetailModal = ref(false);
  const isEditing = ref(false);
  const isFormExpanded = ref(true);
  const isMonitoringExpanded = ref(false);
  const selectedSurat = ref<SuratKesiswaan | null>(null);

  const suratKesiswaan = ref<SuratKesiswaan[]>([]);
  const rawSuratMasukList = ref<SuratMasuk[]>([]);
  const pagination = ref({ page: 1, limit: 10, total: 0 });
  const filters = ref({ search: "" });

  const form = ref(createDefaultForm());

  const filterSiswa = ref({
    tingkat: "",
    id_kelas: "",
    search: "",
  });

  const siswaList = ref<Siswa[]>([]);
  const selectedSiswa = ref<Siswa[]>([]);
  const kelasMaster = ref<Array<{ id_kelas: string; nama_kelas: string; kode_tingkat: string }>>([]);

  const suratMasukOptions = ref<Array<{ label: string; value: string }>>([]);
  const guruPenandatanganOptions = ref<Array<{ label: string; value: string }>>([]);
  const tingkatOptions = ref<Array<{ label: string; value: string }>>([]);
  const kelasOptions = ref<Array<{ label: string; value: string }>>([]);

  const jenisDokumenOptions = [
    { label: "Surat Tugas (Kegiatan Luar Sekolah)", value: "Surat Tugas (Kegiatan Luar Sekolah)" },
    { label: "Surat Keterangan Siswa Aktif", value: "Surat Keterangan Siswa Aktif" },
    { label: "Surat Izin / Dispensasi", value: "Surat Izin / Dispensasi" },
  ];

  const columns = [
    { accessorKey: "nomor_surat", header: "No. Surat" },
    { accessorKey: "nama", header: "Nama / Personil" },
    { accessorKey: "tanggal_surat", header: "Tgl Surat" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "dokumen", header: "Dokumen" },
    { accessorKey: "actions", header: "Aksi" },
  ];

  const filteredSiswaList = computed(() => {
    if (!filterSiswa.value.search) return siswaList.value;
    const search = filterSiswa.value.search.toLowerCase();
    return siswaList.value.filter(
      (s) => s.nama_siswa.toLowerCase().includes(search) || s.nis.includes(search),
    );
  });

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
      case "sedang_diproses":
        return "warning";
      case "ditolak":
        return "error";
      default:
        return "neutral";
    }
  }

  function resolveVariantPath(sourcePath: string, extension: "docx" | "pdf"): string {
    if (/\.(pdf|docx)$/i.test(sourcePath)) {
      return sourcePath.replace(/\.(pdf|docx)$/i, `.${extension}`);
    }
    return `${sourcePath}.${extension}`;
  }

  function pickFirstFilePath(record: Record<string, unknown>, keys: string[]): string | null {
    for (const key of keys) {
        const value = record[key];
      if (typeof value === "string") {
        const normalized = normalizeStoredFileRef(value) || null;
        if (normalized) {
          return normalized;
        }
      }
    }
    return null;
  }

  function getGeneratedFilePath(surat: SuratKesiswaan, extension: "docx" | "pdf"): string | null {
    const record = surat as unknown as Record<string, unknown>;
    const explicitPath = extension === "docx"
      ? pickFirstFilePath(record, ["file_surat_docx"])
      : pickFirstFilePath(record, ["file_surat_pdf", "file_surat"]);

    if (explicitPath) {
      return explicitPath;
    }

    const fallbackPath = normalizeStoredFileRef(surat.file_surat) || null;
    if (!fallbackPath) {
      return null;
    }

    return resolveVariantPath(fallbackPath, extension);
  }

  function hasGeneratedFile(surat: SuratKesiswaan, extension: "docx" | "pdf"): boolean {
    return Boolean(getGeneratedFilePath(surat, extension));
  }

  async function isFileAccessible(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function downloadGeneratedFile(surat: SuratKesiswaan, extension: "docx" | "pdf") {
    const path = getGeneratedFilePath(surat, extension);
    if (!path) {
      await showWarning("Berkas belum tersedia", `File ${extension.toUpperCase()} untuk surat ini belum tersedia.`);
      return;
    }

    const downloadField = extension === "docx" ? "file_surat_docx_download_url" : "file_surat_pdf_download_url";
    const downloadUrl =
      resolveStoredFileUrl(surat as unknown as Record<string, unknown>, `file_surat_${extension}`, downloadField) ||
      buildStoredFileUrl(path);
    const available = await isFileAccessible(downloadUrl);
    if (!available) {
      await showWarning("Berkas tidak ditemukan", `File ${extension.toUpperCase()} belum tersedia di server.`);
      return;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.download = `${(surat.nomor_surat || "surat-kesiswaan").replace(/[^a-zA-Z0-9-_]+/g, "_")}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function blurActiveElement() {
    if (!import.meta.client) return;
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
  }

  function extractMeta(payload: any) {
    return payload?.meta || payload?.pagination || null;
  }

  async function fetchSiswaFilterOptions() {
    const collected: Siswa[] = [];
    const limit = 200;

    for (let page = 1; page <= 20; page += 1) {
      const res = await getAllSiswa({ page, limit });
      if (!res.success) break;

      const records = pickList<Siswa>(res.data);
      if (!records.length) break;
      collected.push(...records);

      const meta = extractMeta(res.data);
      const totalPages = Number(meta?.totalPages || 1);
      if (page >= totalPages) break;
    }

    const kelasMap = new Map<string, { id_kelas: string; nama_kelas: string; kode_tingkat: string }>();
    for (const siswa of collected) {
      const kelas = siswa.kelas;
      if (!kelas?.id_kelas) continue;
      if (!kelasMap.has(kelas.id_kelas)) {
        kelasMap.set(kelas.id_kelas, {
          id_kelas: kelas.id_kelas,
          nama_kelas: kelas.nama_kelas,
          kode_tingkat: kelas.kode_tingkat || "",
        });
      }
    }

    kelasMaster.value = Array.from(kelasMap.values());

    const tingkatOrder: Record<string, number> = { X: 1, XI: 2, XII: 3 };
    const tingkatSet = new Set(kelasMaster.value.map((k) => k.kode_tingkat).filter(Boolean));
    tingkatOptions.value = Array.from(tingkatSet)
      .sort((a, b) => (tingkatOrder[a] || 99) - (tingkatOrder[b] || 99))
      .map((tingkat) => ({
        label: `Kelas ${tingkat}`,
        value: tingkat,
      }));
  }

  async function fetchSuratMasuk() {
    loadingSuratMasuk.value = true;
    try {
      const res = await getAllSuratMasuk({ limit: 100 });
      if (res.success && res.data) {
        const records = pickList<SuratMasuk>(res.data);
        rawSuratMasukList.value = records;
        suratMasukOptions.value = records.map((s) => ({
          label: `${s.nomor_surat} - ${s.perkara || s.asal_surat}`,
          value: String(s.id),
        }));
      }
    } finally {
      loadingSuratMasuk.value = false;
    }
  }

  function onDasarPenugasanChange(id: string) {
    if (!id) return;
    const selected = rawSuratMasukList.value.find((s) => String(s.id) === id);
    if (selected && !form.value.keperluan) {
      form.value.keperluan = selected.perkara || `Menindaklanjuti surat dari ${selected.asal_surat}`;
    }
  }

  async function fetchKelas() {
    if (!filterSiswa.value.tingkat) return;
    kelasOptions.value = kelasMaster.value
      .filter((k) => k.kode_tingkat === filterSiswa.value.tingkat)
      .map((k) => ({
        label: k.nama_kelas,
        value: k.id_kelas,
      }));
  }

  async function fetchSiswa() {
    if (!filterSiswa.value.id_kelas) return;
    loadingSiswa.value = true;
    try {
      const res = await getAllSiswa({ id_kelas: filterSiswa.value.id_kelas, limit: 100 });
      if (res.success) {
        siswaList.value = pickList<Siswa>(res.data);
      }
    } finally {
      loadingSiswa.value = false;
    }
  }

  async function fetchGuruPenandatangan() {
    loadingGuru.value = true;
    try {
      const res = await getAllGuru({ page: 1, limit: 100, penandatangan: true });
      if (res.success && res.data) {
        const records = pickList<any>(res.data);
        guruPenandatanganOptions.value = records
          .filter((guru: any) => guru.status_aktif !== false)
          .map((guru: any) => ({
            label: `${guru.nama_guru} (${guru.nip}) - ${guru.id_guru}`,
            value: guru.id_guru,
          }));
      }
    } finally {
      loadingGuru.value = false;
    }
  }

  function toggleSiswa(siswa: Siswa) {
    if (isEditing.value) return;
    const idx = selectedSiswa.value.findIndex((s) => s.id_siswa === siswa.id_siswa);
    if (idx > -1) {
      selectedSiswa.value.splice(idx, 1);
    } else {
      selectedSiswa.value.push(siswa);
    }
  }

  function isSiswaSelected(id: string) {
    return selectedSiswa.value.some((s) => s.id_siswa === id);
  }

  function selectAllSiswa() {
    if (isEditing.value) return;
    filteredSiswaList.value.forEach((s) => {
      if (!isSiswaSelected(s.id_siswa)) {
        selectedSiswa.value.push(s);
      }
    });
  }

  async function fetchData() {
    loading.value = true;
    try {
      const res = await getTugas({
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: filters.value.search || undefined,
      });
      if (res.success && res.data) {
        suratKesiswaan.value = pickList<SuratKesiswaan>(res.data);
        pagination.value.total = res.data.total;
      }
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    form.value = createDefaultForm();
    selectedSiswa.value = [];
    isEditing.value = false;
    selectedSurat.value = null;
  }

  async function handleGenerate() {
    let processingModalOpen = false;

    if (!form.value.keperluan) {
      blurActiveElement();
      await showConfirmation("Data Tidak Lengkap", "Kolom Maksud / Keperluan harus diisi.", {
        showCancelButton: false,
      });
      return;
    }

    if (!form.value.penandatangan_guru_id) {
      blurActiveElement();
      await showConfirmation("Data Tidak Lengkap", "Pilih guru penandatangan terlebih dahulu.", {
        showCancelButton: false,
      });
      return;
    }

    if (!isEditing.value && selectedSiswa.value.length === 0) {
      blurActiveElement();
      await showConfirmation("Peringatan", "Silakan pilih setidaknya satu siswa untuk surat ini.", {
        showCancelButton: false,
      });
      return;
    }

    if ((form.value.tempat || "").length > MAX_LOCATION_LENGTH) {
      blurActiveElement();
      await showConfirmation("Data Tidak Valid", "Tempat pelaksanaan maksimal 200 karakter.", {
        showCancelButton: false,
      });
      return;
    }

    if ((form.value.alamat || "").length > MAX_LOCATION_LENGTH) {
      blurActiveElement();
      await showConfirmation("Data Tidak Valid", "Alamat lengkap maksimal 200 karakter.", {
        showCancelButton: false,
      });
      return;
    }

    if ((form.value.waktu_jam || "").length > MAX_WAKTU_LENGTH) {
      blurActiveElement();
      await showConfirmation("Data Tidak Valid", "Waktu maksimal 100 karakter.", {
        showCancelButton: false,
      });
      return;
    }

    saving.value = true;
    try {
      if (isEditing.value && selectedSurat.value) {
        const res = await update(selectedSurat.value.id, {
          keperluan: form.value.keperluan,
          tempat: form.value.tempat,
          alamat: form.value.alamat,
          waktu_jam: form.value.waktu_jam,
          tgl_mulai: form.value.tgl_mulai ? new Date(form.value.tgl_mulai).toISOString() : undefined,
          tgl_selesai: form.value.tgl_selesai ? new Date(form.value.tgl_selesai).toISOString() : undefined,
          penandatangan_guru_id: form.value.penandatangan_guru_id,
        });

        if (!res.success) {
          throw new Error(res.message || "Gagal memperbarui surat.");
        }

        await showSuccess("Berhasil", "Data surat berhasil diperbarui.");
      } else {
        showLoading("Memproses Surat...", "Sistem sedang membuat dokumen dan PDF. Mohon tunggu.");
        processingModalOpen = true;

        const res = await createTugas({
          siswa_ids: selectedSiswa.value.map((s) => s.id_siswa),
          jenis_dokumen: form.value.jenis_dokumen,
          dasar_penugasan_id: form.value.dasar_penugasan_id,
          keperluan: form.value.keperluan,
          tempat: form.value.tempat,
          alamat: form.value.alamat,
          waktu_jam: form.value.waktu_jam,
          tgl_mulai: new Date(form.value.tgl_mulai).toISOString(),
          tgl_selesai: form.value.tgl_selesai ? new Date(form.value.tgl_selesai).toISOString() : undefined,
          penandatangan_guru_id: form.value.penandatangan_guru_id,
        });

        if (!res.success) {
          throw new Error(res.message || "Gagal membuat surat tugas.");
        }

        closeLoading();
        processingModalOpen = false;

        await showSuccess(
          "Berhasil",
          `${selectedSiswa.value.length} data surat berhasil dibuat dan dicatat.`,
        );
      }

      resetForm();
      await fetchData();
      isFormExpanded.value = false;
      isMonitoringExpanded.value = true;
      if (import.meta.client) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error: any) {
      if (processingModalOpen) {
        closeLoading();
        processingModalOpen = false;
      }
      blurActiveElement();
      await showConfirmation("Gagal", error?.message || "Terjadi kesalahan saat menyimpan data.", {
        showCancelButton: false,
      });
    } finally {
      if (processingModalOpen) {
        closeLoading();
      }
      saving.value = false;
    }
  }

  function viewDetail(surat: SuratKesiswaan) {
    blurActiveElement();
    selectedSurat.value = surat;
    showDetailModal.value = true;
  }

  function editSurat(surat: SuratKesiswaan) {
    selectedSurat.value = surat;
    isEditing.value = true;
    isFormExpanded.value = true;

    form.value.jenis_dokumen = DEFAULT_JENIS_DOKUMEN;
    form.value.keperluan = surat.keperluan || "";
    form.value.tempat = surat.tempat || "";
    form.value.alamat = surat.alamat || "";
    form.value.waktu_jam = surat.waktu_jam || "";
    form.value.tgl_mulai = (surat.tanggal_kegiatan || surat.tanggal_surat || "").split("T")[0] || new Date().toISOString().split("T")[0];
    form.value.tgl_selesai = "";
    form.value.penandatangan_guru_id = surat.penandatangan_guru_id || "";

    selectedSiswa.value = [
      {
        id_siswa: surat.siswa_id || "temp",
        nama_siswa: surat.nama,
        nis: surat.nis || "-",
        id_kelas: "temp",
        kelas: {
          id_kelas: "temp",
          nama_kelas: surat.kelas || "-",
          kode_tingkat: "",
        },
      },
    ];

    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function confirmDelete(surat: SuratKesiswaan) {
    blurActiveElement();
    const result = await showConfirmation(
      "Hapus Data",
      "Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus data surat ini?",
    );

    if (!result.isConfirmed) return;

    const res = await remove(surat.id);
    if (res.success) {
      await showSuccess("Terhapus", "Data surat berhasil dihapus dari database.");
      await fetchData();
      return;
    }

    await showConfirmation("Gagal", res.message || "Gagal menghapus data surat.", {
      showCancelButton: false,
    });
  }

  function changePage(page: number) {
    pagination.value.page = page;
    fetchData();
  }

  watch(
    () => filterSiswa.value.tingkat,
    () => {
      filterSiswa.value.id_kelas = "";
      kelasOptions.value = [];
      siswaList.value = [];
      fetchKelas();
    },
  );

  watch(
    () => filterSiswa.value.id_kelas,
    () => {
      siswaList.value = [];
      fetchSiswa();
    },
  );

  onMounted(() => {
    fetchData();
    fetchSuratMasuk();
    fetchGuruPenandatangan();
    fetchSiswaFilterOptions();
  });

  return {
    loading,
    loadingSiswa,
    loadingSuratMasuk,
    loadingGuru,
    saving,
    showDetailModal,
    isEditing,
    isFormExpanded,
    isMonitoringExpanded,
    selectedSurat,
    suratKesiswaan,
    pagination,
    filters,
    form,
    filterSiswa,
    selectedSiswa,
    suratMasukOptions,
    guruPenandatanganOptions,
    tingkatOptions,
    kelasOptions,
    jenisDokumenOptions,
    columns,
    filteredSiswaList,
    formatDate,
    getStatusColor,
    onDasarPenugasanChange,
    toggleSiswa,
    isSiswaSelected,
    selectAllSiswa,
    fetchData,
    resetForm,
    handleGenerate,
    viewDetail,
    editSurat,
    confirmDelete,
    changePage,
    hasGeneratedFile,
    downloadGeneratedFile,
  };
}
