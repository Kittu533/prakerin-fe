/**
 * Date formatting utilities
 */

/**
 * Format date to Indonesian locale
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return '-'

  return dateObj.toLocaleDateString('id-ID', {
    ...options,
    timeZone: 'Asia/Jakarta',
  })
}

/**
 * Format date range
 * @example formatDateRange('2024-01-01', '2024-06-30') // '1 Jan 2024 s/d 30 Jun 2024'
 */
export function formatDateRange(startDate: string, endDate: string): string {
  return `${formatDate(startDate)} s/d ${formatDate(endDate)}`
}

/**
 * Format time to Indonesian locale
 */
export function formatTime(
  time: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  if (!time) return '-'

  const dateObj = typeof time === 'string' ? new Date(time) : time
  if (isNaN(dateObj.getTime())) return '-'

  return dateObj.toLocaleTimeString('id-ID', {
    ...options,
    timeZone: 'Asia/Jakarta',
  })
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'

  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return '-'

  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 7) return `${diffDays} hari yang lalu`
  return formatDate(dateObj)
}
