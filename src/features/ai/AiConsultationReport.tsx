import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Sunrise, Moon, Leaf, CheckCircle2, Clock, ShieldCheck, AlertCircle, TrendingUp, Target, HelpCircle, Info, RefreshCw } from 'lucide-react'
import type { AiConsultation } from '@/types'
import { ProductCard } from '@/components/cards/ProductCard'
import { SmartImage } from '@/components/common/SmartImage'
import { useRecommendations } from '@/hooks/useRecommendations'
import { formatDate, cn } from '@/utils'
import { Button } from '@/components/ui/button'

const LEVEL_COLOR: Record<string, string> = {
  good: 'bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/30',
  fair: 'bg-amber-50/80 text-amber-800 border border-amber-200/80',
  low: 'bg-rose-50/80 text-rose-800 border border-rose-200/80',
  'insufficient-data': 'bg-slate-100 text-slate-700 border border-slate-200',
}

const LEVEL_LABEL: Record<string, string> = {
  good: 'Optimal',
  fair: 'Moderate',
  low: 'Needs Focus',
  'insufficient-data': 'Data Unavailable',
}

const EVIDENCE_LABEL: Record<string, string> = {
  measured: 'SURVEY + VISUAL SIGNALS',
  inferred: 'SURVEY-INFERRED',
  'insufficient-data': 'UNAVAILABLE',
}

