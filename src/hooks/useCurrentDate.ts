import { useState, useCallback, useEffect } from 'react'

function getESTDate(): string {
  const now = new Date()
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const year = est.getFullYear()
  const month = String(est.getMonth() + 1).padStart(2, '0')
  const day = String(est.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getESTDay(): number {
  const now = new Date()
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return est.getDate()
}

function getESTYear(): number {
  const now = new Date()
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return est.getFullYear()
}

export function getTodayCode(): string {
  const day = String(getESTDay()).padStart(2, '0')
  const year = String(getESTYear())
  return `${day}${year}`
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function useCurrentDate() {
  const [todayEST, setTodayEST] = useState(getESTDate)
  const [currentDate, setCurrentDate] = useState(getESTDate)

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const newToday = getESTDate()
        setTodayEST(prev => {
          if (prev !== newToday) {
            setCurrentDate(newToday)
            return newToday
          }
          return prev
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    const interval = setInterval(() => {
      const newToday = getESTDate()
      setTodayEST(prev => {
        if (prev !== newToday) {
          setCurrentDate(newToday)
          return newToday
        }
        return prev
      })
    }, 60000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      clearInterval(interval)
    }
  }, [])

  const goToNextDay = useCallback(() => {
    setCurrentDate(prev => addDays(prev, 1))
  }, [])

  const goToPrevDay = useCallback(() => {
    setCurrentDate(prev => addDays(prev, -1))
  }, [])

  const goToToday = useCallback(() => {
    setCurrentDate(getESTDate())
  }, [])

  return {
    currentDate,
    todayEST,
    isToday: currentDate === todayEST,
    formattedDate: formatDate(currentDate),
    goToNextDay,
    goToPrevDay,
    goToToday,
  }
}
