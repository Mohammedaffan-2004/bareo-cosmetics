import { motion, useReducedMotion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Activity, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AiTeaser() {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const PROCESS_STEPS = [
    {
      code: '01',
      title: 'ASSESS',
      desc: 'Skin profile, concerns & lifestyle telemetry',
    },
    {
      code: '02',
      title: 'INTERPRET',
      desc: 'Barrier needs & routine priorities',
    },
    {
      code: '03',
      title: 'CURATE',
      desc: 'Personalized AM / PM formulation routine',
    },
  ]

  const PREVIEW_METRICS = [
    { label: 'HYDRATION', score: 86 },
    { label: 'BARRIER', score: 82 },
    { label: 'OIL BALANCE', score: 78 },
    { label: 'SENSITIVITY', score: 91 },
  ]

  return (
    <section className="container-page py-16 sm:py-20 border-b border-[#DCE6E9]">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-12"
      >
        {/* Main Editorial Split Composition (Open Layout) */}
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Left Column: BAREO Editorial Statement */}
          <div className="space-y-6 lg:col-span-6">
            <div className="space-y-1.5">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E9] bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#172126] shadow-2xs">
                <span className="text-[#167C86]">✦</span> BAREO / 003 · DERMAL INTELLIGENCE
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7A8A91] block">
                PERSONAL ROUTINE INDEX / 003
              </span>
            </div>

            {/* Dominant Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.15] text-[#172126] tracking-tight">
              Your skin is individual.{' '}
              <span className="text-[#167C86] block sm:inline">Your routine should be too.</span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm text-[#52636B] leading-relaxed font-normal max-w-xl">
              Understand your skin profile, identify its routine priorities, and discover BAREO products selected around what your skin actually needs.
            </p>

            {/* Action CTA */}
            <div className="space-y-2 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/skin-analysis')}
                className="rounded-xl px-8 h-12 text-xs font-semibold bg-[#172126] text-white hover:bg-[#253239] border border-[#172126] shadow-2xs min-h-[44px] cursor-pointer"
              >
                Start Dermal Assessment <ArrowRight className="size-4 ml-2 text-[#167C86]" />
              </Button>
              <p className="text-[11px] text-[#7A8A91] font-normal tracking-wide">
                ~60 seconds · Photo optional
              </p>
            </div>
          </div>

          {/* Right Column: Physical Formulation Report Preview Sheet */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[#DCE6E9] bg-[#EDF6F8] p-5 sm:p-7 shadow-2xs space-y-4">
              {/* Outer Stage Header */}
              <div className="flex items-center justify-between text-[9px] font-bold tracking-widest text-[#7A8A91] uppercase border-b border-[#DCE6E9] pb-3">
                <span className="flex items-center gap-1.5 text-[#167C86]">
                  <Activity className="size-3" /> DERMAL INTELLIGENCE REPORT
                </span>
                <span className="bg-white border border-[#DCE6E9] px-2.5 py-0.5 rounded-full text-[#172126] shadow-2xs">
                  SAMPLE PREVIEW
                </span>
              </div>

              {/* Physical Report Sheet Surface */}
              <div className="rounded-xl border border-[#DCE6E9] bg-white p-5 sm:p-6 space-y-4 shadow-2xs">
                {/* Profile & Score Clinical Summary */}
                <div className="flex items-start justify-between pb-3 border-b border-[#DCE6E9]/60 gap-4">
                  <div className="space-y-1">
                    <div>
                      <span className="text-[9px] font-bold text-[#7A8A91] uppercase tracking-widest block">
                        DERMAL PROFILE
                      </span>
                      <p className="text-xs font-semibold text-[#172126]">Combination · Sensitive</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#7A8A91] uppercase tracking-widest block">
                        PRIMARY PRIORITY
                      </span>
                      <p className="text-xs text-[#52636B] font-normal">Barrier resilience & moisture retention</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[#167C86] uppercase tracking-widest block">
                        ROUTINE DIRECTION
                      </span>
                      <p className="text-xs font-semibold text-[#167C86]">Hydrate · Repair · Protect</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 bg-[#F6FAFB] border border-[#DCE6E9] px-3.5 py-2 rounded-xl">
                    <span className="text-[9px] font-bold text-[#167C86] uppercase tracking-widest block">
                      DERMAL SCORE
                    </span>
                    <div className="flex items-baseline justify-end gap-0.5 font-serif mt-0.5">
                      <span className="text-2xl font-bold text-[#172126]">84</span>
                      <span className="text-xs text-[#7A8A91] font-sans font-normal">/100</span>
                    </div>
                  </div>
                </div>

                {/* 4 Quiet Horizontal Indicators */}
                <div className="space-y-2 pt-1">
                  {PREVIEW_METRICS.map((m) => (
                    <div key={m.label} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#7A8A91] tracking-wider text-[9px]">{m.label}</span>
                        <span className="font-serif font-bold text-[#172126]">{m.score}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#EDF6F8]">
                        <div className="h-full rounded-full bg-[#167C86]" style={{ width: `${m.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formulation Output & Routine Lines */}
                <div className="pt-3 border-t border-[#DCE6E9]/60 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-[9px] font-bold tracking-widest text-[#7A8A91] uppercase">
                    <span>ROUTINE PRIORITIES</span>
                    <span className="text-[#167C86]">01 / HYDRATE · 02 / REPAIR · 03 / PROTECT</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 text-[#52636B] bg-[#F6FAFB] p-2 rounded-lg border border-[#DCE6E9]/60">
                      <Droplets className="size-3 text-[#167C86] shrink-0" />
                      <span><strong className="text-[#172126] font-semibold">AM:</strong> Cleanse · Hydrate · Protect</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#52636B] bg-[#F6FAFB] p-2 rounded-lg border border-[#DCE6E9]/60">
                      <ShieldCheck className="size-3 text-[#167C86] shrink-0" />
                      <span><strong className="text-[#172126] font-semibold">PM:</strong> Cleanse · Treat · Repair</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="flex items-center justify-between text-[9px] font-bold tracking-widest text-[#7A8A91] uppercase pt-0.5">
                <span>BAREO / ROUTINE MATCH</span>
                <span className="text-[#167C86]">6 ACTIVE INGREDIENTS IDENTIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Editorial Process Line (Open Columns) */}
        <div className="pt-8 border-t border-[#DCE6E9] grid grid-cols-1 gap-8 sm:grid-cols-3">
          {PROCESS_STEPS.map((step) => (
            <div key={step.code} className="flex flex-col space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest">
                <span className="font-serif text-[#167C86]">{step.code} —</span>
                <span className="text-[#172126] uppercase">{step.title}</span>
              </div>
              <p className="text-xs text-[#52636B] font-normal leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Subtle Editorial Catalogue Transition to Formulations */}
        <div className="pt-6 text-center border-t border-[#DCE6E9]/60 text-[10px] font-bold uppercase tracking-widest text-[#7A8A91]">
          <span>ROUTINE MATCH · </span>
          <span className="text-[#52636B]">Personalized priorities → considered products</span>
        </div>
      </motion.div>
    </section>
  )
}


