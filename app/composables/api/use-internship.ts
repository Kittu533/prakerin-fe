/**
 * Internship Service API Composable
 * Handles: Pengajuan, Penempatan, Absensi, Logbook, Penilaian
 */
import { apiFetch } from "~/composables/api-fetch";

// =============================================
// TYPES
// =============================================
export interface Pengajuan {
  id_pengajuan: string;
  id_siswa: string;
  id_perusahaan: string;
  id_tahun_ajaran: string;
  tanggal_pengajuan: string;
  status: "pending" | "approved" | "rejected";
  catatan?: string;
  siswa?: {
    id_siswa: string;
    nama_siswa: string;
    nis: string;
    kelas?: { nama_kelas: string; jurusan?: { nama_jurusan: string } };
  };
  perusahaan?: {
    id_perusahaan: string;
    nama_perusahaan: string;
  };
  created_at?: string;
}

export interface Penempatan {
  id_penempatan: string;
  siswa_id: string;
  perusahaan_id: string;
  guru_pembimbing_id: string;
  tahun_ajaran_id: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_penempatan: "aktif" | "selesai" | "dibatalkan";
  nomor_surat_pengantar?: string;
  catatan?: string;
  // Resolved data (from other services)
  siswa?: {
    id_siswa: string;
    nama_siswa: string;
    nis: string;
    kelas?: { nama_kelas: string; jurusan?: { nama_jurusan: string } };
  };
  perusahaan?: {
    id_perusahaan: string;
    nama_perusahaan: string;
    alamat?: string;
    bidang_usaha?: string;
    mentor?: Array<{
      id_mentor: string;
      nama_mentor: string;
      jabatan?: string;
      email?: string;
      no_hp?: string;
    }>;
  };
  guru?: {
    id_guru: string;
    nama_guru: string;
    nip?: string;
  };
  created_at?: string;
}

export interface Absensi {
  id_absensi: string;
  id_penempatan: string;
  tanggal: string;
  jam_masuk?: string;
  jam_keluar?: string;
  status: "hadir" | "izin" | "sakit" | "alpha";
  keterangan?: string;
  latitude_masuk?: number;
  longitude_masuk?: number;
  foto_masuk?: string;
  validasi_mentor: boolean;
  validasi_guru: boolean;
  penempatan?: Penempatan;
  created_at?: string;
}

export interface Logbook {
  id_logbook: string;
  id_penempatan: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  kegiatan: string;
  deskripsi: string;
  foto?: string;
  status: "pending" | "approved" | "revision";
  catatan_mentor?: string;
  catatan_guru?: string;
  penempatan?: Penempatan;
  created_at?: string;
}

export interface Penilaian {
  id_penilaian: string;
  id_penempatan: string;
  penilai_type: "mentor" | "guru";
  penilai_id: string;
  nilai_sikap?: number;
  nilai_keterampilan?: number;
  nilai_pengetahuan?: number;
  nilai_kerjasama?: number;
  nilai_inisiatif?: number;
  nilai_akhir?: number;
  catatan?: string;
  penempatan?: Penempatan;
  created_at?: string;
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

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// =============================================
// PENGAJUAN API
// =============================================
export function usePengajuanApi() {
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
      query.append("id_tahun_ajaran", String(params.id_tahun_ajaran));

    const { data } = await apiFetch<PaginatedResponse<Pengajuan>>(
      "PlacementService",
      `/pengajuan?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Pengajuan>>(
      "PlacementService",
      `/pengajuan/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function approve(id: string, catatan?: string) {
    const { data } = await apiFetch<SingleResponse<Pengajuan>>(
      "PlacementService",
      `/pengajuan/${id}/approve`,
      { method: "POST", data: { catatan } },
      true,
    );
    return data;
  }

  async function reject(id: string, catatan: string) {
    const { data } = await apiFetch<SingleResponse<Pengajuan>>(
      "PlacementService",
      `/pengajuan/${id}/reject`,
      { method: "POST", data: { catatan } },
      true,
    );
    return data;
  }

  return { getAll, getById, approve, reject };
}

// =============================================
// PENEMPATAN API
// =============================================
export function usePenempatanApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    id_perusahaan?: string;
    id_guru?: string;
    id_tahun_ajaran?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status) query.append("status", params.status);
    if (params?.id_perusahaan)
      query.append("id_perusahaan", String(params.id_perusahaan));
    if (params?.id_guru) query.append("id_guru", String(params.id_guru));
    if (params?.id_tahun_ajaran)
      query.append("id_tahun_ajaran", String(params.id_tahun_ajaran));

