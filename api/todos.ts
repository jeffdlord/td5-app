import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function todosKey(email: string) {
  return `td5_todos:${email.toLowerCase().trim()}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const email = (req.query.email as string) || ''
  if (!email) return res.status(400).json({ error: 'Email is required.' })

  try {
    // GET — fetch todos for this user
    if (req.method === 'GET') {
      const data = await redis.get(todosKey(email))
      // Upstash auto-deserializes JSON, so data may be an array, string, or null
      let todos: unknown[] = []
      if (Array.isArray(data)) {
        todos = data
      } else if (typeof data === 'string') {
        try { todos = JSON.parse(data) } catch { todos = [] }
      }
      return res.status(200).json({ todos })
    }

    // PUT — overwrite todos for this user
    if (req.method === 'PUT') {
      const { todos } = req.body
      if (!Array.isArray(todos)) return res.status(400).json({ error: 'todos must be an array.' })
      // Store as native JSON — Upstash handles serialization
      await redis.set(todosKey(email), todos)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Todos API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
