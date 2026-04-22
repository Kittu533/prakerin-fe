import { apiFetch } from "~/composables/api-fetch";
import type { SuratKeluarStatus } from "~/composables/api/use-surat-keluar";

export type JurnalGuruTaskType = "penerjunan" | "monitoring" | "penarikan";
export type JurnalGuruStageState = "empty" | SuratKeluarStatus;

export interface JurnalGuruOption {
  id_guru: string;
  nama_guru: string;
  nip?: string;
  jabatan?: string;
  pangkat?: string;
  golongan?: string;
  is_penandatangan?: boolean;
  status_aktif?: boolean;
}

export interface JurnalGuruParticipant {
  id_penempatan: string;
  siswa_id: string;
  nama_siswa: string;
  kelas: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
}

export interface JurnalGuruStageSummary {
  exists: boolean;
  state: JurnalGuruStageState;
  surat_id?: string;
  nomor_surat?: string;
  guru_pelaksana_nama?: string;
  tanggal_surat?: string;
}

export interface JurnalGuruTarget {
  target_key: string;
  batch_label: string;
  perusahaan_id: string;
  perusahaan_nama: string;
  alamat: string;
  periode_mulai: string;
  periode_selesai: string;
  siswa_count: number;
  penempatan_ids: string[];
  siswa_summary: string[];
  siswa_details: JurnalGuruParticipant[];
  latest_status: string;
  stage_statuses: Record<JurnalGuruTaskType, JurnalGuruStageSummary>;
}

export interface JurnalGuruLetterMeta {
  task_type: JurnalGuruTaskType;
  guru_pelaksana_id: string;
  guru_pelaksana_nama: string;
  guru_pelaksana_nip?: string;
  guru_pelaksana_jabatan?: string;
  guru_pelaksana_pangkat?: string;
  guru_pelaksana_golongan?: string;
  perusahaan_id: string;
  perusahaan_nama: string;
  perusahaan_alamat?: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  penempatan_ids: string[];
  batch_key?: string;
  batch_label?: string;
  batch_mulai?: string;
  batch_selesai?: string;
}

export interface JurnalGuruLetter {
  surat: {
    id: string;
    nomor_surat: string;
    tanggal_surat: string;
    ditujukan_kepada: string;
    alamat_tujuan?: string;
    perihal: string;
    isi_lampiran?: string;
    file_surat?: string;
    file_surat_docx?: string;
    file_surat_pdf?: string;
    file_surat_download_url?: string;
    file_surat_docx_download_url?: string;
    file_surat_pdf_download_url?: string;
    penandatangan: string;
    penandatangan_guru?: {
      id_guru: string;
      nama_guru: string;
      nip: string;
    };
    status: SuratKeluarStatus;
    created_at: string;
    updated_at: string;
  };
  meta: JurnalGuruLetterMeta;
  batch_key: string;
  batch_label: string;
  batch_mulai: string;
  batch_selesai: string;
  participants: JurnalGuruParticipant[];
}

export interface JurnalGuruOverview {
  stats: {
    total_target: number;
    total_surat: number;
    total_draft: number;
    total_guru_aktif: number;
  };
  targets: JurnalGuruTarget[];
  letters: JurnalGuruLetter[];
  options: {
    guru_pelaksana: JurnalGuruOption[];
    penandatangan: JurnalGuruOption[];
  };
}

export function useJurnalGuruApi() {
  async function getOverview() {
    const { data } = await apiFetch<{
      success: boolean;
      message: string;
      data: JurnalGuruOverview;
    }>("PlacementService", "/jurnal-guru/overview", { method: "GET" }, true);
    return data;
  }

  async function createTaskLetter(payload: {
    task_type: JurnalGuruTaskType;
    guru_pelaksana_id: string;
    penandatangan_id: string;
    perusahaan_id: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    penempatan_ids: string[];
  }) {
    const { data } = await apiFetch<{
      success: boolean;
      message: string;
      data: JurnalGuruLetter;
    }>("PlacementService", "/jurnal-guru/surat-tugas", {
      method: "POST",
      data: payload,
    }, true);
    return data;
  }

  async function reviseTaskLetter(id: string, payload: {
    guru_pelaksana_id: string;
    penandatangan_id: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
  }) {
    const { data } = await apiFetch<{
      success: boolean;
      message: string;
      data: JurnalGuruLetter;
    }>("PlacementService", `/jurnal-guru/surat-tugas/${id}/revisi`, {
      method: "PUT",
      data: payload,
    }, true);
    return data;
  }

  async function updateTaskLetterStatus(id: string, status: SuratKeluarStatus) {
    const { data } = await apiFetch<{
      success: boolean;
      message: string;
      data: JurnalGuruLetter["surat"];
    }>("PlacementService", `/jurnal-guru/surat-tugas/${id}/status`, {
      method: "PATCH",
      data: { status },
    }, true);
    return data;
  }

  return {
    getOverview,
    createTaskLetter,
    reviseTaskLetter,
    updateTaskLetterStatus,
  };
}
