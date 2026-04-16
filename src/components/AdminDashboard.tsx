import { useState, useEffect } from 'react'
import { authQuery } from '@/lib/api'
import { RefreshCw } from 'lucide-react'

interface UserStats {
  email: string
  loginCount: number
  lastLogin: string | null
  totalItems: number
  totalCompleted: number
  avgCompletedPerDay: number
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function AdminDashboard() {
  const [users, setUsers] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const q = authQuery()
      if (!q) { setError('Not authenticated.'); return }
      const res = await fetch(`/api/admin/stats?${q}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to fetch stats.')
        return
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setError('Failed to fetch stats.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Dashboard</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
          aria-label="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 mb-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading && users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Loading stats...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div
              key={user.email}
              className="rounded-lg border bg-card p-3"
            >
              <p className="text-sm font-medium text-foreground truncate mb-2">
                {user.email}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="text-muted-foreground">Logins</div>
                <div className="text-foreground text-right">{user.loginCount}</div>

                <div className="text-muted-foreground">Last login</div>
                <div className="text-foreground text-right">{formatDate(user.lastLogin)}</div>

                <div className="text-muted-foreground">Active items</div>
                <div className="text-foreground text-right">{user.totalItems}</div>

                <div className="text-muted-foreground">Completed</div>
                <div className="text-foreground text-right">{user.totalCompleted}</div>

                <div className="text-muted-foreground">Avg/day</div>
                <div className="text-foreground text-right">{user.avgCompletedPerDay}</div>
              </div>
            </div>
          ))}

          <p className="text-center text-xs text-muted-foreground pt-2">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
