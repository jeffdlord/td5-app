import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateRequest } from './_auth.js'
import { encrypt, decrypt } from './_crypto.js'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Id')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const email = await authenticateRequest(req, res)
  if (!email) return // response already sent

  try {
    if (req.method === 'GET') {
      const data = await redis.get(todosKey(email))
      let todos: unknown[] = []
      if (data !== null) {
        const decrypted = decrypt<unknown>(data)
        if (Array.isArray(decrypted)) {
          todos = decrypted
        } else if (typeof decrypted === 'string') {
          try { todos = JSON.parse(decrypted) } catch { todos = [] }
        }
      }
      return res.status(200).json({ todos })
    }

    if (req.method === 'PUT') {
      const { todos } = req.body
      if (!Array.isArray(todos)) return res.status(400).json({ error: 'todos must be an array.' })
      await redis.set(todosKey(email), encrypt(todos))
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Todos API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
