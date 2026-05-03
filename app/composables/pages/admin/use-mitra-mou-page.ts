import { computed, onMounted, ref, watch } from "vue";
import { useMouApi, usePerusahaanApi, type Mou, type Perusahaan } from "~/composables/api/use-partner";
import { resolveStoredFileUrl } from "~/utils/stored-file";

interface MouRow {
  id: string;
  nama: string;
  bidang: string;
  alamat: string;
  no_mou: string;
  perihal: string;
  tags: string[];
  mulai: string;
  berakhir: string;
  status: "AKTIF" | "EXPIRED";
  pic_nama: string;
  pic_telepon: string;
  link_maps: string;
  link_dokumen: string;
}

interface DokumenUploadState {
  file: File | null;
  name: string;
}

export function useMitraMouPage() {
  const toast = useToast();
  const mouApi = useMouApi();
  const perusahaanApi = usePerusahaanApi();

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);
  const loading = ref(false);
  const submitting = ref(false);

  const sourceData = ref<Mou[]>([]);
  const companyOptions = ref<Perusahaan[]>([]);
  const paginationMeta = ref({ page: 1, limit: 100, total: 0, totalPages: 1 });

  const filters = ref({
    nama: "",
    alamat: "",
    bidang: "Semua Bidang",
    masa_berlaku: "Semua Masa Berlaku",
  });

  const stats = ref({
    total: 0,
    aktif: 0,
    expired: 0,
    bulan_ini: 0,
    tahun_ini: 0,
    bidang: [] as Array<{ label: string; count: number }>,
  });

  const form = ref({
    perusahaan_id: "",
    no_mou: "",
    perihal: "",
    kompetensi: "",
    tanggal_mulai: "",
    tanggal_berakhir: "",
    pic_nama: "",
    pic_telepon: "",
    link_maps: "",
    link_dokumen: "",
  });

  const dokumenUpload = ref<DokumenUploadState>({
    file: null,
    name: "",
  });

  const bidangOptions = computed(() => {
    const source = stats.value.bidang.map((item) => item.label).filter((label) => label && label !== "N/A");
    return ["Semua Bidang", ...Array.from(new Set(source))];
  });

  const selectedCompany = computed(() => {
    return companyOptions.value.find((item) => item.id_perusahaan === form.value.perusahaan_id) || null;
  });

  const mouData = computed<MouRow[]>(() => {
    return sourceData.value.map((item) => ({
      id: item.id_mou,
      nama: item.perusahaan?.nama_perusahaan || "-",
      bidang: item.perusahaan?.bidang_usaha || "-",
      alamat: item.perusahaan?.alamat || "-",
      no_mou: item.nomor_mou,
      perihal: item.perihal,
      tags: String(item.kompetensi_keahlian || "")
        .split(/[,;|]/)
        .map((token) => token.trim())
        .filter(Boolean),
      mulai: formatDate(item.tanggal_mulai),
      berakhir: formatDate(item.tanggal_berakhir),
      status: item.status || "AKTIF",
      pic_nama: item.pic_nama || "-",
      pic_telepon: item.pic_telepon || "-",
      link_maps: resolveMapUrl(item.link_maps, item.perusahaan),
      link_dokumen: resolveMouDocumentUrl(item),
    }));
  });

  const paginationText = computed(() => {
    const total = paginationMeta.value.total;
    const start = total > 0 ? (paginationMeta.value.page - 1) * paginationMeta.value.limit + 1 : 0;
    const end = Math.min(paginationMeta.value.page * paginationMeta.value.limit, total);
    return `Menampilkan ${start} - ${end} dari ${total} MoU`;
  });

  const modalTitle = computed(() => (isEditing.value ? "Kelola Data MoU" : "Tambah Data MoU"));
  const submitButtonText = computed(() => (isEditing.value ? "SIMPAN PERUBAHAN" : "SIMPAN DATA"));

  function isExternalUrl(value?: string | null) {
    return /^https?:\/\//i.test(String(value || "").trim());
  }

  function buildCompanyMapLink(company?: Pick<Perusahaan, "alamat"> | null) {
    const address = String(company?.alamat || "").trim();
    if (!address) return "";

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  function resolveMapUrl(pathOrUrl?: string | null, company?: Pick<Perusahaan, "alamat"> | null) {
    const normalized = String(pathOrUrl || "").trim();
    if (isExternalUrl(normalized)) return normalized;
    return buildCompanyMapLink(company);
  }

  function buildQueryParams() {
    return {
      nama: filters.value.nama || undefined,
      alamat: filters.value.alamat || undefined,
      bidang: filters.value.bidang !== "Semua Bidang" ? filters.value.bidang : undefined,
      masa_berlaku:
        filters.value.masa_berlaku !== "Semua Masa Berlaku" ? filters.value.masa_berlaku : undefined,
      page: 1,
      limit: 100,
    };
  }

  function resolveMouDocumentUrl(item: Mou) {
    return (
      resolveStoredFileUrl(
        item as unknown as Record<string, unknown>,
        "link_dokumen",
        "link_dokumen_download_url",
      ) || ""
    );
  }

  function normalizeListResponse(raw: any): { rows: Mou[]; meta?: { page: number; limit: number; total: number; totalPages: number } } {
    const payload = raw?.success !== undefined ? raw : raw?.data;

    if (!payload) {
      return { rows: [] };
    }

    const directRows = Array.isArray(payload.data) ? payload.data : undefined;
    const nestedRows = Array.isArray(payload.data?.data) ? payload.data.data : undefined;

    const meta = payload.meta || payload.data?.meta;

    return {
      rows: directRows || nestedRows || [],
      meta,
    };
  }

  function normalizeStatsResponse(raw: any): {
    total: number;
    aktif: number;
    expired: number;
    bulan_ini: number;
    tahun_ini: number;
    bidang: Array<{ label: string; count: number }>;
  } {
    const payload = raw?.success !== undefined ? raw : raw?.data;
    const source = payload?.data || payload?.data?.data || {};

    return {
      total: source.total || 0,
      aktif: source.aktif || 0,
      expired: source.expired || 0,
      bulan_ini: source.bulan_ini || 0,
      tahun_ini: source.tahun_ini || 0,
      bidang: source.bidang || [],
    };
  }

  function getErrorMessage(error: any, fallback: string) {
    const responseData = error?.data || error?.response?._data || error?.response?.data;
    const message = responseData?.message || error?.message;

    if (responseData?.errors && typeof responseData.errors === "object") {
      const firstError = Object.values(responseData.errors)
        .flat()
        .find(Boolean);
      if (firstError) return String(firstError);
    }

    return message || fallback;
  }

  async function fetchMouData() {
    loading.value = true;
    try {
      const params = buildQueryParams();
      const [listRes, statsRes] = await Promise.all([
        mouApi.getAll(params),
        mouApi.getStats(params),
      ]);

      const normalizedList = normalizeListResponse(listRes);
      sourceData.value = normalizedList.rows;
      if (normalizedList.meta) {
        paginationMeta.value = normalizedList.meta;
      } else {
        paginationMeta.value = {
          page: 1,
          limit: 100,
          total: normalizedList.rows.length,
          totalPages: 1,
        };
      }

      stats.value = normalizeStatsResponse(statsRes);
    } catch (error) {
      console.error("Failed to fetch MoU data:", error);
      toast.add({
        title: "Gagal memuat data MoU",
        color: "error",
      });
    } finally {
      loading.value = false;
    }
  }

  async function fetchCompanyOptions() {
    try {
      const response = await perusahaanApi.getAll({
        page: 1,
        limit: 1000,
        arsip: false,
        status_kerjasama: true,
      });

      if (response.success) {
        companyOptions.value = response.data || [];
      }
    } catch (error) {
      console.error("Failed to fetch company options:", error);
    }
  }

  function resetForm() {
    form.value = {
      perusahaan_id: "",
      no_mou: "",
      perihal: "",
      kompetensi: "",
      tanggal_mulai: "",
      tanggal_berakhir: "",
      pic_nama: "",
      pic_telepon: "",
      link_maps: "",
      link_dokumen: "",
    };
    dokumenUpload.value = {
      file: null,
      name: "",
    };
    isEditing.value = false;
    editingId.value = null;
  }

  function handleDokumenFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;

    if (!file) {
      dokumenUpload.value = { file: null, name: "" };
      return;
    }

    if (file.type !== "application/pdf") {
      toast.add({ title: "Dokumen harus berformat PDF", color: "error" });
      target.value = "";
      dokumenUpload.value = { file: null, name: "" };
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.add({ title: "Ukuran dokumen maksimal 5MB", color: "error" });
      target.value = "";
      dokumenUpload.value = { file: null, name: "" };
      return;
    }

    dokumenUpload.value = {
      file,
      name: file.name,
    };
  }

  const openModal = () => {
    resetForm();
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
  };

  const handleSave = async () => {
    if (!form.value.perusahaan_id) {
      toast.add({ title: "Perusahaan mitra wajib dipilih", color: "error" });
      return;
    }

    if (!form.value.no_mou || !form.value.perihal) {
      toast.add({ title: "Nomor MoU dan perihal wajib diisi", color: "error" });
      return;
    }

    if (!form.value.tanggal_mulai || !form.value.tanggal_berakhir) {
      toast.add({ title: "Tanggal mulai dan berakhir wajib diisi", color: "error" });
      return;
    }

    if (!dokumenUpload.value.file && !form.value.link_dokumen) {
      toast.add({
        title: "Dokumen MoU wajib diunggah",
        description: "Perusahaan baru bisa dipakai untuk penempatan PKL setelah dokumen MoU PDF tersimpan.",
        color: "error",
      });
      return;
    }

    const normalizedMapUrl = String(form.value.link_maps || "").trim();
    if (normalizedMapUrl && !isExternalUrl(normalizedMapUrl)) {
      toast.add({ title: "Link Google Maps harus diawali http:// atau https://", color: "error" });
      return;
    }

    submitting.value = true;
    try {
      let linkDokumen = form.value.link_dokumen || undefined;

      if (dokumenUpload.value.file) {
        const uploadRes = await mouApi.uploadDokumen(dokumenUpload.value.file);
        if (!uploadRes.success || !uploadRes.data?.path) {
          toast.add({ title: uploadRes.message || "Upload dokumen gagal", color: "error" });
          return;
        }
        linkDokumen = uploadRes.data.path;
      }

      const payload = {
        perusahaan_id: form.value.perusahaan_id,
        nomor_mou: form.value.no_mou,
        perihal: form.value.perihal,
        tanggal_mulai: form.value.tanggal_mulai,
        tanggal_berakhir: form.value.tanggal_berakhir,
        kompetensi_keahlian: form.value.kompetensi || undefined,
        pic_nama: form.value.pic_nama || undefined,
        pic_telepon: form.value.pic_telepon || undefined,
        link_maps: normalizedMapUrl || undefined,
        link_dokumen: linkDokumen,
      };

      const response = isEditing.value && editingId.value
        ? await mouApi.update(editingId.value, payload)
        : await mouApi.create(payload);

      if (response.success) {
        toast.add({ title: isEditing.value ? "Data MoU berhasil diperbarui" : "Data MoU berhasil ditambahkan", color: "success" });
        closeModal();
        await fetchMouData();
      } else {
        toast.add({
          title: "Gagal menyimpan data MoU",
          description: getErrorMessage(response, "Periksa kembali data MoU yang diisi"),
          color: "error",
        });
      }
    } catch (error) {
      console.error("Failed to create MoU:", error);
      toast.add({
        title: "Gagal menyimpan data MoU",
        description: getErrorMessage(error, "Periksa kembali data MoU yang diisi"),
        color: "error",
      });
    } finally {
      submitting.value = false;
    }
  };

  function toInputDate(value?: string | Date | null): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  }

  function handleKelolaMou(mouId: string) {
    const selected = sourceData.value.find((item) => item.id_mou === mouId);
    if (!selected) {
      toast.add({ title: "Data MoU tidak ditemukan", color: "error" });
      return;
    }

    form.value = {
      perusahaan_id: selected.perusahaan_id,
      no_mou: selected.nomor_mou,
      perihal: selected.perihal,
      kompetensi: selected.kompetensi_keahlian || "",
      tanggal_mulai: toInputDate(selected.tanggal_mulai),
      tanggal_berakhir: toInputDate(selected.tanggal_berakhir),
      pic_nama: selected.pic_nama || "",
      pic_telepon: selected.pic_telepon || "",
      link_maps: selected.link_maps || "",
      link_dokumen: selected.link_dokumen || "",
    };

    dokumenUpload.value = { file: null, name: "" };
    isEditing.value = true;
    editingId.value = mouId;
    isModalOpen.value = true;
  }

  let filterTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(
    filters,
    () => {
      if (filterTimeout) clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        void fetchMouData();
      }, 350);
    },
    { deep: true },
  );

  onMounted(async () => {
    await Promise.all([fetchMouData(), fetchCompanyOptions()]);
  });

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return {
    loading,
    submitting,
    mouData,
    isModalOpen,
    filters,
    form,
    stats,
    bidangOptions,
    companyOptions,
    selectedCompany,
    paginationText,
    modalTitle,
    submitButtonText,
    isEditing,
    dokumenUpload,
    openModal,
    closeModal,
    handleDokumenFileChange,
    handleSave,
    handleKelolaMou,
    formatDate,
  };
}
