import { useState, useCallback, useEffect, useRef } from 'react'
import { encryptLocal, decryptLocal } from '@/lib/clientCrypto'

const ENC_PREFIX = 'enc:'

/**
 * localStorage hook with transparent AES-256-GCM encryption.
 *
 * On first read: loads plain JSON (backward compat) or encrypted data.
 * On every write: encrypts before storing.
 * The async decrypt runs once on mount; until it resolves, the hook
 * returns the defaultValue (or plain-JSON fallback for unencrypted data).
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue
      // If encrypted, return default for now — async decrypt will update
      if (item.startsWith(ENC_PREFIX)) return defaultValue
      // Plain JSON (backward compat)
      return JSON.parse(item) as T
    } catch {
      return defaultValue
    }
  })

  const initialDecryptDone = useRef(false)

  // Async decrypt on mount if data is encrypted
  useEffect(() => {
    if (initialDecryptDone.current) return
    initialDecryptDone.current = true

    const item = localStorage.getItem(key)
    if (!item || !item.startsWith(ENC_PREFIX)) return

    decryptLocal<T>(item)
      .then(decrypted => setStoredValue(decrypted))
      .catch(() => {
        // Decryption failed (wrong user, corrupted data) — clear and use default
        console.warn(`Failed to decrypt localStorage key "${key}", resetting.`)
        localStorage.removeItem(key)
      })
  }, [key])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const nextValue = value instanceof Function ? value(prev) : value
      // Encrypt and store asynchronously
      encryptLocal(nextValue)
        .then(encrypted => localStorage.setItem(key, encrypted))
        .catch(() => {
          // Fallback to plain JSON if encryption fails
          localStorage.setItem(key, JSON.stringify(nextValue))
        })
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}
