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
  kabupaten_kota?: string;
  provinsi?: string;
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
  meta: {
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

export interface PerusahaanDistributionItem {
  label: string;
  count: number;
}

export interface PerusahaanStats {
  total: number;
  bidang: PerusahaanDistributionItem[];
  provinsi: PerusahaanDistributionItem[];
  kota: PerusahaanDistributionItem[];
}

export interface Mou {
  id_mou: string;
  perusahaan_id: string;
  nomor_mou: string;
  perihal: string;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  kompetensi_keahlian?: string | null;
  pic_nama?: string | null;
  pic_telepon?: string | null;
  link_maps?: string | null;
  link_dokumen?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: "AKTIF" | "EXPIRED";
  perusahaan?: Pick<Perusahaan, "id_perusahaan" | "nama_perusahaan" | "alamat" | "bidang_usaha">;
}

export interface MouStats {
  total: number;
  aktif: number;
  expired: number;
  bulan_ini: number;
  tahun_ini: number;
  bidang: PerusahaanDistributionItem[];
}

export interface MouUploadResult {
  path: string;
  url: string;
  original_name: string;
  size: number;
}

// =============================================
// PERUSAHAAN API
// =============================================
export function usePerusahaanApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    nama?: string;
    provinsi?: string;
    kota?: string;
    alamat?: string;
    bidang_usaha?: string;
    status_kerjasama?: boolean;
    mou_aktif?: boolean;
    arsip?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.nama) query.append("nama", params.nama);
    if (params?.provinsi) query.append("provinsi", params.provinsi);
    if (params?.kota) query.append("kota", params.kota);
    if (params?.alamat) query.append("alamat", params.alamat);
    if (params?.bidang_usaha) query.append("bidang_usaha", params.bidang_usaha);
    if (typeof params?.status_kerjasama === "boolean") {
      query.append("status_kerjasama", String(params.status_kerjasama));
    }
    if (typeof params?.mou_aktif === "boolean") {
      query.append("mou_aktif", String(params.mou_aktif));
    }
    if (typeof params?.arsip === "boolean") {
      query.append("arsip", String(params.arsip));
    }

    const { data } = await apiFetch<PaginatedResponse<Perusahaan>>(
      "PartnerService",
      `/perusahaan?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getStats(params?: {
    search?: string;
    nama?: string;
    provinsi?: string;
    kota?: string;
    alamat?: string;
    bidang_usaha?: string;
    status_kerjasama?: boolean;
    mou_aktif?: boolean;
    arsip?: boolean;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.nama) query.append("nama", params.nama);
    if (params?.provinsi) query.append("provinsi", params.provinsi);
    if (params?.kota) query.append("kota", params.kota);
    if (params?.alamat) query.append("alamat", params.alamat);
    if (params?.bidang_usaha) query.append("bidang_usaha", params.bidang_usaha);
    if (typeof params?.status_kerjasama === "boolean") {
      query.append("status_kerjasama", String(params.status_kerjasama));
    }
    if (typeof params?.mou_aktif === "boolean") {
      query.append("mou_aktif", String(params.mou_aktif));
    }
    if (typeof params?.arsip === "boolean") {
      query.append("arsip", String(params.arsip));
    }

    const { data } = await apiFetch<SingleResponse<PerusahaanStats>>(
      "PartnerService",
      `/perusahaan/stats?${query.toString()}`,
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
    kabupaten_kota?: string;
    provinsi?: string;
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
      kabupaten_kota: string;
      provinsi: string;
      no_hp: string;
      email: string;
      bidang_usaha: string;
      kapasitas_siswa: number;
      status_kerjasama: boolean;
      tahun_mulai_kerjasama: number;
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

  async function restore(id: string) {
    const { data } = await apiFetch<SingleResponse<Perusahaan>>(
      "PartnerService",
      `/perusahaan/${id}/restore`,
      { method: "PATCH" },
      true,
    );
    return data;
  }

  return { getAll, getStats, getById, create, update, remove, restore };
}

export function useMouApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    nama?: string;
    alamat?: string;
    bidang?: string;
    masa_berlaku?: string;
    perusahaan_id?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.nama) query.append("nama", params.nama);
    if (params?.alamat) query.append("alamat", params.alamat);
    if (params?.bidang) query.append("bidang", params.bidang);
    if (params?.masa_berlaku) query.append("masa_berlaku", params.masa_berlaku);
    if (params?.perusahaan_id) query.append("perusahaan_id", params.perusahaan_id);

    const { data } = await apiFetch<PaginatedResponse<Mou>>(
      "PartnerService",
      `/mou?${query.toString()}`,
      { method: "GET" },
      true,
    );

    return data;
  }

  async function getStats(params?: {
    nama?: string;
    alamat?: string;
    bidang?: string;
    masa_berlaku?: string;
    perusahaan_id?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.nama) query.append("nama", params.nama);
    if (params?.alamat) query.append("alamat", params.alamat);
    if (params?.bidang) query.append("bidang", params.bidang);
    if (params?.masa_berlaku) query.append("masa_berlaku", params.masa_berlaku);
    if (params?.perusahaan_id) query.append("perusahaan_id", params.perusahaan_id);

    const { data } = await apiFetch<SingleResponse<MouStats>>(
      "PartnerService",
      `/mou/stats?${query.toString()}`,
      { method: "GET" },
      true,
    );

    return data;
  }

  async function create(payload: {
    perusahaan_id: string;
    nomor_mou: string;
    perihal: string;
    tanggal_mulai: string;
    tanggal_berakhir: string;
    kompetensi_keahlian?: string;
    pic_nama?: string;
    pic_telepon?: string;
    link_maps?: string;
    link_dokumen?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Mou>>(
      "PartnerService",
      "/mou",
      { method: "POST", data: payload },
      true,
    );

    return data;
  }

  async function uploadDokumen(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiFetch<SingleResponse<MouUploadResult>>(
      "PartnerService",
      "/mou/upload-dokumen",
      {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      true,
    );

    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      perusahaan_id: string;
      nomor_mou: string;
      perihal: string;
      tanggal_mulai: string;
      tanggal_berakhir: string;
      kompetensi_keahlian: string;
      pic_nama: string;
      pic_telepon: string;
      link_maps: string;
      link_dokumen: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Mou>>(
      "PartnerService",
      `/mou/${id}`,
      { method: "PUT", data: payload },
      true,
    );

    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<Mou>>(
      "PartnerService",
      `/mou/${id}`,
      { method: "DELETE" },
      true,
    );

    return data;
  }

  return { getAll, getStats, create, update, remove, uploadDokumen };
}
