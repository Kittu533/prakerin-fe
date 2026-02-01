/**
 * Academic/Core Service API Composable
 * Handles: Siswa, Guru, Kelas, Jurusan, Tahun Ajaran, Tingkat
 * 
 * API Endpoints (via Gateway):
 * - /api/siswa
 * - /api/guru
 * - /api/kelas
 * - /api/jurusan
 * - /api/tahun-ajaran
 * - /api/tingkat
 */
import { apiFetch } from '~/composables/api-fetch';

// =============================================
// TYPES
// =============================================
export interface Siswa {
  id_siswa: number;
  nis: string;
  nama_siswa: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
  email?: string;
  foto?: string;
  id_kelas: number;
  kelas?: {
    id_kelas: number;
    nama_kelas: string;
    jurusan?: { nama_jurusan: string };
    tingkat?: { kode_tingkat: string };
  };
  created_at?: string;
  generated_password?: string;
}

export interface Guru {
  id_guru: number;
  nip: string;
  nama_guru: string;
  email?: string;
  no_hp?: string;
  status_aktif: boolean;
  created_at?: string;
  generated_password?: string;
}

export interface Kelas {
  id_kelas: number;
  nama_kelas: string;
  id_jurusan: number;
  id_tingkat: number;
  id_guru?: number;
  id_tahun_ajaran: number;
  jurusan?: { id_jurusan: number; nama_jurusan: string };
  tingkat?: { id_tingkat: number; kode_tingkat: string };
  guru?: { id_guru: number; nama_guru: string };
  tahun_ajaran?: { id_tahun_ajaran: number; nama_tahun_ajaran: string };
}

export interface Jurusan {
  id_jurusan: number;
  kode_jurusan: string;
  nama_jurusan: string;
}

export interface TahunAjaran {
  id_tahun_ajaran: number;
  nama_tahun_ajaran: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status_aktif: boolean;
}

export interface Tingkat {
  id_tingkat: number;
  kode_tingkat: string;
  urutan: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
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
// SISWA API
// =============================================
export function useSiswaApi() {
  async function getAll(params?: { page?: number; limit?: number; id_kelas?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.id_kelas) query.append('id_kelas', String(params.id_kelas));
    if (params?.search) query.append('search', params.search);

    const { data } = await apiFetch<PaginatedResponse<Siswa>>(
      'CoreService',
      `/siswa?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      'CoreService',
      `/siswa/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: {
    nis: string;
    nama_siswa: string;
    jenis_kelamin?: string;
    tanggal_lahir?: string;
    alamat?: string;
    no_hp?: string;
    email?: string;
    id_kelas: number;
  }) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      'CoreService',
      '/siswa',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    nis: string;
    nama_siswa: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    alamat: string;
    no_hp: string;
    email: string;
    id_kelas: number;
  }>) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      'CoreService',
      `/siswa/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<null>>(
      'CoreService',
      `/siswa/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  async function resetPassword(id: number) {
    const { data } = await apiFetch<SingleResponse<{ generated_password: string }>>(
      'CoreService',
      `/siswa/${id}/reset-password`,
      { method: 'POST' },
      true
    );
    return data;
  }

  return { getAll, getById, create, update, remove, resetPassword };
}

// =============================================
// GURU API
// =============================================
export function useGuruApi() {
  async function getAll(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);

    const { data } = await apiFetch<PaginatedResponse<Guru>>(
      'CoreService',
      `/guru?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getMe() {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      'CoreService',
      '/guru/me',
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      'CoreService',
      `/guru/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: {
    nip: string;
    nama_guru: string;
    email?: string;
    no_hp?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      'CoreService',
      '/guru',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    nip: string;
    nama_guru: string;
    email: string;
    no_hp: string;
  }>) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      'CoreService',
      `/guru/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      'CoreService',
      `/guru/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  async function resetPassword(id: number) {
    const { data } = await apiFetch<SingleResponse<{ generated_password: string }>>(
      'CoreService',
      `/guru/${id}/reset-password`,
      { method: 'POST' },
      true
    );
    return data;
  }

  return { getAll, getMe, getById, create, update, remove, resetPassword };
}

// =============================================
// KELAS API
// =============================================
export function useKelasApi() {
  async function getAll(params?: { page?: number; limit?: number; id_jurusan?: number; id_tahun_ajaran?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.id_jurusan) query.append('id_jurusan', String(params.id_jurusan));
    if (params?.id_tahun_ajaran) query.append('id_tahun_ajaran', String(params.id_tahun_ajaran));

    const { data } = await apiFetch<PaginatedResponse<Kelas>>(
      'CoreService',
      `/kelas?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      'CoreService',
      `/kelas/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: {
    nama_kelas: string;
    id_jurusan: number;
    id_tingkat: number;
    id_guru?: number;
    id_tahun_ajaran: number;
  }) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      'CoreService',
      '/kelas',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    nama_kelas: string;
    id_jurusan: number;
    id_tingkat: number;
    id_guru: number;
    id_tahun_ajaran: number;
  }>) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      'CoreService',
      `/kelas/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<null>>(
      'CoreService',
      `/kelas/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}

// =============================================
// JURUSAN API
// =============================================
export function useJurusanApi() {
  async function getAll(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);

    const { data } = await apiFetch<PaginatedResponse<Jurusan>>(
      'CoreService',
      `/jurusan?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      'CoreService',
      `/jurusan/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: { kode_jurusan: string; nama_jurusan: string }) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      'CoreService',
      '/jurusan',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{ kode_jurusan: string; nama_jurusan: string }>) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      'CoreService',
      `/jurusan/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<null>>(
      'CoreService',
      `/jurusan/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}

// =============================================
// TAHUN AJARAN API
// =============================================
export function useTahunAjaranApi() {
  async function getAll(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const { data } = await apiFetch<PaginatedResponse<TahunAjaran>>(
      'CoreService',
      `/tahun-ajaran?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getActive() {
    const { data } = await apiFetch<SingleResponse<TahunAjaran>>(
      'CoreService',
      '/tahun-ajaran/active',
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<TahunAjaran>>(
      'CoreService',
      `/tahun-ajaran/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: { 
    nama_tahun_ajaran: string; 
    tanggal_mulai: string; 
    tanggal_selesai: string;
    status_aktif?: boolean;
  }) {
    const { data } = await apiFetch<SingleResponse<TahunAjaran>>(
      'CoreService',
      '/tahun-ajaran',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    nama_tahun_ajaran: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status_aktif: boolean;
  }>) {
    const { data } = await apiFetch<SingleResponse<TahunAjaran>>(
      'CoreService',
      `/tahun-ajaran/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<null>>(
      'CoreService',
      `/tahun-ajaran/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  return { getAll, getActive, getById, create, update, remove };
}

// =============================================
// TINGKAT API
// =============================================
export function useTingkatApi() {
  async function getAll() {
    const { data } = await apiFetch<PaginatedResponse<Tingkat>>(
      'CoreService',
      '/tingkat',
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Tingkat>>(
      'CoreService',
      `/tingkat/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: { kode_tingkat: string; urutan: number }) {
    const { data } = await apiFetch<SingleResponse<Tingkat>>(
      'CoreService',
      '/tingkat',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{ kode_tingkat: string; urutan: number }>) {
    const { data } = await apiFetch<SingleResponse<Tingkat>>(
      'CoreService',
      `/tingkat/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<null>>(
      'CoreService',
      `/tingkat/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}
