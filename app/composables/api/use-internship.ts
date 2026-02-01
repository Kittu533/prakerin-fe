/**
 * Internship Service API Composable
 * Handles: Pengajuan, Penempatan, Absensi, Logbook, Penilaian
 */
import { apiFetch } from '~/composables/api-fetch';

// =============================================
// TYPES
// =============================================
export interface Pengajuan {
  id_pengajuan: number;
  id_siswa: number;
  id_perusahaan: number;
  id_tahun_ajaran: number;
  tanggal_pengajuan: string;
  status: 'pending' | 'approved' | 'rejected';
  catatan?: string;
  siswa?: {
    id_siswa: number;
    nama_siswa: string;
    nis: string;
    kelas?: { nama_kelas: string; jurusan?: { nama_jurusan: string } };
  };
  perusahaan?: {
    id_perusahaan: number;
    nama_perusahaan: string;
  };
  created_at?: string;
}

export interface Penempatan {
  id_penempatan: number;
  siswa_id: number;
  perusahaan_id: number;
  guru_pembimbing_id: number;
  tahun_ajaran_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_penempatan: 'aktif' | 'selesai' | 'dibatalkan';
  nomor_surat_pengantar?: string;
  catatan?: string;
  // Resolved data (from other services)
  siswa?: {
    id_siswa: number;
    nama_siswa: string;
    nis: string;
    kelas?: { nama_kelas: string; jurusan?: { nama_jurusan: string } };
  };
  perusahaan?: {
    id_perusahaan: number;
    nama_perusahaan: string;
    alamat?: string;
  };
  guru?: {
    id_guru: number;
    nama_guru: string;
  };
  created_at?: string;
}

export interface Absensi {
  id_absensi: number;
  id_penempatan: number;
  tanggal: string;
  jam_masuk?: string;
  jam_keluar?: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
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
  id_logbook: number;
  id_penempatan: number;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  kegiatan: string;
  deskripsi: string;
  foto?: string;
  status: 'pending' | 'approved' | 'revision';
  catatan_mentor?: string;
  catatan_guru?: string;
  penempatan?: Penempatan;
  created_at?: string;
}

