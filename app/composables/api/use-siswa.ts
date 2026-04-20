/**
 * Siswa-specific API Composable
 * Specialized endpoints for siswa/student user role
 *
 * API Endpoints used:
 * - GET /api/siswa/:id - Siswa detail (ambil ID dari JWT)
 * - GET /api/penempatan - Get student's placement
 * - GET /api/absensi/penempatan/:id - Attendance by placement
 * - POST /api/absensi - Create attendance
 * - PUT /api/absensi/:id - Update attendance
 * - GET /api/logbook/penempatan/:id - Logbook by placement
 * - POST /api/logbook - Create logbook
 * - PUT /api/logbook/:id - Update logbook
 * - GET /api/penilaian/penempatan/:id - Get grades
 * - GET /api/dashboard/siswa - Siswa dashboard stats
 *
 * Note: User ID diambil langsung dari JWT payload di store, tidak perlu call /auth/me
 */
import { apiFetch } from "~/composables/api-fetch";
import { useDataStore } from "~/stores/data-store";

// =============================================
// ERROR HANDLING HELPER
// =============================================
async function safeFetch<T>(
  service: string,
  endpoint: string,
  options: any = {},
  withToken: boolean = true,
  fallbackData?: T,
): Promise<{ success: boolean; data?: T; message: string }> {
  try {
    const response = await apiFetch<any>(service, endpoint, options, withToken);

    // Check response status
    if (response.status >= 200 && response.status < 300) {
      // Backend returns { message, processId, metadata, metaData, response: T }
      // Normalize to { success, data, message }
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

// =============================================
// TYPES
// =============================================
export interface SiswaProfile {
  id_siswa: string;
  nis: string;
  nama_siswa: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
  email?: string;
  foto?: string;
  kelas?: {
    id_kelas: string;
    nama_kelas: string;
    jurusan?: { nama_jurusan: string };
    tingkat?: { kode_tingkat: string };
    guru?: { nama_guru: string };
  };
}

export interface SiswaPenempatan {
  id_penempatan: string;
  id_siswa: string;
  id_perusahaan: string;
  id_guru: string;
  id_tahun_ajaran: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status_penempatan: "aktif" | "selesai" | "dibatalkan";
  nomor_surat_pengantar?: string;
  catatan?: string;
  perusahaan?: {
    id_perusahaan: string;
    nama_perusahaan: string;
    alamat?: string;
    no_hp?: string;
    bidang_usaha?: string;
    latitude?: number;
    longitude?: number;
  };
  guru?: {
    id_guru: string;
    nama_guru: string;
    email?: string;
    no_hp?: string;
  };
  tahun_ajaran?: {
    nama_tahun_ajaran: string;
  };
}

export interface SiswaAbsensi {
  id_absensi: string;
  id_penempatan: string;
  tanggal: string;
  waktu_masuk?: string;
  waktu_keluar?: string;
  status_absensi: "hadir" | "izin" | "sakit" | "alpha";
  metode_absensi?: "manual" | "gps" | "qrcode";
  latitude_masuk?: number;
  longitude_masuk?: number;
  latitude_keluar?: number;
  longitude_keluar?: number;
  foto_absensi?: string;
  keterangan?: string;
  validasi_mentor?: boolean;
  validasi_guru?: boolean;
  created_at?: string;
}

export interface SiswaLogbook {
  id_logbook: string;
  id_penempatan: string;
  tanggal: string;
  judul_kegiatan: string;
  isi_kegiatan: string;
  foto_kegiatan?: string;
  status_persetujuan: "menunggu" | "disetujui" | "revisi";
  catatan_mentor?: string;
  catatan_guru?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiswaPenilaian {
  id_penilaian: string;
  id_penempatan: string;
  nilai_kedisiplinan?: number;
  nilai_keterampilan?: number;
  nilai_sikap?: number;
  nilai_pembimbing_perusahaan?: number;
  nilai_pembimbing_sekolah?: number;
  nilai_akhir?: number;
  catatan_penilaian?: string;
  created_at?: string;
}

export interface SiswaDashboardStats {
  totalLogbook: number;
  logbookApproved: number;
  logbookPending: number;
  logbookRevisi: number;
  totalAbsensi: number;
  absensiHadir: number;
  absensiIzin: number;
  absensiAlpha: number;
  hariPKL: number;
  totalHariPKL: number;
  progressPersen: number;
  nilaiAkhir?: number;
  penempatanStatus?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
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

// =============================================
// SISWA PROFILE API
// =============================================
export function useSiswaProfileApi() {
  // Get current logged-in siswa profile (uses /siswa/me endpoint for siswa role)
  async function getMyProfile() {
    return await safeFetch<SiswaProfile>(
      "CoreService",
      "/siswa/me",
      { method: "GET" },
      true,
    );
  }

  // Alternative profile endpoint (same as getMyProfile)
  async function getProfile() {
    return getMyProfile();
  }

  // Get siswa by ID
  async function getById(id: string) {
    return await safeFetch<SiswaProfile>(
      "CoreService",
      `/siswa/${id}`,
      { method: "GET" },
      true,
    );
  }

  // Update siswa profile
  async function updateProfile(
    id: string,
    payload: Partial<{
      alamat: string;
      no_hp: string;
      email: string;
      foto: string;
    }>,
  ) {
    return await safeFetch<SiswaProfile>(
      "CoreService",
      `/siswa/${id}`,
      { method: "PUT", data: payload },
      true,
    );
  }

  // Update current siswa profile (uses /siswa/me endpoint)
  async function updateMyProfile(
    payload: Partial<{
      alamat: string;
      no_hp: string;
      email: string;
      foto: string;
    }>,
  ) {
    return await safeFetch<SiswaProfile>(
      "CoreService",
      "/siswa/me",
      { method: "PUT", data: payload },
      true,
    );
  }

  return { getMyProfile, getProfile, getById, updateProfile, updateMyProfile };
}

// =============================================
// SISWA PENEMPATAN API
// =============================================
export function useSiswaPenempatanApi() {
  // Get my placement (current siswa's active placement)
  async function getMyPenempatan() {
    // Ambil user ID langsung dari JWT payload di store (tanpa call /auth/me)
    const dataStore = useDataStore();
    const userId = dataStore.userId;

    if (!userId) {
      console.warn("[Penempatan] No user ID found in token");
      return {
        success: false,
        data: undefined,
        message: "User tidak terautentikasi",
      };
    }

    // Query penempatan by user ID dari JWT
    const penempatanRes = await safeFetch<any>(
      "PlacementService",
      `/penempatan?siswa_id=${userId}&status_penempatan=aktif&limit=1`,
      { method: "GET" },
      true,
    );

    console.log("[Penempatan] API Response:", penempatanRes);

    if (penempatanRes.success && penempatanRes.data) {
      // penempatanRes.data is the array from response
      const dataArray = Array.isArray(penempatanRes.data)
        ? penempatanRes.data
        : [penempatanRes.data];

      if (dataArray.length > 0) {
        console.log("[Penempatan] Found penempatan:", dataArray[0]);
        return {
          success: true,
          data: dataArray[0],
          message: "Success",
        };
      }
    }

    // Tidak ada penempatan aktif
    console.warn("[Penempatan] No active penempatan found");
    return {
      success: false,
      data: undefined,
      message: "Belum ada penempatan aktif",
    };
  }

  // Get penempatan by ID
  async function getById(id: string) {
    return await safeFetch<SiswaPenempatan>(
      "PlacementService",
      `/penempatan/${id}`,
      { method: "GET" },
      true,
    );
  }

  return { getMyPenempatan, getById };
}

// =============================================
// SISWA ABSENSI API
// =============================================
export function useSiswaAbsensiApi() {
  // Get absensi list - backend will filter by user's active placement for siswa role
  async function getAll(params?: {
    page?: number;
    limit?: number;
    status_absensi?: string;
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status_absensi)
      query.append("status_absensi", params.status_absensi);
    if (params?.start_date) query.append("start_date", params.start_date);
    if (params?.end_date) query.append("end_date", params.end_date);

    return await safeFetch<SiswaAbsensi[]>(
      "PlacementService",
      `/absensi?${query.toString()}`,
      { method: "GET" },
      true,
      [],
    );
  }

  // Get absensi by ID
  async function getById(id: string | number) {
    return await safeFetch<SiswaAbsensi>(
      "PlacementService",
      `/absensi/${id}`,
      { method: "GET" },
      true,
    );
  }

  // Create attendance (check-in)
  async function create(payload: {
    id_penempatan: string;
    tanggal: string;
    waktu_masuk?: string;
    status_absensi: "hadir" | "izin" | "sakit" | "alpa";
    metode_absensi?: "manual" | "gps";
    latitude?: number;
    longitude?: number;
    keterangan?: string;
  }) {
    return await safeFetch<SiswaAbsensi>(
      "PlacementService",
      "/absensi",
      { method: "POST", data: payload },
      true,
    );
  }

  // Update attendance (check-out)
  async function update(
    id: string | number,
    payload: {
      waktu_keluar?: string;
      status_absensi?: "hadir" | "izin" | "sakit" | "alpa";
      foto_absensi?: string;
      keterangan?: string;
    },
  ) {
    return await safeFetch<SiswaAbsensi>(
      "PlacementService",
      `/absensi/${id}`,
      { method: "PUT", data: payload },
      true,
    );
  }

  async function uploadSelfie(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiFetch<any>(
      'PlacementService',
      '/absensi/upload-selfie',
      {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      true,
    );

    const ok = response.status >= 200 && response.status < 300;
    return {
      success: ok,
      data: response.data?.response ?? response.data?.data,
      message: response.data?.message ?? (ok ? 'Upload selfie berhasil' : 'Upload selfie gagal'),
    };
  }

  async function resetDailyFlowDev() {
    return await safeFetch<{ deletedLogbook: number; deletedAbsensi: number }>(
      'PlacementService',
      '/absensi/dev/reset-harian',
      { method: 'POST' },
      true,
    );
  }

  return { getAll, getById, create, update, uploadSelfie, resetDailyFlowDev };
}

// =============================================
// SISWA LOGBOOK API
// =============================================
export function useSiswaLogbookApi() {
  // Get logbook list for a penempatan
  async function getByPenempatan(
    idPenempatan: string,
    params?: {
      page?: number;
      limit?: number;
      status_persetujuan?: string;
    },
  ) {
    const query = new URLSearchParams();
    // Only add id_penempatan if provided (backend will filter by user if not provided for siswa role)
    if (idPenempatan) query.append("id_penempatan", idPenempatan);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.status_persetujuan)
      query.append("status_persetujuan", params.status_persetujuan);

    return await safeFetch<SiswaLogbook[]>(
      "PlacementService",
      `/logbook?${query.toString()}`,
      { method: "GET" },
      true,
      [],
    );
  }

  // Get logbook by ID
  async function getById(id: string) {
    return await safeFetch<SiswaLogbook>(
      "PlacementService",
      `/logbook/${id}`,
      { method: "GET" },
      true,
    );
  }

  // Create logbook
  // Note: Backend will automatically use siswa's active penempatan
  async function create(payload: {
    id_penempatan?: string;
    tanggal: string;
    judul_kegiatan: string;
    isi_kegiatan: string;
    foto_kegiatan?: string;
  }) {
    const response = await apiFetch<{ success: boolean; data: SiswaLogbook; message: string }>(
      "PlacementService",
      "/logbook",
      { method: "POST", data: payload },
      true,
    );
    return response.data;
  }

  // Update logbook (for revision)
  async function update(
    id: string,
    payload: Partial<{
      judul_kegiatan: string;
      isi_kegiatan: string;
      foto_kegiatan: string;
    }>,
  ) {
    return await safeFetch<SiswaLogbook>(
      "PlacementService",
      `/logbook/${id}`,
      { method: "PUT", data: payload },
      true,
    );
  }

  // Delete logbook (only if pending)
  async function remove(id: string) {
    return await safeFetch<null>(
      "PlacementService",
      `/logbook/${id}`,
      { method: "DELETE" },
      true,
    );
  }

  return { getByPenempatan, getById, create, update, remove };
}

// =============================================
// SISWA PENILAIAN API
// =============================================
export function useSiswaPenilaianApi() {
  // Get penilaian for a penempatan
  async function getByPenempatan(idPenempatan: string) {
    return await safeFetch<SiswaPenilaian>(
      "PlacementService",
      `/penilaian/penempatan/${idPenempatan}`,
      { method: "GET" },
      true,
    );
  }

  return { getByPenempatan };
}

// =============================================
// SISWA PENGAJUAN API
// =============================================
export interface SiswaPengajuan {
  id_pengajuan: string;
  id_siswa: string;
  id_perusahaan: string;
  id_tahun_ajaran: string;
  tanggal_pengajuan: string;
  status_pengajuan: "menunggu" | "disetujui" | "ditolak";
  catatan?: string;
  perusahaan?: {
    id_perusahaan: string;
    nama_perusahaan: string;
    alamat?: string;
    bidang_usaha?: string;
  };
  created_at?: string;
}

export function useSiswaPengajuanApi() {
  // Get my pengajuan (current siswa)
  async function getMyPengajuan() {
    return await safeFetch<SiswaPengajuan | null>(
      "PlacementService",
      "/pengajuan/me",
      { method: "GET" },
      true,
      null,
    );
  }

  // Create pengajuan
  async function create(payload: {
    id_perusahaan: string;
    id_tahun_ajaran: string;
    catatan?: string;
  }) {
    return await safeFetch<SiswaPengajuan>(
      "PlacementService",
      "/pengajuan",
      { method: "POST", data: payload },
      true,
    );
  }

  // Create mandiri pengajuan (with new company data)
  async function createMandiri(payload: {
    nama_perusahaan: string;
    alamat: string;
    bidang_usaha: string;
    kota?: string;
    nama_pic?: string;
    no_hp_pic?: string;
    id_tahun_ajaran: string;
    catatan?: string;
    dokumen_pendukung?: string;
  }) {
    return await safeFetch<SiswaPengajuan>(
      "PlacementService",
      "/pengajuan/mandiri",
      { method: "POST", data: payload },
      true,
    );
  }

  return { getMyPengajuan, create, createMandiri };
}

// =============================================
// SISWA DASHBOARD API
// =============================================
export function useSiswaDashboardApi() {
  // Get dashboard stats for siswa
  async function getStats() {
    // Ambil user ID langsung dari JWT payload (tanpa call /auth/me)
    const dataStore = useDataStore();
    const userId = dataStore.userId;

    const fallbackData = {
      totalLogbook: 0,
      logbookApproved: 0,
      logbookPending: 0,
      logbookRevisi: 0,
      totalAbsensi: 0,
      absensiHadir: 0,
      absensiIzin: 0,
      absensiAlpha: 0,
      hariPKL: 0,
      totalHariPKL: 100,
      progressPersen: 0,
      nilaiAkhir: undefined,
      penempatanStatus: "Belum ada penempatan",
    };

    if (!userId) {
      return {
        success: false,
        data: fallbackData,
        message: "User tidak terautentikasi",
      };
    }

    // Try siswa-specific dashboard endpoint with user ID
    return await safeFetch<SiswaDashboardStats>(
      "ReportingService",
      `/dashboard/siswa/${userId}/stats`,
      { method: "GET" },
      true,
      fallbackData,
    );
  }

  // Get recent logbooks
  async function getRecentLogbooks(limit: number = 5) {
    // Ambil user ID langsung dari JWT payload
    const dataStore = useDataStore();
    const userId = dataStore.userId;

    if (!userId) {
      return { success: false, data: [], message: "User tidak terautentikasi" };
    }

    try {
      // Get logbooks for current user
      const response = await safeFetch<any>(
        "PlacementService",
        `/logbook?siswa_id=${userId}&limit=${limit}&sort=created_at:desc`,
        { method: "GET" },
        true,
        [],
      );

      console.log("[RecentLogbooks] API Response:", response);

      // Handle different response formats
      let logbookArray: any[] = [];
      if (response.success) {
        if (Array.isArray(response.data)) {
          logbookArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          logbookArray = response.data.data;
        } else if (
          response.data?.response &&
          Array.isArray(response.data.response)
        ) {
          logbookArray = response.data.response;
        }
      }

      return {
        success: true,
        data: logbookArray,
        message: response.message,
      };
    } catch (error) {
      console.error("[RecentLogbooks] Error:", error);
      return { success: true, data: [], message: "No logbooks" };
    }
  }

  async function getWeeklyAttendance() {
    // Ambil user ID langsung dari JWT payload
    const dataStore = useDataStore();
    const userId = dataStore.userId;

    const defaultData = {
      labels: ["Sen", "Sel", "Rab", "Kam", "Jum"],
      data: [0, 0, 0, 0, 0],
    };

    if (!userId) {
      return {
        success: false,
        data: defaultData,
        message: "User tidak terautentikasi",
      };
    }

    try {
      // Get recent attendance data and process for chart
      const absensiResponse = await safeFetch<any>(
        "PlacementService",
        `/absensi?siswa_id=${userId}&limit=10&sort=tanggal:desc`,
        { method: "GET" },
        true,
      );

      console.log("[WeeklyAttendance] API Response:", absensiResponse);

      // Handle different response formats
      let attendanceArray: any[] = [];
      if (absensiResponse.success) {
        if (Array.isArray(absensiResponse.data)) {
          attendanceArray = absensiResponse.data;
        } else if (
          absensiResponse.data?.data &&
          Array.isArray(absensiResponse.data.data)
        ) {
          attendanceArray = absensiResponse.data.data;
        } else if (
          absensiResponse.data?.response &&
          Array.isArray(absensiResponse.data.response)
        ) {
          attendanceArray = absensiResponse.data.response;
        }
      }

      if (attendanceArray.length > 0) {
        // Process attendance data for weekly chart
        const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum"];
        const weekData = [0, 0, 0, 0, 0];

        // Calculate attendance by day of week
        attendanceArray.forEach((attendance: any) => {
          const date = new Date(attendance.tanggal);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          if (
            dayOfWeek >= 1 &&
            dayOfWeek <= 5 &&
            attendance.status_absensi === "hadir"
          ) {
            const index = dayOfWeek - 1;
            if (index >= 0 && index < weekData.length) {
              weekData[index] += 1;
            }
          }
        });

        return {
          success: true,
          data: {
            labels: weekDays,
            data: weekData,
          },
          message: "Success",
        };
      }
    } catch (error) {
      console.error("[WeeklyAttendance] Error:", error);
    }

    return {
      success: true, // Return success with default data to prevent UI error
      data: defaultData,
      message: "Menggunakan data default",
    };
  }

  return { getStats, getRecentLogbooks, getWeeklyAttendance };
}

// =============================================
// PERUSAHAAN MITRA API (for pengajuan)
// =============================================
export interface PerusahaanMitra {
  id_perusahaan: string;
  nama_perusahaan: string;
  alamat: string;
  bidang_usaha: string;
  kapasitas_siswa: number;
  siswa_diterima: number;
  status_kerjasama: boolean;
}

export function usePerusahaanMitraApi() {
  // Get available mitra companies for pengajuan
  async function getAvailable(params?: {
    page?: number;
    limit?: number;
    search?: string;
    bidang_usaha?: string;
    kota?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.bidang_usaha) query.append("bidang_usaha", params.bidang_usaha);
    if (params?.kota) query.append("kota", params.kota);
    query.append("status_kerjasama", "true");

    return await safeFetch<PaginatedResponse<PerusahaanMitra>>(
      "PartnerService",
      `/perusahaan?${query.toString()}`,
      { method: "GET" },
      true,
      {
        success: false,
        message: "Fallback data",
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      },
    );
  }

  // Get perusahaan detail
  async function getById(id: string) {
    return await safeFetch<PerusahaanMitra>(
      "PartnerService",
      `/perusahaan/${id}`,
      { method: "GET" },
      true,
    );
  }

  return { getAvailable, getById };
}
