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
        'flex h-11 w-full rounded-xl border border-[#DCE6E9] bg-white px-4 py-2 text-xs font-normal text-[#172126] transition-all duration-200',
        'placeholder:text-[#7A8A91] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#167C86] focus-visible:border-[#167C86]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-[#B85C5C] focus-visible:ring-[#B85C5C]',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
