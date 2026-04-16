import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from './_auth.js'
import { encrypt, decrypt } from './_crypto.js'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function statusesKey(email: string) {
  return `td5_statuses:${email.toLowerCase().trim()}`
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
      const data = await redis.get(statusesKey(email))
      let statuses: Record<string, unknown> = {}
      if (data !== null) {
        const decrypted = decrypt<unknown>(data)
        if (decrypted && typeof decrypted === 'object' && !Array.isArray(decrypted)) {
          statuses = decrypted as Record<string, unknown>
        } else if (typeof decrypted === 'string') {
          try { statuses = JSON.parse(decrypted) } catch { statuses = {} }
        }
      }
      return res.status(200).json({ statuses })
    }

    if (req.method === 'PUT') {
      const { statuses } = req.body
      if (typeof statuses !== 'object' || statuses === null) {
        return res.status(400).json({ error: 'statuses must be an object.' })
      }
      await redis.set(statusesKey(email), encrypt(statuses))
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Statuses API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
