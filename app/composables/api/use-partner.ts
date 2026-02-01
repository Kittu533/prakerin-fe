/**
 * Partner Service API Composable
 * Handles: Perusahaan, Mentor
 * 
 * API Endpoints (via Gateway):
 * - /api/perusahaan
 * - /api/mentor
 */
import { apiFetch } from '~/composables/api-fetch';

// =============================================
// TYPES
// =============================================
export interface Perusahaan {
  id_perusahaan: number;
  nama_perusahaan: string;
  alamat?: string;
  no_hp?: string;
  email?: string;
  bidang_usaha?: string;
  kapasitas_siswa?: number;
  status_kerjasama?: boolean;
  tahun_mulai_kerjasama?: number;
  created_at?: string;
}

export interface Mentor {
  id_mentor: number;
  nama_mentor: string;
  jabatan?: string;
  email?: string;
  no_hp?: string;
  id_perusahaan: number;
  status_aktif?: boolean;
  perusahaan?: {
    id_perusahaan: number;
    nama_perusahaan: string;
  };
  created_at?: string;
  generated_password?: string;
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
// PERUSAHAAN API
// =============================================
export function usePerusahaanApi() {
  async function getAll(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);

    const { data } = await apiFetch<PaginatedResponse<Perusahaan>>(
      'PartnerService',
      `/perusahaan?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      'PartnerService',
      `/perusahaan/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: {
    nama_perusahaan: string;
    alamat?: string;
    no_hp?: string;
    email?: string;
    bidang_usaha?: string;
    kapasitas_siswa?: number;
    status_kerjasama?: boolean;
    tahun_mulai_kerjasama?: number;
  }) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      'PartnerService',
      '/perusahaan',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    nama_perusahaan: string;
    alamat: string;
    no_hp: string;
    email: string;
    bidang_usaha: string;
    kapasitas_siswa: number;
    status_kerjasama: boolean;
  }>) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      'PartnerService',
      `/perusahaan/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      'PartnerService',
      `/perusahaan/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}

// =============================================
// MENTOR API
// =============================================
export function useMentorApi() {
  async function getAll(params?: { page?: number; limit?: number; id_perusahaan?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.id_perusahaan) query.append('id_perusahaan', String(params.id_perusahaan));

    const { data } = await apiFetch<PaginatedResponse<Mentor>>(
      'PartnerService',
      `/mentor?${query.toString()}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function getById(id: number) {
    const { data } = await apiFetch<SingleResponse<Mentor>>(
      'PartnerService',
      `/mentor/${id}`,
      { method: 'GET' },
      true
    );
    return data;
  }

  async function create(payload: {
    nama_mentor: string;
    jabatan?: string;
    email: string;
    no_hp?: string;
    id_perusahaan: number;
  }) {
    const { data } = await apiFetch<SingleResponse<Mentor>>(
      'PartnerService',
      '/mentor',
      { method: 'POST', data: payload },
      true
    );
    return data;
  }

  async function update(id: number, payload: Partial<{
    nama_mentor: string;
    jabatan: string;
    email: string;
    no_hp: string;
    id_perusahaan: number;
  }>) {
    const { data } = await apiFetch<SingleResponse<Mentor>>(
      'PartnerService',
      `/mentor/${id}`,
      { method: 'PUT', data: payload },
      true
    );
    return data;
  }

  async function remove(id: number) {
    const { data } = await apiFetch<SingleResponse<Mentor>>(
      'PartnerService',
      `/mentor/${id}`,
      { method: 'DELETE' },
      true
    );
    return data;
  }

  async function resetPassword(id: number) {
    const { data } = await apiFetch<SingleResponse<{ generated_password: string }>>(
      'PartnerService',
      `/mentor/${id}/reset-password`,
      { method: 'POST' },
      true
    );
    return data;
  }

  return { getAll, getById, create, update, remove, resetPassword };
}
