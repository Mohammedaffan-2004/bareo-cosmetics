import { useCallback, useState, useEffect } from 'react'

const KEY = 'lumina-recently-viewed'

/** Persist recently-viewed product ids in localStorage. */
export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids))
  }, [ids])

  const add = useCallback((productId: string) => {
    setIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 8))
  }, [])

  const clear = useCallback(() => setIds([]), [])

  return { ids, add, clear }
}
