import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const email = (req.query.email as string) || ''
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  try {
    // GET — fetch all daily statuses for this user
    if (req.method === 'GET') {
      const data = await redis.get(statusesKey(email))
      // Upstash auto-deserializes JSON, handle both object and string cases
      let statuses: Record<string, unknown> = {}
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        statuses = data as Record<string, unknown>
      } else if (typeof data === 'string') {
        try { statuses = JSON.parse(data) } catch { statuses = {} }
      }
      return res.status(200).json({ statuses })
    }

    // PUT — overwrite all daily statuses for this user
    if (req.method === 'PUT') {
      const { statuses } = req.body
      if (typeof statuses !== 'object' || statuses === null) {
        return res.status(400).json({ error: 'statuses must be an object.' })
      }
      // Store as native JSON
      await redis.set(statusesKey(email), statuses)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Statuses API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
