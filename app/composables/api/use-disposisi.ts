/**
 * Disposisi API Composable
 * Endpoints for managing letter dispositions
 *
 * API Endpoints:
 * - GET /api/disposisi - List all (with pagination & filters)
 * - GET /api/disposisi/:id - Get by ID
 * - POST /api/disposisi - Create new
 * - PUT /api/disposisi/:id - Update
 * - DELETE /api/disposisi/:id - Soft delete
 */
import { apiFetch } from "~/composables/api-fetch";

export interface Disposisi {
  id: number;
  surat_masuk_id: number;
  tanggal_disposisi: string;
  penerima_disposisi: string;
  instruksi: string;
  instruksi_tambahan?: string;
  batas_waktu?: string;
  prioritas: string;
  status: string;
  created_at: string;
  updated_at: string;
  surat_masuk?: {
    nomor_surat: string;
    asal_surat: string;
    perihal: string;
  };
}

export interface DisposisiCreate {
  surat_masuk_id: number;
  tanggal_disposisi: string;
  penerima_disposisi: string;
  instruksi: string;
  instruksi_tambahan?: string;
  batas_waktu?: string;
  prioritas: string;
}

export interface DisposisiUpdate {
  tanggal_disposisi?: string;
  penerima_disposisi?: string;
  instruksi?: string;
  instruksi_tambahan?: string;
  batas_waktu?: string;
  prioritas?: string;
  status?: string;
}

export interface DisposisiListResponse {
  success: boolean;
  data: Disposisi[];
  page: number;
  limit: number;
  total: number;
  message?: string;
}

async function safeFetch<T>(
  service: string,
  endpoint: string,
  options: any = {},
  withToken: boolean = true,
): Promise<{ success: boolean; data?: T; message: string }> {
  try {
    const response = await apiFetch<any>(service, endpoint, options, withToken);

    if (response.status >= 200 && response.status < 300) {
      const responseData = response.data;
      if (responseData && typeof responseData === "object") {
        return {
          success: true,
          data: responseData.response ?? responseData.data ?? responseData,
          message: responseData.message ?? "Success",
        };
      }
      return { success: true, data: undefined, message: "Success" };
    } else {
      return {
        success: false,
        data: undefined,
        message: response.data?.message ?? `HTTP ${response.status}`,
      };
    }
  } catch (error: any) {
    console.error(`[SafeFetch] Error for ${service} → ${endpoint}:`, error);
    return {
      success: false,
      data: undefined,
      message: error?.message || "Network error",
    };
  }
}

export function useDisposisi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    surat_masuk_id?: number;
    status?: string;
    prioritas?: string;
  }): Promise<{ success: boolean; data?: DisposisiListResponse; message: string }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.surat_masuk_id) searchParams.append("surat_masuk_id", params.surat_masuk_id.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.prioritas) searchParams.append("prioritas", params.prioritas);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/disposisi?${queryString}` : "/disposisi";

    return safeFetch<DisposisiListResponse>("TataUsahaService", endpoint, { method: "GET" });
  }

  async function getById(id: number): Promise<{ success: boolean; data?: Disposisi; message: string }> {
    return safeFetch<Disposisi>("TataUsahaService", `/disposisi/${id}`, { method: "GET" });
  }

  async function create(data: DisposisiCreate): Promise<{ success: boolean; data?: Disposisi; message: string }> {
    return safeFetch<Disposisi>("TataUsahaService", "/disposisi", {
      method: "POST",
      data,
    });
  }

  async function update(id: number, data: DisposisiUpdate): Promise<{ success: boolean; data?: Disposisi; message: string }> {
    return safeFetch<Disposisi>("TataUsahaService", `/disposisi/${id}`, {
      method: "PUT",
      data,
    });
  }

  async function remove(id: number): Promise<{ success: boolean; message: string }> {
    return safeFetch<null>("TataUsahaService", `/disposisi/${id}`, { method: "DELETE" });
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
