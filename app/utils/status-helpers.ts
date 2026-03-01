/**
 * Status configuration and helpers
 */

/**
 * Status configuration mapping
 */
export const STATUS_CONFIG = {
  penempatan: {
    aktif: { color: 'success', label: 'Aktif', icon: 'lucide:check-circle' },
    selesai: { color: 'primary', label: 'Selesai', icon: 'lucide:flag' },
    dibatalkan: { color: 'error', label: 'Dibatalkan', icon: 'lucide:x-circle' },
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
export type StatusValue = 'success' | 'primary' | 'error' | 'warning' | 'neutral'

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
  penempatan: [
    { label: 'Semua', value: 'all' },
    { label: 'Aktif', value: 'aktif' },
    { label: 'Selesai', value: 'selesai' },
    { label: 'Dibatalkan', value: 'dibatalkan' },
  ],
  pengajuan: [
    { label: 'Semua', value: 'all' },
    { label: 'Menunggu', value: 'menunggu' },
    { label: 'Disetujui', value: 'disetujui' },
    { label: 'Ditolak', value: 'ditolak' },
  ],
}
