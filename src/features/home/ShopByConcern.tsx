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
    <section className="container-page py-16 sm:py-20 border-b border-[#DCE6E9]">
      <div className="space-y-12">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">Targeted Formulations</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight">Shop by Skin & Scalp Concern</h2>
          <p className="text-xs sm:text-sm text-[#52636B] font-normal">Engineered precision formulas for targeted skin concerns and barrier repair.</p>
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
                className="group flex flex-col justify-between rounded-2xl border border-[#DCE6E9] bg-white p-5 sm:p-6 shadow-2xs transition-all duration-300 hover:shadow-xs hover:border-[#167C86]/40 h-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#EDF6F8] border border-[#DCE6E9] text-[#167C86] group-hover:bg-[#172126] group-hover:text-white transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] bg-[#F6FAFB] px-2.5 py-1 rounded-full border border-[#DCE6E9]">
                    {tag}
                  </span>
                </div>

                <div className="pt-6 space-y-1">
                  <h3 className="font-serif text-base sm:text-lg font-normal text-[#172126] group-hover:text-[#167C86] transition-colors">
                    {label}
                  </h3>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#172126] group-hover:text-[#167C86] pt-1 transition-colors">
                    <span>View Actives</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
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
