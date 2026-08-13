import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Leaf, FlaskConical } from 'lucide-react'
import type { HomeBanner } from '@/types'
import { Button } from '@/components/ui/button'

interface HeroProps {
  banner?: HomeBanner
}

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
    <section className="relative overflow-hidden bg-[#FAF7F2] py-10 lg:py-16 border-b border-[#E5E7EB]" aria-label="Hero Stage">
      <div className="container-page grid items-center gap-12 lg:grid-cols-12">
        {/* Left Typography Column */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 lg:col-span-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#111111] shadow-xs">
            <Sparkles className="size-3.5 text-[#7C3AED]" /> Dermatologist Formulated • From ₹199
          </div>

          <h1 className="font-serif text-4xl font-normal leading-[1.12] tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
            Science for <br className="hidden sm:inline" />
            <span className="italic font-serif">Everyday Skin.</span>
          </h1>

          <p className="max-w-xl text-base text-[#4B5563] leading-relaxed font-normal sm:text-lg">
            Clean, high-performance actives formulated by dermatologists for everyday skin. Proven clinical results at honest, affordable prices starting from ₹199.
          </p>

          {/* Dual CTAs: Commerce Solid Obsidian (#111111) + AI Solid Mineral Lavender (#7C3AED) */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/shop" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="h-12 w-full sm:w-auto rounded-xl px-7 text-sm font-semibold shadow-xs min-h-[44px]">
                Shop Bareo Actives <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link to="/skin-analysis" className="w-full sm:w-auto">
              <Button size="lg" variant="ai" className="h-12 w-full sm:w-auto rounded-xl px-7 text-sm font-semibold shadow-xs min-h-[44px]">
                <Sparkles className="size-4 mr-1" /> Start AI Assessment
              </Button>
            </Link>
          </div>

          {/* Minimal Trust Badges Strip */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#E5E7EB] text-xs font-medium text-[#111111]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#059669]" />
              <span>Derm Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="size-4 text-[#059669]" />
              <span>100% Clean Actives</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="size-4 text-[#059669]" />
              <span>Fragrance Free</span>
            </div>
          </div>
        </motion.div>

        {/* Right Hero Product Stage with Floating Motion */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] aspect-square p-6 flex items-center justify-center shadow-xs">
            <motion.img
              src="/images/products/bareo-cica-serum.png"
              alt="Bareo Cica & Niacinamide Calming Serum"
              animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full w-full object-contain"
            />

            {/* Soft Floating Active Ingredient Pills */}
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, -5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-6 left-6 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-[#111111] shadow-xs border border-[#E5E7EB] backdrop-blur-md"
            >
              10% Niacinamide
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, 5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-6 right-6 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-[#111111] shadow-xs border border-[#E5E7EB] backdrop-blur-md"
            >
              5% Centella Cica
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? {} : { y: [0, -4, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute bottom-6 left-6 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-[#111111] shadow-xs border border-[#E5E7EB] backdrop-blur-md"
            >
              pH 5.5 Balanced
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

