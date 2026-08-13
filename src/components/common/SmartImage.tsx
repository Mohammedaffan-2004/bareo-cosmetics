import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'

export const BAREO_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80', // Minimal products
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80', // Botanical actives
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80', // Clinic formulation
  'https://images.unsplash.com/photo-1512290900676-26c2a4d48dc1?auto=format&fit=crop&w=1200&q=80', // Laboratory science
  '/images/products/bareo-cica-serum.png', // Local fallback asset
]

interface SmartImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  alt?: string
  fallbackSrc?: string
  className?: string
  containerClassName?: string
  aspectRatio?: string
  category?: string
}

/**
 * SmartImage Component — Production-grade image fault tolerance.
 * - Soft Skeleton loading state
 * - Automatic error recovery (never renders browser broken image icon)
 * - Smooth fade-in animation on load
 * - Fallback placeholder pool matching Bareo clinical aesthetic
 */
export function SmartImage({
  src,
  alt = 'Bareo Skincare Formulation',
  fallbackSrc,
  className,
  containerClassName,
  aspectRatio,
  category,
  ...props
}: SmartImageProps) {
  // Pick suitable placeholder based on category or random index
  const getFallbackPlaceholder = (): string => {
    if (fallbackSrc) return fallbackSrc
    if (category === 'Ingredients') return BAREO_PLACEHOLDERS[1]
    if (category === 'Routines') return BAREO_PLACEHOLDERS[0]
    if (category === 'Skin Science') return BAREO_PLACEHOLDERS[3]
    if (category === 'Sun Care') return BAREO_PLACEHOLDERS[2]
    return BAREO_PLACEHOLDERS[0]
  }

  const resolveInitialSrc = (input?: string | null): string => {
    if (!input || input.trim() === '' || input === 'undefined' || input === 'null') {
      return getFallbackPlaceholder()
    }
    return input
  }

  const [imgSrc, setImgSrc] = useState<string>(() => resolveInitialSrc(src))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  const [fallbackAttempted, setFallbackAttempted] = useState<boolean>(false)

  useEffect(() => {
    if (!src || src.trim() === '' || src === 'undefined' || src === 'null') {
      setImgSrc(getFallbackPlaceholder())
      setIsLoading(false)
      setHasError(false)
    } else {
      setImgSrc(src)
      setIsLoading(true)
      setHasError(false)
      setFallbackAttempted(false)
    }
  }, [src, fallbackSrc])

  const handleError = () => {
    if (!fallbackAttempted) {
      setFallbackAttempted(true)
      const replacement = getFallbackPlaceholder()
      if (replacement !== imgSrc) {
        setImgSrc(replacement)
        setIsLoading(true)
        return
      }
    }
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#FAFAFA]',
        aspectRatio,
        containerClassName
      )}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-[#F3F4F6] via-[#E5E7EB] to-[#F3F4F6]" />
      )}

      {/* SVG Container Fallback if Image Completely Fails */}
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#FAF7F2] p-4 text-center border border-[#EBE5D8]">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white border border-[#EBE5D8] shadow-2xs mb-2">
            <span className="font-serif text-sm font-bold text-[#111111]">B</span>
          </div>
          <span className="font-serif text-xs font-semibold text-[#111111]">Bareo Cosmetics</span>
          <span className="text-[10px] text-[#9CA3AF] mt-0.5 font-sans">Science for Everyday Skin</span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300 ease-in-out',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          {...props}
        />
      )}
    </div>
  )
}