export interface Penilaian {
  id_penilaian: number;
  id_penempatan: number;
  penilai_type: 'mentor' | 'guru';
  penilai_id: number;
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
    id_tahun_ajaran?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);
    if (params?.id_tahun_ajaran) query.append('id_tahun_ajaran', String(params.id_tahun_ajaran));

    const { data } = await apiFetch<PaginatedResponse<Pengajuan>>(
      'PlacementService',
      `/pengajuan?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Pengajuan>>(
      'PlacementService',
      `/pengajuan/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function approve(id: number, catatan?: string) {
    const { data } = await apiFetch<SingleResponse<Pengajuan>>(
      'PlacementService',
      `/pengajuan/${id}/approve`,
      { method: 'POST', data: { catatan } },
      true
    );
    return data;
  }

  async function reject(id: number, catatan: string) {
    const { data } = await apiFetch<SingleResponse<Pengajuan>>(
      'PlacementService',
      `/pengajuan/${id}/reject`,
      { method: 'POST', data: { catatan } },
      true
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
    id_perusahaan?: number;
    id_guru?: number;
    id_tahun_ajaran?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);
    if (params?.id_perusahaan) query.append('id_perusahaan', String(params.id_perusahaan));
    if (params?.id_guru) query.append('id_guru', String(params.id_guru));
    if (params?.id_tahun_ajaran) query.append('id_tahun_ajaran', String(params.id_tahun_ajaran));

    const { data } = await apiFetch<PaginatedResponse<Penempatan>>(
      'PlacementService',
      `/penempatan?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Penempatan>>(
      'PlacementService',
      `/penempatan/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: {
    siswa_id: number;
    perusahaan_id: number;
    guru_pembimbing_id: number;
    tahun_ajaran_id: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Penempatan>>(
      'PlacementService',
      '/penempatan',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    guru_pembimbing_id: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status_penempatan: string;
  }>) {
    const { data } = await apiFetch<SingleResponse<Penempatan>>(
      'PlacementService',
      `/penempatan/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  return { getAll, getById, create, update };
}

// =============================================
// ABSENSI API
// =============================================
export function useAbsensiApi() {
  async function getAll(params?: { 
    page?: number; 
    limit?: number; 
    id_penempatan?: number;
    status?: string;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    validasi_mentor?: boolean;
    validasi_guru?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.id_penempatan) query.append('id_penempatan', String(params.id_penempatan));
    if (params?.status) query.append('status', params.status);
    if (params?.tanggal_mulai) query.append('tanggal_mulai', params.tanggal_mulai);
    if (params?.tanggal_selesai) query.append('tanggal_selesai', params.tanggal_selesai);
    if (params?.validasi_mentor !== undefined) query.append('validasi_mentor', String(params.validasi_mentor));
    if (params?.validasi_guru !== undefined) query.append('validasi_guru', String(params.validasi_guru));

    const { data } = await apiFetch<PaginatedResponse<Absensi>>(
      'PlacementService',
      `/absensi?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function validate(id: number, payload: { 
    validasi_mentor?: boolean; 
    validasi_guru?: boolean;
    keterangan?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Absensi>>(
      'PlacementService',
      `/absensi/${id}/validate`,
      { method: 'POST', data: payload },
      true
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
    id_penempatan?: number;
    status_persetujuan?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.id_penempatan) query.append('id_penempatan', String(params.id_penempatan));
    if (params?.status_persetujuan) query.append('status_persetujuan', params.status_persetujuan);

    const { data } = await apiFetch<PaginatedResponse<Logbook>>(
      'PlacementService',
      `/logbook?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function approve(id: number, catatan?: string) {
    const { data } = await apiFetch<SingleResponse<Logbook>>(
      'PlacementService',
      `/logbook/${id}/approve`,
      { method: 'POST', data: { catatan } },
      true
    );
    return data;
  }

  async function requestRevision(id: number, catatan: string) {
    const { data } = await apiFetch<SingleResponse<Logbook>>(
      'PlacementService',
      `/logbook/${id}/revision`,
      { method: 'POST', data: { catatan } },
      true
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
    id_penempatan?: number;
    penilai_type?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.id_penempatan) query.append('id_penempatan', String(params.id_penempatan));
    if (params?.penilai_type) query.append('penilai_type', params.penilai_type);

    const { data } = await apiFetch<PaginatedResponse<Penilaian>>(
      'PlacementService',
      `/penilaian?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: {
    id_penempatan: number;
    penilai_type: 'mentor' | 'guru';
    penilai_id: number;
    nilai_sikap?: number;
    nilai_keterampilan?: number;
    nilai_pengetahuan?: number;
    nilai_kerjasama?: number;
    nilai_inisiatif?: number;
    catatan?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Penilaian>>(
      'PlacementService',
      '/penilaian',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    nilai_sikap: number;
    nilai_keterampilan: number;
    nilai_pengetahuan: number;
    nilai_kerjasama: number;
    nilai_inisiatif: number;
    catatan: string;
  }>) {
    const { data } = await apiFetch<SingleResponse<Penilaian>>(
      'PlacementService',
      `/penilaian/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function upsert(id_penempatan: number, payload: {
    nilai_kedisiplinan?: number;
    nilai_keterampilan?: number;
    nilai_sikap?: number;
    nilai_pembimbing_perusahaan?: number;
    nilai_pembimbing_sekolah?: number;
    catatan_penilaian?: string;
    tanggal_penilaian?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Penilaian>>(
      'PlacementService',
      `/penilaian/penempatan/${id_penempatan}`,
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  return { getAll, create, update, upsert };
}

// =============================================
// MONITORING API (Kunjungan)
// =============================================
export interface Monitoring {
  id_monitoring: number;
  id_penempatan: number;
  tanggal_monitoring: string;
  hasil_monitoring?: string;
  foto_monitoring?: string;
  created_at?: string;
  updated_at?: string;
}

// Kunjungan record (visit) with resolved IDs
export interface Kunjungan {
  id_monitoring: number;
  id_penempatan: number;
  siswa_id: number;
  perusahaan_id: number;
  tanggal_monitoring: string;
  hasil_monitoring?: string;
  foto_monitoring?: string;
  created_at?: string;
}

export interface MonitoringSiswa {
  id: number;
  siswa: string;
  kelas: string;
  perusahaan: string;
  absensi: number; // percentage
  logbook: number; // count
  nilai: number | null;
  status: 'aktif' | 'selesai' | 'bermasalah';
}

export interface MonitoringStats {
  total: number;
  good: number;
  warning: number;
  critical: number;
}

export function useMonitoringApi() {
  async function getAll(params?: { page?: number; limit?: number; id_penempatan?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    // If filtering by penempatan, use different endpoint
    if (params?.id_penempatan) {
      const { data } = await apiFetch<PaginatedResponse<Monitoring>>(
        'PlacementService',
        `/monitoring/penempatan/${params.id_penempatan}?${query.toString()}`,
        { method: 'GET' },
        true
      );
      return data;
    }

    // Otherwise get monitoring siswa list
    const { data } = await apiFetch<PaginatedResponse<MonitoringSiswa>>(
      'PlacementService',
      `/monitoring/siswa?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Monitoring>>(
      'PlacementService',
      `/monitoring/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getStats(params?: { id_tahun_ajaran?: number }) {
    const query = new URLSearchParams();
    if (params?.id_tahun_ajaran) query.append('id_tahun_ajaran', String(params.id_tahun_ajaran));

    const { data } = await apiFetch<SingleResponse<MonitoringStats>>(
      'PlacementService',
      `/monitoring/stats?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: { id_penempatan: number; tanggal_monitoring: string; hasil_monitoring?: string; foto_monitoring?: string }) {
    const { data } = await apiFetch<SingleResponse<Monitoring>>(
      'PlacementService',
      '/monitoring',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{ tanggal_monitoring: string; hasil_monitoring: string; foto_monitoring: string }>) {
    const { data } = await apiFetch<SingleResponse<Monitoring>>(
      'PlacementService',
      `/monitoring/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<null>>(
      'PlacementService',
      `/monitoring/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  async function getKunjungan(params?: { page?: number; limit?: number; id_guru?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.id_guru) query.append('id_guru', String(params.id_guru));

    const { data } = await apiFetch<PaginatedResponse<Kunjungan>>(
      'PlacementService',
      `/monitoring/kunjungan?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  return { getAll, getById, getStats, getKunjungan, create, update, remove };
}

