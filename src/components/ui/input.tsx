import * as React from 'react'
import { cn } from '@/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm text-[#111111] transition-all duration-200',
        'placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#111111] focus-visible:border-[#111111]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-[#EF4444] focus-visible:ring-[#EF4444]',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
