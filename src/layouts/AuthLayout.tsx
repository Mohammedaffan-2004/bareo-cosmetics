import { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { motion, useReducedMotion, useSpring, useMotionValue } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Toaster } from '@/components/common/Toaster'

/**
 * Bareo Authentication Layout — Quiet Luxury Split-Screen Editorial.
 * Left ~48%: Pure Ivory Form Workspace
 * Right ~52%: Full-Height Luxury Editorial Skincare Environment (100vh)
 */
export function AuthLayout() {
  const shouldReduceMotion = useReducedMotion()

  // Mouse Parallax Motion Values (Desktop Only: max X 4px, max Y 3px)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 90, damping: 22 })
  const springY = useSpring(mouseY, { stiffness: 90, damping: 22 })

  const [isFinePointer, setIsFinePointer] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(pointer: fine)')
      setIsFinePointer(media.matches)
      const handler = (e: MediaQueryListEvent) => setIsFinePointer(e.matches)
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !isFinePointer) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5 // -0.5 to 0.5
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5 // -0.5 to 0.5
    mouseX.set(relativeX * 8) // max +/- 4px
    mouseY.set(relativeY * 6) // max +/- 3px
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#FAF7F2]">

      {/* RIGHT HERO VISUAL PANEL (~52% Desktop — Full-Height Luxury Editorial Environment) */}
      <aside
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative hidden lg:block lg:w-[52%] h-screen sticky top-0 overflow-hidden bg-[#EBE5DC]"
      >
        {/* Cinematic Animated Image Container */}
        <motion.div
          style={shouldReduceMotion || !isFinePointer ? undefined : { x: springX, y: springY }}
          initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.025 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, scale: 1 }
              : {
                opacity: 1,
                scale: [1, 1.015, 1],
              }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                opacity: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] },
                scale: {
                  duration: 22,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                },
              }
          }
          className="absolute inset-[-8px] size-[calc(100%+16px)] pointer-events-none"
        >
          <img
            src="https://res.cloudinary.com/j9yeiuld/image/upload/v1787291067/loginimg.png"
            alt="BAREO Luxury Editorial Skincare Atmosphere"
            className="size-full object-cover object-center select-none"
            loading="eager"
            decoding="async"
          />
        </motion.div>

        {/* Very Subtle Warm-Ivory Atmospheric Tint (Clean & Luminescent) */}
        <div className="absolute inset-0 bg-[#FAF7F2]/[0.05] pointer-events-none" />

        {/* Subtle Magazine Floating Annotation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-10 left-10 lg:bottom-12 lg:left-12 z-10 space-y-2 text-left pointer-events-auto select-none"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-[#FAF7F2]/90 backdrop-blur-md px-3.5 py-1.5 shadow-2xs">
            <span className="size-1.5 rounded-full bg-[#167C86]" />
            <span className="text-[10px] font-bold tracking-widest text-[#172126] uppercase">
              SCIENCE FOR EVERYDAY SKIN
            </span>
          </div>
          <p className="text-xs text-[#2A3940] font-normal tracking-wide leading-relaxed pl-1 max-w-xs">
            Dermatologist-led formulations, made personal.
          </p>
        </motion.div>
      </aside>

      {/* LEFT AUTHENTICATION WORKSPACE (~48% Desktop — Warm Ivory Workspace) */}
      <main className="relative flex w-full lg:w-[48%] min-h-screen flex-col justify-between p-6 overflow-y-auto bg-[#FAF7F2] border-r border-[#DCE6E9]">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-[#52636B] hover:text-[#172126] transition-colors"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1 text-[#167C86]" />
            <span>Return to Store</span>
          </Link>

          {/* Desktop Brand Eyebrow */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-wider text-[#172126]">BAREO</span>
            <span className="h-3.5 w-px bg-[#DCE6E9]" />
            <span className="text-[9px] font-bold tracking-widest text-[#167C86] uppercase flex items-center gap-1">
              <Sparkles className="size-3 text-[#167C86]" /> INDEX / 001
            </span>
          </div>

          {/* Mobile Logo View */}
          <div className="lg:hidden flex flex-col items-end">
            <Logo />
            <span className="text-[8px] font-bold tracking-widest text-[#167C86] uppercase mt-0.5">
              PRODUCT INDEX / 001
            </span>
          </div>
        </div>

        {/* Auth Content Container (Centered with Editorial Spacing) */}
        <div className="my-auto mx-auto w-full max-w-[420px] py-8 sm:py-12">
          <Outlet />
        </div>

        {/* Footer Legal & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-[#7A8A91] pt-6 border-t border-[#DCE6E9] font-normal">
          <p>© {new Date().getFullYear()} Bareo Cosmetics. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#172126] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#172126] transition-colors">Terms of Service</a>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
