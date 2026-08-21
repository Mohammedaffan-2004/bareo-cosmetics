import React from 'react'
import type { Product } from '@/types'
import { cn } from '@/utils'
import { SmartImage } from '@/components/common/SmartImage'

export interface VisualConfig {
  /** Future visual architecture configuration (lighting, environment, formula identity) */
  theme?: string
  background?: string
  lighting?: string
  depth?: string
}

export interface ProductVisualStageProps {
  /** Optional product reference for taxonomy or future visual world mapping */
  product?: Partial<Product> | null
  /** Primary product packshot image URL */
  imageUrl?: string | null
  /** Image alt text */
  alt?: string
  /** Presentation variant: card (compact grid), detail (hero viewer), or hero (banner) */
  variant?: 'card' | 'detail' | 'hero'
  /** Outer container extra CSS classes */
  className?: string
  /** Container override class */
  containerClassName?: string
  /** Image inner element CSS classes */
  imageClassName?: string
  /** Inline style overrides for image (e.g. interactive zoom origin) */
  imageStyle?: React.CSSProperties
  /** Priority loading flag for LCP images */
  priority?: boolean
  /** Optional visual config object for future Formula Stories stage worlds */
  visualConfig?: VisualConfig
  /** Ref for interactive container (e.g. mouse tracking for zoom) */
  containerRef?: React.Ref<HTMLDivElement>
  /** Mouse move handler for interactive zoom */
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void
  /** Mouse leave handler to reset zoom */
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void
  /** Overlay elements (Badges, Floating Buttons, Out of Stock overlays) */
  children?: React.ReactNode
}

/**
 * ProductVisualStage Component — Standardized Presentation Layer for Bareo Product Packshots.
 * Encapsulates image framing, aspect ratio, neutral surface backgrounds, and stage overlays.
 * Decoupled from product business logic (pricing, cart, wishlist, badges).
 */
export function ProductVisualStage({
  product,
  imageUrl,
  alt = 'Bareo Skincare Product',
  variant = 'card',
  className,
  containerClassName,
  imageClassName,
  imageStyle,
  priority = false,
  visualConfig: _visualConfig,
  containerRef,
  onMouseMove,
  onMouseLeave,
  children,
}: ProductVisualStageProps) {
  const isCard = variant === 'card'
  const isDetail = variant === 'detail'

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        'relative aspect-square overflow-hidden bg-[#EDF6F8] border-[#DCE6E9] flex items-center justify-center',
        isCard && 'rounded-t-2xl border-b p-4',
        isDetail && 'rounded-3xl border p-6 sm:p-8',
        !isCard && !isDetail && 'rounded-2xl border p-4',
        containerClassName,
        className
      )}
    >
      {/* 1. Neutral Surface Environment Layer */}
      <div className="absolute inset-0 z-0 bg-[#EDF6F8] pointer-events-none" />

      {/* 2. Product Packshot Image Layer via SmartImage */}
      <SmartImage
        src={imageUrl}
        fallbackSrc={product?.slug ? `/new-img/${product.slug}.png` : null}
        alt={alt || product?.name || 'Bareo Product'}
        priority={priority}
        className={cn(
          'relative z-1 h-full w-full object-contain transition-transform duration-500 ease-out',
          isCard && 'group-hover:scale-103',
          imageClassName
        )}
        style={imageStyle}
      />

      {/* 3. Overlay Children (Badges, Wishlist Buttons, Out-of-Stock Status) */}
      {children}
    </div>
  )
}
