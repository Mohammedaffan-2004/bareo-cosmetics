import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/utils'

export interface AppModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

/** Thin wrapper over the Dialog primitive for consistent modals. */
const AppModal = React.forwardRef<HTMLDivElement, AppModalProps>(
  ({ open, onOpenChange, onClose, title, description, children, className }, ref) => {
    const handleOpenChange = (newOpen: boolean) => {
      onOpenChange?.(newOpen)
      if (!newOpen) {
        onClose?.()
      }
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent ref={ref} className={cn('max-h-[88vh]', className)}>
          {title && (
            <div>
              <DialogTitle className="text-xl font-bold font-serif text-[#111111]">{title}</DialogTitle>
              {description && <DialogDescription className="mt-1 text-xs text-[#6B7280]">{description}</DialogDescription>}
            </div>
          )}
          {children}
        </DialogContent>
      </Dialog>
    )
  }
)
AppModal.displayName = 'AppModal'

export { AppModal }
