import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#111111] text-white',
        secondary: 'bg-[#FAFAFA] text-[#111111] border border-[#E5E7EB]',
        outline: 'border border-[#E5E7EB] text-[#111111] bg-white',
        success: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20',
        destructive: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
        warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
        accent: 'bg-[#111111] text-white',
        soft: 'bg-[#FAFAFA] text-[#111111] border border-[#E5E7EB]',
        ai: 'bg-[#7C3AED] text-white border border-[#6D28D9]',
        aiSoft: 'bg-[#FAF5FF] text-[#6D28D9] border border-[#DDD6FE]',
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
