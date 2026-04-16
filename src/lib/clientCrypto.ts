/**
 * Client-side AES-256-GCM encryption for localStorage.
 * Key is derived from user email + app salt via PBKDF2.
 * This prevents casual snooping of localStorage data.
 */

const APP_SALT = 'mo-day50-v1-salt'
const PREFIX = 'enc:'
const PBKDF2_ITERATIONS = 100_000

let cachedKey: CryptoKey | null = null
let cachedEmail: string | null = null

function getEmail(): string {
  return (localStorage.getItem('conspiracy_daily_email') || '').toLowerCase().trim()
}

async function deriveKey(email: string): Promise<CryptoKey> {
  if (cachedKey && cachedEmail === email) return cachedKey

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(email),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  const salt = encoder.encode(APP_SALT)
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  cachedKey = key
  cachedEmail = email
  return key
}

function arrayToBase64(arr: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(arr)))
}

function base64ToArray(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/**
 * Encrypt a JSON-serializable value. Returns "enc:<base64(iv + ciphertext)>".
 */
export async function encryptLocal(data: unknown): Promise<string> {
  const email = getEmail()
  if (!email) return JSON.stringify(data) // fallback: no user logged in

  const key = await deriveKey(email)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(data))

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  )

  // Combine iv + ciphertext
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return PREFIX + arrayToBase64(combined.buffer)
}

/**
 * Decrypt a string produced by encryptLocal(). Returns parsed JSON.
 * If the value doesn't have the "enc:" prefix, parses as plain JSON (backward compat).
 */
export async function decryptLocal<T = unknown>(value: string): Promise<T> {
  if (!value.startsWith(PREFIX)) {
    return JSON.parse(value) as T
  }

  const email = getEmail()
  if (!email) throw new Error('No email for decryption')

  const key = await deriveKey(email)
  const combined = base64ToArray(value.slice(PREFIX.length))

  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return JSON.parse(new TextDecoder().decode(plaintext)) as T
}

/**
 * Clear the cached key (call on logout so next user gets fresh derivation).
 */
export function clearCryptoCache(): void {
  cachedKey = null
  cachedEmail = null
}
