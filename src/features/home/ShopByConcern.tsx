import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame, Droplets, Sun, ShieldAlert, Sparkles, Feather } from 'lucide-react'

export function ShopByConcern() {
  const CONCERNS = [
    { concern: 'acne', label: 'Acne & Blemishes', icon: Flame, tag: 'BHA & Niacinamide' },
    { concern: 'dryness', label: 'Dry Skin & Barrier Repair', icon: Droplets, tag: 'Ceramides & Hyaluronic' },
    { concern: 'oiliness', label: 'Oily & Congested Pores', icon: Sun, tag: 'Salicylic & Zinc' },
    { concern: 'sensitivity', label: 'Sensitive & Redness', icon: ShieldAlert, tag: 'Centella Cica Actives' },
    { concern: 'hair-fall', label: 'Hair Fall & Scalp Care', icon: Sparkles, tag: 'Rosemary & Biotin' },
    { concern: 'dandruff', label: 'Flakes & Scalp Balance', icon: Feather, tag: 'Tea Tree & Salicylic' },
  ]

  return (
    <section className="bg-gradient-to-b from-[#FAFAFA]/80 via-white to-[#FAFAFA]/40 py-20 border-y border-[#F1F3F5]">
      <div className="container-page space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">Targeted Formulations</span>
          <h2 className="font-serif text-3xl font-normal text-[#111111] sm:text-4xl tracking-tight">Shop by Skin & Scalp Concern</h2>
          <p className="text-xs text-[#6B7280] font-light">Engineered precision formulas for targeted skin concerns and barrier repair.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CONCERNS.map(({ concern, label, icon: Icon, tag }, i) => (
            <motion.div
              key={concern}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to={`/shop?concern=${concern}`}
                className="group flex flex-col justify-between rounded-2xl border border-[#F1F3F5] bg-white p-6 shadow-2xs transition-all duration-300 hover:shadow-xl hover:shadow-black/4 hover:-translate-y-1.5 hover:border-[#E5E7EB] h-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#FAFAFA] border border-[#F1F3F5] text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] bg-[#FAFAFA] px-2.5 py-1 rounded-full border border-[#F1F3F5]">
                    {tag}
                  </span>
                </div>

                <div className="pt-6 space-y-1">
                  <h3 className="font-serif text-base font-normal text-[#111111] group-hover:text-slate-700 transition-colors">
                    {label}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#111111] pt-1 group-hover:translate-x-1.5 transition-transform">
                    <span>View Actives</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
