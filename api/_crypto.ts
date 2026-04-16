import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16
const PREFIX = 'enc:'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY env var must be a 64-char hex string (32 bytes).')
  }
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypt a JSON-serializable value. Returns a string like "enc:<base64>".
 */
export function encrypt(data: unknown): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })

  const plaintext = JSON.stringify(data)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  // Format: iv (12) + tag (16) + ciphertext
  const combined = Buffer.concat([iv, tag, encrypted])
  return PREFIX + combined.toString('base64')
}

/**
 * Decrypt a string produced by encrypt(). Returns parsed JSON.
 * If the value doesn't have the "enc:" prefix, treats it as unencrypted
 * (backward compatibility) and returns it as-is.
 */
export function decrypt<T = unknown>(value: unknown): T {
  // Not encrypted — return as-is (backward compat with old plain data)
  if (typeof value !== 'string' || !value.startsWith(PREFIX)) {
    return value as T
  }

  const key = getKey()
  const combined = Buffer.from(value.slice(PREFIX.length), 'base64')

  const iv = combined.subarray(0, IV_LENGTH)
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return JSON.parse(decrypted.toString('utf8')) as T
}
