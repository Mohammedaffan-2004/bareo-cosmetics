import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Camera, Cpu, Sparkle, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AiTeaser() {
  const navigate = useNavigate()

  const STEPS = [
    { num: '01', icon: Camera, title: 'Take Selfie & Quiz', desc: 'Capture or upload a clear photo & answer 5 quick questions.' },
    { num: '02', icon: Cpu, title: 'AI Skin Analysis', desc: 'Our algorithm evaluates barrier health, oil balance & moisture.' },
    { num: '03', icon: Sparkle, title: 'Custom Routine', desc: 'Receive a step-by-step AM & PM routine designed for your skin.' },
    { num: '04', icon: ShoppingBag, title: 'Matched Products', desc: 'Get precision Bareo product recommendations that fit your budget.' },
  ]

  return (
    <section className="container-page py-16 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#FAF5FF] via-[#FAF5FF]/60 to-white p-8 sm:p-14 shadow-xs"
      >
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: AI Intro */}
          <div className="space-y-6 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/30 bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#7C3AED] shadow-2xs">
              <Sparkles className="size-3.5 text-[#7C3AED]" /> Bareo AI Skin Intelligence
            </div>

            <h2 className="font-serif text-3xl font-normal leading-tight text-[#111111] sm:text-4xl tracking-tight">
              Your skin, decoded by AI in <span className="italic font-serif">90 seconds.</span>
            </h2>

            <p className="text-sm text-[#4B5563] leading-relaxed font-normal sm:text-base">
              Skip the guesswork. Our AI dermal diagnostic evaluates your skin barrier, oil balance, and active concerns to build your personalized AM/PM active routine.
            </p>

            <div className="pt-2">
              <Button size="lg" variant="ai" onClick={() => navigate('/skin-analysis')} className="rounded-xl px-8 h-12 text-xs font-semibold shadow-xs min-h-[44px]">
                <Sparkles className="size-4 mr-2" /> Start AI Skin Assessment <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Column: 4 Step Process Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6">
            {STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs flex flex-col gap-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#7C3AED]/30">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#FAF5FF] border border-[#7C3AED]/20 text-[#7C3AED]">
                    <Icon className="size-4.5" />
                  </div>
                  <span className="font-serif text-xs font-bold text-[#9CA3AF]">{num}</span>
                </div>
                <h3 className="font-serif text-sm font-semibold text-[#111111]">{title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
