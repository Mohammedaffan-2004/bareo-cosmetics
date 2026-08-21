import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#172126] text-white',
        secondary: 'bg-[#EDF6F8] text-[#172126] border border-[#DCE6E9]',
        outline: 'border border-[#DCE6E9] text-[#172126] bg-white',
        success: 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/20',
        destructive: 'bg-[#B85C5C]/10 text-[#B85C5C] border border-[#B85C5C]/20',
        warning: 'bg-[#FEF3C7] text-[#92400E] border border-amber-300',
        accent: 'bg-[#167C86] text-white',
        soft: 'bg-[#EDF6F8] text-[#172126] border border-[#DCE6E9]',
        ai: 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/30',
        aiSoft: 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
