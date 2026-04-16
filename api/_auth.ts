import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const SESSION_PREFIX = 'td5_session:'

interface SessionData {
  email: string
  createdAt: string
}

/**
 * Validate that the request has a valid session for the given email.
 * Returns the email (lowercase, trimmed) if valid, or sends a 401 and returns null.
 */
export async function authenticateRequest(
  req: VercelRequest,
  res: VercelResponse
): Promise<string | null> {
  const email = ((req.query.email as string) || '').toLowerCase().trim()
  const sessionId = (req.query.sessionId as string) || req.headers['x-session-id'] as string || ''

  if (!email) {
    res.status(400).json({ error: 'Email is required.' })
    return null
  }

  if (!sessionId) {
    res.status(401).json({ error: 'Session ID is required.' })
    return null
  }

  try {
    const session = await redis.get<SessionData | string>(`${SESSION_PREFIX}${sessionId}`)
    if (!session) {
      res.status(401).json({ error: 'Invalid or expired session.' })
      return null
    }

    // Upstash may auto-parse or return string
    const sessionData: SessionData = typeof session === 'string' ? JSON.parse(session) : session
    if (sessionData.email.toLowerCase().trim() !== email) {
      res.status(403).json({ error: 'Session does not match email.' })
      return null
    }

    return email
  } catch (err) {
    console.error('Auth validation error:', err)
    res.status(500).json({ error: 'Authentication error.' })
    return null
  }
}
