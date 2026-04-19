import { useState, useEffect } from 'react'
import { authQuery } from '@/lib/api'
import { RefreshCw } from 'lucide-react'

interface UserStats {
  email: string
  loginCount: number
  lastLogin: string | null
  totalItems: number
  avgTasksPerDay: number
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
          title="Refresh stats"
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
        <div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">User</th>
                  <th className="text-right py-2 px-2 font-medium">Logins</th>
                  <th className="text-right py-2 px-2 font-medium whitespace-nowrap">Last Login</th>
                  <th className="text-right py-2 px-2 font-medium">Items</th>
                  <th className="text-right py-2 px-2 font-medium whitespace-nowrap">Tasks/d</th>
                  <th className="text-right py-2 px-2 font-medium">Done</th>
                  <th className="text-right py-2 pl-2 font-medium whitespace-nowrap">Done/d</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.email} className="border-b border-border/50">
                    <td className="py-2 pr-3 text-foreground max-w-[120px] truncate">{user.email}</td>
                    <td className="py-2 px-2 text-right text-foreground">{user.loginCount}</td>
                    <td className="py-2 px-2 text-right text-foreground whitespace-nowrap">{formatDate(user.lastLogin)}</td>
                    <td className="py-2 px-2 text-right text-foreground">{user.totalItems}</td>
                    <td className="py-2 px-2 text-right text-foreground">{user.avgTasksPerDay}</td>
                    <td className="py-2 px-2 text-right text-foreground">{user.totalCompleted}</td>
                    <td className="py-2 pl-2 text-right text-foreground">{user.avgCompletedPerDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-xs text-muted-foreground pt-3">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
