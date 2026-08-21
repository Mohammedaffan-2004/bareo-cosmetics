import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PreFooterStatement() {
  const navigate = useNavigate()

  return (
    <section className="bg-[#EDF6F8] py-16 sm:py-20 border-b border-[#DCE6E9]">
      <div className="container-page">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left Column: Main Editorial Statement */}
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E9] bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#172126] shadow-2xs">
                <span className="text-[#167C86]">✦</span> BAREO / CLINICAL FORMULATION STANDARD
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#7A8A91] block">
                FORMULATION INDEX · 004
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal leading-[1.15] text-[#172126] tracking-tight">
              Better formulations.{' '}
              <span className="block sm:inline">Better decisions.</span>{' '}
              <span className="text-[#167C86] block sm:inline">Better everyday skin.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#52636B] leading-relaxed font-normal max-w-xl">
              Discover formulations considered around your skin — or let BAREO's dermal intelligence help you find where to begin.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/skin-analysis')}
                className="rounded-xl px-7 h-12 text-xs font-semibold bg-[#172126] text-white hover:bg-[#253239] border border-[#172126] shadow-2xs min-h-[44px] cursor-pointer"
              >
                Start Dermal Assessment <ArrowRight className="size-4 ml-2 text-[#167C86]" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/shop')}
                className="rounded-xl px-7 h-12 text-xs font-semibold bg-white text-[#172126] hover:bg-[#F6FAFB] border border-[#DCE6E9] shadow-2xs min-h-[44px] cursor-pointer"
              >
                Explore Formulations <ArrowRight className="size-4 ml-2 text-[#167C86]" />
              </Button>
            </div>
          </div>

          {/* Right Column: Editorial Catalogue Metadata */}
          <div className="hidden lg:flex flex-col items-end text-right space-y-3 shrink-0 border-l border-[#DCE6E9] pl-10 py-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172126] uppercase tracking-widest">
              <Sparkles className="size-4 text-[#167C86]" /> BAREO ACTIVE DISCIPLINE
            </div>
            <p className="text-xs text-[#52636B] max-w-[220px] font-normal leading-relaxed">
              Clearly disclosed concentrations. Clean barrier repair. Dermatologist guided.
            </p>
            <span className="text-[9px] font-bold text-[#7A8A91] uppercase tracking-[0.14em]">
              ESTABLISHED 2026 · INDIA
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
