import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id ?? props.name
    return (
      <div className={cn('space-y-1.5', className)}>
        {label && <Label htmlFor={textareaId}>{label}</Label>}
        <Textarea ref={ref} id={textareaId} aria-invalid={!!error} className={cn(error && 'border-destructive')} {...props} />
        {error && (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
      </div>
    )
  }
)
AppTextarea.displayName = 'AppTextarea'

export { AppTextarea }
