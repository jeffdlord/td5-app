const SESSION_KEY = 'td5_session_id'

function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

function getEmail(): string | null {
  return localStorage.getItem('conspiracy_daily_email')
}

/**
 * Build a query string with email and sessionId for authenticated API calls.
 */
export function authParams(): { email: string; sessionId: string } | null {
  const email = getEmail()
  const sessionId = getSessionId()
  if (!email || !sessionId) return null
  return { email, sessionId }
}

/**
 * Build the query string portion for API URLs.
 */
export function authQuery(): string | null {
  const params = authParams()
  if (!params) return null
  return `email=${encodeURIComponent(params.email)}&sessionId=${encodeURIComponent(params.sessionId)}`
}
