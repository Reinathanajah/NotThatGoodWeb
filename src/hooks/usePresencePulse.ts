import { useEffect, useState } from 'react'
import { useAuth } from '../context/authContextValue.ts'
import { fetchOnlinePresence, sendPresenceHeartbeat } from '../services/supportApi.ts'

const HEARTBEAT_INTERVAL_MS = 60_000

export function usePresencePulse() {
  const { status } = useAuth()
  const [onlineCount, setOnlineCount] = useState<number | null>(null)
  const [activeWindowSeconds, setActiveWindowSeconds] = useState<number>(300)

  useEffect(() => {
    const controller = new AbortController()

    const syncPresence = () => {
      if (document.visibilityState === 'hidden') return
      if (status === 'authenticated') {
        sendPresenceHeartbeat(controller.signal).then(
          (res) => {
            setOnlineCount(res.onlineCount)
            setActiveWindowSeconds(res.activeWindowSeconds)
          },
          () => {},
        )
      } else {
        fetchOnlinePresence(controller.signal).then(
          (res) => {
            setOnlineCount(res.onlineCount)
            setActiveWindowSeconds(res.activeWindowSeconds)
          },
          () => {},
        )
      }
    }

    syncPresence()
    const timer = window.setInterval(syncPresence, HEARTBEAT_INTERVAL_MS)
    document.addEventListener('visibilitychange', syncPresence)

    return () => {
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', syncPresence)
    }
  }, [status])

  return { onlineCount, activeWindowSeconds }
}
