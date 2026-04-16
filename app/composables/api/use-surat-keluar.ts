/**
 * Surat Keluar API Composable
 * Endpoints for managing outgoing letters
 *
 * API Endpoints:
 * - GET /api/surat-keluar - List all (with pagination & filters)
 * - GET /api/surat-keluar/:id - Get by ID
 * - POST /api/surat-keluar - Create new
 * - PUT /api/surat-keluar/:id - Update
 * - DELETE /api/surat-keluar/:id - Soft delete
 */
import { apiFetch } from "~/composables/api-fetch";

export interface SuratKeluar {
  id: number;
  nomor_surat: string;
  tanggal_surat: string;
  ditujukan_kepada: string;
  alamat_tujuan: string;
  perkara?: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  isi_lampiran?: string;
  file_surat?: string;
  penandatangan: string;
  tanggal_kirim?: string;
  bukti_pengiriman?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SuratKeluarCreate {
  nomor_surat: string;
  tanggal_surat: string;
  ditujukan_kepada: string;
  alamat_tujuan: string;
  perkara?: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  isi_lampiran?: string;
  file_surat?: string;
  penandatangan: string;
  tanggal_kirim?: string;
  bukti_pengiriman?: string;
}

export interface SuratKeluarUpdate {
  nomor_surat?: string;
  tanggal_surat?: string;
  ditujukan_kepada?: string;
  alamat_tujuan?: string;
  perkara?: string;
  klasifikasi_surat?: string;
  sifat_surat?: string;
  isi_lampiran?: string;
  file_surat?: string;
  penandatangan?: string;
  tanggal_kirim?: string;
  bukti_pengiriman?: string;
  status?: string;
}

export interface SuratKeluarListResponse {
  success: boolean;
  data: SuratKeluar[];
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

export function useSuratKeluar() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
    klasifikasi_surat?: string;
    sifat_surat?: string;
    status?: string;
  }): Promise<{ success: boolean; data?: SuratKeluarListResponse; message: string }> {
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
    const endpoint = queryString ? `/surat-keluar?${queryString}` : "/surat-keluar";

    return safeFetch<SuratKeluarListResponse>("TataUsahaService", endpoint, { method: "GET" });
  }

  async function getById(id: number): Promise<{ success: boolean; data?: SuratKeluar; message: string }> {
    return safeFetch<SuratKeluar>("TataUsahaService", `/surat-keluar/${id}`, { method: "GET" });
  }

  async function create(data: SuratKeluarCreate): Promise<{ success: boolean; data?: SuratKeluar; message: string }> {
    return safeFetch<SuratKeluar>("TataUsahaService", "/surat-keluar", {
      method: "POST",
      data,
    });
  }

  async function update(id: number, data: SuratKeluarUpdate): Promise<{ success: boolean; data?: SuratKeluar; message: string }> {
    return safeFetch<SuratKeluar>("TataUsahaService", `/surat-keluar/${id}`, {
      method: "PUT",
      data,
    });
  }

  async function remove(id: number): Promise<{ success: boolean; message: string }> {
    return safeFetch<null>("TataUsahaService", `/surat-keluar/${id}`, { method: "DELETE" });
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
