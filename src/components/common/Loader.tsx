import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export function Loader({ size = 'md', label, className }: LoaderProps) {
  const sizes = { sm: 'size-5', md: 'size-8', lg: 'size-12' }
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-muted-foreground', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizes[size])} />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  )
}
