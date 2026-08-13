import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
  ({ className, containerClassName, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name

    // Isolate col-span / layout classes for container, keep height/width/styling on input
    const isColSpan = className?.includes('col-span')
    const containerClasses = cn('space-y-1.5', containerClassName, isColSpan && className)
    const inputClasses = cn(isColSpan ? undefined : className)

    return (
      <div className={containerClasses}>
        {label && (
          <Label htmlFor={inputId} className="text-xs font-semibold text-[#111111] block mb-1">
            {label}
          </Label>
        )}
        <Input ref={ref} id={inputId} error={!!error} aria-invalid={!!error} className={inputClasses} {...props} />
        {error ? (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive mt-1">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        ) : null}
      </div>
    )
  }
)
AppInput.displayName = 'AppInput'

export { AppInput }
