import { h, onMounted, ref } from "vue";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";
import { usePerusahaanApi, type Perusahaan } from "~/composables/api/use-partner";

export function useMasterCompaniesPage() {
  const router = useRouter();
  const toast = useToast();
  const perusahaanApi = usePerusahaanApi();

  const loading = ref(true);
  const data = ref<Perusahaan[]>([]);

  const columnHelper = createColumnHelper<Perusahaan>();
  void columnHelper;

  const columns: ColumnDef<Perusahaan, any>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row, table }) => {
        const index = table
          .getSortedRowModel()
          .rows.findIndex((r) => r.id === row.id);
        const pageSize = table.getState().pagination.pageSize;
        const pageIndex = table.getState().pagination.pageIndex;
        return h(
          "span",
          {
            class: "text-sm text-slate-500 w-6 text-center inline-block",
          },
          pageIndex * pageSize + index + 1,
        );
      },
    },
    {
      id: "nama",
      header: "Perusahaan",
      cell: ({ row }) => {
        return h("div", { class: "" }, [
          h(
            "p",
            { class: "text-sm font-medium text-slate-900" },
            row.original.nama_perusahaan || "-",
          ),
          h(
            "p",
            { class: "text-xs text-slate-500" },
            row.original.alamat || "-",
          ),
        ]);
      },
    },
    {
      id: "bidang",
      header: "Bidang",
      cell: ({ row }) => {
        if (row.original.bidang_usaha) {
          return h(
            "span",
            {
              class: "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700",
            },
            row.original.bidang_usaha,
          );
        }
        return h("span", { class: "text-slate-400" }, "-");
      },
    },
    {
      id: "kapasitas",
      header: "Kapasitas",
      cell: ({ row }) => {
        return h(
          "span",
          { class: "text-sm" },
          `${row.original.kapasitas_siswa || 0} siswa`,
        );
      },
    },
    {
      id: "no_hp",
      header: "Telepon",
      cell: ({ row }) => {
        return h(
          "span",
          { class: "text-sm text-slate-600" },
          row.original.no_hp || "-",
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.status_kerjasama;
        return h(
          "span",
          {
            class: `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${isActive ? "bg-success-50 text-success-700" : "bg-neutral-100 text-neutral-700"}`,
          },
          isActive ? "Aktif" : "Nonaktif",
        );
      },
    },
    {
      id: "aksi",
      header: "",
      cell: ({ row }) => {
        return h("div", { class: "flex gap-1" }, [
          h(
            "button",
            {
              class: "p-1.5 rounded hover:bg-slate-100 text-slate-600",
              onClick: () =>
                router.push(`/admin/master/companies/${row.original.id_perusahaan}`),
            },
            h(
              "svg",
              {
                class: "w-4 h-4",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": 2,
              },
              [
                h("path", {
                  d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",
                }),
                h("circle", { cx: "12", cy: "12", r: "3" }),
              ],
            ),
          ),
          h(
            "button",
            {
              class: "p-1.5 rounded hover:bg-primary-50 text-primary-600",
              onClick: () =>
                router.push(`/admin/master/companies/${row.original.id_perusahaan}/edit`),
            },
            h(
              "svg",
              {
                class: "w-4 h-4",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": 2,
              },
              [
                h("path", {
                  d: "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z",
                }),
              ],
            ),
          ),
          h(
            "button",
            {
              class: "p-1.5 rounded hover:bg-red-50 text-red-600",
              onClick: () => confirmDelete(row.original),
            },
            h(
              "svg",
              {
                class: "w-4 h-4",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": 2,
              },
              [
                h("path", { d: "M3 6h18" }),
                h("path", {
                  d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",
                }),
                h("path", {
                  d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",
                }),
              ],
            ),
          ),
        ]);
      },
    },
  ];

  const navigateToCreate = () => {
    router.push("/admin/master/companies/create");
  };

  async function fetchData() {
    loading.value = true;
    try {
      const response = await perusahaanApi.getAll({ limit: 1000 });
      if (response.success) {
        data.value = response.data || [];
      }
    } catch (error) {
      console.error("Failed to fetch perusahaan:", error);
      toast.add({ title: "Gagal memuat data perusahaan", color: "error" });
    } finally {
      loading.value = false;
    }
  }

  function confirmDelete(item: Perusahaan) {
    if (!confirm(`Nonaktifkan perusahaan "${item.nama_perusahaan}"?`)) return;

    perusahaanApi
      .remove(item.id_perusahaan)
      .then((response) => {
        if (response.success) {
          toast.add({
            title: "Perusahaan dinonaktifkan",
            color: "success",
          });
          fetchData();
        } else {
          toast.add({
            title: response.message || "Gagal menonaktifkan",
            color: "error",
          });
        }
      })
      .catch(() => {
        toast.add({
          title: "Gagal menonaktifkan perusahaan",
          color: "error",
        });
      });
  }

  onMounted(() => {
    void fetchData();
  });

  useHead({ title: "Perusahaan Mitra | Admin" });

  return {
    loading,
    data,
    columns,
    navigateToCreate,
  };
}
