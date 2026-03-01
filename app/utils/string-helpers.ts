/**
 * String manipulation utilities
 */

/**
 * Get initials from a name
 * @example getInitials('John Doe') // 'JD'
 * @example getInitials('Budi Santoso') // 'BS'
 */
export function getInitials(name: string): string {
  if (!name || name === "-") return "--";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Format number with Indonesian locale
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Format currency (Rupiah)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert to title case
 */
export function toTitleCase(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Slugify text for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract class name from siswa option label
 * @param label Format: "Nama Siswa (XII RPL 1)"
 */
export function extractKelasFromLabel(label: string): string {
  const match = label.match(/\(([^)]+)\)/);
  return match ? match[1] : "-";
}

/**
 * Extract name from option label
 * @param label Format: "Nama Siswa (XII RPL 1)"
 */
export function extractNameFromLabel(label: string): string {
  return label.split(" (")[0] || label;
}

/**
 * Create a name resolver from options
 */
export function createNameResolver<T extends { value: number; label: string }>(
  options: T[],
  fallbackPrefix = "Item",
) {
  return (id: number): string => {
    const item = options.find((opt) => opt.value === id);
    return item?.label || `${fallbackPrefix} #${id}`;
  };
}
