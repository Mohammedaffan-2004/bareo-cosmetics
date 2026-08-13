import { motion } from 'framer-motion'
import { FlaskConical, Leaf, ShieldCheck } from 'lucide-react'

export function IngredientsSection() {
  const PILLARS = [
    {
      icon: FlaskConical,
      title: 'Science-Backed Actives',
      description: 'High-efficacy clinical ingredients formulated at exact therapeutic percentages with zero filler compounds.',
    },
    {
      icon: Leaf,
      title: 'Minimal Formulations',
      description: 'Zero synthetic fragrance, zero parabens, zero phthalates. Pure barrier repair ingredients that respect skin balance.',
    },
    {
      icon: ShieldCheck,
      title: 'Engineered for Indian Skin',
      description: 'Formulated specifically for tropical humidity, high UV index, and melanin-rich skin barrier resilience.',
    },
  ]

  return (
    <section className="container-page py-16">
      <div className="space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">The Bareo Standard</span>
          <h2 className="font-serif text-3xl font-normal text-[#111111] sm:text-4xl">Why Choose Bareo?</h2>
          <p className="text-sm text-[#6B7280]">Calculated simplicity for your everyday skin and hair routine.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-xs flex flex-col gap-4 text-center items-center"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#111111]">
                <Icon className="size-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#111111]">{title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed font-normal">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
