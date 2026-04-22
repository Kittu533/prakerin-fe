import { computed, h, onMounted, ref, watch } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import {
  usePerusahaanApi,
  type Perusahaan,
  type PerusahaanStats,
} from "~/composables/api/use-partner";
import { useSweetAlert } from "~/composables/use-sweet-alert";

type StatusFilter = "semua" | "aktif" | "nonaktif";
type MouFilter = "semua" | "aktif" | "tanpa-mou";

interface CompanyFilters {
  search: string;
  statusKerjasama: StatusFilter;
  mouAktif: MouFilter;
  arsip: boolean;
}

interface SummaryCard {
  label: string;
  value: number;
  tone: string;
  caption: string;
}

function getInitials(value?: string) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PT";
}

function mapStatusFilter(value: StatusFilter): boolean | undefined {
  if (value === "aktif") return true;
  if (value === "nonaktif") return false;
  return undefined;
}

function mapMouFilter(value: MouFilter): boolean | undefined {
  if (value === "aktif") return true;
  if (value === "tanpa-mou") return false;
  return undefined;
}

export function useMasterCompaniesPage() {
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const perusahaanApi = usePerusahaanApi();
  const { showConfirmation, showError, showSuccess } = useSweetAlert();

  const initialArchiveMode =
    String(route.query.arsip || "").trim() === "1" ||
    String(route.query.arsip || "").trim().toLowerCase() === "true";

  const loading = ref(true);
  const refreshing = ref(false);
  const data = ref<Perusahaan[]>([]);
  const stats = ref<PerusahaanStats>({
    total: 0,
    bidang: [],
    provinsi: [],
    kota: [],
  });
  const actionId = ref<string | null>(null);

  const filters = ref<CompanyFilters>({
    search: "",
    statusKerjasama: "semua",
    mouAktif: "semua",
    arsip: initialArchiveMode,
  });

  const archiveToggleLabel = computed(() =>
    filters.value.arsip ? "Lihat Data Aktif" : "Lihat Arsip",
  );

  const pageTitle = computed(() =>
    filters.value.arsip ? "Arsip Perusahaan" : "Master Perusahaan",
  );

  const pageDescription = computed(() =>
    filters.value.arsip
      ? "Daftar perusahaan yang sudah dinonaktifkan dan bisa diaktifkan kembali."
      : "Pusat CRUD data perusahaan mitra PKL, termasuk detail, edit, dan nonaktifkan data.",
  );

  const emptyTitle = computed(() =>
    filters.value.arsip ? "Belum ada arsip perusahaan" : "Belum ada data perusahaan",
  );

  const emptyDescription = computed(() =>
    filters.value.arsip
      ? "Perusahaan yang dinonaktifkan akan muncul di sini."
      : "Tambahkan perusahaan baru untuk mulai mengelola data mitra PKL.",
  );

  const summaryCards = computed<SummaryCard[]>(() => {
    const activeCount = data.value.filter((item) => item.status_kerjasama).length;
    const inactiveCount = data.value.filter((item) => !item.status_kerjasama).length;

    return [
      {
        label: filters.value.arsip ? "Total Arsip" : "Total Perusahaan",
        value: stats.value.total,
        tone: "bg-sky-600 text-white shadow-sky-200",
        caption: filters.value.arsip ? "Data nonaktif tersimpan" : "Data sesuai filter aktif",
      },
      {
        label: "Status Aktif",
        value: activeCount,
        tone: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        caption: "Berdasarkan hasil tabel saat ini",
      },
      {
        label: "Status Nonaktif",
        value: inactiveCount,
        tone: "bg-amber-50 text-amber-700 border border-amber-200",
        caption: "Termasuk data tanpa kerja sama aktif",
      },
      {
        label: "Sebaran Lokasi",
        value: stats.value.provinsi.length + stats.value.kota.length,
        tone: "bg-white text-slate-900 border border-slate-200",
        caption: `${stats.value.provinsi.length} provinsi, ${stats.value.kota.length} kota/kabupaten`,
      },
    ];
  });

  const columns: ColumnDef<Perusahaan, any>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row, table }) => {
        const index = table
          .getSortedRowModel()
          .rows.findIndex((item) => item.id === row.id);
        const pageSize = table.getState().pagination.pageSize;
        const pageIndex = table.getState().pagination.pageIndex;

        return h(
          "span",
          { class: "inline-flex w-8 justify-center text-sm font-semibold text-slate-500" },
          String(pageIndex * pageSize + index + 1),
        );
      },
    },
    {
      id: "perusahaan",
      header: "Perusahaan",
      cell: ({ row }) => {
        const perusahaan = row.original;
        return h("div", { class: "flex items-center gap-3 min-w-[220px]" }, [
          h(
            "div",
            {
              class: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xs font-black text-sky-700",
            },
            getInitials(perusahaan.nama_perusahaan),
          ),
          h("div", { class: "space-y-1" }, [
            h(
              "p",
              { class: "text-sm font-semibold text-slate-900" },
              perusahaan.nama_perusahaan || "-",
            ),
            h(
              "p",
              { class: "text-xs text-slate-500" },
              perusahaan.email || perusahaan.no_hp || "Kontak belum diisi",
            ),
          ]),
        ]);
      },
    },
    {
      id: "lokasi",
      header: "Lokasi",
      cell: ({ row }) => {
        const perusahaan = row.original;
        const lokasi = [perusahaan.kabupaten_kota, perusahaan.provinsi]
          .filter(Boolean)
          .join(", ");

        return h("div", { class: "space-y-1 min-w-[220px]" }, [
          h(
            "p",
            { class: "text-sm font-medium text-slate-700" },
            lokasi || "Lokasi belum diisi",
          ),
          h(
            "p",
            { class: "text-xs text-slate-500 line-clamp-2" },
            perusahaan.alamat || "-",
          ),
        ]);
      },
    },
    {
      id: "bidang",
      header: "Bidang",
      cell: ({ row }) => {
        return h(
          "span",
          {
            class: "inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700",
          },
          row.original.bidang_usaha || "Belum diisi",
        );
      },
    },
    {
      id: "kapasitas",
      header: "Kapasitas",
      cell: ({ row }) => {
        return h("div", { class: "space-y-1" }, [
          h(
            "p",
            { class: "text-sm font-semibold text-slate-900" },
            `${row.original.kapasitas_siswa || 0} siswa`,
          ),
          h(
            "p",
            { class: "text-xs text-slate-500" },
            row.original.tahun_mulai_kerjasama
              ? `Sejak ${row.original.tahun_mulai_kerjasama}`
              : "Tahun kerja sama belum diisi",
          ),
        ]);
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const perusahaan = row.original;
        const active = Boolean(perusahaan.status_kerjasama);

        return h("div", { class: "space-y-2" }, [
          h(
            "span",
            {
              class: `inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                active
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-700"
              }`,
            },
            active ? "Aktif" : "Nonaktif",
          ),
          h(
            "p",
            { class: "text-xs text-slate-500" },
            filters.value.arsip ? "Tersimpan di arsip" : "Siap digunakan di modul lain",
          ),
        ]);
      },
    },
    {
      id: "aksi",
      header: "",
      cell: ({ row }) => {
        const perusahaan = row.original;
        const isProcessing = actionId.value === perusahaan.id_perusahaan;

        if (filters.value.arsip) {
          return h(
            "button",
            {
              class:
                "inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60",
              disabled: isProcessing,
              onClick: () => void confirmRestore(perusahaan),
            },
            isProcessing ? "Memproses..." : "Restore",
          );
        }

        return h("div", { class: "flex gap-2" }, [
          h(
            "button",
            {
              class:
                "inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50",
              onClick: () => router.push(`/admin/master/companies/${perusahaan.id_perusahaan}`),
            },
            "Detail",
          ),
          h(
            "button",
            {
              class:
                "inline-flex items-center rounded-lg border border-sky-200 px-3 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-50",
              onClick: () => router.push(`/admin/master/companies/${perusahaan.id_perusahaan}/edit`),
            },
            "Edit",
          ),
          h(
            "button",
            {
              class:
                "inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60",
              disabled: isProcessing,
              onClick: () => void confirmArchive(perusahaan),
            },
            isProcessing ? "Memproses..." : "Nonaktifkan",
          ),
        ]);
      },
    },
  ];

  function navigateToCreate() {
    router.push("/admin/master/companies/create");
  }

  function toggleArchiveMode() {
    filters.value.arsip = !filters.value.arsip;
  }

  async function fetchData() {
    loading.value = true;

    try {
      const response = await perusahaanApi.getAll({
        limit: 1000,
        search: filters.value.search || undefined,
        status_kerjasama: mapStatusFilter(filters.value.statusKerjasama),
        mou_aktif: mapMouFilter(filters.value.mouAktif),
        arsip: filters.value.arsip,
      });

      if (response.success) {
        data.value = response.data || [];
        return;
      }

      data.value = [];
      toast.add({
        title: response.message || "Gagal memuat data perusahaan",
        color: "error",
      });
    } catch (error) {
      console.error("Failed to fetch perusahaan:", error);
      data.value = [];
      toast.add({ title: "Gagal memuat data perusahaan", color: "error" });
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    try {
      const response = await perusahaanApi.getStats({
        search: filters.value.search || undefined,
        status_kerjasama: mapStatusFilter(filters.value.statusKerjasama),
        mou_aktif: mapMouFilter(filters.value.mouAktif),
        arsip: filters.value.arsip,
      });

      if (response.success && response.data) {
        stats.value = response.data;
        return;
      }

      stats.value = {
        total: 0,
        bidang: [],
        provinsi: [],
        kota: [],
      };
    } catch (error) {
      console.error("Failed to fetch perusahaan stats:", error);
      stats.value = {
        total: 0,
        bidang: [],
        provinsi: [],
        kota: [],
      };
    }
  }

  async function refreshData() {
    refreshing.value = true;
    try {
      await Promise.all([fetchData(), fetchStats()]);
    } finally {
      refreshing.value = false;
    }
  }

  async function confirmArchive(item: Perusahaan) {
    const confirmed = await showConfirmation(
      "Nonaktifkan perusahaan?",
      `${item.nama_perusahaan} akan dipindahkan ke arsip dan status kerja sama dinonaktifkan.`,
      {
        confirmButtonText: "Ya, Nonaktifkan",
        cancelButtonText: "Batal",
      },
    );

    if (!confirmed.isConfirmed) return;

    actionId.value = item.id_perusahaan;

    try {
      const response = await perusahaanApi.remove(item.id_perusahaan);

      if (!response.success) {
        await showError("Gagal menonaktifkan", response.message || "Silakan coba lagi.");
        return;
      }

      await showSuccess("Berhasil", "Perusahaan dipindahkan ke arsip.", {
        timer: 1800,
      });
      await refreshData();
    } catch (error) {
      console.error("Failed to archive perusahaan:", error);
      await showError("Gagal menonaktifkan", "Terjadi kesalahan saat menonaktifkan perusahaan.");
    } finally {
      actionId.value = null;
    }
  }

  async function confirmRestore(item: Perusahaan) {
    const confirmed = await showConfirmation(
      "Aktifkan kembali perusahaan?",
      `${item.nama_perusahaan} akan dikembalikan ke daftar aktif.`,
      {
        confirmButtonText: "Ya, Restore",
        cancelButtonText: "Batal",
      },
    );

    if (!confirmed.isConfirmed) return;

    actionId.value = item.id_perusahaan;

    try {
      const response = await perusahaanApi.restore(item.id_perusahaan);

      if (!response.success) {
        await showError("Gagal restore", response.message || "Silakan coba lagi.");
        return;
      }

      await showSuccess("Berhasil", "Perusahaan berhasil diaktifkan kembali.", {
        timer: 1800,
      });
      await refreshData();
    } catch (error) {
      console.error("Failed to restore perusahaan:", error);
      await showError("Gagal restore", "Terjadi kesalahan saat mengaktifkan kembali perusahaan.");
    } finally {
      actionId.value = null;
    }
  }

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(
    () => filters.value.search,
    () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        void refreshData();
      }, 300);
    },
  );

  watch(
    () => filters.value.arsip,
    () => {
      filters.value.statusKerjasama = "semua";
      filters.value.mouAktif = "semua";
      void router.replace({
        query: {
          ...route.query,
          arsip: filters.value.arsip ? "1" : undefined,
        },
      });
      void refreshData();
    },
  );

  watch(
    () => [
      filters.value.statusKerjasama,
      filters.value.mouAktif,
    ],
    () => {
      void refreshData();
    },
  );

  onMounted(() => {
    void refreshData();
  });

  useHead({ title: "Master Perusahaan | Admin" });

  return {
    loading,
    refreshing,
    data,
    columns,
    filters,
    pageTitle,
    pageDescription,
    summaryCards,
    archiveToggleLabel,
    emptyTitle,
    emptyDescription,
    navigateToCreate,
    toggleArchiveMode,
    refreshData,
  };
}
