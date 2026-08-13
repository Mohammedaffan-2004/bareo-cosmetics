import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleTheme, setTheme } from '@/store/slices/themeSlice'

/** Applies the theme class to <html> and exposes theme controls. */
export function useTheme() {
  const mode = useAppSelector((s) => s.theme.mode)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [mode])

  const toggle = useCallback(() => dispatch(toggleTheme()), [dispatch])
  const set = useCallback((next: 'light' | 'dark') => dispatch(setTheme(next)), [dispatch])

  return { mode, isDark: mode === 'dark', toggle, set }
}
