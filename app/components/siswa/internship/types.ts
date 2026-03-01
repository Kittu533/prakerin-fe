/**
 * Shared Types for Internship Components
 */

export interface PlacementData {
  id_penempatan: string
  id_siswa: string
  id_perusahaan: string
  id_guru: string
  id_tahun_ajaran: string
  tanggal_mulai: string
  tanggal_selesai: string
  status_penempatan: 'aktif' | 'selesai' | 'dibatalkan'
  nomor_surat_pengantar?: string
  catatan?: string
  perusahaan?: {
    id_perusahaan: string
    nama_perusahaan: string
    alamat?: string
    no_hp?: string
    bidang_usaha?: string
    latitude?: number
    longitude?: number
  }
  guru?: {
    id_guru: string
    nama_guru: string
    nip?: string
    email?: string
    no_hp?: string
  }
  mentor?: {
    id_mentor: string
    nama: string
    jabatan?: string
    email?: string
    no_hp?: string
  }
  tahun_ajaran?: {
    id_tahun_ajaran: string
    nama_tahun_ajaran: string
  }
}

export interface ApplicationData {
  id_pengajuan: string
  id_siswa: string
  id_perusahaan?: string
  id_tahun_ajaran: string
  tanggal_pengajuan: string
  status_pengajuan: 'menunggu' | 'disetujui' | 'ditolak'
  catatan?: string
  is_mandiri?: boolean
  perusahaan?: {
    id_perusahaan: string
    nama_perusahaan: string
    alamat?: string
    bidang_usaha?: string
  }
}

export type PlacementState = 'placed' | 'processing' | 'rejected' | 'none'

export interface CompanyOption {
  id: number | string
  name: string
  address: string
  field: string
  quota: number
  applied: number
  isFull: boolean
}

export interface MandiriFormData {
  nama_perusahaan: string
  alamat: string
  bidang_usaha: string
  kota: string
  nama_pic: string
  no_hp_pic: string
  dokumen_pendukung: string
}

export interface TimelineStep {
  label: string
  done: boolean
  current: boolean
  class: string
}
