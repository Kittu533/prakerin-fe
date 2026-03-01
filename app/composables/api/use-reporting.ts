/**
 * Reporting Service API Composable
 * Handles: Dashboard stats, reports
 */
import { apiFetch } from "~/composables/api-fetch";

// =============================================
// TYPES
// =============================================
export interface DashboardStats {
  total_siswa: number;
  total_pengajuan_pending: number;
  total_penempatan_aktif: number;
  total_penempatan_selesai: number;
  total_perusahaan: number;
  total_guru: number;
  total_mentor: number;
  masalah_absensi: number;
}

export interface PenempatanPerJurusan {
  jurusan: string;
  total: number;
  persentase: number;
}

export interface TrendPengajuan {
  bulan: string;
  pengajuan: number;
  diterima: number;
}

export interface StatusSiswa {
  status: string;
  total: number;
}

export interface RecentPengajuan {
  id: number;
  siswa: string;
  jurusan: string;
  perusahaan: string;
  tanggal: string;
  status: string;
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =============================================
// DASHBOARD API
// =============================================
export function useDashboardApi() {
  // Get dashboard stats from /dashboard/stats
  async function getAdminStats() {
    const { data } = await apiFetch<SingleResponse<DashboardStats>>(
      "ReportingService",
      "/dashboard/stats",
      { method: "GET" },
      true,
    );
    return data;
  }

  // Get penempatan per jurusan
  async function getPenempatanPerJurusan() {
    const { data } = await apiFetch<SingleResponse<PenempatanPerJurusan[]>>(
      "ReportingService",
      "/dashboard/penempatan-per-jurusan",
      { method: "GET" },
      true,
    );
    return data;
  }

  // Get trend pengajuan per bulan
  async function getTrendPengajuan() {
    const { data } = await apiFetch<SingleResponse<TrendPengajuan[]>>(
      "ReportingService",
      "/dashboard/trend-pengajuan",
      { method: "GET" },
      true,
    );
    return data;
  }

  // Get status siswa distribution
  async function getStatusSiswa() {
    const { data } = await apiFetch<SingleResponse<StatusSiswa[]>>(
      "ReportingService",
      "/dashboard/status-siswa",
      { method: "GET" },
      true,
    );
    return data;
  }

  // Get recent pengajuan
  async function getRecentPengajuan(limit: number = 5) {
    const { data } = await apiFetch<SingleResponse<RecentPengajuan[]>>(
      "ReportingService",
      `/dashboard/recent-pengajuan?limit=${limit}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  // Get complete dashboard summary (all data in one request)
  async function getDashboardSummary() {
    const { data } = await apiFetch<
      SingleResponse<{
        stats: DashboardStats;
        penempatanJurusan: PenempatanPerJurusan[];
        trend: TrendPengajuan[];
        statusSiswa: StatusSiswa[];
        recentPengajuan: RecentPengajuan[];
      }>
    >("ReportingService", "/dashboard/summary", { method: "GET" }, true);
    return data;
  }

  // Legacy functions for backward compatibility
  async function getPenempatanData(params?: {
    page?: number;
    limit?: number;
    tahun_ajaran_id?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.tahun_ajaran_id)
      queryParams.append("tahun_ajaran_id", params.tahun_ajaran_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const { data } = await apiFetch<any>(
      "ReportingService",
      `/dashboard/penempatan${query}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getRecentActivities(limit?: number) {
    // Redirect to recent pengajuan
    return getRecentPengajuan(limit || 5);
  }

  // Guru dashboard
  async function getGuruStats(idGuru: number) {
    const { data } = await apiFetch<SingleResponse<any>>(
      "ReportingService",
      `/dashboard/guru/${idGuru}/stats`,
      { method: "GET" },
      true,
    );
    return data;
  }

  // Siswa dashboard
  async function getSiswaStats(idSiswa: number) {
    const { data } = await apiFetch<SingleResponse<any>>(
      "ReportingService",
      `/dashboard/siswa/${idSiswa}/stats`,
      { method: "GET" },
      true,
    );
    return data;
  }

  // Mentor dashboard
  async function getMentorStats(idMentor: number) {
    const { data } = await apiFetch<SingleResponse<any>>(
      "ReportingService",
      `/dashboard/mentor/${idMentor}/stats`,
      { method: "GET" },
      true,
    );
    return data;
  }

  return {
    getAdminStats,
    getDashboardSummary,
    getPenempatanData,
    getRecentActivities,
    getPenempatanPerJurusan,
    getTrendPengajuan,
    getStatusSiswa,
    getRecentPengajuan,
    getGuruStats,
    getSiswaStats,
    getMentorStats,
  };
}
