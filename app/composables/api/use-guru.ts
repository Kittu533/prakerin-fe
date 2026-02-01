/**
 * Guru Dashboard API Composable
 * Handles guru-specific API calls for dashboard and student supervision
 */
import { apiFetch } from '~/composables/api-fetch';

// =============================================
// TYPES
// =============================================
export interface GuruProfile {
  id_guru: number;
  nip: string;
  nama_guru: string;
  email?: string;
  no_hp?: string;
}

export interface SiswaBimbingan {
  id_penempatan: number;
  siswa: {
    id_siswa: number;
    nama_siswa: string;
    nis: string;
    foto?: string;
    kelas?: {
      nama_kelas: string;
      jurusan?: { nama_jurusan: string };
    };
  };
  perusahaan: {
    id_perusahaan: number;
    nama_perusahaan: string;
  };
  status_penempatan: 'aktif' | 'selesai' | 'dibatalkan';
  tanggal_mulai: string;
  tanggal_selesai: string;
  // Computed fields from backend
  kehadiran_persen?: number;
  logbook_count?: number;
}

export interface GuruDashboardStats {
  totalSiswa: number;
  siswAktif: number;
  kehadiranRataRata: number;
  logbookPending: number;
  absensiPending: number;
  nilaiDiinput: number;
  kunjunganBulanIni: number;
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================
// GURU API
// =============================================
export function useGuruApi() {
  /**
   * Get current guru's profile from auth/me endpoint
   */
  async function getProfile() {
    const { data } = await apiFetch<SingleResponse<GuruProfile>>(
      'IdentityService',
      '/auth/me',
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get siswa bimbingan (students under guru's supervision)
   * Uses penempatan API filtered by guru_pembimbing_id
   */
  async function getSiswaBimbingan(params?: {
    page?: number;
    limit?: number;
    status?: 'aktif' | 'selesai' | 'dibatalkan';
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const { data } = await apiFetch<PaginatedResponse<SiswaBimbingan>>(
      'PlacementService',
      `/penempatan/my-students?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get dashboard stats for logged-in guru
   */
  async function getDashboardStats() {
    const { data } = await apiFetch<SingleResponse<GuruDashboardStats>>(
      'PlacementService',
      '/monitoring/guru/stats',
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get absensi list for guru's students
   */
  async function getAbsensiSiswa(params?: {
    page?: number;
    limit?: number;
    validasi_guru?: boolean;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.validasi_guru !== undefined) query.append('validasi_guru', String(params.validasi_guru));
    if (params?.tanggal_mulai) query.append('tanggal_mulai', params.tanggal_mulai);
    if (params?.tanggal_selesai) query.append('tanggal_selesai', params.tanggal_selesai);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      'PlacementService',
      `/absensi/my-students?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get logbook list for guru's students
   */
  async function getLogbookSiswa(params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'revision';
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      'PlacementService',
      `/logbook/my-students?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get penilaian for guru's students
   */
  async function getPenilaianSiswa(params?: {
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    query.append('penilai_type', 'guru');

    const { data } = await apiFetch<PaginatedResponse<any>>(
      'PlacementService',
      `/penilaian/my-students?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get detail siswa bimbingan by penempatan ID
   */
  async function getDetailSiswaBimbingan(idPenempatan: number) {
    const { data } = await apiFetch<SingleResponse<SiswaBimbingan>>(
      'PlacementService',
      `/penempatan/${idPenempatan}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get logbook list for specific penempatan
   */
  async function getLogbookByPenempatan(idPenempatan: number, params?: {
    page?: number;
    limit?: number;
    status?: 'pending' | 'approved' | 'revision';
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      'PlacementService',
      `/logbook/penempatan/${idPenempatan}?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get absensi list for specific penempatan
   */
  async function getAbsensiByPenempatan(idPenempatan: number, params?: {
    page?: number;
    limit?: number;
    status?: string;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);
    if (params?.tanggal_mulai) query.append('tanggal_mulai', params.tanggal_mulai);
    if (params?.tanggal_selesai) query.append('tanggal_selesai', params.tanggal_selesai);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      'PlacementService',
      `/absensi/penempatan/${idPenempatan}?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  /**
   * Get stats for specific penempatan (kehadiran, logbook count, etc)
   */
  async function getStatsByPenempatan(idPenempatan: number) {
    const { data } = await apiFetch<SingleResponse<{
      kehadiran_persen: number;
      total_logbook: number;
      total_hari_pkl: number;
      logbook_pending: number;
      logbook_approved: number;
    }>>(
      'PlacementService',
      `/monitoring/penempatan/${idPenempatan}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  return {
    getProfile,
    getSiswaBimbingan,
    getDashboardStats,
    getAbsensiSiswa,
    getLogbookSiswa,
    getPenilaianSiswa,
    // Detail page APIs
    getDetailSiswaBimbingan,
    getLogbookByPenempatan,
    getAbsensiByPenempatan,
    getStatsByPenempatan,
  };
}