    const { data } = await apiFetch<PaginatedResponse<Penempatan>>(
      "PlacementService",
      `/penempatan?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Penempatan>>(
      "PlacementService",
      `/penempatan/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    siswa_id: string;
    perusahaan_id: string;
    guru_pembimbing_id: string;
    tahun_ajaran_id: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Penempatan>>(
      "PlacementService",
      "/penempatan",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      guru_pembimbing_id: string;
      tanggal_mulai: string;
      tanggal_selesai: string;
      status_penempatan: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Penempatan>>(
      "PlacementService",
      `/penempatan/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  // Mentor-specific: Get students at mentor's company
  async function getMentorStudents(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const { data } = await apiFetch<
      PaginatedResponse<
        Penempatan & {
          absensi: { status_absensi: string }[];
          logbook: { id_logbook: number; status_persetujuan: string }[];
          penilaian: { nilai_akhir: number } | null;
        }
      >
    >(
      "PlacementService",
      `/penempatan/mentor/me?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  // Mentor-specific: Get student detail
  async function getMentorStudentDetail(id: string) {
    const { data } = await apiFetch<
      SingleResponse<
        Penempatan & {
          absensi: any[];
          logbook: any[];
          penilaian: any;
          stats: {
            kehadiran: number;
            total_logbook: number;
            nilai: number | null;
          };
        }
      >
    >(
      "PlacementService",
      `/penempatan/mentor/siswa/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  // Guru-specific: Get students mentored by this guru
  async function getMyStudents(params?: {
    page?: number;
    limit?: number;
    status_penempatan?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status_penempatan)
      query.append("status_penempatan", params.status_penempatan);

    const { data } = await apiFetch<
      PaginatedResponse<
        Penempatan & {
          siswa?: {
            id_siswa: string;
            nama_siswa: string;
            nis: string;
            kelas?: { nama_kelas: string; jurusan?: { nama_jurusan: string } };
          };
          perusahaan?: {
            id_perusahaan: string;
            nama_perusahaan: string;
            mentor?: { nama: string };
          };
          absensi: { status_absensi: string }[];
          logbook: { id_logbook: number; status_persetujuan: string }[];
          stats?: {
            kehadiran: number;
            total_logbook: number;
          };
        }
      >
    >(
      "PlacementService",
      `/penempatan/guru/me?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  return {
    getAll,
    getById,
    create,
    update,
    getMentorStudents,
    getMentorStudentDetail,
    getMyStudents,
  };
}

// =============================================
// ABSENSI API
// =============================================
export function useAbsensiApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_penempatan?: string;
    status?: string;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    validasi_mentor?: boolean;
    validasi_guru?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_penempatan)
      query.append("id_penempatan", String(params.id_penempatan));
    if (params?.status) query.append("status", params.status);
    if (params?.tanggal_mulai)
      query.append("tanggal_mulai", params.tanggal_mulai);
    if (params?.tanggal_selesai)
      query.append("tanggal_selesai", params.tanggal_selesai);
    if (params?.validasi_mentor !== undefined)
      query.append("validasi_mentor", String(params.validasi_mentor));
    if (params?.validasi_guru !== undefined)
      query.append("validasi_guru", String(params.validasi_guru));

    const { data } = await apiFetch<PaginatedResponse<Absensi>>(
      "PlacementService",
      `/absensi?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function validate(
    id: string,
    payload: {
      validasi_mentor?: boolean;
      validasi_guru?: boolean;
      keterangan?: string;
    },
  ) {
    const { data } = await apiFetch<SingleResponse<Absensi>>(
      "PlacementService",
      `/absensi/${id}/validate`,
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  return { getAll, validate };
}

// =============================================
// LOGBOOK API
// =============================================
export function useLogbookApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_penempatan?: string;
    status_persetujuan?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_penempatan)
      query.append("id_penempatan", String(params.id_penempatan));
    if (params?.status_persetujuan)
      query.append("status_persetujuan", params.status_persetujuan);

    const { data } = await apiFetch<PaginatedResponse<Logbook>>(
      "PlacementService",
      `/logbook?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function approve(id: string, catatan?: string) {
    const { data } = await apiFetch<SingleResponse<Logbook>>(
      "PlacementService",
      `/logbook/${id}/review`,
      { method: "POST", data: { status_persetujuan: "disetujui", catatan_pembimbing: catatan } },
      true,
    );
    return data;
  }

  async function requestRevision(id: string, catatan: string) {
    const { data } = await apiFetch<SingleResponse<Logbook>>(
      "PlacementService",
      `/logbook/${id}/review`,
      { method: "POST", data: { status_persetujuan: "ditolak", catatan_pembimbing: catatan } },
      true,
    );
    return data;
  }

  return { getAll, approve, requestRevision };
}

// =============================================
// PENILAIAN API
// =============================================
export function usePenilaianApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_penempatan?: string;
    penilai_type?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_penempatan)
      query.append("id_penempatan", String(params.id_penempatan));
    if (params?.penilai_type) query.append("penilai_type", params.penilai_type);

    const { data } = await apiFetch<PaginatedResponse<Penilaian>>(
      "PlacementService",
      `/penilaian?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    id_penempatan: string;
    penilai_type: "mentor" | "guru";
    penilai_id: string;
    nilai_sikap?: number;
    nilai_keterampilan?: number;
    nilai_pengetahuan?: number;
    nilai_kerjasama?: number;
    nilai_inisiatif?: number;
    catatan?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Penilaian>>(
      "PlacementService",
      "/penilaian",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nilai_sikap: number;
      nilai_keterampilan: number;
      nilai_pengetahuan: number;
      nilai_kerjasama: number;
      nilai_inisiatif: number;
      catatan: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Penilaian>>(
      "PlacementService",
      `/penilaian/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function upsert(
    id_penempatan: string,
    payload: {
      nilai_kedisiplinan?: number;
      nilai_keterampilan?: number;
      nilai_sikap?: number;
      nilai_pembimbing_perusahaan?: number;
      nilai_pembimbing_sekolah?: number;
      catatan_penilaian?: string;
      tanggal_penilaian?: string;
    },
  ) {
    const { data } = await apiFetch<SingleResponse<Penilaian>>(
      "PlacementService",
      `/penilaian/penempatan/${id_penempatan}`,
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  return { getAll, create, update, upsert };
}

// =============================================
// MONITORING API (Kunjungan & Monitoring Siswa)
// =============================================

export interface Monitoring {
  id_monitoring: string;
  id_penempatan: string;
  tanggal_monitoring: string;
  hasil_monitoring?: string;
  foto_monitoring?: string;
  kendala?: string;
  solusi?: string;
  penempatan?: {
    id_penempatan: string;
    siswa: { id_siswa: string; nama_siswa: string };
    perusahaan: { id_perusahaan: string; nama_perusahaan: string };
  };
  created_at?: string;
  updated_at?: string;
}

// Kunjungan record (visit) with resolved IDs
export interface Kunjungan {
  id_monitoring: string;
  id_penempatan: string;
  siswa_id: string;
  perusahaan_id: string;
  tanggal_monitoring: string;
  hasil_monitoring?: string;
  foto_monitoring?: string;
  created_at?: string;
}

// Complete monitoring data per siswa
export interface MonitoringSiswa {
  id_penempatan: string;
  id_siswa: string;
  siswa: string;
  kelas: string;
  jurusan: string;
  id_perusahaan: string;
  perusahaan: string;
  bidang_usaha: string;
  id_guru: string;
  guru_pembimbing: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_penempatan: string;

  // Absensi
  total_hadir: number;
  total_sakit: number;
  total_izin: number;
  total_alpha: number;
  total_absensi: number;
  persentase_hadir: number;

  // Logbook
  total_logbook: number;
  logbook_disetujui: number;
  logbook_pending: number;
  target_logbook: number;
  persentase_logbook: number;

  // Penilaian
  nilai_kedisiplinan?: number;
  nilai_keterampilan?: number;
  nilai_sikap?: number;
  nilai_perusahaan?: number;
  nilai_sekolah?: number;
  nilai_akhir?: number;

  // Kunjungan monitoring
  total_kunjungan: number;
  terakhir_dikunjungi?: string;

  // Status
  status_monitoring: "baik" | "perhatian" | "kritis";
}

// Interface for legacy frontend compatibility
export interface MonitoringSiswaLegacy {
  id: number;
  siswa: string;
  kelas: string;
  perusahaan: string;
  absensi: number; // percentage
  logbook: number; // count
  nilai: number | null;
  status: "aktif" | "selesai" | "bermasalah";
}

export interface MonitoringStats {
  total: number;
  aktif: number;
  selesai: number;
  baik: number;
  perhatian: number;
  kritis: number;
}

// Interface for legacy frontend compatibility
export interface MonitoringStatsLegacy {
  total: number;
  good: number;
  warning: number;
  critical: number;
}

// Detail monitoring per siswa
export interface DetailMonitoringSiswa {
  penempatan: any;
  absensi: any[];
  logbook: any[];
  penilaian?: any;
  monitoring: any[];
  summary: {
    total_absensi: number;
    kehadiran_percent: number;
    total_logbook: number;
    logbook_percent: number;
    total_kunjungan: number;
  };
}

// Riwayat absensi per bulan
export interface RiwayatAbsensiBulan {
  bulan: string;
  tahun: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
}

// Siswa prioritas untuk dikunjungi
export interface SiswaPrioritas extends MonitoringSiswa {
  skor_prioritas: number;
  terakhir_dikunjungi: Date;
  hari_tanpa_kunjungan: number;
}

export function useMonitoringApi() {
  /**
   * Get list siswa yang dipantau
   */
  async function getSiswaMonitoring(params?: {
    page?: number;
    limit?: number;
    status_penempatan?: string;
    tahun_ajaran_id?: string;
    perusahaan_id?: string;
    guru_id?: string;
    jurusan_id?: string;
    status_monitoring?: "baik" | "perhatian" | "kritis";
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status_penempatan)
      query.append("status_penempatan", params.status_penempatan);
    if (params?.tahun_ajaran_id)
      query.append("tahun_ajaran_id", String(params.tahun_ajaran_id));
    if (params?.perusahaan_id)
      query.append("perusahaan_id", String(params.perusahaan_id));
    if (params?.guru_id) query.append("guru_id", String(params.guru_id));
    if (params?.jurusan_id)
      query.append("jurusan_id", String(params.jurusan_id));
    if (params?.status_monitoring)
      query.append("status_monitoring", params.status_monitoring);

    const { data } = await apiFetch<PaginatedResponse<MonitoringSiswa>>(
      "PlacementService",
      `/monitoring/siswa?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get detail monitoring per penempatan/siswa
   */
  async function getDetailSiswa(id_penempatan: string) {
    const { data } = await apiFetch<SingleResponse<DetailMonitoringSiswa>>(
      "PlacementService",
      `/monitoring/penempatan/${id_penempatan}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get riwayat absensi per bulan
   */
  async function getRiwayatAbsensiBulan(id_penempatan: string) {
    const { data } = await apiFetch<{
      success: boolean;
      message: string;
      data: RiwayatAbsensiBulan[];
    }>(
      "PlacementService",
      `/monitoring/penempatan/${id_penempatan}/absensi-bulan`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get siswa prioritas untuk dikunjungi
   */
  async function getSiswaPrioritas(params?: {
    guru_id?: string;
    tahun_ajaran_id?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.guru_id) query.append("guru_id", String(params.guru_id));
    if (params?.tahun_ajaran_id)
      query.append("tahun_ajaran_id", String(params.tahun_ajaran_id));

    const { data } = await apiFetch<{
      success: boolean;
      message: string;
      data: SiswaPrioritas[];
    }>(
      "PlacementService",
      `/monitoring/prioritas?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get monitoring record by id
   */
  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Monitoring>>(
      "PlacementService",
      `/monitoring/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Get statistik monitoring
   */
  async function getStats(params?: {
    tahun_ajaran_id?: string;
    guru_id?: string;
    perusahaan_id?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.tahun_ajaran_id)
      query.append("tahun_ajaran_id", String(params.tahun_ajaran_id));
    if (params?.guru_id) query.append("guru_id", String(params.guru_id));
    if (params?.perusahaan_id)
      query.append("perusahaan_id", String(params.perusahaan_id));

    const { data } = await apiFetch<SingleResponse<MonitoringStats>>(
      "PlacementService",
      `/monitoring/stats?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  /**
   * Create monitoring kunjungan baru
   */
  async function create(payload: {
    id_penempatan: string;
    tanggal_monitoring: string;
    hasil_monitoring?: string;
    foto_monitoring?: string;
    kendala?: string;
    solusi?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Monitoring>>(
      "PlacementService",
      "/monitoring",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  /**
   * Update monitoring
   */
  async function update(
    id: string,
    payload: Partial<{
      tanggal_monitoring: string;
      hasil_monitoring: string;
      foto_monitoring: string;
      kendala: string;
      solusi: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Monitoring>>(
      "PlacementService",
      `/monitoring/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  /**
   * Delete monitoring
   */
  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "PlacementService",
      `/monitoring/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  /**
   * Legacy method - get all monitoring (siswa list)
   * @deprecated Use getSiswaMonitoring instead
   */
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_penempatan?: number;
  }) {
    return getSiswaMonitoring(params);
  }

  /**
   * Legacy method - get kunjungan list
   * @deprecated Use getSiswaMonitoring instead
   */
  async function getKunjungan(params?: {
    page?: number;
    limit?: number;
    id_guru?: number;
  }) {
    return getSiswaMonitoring(params);
  }

  return {
    getSiswaMonitoring,
    getDetailSiswa,
    getRiwayatAbsensiBulan,
    getSiswaPrioritas,
    getById,
    getStats,
    create,
    update,
    remove,
    // Legacy
    getAll,
    getKunjungan,
  };
}
