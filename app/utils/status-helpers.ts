/**
 * Status configuration and helpers
 */

/**
 * Status configuration mapping
 */
export const STATUS_CONFIG = {
  siswa: {
    aktif: { color: 'success', label: 'Aktif', icon: 'lucide:user-check' },
    lulus: { color: 'primary', label: 'Lulus', icon: 'lucide:graduation-cap' },
    pindah: { color: 'warning', label: 'Pindah', icon: 'lucide:arrow-right-circle' },
    dikeluarkan: { color: 'error', label: 'Dikeluarkan', icon: 'lucide:user-x' },
  },
  penempatan: {
    aktif: { color: 'success', label: 'PKL Aktif', icon: 'lucide:check-circle' },
    selesai: { color: 'primary', label: 'PKL Selesai', icon: 'lucide:flag' },
    batal: { color: 'error', label: 'PKL Batal', icon: 'lucide:x-circle' },
    // Student placement status
    belum_pkl: { color: 'warning', label: 'Belum PKL', icon: 'lucide:user-plus' },
    akan_pkl: { color: 'info', label: 'Akan PKL', icon: 'lucide:clock' },
    expired: { color: 'neutral', label: 'Expired', icon: 'lucide:alert-triangle' },
  },
  pengajuan: {
    menunggu: { color: 'warning', label: 'Menunggu', icon: 'lucide:clock' },
    disetujui: { color: 'success', label: 'Disetujui', icon: 'lucide:check-circle' },
    ditolak: { color: 'error', label: 'Ditolak', icon: 'lucide:x-circle' },
  },
  user: {
    aktif: { color: 'success', label: 'Aktif', icon: 'lucide:user-check' },
    nonaktif: { color: 'neutral', label: 'Nonaktif', icon: 'lucide:user-x' },
  },
  kerjasama: {
    aktif: { color: 'success', label: 'Aktif', icon: 'lucide:check-circle' },
    nonaktif: { color: 'neutral', label: 'Nonaktif', icon: 'lucide:x-circle' },
  },
} as const

export type StatusType = keyof typeof STATUS_CONFIG
export type StatusValue = 'success' | 'primary' | 'error' | 'warning' | 'neutral' | 'info'

/**
 * Get status color
 */
export function getStatusColor(
  status: string,
  type: StatusType = 'penempatan'
): StatusValue {
  const config = STATUS_CONFIG[type]
  return config[status as keyof typeof config]?.color || 'neutral'
}

/**
 * Get status label
 */
export function getStatusLabel(
  status: string,
  type: StatusType = 'penempatan'
): string {
  const config = STATUS_CONFIG[type]
  return config[status as keyof typeof config]?.label || status
}

/**
 * Get status icon
 */
export function getStatusIcon(
  status: string,
  type: StatusType = 'penempatan'
): string {
  const config = STATUS_CONFIG[type]
  return config[status as keyof typeof config]?.icon || 'lucide:help-circle'
}

/**
 * Get full status config
 */
export function getStatusConfig(
  status: string,
  type: StatusType = 'penempatan'
) {
  const config = STATUS_CONFIG[type]
  return config[status as keyof typeof config] || {
    color: 'neutral',
    label: status,
    icon: 'lucide:help-circle',
  }
}

/**
 * Status options for select/filter
 */
export const STATUS_OPTIONS: Record<string, { label: string; value: string }[]> = {
  siswa: [
    { label: 'Semua Status', value: 'all' },
    { label: 'Aktif', value: 'aktif' },
    { label: 'Lulus', value: 'lulus' },
    { label: 'Pindah', value: 'pindah' },
    { label: 'Dikeluarkan', value: 'dikeluarkan' },
  ],
  penempatan: [
    { label: 'Semua Status', value: 'all' },
    { label: 'PKL Aktif', value: 'aktif' },
    { label: 'PKL Selesai', value: 'selesai' },
    { label: 'PKL Batal', value: 'batal' },
    { label: 'Belum PKL', value: 'belum_pkl' },
    { label: 'Akan PKL', value: 'akan_pkl' },
    { label: 'Expired', value: 'expired' },
  ],
  pengajuan: [
    { label: 'Semua', value: 'all' },
    { label: 'Menunggu', value: 'menunggu' },
    { label: 'Disetujui', value: 'disetujui' },
    { label: 'Ditolak', value: 'ditolak' },
  ],
}
