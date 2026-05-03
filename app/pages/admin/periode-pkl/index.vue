<script setup lang="ts">
import { ref, onMounted, computed, h, watch } from "vue";
import {
    usePeriodePKLApi,
    type PeriodePKL,
} from "~/composables/api/use-periode-pkl";
import {
    useTahunAjaranApi,
    type TahunAjaran,
} from "~/composables/api/use-academic";
import { formatDate } from "~/utils/format-date";
import { createColumnHelper, type ColumnDef } from "@tanstack/vue-table";

definePageMeta({ layout: "admin" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const api = usePeriodePKLApi();
const tahunAjaranApi = useTahunAjaranApi();

// State
const loading = ref(true);
const tahunAjaranLoading = ref(true);
const activeSubMenu = ref<"periode" | "tahun-ajaran">("periode");
const search = ref("");
const tahunAjaranSearch = ref("");
const filterStatus = ref("Semua");
const data = ref<PeriodePKL[]>([]);
const tahunAjaranData = ref<TahunAjaran[]>([]);
const processing = ref<string | null>(null);
const tahunAjaranProcessing = ref(false);

// Modal states
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const showEditModal = ref(false);
const showCloneModal = ref(false);
const showReportModal = ref(false);
const selectedItem = ref<PeriodePKL | null>(null);
const showTahunAjaranModal = ref(false);
const editingTahunAjaran = ref(false);

const tahunAjaranForm = ref({
    id_tahun_ajaran: "",
    nama_tahun_ajaran: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status_aktif: false,
});
const tahunAjaranErrors = ref<Record<string, string>>({});

// Status options
const statusOptions = ["Semua", "Draft", "Aktif", "Selesai", "Arsip"];
const statusApiValue: Record<string, string> = {
    Draft: "draft",
    Aktif: "aktif",
    Selesai: "selesai",
    Arsip: "arsip",
};
const statusLabel: Record<string, string> = {
    draft: "Draft",
    aktif: "Aktif",
    selesai: "Selesai",
    arsip: "Arsip",
};
const statusColor: Record<string, string> = {
    draft: "warning",
    aktif: "success",
    selesai: "info",
    arsip: "neutral",
};
const statusBgColor: Record<string, string> = {
    draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
    aktif: "bg-green-50 text-green-700 border-green-200",
    selesai: "bg-blue-50 text-blue-700 border-blue-200",
    arsip: "bg-slate-100 text-slate-700 border-slate-200",
};

// Column helper
const columnHelper = createColumnHelper<PeriodePKL>();

// Status action button component
const StatusActionButton = ({ item }: { item: PeriodePKL }) => {
    const status = item.status;

    // Draft -> Aktif
    if (status === "draft") {
        return h(
            "button",
            {
                class: "px-3 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors flex items-center gap-1.5",
                onClick: () =>
                    changeStatus(
                        item.id_periode_pkl,
                        "aktif",
                        item.nama_periode,
                    ),
            },
            [
                h(
                    "svg",
                    {
                        class: "w-3.5 h-3.5",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": 2,
                    },
                    [h("path", { d: "M5 12h14M12 5l7 7-7 7" })],
                ),
                h("span", "Aktifkan"),
            ],
        );
    }

    // Aktif -> Selesai
    if (status === "aktif") {
        return h(
            "button",
            {
                class: "px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1.5",
                onClick: () =>
                    changeStatus(
                        item.id_periode_pkl,
                        "selesai",
                        item.nama_periode,
                    ),
            },
            [
                h(
                    "svg",
                    {
                        class: "w-3.5 h-3.5",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": 2,
                    },
                    [
                        h("path", {
                            d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                        }),
                    ],
                ),
                h("span", "Selesaikan"),
            ],
        );
    }

    // Selesai -> Arsip
    if (status === "selesai") {
        return h(
            "button",
            {
                class: "px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5",
                onClick: () => archiveItem(item),
            },
            [
                h(
                    "svg",
                    {
                        class: "w-3.5 h-3.5",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": 2,
                    },
                    [
                        h("path", {
                            d: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
                        }),
                    ],
                ),
                h("span", "Arsipkan"),
            ],
        );
    }

    // Arsip -> Restore
    if (status === "arsip") {
        return h(
            "button",
            {
                class: "px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5",
                onClick: () => restoreItem(item),
            },
            [
                h(
                    "svg",
                    {
                        class: "w-3.5 h-3.5",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        stroke: "currentColor",
                        "stroke-width": 2,
                    },
                    [
                        h("path", {
                            d: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6",
                        }),
                    ],
                ),
                h("span", "Pulihkan"),
            ],
        );
    }

    return null;
};

// Define columns
const columns: ColumnDef<PeriodePKL, any>[] = [
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
                { class: "text-sm text-slate-500" },
                pageIndex * pageSize + index + 1,
            );
        },
    },
    {
        id: "nama_periode",
        header: "Nama Periode",
        cell: ({ row }) => {
            return h("div", {}, [
                h(
                    "p",
                    { class: "text-sm font-medium text-slate-900" },
                    row.original.nama_periode,
                ),
                h(
                    "p",
                    { class: "text-xs text-slate-500" },
                    row.original.tahun_ajaran?.nama_tahun_ajaran || "-",
                ),
            ]);
        },
    },
    {
        id: "tanggal",
        header: "Periode",
        cell: ({ row }) => {
            const durasi = row.original.durasi_bulan || 0;
            return h("div", {}, [
                h(
                    "p",
                    { class: "text-sm text-slate-900" },
                    formatDate(row.original.tanggal_mulai),
                ),
                h(
                    "p",
                    { class: "text-xs text-slate-500" },
                    `s/d ${formatDate(row.original.tanggal_selesai)}`,
                ),
                h(
                    "p",
                    { class: "text-xs text-sky-600 mt-0.5" },
                    `${durasi} bulan`,
                ),
            ]);
        },
    },
    {
        id: "stats",
        header: "Siswa Ditempatkan",
        cell: ({ row }) => {
            const stats = row.original.stats;
            const count = row.original._count?.penempatan || 0;
            if (!stats) {
                return h(
                    "span",
                    { class: "text-sm text-slate-500" },
                    count + " siswa",
                );
            }
            return h("div", {}, [
                h("div", { class: "flex items-center gap-2" }, [
                    h(
                        "span",
                        { class: "text-sm font-medium text-slate-900" },
                        `${stats.siswa_ditempatkan}/${stats.total_siswa_kelas_12}`,
                    ),
                    h(
                        "span",
                        { class: "text-xs text-slate-500" },
                        `(${stats.progress_percentage}%)`,
                    ),
                ]),
                h(
                    "div",
                    { class: "w-full bg-slate-200 rounded-full h-1.5 mt-1" },
                    [
                        h("div", {
                            class: "bg-sky-500 h-1.5 rounded-full",
                            style: `width: ${stats.progress_percentage}%`,
                        }),
                    ],
                ),
            ]);
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            const label = statusLabel[status] || status;
            const bgColor = statusBgColor[status] || statusBgColor.draft;

            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "span",
                    {
                        class: `px-2 py-1 rounded-md text-xs font-medium ${bgColor}`,
                    },
                    label,
                ),
                h(StatusActionButton, { item: row.original }),
            ]);
        },
    },
    {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) => {
            const dropdownItems = [
                {
                    label: "Lihat Detail",
                    icon: "lucide:eye",
                    click: () => viewDetail(row.original),
                },
                {
                    label: "Edit",
                    icon: "lucide:pencil",
                    click: () => editItem(row.original),
                    disabled:
                        row.original.status === "selesai" ||
                        row.original.status === "arsip",
                },
                {
                    label: "Clone Periode",
                    icon: "lucide:copy",
                    click: () => cloneItem(row.original),
                },
                {
                    label: "Laporan",
                    icon: "lucide:file-bar-chart",
                    click: () => viewReport(row.original),
                },
            ];

            // Add delete option for draft only without placements
            if (
                row.original.status === "draft" &&
                !row.original._count?.penempatan
            ) {
                dropdownItems.push({
                    label: "Hapus",
                    icon: "lucide:trash-2",
                    click: () => deleteItem(row.original),
                });
            }

            return h("div", { class: "flex items-center gap-2" }, [
                // Detail button
                h(
                    "button",
                    {
                        class: "p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors",
                        onClick: () => viewDetail(row.original),
                        title: "Lihat Detail",
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

                // Edit button
                h(
                    "button",
                    {
                        class: `p-2 rounded-lg transition-colors ${
                            row.original.status === "selesai" ||
                            row.original.status === "arsip"
                                ? "text-slate-300 cursor-not-allowed"
                                : "hover:bg-blue-50 text-blue-600"
                        }`,
                        onClick: () => {
                            if (
                                row.original.status !== "selesai" &&
                                row.original.status !== "arsip"
                            ) {
                                editItem(row.original);
                            }
                        },
                        title:
                            row.original.status === "selesai" ||
                            row.original.status === "arsip"
                                ? "Tidak bisa edit periode yang selesai/diarsipkan"
                                : "Edit Periode",
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
                                d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7",
                            }),
                            h("path", {
                                d: "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
                            }),
                        ],
                    ),
                ),
            ]);
        },
    },
];

