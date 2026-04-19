import { apiFetch } from "~/composables/api-fetch";

export interface SuratKesiswaan {
  id: string;
  siswa_id?: string;
  jenis: string;
  nomor_surat?: string;
  tanggal_surat: string;
  tanggal_kegiatan?: string;
  nis?: string;
  nama: string;
  kelas?: string;
  keterangan?: string;
  tempat?: string;
  alamat?: string;
  keperluan: string;
  waktu_jam?: string;
  penandatangan?: string;
  penandatangan_guru_id?: string;
  penandatangan_guru?: {
    id_guru: string;
    nama_guru: string;
    nip: string;
  };
  file_surat?: string;
  file_surat_docx?: string;
  file_surat_pdf?: string;
  file_docx?: string;
  file_pdf?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SuratKesiswaanApiRecord {
  id: string;
  jenis_surat: string;
  nomor_surat: string;
  tanggal_surat: string;
  siswa_id?: string;
  nama_siswa?: string;
  nis?: string;
  kelas?: string;
  keperluan?: string;
  keterangan?: string;
  penandatangan?: string;
  penandatangan_guru_id?: string;
  penandatangan_guru?: {
    id_guru: string;
    nama_guru: string;
    nip: string;
  };
  file_surat?: string;
  file_surat_docx?: string;
  file_surat_pdf?: string;
  file_docx?: string;
  file_pdf?: string;
  tanggal_kegiatan?: string;
  tempat_kegiatan?: string;
  penyelenggara?: string;
  created_at: string;
  updated_at: string;
}

export interface SuratKesiswaanCreateBatchTugas {
  siswa_ids: string[];
  jenis_dokumen: string;
  dasar_penugasan_id?: string;
  alamat?: string;
  tempat?: string;
  waktu_jam?: string;
  tgl_mulai: string;
  tgl_selesai?: string;
  keperluan: string;
  penandatangan_guru_id: string;
}

export interface SuratKesiswaanUpdate {
  tanggal_surat?: string;
  keperluan?: string;
  tempat?: string;
  alamat?: string;
  waktu_jam?: string;
  tgl_mulai?: string;
  tgl_selesai?: string;
  penandatangan_guru_id?: string;
}

export interface SuratKesiswaanListResponse {
  success: boolean;
  data: SuratKesiswaan[];
  page: number;
  limit: number;
  total: number;
  message?: string;
}

function normalizeFilePath(value?: string): string | undefined {
  const normalized = String(value || "").trim();
  return normalized.length > 0 ? normalized : undefined;
}

function resolveVariantPath(sourcePath: string, extension: "docx" | "pdf"): string {
  if (/\.(pdf|docx)$/i.test(sourcePath)) {
    return sourcePath.replace(/\.(pdf|docx)$/i, `.${extension}`);
  }
  return `${sourcePath}.${extension}`;
}

function mapSurat(record: SuratKesiswaanApiRecord): SuratKesiswaan {
  const waktuMatch = record.keterangan?.match(/Waktu:\s*([^;]+)/i);
  const baseFilePath = normalizeFilePath(record.file_surat);
  const explicitDocx = normalizeFilePath(record.file_surat_docx || record.file_docx);
  const explicitPdf = normalizeFilePath(record.file_surat_pdf || record.file_pdf || record.file_surat);
  const derivedDocx = explicitDocx || (baseFilePath ? resolveVariantPath(baseFilePath, "docx") : undefined);
  const derivedPdf = explicitPdf || (baseFilePath ? resolveVariantPath(baseFilePath, "pdf") : undefined);

  return {
    id: record.id,
    siswa_id: record.siswa_id,
    jenis: record.jenis_surat,
    nomor_surat: record.nomor_surat,
    tanggal_surat: record.tanggal_surat,
    tanggal_kegiatan: record.tanggal_kegiatan,
    nis: record.nis,
    nama: record.nama_siswa || "-",
    kelas: record.kelas,
    keterangan: record.keterangan,
    tempat: record.tempat_kegiatan,
    alamat: record.penyelenggara,
    keperluan: record.keperluan || record.keterangan || "-",
    waktu_jam: waktuMatch?.[1]?.trim(),
    penandatangan: record.penandatangan,
    penandatangan_guru_id: record.penandatangan_guru_id,
    penandatangan_guru: record.penandatangan_guru,
    file_surat: derivedPdf || baseFilePath,
    file_surat_docx: derivedDocx,
    file_surat_pdf: derivedPdf,
    file_docx: derivedDocx,
    file_pdf: derivedPdf,
    status: "selesai",
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

async function safeFetch(
  endpoint: string,
  options: any = {},
): Promise<{ success: boolean; payload?: any; message: string }> {
  try {
    const response = await apiFetch<any>("TataUsahaService", endpoint, options, true);

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        payload: response.data,
        message: response.data?.message ?? "Success",
      };
    }

    return {
      success: false,
      message: response.data?.message ?? `HTTP ${response.status}`,
    };
  } catch (error: any) {
    console.error("[SuratKesiswaanAPI] Error:", error);
    return {
      success: false,
      message: error?.message || "Network error",
    };
  }
}

function buildListEndpoint(jenisSurat: string, params?: { page?: number; limit?: number; search?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.search) searchParams.append("search", params.search);

  if (jenisSurat) {
    searchParams.append("jenis_surat", jenisSurat);
  }

  const queryString = searchParams.toString();
  return queryString ? `/surat-kesiswaan?${queryString}` : "/surat-kesiswaan";
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
    const res = await safeFetch(endpoint, { method: "GET" });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const records: SuratKesiswaanApiRecord[] = Array.isArray(payload.data) ? payload.data : [];

    return {
      success: true,
      message: payload.message ?? "Success",
      data: {
        success: true,
        data: records.map(mapSurat),
        page: payload.page ?? 1,
        limit: payload.limit ?? 10,
        total: payload.total ?? records.length,
      },
    };
  }