export function AiConsultationReport({ consultation, compact }: { consultation: AiConsultation; compact?: boolean }) {
  const { report, routine, lifestyleTips } = consultation
  const isComplete = report.isComplete !== false && report.skinScore !== null && report.skinScore !== undefined
  const confidenceScore = report.confidence ?? (isComplete ? 92 : 0)
  const analysisSource = report.analysisSource ?? (consultation.hasPhotoAnalysis ? 'questionnaire+selfie' : 'questionnaire')
  const barrierMetric = report.barrier || (report as any).acneRisk
  const metrics = [report.hydration, report.oilBalance, report.sensitivity, barrierMetric, report.pigmentation, report.elasticity].filter(Boolean)

  const validMetrics = metrics.filter((m) => m.score !== null && m.score !== undefined)
  const sortedMetrics = [...validMetrics].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const strongestMetric = sortedMetrics[0]
  const lowestMetric = sortedMetrics[sortedMetrics.length - 1]

  const { data: recResults, isLoading: isRecsLoading, refetch: refetchRecs } = useRecommendations({ limit: 8 })

  const recProducts = (recResults || []).map((r) => r.product).filter((p) => p && (p.stock === undefined || p.stock > 0) && (p.status === undefined || p.status === 'active'))

  const rawMorning = routine?.morning?.products || []
  const rawNight = routine?.night?.products || []

  const morningProducts = (rawMorning.length > 0 ? rawMorning : recProducts.slice(0, 4)).filter(
    (p) => p && (p.stock === undefined || p.stock > 0) && (p.status === undefined || p.status === 'active')
  )
  const nightProducts = (rawNight.length > 0 ? rawNight : recProducts.slice(0, 3)).filter(
    (p) => p && (p.stock === undefined || p.stock > 0) && (p.status === undefined || p.status === 'active')
  )

  const allProducts = [...morningProducts, ...nightProducts].filter(
    (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
  )

  if (!isComplete || report.skinScore === null) {
    return (
      <div className="rounded-3xl border border-[#DCE6E9] bg-[#FAF7F2] p-8 text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#EDF6F8] text-[#167C86] border border-[#167C86]/30">
          <HelpCircle className="size-6 text-[#167C86]" />
        </div>
        <h3 className="font-serif text-2xl font-normal text-[#172126]">
          AI-Assisted Assessment Pending
        </h3>
        <p className="text-xs text-[#52636B] font-light max-w-md mx-auto leading-relaxed">
          {report.summary?.[0] || 'Complete your skin questionnaire or upload a facial selfie to generate a calibrated dermal intelligence report.'}
        </p>
        <div className="pt-2">
          <Link
            to="/skin-analysis"
            className="inline-flex items-center gap-2 rounded-xl bg-[#172126] px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#253239] border border-[#172126]"
          >
            Start Assessment <Sparkles className="size-3.5 text-[#167C86]" />
          </Link>
        </div>
      </div>
    )
  }

  const sourceLabel =
    analysisSource === 'questionnaire+selfie'
      ? 'SURVEY + VISUAL SIGNALS'
      : analysisSource === 'selfie'
      ? 'VISUAL TELEMETRY ASSESSMENT'
      : 'SURVEY-INFERRED ASSESSMENT'

  const displayScore = report.skinScore ?? 75

  const confidenceLevelLabel = confidenceScore >= 78 ? 'High Confidence' : confidenceScore >= 50 ? 'Moderate Confidence' : 'Low Confidence'
  const confidenceExplanation =
    analysisSource === 'questionnaire+selfie'
      ? 'Based on questionnaire responses and visual skin signals.'
      : analysisSource === 'selfie'
      ? 'Based primarily on visual skin signals.'
      : 'Based primarily on questionnaire responses.'

  return (
    <div className="space-y-8">
      {/* 1. REPORT HERO & SCORE CARD */}
      <div className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-[#DCE6E9]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#167C86]">
              <Sparkles className="size-3" /> {sourceLabel}
            </div>
            <h2 className="font-serif text-2xl font-normal text-[#172126] sm:text-3xl tracking-tight mt-1">
              AI-Assisted Dermal Report
            </h2>
            <p className="text-xs text-[#52636B] font-normal mt-1 flex flex-wrap items-center gap-2">
              <span>Generated {formatDate(consultation.date)}</span>
              <span>•</span>
              <span className="font-semibold text-[#167C86]">Analysis Confidence: {confidenceLevelLabel}</span>
            </p>
            <p className="text-[11px] text-[#7A8A91] font-light mt-0.5">
              {confidenceExplanation}
            </p>
          </div>

          {/* Large Primary Score focal point */}
          <div className="flex items-center gap-5 bg-[#FAF7F2] rounded-3xl border border-[#DCE6E9] px-6 py-4 shrink-0">
            <div className="text-center">
              <div className="flex items-baseline gap-0.5">
                <span className="font-serif text-5xl font-normal text-[#172126] leading-none">
                  {displayScore}
                </span>
                <span className="text-xs text-[#7A8A91] font-medium font-sans">/100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-[#DCE6E9]" />
            <div>
              <span className="text-sm font-serif font-semibold text-[#172126] block">
                {displayScore >= 78 ? 'Healthy Barrier' : displayScore >= 60 ? 'Balanced Skin' : 'Requires Focus'}
              </span>
              <span className="text-[11px] text-[#52636B] font-normal">BAREO Dermal Index</span>
            </div>
          </div>
        </div>

        {/* Primary & Secondary Focus Areas — Clear Visual Hierarchy */}
        {report.primaryFocus && (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* HERO PRIMARY FOCUS — Visually Dominant */}
            <div className="rounded-2xl border-2 border-[#167C86] bg-[#EDF6F8] p-5 flex items-start gap-4 shadow-2xs">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#167C86] text-white shrink-0 shadow-2xs">
                <Target className="size-5" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                  YOUR PRIMARY PRIORITY
                </span>
                <p className="font-serif text-lg font-normal text-[#172126]">
                  {report.primaryFocus.label}
                </p>
                <p className="text-[11px] text-[#52636B] font-light leading-relaxed">
                  {report.primaryFocus.reasoning}
                </p>
              </div>
            </div>

            {/* SECONDARY FOCUS — Supporting & Visually Quieter */}
            {report.secondaryFocus ? (
              <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                  <TrendingUp className="size-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 block">
                    SECONDARY FOCUS AREA
                  </span>
                  <p className="font-serif text-base font-normal text-[#172126]">
                    {report.secondaryFocus.label}
                  </p>
                  <p className="text-[11px] text-[#52636B] font-light leading-relaxed">
                    {report.secondaryFocus.reasoning}
                  </p>
                </div>
              </div>
            ) : strongestMetric && lowestMetric && (
              <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 flex items-start gap-4">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shrink-0">
                  <TrendingUp className="size-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 block">
                    MAIN OPPORTUNITY
                  </span>
                  <p className="font-serif text-base font-normal text-[#172126]">
                    {lowestMetric.label} ({lowestMetric.score ?? 0}%)
                  </p>
                  <p className="text-[11px] text-[#52636B] font-light leading-relaxed">
                    {lowestMetric.detail}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REASONING HIERARCHY — WHAT WE NOTICED -> WHY IT MATTERS -> WHAT TO CONSIDER */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCE6E9]/60 pb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#172126] flex items-center gap-1.5">
              <Info className="size-4 text-[#167C86]" /> Why We Recommend This Focus
            </p>
            <span className="text-[10px] text-[#7A8A91] uppercase font-mono">EXPLAINABLE INTELLIGENCE</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                1. WHAT WE NOTICED
              </span>
              <p className="text-[#52636B] font-light leading-relaxed">
                {report.primaryFocus?.reasoning ? report.primaryFocus.reasoning.split('.')[0] + '.' : 'Specific moisture and barrier requirements identified.'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                2. WHY IT MATTERS
              </span>
              <p className="text-[#52636B] font-light leading-relaxed">
                Maintaining stratum corneum lipid balance helps prevent transepidermal water loss.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                3. WHAT TO CONSIDER
              </span>
              <p className="text-[#52636B] font-light leading-relaxed">
                Consider gentle, non-comedogenic hydration and barrier repair actives daily.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#DCE6E9]/60 flex flex-wrap items-center gap-4 text-[11px] text-[#52636B] font-medium">
            <span className="text-[#172126] font-semibold">SIGNALS CONSIDERED:</span>
            <span className="flex items-center gap-1 text-[#167C86]">
              <CheckCircle2 className="size-3 text-[#167C86]" /> Questionnaire responses
            </span>
            {consultation.hasPhotoAnalysis && (
              <span className="flex items-center gap-1 text-[#167C86]">
                <CheckCircle2 className="size-3 text-[#167C86]" /> Visual photo telemetry
              </span>
            )}
          </div>
        </div>

        {/* Dermal Summary Highlights */}
        {report.summary && report.summary.length > 0 && (
          <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-4 sm:p-5 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#172126] flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#167C86]" /> Key Findings &amp; Observations
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {report.summary.map((s, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[#52636B]">
                  <span className="size-1.5 rounded-full bg-[#167C86] mt-1.5 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6 Key Metrics Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => {
            const hasScore = m.score !== null && m.score !== undefined
            const scoreVal = m.score ?? 0
            const levelKey = m.level || (m.status && ['good', 'fair', 'low'].includes(m.status) ? m.status : 'good')
            const evidenceKey = m.evidence || (m.status && ['measured', 'inferred'].includes(m.status) ? m.status : 'inferred')

            return (
              <div key={m.label} className="rounded-2xl border border-[#DCE6E9] bg-white p-4 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#172126]">{m.label}</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', LEVEL_COLOR[levelKey] || LEVEL_COLOR.good)}>
                      {LEVEL_LABEL[levelKey] || 'Optimal'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-serif text-xl font-normal text-[#172126]">
                      {hasScore ? `${scoreVal} / 100` : 'Data Unavailable'}
                    </span>
                    <span className="text-[10px] text-[#7A8A91] font-mono uppercase">
                      {EVIDENCE_LABEL[evidenceKey] || 'SURVEY-INFERRED'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {hasScore ? (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE6E9]/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${scoreVal}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          scoreVal >= 78 ? 'bg-[#167C86]' : scoreVal >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                      />
                    </div>
                  ) : (
                    <div className="h-1.5 w-full rounded-full bg-slate-200" />
                  )}
                </div>

                <p className="text-[11px] text-[#52636B] font-light leading-normal pt-1 border-t border-[#DCE6E9]/60 min-h-[34px]">
                  {m.detail}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* FORMULATION & INGREDIENT ADVISORY GUIDANCE */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#167C86]/30 bg-[#EDF6F8]/60 p-5 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#167C86] flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-[#167C86]" /> Active Ingredients That May Support Your Skin
          </p>
          <ul className="text-xs text-[#172126] space-y-1.5 pl-4 list-disc font-medium">
            <li>Niacinamide (5%) — May support sebum regulation &amp; pore refinement</li>
            <li>Hyaluronic Acid (Multi-depth) — Can assist stratum corneum moisture retention</li>
            <li>Centella Asiatica &amp; Ceramides — Supports natural lipid barrier resilience</li>
            <li>Stabilized Vitamin C — May assist in evening overall skin tone</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-5 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-800 flex items-center gap-1.5">
            <AlertCircle className="size-4 text-rose-600" /> Formulations to Consider Minimizing
          </p>
          <ul className="text-xs text-rose-900 space-y-1.5 pl-4 list-disc font-medium">
            <li>Consider minimizing synthetic fragrance if skin feels reactive</li>
            <li>Consider avoiding high-concentration physical scrubs to prevent micro-abrasion</li>
            <li>Consider minimizing denatured alcohol to preserve natural moisture</li>
          </ul>
        </div>
      </div>

      {/* PERSONALIZED ROUTINE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
              YOUR PERSONALIZED ROUTINE
            </span>
            <h3 className="font-serif text-2xl font-normal text-[#172126] tracking-tight">
              Daily Regimen
            </h3>
          </div>
          <span className="text-xs text-[#52636B] font-medium flex items-center gap-1">
            <Clock className="size-3.5 text-[#167C86]" /> ~11 mins daily total
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Morning Routine */}
          <div className="rounded-3xl border border-[#DCE6E9] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E9]">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#167C86]">
                  <Sunrise className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#172126]">{routine?.morning?.name || 'Morning Routine'}</h4>
                  <p className="text-[11px] text-[#52636B] font-light">{morningProducts.length} Formulations</p>
                </div>
              </div>
              <span className="rounded-full bg-[#FAF7F2] border border-[#DCE6E9] px-2.5 py-1 text-[11px] font-semibold text-[#172126]">
                {routine?.morning?.time || '5 min'}
              </span>
            </div>

            <div className="space-y-2.5">
              {morningProducts.map((p) => {
                const imgUrl = Array.isArray(p.images) && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url || '') : ''
                return (
                  <RoutineProduct
                    key={p.id}
                    productId={p.slug || p.id}
                    image={imgUrl}
                    name={p.name}
                    category={p.categoryName}
                  />
                )
              })}
            </div>
          </div>

          {/* Night Routine */}
          <div className="rounded-3xl border border-[#DCE6E9] bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6E9]">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#167C86]">
                  <Moon className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#172126]">{routine?.night?.name || 'Night Routine'}</h4>
                  <p className="text-[11px] text-[#52636B] font-light">{nightProducts.length} Formulations</p>
                </div>
              </div>
              <span className="rounded-full bg-[#FAF7F2] border border-[#DCE6E9] px-2.5 py-1 text-[11px] font-semibold text-[#172126]">
                {routine?.night?.time || '6 min'}
              </span>
            </div>

            <div className="space-y-2.5">
              {nightProducts.map((p) => {
                const imgUrl = Array.isArray(p.images) && p.images[0] ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url || '') : ''
                return (
                  <RoutineProduct
                    key={p.id}
                    productId={p.slug || p.id}
                    image={imgUrl}
                    name={p.name}
                    category={p.categoryName}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FORMULATION MATCH — RECOMMENDED PRODUCTS */}
      {!compact && (
        <div className="space-y-6 pt-2">
          <div className="border-b border-[#DCE6E9] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
              YOUR BAREO FORMULATION MATCH
            </span>
            <h3 className="font-serif text-2xl font-normal text-[#172126] tracking-tight">
              Formulation Match
            </h3>
            <p className="text-xs text-[#52636B] font-medium mt-0.5">
              Selected from available BAREO formulations based on your assessment.
            </p>
          </div>

          {isRecsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-[#FAF7F2] border border-[#DCE6E9] animate-pulse" />
              ))}
            </div>
          ) : recResults && recResults.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recResults.map((rec) => (
                <div key={rec.productId || rec.product.id} className="flex flex-col justify-between space-y-3.5 sm:space-y-4">
                  <div className="flex-1 flex flex-col">
                    <ProductCard product={rec.product} recommendation={rec} />
                  </div>
                  <div className="rounded-xl border border-[#DCE6E9] bg-[#FAF7F2] p-3 sm:p-3.5 text-xs text-[#52636B] font-light leading-relaxed">
                    <span className="font-semibold text-[#172126] block mb-1">Why recommended:</span>
                    <p className="text-[11px] sm:text-xs leading-normal">{rec.reasons.join(' · ')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {allProducts.map((p) => (
                <div key={p.id} className="flex flex-col justify-between space-y-3.5 sm:space-y-4">
                  <div className="flex-1 flex flex-col">
                    <ProductCard product={p} />
                  </div>
                  <div className="rounded-xl border border-[#DCE6E9] bg-[#FAF7F2] p-3 sm:p-3.5 text-xs text-[#52636B] font-light leading-relaxed">
                    <span className="font-semibold text-[#172126] block mb-1">Why recommended:</span>
                    <p className="text-[11px] sm:text-xs leading-normal">Formulated for balanced skin barrier support &amp; daily maintenance.</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#DCE6E9] bg-[#FAF7F2] p-8 text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#172126]">NO FORMULATION MATCH AVAILABLE</p>
              <p className="text-xs text-[#52636B] font-light max-w-sm mx-auto">Your assessment is complete, but matching formulations are temporarily unavailable.</p>
              <Button onClick={() => refetchRecs()} variant="outline" size="sm" className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126]">
                <RefreshCw className="size-3.5 mr-1.5 text-[#167C86]" /> RETRY MATCHING
              </Button>
            </div>
          )}
        </div>
      )}

      {/* LIFESTYLE TIPS STRIP */}
      {lifestyleTips && lifestyleTips.length > 0 && (
        <div className="rounded-3xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 sm:p-6 space-y-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#167C86]">
            <Leaf className="size-4 text-[#167C86]" /> Botanical &amp; Lifestyle Guidelines
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {lifestyleTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#52636B] font-medium">
                <span className="size-1.5 rounded-full bg-[#167C86] mt-1.5 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLINICAL COSMETIC ADVISORY DISCLAIMER */}
      <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 pb-8 sm:pb-10 border-t border-[#DCE6E9] flex items-start gap-3 text-[#7A8A91]">
        <ShieldCheck className="size-4 text-[#167C86] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-[13px] leading-relaxed font-light text-[#7A8A91]">
          <strong className="font-semibold text-[#172126]">Advisory: </strong>
          BAREO Dermal Assessment is an AI-assisted skin evaluation tool designed to recommend cosmetic skincare regimens. It does not provide medical diagnosis or replace dermatological consultation.
        </p>
      </div>
    </div>
  )
}

function RoutineProduct({ productId, image, name, category }: { productId: string; image: string; name: string; category?: string }) {
  return (
    <Link
      to={`/product/${productId}`}
      className="flex items-center gap-3 rounded-2xl border border-[#DCE6E9] bg-white p-2.5 transition-all hover:border-[#172126]/40 hover:shadow-2xs"
    >
      {image ? (
        <SmartImage src={image} alt={name || 'Product'} className="size-11 rounded-xl object-contain bg-[#FAF7F2] p-1 shrink-0" />
      ) : (
        <div className="size-11 rounded-xl bg-[#FAF7F2] border border-[#DCE6E9] flex items-center justify-center text-[9px] font-bold text-[#167C86] shrink-0">
          BAREO
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="line-clamp-1 text-xs font-semibold text-[#172126]">{name || 'Formulation'}</p>
        <p className="text-[10px] text-[#7A8A91] uppercase font-medium mt-0.5">{category || 'Skincare'}</p>
      </div>
      <span className="text-[11px] font-semibold text-[#172126] hover:underline shrink-0">
        View →
      </span>
    </Link>
  )
}
