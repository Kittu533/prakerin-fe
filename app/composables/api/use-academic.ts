/**
 * Academic/Core Service API Composable
 * Handles: Siswa, Guru, Kelas, Jurusan, Tahun Ajaran
 *
 * API Endpoints (via Gateway):
 * - /api/siswa
 * - /api/guru
 * - /api/kelas
 * - /api/jurusan
 * - /api/tahun-ajaran
 */
import { apiFetch } from "~/composables/api-fetch";

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
      return (
        response.data || {
          success: true,
          data: fallbackData,
          message: "Success",
        }
      );
    } else {
      console.warn(
        `[SafeFetch] Non-2xx status: ${response.status} for ${service} → ${endpoint}`,
      );
      return {
        success: false,
        data: fallbackData,
        message:
          response.data?.message ||
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
export interface Siswa {
  id_siswa: string;
  nis: string;
  nama_siswa: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
  email?: string;
  foto?: string;
  id_kelas: string;
  kelas?: {
    id_kelas: string;
    nama_kelas: string;
    kode_tingkat: string;
    jurusan?: { nama_jurusan: string };
  };
  created_at?: string;
  updated_at?: string;
  generated_password?: string;
}

export interface Guru {
  id_guru: string;
  nip: string;
  nama_guru: string;
  email?: string;
  no_hp?: string;
  jabatan?: string;
  kelompok?: string;
  pangkat?: string;
  golongan?: string;
  status_aktif: boolean;
  created_at?: string;
  updated_at?: string;
  generated_password?: string;
}

export interface Kelas {
  id_kelas: string;
  nama_kelas: string;
  kode_tingkat: string;
  id_jurusan: string;
  id_guru?: string;
  id_tahun_ajaran: string;
  jurusan?: { id_jurusan: string; nama_jurusan: string };
  guru?: { id_guru: string; nama_guru: string };
  tahun_ajaran?: { id_tahun_ajaran: string; nama_tahun_ajaran: string };
  created_at?: string;
  updated_at?: string;
}

export interface Jurusan {
  id_jurusan: string;
  kode_jurusan: string;
  nama_jurusan: string;
  created_at?: string;
  updated_at?: string;
}

export interface TahunAjaran {
  id_tahun_ajaran: string;
  nama_tahun_ajaran: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status_aktif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
// SISWA API
// =============================================
export function useSiswaApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_kelas?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_kelas) query.append("id_kelas", String(params.id_kelas));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<Siswa>>(
      "CoreService",
      `/siswa?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getPklStudents(params?: {
    page?: number;
    limit?: number;
    id_kelas?: string;
    id_tahun_ajaran?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_kelas) query.append("id_kelas", String(params.id_kelas));
    if (params?.id_tahun_ajaran) query.append("id_tahun_ajaran", String(params.id_tahun_ajaran));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<any>>(
      "CoreService",
      `/siswa/pkl?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      "CoreService",
      `/siswa/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    nis: string;
    nama_siswa: string;
    jenis_kelamin?: string;
    tanggal_lahir?: string;
    alamat?: string;
    no_hp?: string;
    email?: string;
    id_kelas: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      "CoreService",
      "/siswa",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nis: string;
      nama_siswa: string;
      jenis_kelamin: string;
      tanggal_lahir: string;
      alamat: string;
      no_hp: string;
      email: string;
      id_kelas: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Siswa>>(
      "CoreService",
      `/siswa/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "CoreService",
      `/siswa/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  async function resetPassword(id: string) {
    const { data } = await apiFetch<
      SingleResponse<{ generated_password: string; newPassword?: string }>
    >("CoreService", `/siswa/${id}/reset-password`, { method: "POST" }, true);
    return data;
  }

  async function importExcel(file: File, mode: "append" | "replace") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx').then(m => m.default || m);
          
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet);

          // Transform rows to expected format using flexible mapping
          const formattedData = rows.map((row: any) => {
            const findValue = (possibleKeys: string[]) => {
              const key = Object.keys(row).find(k => 
                possibleKeys.some(pk => k.toLowerCase().trim().replace(/_/g, ' ') === pk.toLowerCase().trim().replace(/_/g, ' '))
              );
              return key ? String(row[key]).trim() : '';
            };

            return {
              nis: findValue(['nis', 'n_i_s']),
              nisn: findValue(['nisn', 'n_i_s_n']),
              nama_siswa: findValue(['nama lengkap', 'nama', 'nama_siswa']),
              jenis_kelamin: findValue(['gender', 'jenis kelamin', 'jk', 'l/p']),
              tempat_lahir: findValue(['tempat lahir', 'tempat_lahir']),
              tanggal_lahir: findValue(['tanggal lahir', 'tanggal_lahir']),
              alamat: findValue(['alamat']),
              no_hp: findValue(['whats app siswa', 'no hp', 'whatsapp', 'no_hp', 'telepon']),
              nama_kelas: findValue(['kelas']),
              tingkat: findValue(['tingkat']),
              nama_jurusan: findValue(['program keahlian', 'program_keahlian', 'jurusan']),
            };
          }).filter((r: any) => r.nis && r.nama_siswa && r.nama_kelas);

          if (formattedData.length === 0) {
            resolve({
              success: false,
              message: 'Tidak ada data valid dalam file. Pastikan ada kolom NIS, NAMA LENGKAP, dan KELAS.',
            });
            return;
          }

          const response = await safeFetch<{
            success: number;
            failed: number;
            errors: string[];
            importedSiswa: any[];
          }>(
            "CoreService",
            "/siswa/import",
            {
              method: "POST",
              data: { data: formattedData, mode },
            },
            true,
          );

          resolve(response);
        } catch (err) {
          console.error("[SiswaAPI] Import error:", err);
          reject({
            success: false,
            message: err instanceof Error ? err.message : 'Gagal mengimport data',
          });
        }
      };

      reader.onerror = () => {
        reject({
          success: false,
          message: 'Gagal membaca file',
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  async function downloadTemplate() {
    try {
      const XLSX = await import('xlsx').then(m => m.default || m);
      
      const templateData = [
        {
          "NO": 1,
          "TINGKAT": "XI",
          "PROGRAM_KEAHLIAN": "Teknik Komputer dan Jaringan",
          "KELAS": "XI TKJ 1",
          "NIS": "2223001",
          "NISN": "0071234567",
          "NAMA LENGKAP": "Asep Sunandar",
          "GENDER": "L",
          "TEMPAT LAHIR": "Bandung",
          "TANGGAL LAHIR": "2007-05-20",
          "ALAMAT": "Jl. Merdeka No. 123",
          "WHATS APP SISWA": "081234567890"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template Siswa");
      
      XLSX.writeFile(workbook, "Template_Siswa.xlsx");
      return { success: true };
    } catch (err) {
      console.error("[SiswaAPI] Download template error:", err);
      return { success: false, message: "Gagal mengunduh template" };
    }
  }

  return { getAll, getPklStudents, getById, create, update, remove, resetPassword, importExcel, downloadTemplate };
}

// =============================================
// GURU API
// =============================================
export function useGuruApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<Guru>>(
      "CoreService",
      `/guru?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getMe() {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      "/guru/me",
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      `/guru/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    nip: string;
    nama_guru: string;
    email?: string;
    no_hp?: string;
    jabatan?: string;
    kelompok?: string;
    pangkat?: string;
    golongan?: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      "/guru",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nip: string;
      nama_guru: string;
      email: string;
      no_hp: string;
      jabatan: string;
      kelompok: string;
      pangkat: string;
      golongan: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      `/guru/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<Guru>>(
      "CoreService",
      `/guru/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  async function resetPassword(id: string) {
    const { data } = await apiFetch<
      SingleResponse<{ generated_password: string; newPassword?: string }>
    >("CoreService", `/guru/${id}/reset-password`, { method: "POST" }, true);
    return data;
  }

  async function syncAccounts() {
    const { data } = await apiFetch<
      SingleResponse<{
        totalGurusWithoutAccounts: number;
        processed: number;
        results: Array<{
          id_guru: string;
          nip: string;
          nama_guru: string;
          defaultPassword?: string;
          error?: string;
        }>;
      }>
    >("CoreService", "/guru/sync-accounts", { method: "POST" }, true);
    return data;
  }

  async function importExcel(file: File, mode: "append" | "replace") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          // Dynamic import of xlsx
          const XLSX = await import('xlsx').then(m => m.default || m);
          
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet);

          // Transform rows to expected format
          const formattedData = rows.map((row: any) => {
            // Find keys that contain NIP or Nama to handle various Excel headers
            const findValue = (possibleKeys: string[]) => {
              const key = Object.keys(row).find(k => 
                possibleKeys.some(pk => k.toLowerCase().trim() === pk.toLowerCase().trim())
              );
              return key ? String(row[key]).trim() : '';
            };

            const nipValue = findValue(['nip', 'n_i_p', 'nomor induk pegawai', 'nama & nip']);
            const namaValue = findValue(['nama_guru', 'nama', 'nama lengkap', 'nama & nip']);
            
            // If NIP and Nama are in the same column like "Asep - 192031"
            let finalNip = nipValue;
            let finalNama = namaValue;

            if (nipValue === namaValue && nipValue.includes(' - ')) {
              const parts = nipValue.split(' - ');
              if (parts.length >= 2) {
                // Usually Name - NIP or NIP - Name
                // Check if one part is numeric/long
                if (/^\d+$/.test(parts[1].trim())) {
                  finalNama = parts[0].trim();
                  finalNip = parts[1].trim();
                } else {
                  finalNip = parts[0].trim();
                  finalNama = parts[1].trim();
                }
              }
            }

            return {
              nip: finalNip,
              nama_guru: finalNama,
              email: findValue(['email', 'surel']) || null,
              no_hp: findValue(['no_hp', 'no hp', 'whatsapp', 'telepon', 'hp', 'no. hp']) || null,
              jabatan: findValue(['jabatan', 'jabatan / kelompok']) || null,
              pangkat: findValue(['pangkat']) || null,
              golongan: findValue(['golongan', 'gol/ruang']) || null,
            };
          }).filter((r: any) => r.nip && r.nama_guru);

          if (formattedData.length === 0) {
            resolve({
              success: false,
              message: 'Tidak ada data valid dalam file. Pastikan ada kolom NIP dan Nama_Guru.',
            });
            return;
          }

          const response = await safeFetch<{
            success: number;
            failed: number;
            errors: string[];
            importedGurus: Array<{
              nip: string;
              nama_guru: string;
              defaultPassword?: string;
            }>;
          }>(
            "CoreService",
            "/guru/import",
            {
              method: "POST",
              data: { data: formattedData },
            },
            true,
          );

          resolve(response);
        } catch (err) {
          console.error("[GuruAPI] Import error:", err);
          reject({
            success: false,
            message: err instanceof Error ? err.message : 'Gagal mengimport data',
          });
        }
      };

      reader.onerror = () => {
        reject({
          success: false,
          message: 'Gagal membaca file',
        });
      };

      reader.readAsArrayBuffer(file);
    });
  }

  async function exportGuru(ids?: string[]) {
    const query = ids && ids.length > 0 ? `?ids=${ids.join(',')}` : '';
    
    const { data } = await apiFetch<SingleResponse<any[]>>(
      "CoreService",
      `/guru/export${query}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function downloadTemplate() {
    try {
      const XLSX = await import('xlsx').then(m => m.default || m);
      
      const templateData = [
        {
          "NO": 1,
          "NAMA LENGKAP": "Hj. Ratna Dewi, A.Ma.",
          "NIP": "198501012020012001",
          "JABATAN / KELOMPOK": "Kepala Sub Bagian Tata Usaha",
          "PANGKAT": "Penata Tingkat I",
          "GOL/RUANG": "III/d",
          "WHATSAPP": "081234567890",
          "EMAIL": "ratna.dewi@sekolah.sch.id"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template Guru");
      
      XLSX.writeFile(workbook, "Template_Guru.xlsx");
      return { success: true };
    } catch (err) {
      console.error("[GuruAPI] Download template error:", err);
      return { success: false, message: "Gagal mengunduh template" };
    }
  }

  return { getAll, getMe, getById, create, update, remove, resetPassword, syncAccounts, importExcel, exportGuru, downloadTemplate };
}

// =============================================
// KELAS API
// =============================================
export function useKelasApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    id_jurusan?: string;
    id_tahun_ajaran?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.id_jurusan)
      query.append("id_jurusan", String(params.id_jurusan));
    if (params?.id_tahun_ajaran)
      query.append("id_tahun_ajaran", String(params.id_tahun_ajaran));

    const { data } = await apiFetch<PaginatedResponse<Kelas>>(
      "CoreService",
      `/kelas?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      "CoreService",
      `/kelas/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    nama_kelas: string;
    kode_tingkat: string;
    id_jurusan: string;
    id_guru?: string;
    id_tahun_ajaran: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      "CoreService",
      "/kelas",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{
      nama_kelas: string;
      kode_tingkat: string;
      id_jurusan: string;
      id_guru: string;
      id_tahun_ajaran: string;
    }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Kelas>>(
      "CoreService",
      `/kelas/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "CoreService",
      `/kelas/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}

// =============================================
// JURUSAN API
// =============================================
export function useJurusanApi() {
  async function getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);

    const { data } = await apiFetch<PaginatedResponse<Jurusan>>(
      "CoreService",
      `/jurusan?${query.toString()}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function getById(id: string) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      "CoreService",
      `/jurusan/${id}`,
      { method: "GET" },
      true,
    );
    return data;
  }

  async function create(payload: {
    kode_jurusan: string;
    nama_jurusan: string;
  }) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      "CoreService",
      "/jurusan",
      { method: "POST", data: payload },
      true,
    );
    return data;
  }

  async function update(
    id: string,
    payload: Partial<{ kode_jurusan: string; nama_jurusan: string }>,
  ) {
    const { data } = await apiFetch<SingleResponse<Jurusan>>(
      "CoreService",
      `/jurusan/${id}`,
      { method: "PUT", data: payload },
      true,
    );
    return data;
  }

  async function remove(id: string) {
    const { data } = await apiFetch<SingleResponse<null>>(
      "CoreService",
      `/jurusan/${id}`,
      { method: "DELETE" },
      true,
    );
    return data;
  }

  return { getAll, getById, create, update, remove };
}

// =============================================
// TAHUN AJARAN API
// =============================================
export function useTahunAjaranApi() {
  async function getAll(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return await safeFetch<PaginatedResponse<TahunAjaran>>(
      "CoreService",
      `/tahun-ajaran?${query.toString()}`,
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

  async function getActive() {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      "/tahun-ajaran/active",
      { method: "GET" },
      true,
      {
        id_tahun_ajaran: "1",
        nama_tahun_ajaran: "2024/2025",
        tanggal_mulai: "2024-07-01",
        tanggal_selesai: "2025-06-30",
        status_aktif: true,
      },
    );
  }

  async function getById(id: string) {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      `/tahun-ajaran/${id}`,
      { method: "GET" },
      true,
    );
  }

  async function create(payload: {
    nama_tahun_ajaran: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    status_aktif?: boolean;
  }) {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      "/tahun-ajaran",
      { method: "POST", data: payload },
      true,
    );
  }

  async function update(
    id: string,
    payload: Partial<{
      nama_tahun_ajaran: string;
      tanggal_mulai: string;
      tanggal_selesai: string;
      status_aktif: boolean;
    }>,
  ) {
    return await safeFetch<TahunAjaran>(
      "CoreService",
      `/tahun-ajaran/${id}`,
      { method: "PUT", data: payload },
      true,
    );
  }

  async function remove(id: string) {
    return await safeFetch<null>(
      "CoreService",
      `/tahun-ajaran/${id}`,
      { method: "DELETE" },
      true,
    );
  }

  return { getAll, getActive, getById, create, update, remove };
}
