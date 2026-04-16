import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const MAX_SESSIONS = 5
const SESSION_TTL = 2592000 // 30 days in seconds
const SESSION_PREFIX = 'td5_session:'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Id')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // GET - check session count and validate a session
    if (req.method === 'GET') {
      const sessionId = req.query.sessionId as string | undefined

      // Count active sessions
      const keys = await redis.keys(`${SESSION_PREFIX}*`)
      const count = keys.length

      // If sessionId provided, check if it's still valid
      let valid = false
      if (sessionId) {
        const session = await redis.get(`${SESSION_PREFIX}${sessionId}`)
        valid = session !== null
      }

      return res.status(200).json({ count, max: MAX_SESSIONS, valid })
    }

    // POST - create a new session (login)
    if (req.method === 'POST') {
      const { email, sessionId } = req.body

      if (!email || !sessionId) {
        return res.status(400).json({ error: 'Email and sessionId are required.' })
      }

      // Check current session count
      const keys = await redis.keys(`${SESSION_PREFIX}*`)

      // Don't count the user's own existing session if they're re-logging in
      const existingKeys = keys.filter(k => !k.endsWith(sessionId))
      if (existingKeys.length >= MAX_SESSIONS) {
        return res.status(429).json({
          error: `Maximum ${MAX_SESSIONS} active users reached. Please try again later.`,
          count: keys.length,
          max: MAX_SESSIONS,
        })
      }

      // Create/refresh session with TTL
      await redis.set(`${SESSION_PREFIX}${sessionId}`, JSON.stringify({ email, createdAt: new Date().toISOString() }), { ex: SESSION_TTL })

      const newKeys = await redis.keys(`${SESSION_PREFIX}*`)
      return res.status(200).json({ success: true, count: newKeys.length, max: MAX_SESSIONS })
    }

    // DELETE - remove session (logout)
    if (req.method === 'DELETE') {
      const sessionId = req.query.sessionId as string
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required.' })
      }

      await redis.del(`${SESSION_PREFIX}${sessionId}`)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('Session API error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
