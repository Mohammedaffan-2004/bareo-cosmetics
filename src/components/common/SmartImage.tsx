import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/utils'

export interface SmartImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null
  alt?: string
  fallbackSrc?: string | null
  className?: string
  containerClassName?: string
  aspectRatio?: string
  category?: string
  priority?: boolean
  loading?: 'lazy' | 'eager'
  fetchPriority?: 'high' | 'low' | 'auto'
  decoding?: 'async' | 'sync' | 'auto'
}

/**
 * SmartImage Component — Production-grade performance & image fault tolerance.
 * - Native WebP support with PNG fallback
 * - Priority / Eager loading for LCP Hero images
 * - Warm Ivory (#FAF7F2) intentional neutral placeholder for products missing primary packshots
 * - Automatic error recovery (no broken image icons or false product substitutions)
 */
export function SmartImage({
  src,
  alt = 'Bareo Skincare Product',
  fallbackSrc,
  className,
  containerClassName,
  aspectRatio,
  category,
  priority = false,
  loading: customLoading,
  fetchPriority: customFetchPriority,
  decoding = 'async',
  width,
  height,
  ...props
}: SmartImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)

  const resolveInitialSrc = (input?: string | null): string | null => {
    if (!input || input.trim() === '' || input === 'undefined' || input === 'null') {
      return fallbackSrc && fallbackSrc.trim() !== '' ? fallbackSrc : null
    }
    return input
  }

  const [imgSrc, setImgSrc] = useState<string | null>(() => resolveInitialSrc(src))
  const [isLoading, setIsLoading] = useState<boolean>(() => !!resolveInitialSrc(src))
  const [hasError, setHasError] = useState<boolean>(false)
  const [fallbackAttempted, setFallbackAttempted] = useState<boolean>(false)

  useEffect(() => {
    const nextSrc = resolveInitialSrc(src)
    setImgSrc(nextSrc)
    setHasError(false)
    setFallbackAttempted(false)

    if (!nextSrc) {
      setIsLoading(false)
    } else if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [src, fallbackSrc])

  const handleError = () => {
    if (!fallbackAttempted && fallbackSrc && fallbackSrc !== imgSrc) {
      setFallbackAttempted(true)
      setImgSrc(fallbackSrc)
      setIsLoading(true)
      return
    }
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const imageLoading = priority ? 'eager' : (customLoading || 'lazy')
  const imageFetchPriority = priority ? 'high' : (customFetchPriority || 'auto')

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#FAF7F2] flex items-center justify-center',
        aspectRatio,
        containerClassName
      )}
    >
      {/* Warm Ivory Shimmer Placeholder */}
      {isLoading && imgSrc && (
        <div className="absolute inset-0 z-10 bg-[#FAF7F2] flex items-center justify-center">
          <div className="size-full animate-pulse bg-gradient-to-r from-[#FAF7F2] via-[#F5EFF6]/60 to-[#FAF7F2]" />
        </div>
      )}

      {/* Premium Intentional Bareo Neutral Stage (When no primary packshot exists) */}
      {!imgSrc || hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[#FAF7F2] p-4 text-center border border-[#EBE5D8]/60">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white border border-[#E5E7EB] shadow-2xs mb-1.5">
            <span className="font-serif text-base font-bold text-[#111111] tracking-wider">B</span>
          </div>
          <span className="font-serif text-xs font-semibold text-[#111111] tracking-wide">Bareo Cosmetics</span>
          <span className="text-[10px] text-[#9CA3AF] font-sans mt-0.5">Packshot Coming Soon</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading={imageLoading}
          fetchPriority={imageFetchPriority}
          decoding={decoding}
          className={cn(
            'h-full w-full object-contain transition-opacity duration-200 ease-out',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          {...props}
        />
      )}
    </div>
  )
}
