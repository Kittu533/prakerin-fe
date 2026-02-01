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

export function encodeWithSlug(id: number, name: string): string {
  const encodedId = encodeId(id)
  const slug = generateSlug(name)
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
