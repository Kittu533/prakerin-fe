/**
 * Guru Dashboard API Composable
 * Handles guru-specific API calls for dashboard and student supervision
 */
import { apiFetch } from "~/composables/api-fetch";

// =============================================
// TYPES
// =============================================
export interface GuruProfile {
  id_guru: string;
  nip: string;
  nama_guru: string;
  email?: string;
  no_hp?: string;
}

export interface SiswaBimbingan {
  id_penempatan: string;
  siswa: {
    id_siswa: string;
    nama_siswa: string;
    nis: string;
    foto?: string;
    kelas?: {
      nama_kelas: string;
      jurusan?: { nama_jurusan: string };
    };
  };
  perusahaan: {
    id_perusahaan: string;
    nama_perusahaan: string;
  };
  status_penempatan: "aktif" | "selesai" | "dibatalkan";
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
      "IdentityService",
      "/auth/me",
      { method: "GET" },
      true,
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
    status_penempatan?: "aktif" | "selesai" | "dibatalkan";
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status_penempatan) query.append("status_penempatan", params.status_penempatan);

    const { data } = await apiFetch<PaginatedResponse<SiswaBimbingan>>(
      "PlacementService",
      `/penempatan/guru/me?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get dashboard stats for logged-in guru
   */
  async function getDashboardStats() {
    const { data } = await apiFetch<SingleResponse<GuruDashboardStats>>(
      "PlacementService",
      "/monitoring/guru/stats",
      { method: "GET" },
      true,
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
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.validasi_guru !== undefined)
      query.append("validasi_guru", String(params.validasi_guru));
    if (params?.tanggal_mulai)
      query.append("tanggal_mulai", params.tanggal_mulai);
    if (params?.tanggal_selesai)
      query.append("tanggal_selesai", params.tanggal_selesai);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      "PlacementService",
      `/absensi/my-students?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get logbook list for guru's students
   */
  async function getLogbookSiswa(params?: {
    page?: number;
    limit?: number;
    status?: "pending" | "approved" | "revision";
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status) query.append("status", params.status);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      "PlacementService",
      `/logbook/my-students?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get penilaian for guru's students
   */
  async function getPenilaianSiswa(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    query.append("penilai_type", "guru");

    const { data } = await apiFetch<PaginatedResponse<any>>(
      "PlacementService",
      `/penilaian/my-students?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get detail siswa bimbingan by penempatan ID
   */
  async function getDetailSiswaBimbingan(idPenempatan: string) {
    const { data } = await apiFetch<SingleResponse<SiswaBimbingan>>(
      "PlacementService",
      `/penempatan/${idPenempatan}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get logbook list for specific penempatan
   */
  async function getLogbookByPenempatan(
    idPenempatan: string,
    params?: {
      page?: number;
      limit?: number;
      status_persetujuan?: "menunggu" | "disetujui" | "ditolak";
    },
  ) {
    const query = new URLSearchParams();
    query.append("id_penempatan", idPenempatan);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status_persetujuan)
      query.append("status_persetujuan", params.status_persetujuan);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      "PlacementService",
      `/logbook?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get absensi list for specific penempatan
   */
  async function getAbsensiByPenempatan(
    idPenempatan: string,
    params?: {
      page?: number;
      limit?: number;
      status_absensi?: string;
      start_date?: string;
      end_date?: string;
    },
  ) {
    const query = new URLSearchParams();
    query.append("id_penempatan", idPenempatan);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status_absensi)
      query.append("status_absensi", params.status_absensi);
    if (params?.start_date) query.append("start_date", params.start_date);
    if (params?.end_date) query.append("end_date", params.end_date);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      "PlacementService",
      `/absensi?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get stats for specific penempatan (kehadiran, logbook count, etc)
   */
  async function getStatsByPenempatan(idPenempatan: string) {
    const { data } = await apiFetch<
      SingleResponse<{
        kehadiran_persen: number;
        total_logbook: number;
        total_hari_pkl: number;
        logbook_pending: number;
        logbook_approved: number;
      }>
    >(
      "PlacementService",
      `/monitoring/penempatan/${idPenempatan}`,
      { method: "GET" },
      true,
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
