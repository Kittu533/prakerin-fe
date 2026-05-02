import { useDataStore } from "~/stores/data-store";

export interface PlacementReportParams {
  tahun_ajaran_id?: string;
  id_periode_pkl?: string;
  id_jurusan?: string;
  id_kelas?: string;
  id_perusahaan?: string;
  status_penempatan?: "aktif" | "selesai" | "dibatalkan";
  page?: number;
  limit?: number;
}

export interface PklStatisticsParams {
  tahun_ajaran_id?: string;
}

export interface AttendanceReportParams {
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  siswa_id?: string;
  id_perusahaan?: string;
  page?: number;
  limit?: number;
}

export interface LogbookReportParams {
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  siswa_id?: string;
  status_persetujuan?: "menunggu" | "disetujui" | "ditolak";
  page?: number;
  limit?: number;
}

export interface AssessmentReportParams {
  tahun_ajaran_id?: string;
  id_jurusan?: string;
  id_perusahaan?: string;
  page?: number;
  limit?: number;
}

export interface MonitoringReportParams {
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  guru_id?: string;
  id_perusahaan?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationReportParams {
  tahun_ajaran_id?: string;
  status_pengajuan?: "menunggu" | "disetujui" | "ditolak";
  id_perusahaan?: string;
  page?: number;
  limit?: number;
}

export interface CompanyReportParams {
  status_kerjasama?: boolean;
  bidang_usaha?: string;
  page?: number;
  limit?: number;
}

export interface TeacherReportParams {
  tahun_ajaran_id?: string;
  page?: number;
  limit?: number;
}

export interface UnplacedStudentsReportParams {
  tahun_ajaran_id?: string;
  id_jurusan?: string;
  id_kelas?: string;
  page?: number;
  limit?: number;
}

export interface ExportParams {
  format: "pdf" | "excel";
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PlacementStatistics {
  total_placements: number;
  active_placements: number;
  completed_placements: number;
  cancelled_placements: number;
  placements_by_company: Array<{ company: string; count: number }>;
  placements_by_major: Array<{ major: string; count: number }>;
}

export interface AttendanceStatistics {
  total_students: number;
  average_attendance_rate: number;
  students_with_low_attendance: number;
  total_present: number;
  total_absent: number;
  total_leave: number;
  total_sick: number;
}

export interface LogbookStatistics {
  total_entries: number;
  pending_approvals: number;
  approved_entries: number;
  rejected_entries: number;
  average_entries_per_week: number;
}

export interface AssessmentStatistics {
  total_assessments: number;
  average_final_grade: number;
  average_by_major: Array<{ major: string; average: number }>;
  average_by_company: Array<{ company: string; average: number }>;
  grade_distribution: {
    range_90_100: number;
    range_80_89: number;
    range_70_79: number;
    range_60_69: number;
    below_60: number;
  };
}

export interface MonitoringStatistics {
  total_visits: number;
  visits_by_teacher: Array<{ teacher: string; count: number }>;
  visits_by_company: Array<{ company: string; count: number }>;
  visits_with_issues: number;
  unmonitored_placements: number;
}

export interface ApplicationStatistics {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
  approval_rate: number;
  applications_by_company: Array<{ company: string; count: number }>;
  applications_by_month: Array<{ month: string; count: number }>;
}

export interface UnplacedStudentsStatistics {
  total_unplaced: number;
  unplaced_by_major: Array<{ major: string; count: number }>;
  unplaced_by_class: Array<{ className: string; count: number }>;
}

export interface CompanyStatistics {
  total_companies: number;
  active_partnerships: number;
  total_capacity: number;
  utilized_capacity: number;
  average_placements_per_company: number;
  over_capacity_companies: number;
}

export interface TeacherStatistics {
  total_teachers: number;
  average_students_per_teacher: number;
  total_monitoring_visits: number;
  average_visits_per_teacher: number;
}

export interface PklAcademicYearOption {
  id: string;
  label: string;
  is_active: boolean;
}

export interface PklStatisticPoint {
  label: string;
  count: number;
}

export interface PklDepartmentDistributionPoint extends PklStatisticPoint {
  percentage: number;
}

export interface PklStatisticsOverview {
  active_year: PklAcademicYearOption | null;
  academic_years: PklAcademicYearOption[];
  quick_stats: {
    total_students: number;
    placed_students: number;
    total_companies: number;
    active_mous: number;
    active_companies: number;
    pending_applications: number;
    unplaced_students: number;
  };
  placement_status: {
    placed: number;
    pending_applications: number;
    unplaced: number;
  };
  monthly_trend: PklStatisticPoint[];
  industry_categories: PklStatisticPoint[];
  department_distribution: PklDepartmentDistributionPoint[];
}

export interface SingleDataResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ReportResponse<T = any, S = any> {
  success: boolean;
  message?: string;
  data: T[];
  statistics: S;
  pagination: PaginationMeta;
}

export function useReportingApi() {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiUrl || "http://localhost:3000/api";
  const dataStore = useDataStore();

  const getToken = () => {
    return (
      dataStore.token ||
      (import.meta.client ? localStorage.getItem("token") : "")
    );
  };

  /**
   * Get SIAP PKL statistics overview
   */
  async function getPklStatistics(
    params: PklStatisticsParams = {},
  ): Promise<SingleDataResponse<PklStatisticsOverview>> {
    try {
      const response = await $fetch<SingleDataResponse<PklStatisticsOverview>>(
        `${baseURL}/reporting/pkl-statistics`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching PKL statistics:", error);
      throw error;
    }
  }

  /**
   * Get placement report
   */
  async function getPlacementReport(
    params: PlacementReportParams = {},
  ): Promise<ReportResponse<any, PlacementStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, PlacementStatistics>>(
        `${baseURL}/reporting/placements`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching placement report:", error);
      throw error;
    }
  }

  /**
   * Get attendance report
   */
  async function getAttendanceReport(
    params: AttendanceReportParams = {},
  ): Promise<ReportResponse<any, AttendanceStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, AttendanceStatistics>>(
        `${baseURL}/reporting/attendance`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching attendance report:", error);
      throw error;
    }
  }

