import { useReportingApi } from "~/composables/api/use-reporting-api";
import type { PaginationMeta } from "~/composables/api/use-reporting-api";

export interface ReportFilters {
  tahun_ajaran_id: string | null;
  id_periode_pkl: string | null;
  id_jurusan: string | null;
  id_perusahaan: string | null;
  status: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
}

export interface ReportColumn {
  accessorKey: string;
  header: string;
}

export function useReporting() {
  const api = useReportingApi();

  // State
  const loading = ref(false);
  const selectedReportType = ref("placement");
  const reportData = ref<any[]>([]);
  const statistics = ref<any>(null);
  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const filters = ref<ReportFilters>({
    tahun_ajaran_id: null,
    id_periode_pkl: null,
    id_jurusan: null,
    id_perusahaan: null,
    status: null,
    tanggal_mulai: null,
    tanggal_selesai: null,
  });

  // Computed
  const currentColumns = computed<ReportColumn[]>(() => {
    switch (selectedReportType.value) {
      case "placement":
        return [
          { accessorKey: "siswa.nis", header: "NIS" },
          { accessorKey: "siswa.nama_siswa", header: "Nama Siswa" },
          {
            accessorKey: "siswa.kelas.jurusan.nama_jurusan",
            header: "Jurusan",
          },
          {
            accessorKey: "perusahaan.nama_perusahaan",
            header: "Perusahaan",
          },
          { accessorKey: "guru.nama_guru", header: "Pembimbing" },
          { accessorKey: "status_penempatan", header: "Status" },
        ];

      case "attendance":
        return [
          { accessorKey: "siswa.nis", header: "NIS" },
          { accessorKey: "siswa.nama_siswa", header: "Nama Siswa" },
          {
            accessorKey: "perusahaan.nama_perusahaan",
            header: "Perusahaan",
          },
          { accessorKey: "present_days", header: "Hadir" },
          { accessorKey: "absent_days", header: "Tidak Hadir" },
          { accessorKey: "attendance_rate", header: "Persentase" },
        ];

      case "logbook":
        return [
          { accessorKey: "siswa.nis", header: "NIS" },
          { accessorKey: "siswa.nama_siswa", header: "Nama Siswa" },
          { accessorKey: "tanggal", header: "Tanggal" },
          { accessorKey: "judul_kegiatan", header: "Kegiatan" },
          { accessorKey: "status_persetujuan", header: "Status" },
        ];

      case "monitoring":
        return [
          { accessorKey: "guru.nama_guru", header: "Guru" },
          { accessorKey: "siswa.nama_siswa", header: "Siswa" },
          {
            accessorKey: "perusahaan.nama_perusahaan",
            header: "Perusahaan",
          },
          { accessorKey: "tanggal_monitoring", header: "Tanggal" },
          { accessorKey: "kendala", header: "Kendala" },
        ];

      case "application":
        return [
          { accessorKey: "siswa.nis", header: "NIS" },
          { accessorKey: "siswa.nama_siswa", header: "Nama Siswa" },
          {
            accessorKey: "perusahaan.nama_perusahaan",
            header: "Perusahaan",
          },
          { accessorKey: "tanggal_pengajuan", header: "Tanggal" },
          { accessorKey: "status_pengajuan", header: "Status" },
        ];

      case "company":
        return [
          {
            accessorKey: "nama_perusahaan",
            header: "Nama Perusahaan",
          },
          { accessorKey: "bidang_usaha", header: "Bidang Usaha" },
          { accessorKey: "kapasitas_siswa", header: "Kapasitas" },
          { accessorKey: "active_placements", header: "Terisi" },
          {
            accessorKey: "capacity_utilization",
            header: "Utilisasi",
          },
        ];

      case "teacher":
        return [
          { accessorKey: "nama_guru", header: "Nama Guru" },
          { accessorKey: "active_students", header: "Siswa Aktif" },
          {
            accessorKey: "monitoring_visits",
            header: "Kunjungan",
          },
        ];

      default:
        return [];
    }
  });

  // Methods
  async function fetchReportData() {
    loading.value = true;

    try {
      const params = {
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit,
      };

      // Remove null/undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      let response;
      switch (selectedReportType.value) {
        case "placement":
          response = await api.getPlacementReport(params);
          break;
        case "attendance":
          response = await api.getAttendanceReport(params);
          break;
        case "logbook":
          response = await api.getLogbookReport(params);
          break;
        case "monitoring":
          response = await api.getMonitoringReport(params);
          break;
        case "application":
          response = await api.getApplicationReport(params);
          break;
        case "company":
          response = await api.getCompanyReport(params);
          break;
        case "teacher":
          response = await api.getTeacherReport(params);
          break;
        default:
          response = { success: false };
      }

      if (response.success) {
        reportData.value = response.data || [];
        statistics.value = response.statistics || null;
        pagination.value = {
          ...pagination.value,
          ...response.pagination,
        };
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      reportData.value = [];
      statistics.value = null;
    } finally {
      loading.value = false;
    }
  }

  function applyFilters() {
    pagination.value.page = 1;
    fetchReportData();
  }

  function resetFilters() {
    filters.value = {
      tahun_ajaran_id: null,
      id_periode_pkl: null,
      id_jurusan: null,
      id_perusahaan: null,
      status: null,
      tanggal_mulai: null,
      tanggal_selesai: null,
    };
    pagination.value.page = 1;
    fetchReportData();
  }

  function nextPage() {
    if (pagination.value.hasNextPage) {
      pagination.value.page++;
      fetchReportData();
    }
  }

  function previousPage() {
    if (pagination.value.hasPrevPage) {
      pagination.value.page--;
      fetchReportData();
    }
  }

  async function exportReport(
    format: "pdf" | "excel",
  ): Promise<{ url: string; filename: string } | void> {
    try {
      const params = {
        ...filters.value,
        format,
      };

      // Remove null/undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const blob = await api.exportReport(selectedReportType.value, params);
      const url = window.URL.createObjectURL(blob);
      const filename = `laporan-${selectedReportType.value}-${new Date().getTime()}.${format === "pdf" ? "pdf" : "xlsx"}`;

      if (format === "pdf") {
        // For PDF, return the URL so the component can show a preview
        return { url, filename };
      } else {
        // For Excel, auto download immediately
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      throw error;
    }
  }

  // Watch report type changes
  watch(selectedReportType, () => {
    resetFilters();
  });

  return {
    // State
    loading,
    selectedReportType,
    reportData,
    statistics,
    pagination,
    filters,

    // Computed
    currentColumns,

    // Methods
    fetchReportData,
    applyFilters,
    resetFilters,
    nextPage,
    previousPage,
    exportReport,
  };
}
