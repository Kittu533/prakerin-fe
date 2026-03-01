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
import { apiFetch } from "~/composables/api-fetch";

// =============================================
// ERROR HANDLING HELPER
// =============================================
async function safeFetch<T>(
  service: string,
  endpoint: string,
  options: any = {},
  withToken: boolean = true,
  fallbackData?: T,
): Promise<{ success: boolean; data?: T; message: string }> {
  try {
    const response = await apiFetch<any>(service, endpoint, options, withToken);

    // Check response status
    if (response.status >= 200 && response.status < 300) {
      return (
        response.data || {
          success: true,
          data: fallbackData,
          message: "Success",
        }
      );
    } else {
      console.warn(
        `[SafeFetch] Non-2xx status: ${response.status} for ${service} → ${endpoint}`,
      );
      return {
        success: false,
        data: fallbackData,
        message:
          response.data?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error(`[SafeFetch] Error for ${service} → ${endpoint}:`, error);
    return {
      success: false,
      data: fallbackData,
      message: error?.message || "Network error",
    };
  }
}

// =============================================
// TYPES
// =============================================
export interface Siswa {
  id_siswa: string;
  nis: string;
  nama_siswa: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
  email?: string;
  foto?: string;
  id_kelas: string;
  kelas?: {
    id_kelas: string;
    nama_kelas: string;
    jurusan?: { nama_jurusan: string };
    tingkat?: { kode_tingkat: string };
  };
  created_at?: string;
  generated_password?: string;
}

export interface Guru {
  id_guru: string;
  nip: string;
  nama_guru: string;
  email?: string;
  no_hp?: string;
  status_aktif: boolean;
  created_at?: string;
  generated_password?: string;
}

export interface Kelas {
  id_kelas: string;
  nama_kelas: string;
  id_jurusan: string;
  id_tingkat: string;
  id_guru?: string;
  id_tahun_ajaran: string;
  jurusan?: { id_jurusan: string; nama_jurusan: string };
  tingkat?: { id_tingkat: string; kode_tingkat: string };
  guru?: { id_guru: string; nama_guru: string };
  tahun_ajaran?: { id_tahun_ajaran: string; nama_tahun_ajaran: string };
}

export interface Jurusan {
  id_jurusan: string;
  kode_jurusan: string;
  nama_jurusan: string;
}

export interface TahunAjaran {
  id_tahun_ajaran: string;
  nama_tahun_ajaran: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status_aktif: boolean;
}

export interface Tingkat {
  id_tingkat: string;
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
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_kelas?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_kelas) query.append("id_kelas", String(params.id_kelas));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<Siswa>>(
      "CoreService",
      `/siswa?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      "CoreService",
      `/siswa/${id}`,
      { method: "GET" },
      true,
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
    id_kelas: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      "CoreService",
      "/siswa",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nis: string;
      nama_siswa: string;
      jenis_kelamin: string;
      tanggal_lahir: string;
      alamat: string;
      no_hp: string;
      email: string;
      id_kelas: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      "CoreService",
      `/siswa/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "CoreService",
      `/siswa/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  async function resetPassword(id: string) {
    const { data } = await apiFetch<
      SingleResponse<{ generated_password: string }>
    >("CoreService", `/siswa/${id}/reset-password`, { method: "POST" }, true);
    return data;
  }

  return { getAll, getById, create, update, remove, resetPassword };
}

// =============================================
// GURU API
// =============================================
export function useGuruApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<Guru>>(
      "CoreService",
      `/guru?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getMe() {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      "/guru/me",
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      `/guru/${id}`,
      { method: "GET" },
      true,
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
      "CoreService",
      "/guru",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nip: string;
      nama_guru: string;
      email: string;
      no_hp: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      `/guru/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      `/guru/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  async function resetPassword(id: string) {
    const { data } = await apiFetch<
      SingleResponse<{ generated_password: string }>
    >("CoreService", `/guru/${id}/reset-password`, { method: "POST" }, true);
    return data;
  }

  return { getAll, getMe, getById, create, update, remove, resetPassword };
}

// =============================================
// KELAS API
// =============================================
export function useKelasApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_jurusan?: string;
    id_tahun_ajaran?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_jurusan)
      query.append("id_jurusan", String(params.id_jurusan));
    if (params?.id_tahun_ajaran)
      query.append("id_tahun_ajaran", String(params.id_tahun_ajaran));

    const { data } = await apiFetch<PaginatedResponse<Kelas>>(
      "CoreService",
      `/kelas?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      "CoreService",
      `/kelas/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    nama_kelas: string;
    id_jurusan: string;
    id_tingkat: string;
    id_guru?: string;
    id_tahun_ajaran: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      "CoreService",
      "/kelas",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nama_kelas: string;
      id_jurusan: string;
      id_tingkat: string;
      id_guru: string;
      id_tahun_ajaran: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      "CoreService",
      `/kelas/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "CoreService",
      `/kelas/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}

// =============================================
// JURUSAN API
// =============================================
export function useJurusanApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<Jurusan>>(
      "CoreService",
      `/jurusan?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      "CoreService",
      `/jurusan/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    kode_jurusan: string;
    nama_jurusan: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      "CoreService",
      "/jurusan",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{ kode_jurusan: string; nama_jurusan: string }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      "CoreService",
      `/jurusan/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "CoreService",
      `/jurusan/${id}`,
      { method: "DELETE" },
      true,
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
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return await safeFetch<PaginatedResponse<TahunAjaran>>(
      "CoreService",
      `/tahun-ajaran?${query.toString()}`,
      { method: "GET" },
      true,
      {
        success: false,
        message: "Fallback data",
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      },
    );
  }

  async function getActive() {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      "/tahun-ajaran/active",
      { method: "GET" },
      true,
      {
        id_tahun_ajaran: "1",
        nama_tahun_ajaran: "2024/2025",
        tanggal_mulai: "2024-07-01",
        tanggal_selesai: "2025-06-30",
        status_aktif: true,
      },
    );
  }

  async function getById(id: string) {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      `/tahun-ajaran/${id}`,
      { method: "GET" },
      true,
    );
  }

  async function create(payload: {
    nama_tahun_ajaran: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status_aktif?: boolean;
  }) {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      "/tahun-ajaran",
      { method: "POST", data: payload },
      true,
    );
  }

  async function update(
    id: string,
    payload: Partial<{
      nama_tahun_ajaran: string;
      tanggal_mulai: string;
      tanggal_selesai: string;
      status_aktif: boolean;
    }>,
  ) {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      `/tahun-ajaran/${id}`,
      { method: "PUT", data: payload },
      true,
    );
  }

  async function remove(id: string) {
    return await safeFetch<null>(
      "CoreService",
      `/tahun-ajaran/${id}`,
      { method: "DELETE" },
      true,
    );
  }

  return { getAll, getActive, getById, create, update, remove };
}

// =============================================
// TINGKAT API
// =============================================
export function useTingkatApi() {
  async function getAll() {
    const { data } = await apiFetch<PaginatedResponse<Tingkat>>(
      "CoreService",
      "/tingkat",
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Tingkat>>(
      "CoreService",
      `/tingkat/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: { kode_tingkat: string; urutan: number }) {
    const { data } = await apiFetch<SingleResponse<Tingkat>>(
      "CoreService",
      "/tingkat",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{ kode_tingkat: string; urutan: number }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Tingkat>>(
      "CoreService",
      `/tingkat/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "CoreService",
      `/tingkat/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}
