/**
 * Reporting Service API Composable
 * Handles: Dashboard stats, reports
 */
import { apiFetch } from '~/composables/api-fetch';

// =============================================
// TYPES
// =============================================
export interface DashboardStats {
  totalSiswa: number;
  totalGuru: number;
  totalPerusahaan: number;
  totalMentor: number;
  pengajuanPending: number;
  penempatanAktif: number;
  penempatanSelesai: number;
  absensiHariIni: number;
  logbookPending: number;
  masalahAbsensi: number;
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
      'ReportingService',
      '/dashboard/stats',
      { method: 'GET' },
      true
    );
    return data;
  }

  // Get dashboard summary (stats + recent activities)
  async function getDashboardSummary() {
    const { data } = await apiFetch<SingleResponse<{ stats: any; recentActivities: any[] }>>(
      'ReportingService',
      '/dashboard/summary',
      { method: 'GET' },
      true
    );
    return data;
  }

  // Get penempatan data with optional filters
  async function getPenempatanData(params?: { page?: number; limit?: number; tahun_ajaran_id?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.tahun_ajaran_id) queryParams.append('tahun_ajaran_id', params.tahun_ajaran_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const { data } = await apiFetch<any>(
      'ReportingService',
      `/dashboard/penempatan${query}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  // Get recent activities
  async function getRecentActivities(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    const { data } = await apiFetch<SingleResponse<{ recentActivities: any[] }>>(
      'ReportingService',
      `/dashboard/recent${query}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  // Legacy functions that redirect to available endpoints
  async function getPenempatanPerJurusan() {
    // Backend doesn't have this endpoint, return empty for now
    // or we can compute from penempatan data
    return { success: true, message: 'Data tidak tersedia', data: [] };
  }

  async function getTrendPengajuan(_tahun?: number) {
    // Backend doesn't have this endpoint, return empty for now
    return { success: true, message: 'Data tidak tersedia', data: [] };
  }

  async function getStatusSiswa() {
    // Backend doesn't have this endpoint, return empty for now
    return { success: true, message: 'Data tidak tersedia', data: [] };
  }

  async function getRecentPengajuan(limit?: number) {
    // Use recent activities endpoint
    const result = await getRecentActivities(limit);
    if (result?.success && result.data?.recentActivities) {
      // Transform to expected format
      const transformed = result.data.recentActivities.map((activity: any, idx: number) => ({
        id: activity.id || idx + 1,
        siswa: activity.entity_name || 'N/A',
        jurusan: activity.description || 'N/A',
        perusahaan: activity.entity_type || 'N/A',
        tanggal: activity.created_at ? new Date(activity.created_at).toLocaleDateString('id-ID') : 'N/A',
        status: activity.action || 'N/A'
      }));
      return { success: true, message: 'Recent activities', data: transformed };
    }
    return { success: true, message: 'No data', data: [] };
  }

  // Guru dashboard
  async function getGuruStats(idGuru: number) {
    const { data } = await apiFetch<SingleResponse<any>>(
      'ReportingService',
      `/dashboard/guru/${idGuru}/stats`,
      { method: 'GET' },
      true
    );
    return data;
  }

  // Siswa dashboard
  async function getSiswaStats(idSiswa: number) {
    const { data } = await apiFetch<SingleResponse<any>>(
      'ReportingService',
      `/dashboard/siswa/${idSiswa}/stats`,
      { method: 'GET' },
      true
    );
    return data;
  }

  // Mentor dashboard
  async function getMentorStats(idMentor: number) {
    const { data } = await apiFetch<SingleResponse<any>>(
      'ReportingService',
      `/dashboard/mentor/${idMentor}/stats`,
      { method: 'GET' },
      true
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
    getMentorStats
  };
}
