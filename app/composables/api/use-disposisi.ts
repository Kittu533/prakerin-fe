import { apiFetch } from "~/composables/api-fetch";

export type DisposisiStatus =
  | "baru"
  | "sedang_diproses"
  | "selesai"
  | "dibatalkan";

export type DisposisiPrioritas =
  | "normal"
  | "mendesak"
  | "sangat_mendesak";

export type DisposisiInstruksi =
  | "untuk_diketahui"
  | "ditindaklanjuti"
  | "dibalas"
  | "dikoordinasikan"
  | "diarsipkan"
  | "lainnya";

export interface SelectOption {
  value: string;
  label: string;
}

export interface DisposisiSuratMasukOption {
  id: string;
  nomor_agenda: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  asal_surat: string;
  perihal: string;
  sifat_surat: string;
  status: string;
  label: string;
  description?: string;
}

export interface Disposisi {
  id: string;
  surat_masuk_id: string;
  tanggal_disposisi: string;
  penerima_disposisi_ids: string[];
  penerima_disposisi: string[];
  penerima_disposisi_text: string;
  instruksi: DisposisiInstruksi[];
  instruksi_labels: string[];
  instruksi_tambahan?: string | null;
  batas_waktu?: string | null;
  prioritas: DisposisiPrioritas;
  prioritas_label: string;
  status: DisposisiStatus;
  status_label: string;
  created_at?: string;
  updated_at?: string;
  surat_masuk?: {
    id?: string;
    nomor_agenda?: string;
    nomor_surat: string;
    asal_surat: string;
    perihal: string;
    tanggal_surat?: string;
  };
}

export interface DisposisiCreate {
  surat_masuk_id: string;
  tanggal_disposisi: string;
  penerima_disposisi_ids: string[];
  penerima_disposisi?: string[];
  instruksi: DisposisiInstruksi[];
  instruksi_tambahan?: string;
  batas_waktu?: string;
  prioritas: DisposisiPrioritas;
}

export interface DisposisiUpdate {
  tanggal_disposisi?: string;
  penerima_disposisi_ids?: string[];
  penerima_disposisi?: string[];
  instruksi?: DisposisiInstruksi[];
  instruksi_tambahan?: string;
  batas_waktu?: string;
  prioritas?: DisposisiPrioritas;
  status?: DisposisiStatus;
}

export interface DisposisiListResponse {
  data: Disposisi[];
  page: number;
  limit: number;
  total: number;
}

export interface DisposisiFormMeta {
  available_surat_masuk: DisposisiSuratMasukOption[];
  prioritas_options: SelectOption[];
  status_options: SelectOption[];
  instruksi_options: SelectOption[];
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  message: string;
}

const INSTRUKSI_LABELS: Record<string, string> = {
  untuk_diketahui: "Untuk Diketahui",
  ditindaklanjuti: "Ditindaklanjuti",
  dibalas: "Dibalas",
  dikoordinasikan: "Dikoordinasikan",
  diarsipkan: "Diarsipkan",
  lainnya: "Lainnya",
};

const PRIORITAS_LABELS: Record<string, string> = {
  normal: "Normal",
  mendesak: "Mendesak",
  sangat_mendesak: "Sangat Mendesak",
};

