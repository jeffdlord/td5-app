import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const email = (req.query.email as string) || ''
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  try {
    if (req.method === 'GET') {
      const data = await redis.get(tasksKey(email))
      let tasks: unknown[] = []
      if (Array.isArray(data)) {
        tasks = data
      } else if (typeof data === 'string') {
        try { tasks = JSON.parse(data) } catch { tasks = [] }
      }
      return res.status(200).json({ tasks })
    }

    if (req.method === 'PUT') {
      const { tasks } = req.body
      if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks must be an array.' })
      await redis.set(tasksKey(email), tasks)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Daily tasks API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