  /**
   * Get logbook report
   */
  async function getLogbookReport(
    params: LogbookReportParams = {},
  ): Promise<ReportResponse<any, LogbookStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, LogbookStatistics>>(
        `${baseURL}/reporting/logbooks`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching logbook report:", error);
      throw error;
    }
  }

  /**
   * Get assessment report
   */
  async function getAssessmentReport(
    params: AssessmentReportParams = {},
  ): Promise<ReportResponse<any, AssessmentStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, AssessmentStatistics>>(
        `${baseURL}/reporting/assessments`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching assessment report:", error);
      throw error;
    }
  }

  /**
   * Get monitoring report
   */
  async function getMonitoringReport(
    params: MonitoringReportParams = {},
  ): Promise<ReportResponse<any, MonitoringStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, MonitoringStatistics>>(
        `${baseURL}/reporting/monitoring`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching monitoring report:", error);
      throw error;
    }
  }

  /**
   * Get application report
   */
  async function getApplicationReport(
    params: ApplicationReportParams = {},
  ): Promise<ReportResponse<any, ApplicationStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, ApplicationStatistics>>(
        `${baseURL}/reporting/applications`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching application report:", error);
      throw error;
    }
  }

  /**
   * Get company report
   */
  async function getCompanyReport(
    params: CompanyReportParams = {},
  ): Promise<ReportResponse<any, CompanyStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, CompanyStatistics>>(
        `${baseURL}/reporting/companies`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching company report:", error);
      throw error;
    }
  }

  /**
   * Get teacher report
   */
  async function getTeacherReport(
    params: TeacherReportParams = {},
  ): Promise<ReportResponse<any, TeacherStatistics>> {
    try {
      const response = await $fetch<ReportResponse<any, TeacherStatistics>>(
        `${baseURL}/reporting/teachers`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching teacher report:", error);
      throw error;
    }
  }

  /**
   * Export report to PDF or Excel
   */
  async function exportReport(
    reportType: string,
    params: ExportParams,
  ): Promise<Blob> {
    try {
      const response = await $fetch<Blob>(
        `${baseURL}/reporting/${reportType}/export`,
        {
          method: "GET",
          params,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          responseType: "blob",
        },
      );

      return response;
    } catch (error: any) {
      console.error("[API] Error exporting report:", error);
      throw error;
    }
  }

  /**
   * Get unplaced students report
   */
  async function getUnplacedStudentsReport(
    params: UnplacedStudentsReportParams = {},
  ): Promise<ReportResponse<any, UnplacedStudentsStatistics>> {
    try {
      const response = await $fetch<
        ReportResponse<any, UnplacedStudentsStatistics>
      >(`${baseURL}/reporting/unplaced-students`, {
        method: "GET",
        params,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      return response;
    } catch (error: any) {
      console.error("[API] Error fetching unplaced students report:", error);
      throw error;
    }
  }

  return {
    getPklStatistics,
    getPlacementReport,
    getAttendanceReport,
    getLogbookReport,
    getAssessmentReport,
    getMonitoringReport,
    getApplicationReport,
    getCompanyReport,
    getTeacherReport,
    getUnplacedStudentsReport,
    exportReport,
  };
}
