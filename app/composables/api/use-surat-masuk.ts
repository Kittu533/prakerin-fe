/**
 * Surat Masuk API Composable
 * Endpoints for managing incoming letters
 *
 * API Endpoints:
 * - GET /api/surat-masuk - List all (with pagination & filters)
 * - GET /api/surat-masuk/:id - Get by ID
 * - POST /api/surat-masuk - Create new
 * - PUT /api/surat-masuk/:id - Update
 * - DELETE /api/surat-masuk/:id - Soft delete
 */
import { apiFetch } from "~/composables/api-fetch";

export interface SuratMasuk {
  id: number;
  nomor_agenda: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  asal_surat: string;
  perkara?: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  ditujukan_kepada: string;
  file_surat?: string;
  keterangan?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SuratMasukCreate {
  nomor_agenda: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  asal_surat: string;
  perkara?: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  ditujukan_kepada: string;
  file_surat?: string;
  keterangan?: string;
}

export interface SuratMasukUpdate {
  nomor_agenda?: string;
  nomor_surat?: string;
  tanggal_surat?: string;
  tanggal_diterima?: string;
  asal_surat?: string;
  perkara?: string;
  klasifikasi_surat?: string;
  sifat_surat?: string;
  ditujukan_kepada?: string;
  file_surat?: string;
  keterangan?: string;
  status?: string;
}

export interface SuratMasukListResponse {
  success: boolean;
  data: SuratMasuk[];
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

export function useSuratMasuk() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    klasifikasi_surat?: string;
    sifat_surat?: string;
    status?: string;
  }): Promise<{ success: boolean; data?: SuratMasukListResponse; message: string }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);
    if (params?.klasifikasi_surat) searchParams.append("klasifikasi_surat", params.klasifikasi_surat);
    if (params?.sifat_surat) searchParams.append("sifat_surat", params.sifat_surat);
    if (params?.status) searchParams.append("status", params.status);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/surat-masuk?${queryString}` : "/surat-masuk";

    return safeFetch<SuratMasukListResponse>("TataUsahaService", endpoint, { method: "GET" });
  }

  async function getById(id: number): Promise<{ success: boolean; data?: SuratMasuk; message: string }> {
    return safeFetch<SuratMasuk>("TataUsahaService", `/surat-masuk/${id}`, { method: "GET" });
  }

  async function create(data: SuratMasukCreate): Promise<{ success: boolean; data?: SuratMasuk; message: string }> {
    return safeFetch<SuratMasuk>("TataUsahaService", "/surat-masuk", {
      method: "POST",
      data,
    });
  }

  async function update(id: number, data: SuratMasukUpdate): Promise<{ success: boolean; data?: SuratMasuk; message: string }> {
    return safeFetch<SuratMasuk>("TataUsahaService", `/surat-masuk/${id}`, {
      method: "PUT",
      data,
    });
  }

  async function remove(id: number): Promise<{ success: boolean; message: string }> {
    return safeFetch<null>("TataUsahaService", `/surat-masuk/${id}`, { method: "DELETE" });
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
