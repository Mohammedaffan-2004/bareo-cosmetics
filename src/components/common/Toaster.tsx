import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { dismissToast } from '@/store/slices/toastSlice'
import { cn } from '@/utils'

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const COLORS = {
  success: 'text-[#22C55E]',
  error: 'text-[#EF4444]',
  info: 'text-[#111111]',
  warning: 'text-[#F59E0B]',
}

export function Toaster() {
  const toasts = useAppSelector((s) => s.toast.toasts)
  const dispatch = useAppDispatch()

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant]
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 30, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-md text-[#111111]"
              role="status"
            >
              <Icon className={cn('mt-0.5 size-4 shrink-0', COLORS[t.variant])} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#111111]">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[11px] text-[#6B7280]">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dispatch(dismissToast(t.id))}
                className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#FAFAFA] hover:text-[#111111]"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
              <AutoDismiss id={t.id} />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function AutoDismiss({ id }: { id: string }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(dismissToast(id))
    }, 3500)

    return () => clearTimeout(timer)
  }, [id, dispatch])

  return null
}
