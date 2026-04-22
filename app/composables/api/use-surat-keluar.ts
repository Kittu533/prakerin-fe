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

export type SuratKeluarTemplateJenis =
  | "surat_tugas_murid"
  | "surat_permohonan"
  | "surat_perintah"
  | "surat_undangan";

export type SuratKeluarStatus = "draft" | "dikirim" | "diterima";

export interface SuratKeluarTemplatePayload {
  siswa?: Array<{
    id_siswa?: string;
    nama: string;
    nis: string;
    kelas: string;
  }>;
}

export interface SuratKeluar {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  ditujukan_kepada: string;
  alamat_tujuan: string;
  perihal?: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  isi_lampiran?: string;
  file_surat?: string;
  file_surat_docx?: string;
  file_surat_pdf?: string;
  file_surat_download_url?: string;
  file_surat_docx_download_url?: string;
  file_surat_pdf_download_url?: string;
  file_surat_storage_driver?: "local" | "r2";
  file_surat_docx_storage_driver?: "local" | "r2";
  file_surat_pdf_storage_driver?: "local" | "r2";
  template_jenis?: SuratKeluarTemplateJenis;
  template_payload?: SuratKeluarTemplatePayload;
  penandatangan_guru_id?: string;
  penandatangan: string;
  penandatangan_guru?: {
    id_guru: string;
    nama_guru: string;
    nip: string;
  };
  tanggal_kirim?: string;
  bukti_pengiriman?: string;
  bukti_pengiriman_download_url?: string;
  status: SuratKeluarStatus;
  created_at: string;
  updated_at: string;
}

export interface SuratKeluarCreate {
  nomor_surat: string;
  tanggal_surat: string;
  ditujukan_kepada: string;
  alamat_tujuan?: string;
  perihal?: string;
  klasifikasi_surat: string;
  sifat_surat: string;
  isi_lampiran?: string;
  file_surat?: string;
  file_surat_docx?: string;
  file_surat_pdf?: string;
  template_jenis?: SuratKeluarTemplateJenis;
  template_payload?: SuratKeluarTemplatePayload;
  penandatangan_guru_id: string;
  penandatangan?: string;
  tanggal_kirim?: string;
  bukti_pengiriman?: string;
}

export interface SuratKeluarUpdate {
  nomor_surat?: string;
  tanggal_surat?: string;
  ditujukan_kepada?: string;
  alamat_tujuan?: string;
  perihal?: string;
  klasifikasi_surat?: string;
  sifat_surat?: string;
  isi_lampiran?: string;
  file_surat?: string;
  file_surat_docx?: string;
  file_surat_pdf?: string;
  template_jenis?: SuratKeluarTemplateJenis;
  template_payload?: SuratKeluarTemplatePayload;
  penandatangan_guru_id?: string;
  penandatangan?: string;
  tanggal_kirim?: string;
  bukti_pengiriman?: string;
  status?: SuratKeluarStatus;
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

    const result = await safeFetch<any>("TataUsahaService", endpoint, { method: "GET" });
    if (!result.success) {
      return { success: false, message: result.message };
    }

    const payload = result.data;
    const fallbackPage = params?.page || 1;
    const fallbackLimit = params?.limit || 10;

    if (Array.isArray(payload)) {
      return {
        success: true,
        message: result.message,
        data: {
          success: true,
          data: payload,
          page: fallbackPage,
          limit: fallbackLimit,
          total: payload.length,
        },
      };
    }

    if (payload && typeof payload === "object") {
      const list = Array.isArray(payload.data) ? payload.data : [];
      return {
        success: true,
        message: result.message,
        data: {
          success: payload.success ?? true,
          data: list,
          page: payload.page ?? fallbackPage,
          limit: payload.limit ?? fallbackLimit,
          total: payload.total ?? list.length,
          message: payload.message,
        },
      };
    }

    return {
      success: true,
      message: result.message,
      data: {
        success: true,
        data: [],
        page: fallbackPage,
        limit: fallbackLimit,
        total: 0,
      },
    };
  }

  async function getById(id: string): Promise<{ success: boolean; data?: SuratKeluar; message: string }> {
    return safeFetch<SuratKeluar>("TataUsahaService", `/surat-keluar/${id}`, { method: "GET" });
  }

  async function create(data: SuratKeluarCreate): Promise<{ success: boolean; data?: SuratKeluar; message: string }> {
    return safeFetch<SuratKeluar>("TataUsahaService", "/surat-keluar", {
      method: "POST",
      data,
    });
  }

  async function update(id: string, data: SuratKeluarUpdate): Promise<{ success: boolean; data?: SuratKeluar; message: string }> {
    return safeFetch<SuratKeluar>("TataUsahaService", `/surat-keluar/${id}`, {
      method: "PUT",
      data,
    });
  }

  async function updateStatus(
    id: string,
    status: SuratKeluarStatus,
  ): Promise<{ success: boolean; data?: SuratKeluar; message: string }> {
    return safeFetch<SuratKeluar>("TataUsahaService", `/surat-keluar/${id}/status`, {
      method: "PATCH",
      data: { status },
    });
  }

  async function remove(id: string): Promise<{ success: boolean; message: string }> {
    return safeFetch<null>("TataUsahaService", `/surat-keluar/${id}`, { method: "DELETE" });
  }

  async function generateNomor(jenis: string = "surat_keluar"): Promise<{ success: boolean; data?: { nomor_surat: string }; message: string }> {
    const query = new URLSearchParams({ jenis }).toString();
    return safeFetch<{ nomor_surat: string }>(
      "TataUsahaService",
      `/surat-keluar/generate-nomor?${query}`,
      { method: "GET" },
    );
  }

  return {
    getAll,
    getById,
    create,
    update,
    updateStatus,
    remove,
    generateNomor,
  };
}
