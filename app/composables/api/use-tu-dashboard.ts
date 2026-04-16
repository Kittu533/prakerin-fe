/**
 * Tata Usaha Dashboard API Composable
 * Endpoints for TU dashboard stats, calendar events
 *
 * API Endpoints used:
 * - GET /api/tu-dashboard/stats - Dashboard statistics
 * - GET /api/tu-dashboard/calendar - Calendar events
 */
import { apiFetch } from "~/composables/api-fetch";

export interface TUStatistik {
  surat_masuk_hari_ini: number;
  surat_keluar_hari_ini: number;
  disposisi_belum_selesai: number;
  surat_kesiswaan_bulan_ini: number;
}

export interface TUSuratMasukTerbaru {
  id: number;
  nomor_agenda: string;
  nomor_surat: string;
  tanggal_surat: string;
  asal_surat: string;
  perihal: string;
  status: string;
}

export interface TUDisposisiMendatang {
  id: number;
  nomor_surat: string;
  perihal: string;
  batas_waktu: string;
  prioritas: string;
  status: string;
}

export interface TUDashboardStats {
  statistik: TUStatistik;
  surat_masuk_terbaru: TUSuratMasukTerbaru[];
  disposisi_mendatang: TUDisposisiMendatang[];
}

export interface TUCakupanEvent {
  date: string;
  type: string;
  title: string;
  status?: string;
}

async function safeFetch<T>(
  service: string,
  endpoint: string,
  options: any = {},
  withToken: boolean = true,
  fallbackData?: T,
): Promise<{ success: boolean; data?: T; message: string }> {
  try {
    const response = await apiFetch<any>(service, endpoint, options, withToken);

    if (response.status >= 200 && response.status < 300) {
      const responseData = response.data;
      if (responseData && typeof responseData === "object") {
        return {
          success: true,
          data: responseData.response ?? responseData.data ?? fallbackData,
          message: responseData.message ?? "Success",
        };
      }
      return {
        success: true,
        data: fallbackData,
        message: "Success",
      };
    } else {
      console.warn(
        `[SafeFetch] Non-2xx status: ${response.status} for ${service} → ${endpoint}`,
      );
      return {
        success: false,
        data: fallbackData,
        message:
          response.data?.message ??
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

export function useTUDashboard() {
  async function getStats(): Promise<{
    success: boolean;
    data?: TUDashboardStats;
    message: string;
  }> {
    return safeFetch<TUDashboardStats>("TataUsahaService", "/dashboard/stats", {
      method: "GET",
    });
  }

  async function getCalendarEvents(
    month?: number,
    year?: number,
  ): Promise<{
    success: boolean;
    data?: TUCakupanEvent[];
    message: string;
  }> {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/dashboard/calendar?${queryString}`
      : "/dashboard/calendar";

    return safeFetch<TUCakupanEvent[]>("TataUsahaService", endpoint, {
      method: "GET",
    });
  }

  return {
    getStats,
    getCalendarEvents,
  };
}