const tahunAjaranColumns: ColumnDef<TahunAjaran, any>[] = [
    {
        id: "nama_tahun_ajaran",
        header: "Tahun Ajaran",
        cell: ({ row }) =>
            h("div", {}, [
                h(
                    "p",
                    { class: "text-sm font-medium text-slate-900" },
                    row.original.nama_tahun_ajaran,
                ),
                h(
                    "p",
                    { class: "text-xs text-slate-500" },
                    row.original.id_tahun_ajaran,
                ),
            ]),
    },
    {
        id: "tanggal",
        header: "Rentang Tanggal",
        cell: ({ row }) =>
            h("div", {}, [
                h(
                    "p",
                    { class: "text-sm text-slate-900" },
                    formatDate(row.original.tanggal_mulai || ""),
                ),
                h(
                    "p",
                    { class: "text-xs text-slate-500" },
                    `s/d ${formatDate(row.original.tanggal_selesai || "")}`,
                ),
            ]),
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.status_aktif;
            return h("div", { class: "flex items-center gap-2" }, [
                h(
                    "span",
                    {
                        class: `px-2 py-1 rounded-md text-xs font-medium ${
                            isActive
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`,
                    },
                    isActive ? "Aktif" : "Nonaktif",
                ),
                !isActive &&
                    h(
                        "button",
                        {
                            class: "px-2.5 py-1 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors",
                            onClick: () => setActiveTahunAjaran(row.original),
                        },
                        "Aktifkan",
                    ),
            ]);
        },
    },
    {
        id: "aksi",
        header: "Aksi",
        cell: ({ row }) =>
            h("div", { class: "flex items-center gap-2" }, [
                h(
                    "button",
                    {
                        class: "p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors",
                        title: "Edit Tahun Ajaran",
                        onClick: () => openTahunAjaranModal(row.original),
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
                        class: `p-2 rounded-lg transition-colors ${
                            row.original.status_aktif
                                ? "text-slate-300 cursor-not-allowed"
                                : "hover:bg-red-50 text-red-600"
                        }`,
                        title: row.original.status_aktif
                            ? "Tahun ajaran aktif tidak bisa dihapus"
                            : "Hapus Tahun Ajaran",
                        onClick: () => {
                            if (!row.original.status_aktif) {
                                deleteTahunAjaran(row.original);
                            }
                        },
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
                                d: "M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14",
                            }),
                        ],
                    ),
                ),
            ]),
    },
];

