import { Sparkles, ShoppingBag } from 'lucide-react'
import type { Product } from '@/types'
import { useAppDispatch } from '@/store/hooks'
import { addItem } from '@/store/slices/cartSlice'
import { useToast } from '@/hooks/useToast'
import { RatingStars } from '@/components/common/RatingStars'
import { Badge } from '@/components/ui/badge'
import { SmartImage } from '@/components/common/SmartImage'
import { getProductImage } from '@/utils/productImages'
import { cn, formatINR } from '@/utils'

interface AIRecommendationCardProps {
  product: Product
  className?: string
  compact?: boolean
}

/** Product card shown inside the AI chat + consultation report. */
export function AIRecommendationCard({ product, className, compact }: AIRecommendationCardProps) {
  const dispatch = useAppDispatch()
  const toast = useToast()

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-accent/40 bg-card shadow-card', className)}>
      <div className="flex gap-3 p-3">
        <SmartImage src={getProductImage(product)} alt={product.name} className={cn('shrink-0 rounded-xl object-contain bg-[#FAF7F2] p-1', compact ? 'size-14' : 'size-16')} />
        <div className="min-w-0 flex-1">
          <Badge variant="accent" className="gap-1 px-1.5 py-0 text-[10px]">
            <Sparkles className="size-2.5" /> AI Recommended
          </Badge>
          <p className={cn('mt-1 line-clamp-2 font-semibold leading-snug', compact ? 'text-xs' : 'text-sm')}>{product.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <RatingStars rating={product.rating} size={11} />
            <span className="text-xs font-semibold">{formatINR(product.offerPrice)}</span>
            {product.discount > 0 && <span className="text-[10px] font-semibold text-success">{product.discount}% OFF</span>}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          dispatch(addItem({ product }))
          toast.success('Added to cart', product.name)
        }}
        className="flex w-full items-center justify-center gap-1.5 bg-primary-soft py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <ShoppingBag className="size-3.5" /> Add to Cart
      </button>
    </div>
  )
}
