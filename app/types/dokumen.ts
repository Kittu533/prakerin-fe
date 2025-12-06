export type JenisFile =
  | 'SURAT_PERMOHONAN'
  | 'SURAT_BALASAN'
  | 'SURAT_PENGANTAR'
  | 'LAPORAN_AKHIR'
  | 'DOKUMENTASI'
  | 'SERTIFIKAT'
  | 'LAINNYA'

export interface DokumenGuruRow {
  idFile: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  jenis: JenisFile
  namaFile: string
  tanggalUpload: string
  keterangan?: string
  ukuranFile?: string
  statusVerifikasi?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface DokumenFilterState {
  siswa: string
  perusahaan: string
  jenis: 'ALL' | JenisFile
  statusVerifikasi: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface JenisFileOption {
  label: string
  value: 'ALL' | JenisFile
  icon?: string
}

export interface StatusVerifikasiOption {
  label: string
  value: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  color: string
  icon: string
}