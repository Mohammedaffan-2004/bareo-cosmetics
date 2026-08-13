import * as React from 'react'
import { cn } from '@/utils'

export interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: boolean
  disabled?: boolean
  autoFocus?: boolean
}

/**
 * Lightweight OTP input built without external dependencies.
 * Splits focus across `length` boxes and auto-advances.
 */
const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  ({ length = 4, value, onChange, error, disabled, autoFocus }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, raw: string) => {
      const digit = raw.replace(/\D/g, '').slice(-1)
      const next = value.split('')
      next[index] = digit
      onChange(next.join('').slice(0, length))
      if (digit && index < length - 1) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      onChange(digits)
      inputRefs.current[Math.min(digits.length, length - 1)]?.focus()
    }

    return (
      <div ref={ref} className="flex items-center justify-center gap-2" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            inputMode="numeric"
            maxLength={2}
            autoFocus={autoFocus && i === 0}
            value={value[i] ?? ''}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              'h-14 w-12 rounded-xl border border-input bg-card text-center text-xl font-bold shadow-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-ring',
              error && 'border-destructive focus:border-destructive focus:ring-destructive',
              disabled && 'opacity-50',
              value[i] && 'border-primary'
            )}
          />
        ))}
      </div>
    )
  }
)
OtpInput.displayName = 'OtpInput'

export { OtpInput }
