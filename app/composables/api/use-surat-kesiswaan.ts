/**
 * Surat Kesiswaan API Composable
 * Endpoints for managing student letters (tugas, dispensasi, keterangan)
 *
 * API Endpoints:
 * - GET /api/surat-kesiswaan/tugas - List tugas letters
 * - GET /api/surat-kesiswaan/dispensasi - List dispensasi letters
 * - GET /api/surat-kesiswaan/keterangan-siswa - List keterangan siswa
 * - GET /api/surat-kesiswaan/keterangan-alumni - List keterangan alumni
 * - POST /api/surat-kesiswaan/tugas - Create tugas letter
 * - POST /api/surat-kesiswaan/dispensasi - Create dispensasi
 * - POST /api/surat-kesiswaan/keterangan-siswa - Create keterangan siswa
 * - POST /api/surat-kesiswaan/keterangan-alumni - Create keterangan alumni
 * - PUT /api/surat-kesiswaan/tugas/:id - Update tugas
 * - etc.
 */
import { apiFetch } from "~/composables/api-fetch";

export interface SuratKesiswaan {
  id: number;
  jenis: string;
  nomor_surat?: string;
  tanggal_surat: string;
  nim?: string;
  nama: string;
  kelas?: string;
  tahun_lulus?: string;
  alamat?: string;
  keperluan: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  jumlah_hari?: number;
  lampiran?: string;
  file_surat?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SuratKesiswaanCreate {
  jenis: string;
  nomor_surat?: string;
  tanggal_surat: string;
  nim?: string;
  nama: string;
  kelas?: string;
  tahun_lulus?: string;
  alamat?: string;
  keperluan: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  jumlah_hari?: number;
  lampiran?: string;
  file_surat?: string;
}

export interface SuratKesiswaanUpdate {
  nomor_surat?: string;
  tanggal_surat?: string;
  nama?: string;
  kelas?: string;
  alamat?: string;
  keperluan?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  jumlah_hari?: number;
  lampiran?: string;
  file_surat?: string;
  status?: string;
}

export interface SuratKesiswaanListResponse {
  success: boolean;
  data: SuratKesiswaan[];
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

export function useSuratKesiswaan() {
  async function getTugas(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: SuratKesiswaanListResponse; message: string }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/surat-kesiswaan/tugas?${queryString}` : "/surat-kesiswaan/tugas";

    return safeFetch<SuratKesiswaanListResponse>("TataUsahaService", endpoint, { method: "GET" });
  }

  async function getDispensasi(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: SuratKesiswaanListResponse; message: string }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/surat-kesiswaan/dispensasi?${queryString}` : "/surat-kesiswaan/dispensasi";

    return safeFetch<SuratKesiswaanListResponse>("TataUsahaService", endpoint, { method: "GET" });
  }

  async function getKeteranganSiswa(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: SuratKesiswaanListResponse; message: string }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/surat-kesiswaan/keterangan-siswa?${queryString}` : "/surat-kesiswaan/keterangan-siswa";

    return safeFetch<SuratKesiswaanListResponse>("TataUsahaService", endpoint, { method: "GET" });
  }

  async function getKeteranganAlumni(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: SuratKesiswaanListResponse; message: string }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/surat-kesiswaan/keterangan-alumni?${queryString}` : "/surat-kesiswaan/keterangan-alumni";

    return safeFetch<SuratKesiswaanListResponse>("TataUsahaService", endpoint, { method: "GET" });
  }

  async function createTugas(data: SuratKesiswaanCreate): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    return safeFetch<SuratKesiswaan>("TataUsahaService", "/surat-kesiswaan/tugas", {
      method: "POST",
      data,
    });
  }

  async function createDispensasi(data: SuratKesiswaanCreate): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    return safeFetch<SuratKesiswaan>("TataUsahaService", "/surat-kesiswaan/dispensasi", {
      method: "POST",
      data,
    });
  }

  async function createKeteranganSiswa(data: SuratKesiswaanCreate): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    return safeFetch<SuratKesiswaan>("TataUsahaService", "/surat-kesiswaan/keterangan-siswa", {
      method: "POST",
      data,
    });
  }

  async function createKeteranganAlumni(data: SuratKesiswaanCreate): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    return safeFetch<SuratKesiswaan>("TataUsahaService", "/surat-kesiswaan/keterangan-alumni", {
      method: "POST",
      data,
    });
  }

  async function update(id: number, data: SuratKesiswaanUpdate): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    return safeFetch<SuratKesiswaan>("TataUsahaService", `/surat-kesiswaan/${id}`, {
      method: "PUT",
      data,
    });
  }

  async function remove(id: number): Promise<{ success: boolean; message: string }> {
    return safeFetch<null>("TataUsahaService", `/surat-kesiswaan/${id}`, { method: "DELETE" });
  }

  return {
    getTugas,
    getDispensasi,
    getKeteranganSiswa,
    getKeteranganAlumni,
    createTugas,
    createDispensasi,
    createKeteranganSiswa,
    createKeteranganAlumni,
    update,
    remove,
  };
}
