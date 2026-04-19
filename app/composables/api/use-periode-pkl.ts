/**
 * Periode PKL Service API Composable
 * FITUR 1-9: Sistem Periode PKL
 */
import { apiFetch } from "~/composables/api-fetch";

// =============================================
// TYPES
// =============================================

export interface PeriodePKL {
  id_periode_pkl: string;
  nama_periode: string;
  id_tahun_ajaran: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: "draft" | "aktif" | "selesai" | "arsip";
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  tahun_ajaran?: {
    id_tahun_ajaran: string;
    nama_tahun_ajaran: string;
  };
  _count?: {
    penempatan: number;
  };
  // Additional fields from API
  durasi_bulan?: number;
  stats?: PeriodeStats;
}

export interface PeriodeStats {
  total_siswa_kelas_12: number;
  siswa_ditempatkan: number;
  siswa_belum_ditempatkan: number;
  total_perusahaan: number;
  total_guru_pembimbing: number;
  progress_percentage: number;
  durasi_bulan: number;
}

export interface DashboardPeriode {
  periode_aktif: (PeriodePKL & { stats?: PeriodeStats }) | null;
  periode_upcoming: PeriodePKL | null;
}

export interface PeriodeReport {
  periode: {
    id_periode_pkl: string;
    nama_periode: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status: string;
  };
  statistik: PeriodeStats;
  perusahaan: Array<{
    id_perusahaan: string;
    nama_perusahaan: string;
    jumlah_siswa: number;
  }>;
  jurusan: Array<{
    id_jurusan: string;
    nama_jurusan: string;
    total_siswa: number;
    siswa_ditempatkan: number;
  }>;
}

export interface SiswaKelas12 {
  id_siswa: string;
  nama_siswa: string;
  nis: string;
  kelas: {
    id_kelas: string;
    nama_kelas: string;
    jurusan: {
      id_jurusan: string;
      nama_jurusan: string;
    };
    tingkat: {
      id_tingkat: string;
      kode_tingkat: string;
    };
  };
}

export interface PeriodeSettings {
  minimal_durasi_bulan: number;
  maksimal_durasi_bulan: number;
  maksimal_siswa_per_perusahaan: number;
  hanya_kelas_12: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =============================================
// API FUNCTIONS
// =============================================

export function usePeriodePKLApi() {
  /**
   * GET all periode PKL
   * FITUR 1: CRUD Periode PKL
   */
  async function getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    id_tahun_ajaran?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status) query.append("status", params.status);
    if (params?.id_tahun_ajaran)
      query.append("id_tahun_ajaran", params.id_tahun_ajaran);

    const { data } = await apiFetch<PaginatedResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET periode by ID
   * FITUR 1: CRUD Periode PKL
   */
  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET active periode
   * FITUR 1: CRUD Periode PKL
   */
  async function getActive() {
    const { data } = await apiFetch<SingleResponse<PeriodePKL | null>>(
      "PlacementService",
      "/periode-pkl/active",
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET dashboard periode aktif
   * FITUR 4: Dashboard Periode Aktif
   */
  async function getDashboard() {
    const { data } = await apiFetch<SingleResponse<DashboardPeriode>>(
      "PlacementService",
      "/periode-pkl/dashboard",
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET archived periode
   * FITUR 9: Archive Periode
   */
  async function getArchived(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const { data } = await apiFetch<PaginatedResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/archived?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET siswa kelas 12
   * FITUR 2: Validasi Kelas 12
   */
  async function getSiswaKelas12(params?: {
    id_jurusan?: string;
    id_kelas?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.id_jurusan) query.append("id_jurusan", params.id_jurusan);
    if (params?.id_kelas) query.append("id_kelas", params.id_kelas);

    const { data } = await apiFetch<SingleResponse<SiswaKelas12[]>>(
      "PlacementService",
      `/periode-pkl/siswa-kelas-12?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET siswa kelas 12 available for periode
   * FITUR 5: Auto-Population Form Penempatan
   */
  async function getSiswaAvailable(idPeriode: string) {
    const { data } = await apiFetch<SingleResponse<SiswaKelas12[]>>(
      "PlacementService",
      `/periode-pkl/${idPeriode}/siswa-available`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET report periode
   * FITUR 8: Reporting Per Periode
   */
  async function getReport(id: string) {
    const { data } = await apiFetch<SingleResponse<PeriodeReport>>(
      "PlacementService",
      `/periode-pkl/${id}/report`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * GET settings
   * FITUR 7: Settings/Konfigurasi Periode
   */
  async function getSettings() {
    const { data } = await apiFetch<SingleResponse<PeriodeSettings>>(
      "PlacementService",
      "/periode-pkl/settings/default",
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * POST create periode PKL
   * FITUR 1: CRUD Periode PKL
   */
  async function create(payload: {
    nama_periode: string;
    id_tahun_ajaran: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status?: string;
    deskripsi?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      "/periode-pkl",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  /**
   * PUT update periode PKL
   * FITUR 1: CRUD Periode PKL
   */
  async function update(
    id: string,
    payload: Partial<{
      nama_periode: string;
      id_tahun_ajaran: string;
      tanggal_mulai: string;
      tanggal_selesai: string;
      status: string;
      deskripsi: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  /**
   * PATCH update status periode
   * FITUR 1: CRUD Periode PKL
   */
  async function updateStatus(id: string, status: string) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/${id}/status`,
      { method: "PATCH", data: { status } },
      true,
    );

    if (!data.success) {
      throw new Error(data.message || "Gagal mengubah status periode");
    }

    return data;
  }

  /**
   * POST clone periode
   * FITUR 3: Siklus Periode PKL 1 Tahun
   */
  async function clone(
    id: string,
    payload: {
      nama_periode: string;
      id_tahun_ajaran: string;
      tanggal_mulai: string;
      tanggal_selesai: string;
    },
  ) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/${id}/clone`,
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  /**
   * POST batch penempatan
   * FITUR 6: Batch Penempatan per Periode
   */
  async function batchPenempatan(payload: {
    id_periode_pkl: string;
    siswa_ids?: string[];
    siswa_penempatan?: Array<{
      siswa_id: string;
      durasi_bulan: number;
    }>;
    perusahaan_id: string;
    guru_pembimbing_id?: string;
  }) {
    const { data } = await apiFetch<
      SingleResponse<{
        created: number;
        message: string;
      }>
    >(
      "PlacementService",
      "/periode-pkl/batch",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  /**
   * POST archive periode
   * FITUR 9: Archive Periode
   */
  async function archive(id: string) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/${id}/archive`,
      { method: "POST" },
      true,
    );
    return data;
  }

  /**
   * POST restore periode
   * FITUR 9: Archive Periode
   */
  async function restore(id: string) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/${id}/restore`,
      { method: "POST" },
      true,
    );
    return data;
  }

  /**
   * DELETE periode PKL
   * FITUR 1: CRUD Periode PKL
   */
  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<PeriodePKL>>(
      "PlacementService",
      `/periode-pkl/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  return {
    getAll,
    getById,
    getActive,
    getDashboard,
    getArchived,
    getSiswaKelas12,
    getSiswaAvailable,
    getReport,
    getSettings,
    create,
    update,
    updateStatus,
    clone,
    batchPenempatan,
    archive,
    restore,
    remove,
  };
}
