import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { EyeIcon } from './EyeIcon'
import { Loader2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

interface LoginScreenProps {
  onLogin: (email: string, code: string, rememberMe: boolean) => { success: boolean; error?: string }
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = onLogin(email, code, rememberMe)
      if (!result.success) {
        toast.error(result.error)
      } else {
        toast.success('Welcome to TD5!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <svg viewBox="0 0 120 50" className="h-16 w-auto">
              <defs>
                <linearGradient id="td5grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <text
                x="60"
                y="38"
                textAnchor="middle"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="42"
                fill="url(#td5grad)"
              >
                TD5
              </text>
            </svg>
          </div>
          <CardTitle className="text-2xl">TD5</CardTitle>
          <CardDescription>
            Enter your email and today's daily access code to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                maxLength={255}
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Daily Access Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter today's code"
                  maxLength={10}
                  required
                  className="pl-10"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="cursor-pointer">Remember me</Label>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-6 rounded-full relative overflow-hidden flex items-center justify-center text-white font-bold text-sm tracking-wider uppercase transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(90deg, #dc2626 0%, #dc2626 48%, #b91c1c 48%, #b91c1c 52%, #ef4444 52%, #ef4444 100%)',
                  boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3), inset 0 1px 2px rgba(255,255,255,0.2)',
                }}
              >
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4" />
                      Enter
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
