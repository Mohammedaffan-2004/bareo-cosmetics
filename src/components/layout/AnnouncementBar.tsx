import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Truck, ShieldCheck, Sparkles } from 'lucide-react'

const ANNOUNCEMENTS = [
  {
    id: 'shipping',
    icon: Truck,
    primaryDesktop: 'FREE EXPRESS SHIPPING',
    secondaryDesktop: 'On orders above ₹499',
    primaryMobile: 'FREE EXPRESS SHIPPING',
    secondaryMobile: 'Orders above ₹499',
  },
  {
    id: 'formulated',
    icon: ShieldCheck,
    primaryDesktop: 'DERMATOLOGIST-FORMULATED CARE',
    secondaryDesktop: 'Clean & Cruelty-Free',
    primaryMobile: 'DERMATOLOGIST-FORMULATED',
    secondaryMobile: '100% Clean',
  },
  {
    id: 'ai-assessment',
    icon: Sparkles,
    primaryDesktop: 'PERSONALIZED SKIN ANALYSIS',
    secondaryDesktop: 'AI Dermal Assessment',
    primaryMobile: 'AI SKIN ASSESSMENT',
    secondaryMobile: 'Dermal Match',
  },
]

export function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [prefersReducedMotion])

  const current = ANNOUNCEMENTS[index]
  const Icon = current.icon

  return (
    <div className="bg-[#172126] text-[#DCE6E9] flex h-[34px] items-center justify-center px-3 border-b border-white/10 select-none w-full max-w-full text-center overflow-hidden z-50">
      <div className="relative flex items-center justify-center w-full max-w-4xl h-full mx-auto overflow-hidden">
        {prefersReducedMotion ? (
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] tracking-[0.08em] whitespace-nowrap">
            <Truck className="size-3.5 text-[#167C86] shrink-0" />
            <span className="font-bold text-white uppercase tracking-[0.1em]">FREE EXPRESS SHIPPING</span>
            <span className="text-[#7A8A91] font-normal mx-1">•</span>
            <span className="text-[#DCE6E9]">On orders above ₹499</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] tracking-[0.08em] whitespace-nowrap"
            >
              <Icon className="size-3.5 text-[#167C86] shrink-0" />
              
              {/* DESKTOP VIEW */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="font-bold text-white uppercase tracking-[0.1em]">
                  {current.primaryDesktop}
                </span>
                <span className="text-[#7A8A91] font-normal mx-1">•</span>
                <span className="text-[#DCE6E9] font-normal tracking-[0.05em]">
                  {current.secondaryDesktop}
                </span>
              </div>

              {/* MOBILE VIEW (Single Line Compact) */}
              <div className="flex sm:hidden items-center gap-1">
                <span className="font-bold text-white uppercase tracking-[0.08em] text-[10px]">
                  {current.primaryMobile}
                </span>
                <span className="text-[#7A8A91] font-normal mx-0.5">•</span>
                <span className="text-[#DCE6E9] font-normal text-[9.5px]">
                  {current.secondaryMobile}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
