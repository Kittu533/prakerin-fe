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
  id: string;
  nomor_agenda: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  asal_surat: string;
  perihal: string;
  perkara?: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  ditujukan_kepada: string;
  file_surat?: string;
  file_surat_download_url?: string;
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
  perihal: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  ditujukan_kepada: string;
  file_surat?: string;
  keterangan?: string;
  teruskan_ke?: string[];
}

export interface SuratMasukUpdate {
  nomor_agenda?: string;
  nomor_surat?: string;
  tanggal_surat?: string;
  tanggal_diterima?: string;
  asal_surat?: string;
  perihal?: string;
  klasifikasi_surat?: string;
  sifat_surat?: string;
  ditujukan_kepada?: string;
  file_surat?: string;
  keterangan?: string;
  teruskan_ke?: string[];
  status?: string;
}

export interface SuratMasukListResponse {
  data: SuratMasuk[];
  page: number;
  limit: number;
  total: number;
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  message: string;
}

function mapSuratMasuk(raw: any): SuratMasuk {
  return {
    ...raw,
    perihal: raw?.perihal ?? raw?.perkara ?? "",
    perkara: raw?.perkara ?? raw?.perihal ?? "",
  };
}

async function safeFetchData<T>(
  service: string,
  endpoint: string,
  options: any = {},
  withToken: boolean = true,
  keepEnvelope: boolean = false,
): Promise<ApiResult<T>> {
  try {
    const response = await apiFetch<any>(service, endpoint, options, withToken);
    const responseData = response?.data ?? {};
    const ok = response.status >= 200 && response.status < 300;

    if (!ok) {
      return {
        success: false,
        message: responseData?.message ?? `HTTP ${response.status}`,
      };
    }

    return {
      success: responseData?.success ?? true,
      data: (keepEnvelope ? responseData : (responseData?.data ?? responseData)) as T,
      message: responseData?.message ?? "Success",
    };
  } catch (error: any) {
    console.error(`[SafeFetch] Error for ${service} → ${endpoint}:`, error);
    return {
      success: false,
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
  }): Promise<ApiResult<SuratMasukListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);
    if (params?.klasifikasi_surat) searchParams.append("klasifikasi_surat", params.klasifikasi_surat);
    if (params?.sifat_surat) searchParams.append("sifat_surat", params.sifat_surat);
    if (params?.status) searchParams.append("status", params.status);
    searchParams.append("_ts", Date.now().toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/surat-masuk?${queryString}` : "/surat-masuk";

    const result = await safeFetchData<any>(
      "TataUsahaService",
      endpoint,
      { method: "GET" },
      true,
      true,
    );
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    const payload = result.data as any;
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    return {
      success: true,
      message: result.message,
      data: {
        data: rows.map(mapSuratMasuk),
        page: Number(payload?.page ?? payload?.meta?.page ?? params?.page ?? 1),
        limit: Number(payload?.limit ?? payload?.meta?.limit ?? params?.limit ?? 10),
        total: Number(payload?.total ?? payload?.meta?.total ?? rows.length),
      },
    };
  }

  async function getById(id: string): Promise<ApiResult<SuratMasuk>> {
    const result = await safeFetchData<any>("TataUsahaService", `/surat-masuk/${id}`, { method: "GET" });
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
      data: mapSuratMasuk(result.data),
    };
  }

  async function create(data: SuratMasukCreate): Promise<ApiResult<SuratMasuk>> {
    const result = await safeFetchData<any>("TataUsahaService", "/surat-masuk", {
      method: "POST",
      data,
    });
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }
    return {
      success: true,
      message: result.message,
      data: mapSuratMasuk(result.data),
    };
  }

  async function update(id: string, data: SuratMasukUpdate): Promise<ApiResult<SuratMasuk>> {
    const result = await safeFetchData<any>("TataUsahaService", `/surat-masuk/${id}`, {
      method: "PUT",
      data,
    });
    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }
    return {
      success: true,
      message: result.message,
      data: mapSuratMasuk(result.data),
    };
  }

  async function remove(id: string): Promise<ApiResult<null>> {
    return safeFetchData<null>("TataUsahaService", `/surat-masuk/${id}`, { method: "DELETE" });
  }

  async function getPdfById(id: string): Promise<ApiResult<Blob>> {
    try {
      const response = await apiFetch<Blob>(
        "TataUsahaService",
        `/surat-masuk/${id}/pdf`,
        {
          method: "GET",
          responseType: "blob",
        },
      );

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: response.data,
          message: "Success",
        };
      }

      return {
        success: false,
        message: `HTTP ${response.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Gagal mengambil PDF surat",
      };
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    getPdfById,
  };
}