  async function getDispensasi(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: SuratKesiswaanListResponse; message: string }> {
    const endpoint = buildListEndpoint("dispensasi", params);
    const res = await safeFetch(endpoint, { method: "GET" });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const records: SuratKesiswaanApiRecord[] = Array.isArray(payload.data) ? payload.data : [];

    return {
      success: true,
      message: payload.message ?? "Success",
      data: {
        success: true,
        data: records.map(mapSurat),
        page: payload.page ?? 1,
        limit: payload.limit ?? 10,
        total: payload.total ?? records.length,
      },
    };
  }

  async function getKeteranganSiswa(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: SuratKesiswaanListResponse; message: string }> {
    const endpoint = buildListEndpoint("keterangan_siswa", params);
    const res = await safeFetch(endpoint, { method: "GET" });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const records: SuratKesiswaanApiRecord[] = Array.isArray(payload.data) ? payload.data : [];

    return {
      success: true,
      message: payload.message ?? "Success",
      data: {
        success: true,
        data: records.map(mapSurat),
        page: payload.page ?? 1,
        limit: payload.limit ?? 10,
        total: payload.total ?? records.length,
      },
    };
  }

  async function getKeteranganAlumni(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: SuratKesiswaanListResponse; message: string }> {
    const endpoint = buildListEndpoint("keterangan_alumni", params);
    const res = await safeFetch(endpoint, { method: "GET" });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const records: SuratKesiswaanApiRecord[] = Array.isArray(payload.data) ? payload.data : [];

    return {
      success: true,
      message: payload.message ?? "Success",
      data: {
        success: true,
        data: records.map(mapSurat),
        page: payload.page ?? 1,
        limit: payload.limit ?? 10,
        total: payload.total ?? records.length,
      },
    };
  }

  async function createTugas(data: SuratKesiswaanCreateBatchTugas): Promise<{ success: boolean; data?: SuratKesiswaan[]; message: string }> {
    const res = await safeFetch("/surat-kesiswaan/tugas/batch", {
      method: "POST",
      data,
    });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const records: SuratKesiswaanApiRecord[] = Array.isArray(payload.data) ? payload.data : [];

    return {
      success: true,
      message: payload.message ?? "Success",
      data: records.map(mapSurat),
    };
  }

  async function createDispensasi(data: Record<string, any>): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    const res = await safeFetch("/surat-kesiswaan/dispensasi", {
      method: "POST",
      data,
    });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const record = payload.data as SuratKesiswaanApiRecord | undefined;
    return {
      success: true,
      message: payload.message ?? "Success",
      data: record ? mapSurat(record) : undefined,
    };
  }

  async function createKeteranganSiswa(data: Record<string, any>): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    const res = await safeFetch("/surat-kesiswaan/keterangan-siswa", {
      method: "POST",
      data,
    });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const record = payload.data as SuratKesiswaanApiRecord | undefined;
    return {
      success: true,
      message: payload.message ?? "Success",
      data: record ? mapSurat(record) : undefined,
    };
  }

  async function createKeteranganAlumni(data: Record<string, any>): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    const res = await safeFetch("/surat-kesiswaan/keterangan-alumni", {
      method: "POST",
      data,
    });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const record = payload.data as SuratKesiswaanApiRecord | undefined;
    return {
      success: true,
      message: payload.message ?? "Success",
      data: record ? mapSurat(record) : undefined,
    };
  }

  async function update(id: string, data: SuratKesiswaanUpdate): Promise<{ success: boolean; data?: SuratKesiswaan; message: string }> {
    const res = await safeFetch(`/surat-kesiswaan/${id}`, {
      method: "PUT",
      data,
    });

    if (!res.success || !res.payload) {
      return { success: false, message: res.message };
    }

    const payload = res.payload;
    const record = payload.data as SuratKesiswaanApiRecord | undefined;
    return {
      success: true,
      message: payload.message ?? "Success",
      data: record ? mapSurat(record) : undefined,
    };
  }

  async function remove(id: string): Promise<{ success: boolean; message: string }> {
    const res = await safeFetch(`/surat-kesiswaan/${id}`, { method: "DELETE" });
    return { success: res.success, message: res.message };
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
