/**
 * Partner Service API Composable
 * Handles: Perusahaan
 *
 * API Endpoints (via Gateway):
 * - /api/perusahaan
 */
import { apiFetch } from "~/composables/api-fetch";

// =============================================
// TYPES
// =============================================
export interface Perusahaan {
  id_perusahaan: string;
  nama_perusahaan: string;
  alamat?: string;
  latitude?: number | null;
  longitude?: number | null;
  no_hp?: string;
  email?: string;
  bidang_usaha?: string;
  kapasitas_siswa?: number;
  status_kerjasama?: boolean;
  tahun_mulai_kerjasama?: number;
  created_at?: string;
  updated_at?: string;
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
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<Perusahaan>>(
      "PartnerService",
      `/perusahaan?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      "PartnerService",
      `/perusahaan/${id}`,
      { method: "GET" },
      true,
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
      "PartnerService",
      "/perusahaan",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nama_perusahaan: string;
      alamat: string;
      no_hp: string;
      email: string;
      bidang_usaha: string;
      kapasitas_siswa: number;
      status_kerjasama: boolean;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      "PartnerService",
      `/perusahaan/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      "PartnerService",
      `/perusahaan/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}
