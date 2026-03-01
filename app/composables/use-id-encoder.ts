/**
 * Simple ID obfuscation utility
 * 
 * This provides basic obfuscation for numeric IDs to prevent
 * exposing sequential database IDs in URLs.
 */

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const XOR_KEY = 0x5A3C

export function encodeId(id: number): string {
  const obfuscated = id ^ XOR_KEY
  let result = ''
  let num = obfuscated
  
  if (num === 0) return ALPHABET[0] || '0'
  
  while (num > 0) {
    result = (ALPHABET[num % 62] || '0') + result
    num = Math.floor(num / 62)
  }
  
  const checksum = (id % 62)
  result = (ALPHABET[checksum] || '0') + result
  
  return result
}

export function decodeId(encoded: string): number | null {
  if (!encoded || encoded.length < 2) return null
  
  try {
    const checksumLetter = encoded[0]
    const encodedPart = encoded.slice(1)
    
    let num = 0
    for (let i = 0; i < encodedPart.length; i++) {
      const letter = encodedPart[i]
      const index = ALPHABET.indexOf(letter!)
      if (index === -1) return null
      num = num * 62 + index
    }
    
    const id = num ^ XOR_KEY
    
    const expectedChecksum = id % 62
    if (ALPHABET[expectedChecksum] !== checksumLetter) {
      return null
    }
    
    return id
  } catch {
    return null
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Encode an ID (numeric or UUID string) with a name slug for URL usage.
 * - Numeric IDs: obfuscated via XOR encoding
 * - UUID strings: hyphens stripped → 32 hex chars, then appended with slug
 */
export function encodeWithSlug(id: number | string, name: string): string {
  const slug = generateSlug(name)
  if (typeof id === 'string' && isUUID(id)) {
    // Strip hyphens: UUID → 32 lowercase hex chars
    const encodedId = id.replace(/-/g, '').toLowerCase()
    return slug ? `${encodedId}-${slug}` : encodedId
  }
  const encodedId = encodeId(id as number)
  return slug ? `${encodedId}-${slug}` : encodedId
}

export function decodeFromUrl(urlSegment: string): number | null {
  for (let i = 2; i <= Math.min(urlSegment.length, 10); i++) {
    const prefix = urlSegment.slice(0, i)
    const nextLetter = urlSegment[i]
    
    if (nextLetter === '-' || nextLetter === undefined) {
      const decoded = decodeId(prefix)
      if (decoded !== null && decoded > 0) {
        return decoded
      }
    }
  }
  
  return decodeId(urlSegment)
}

/**
 * Decode a UUID-based encoded URL segment.
 * Expects the first 32 chars to be a UUID without hyphens.
 * Returns the full UUID string (e.g. "638db913-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
 */
export function decodeUUIDFromUrl(urlSegment: string): string | null {
  // UUID is 32 hex chars when hyphens are stripped
  const match = urlSegment.match(/^([0-9a-f]{32})/i)
  if (!match || !match[1]) return null
  const hex = match[1].toLowerCase()
  // Re-insert hyphens: 8-4-4-4-12
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}
