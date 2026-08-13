import { Outlet, Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Toaster } from '@/components/common/Toaster'

/**
 * Bareo Authentication Layout — Quiet Luxury & Editorial Dermatology.
 * Restrained split-screen layout showcasing studio product formulation photography.
 */
export function AuthLayout() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-white">
      {/* LEFT BRAND PANEL (~45% Desktop) */}
      <aside className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-[#111111] p-10 text-white lg:flex xl:p-14 border-r border-[#111111]">
        {/* TOP BRAND HEADER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 space-y-1"
        >
          <span className="font-serif text-2xl font-semibold tracking-wider text-white block">BAREO</span>
          <span className="text-[10px] font-bold tracking-widest text-[#9CA3AF] uppercase block">
            SCIENCE FOR EVERYDAY SKIN.
          </span>
        </motion.div>

        {/* CENTER PRODUCT FORMULATION STAGE */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-[#171717] p-6 max-w-[280px] xl:max-w-[320px]"
          >
            <img
              src="/images/products/bareo-cica-serum.png"
              alt="Bareo Active Formulation"
              className="h-64 sm:h-72 w-full object-contain filter drop-shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 space-y-1"
          >
            <p className="font-serif text-lg text-white font-normal">Formulated with intention.</p>
            <p className="text-xs text-[#9CA3AF] font-light">Designed for everyday skin.</p>
          </motion.div>
        </div>

        {/* BOTTOM BRAND FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 flex items-center justify-between text-[11px] text-[#6B7280] pt-4 border-t border-white/10 font-light"
        >
          <span>Clinical Dermal Intelligence</span>
          <p>© {new Date().getFullYear()} Bareo Cosmetics.</p>
        </motion.div>
      </aside>

      {/* RIGHT AUTHENTICATION WORKSPACE (~55% Desktop) */}
      <main className="relative flex flex-1 flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto bg-white">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Store</span>
          </Link>

          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#6B7280]">
            <span>Assistance?</span>
            <a href="mailto:care@bareo.in" className="font-semibold text-[#111111] hover:underline">
              Contact Concierge
            </a>
          </div>
        </div>

        {/* Auth Content Area (Narrow ~380px-400px Container) */}
        <div className="my-auto mx-auto w-full max-w-[390px] py-8 sm:py-10">
          <Outlet />
        </div>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-xs text-[#9CA3AF] pt-6 border-t border-[#F3F4F6] font-light">
          <p>© {new Date().getFullYear()} Bareo Cosmetics. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#111111] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#111111] transition-colors">Terms of Service</a>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}
