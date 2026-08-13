import { useCallback, useState, useEffect } from 'react'

/** Countdown in seconds with start/stop/reset controls. */
export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setActive(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [active])

  const start = useCallback(() => {
    setSeconds(initialSeconds)
    setActive(true)
  }, [initialSeconds])

  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setActive(false)
  }, [initialSeconds])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return { seconds, mm, ss, active, start, reset }
}