// Filtered data
const filteredData = computed(() => {
    let result = data.value.filter((d) => {
        const matchSearch =
            !search.value ||
            d.nama_periode.toLowerCase().includes(search.value.toLowerCase()) ||
            d.tahun_ajaran?.nama_tahun_ajaran
                .toLowerCase()
                .includes(search.value.toLowerCase());
        const matchStatus =
            filterStatus.value === "Semua" ||
            d.status === statusApiValue[filterStatus.value];
        return matchSearch && matchStatus;
    });

    // Sort by created_at desc
    result.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
    });

    return result;
});

const filteredTahunAjaranData = computed(() => {
    const keyword = tahunAjaranSearch.value.toLowerCase();
    return tahunAjaranData.value.filter((item) => {
        if (!keyword) return true;
        return (
            item.nama_tahun_ajaran.toLowerCase().includes(keyword) ||
            item.id_tahun_ajaran.toLowerCase().includes(keyword)
        );
    });
});

// ==================== STATUS CHANGE ACTIONS ====================

const changeStatus = async (id: string, newStatus: string, nama: string) => {
    const statusLabel =
        newStatus === "aktif"
            ? "Aktif"
            : newStatus === "selesai"
              ? "Selesai"
              : newStatus;
    const confirmMsg =
        newStatus === "aktif"
            ? `Aktifkan periode "${nama}"?\n\nPastikan data periode sudah benar. Setelah diaktifkan, periode tidak dapat dihapus.`
            : newStatus === "selesai"
              ? `Selesaikan periode "${nama}"?\n\nPastikan semua penempatan sudah selesai. Periode yang selesai tidak dapat diedit.`
              : `Ubah status periode "${nama}" menjadi ${statusLabel}?`;

    if (!confirm(confirmMsg)) return;

    processing.value = id;
    try {
        await api.updateStatus(id, newStatus);
        toast.add({
            title: `Periode berhasil diubah menjadi ${statusLabel}`,
            color: "success",
        });
        await fetchData();
    } catch (error: any) {
        toast.add({
            title: "Gagal mengubah status periode",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        processing.value = null;
    }
};

const archiveItem = async (item: PeriodePKL) => {
    if (
        !confirm(
            `Arsipkan periode "${item.nama_periode}"?\n\nPeriode yang diarsipkan tidak dapat diedit lagi.`,
        )
    )
        return;

    processing.value = item.id_periode_pkl;
    try {
        await api.archive(item.id_periode_pkl);
        toast.add({ title: "Periode berhasil diarsipkan", color: "success" });
        await fetchData();
    } catch (error: any) {
        toast.add({
            title: "Gagal mengarsipkan periode",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        processing.value = null;
    }
};

const restoreItem = async (item: PeriodePKL) => {
    if (!confirm(`Pulihkan periode "${item.nama_periode}" dari arsip?`)) return;

    processing.value = item.id_periode_pkl;
    try {
        await api.restore(item.id_periode_pkl);
        toast.add({ title: "Periode berhasil dipulihkan", color: "success" });
        await fetchData();
    } catch (error: any) {
        toast.add({
            title: "Gagal memulihkan periode",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        processing.value = null;
    }
};

// ==================== OTHER ACTIONS ====================

const viewDetail = (item: PeriodePKL) => {
    selectedItem.value = item;
    showDetailModal.value = true;
};

const editItem = (item: PeriodePKL) => {
    selectedItem.value = item;
    showEditModal.value = true;
};

const cloneItem = (item: PeriodePKL) => {
    selectedItem.value = item;
    showCloneModal.value = true;
};

const viewReport = (item: PeriodePKL) => {
    selectedItem.value = item;
    showReportModal.value = true;
};

const deleteItem = async (item: PeriodePKL) => {
    if (
        !confirm(
            `Hapus periode "${item.nama_periode}"?\n\nTindakan ini tidak dapat dibatalkan.`,
        )
    )
        return;

    processing.value = item.id_periode_pkl;
    try {
        await api.remove(item.id_periode_pkl);
        toast.add({ title: "Periode berhasil dihapus", color: "success" });
        await fetchData();
    } catch (error: any) {
        toast.add({
            title: "Gagal menghapus periode",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        processing.value = null;
    }
};

// ==================== TAHUN AJARAN ACTIONS ====================

const resetTahunAjaranForm = () => {
    tahunAjaranForm.value = {
        id_tahun_ajaran: "",
        nama_tahun_ajaran: "",
        tanggal_mulai: "",
        tanggal_selesai: "",
        status_aktif: false,
    };
    tahunAjaranErrors.value = {};
};

const openTahunAjaranModal = (item?: TahunAjaran) => {
    editingTahunAjaran.value = Boolean(item);
    if (item) {
        tahunAjaranForm.value = {
            id_tahun_ajaran: item.id_tahun_ajaran,
            nama_tahun_ajaran: item.nama_tahun_ajaran,
            tanggal_mulai: item.tanggal_mulai?.split("T")[0] || "",
            tanggal_selesai: item.tanggal_selesai?.split("T")[0] || "",
            status_aktif: item.status_aktif,
        };
    } else {
        resetTahunAjaranForm();
    }
    showTahunAjaranModal.value = true;
};

const validateTahunAjaranForm = () => {
    tahunAjaranErrors.value = {};

    if (!tahunAjaranForm.value.nama_tahun_ajaran.trim()) {
        tahunAjaranErrors.value.nama_tahun_ajaran =
            "Nama tahun ajaran wajib diisi";
    }
    if (!tahunAjaranForm.value.tanggal_mulai) {
        tahunAjaranErrors.value.tanggal_mulai = "Tanggal mulai wajib diisi";
    }
    if (!tahunAjaranForm.value.tanggal_selesai) {
        tahunAjaranErrors.value.tanggal_selesai = "Tanggal selesai wajib diisi";
    }
    if (
        tahunAjaranForm.value.tanggal_mulai &&
        tahunAjaranForm.value.tanggal_selesai &&
        tahunAjaranForm.value.tanggal_selesai <=
            tahunAjaranForm.value.tanggal_mulai
    ) {
        tahunAjaranErrors.value.tanggal_selesai =
            "Tanggal selesai harus setelah tanggal mulai";
    }

    return Object.keys(tahunAjaranErrors.value).length === 0;
};

const saveTahunAjaran = async () => {
    if (!validateTahunAjaranForm()) return;

    tahunAjaranProcessing.value = true;
    try {
        const payload = {
            nama_tahun_ajaran: tahunAjaranForm.value.nama_tahun_ajaran.trim(),
            tanggal_mulai: tahunAjaranForm.value.tanggal_mulai,
            tanggal_selesai: tahunAjaranForm.value.tanggal_selesai,
            status_aktif: tahunAjaranForm.value.status_aktif,
        };

        const response =
            editingTahunAjaran.value && tahunAjaranForm.value.id_tahun_ajaran
                ? await tahunAjaranApi.update(
                      tahunAjaranForm.value.id_tahun_ajaran,
                      payload,
                  )
                : await tahunAjaranApi.create(payload);

        if (!response.success) {
            throw new Error(response.message || "Gagal menyimpan tahun ajaran");
        }

        toast.add({
            title: editingTahunAjaran.value
                ? "Tahun ajaran berhasil diperbarui"
                : "Tahun ajaran berhasil ditambahkan",
            color: "success",
        });
        showTahunAjaranModal.value = false;
        await fetchTahunAjaranData();
    } catch (error: any) {
        toast.add({
            title: "Gagal menyimpan tahun ajaran",
            description: error?.message || "Terjadi kesalahan",
            color: "error",
        });
    } finally {
        tahunAjaranProcessing.value = false;
    }
};

const setActiveTahunAjaran = async (item: TahunAjaran) => {
    tahunAjaranProcessing.value = true;
    try {
        const response = await tahunAjaranApi.update(item.id_tahun_ajaran, {
            status_aktif: true,
        });
        if (!response.success) {
            throw new Error(response.message || "Gagal mengaktifkan tahun ajaran");
        }
        toast.add({
            title: `${item.nama_tahun_ajaran} diaktifkan`,
            color: "success",
        });
        await fetchTahunAjaranData();
    } catch (error: any) {
        toast.add({
            title: "Gagal mengaktifkan tahun ajaran",
            description: error?.message,
            color: "error",
        });
    } finally {
        tahunAjaranProcessing.value = false;
    }
};

const deleteTahunAjaran = async (item: TahunAjaran) => {
    if (
        !confirm(
            `Hapus tahun ajaran "${item.nama_tahun_ajaran}"?\n\nData ini tidak dapat dihapus jika masih dipakai kelas, periode, penempatan, atau pengajuan.`,
        )
    )
        return;

    tahunAjaranProcessing.value = true;
    try {
        const response = await tahunAjaranApi.remove(item.id_tahun_ajaran);
        if (!response.success) {
            throw new Error(response.message || "Gagal menghapus tahun ajaran");
        }
        toast.add({ title: "Tahun ajaran berhasil dihapus", color: "success" });
        await fetchTahunAjaranData();
    } catch (error: any) {
        toast.add({
            title: "Gagal menghapus tahun ajaran",
            description: error?.message,
            color: "error",
        });
    } finally {
        tahunAjaranProcessing.value = false;
    }
};

// Fetch data
const fetchData = async () => {
    loading.value = true;
    try {
        const response = await api.getAll({ limit: 100 });
        if (response.success) {
            data.value = response.data || [];
        }
    } catch (error: any) {
        console.error("Failed to fetch periode PKL:", error);
        toast.add({
            title: "Gagal memuat data",
            description: error.response?.data?.message || error.message,
            color: "error",
        });
    } finally {
        loading.value = false;
    }
};

const fetchTahunAjaranData = async () => {
    tahunAjaranLoading.value = true;
    try {
        const response = await tahunAjaranApi.getAll({ limit: 1000 });
        if (response.success) {
            tahunAjaranData.value = response.data || [];
        }
    } catch (error: any) {
        console.error("Failed to fetch tahun ajaran:", error);
        toast.add({
            title: "Gagal memuat tahun ajaran",
            description: error?.message,
            color: "error",
        });
    } finally {
        tahunAjaranLoading.value = false;
    }
};

const navigateToCreate = () => {
    showCreateModal.value = true;
    router.replace({ query: { ...route.query, modal: "create" } });
};

// Modal handlers
const closeModal = () => {
    showCreateModal.value = false;
    showDetailModal.value = false;
    showEditModal.value = false;
    showCloneModal.value = false;
    showReportModal.value = false;
    selectedItem.value = null;

    if (route.query.modal) {
        const nextQuery = { ...route.query } as Record<string, any>;
        delete nextQuery.modal;
        router.replace({ query: nextQuery });
    }
};

const handleSaved = () => {
    closeModal();
    fetchData();
};

onMounted(() => {
    fetchData();
    fetchTahunAjaranData();
});

watch(
    () => route.query.modal,
    (value) => {
        if (value === "create") {
            showCreateModal.value = true;
        }
    },
    { immediate: true },
);

useHead({ title: "Periode PKL | Admin" });
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-xl lg:text-2xl font-bold text-slate-900">
                    Periode PKL
                </h1>
                <p class="text-sm text-slate-500">
                    Kelola periode PKL dan master data tahun ajaran
                </p>
            </div>
            <UButton
                v-if="activeSubMenu === 'periode'"
                icon="lucide:plus"
                @click="navigateToCreate"
            >
                Tambah Periode
            </UButton>
            <UButton
                v-else
                icon="lucide:plus"
                @click="openTahunAjaranModal()"
            >
                Tambah Tahun Ajaran
            </UButton>
        </div>

        <!-- Sub Menu -->
        <div
            class="flex flex-wrap gap-2 border-b border-slate-200 pb-3"
        >
            <button
                type="button"
                :class="[
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeSubMenu === 'periode'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent',
                ]"
                @click="activeSubMenu = 'periode'"
            >
                <Icon name="lucide:calendar-clock" class="w-4 h-4" />
                Periode PKL
            </button>
            <button
                type="button"
                :class="[
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeSubMenu === 'tahun-ajaran'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-100 border border-transparent',
                ]"
                @click="activeSubMenu = 'tahun-ajaran'"
            >
                <Icon name="lucide:calendar-days" class="w-4 h-4" />
                Tahun Ajaran
            </button>
        </div>

        <!-- Flow Guide -->
        <div
            v-if="activeSubMenu === 'periode'"
            class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4"
        >
            <div class="flex items-center gap-2 mb-2">
                <Icon name="lucide:info" class="w-4 h-4 text-blue-600" />
                <span class="text-sm font-medium text-blue-900"
                    >Alur Status Periode PKL</span
                >
            </div>
            <div
                class="flex items-center gap-2 text-xs text-blue-700 overflow-x-auto pb-1"
            >
                <span
                    class="px-2 py-1 rounded bg-white border border-blue-200 font-medium"
                    >Draft</span
                >
                <Icon name="lucide:arrow-right" class="w-4 h-4 flex-shrink-0" />
                <span
                    class="px-2 py-1 rounded bg-white border border-blue-200 font-medium"
                    >Aktif</span
                >
                <Icon name="lucide:arrow-right" class="w-4 h-4 flex-shrink-0" />
                <span
                    class="px-2 py-1 rounded bg-white border border-blue-200 font-medium"
                    >Selesai</span
                >
                <Icon name="lucide:arrow-right" class="w-4 h-4 flex-shrink-0" />
                <span
                    class="px-2 py-1 rounded bg-white border border-blue-200 font-medium"
                    >Arsip</span
                >
            </div>
        </div>

        <!-- Quick Stats -->
        <div
            v-if="activeSubMenu === 'periode'"
            class="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:rocket"
                            class="w-5 h-5 text-green-600"
                        />
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-slate-900">
                            {{
                                data.filter((d) => d.status === "aktif").length
                            }}
                        </p>
                        <p class="text-xs text-slate-500">Periode Aktif</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:file-edit"
                            class="w-5 h-5 text-yellow-600"
                        />
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-slate-900">
                            {{
                                data.filter((d) => d.status === "draft").length
                            }}
                        </p>
                        <p class="text-xs text-slate-500">Draft</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:check-circle"
                            class="w-5 h-5 text-blue-600"
                        />
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-slate-900">
                            {{
                                data.filter((d) => d.status === "selesai")
                                    .length
                            }}
                        </p>
                        <p class="text-xs text-slate-500">Selesai</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"
                    >
                        <Icon
                            name="lucide:archive"
                            class="w-5 h-5 text-slate-600"
                        />
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-slate-900">
                            {{
                                data.filter((d) => d.status === "arsip").length
                            }}
                        </p>
                        <p class="text-xs text-slate-500">Arsip</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <CommonAppDataTable
            v-if="activeSubMenu === 'periode'"
            :data="filteredData"
            :columns="columns"
            :loading="loading"
            :searchable="false"
            with-time
            empty-title="Tidak ada periode PKL"
            empty-description="Belum ada periode PKL yang dibuat"
            empty-icon="lucide:calendar-clock"
        >
            <template #toolbar-left>
                <UInput
                    v-model="search"
                    placeholder="Cari periode..."
                    class="flex-1 max-w-xs"
                >
                    <template #leading>
                        <Icon
                            name="lucide:search"
                            class="w-4 h-4 text-slate-400"
                        />
                    </template>
                </UInput>
                <USelectMenu
                    v-model="filterStatus"
                    :items="statusOptions"
                    class="w-full sm:w-40"
                />
            </template>
        </CommonAppDataTable>

        <!-- Tahun Ajaran Table -->
        <CommonAppDataTable
            v-else
            :data="filteredTahunAjaranData"
            :columns="tahunAjaranColumns"
            :loading="tahunAjaranLoading"
            :searchable="false"
            with-time
            empty-title="Tidak ada tahun ajaran"
            empty-description="Belum ada master data tahun ajaran"
            empty-icon="lucide:calendar-days"
        >
            <template #toolbar-left>
                <UInput
                    v-model="tahunAjaranSearch"
                    placeholder="Cari tahun ajaran..."
                    class="flex-1 max-w-xs"
                >
                    <template #leading>
                        <Icon
                            name="lucide:search"
                            class="w-4 h-4 text-slate-400"
                        />
                    </template>
                </UInput>
            </template>
        </CommonAppDataTable>

        <!-- Create Modal -->
        <AdminPeriodePklCreateModal
            v-if="showCreateModal"
            @close="closeModal"
            @saved="handleSaved"
        />

        <!-- Detail Modal -->
        <AdminPeriodePklDetailModal
            v-if="showDetailModal"
            :periode="selectedItem"
            @close="closeModal"
            @edit="selectedItem && editItem(selectedItem)"
            @clone="selectedItem && cloneItem(selectedItem)"
            @archive="selectedItem && archiveItem(selectedItem)"
            @restore="selectedItem && restoreItem(selectedItem)"
            @status-change="
                selectedItem &&
                changeStatus(
                    selectedItem.id_periode_pkl,
                    $event,
                    selectedItem.nama_periode,
                )
            "
        />

        <!-- Edit Modal -->
        <AdminPeriodePklEditModal
            v-if="showEditModal"
            :periode="selectedItem"
            @close="closeModal"
            @saved="handleSaved"
        />

        <!-- Clone Modal -->
        <AdminPeriodePklCloneModal
            v-if="showCloneModal"
            :source-periode="selectedItem"
            @close="closeModal"
            @saved="handleSaved"
        />

        <!-- Report Modal -->
        <AdminPeriodePklReportModal
            v-if="showReportModal"
            :periode="selectedItem"
            @close="closeModal"
        />

        <!-- Tahun Ajaran Modal -->
        <UModal
            :open="showTahunAjaranModal"
            @update:open="showTahunAjaranModal = $event"
            :title="editingTahunAjaran ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'"
            description="Kelola master data tahun ajaran untuk periode PKL"
        >
            <template #body>
                <div class="space-y-4">
                    <div>
                        <label
                            class="block text-sm font-medium text-slate-700 mb-1"
                        >
                            Nama Tahun Ajaran
                            <span class="text-red-500">*</span>
                        </label>
                        <UInput
                            v-model="tahunAjaranForm.nama_tahun_ajaran"
                            placeholder="Contoh: 2026/2027"
                            :disabled="tahunAjaranProcessing"
                            class="w-full"
                        />
                        <p
                            v-if="tahunAjaranErrors.nama_tahun_ajaran"
                            class="text-xs text-red-500 mt-1"
                        >
                            {{ tahunAjaranErrors.nama_tahun_ajaran }}
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label
                                class="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Tanggal Mulai
                                <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="tahunAjaranForm.tanggal_mulai"
                                type="date"
                                :disabled="tahunAjaranProcessing"
                                class="w-full"
                            />
                            <p
                                v-if="tahunAjaranErrors.tanggal_mulai"
                                class="text-xs text-red-500 mt-1"
                            >
                                {{ tahunAjaranErrors.tanggal_mulai }}
                            </p>
                        </div>
                        <div>
                            <label
                                class="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Tanggal Selesai
                                <span class="text-red-500">*</span>
                            </label>
                            <UInput
                                v-model="tahunAjaranForm.tanggal_selesai"
                                type="date"
                                :min="tahunAjaranForm.tanggal_mulai"
                                :disabled="tahunAjaranProcessing"
                                class="w-full"
                            />
                            <p
                                v-if="tahunAjaranErrors.tanggal_selesai"
                                class="text-xs text-red-500 mt-1"
                            >
                                {{ tahunAjaranErrors.tanggal_selesai }}
                            </p>
                        </div>
                    </div>

                    <label class="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            v-model="tahunAjaranForm.status_aktif"
                            type="checkbox"
                            class="w-4 h-4 rounded border-slate-300"
                            :disabled="tahunAjaranProcessing"
                        />
                        Jadikan tahun ajaran aktif
                    </label>
                </div>
            </template>
            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton
                        variant="outline"
                        color="neutral"
                        :disabled="tahunAjaranProcessing"
                        @click="showTahunAjaranModal = false"
                    >
                        Batal
                    </UButton>
                    <UButton
                        color="primary"
                        :loading="tahunAjaranProcessing"
                        @click="saveTahunAjaran"
                    >
                        Simpan
                    </UButton>
                </div>
            </template>
        </UModal>
    </div>
</template>
