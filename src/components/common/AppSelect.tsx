import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface AppSelectOption {
  value: string
  label: string
  hint?: string
}

export interface AppSelectProps {
  label?: string
  error?: string
  placeholder?: string
  options: AppSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  name?: string
  defaultValue?: string
}

const AppSelect = React.forwardRef<HTMLDivElement, AppSelectProps>(
  ({ label, error, placeholder = 'Select an option', options, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1.5', className)}>
        {label && <Label>{label}</Label>}
        <Select value={props.value} onValueChange={props.onValueChange} disabled={props.disabled} name={props.name} defaultValue={props.defaultValue}>
          <SelectTrigger className={cn(error && 'border-destructive focus-visible:ring-destructive')}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
                {opt.hint ? <span className="ml-2 text-xs text-muted-foreground">{opt.hint}</span> : null}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
      </div>
    )
  }
)
AppSelect.displayName = 'AppSelect'

export { AppSelect }
