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
  jenis_kelamin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  alamat?: string;
  status_aktif?: boolean;
  is_penandatangan?: boolean;
}

export interface GuruListResponse {
  success: boolean;
  data: GuruProfile[];
  page: number;
  limit: number;
  total: number;
  message?: string;
}

export interface GuruImportResult {
  success: number;
  failed: number;
  errors: string[];
  importedGurus: Array<{
    nip: string;
    nama_guru: string;
    defaultPassword?: string;
  }>;
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
   * Get all guru (for admin/tata_usaha)
   */
  async function getAllGuru(params?: {
    page?: number;
    limit?: number;
    search?: string;
    kelompok?: string;
    penandatangan?: boolean;
  }): Promise<{ success: boolean; data?: GuruListResponse; message: string }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.kelompok) searchParams.append("kelompok", params.kelompok);
    if (typeof params?.penandatangan === "boolean") {
      searchParams.append("penandatangan", String(params.penandatangan));
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/guru?${queryString}` : "/guru";

    try {
      const response = await apiFetch<GuruListResponse>(
        "CoreService",
        endpoint,
        { method: "GET" },
        true
      );

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          message: "Success",
        };
      }
      return {
        success: false,
        message: response.data?.message || `HTTP ${response.status}`,
      };
    } catch (error: any) {
      console.error("[GuruAPI] Error fetching guru:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }

  /**
   * Import guru from CSV/Excel data
   */
  async function importGuru(data: Array<{
    nip: string;
    nama_guru: string;
    email?: string;
    no_hp?: string;
  }>): Promise<{ success: boolean; data?: GuruImportResult; message: string }> {
    try {
      const response = await apiFetch<{ success: boolean; data: GuruImportResult; message?: string }>(
        "CoreService",
        "/guru/import",
        {
          method: "POST",
          data: { data },
        },
        true
      );

      if (response.status >= 200 && response.status < 300 && response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Import berhasil",
        };
      }
      return {
        success: false,
        message: response.data?.message || "Import gagal",
      };
    } catch (error: any) {
      console.error("[GuruAPI] Error importing guru:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }

  /**
   * Export guru to CSV/Excel
   */
  async function exportGuru(ids?: string[]): Promise<{ success: boolean; data?: any[]; message: string }> {
    const searchParams = new URLSearchParams();
    if (ids && ids.length > 0) {
      searchParams.append("ids", ids.join(","));
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/guru/export?${queryString}` : "/guru/export";

    try {
      const response = await apiFetch<{ success: boolean; data: any[]; message?: string }>(
        "CoreService",
        endpoint,
        { method: "GET" },
        true
      );

      if (response.status >= 200 && response.status < 300 && response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Export berhasil",
        };
      }
      return {
        success: false,
        message: response.data?.message || "Export gagal",
      };
    } catch (error: any) {
      console.error("[GuruAPI] Error exporting guru:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }

  /**
   * Download import template
   */
  async function downloadTemplate(): Promise<{ success: boolean; data?: any[]; message: string }> {
    try {
      const response = await apiFetch<{ success: boolean; data: any[]; message?: string }>(
        "CoreService",
        "/guru/template",
        { method: "GET" },
        true
      );

      if (response.status >= 200 && response.status < 300 && response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: "Template berhasil diunduh",
        };
      }
      return {
        success: false,
        message: response.data?.message || "Gagal mengunduh template",
      };
    } catch (error: any) {
      console.error("[GuruAPI] Error downloading template:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
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

  async function getAbsensiSelfieSignedUrl(idAbsensi: string) {
    const { data } = await apiFetch<SingleResponse<{ url: string; expiresAt: string }>>(
      'PlacementService',
      `/absensi/${idAbsensi}/selfie-signed-url`,
      { method: 'GET' },
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
    getAllGuru,
    importGuru,
    exportGuru,
    downloadTemplate,
    getSiswaBimbingan,
    getDashboardStats,
    getAbsensiSiswa,
    getLogbookSiswa,
    getPenilaianSiswa,
    getDetailSiswaBimbingan,
    getLogbookByPenempatan,
    getAbsensiByPenempatan,
    getAbsensiSelfieSignedUrl,
    getStatsByPenempatan,
  };
}
