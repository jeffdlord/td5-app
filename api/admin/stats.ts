import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { decrypt } from '../_crypto.js'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const ADMIN_EMAIL = 'jeffdlord@gmail.com'
const SESSION_PREFIX = 'td5_session:'

interface UserStats {
  email: string
  loginCount: number
  lastLogin: string | null
  totalItems: number
  totalCompleted: number
  avgCompletedPerDay: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Id')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' })

  // Authenticate: must be admin with valid session
  const email = ((req.query.email as string) || '').toLowerCase().trim()
  const sessionId = (req.query.sessionId as string) || ''

  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access only.' })
  }

  if (!sessionId) {
    return res.status(401).json({ error: 'Session ID required.' })
  }

  const session = await redis.get(`${SESSION_PREFIX}${sessionId}`)
  if (!session) {
    return res.status(401).json({ error: 'Invalid session.' })
  }

  const sessionData = typeof session === 'string' ? JSON.parse(session) : session
  if ((sessionData as { email: string }).email.toLowerCase().trim() !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access only.' })
  }

  try {
    // Discover all users by scanning analytics, todos, and statuses keys
    const emails = new Set<string>()

    const analyticsKeys = await redis.keys('td5_analytics:*')
    for (const k of analyticsKeys) emails.add(k.replace('td5_analytics:', ''))

    const todosKeys = await redis.keys('td5_todos:*')
    for (const k of todosKeys) emails.add(k.replace('td5_todos:', ''))

    const statusesKeys = await redis.keys('td5_statuses:*')
    for (const k of statusesKeys) emails.add(k.replace('td5_statuses:', ''))

    const dailyTasksKeys = await redis.keys('td5_daily_tasks:*')
    for (const k of dailyTasksKeys) emails.add(k.replace('td5_daily_tasks:', ''))

    const users: UserStats[] = []

    for (const userEmail of emails) {
      // Analytics
      let loginCount = 0
      let lastLogin: string | null = null
      const analyticsRaw = await redis.get(`td5_analytics:${userEmail}`)
      if (analyticsRaw) {
        const analytics = typeof analyticsRaw === 'string' ? JSON.parse(analyticsRaw) : analyticsRaw
        loginCount = (analytics as { loginCount?: number }).loginCount || 0
        lastLogin = (analytics as { lastLogin?: string }).lastLogin || null
      }

      // Todos (may be encrypted)
      let totalItems = 0
      const todosRaw = await redis.get(`td5_todos:${userEmail}`)
      if (todosRaw !== null) {
        try {
          const todos = decrypt<unknown>(todosRaw)
          if (Array.isArray(todos)) {
            totalItems = todos.filter((t: { archivedAt?: string | null }) => t.archivedAt === null).length
          }
        } catch { /* skip */ }
      }

      // Daily tasks (may be encrypted)
      const dailyTasksRaw = await redis.get(`td5_daily_tasks:${userEmail}`)
      if (dailyTasksRaw !== null) {
        try {
          const tasks = decrypt<unknown>(dailyTasksRaw)
          if (Array.isArray(tasks)) {
            totalItems += tasks.length
          }
        } catch { /* skip */ }
      }

      // Statuses (may be encrypted)
      let totalCompleted = 0
      const uniqueDays = new Set<string>()
      const statusesRaw = await redis.get(`td5_statuses:${userEmail}`)
      if (statusesRaw !== null) {
        try {
          const statuses = decrypt<unknown>(statusesRaw)
          if (statuses && typeof statuses === 'object' && !Array.isArray(statuses)) {
            const statusMap = statuses as Record<string, { completed?: 1 | null; date?: string }>
            for (const [, status] of Object.entries(statusMap)) {
              if (status.completed === 1) {
                totalCompleted++
                if (status.date) uniqueDays.add(status.date)
              }
            }
          }
        } catch { /* skip */ }
      }

      // Also count completed daily tasks
      if (dailyTasksRaw !== null) {
        try {
          const tasks = decrypt<unknown>(dailyTasksRaw)
          if (Array.isArray(tasks)) {
            for (const t of tasks) {
              if ((t as { completed?: boolean }).completed) {
                totalCompleted++
                if ((t as { date?: string }).date) uniqueDays.add((t as { date: string }).date)
              }
            }
          }
        } catch { /* skip */ }
      }

      const daysActive = uniqueDays.size
      const avgCompletedPerDay = daysActive > 0 ? Math.round((totalCompleted / daysActive) * 10) / 10 : 0

      users.push({
        email: userEmail,
        loginCount,
        lastLogin,
        totalItems,
        totalCompleted,
        avgCompletedPerDay,
      })
    }

    // Sort by most recent login
    users.sort((a, b) => {
      if (!a.lastLogin) return 1
      if (!b.lastLogin) return -1
      return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()
    })

    return res.status(200).json({ users })
  } catch (err) {
    console.error('Admin stats error:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
