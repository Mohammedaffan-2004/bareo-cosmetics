import { cn } from '@/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  action?: React.ReactNode
  className?: string
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'left', action, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-4', align === 'center' && 'flex-col items-center text-center', className)}>
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>}
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className={cn('mt-2 max-w-xl text-sm text-muted-foreground', align === 'center' && 'mx-auto')}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
