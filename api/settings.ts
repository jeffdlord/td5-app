import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from './_auth.js'
import { encrypt, decrypt } from './_crypto.js'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function settingsKey(email: string) {
  return `td5_settings:${email.toLowerCase().trim()}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Id')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const email = await authenticateRequest(req, res)
  if (!email) return

  try {
    if (req.method === 'GET') {
      const data = await redis.get(settingsKey(email))
      let settings = { theme: 'light', maxPerDay: 5 }
      if (data !== null) {
        const decrypted = decrypt<unknown>(data)
        if (decrypted && typeof decrypted === 'object' && !Array.isArray(decrypted)) {
          settings = decrypted as typeof settings
        } else if (typeof decrypted === 'string') {
          try { settings = JSON.parse(decrypted) } catch { /* use default */ }
        }
      }
      return res.status(200).json({ settings })
    }

    if (req.method === 'PUT') {
      const { settings } = req.body
      if (typeof settings !== 'object' || settings === null) {
        return res.status(400).json({ error: 'settings must be an object.' })
      }
      await redis.set(settingsKey(email), encrypt(settings))
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Settings API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
