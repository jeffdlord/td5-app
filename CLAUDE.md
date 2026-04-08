# mo — Daily Todo Tracker PWA

## Project Overview
mo is a Progressive Web App for managing recurring daily to-dos. Users create up to 20 to-dos, assign them to specific days of the week, and track completion + notes independently per calendar date.

- **Live:** https://td5-app.vercel.app
- **GitHub:** https://github.com/jeffdlord/td5-app
- **Target domain:** td5.day50.com

## Tech Stack
- **Frontend:** React 18 + TypeScript, Vite 7, Tailwind CSS v3, shadcn/ui
- **Drag & drop:** @dnd-kit/core + @dnd-kit/sortable
- **Swipe navigation:** react-swipeable
- **PWA:** vite-plugin-pwa (registerType: autoUpdate)
- **Backend:** Vercel serverless functions (`/api` directory)
- **Database:** Upstash Redis (via Vercel integration)
- **Icons:** Lucide React
- **Toasts:** Sonner
- **Hosting:** Vercel (auto-deploys from `main`)
- **Brand color:** #849669 (sage green)

## Architecture

### Authentication
- Email + daily access code (DD+YYYY in EST, e.g. April 7, 2026 → `072026`)
- "Remember me" auto-logs in for 30 days without code
- Max 5 concurrent users enforced via Redis sessions (30-day TTL)
- Auth state in `useAuth` hook, session keys: `conspiracy_daily_email`, `conspiracy_remember_me`, `td5_remember_expiry`, `td5_session_id`

### Data Model (all per-user, keyed by email in Redis)
| Redis Key | Content |
|---|---|
| `td5_todos:{email}` | Todo[] — all todos (active + archived) |
| `td5_statuses:{email}` | Record<"YYYY-MM-DD:todoId", DailyStatus> — daily completion + notes |
| `td5_settings:{email}` | UserSettings — theme + maxPerDay |
| `td5_session:{sessionId}` | Session data with 30-day TTL |

Note: Redis keys still use `td5_` prefix for backward compatibility.

### API Routes (`/api`)
- `sessions.ts` — GET/POST/DELETE for session management + 5-user limit
- `todos.ts` — GET/PUT for todo CRUD
- `statuses.ts` — GET/PUT for daily status tracking
- `settings.ts` — GET/PUT for user preferences

### Hooks
- `useAuth` — login/logout, session management, 30-day remember me
- `useSettings` — theme + maxPerDay, syncs localStorage ↔ Redis
- `useTodos(maxPerDay)` — CRUD, max 20 total, configurable per-day limit, day-of-week filtering
- `useDailyStatus` — per-day per-todo completion + notes
- `useCurrentDate` — EST date, prev/next navigation, midnight rollover detection
- `useLocalStorage` — generic typed localStorage hook

### Views (via ViewToggle)
- **Today** — daily todos with drag-and-drop, completion toggle, notes
- **All** — all active todos with inline day-of-week toggle buttons
- **Archive** — archived todos
- **Settings** — theme toggle, daily limit stepper (2–10) with >5 warning

### Key Patterns
- All hooks follow: localStorage for cache → fetch from Redis on mount → sync both on writes
- API routes: CORS headers, email as query param, Redis key convention `td5_{resource}:{email}`
- Defensive coding: `Array.isArray(t.days) ? t.days : [0,1,2,3,4,5,6]` for backward compat
- ErrorBoundary wraps the app to catch crashes

## Development
```bash
cd /Users/jefflord/Documents/td5-app
PATH="/usr/local/bin:$PATH" npm run dev
```
Node is at `/usr/local/bin/node` (not on default PATH — always prefix commands).

## Deployment
```bash
PATH="/usr/local/bin:/opt/homebrew/bin:$PATH" vercel --yes --prod
```

## Environment Variables (Vercel)
- `KV_REST_API_URL` — Upstash Redis REST URL
- `KV_REST_API_TOKEN` — Upstash Redis REST token

## Cost Notes
- Upstash free tier: 10,000 commands/day (sufficient for 5 users)
- Vercel free tier: sufficient for this scale
