import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/utils'

const buttonVariants = cva(
  'group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#167C86] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:translate-x-0.5',
  {
    variants: {
      variant: {
        default: 'bg-[#172126] text-white shadow-2xs hover:bg-[#253239] active:bg-[#121A1E]',
        primary: 'bg-[#172126] text-white shadow-2xs hover:bg-[#253239] active:bg-[#121A1E]',
        secondary: 'bg-white text-[#172126] border border-[#172126] hover:bg-[#EDF6F8]',
        outline: 'border border-[#DCE6E9] bg-white text-[#172126] hover:bg-[#EDF6F8] hover:border-[#172126]/30',
        ghost: 'text-[#172126] hover:bg-[#EDF6F8]',
        ai: 'bg-[#167C86] text-white shadow-2xs hover:bg-[#126872] active:bg-[#0E545C] focus-visible:ring-[#167C86]',
        accent: 'bg-[#167C86] text-white hover:bg-[#126872]',
        destructive: 'bg-[#B85C5C] text-white hover:bg-[#A34E4E]',
        link: 'text-[#172126] underline-offset-4 hover:underline',
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
