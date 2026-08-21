import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Sparkles } from 'lucide-react'
import type { Product } from '@/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addItem, setDrawerOpen } from '@/store/slices/cartSlice'
import { toggleWishlist } from '@/store/slices/wishlistSlice'
import { useToast } from '@/hooks/useToast'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/common/RatingStars'
import { PriceTag } from '@/components/common/PriceTag'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/common/SmartImage'
import { getProductImage } from '@/utils/productImages'
import { cn, formatNumber } from '@/utils'

interface ProductCardListProps {
  product: Product
  className?: string
}

/** Horizontal layout variant of the product card (list view). */
export function ProductCardList({ product, className }: ProductCardListProps) {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const inWishlist = useAppSelector((s) => s.wishlist.products.some((p) => p.id === product.id))
  const isOutOfStock = product.stock === 0

  const handleAdd = () => {
    if (isOutOfStock) return
    dispatch(addItem({ product }))
    toast.success('Added to cart', product.name)
    dispatch(setDrawerOpen(true))
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card sm:gap-5', className)}
    >
      <Link to={`/product/${product.slug}`} className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-44 sm:w-44">
        <SmartImage
          src={getProductImage(product)}
          fallbackSrc={product.slug ? `/new-img/${product.slug}.png` : null}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {product.isAiRecommended && (
          <Badge variant="accent" className="absolute left-2 top-2">
            <Sparkles className="size-3" /> AI
          </Badge>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">{product.brand}</span>
            <Link to={`/product/${product.slug}`}>
              <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{product.name}</h3>
            </Link>
            <p className="mt-1 line-clamp-2 hidden text-xs text-muted-foreground sm:block">{product.shortDescription}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(toggleWishlist(product))
              toast.info(inWishlist ? 'Removed from wishlist' : 'Added to wishlist', product.name)
            }}
            aria-label="Toggle wishlist"
            className={cn('flex size-9 shrink-0 items-center justify-center rounded-full border border-border transition-colors', inWishlist ? 'text-destructive' : 'text-muted-foreground hover:text-destructive')}
          >
            <Heart className={cn('size-4', inWishlist && 'fill-destructive')} />
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <RatingStars rating={product.rating} size={13} />
          <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          <span>({formatNumber(product.ratingCount)})</span>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
          <PriceTag offerPrice={product.offerPrice} mrp={product.mrp} discount={product.discount} />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { dispatch(toggleWishlist(product)); toast.info('Added to wishlist') }}>
              Wishlist
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={isOutOfStock}>
              <ShoppingBag className="size-4" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
