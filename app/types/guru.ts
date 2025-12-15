export interface GuruProfile {
  nama: string
  inisial: string
  role: string
}

export interface DashboardSummary {
  jumlahSiswaAktif: number
  jumlahPenempatan: number
  rataRataKehadiran: number
  logbookPending: number
  absensiPending: number
}

export type StatusPersetujuan = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'
export type StatusAbsensi = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA'
export type StatusVerifikasi = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK'

export interface LogbookDashboardRow {
  idLogbook: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  tanggal: string
  judul: string
  status: StatusPersetujuan
}

export interface AbsensiDashboardRow {
  idAbsensi: number
  namaSiswa: string
  kelas: string
  perusahaan: string
  tanggal: string
  jamMasuk: string
  jamKeluar: string
  statusAbsensi: StatusAbsensi
  statusGuru: StatusVerifikasi
  isBermasalah: boolean
}