import { useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { pushToast, dismissToast } from '@/store/slices/toastSlice'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'success' | 'error' | 'info' | 'warning'
}

/** Push a toast notification. Returns a dismiss function. */
export function useToast() {
  const dispatch = useAppDispatch()

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = `toast_${Math.random().toString(36).slice(2, 9)}`
      dispatch(pushToast({ id, ...opts, variant: opts.variant ?? 'info' }))
      return () => dispatch(dismissToast(id))
    },
    [dispatch]
  )

  const success = useCallback((title: string, description?: string) => toast({ title, description, variant: 'success' }), [toast])
  const error = useCallback((title: string, description?: string) => toast({ title, description, variant: 'error' }), [toast])
  const info = useCallback((title: string, description?: string) => toast({ title, description, variant: 'info' }), [toast])

  return { toast, success, error, info }
}
