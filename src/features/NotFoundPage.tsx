import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex size-20 items-center justify-center rounded-3xl bg-[#FAF7F2] border border-[#E5E7EB] text-[#111111]"
      >
        <Compass className="size-10 text-[#111111]" />
      </motion.div>
      <h1 className="mt-6 font-serif text-5xl sm:text-6xl font-normal text-[#111111] tracking-tight">404</h1>
      <p className="mt-2 font-serif text-xl text-[#111111]">Page Not Found</p>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-[#6B7280] font-light leading-relaxed">
        The page you are looking for may have been moved or updated. Explore our dermatologist-formulated collection or return home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black">
          <Link to="/">Back to Home</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl border-[#E5E7EB] text-xs font-semibold text-[#111111]">
          <Link to="/shop">Explore Products <ArrowRight className="size-3.5 ml-1" /></Link>
        </Button>
      </div>
    </div>
  )
}