const STATUS_LABELS: Record<string, string> = {
  baru: "Baru",
  sedang_diproses: "Sedang Diproses",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

function parseArrayLike(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const raw = value.trim();
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    return raw
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function mapDisposisi(raw: any): Disposisi {
  const penerimaDisposisiIds = parseArrayLike(raw?.penerima_disposisi_ids);
  const penerimaDisposisi = parseArrayLike(raw?.penerima_disposisi);
  const instruksi = parseArrayLike(raw?.instruksi) as DisposisiInstruksi[];

  return {
    ...raw,
    penerima_disposisi_ids: penerimaDisposisiIds,
    penerima_disposisi: penerimaDisposisi,
    penerima_disposisi_text:
      raw?.penerima_disposisi_text || penerimaDisposisi.join(", "),
    instruksi,
    instruksi_labels:
      Array.isArray(raw?.instruksi_labels) && raw.instruksi_labels.length > 0
        ? raw.instruksi_labels
        : instruksi.map((item) => INSTRUKSI_LABELS[item] ?? item),
    prioritas_label:
      raw?.prioritas_label ||
      PRIORITAS_LABELS[String(raw?.prioritas)] ||
      raw?.prioritas ||
      "-",
    status_label:
      raw?.status_label ||
      STATUS_LABELS[String(raw?.status)] ||
      raw?.status ||
      "-",
  };
}

function mapFormMeta(raw: any): DisposisiFormMeta {
  return {
    available_surat_masuk: Array.isArray(raw?.available_surat_masuk)
      ? raw.available_surat_masuk
      : [],
    prioritas_options: Array.isArray(raw?.prioritas_options)
      ? raw.prioritas_options
      : Object.entries(PRIORITAS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
    status_options: Array.isArray(raw?.status_options)
      ? raw.status_options
      : Object.entries(STATUS_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
    instruksi_options: Array.isArray(raw?.instruksi_options)
      ? raw.instruksi_options
      : Object.entries(INSTRUKSI_LABELS).map(([value, label]) => ({
          value,
          label,
        })),
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
    const responseData = error?.response?.data;
    const errorMap = responseData?.errors as Record<string, string[]> | undefined;
    const validationMessage = errorMap
      ? Object.entries(errorMap)
          .flatMap(([field, messages]) =>
            messages.map((message) => `${field.replace(/^body\./, "")}: ${message}`),
          )
          .join(" | ")
      : undefined;

    return {
      success: false,
      message:
        validationMessage ||
        responseData?.message ||
        error?.message ||
        "Network error",
    };
  }
}

export function useDisposisi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    surat_masuk_id?: string;
    status?: string;
    prioritas?: string;
  }): Promise<ApiResult<DisposisiListResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.surat_masuk_id) {
      searchParams.append("surat_masuk_id", params.surat_masuk_id);
    }
    if (params?.status) searchParams.append("status", params.status);
    if (params?.prioritas) searchParams.append("prioritas", params.prioritas);
    searchParams.append("_ts", Date.now().toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/disposisi?${queryString}` : "/disposisi";
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
        data: rows.map(mapDisposisi),
        page: Number(payload?.page ?? params?.page ?? 1),
        limit: Number(payload?.limit ?? params?.limit ?? 10),
        total: Number(payload?.total ?? rows.length),
      },
    };
  }

  async function getById(id: string): Promise<ApiResult<Disposisi>> {
    const result = await safeFetchData<any>(
      "TataUsahaService",
      `/disposisi/${id}`,
      { method: "GET" },
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
      data: mapDisposisi(result.data),
    };
  }

  async function getFormMeta(): Promise<ApiResult<DisposisiFormMeta>> {
    const result = await safeFetchData<any>(
      "TataUsahaService",
      "/disposisi/form-meta",
      { method: "GET" },
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
      data: mapFormMeta(result.data),
    };
  }

  async function create(data: DisposisiCreate): Promise<ApiResult<Disposisi>> {
    const result = await safeFetchData<any>("TataUsahaService", "/disposisi", {
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
      data: mapDisposisi(result.data),
    };
  }

  async function update(
    id: string,
    data: DisposisiUpdate,
  ): Promise<ApiResult<Disposisi>> {
    const result = await safeFetchData<any>(
      "TataUsahaService",
      `/disposisi/${id}`,
      {
        method: "PUT",
        data,
      },
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
      data: mapDisposisi(result.data),
    };
  }

  async function updateStatus(
    id: string,
    status: DisposisiStatus,
  ): Promise<ApiResult<Disposisi>> {
    const result = await safeFetchData<any>(
      "TataUsahaService",
      `/disposisi/${id}/status`,
      {
        method: "PATCH",
        data: { status },
      },
    );

    if (!result.success || !result.data) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
      data: mapDisposisi(result.data),
    };
  }

  async function remove(id: string): Promise<ApiResult<null>> {
    return safeFetchData<null>("TataUsahaService", `/disposisi/${id}`, {
      method: "DELETE",
    });
  }

  return {
    getAll,
    getById,
    getFormMeta,
    create,
    update,
    updateStatus,
    remove,
  };
}
