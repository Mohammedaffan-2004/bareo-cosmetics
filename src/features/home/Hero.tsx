import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Check } from 'lucide-react'
import type { HomeBanner } from '@/types'
import { Button } from '@/components/ui/button'

interface HeroProps {
  banner?: HomeBanner
}

/**
 * Bareo Immersive Homepage Hero Stage — Premium Clinical D2C Art-Directed Canvas
 * - Continuous Pale Icy-Blue Stage (#F0F6F9)
 * - Hero Desktop Height Target: 520px – 560px (Dense, spacious, luxury proportions)
 * - 100% Seamless Integration: Zero vertical split lines, zero cards, zero box borders
 * - Absolute Visual Positioning + Double Gradient Masking for flawless left-edge melt
 * - Real React Typography (62px Editorial Serif Heading), 46px Pill CTAs & Integrated Benefits
 */
export function Hero({ banner: _banner }: HeroProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return (
    <section
      className="relative overflow-hidden bg-[#F0F6F9] border-b border-slate-200/70 min-h-[500px] sm:min-h-[530px] lg:min-h-[560px] flex items-center py-6 sm:py-8 lg:py-0"
      aria-label="Hero Stage"
    >
      {/* Right Product Scene — Positioned absolutely on desktop to eliminate grid splits */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-[58%] lg:w-[62%] pointer-events-none overflow-hidden hidden sm:block">
        <picture className="contents">
          <source srcSet="/editorial/home/bareo-home-hero.webp" type="image/webp" />
          <img
            src="/editorial/home/bareo-home-hero-v2.png"
            alt="Bareo Skincare Actives Collection"
            loading="eager"
            // @ts-expect-error - fetchPriority attribute support
            fetchpriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center lg:object-right transition-transform duration-700 ease-out lg:scale-108"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 28%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 28%, black 100%)'
            }}
          />
        </picture>
        {/* Soft edge blend overlay so lighting flows naturally into left canvas */}
        <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#F0F6F9] via-[#F0F6F9]/70 to-transparent pointer-events-none" />
      </div>

      <div className="container-page relative z-10 grid items-center lg:grid-cols-12 w-full py-4 lg:py-0">
        {/* Left Column: Content Area Layered over left canvas */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5 lg:col-span-6 xl:col-span-5 max-w-[500px] z-10"
        >
          {/* Subtle Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#111111] shadow-2xs backdrop-blur-xs">
            <span className="text-[#7C3AED]">✦</span> DERMATOLOGIST FORMULATED
          </div>

          {/* Large Editorial Heading */}
          <h1 className="font-serif text-4xl font-normal leading-[1.00] tracking-tight text-[#111111] sm:text-5xl lg:text-[62px]">
            Science for <br />
            <span className="italic font-serif">Everyday Skin.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base text-[#334155] leading-relaxed font-normal sm:text-[17px] max-w-[450px]">
            Clean, high-performance actives designed by dermatologists for real, everyday results.
          </p>

          {/* Action Pill Buttons (46px height) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                className="h-11.5 w-full sm:w-auto rounded-full px-7 text-sm font-semibold shadow-2xs min-h-[46px] bg-[#111111] text-white hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.99]"
              >
                Shop Bareo Actives <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <Link to="/skin-analysis" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="ai"
                className="h-11.5 w-full sm:w-auto rounded-full px-7 text-sm font-semibold shadow-2xs min-h-[46px] bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all hover:scale-[1.02] active:scale-[0.99]"
              >
                Start AI Assessment <Sparkles className="size-4 ml-1.5 text-white/90" />
              </Button>
            </Link>
          </div>

          {/* Integrated Benefits Strip with Divider */}
          <div className="pt-4 border-t border-slate-300/50">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-[#111111]">
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#059669]" />
                <span>Derm Approved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#059669]" />
                <span>100% Clean Actives</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#059669]" />
                <span>Fragrance Free</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Product Visual Scene (Rendered under content on mobile screens < 640px) */}
        <div className="sm:hidden relative w-full h-[320px] mt-6 overflow-hidden rounded-2xl">
          <img
            src="/editorial/home/bareo-home-hero-v2.png"
            alt="Bareo Skincare Actives Collection"
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}

