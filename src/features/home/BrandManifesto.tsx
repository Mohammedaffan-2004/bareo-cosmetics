import { motion } from 'framer-motion'
import { ShieldCheck, Sparkle, Target } from 'lucide-react'

export function BrandManifesto() {
  const PRINCIPLES = [
    {
      index: '01',
      tag: 'FORMULATE',
      title: 'Calculated Active Percentages',
      description: 'Clean active ingredients formulated at exact clinical concentrations without filler compounds.',
    },
    {
      index: '02',
      tag: 'SIMPLIFY',
      title: 'Barrier-First Routines',
      description: 'Calculated routines designed around skin-barrier balance and lipid integrity.',
    },
    {
      index: '03',
      tag: 'PERSONALIZE',
      title: 'Precision AI Matching',
      description: 'Personalized dermal intelligence recommendations tailored to individual skin needs.',
    },
  ]

  return (
    <section className="bg-white py-16 sm:py-22 border-y border-[#DCE6E9]">
      <div className="container-page space-y-12">
        {/* Top Header & Statement Stage */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="space-y-4 lg:col-span-7">
            {/* Signature Catalogue Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E9] bg-[#F6FAFB] px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#172126] shadow-2xs">
              <span className="text-[#167C86]">✦</span> BAREO / 001 · THE PHILOSOPHY
            </div>

            {/* Editorial Playfair Display Statement */}
            <h2 className="font-serif text-3xl font-normal leading-[1.10] tracking-tight text-[#172126] sm:text-4xl lg:text-[44px]">
              Better formulations. <br className="hidden sm:inline" />
              Better decisions. <br className="hidden sm:inline" />
              <span className="italic font-serif text-[#167C86]">Better everyday skin.</span>
            </h2>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <p className="text-sm text-[#52636B] leading-relaxed font-normal sm:text-base">
              BAREO brings dermatologist-led formulation thinking into everyday skincare — focused on exact active percentages, barrier resilience, and calculated routines.
            </p>
            
            {/* Clinical Dermal Proof Indicators */}
            <div className="flex items-center gap-6 pt-3 text-xs font-semibold text-[#172126] border-t border-[#DCE6E9]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#167C86]" /> Derm Tested
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkle className="size-3.5 text-[#167C86]" /> 100% Clean Actives
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="size-3.5 text-[#167C86]" /> Zero Fragrance
              </span>
            </div>
          </div>
        </div>

        {/* Signature Editorial Catalogue Divider */}
        <div className="flex items-center justify-between pt-2 border-t border-[#DCE6E9]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-[#167C86]" /> FORMULATION ARCHIVE · VOL. 01
          </span>
          <span className="text-[10px] font-mono text-[#7A8A91]">BAREO / DERMAL INDEX</span>
        </div>

        {/* Bottom Editorial Index Strip: 3 Clinical Principles */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PRINCIPLES.map(({ index, tag, title, description }, i) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="space-y-3 p-6 sm:p-7 rounded-2xl bg-[#F6FAFB] border border-[#DCE6E9] transition-all duration-300 hover:border-[#172126]/30 hover:bg-white hover:shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-3">
                <span className="font-serif text-sm font-bold text-[#167C86]">{index}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91]">{tag}</span>
              </div>
              <h3 className="font-serif text-lg font-normal leading-snug text-[#172126]">{title}</h3>
              <p className="text-xs text-[#52636B] leading-relaxed font-normal">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
