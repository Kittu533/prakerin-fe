export type StatusLaporan = "DRAFT" | "REVIEW" | "FINAL";

export interface LaporanRow {
  idLaporan: number;
  idPenempatan: number;
  namaSiswa: string;
  kelas: string;
  perusahaan: string;
  statusLaporan: StatusLaporan;
  nilaiAkhir: number | null;
  grade: string | null;
  persentaseKehadiran: number;
  totalHariKerja: number;
  totalKehadiran: number;
}

export interface StatusOption {
  label: string;
  value: string;
  color: string;
  icon: string;
}