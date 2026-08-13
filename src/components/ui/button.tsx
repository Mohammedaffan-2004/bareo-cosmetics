import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/utils'

const buttonVariants = cva(
  'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#111111] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5',
  {
    variants: {
      variant: {
        default: 'bg-[#111111] text-white shadow-xs hover:bg-black/90 active:bg-black',
        primary: 'bg-[#111111] text-white shadow-xs hover:bg-black/90 active:bg-black',
        secondary: 'bg-white text-[#111111] border border-[#111111] hover:bg-[#FAFAFA]',
        outline: 'border border-[#E5E7EB] bg-white text-[#111111] hover:bg-[#FAFAFA] hover:border-slate-400',
        ghost: 'text-[#111111] hover:bg-[#FAFAFA]',
        ai: 'bg-[#7C3AED] text-white shadow-xs hover:bg-[#6D28D9] active:bg-[#5B21B6] focus-visible:ring-[#7C3AED]',
        accent: 'bg-[#111111] text-white hover:bg-black/90',
        destructive: 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90',
        link: 'text-[#111111] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 rounded-lg px-4 text-xs font-medium',
        lg: 'h-12 rounded-xl px-8 text-base font-medium',
        icon: 'h-11 w-11 p-0',
        'icon-sm': 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ className, variant, size, loading, asChild = false, children, disabled, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className)
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} aria-disabled={disabled || loading || undefined} {...props}>
          {children}
        </Slot>
      )
    }
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} disabled={disabled || loading} {...props}>
        {loading && (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
