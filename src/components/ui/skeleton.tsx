import { cn } from '@/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] before:absolute before:inset-0 before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
