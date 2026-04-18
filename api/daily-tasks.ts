import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from './_auth.js'
import { encrypt, decrypt } from './_crypto.js'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function tasksKey(email: string) {
  return `td5_daily_tasks:${email.toLowerCase().trim()}`
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
      const data = await redis.get(tasksKey(email))
      let tasks: unknown[] = []
      if (data !== null) {
        const decrypted = decrypt<unknown>(data)
        if (Array.isArray(decrypted)) {
          tasks = decrypted
        } else if (typeof decrypted === 'string') {
          try { tasks = JSON.parse(decrypted) } catch { tasks = [] }
        }
      }
      return res.status(200).json({ tasks })
    }

    if (req.method === 'PUT') {
      const { tasks } = req.body
      if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks must be an array.' })
      await redis.set(tasksKey(email), encrypt(tasks))
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Daily tasks API error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: `Internal server error: ${message}` })
  }
}
