import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const email = (req.query.email as string) || ''
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  try {
    if (req.method === 'GET') {
      const data = await redis.get(settingsKey(email))
      let settings = { theme: 'light', maxPerDay: 5 }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        settings = data as typeof settings
      } else if (typeof data === 'string') {
        try { settings = JSON.parse(data) } catch { /* use default */ }
      }
      return res.status(200).json({ settings })
    }

    if (req.method === 'PUT') {
      const { settings } = req.body
      if (typeof settings !== 'object' || settings === null) {
        return res.status(400).json({ error: 'settings must be an object.' })
      }
      await redis.set(settingsKey(email), settings)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Settings API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
