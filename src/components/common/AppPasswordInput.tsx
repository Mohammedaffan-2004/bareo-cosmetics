import * as React from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface AppPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  /** Show the strength meter instead of a plain hint. */
  showStrength?: boolean
}

function strengthOf(value: string): { label: string; color: string; width: string } {
  if (!value) return { label: '', color: '', width: '0%' }
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  if (score <= 2) return { label: 'Weak', color: 'bg-destructive', width: '25%' }
  if (score === 3) return { label: 'Okay', color: 'bg-amber-500', width: '55%' }
  if (score === 4) return { label: 'Good', color: 'bg-lime-500', width: '80%' }
  return { label: 'Strong', color: 'bg-success', width: '100%' }
}

const AppPasswordInput = React.forwardRef<HTMLInputElement, AppPasswordInputProps>(
  ({ className, label, error, hint, id, showStrength, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false)
    const inputId = id ?? props.name
    const strength = showStrength ? strengthOf(String(props.value ?? '')) : null

    return (
      <div className={cn('space-y-1.5', className)}>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            error={!!error}
            aria-invalid={!!error}
            className="pr-11"
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {showStrength && strength?.label && (
          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={cn('h-full rounded-full transition-all', strength.color)} style={{ width: strength.width }} />
            </div>
            <p className="text-xs text-muted-foreground">Password strength: {strength.label}</p>
          </div>
        )}
        {error ? (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        ) : hint && !showStrength ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    )
  }
)
AppPasswordInput.displayName = 'AppPasswordInput'

export { AppPasswordInput }
