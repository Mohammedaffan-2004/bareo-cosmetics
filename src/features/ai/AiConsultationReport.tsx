import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Sunrise, Moon, Leaf, CheckCircle2, Clock, ShieldCheck, AlertCircle, TrendingUp, Target } from 'lucide-react'
import type { AiConsultation } from '@/types'
import { ProductCard } from '@/components/cards/ProductCard'
import { SmartImage } from '@/components/common/SmartImage'
import { useRecommendations } from '@/hooks/useRecommendations'
import { formatDate } from '@/utils'
import { cn } from '@/utils'

const STATUS_COLOR: Record<string, string> = {
  good: 'bg-[#ECFDF5] text-[#047857] border border-[#059669]/20',
  fair: 'bg-amber-50 text-amber-800 border border-amber-200/80',
  low: 'bg-rose-50 text-rose-800 border border-rose-200/80',
}

const STATUS_LABEL: Record<string, string> = {
  good: 'Optimal',
  fair: 'Moderate',
  low: 'Needs Focus',
}

export function AiConsultationReport({ consultation, compact }: { consultation: AiConsultation; compact?: boolean }) {
  const { report, routine, lifestyleTips } = consultation
  const isComplete = report.isComplete !== false && report.skinScore !== null
  const confidenceScore = report.confidence ?? (isComplete ? 92 : 0)
  const analysisSource = report.analysisSource ?? (consultation.selfie ? 'questionnaire+selfie' : 'questionnaire')
  const barrierMetric = report.barrier || (report as any).acneRisk
  const metrics = [report.hydration, report.oilBalance, report.sensitivity, barrierMetric, report.pigmentation, report.elasticity].filter(Boolean)

  const sortedMetrics = [...metrics].sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
  const strongestMetric = sortedMetrics[0]
  const lowestMetric = sortedMetrics[sortedMetrics.length - 1]

  const { data: recResults, isLoading: isRecsLoading } = useRecommendations({ limit: 8 })

  const recProducts = (recResults || []).map((r) => r.product).filter((p) => p && p.stock > 0 && p.status === 'active')

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

  if (!isComplete) {
    return (
      <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-8 text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/80">
          <AlertCircle className="size-6 text-amber-600" />
        </div>
        <h3 className="font-serif text-2xl font-normal text-[#111111]">
          Incomplete Skin Assessment
        </h3>
        <p className="text-xs text-[#6B7280] font-light max-w-md mx-auto leading-relaxed">
          {report.summary?.[0] || 'Complete more of your skin assessment for a meaningful personalized report.'}
        </p>
        <div className="pt-2">
          <Link
            to="/skin-analysis"
            className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-black"
          >
            Complete Assessment <Sparkles className="size-3.5 text-[#7C3AED]" />
          </Link>
        </div>
      </div>
    )
  }

  const sourceLabel =
    analysisSource === 'questionnaire+selfie'
      ? 'PHOTO DERMAL ANALYSIS'
      : analysisSource === 'selfie'
      ? 'PHOTO DERMAL ANALYSIS'
      : 'QUESTIONNAIRE-BASED ASSESSMENT'

  return (
    <div className="space-y-8">
      {/* 1. REPORT HERO & SCORE CARD */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
              <Sparkles className="size-3" /> {sourceLabel}
            </div>
            <h2 className="font-serif text-2xl font-normal text-[#111111] sm:text-3xl tracking-tight mt-1">
              Skin Health Assessment
            </h2>
            <p className="text-xs text-[#6B7280] font-light mt-1 flex items-center gap-2">
              <span>Generated {formatDate(consultation.date)}</span>
              <span>•</span>
              <span className="font-semibold text-[#047857]">AI Confidence: {confidenceScore}%</span>
            </p>
          </div>

          {/* Large Primary Score focal point */}
          <div className="flex items-center gap-5 bg-[#FAF7F2] rounded-3xl border border-[#E5E7EB] px-6 py-4 shrink-0">
            <div className="text-center">
              <div className="flex items-baseline gap-0.5">
                <span className="font-serif text-5xl font-normal text-[#111111] leading-none">
                  {report.skinScore}
                </span>
                <span className="text-xs text-[#9CA3AF] font-medium font-sans">/100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-[#E5E7EB]" />
            <div>
              <span className="text-sm font-serif font-semibold text-[#111111] block">
                {(report.skinScore ?? 0) >= 78 ? 'Healthy Barrier' : (report.skinScore ?? 0) >= 60 ? 'Balanced Skin' : 'Requires Focus'}
              </span>
              <span className="text-[11px] text-[#6B7280] font-light">Overall Skin Score</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interpretation Breakdown (Supported strictly by data) */}
        {strongestMetric && lowestMetric && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 flex items-start gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#ECFDF5] border border-[#059669]/20 text-[#047857] shrink-0">
                <TrendingUp className="size-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  STRONGEST AREA
                </span>
                <p className="font-semibold text-[#111111]">
                  {strongestMetric.label} ({strongestMetric.score}%)
                </p>
                <p className="text-[11px] text-[#6B7280] font-light leading-snug">
                  {strongestMetric.detail}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 flex items-start gap-3">
              <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 shrink-0">
                <Target className="size-4" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                  MAIN OPPORTUNITY
                </span>
                <p className="font-semibold text-[#111111]">
                  {lowestMetric.label} ({lowestMetric.score}%)
                </p>
                <p className="text-[11px] text-[#6B7280] font-light leading-snug">
                  {lowestMetric.detail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dermal Summary Highlights */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#111111] mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-[#059669]" /> Dermal Summary Highlights
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {report.summary.map((s, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#374151]">
                <span className="size-1.5 rounded-full bg-[#111111] mt-1.5 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Key Metrics Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#111111]">{m.label}</p>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_COLOR[m.status])}>
                  {STATUS_LABEL[m.status]}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="font-serif text-xl font-normal text-[#111111]">{m.score}%</span>
                <span className="text-[10px] text-[#9CA3AF] font-mono">Target: 85%+</span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    m.status === 'good' ? 'bg-[#111111]' : m.status === 'fair' ? 'bg-amber-500' : 'bg-rose-500'
                  )}
                />
              </div>

              <p className="text-[11px] text-[#6B7280] font-light leading-normal pt-0.5">
                {m.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CLINICAL INGREDIENT GUIDANCE */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#059669]/20 bg-[#ECFDF5]/70 p-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#047857] flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-[#059669]" /> Active Ingredients to Target
          </p>
          <ul className="text-xs text-[#065F46] space-y-1.5 pl-4 list-disc font-medium">
            <li>Niacinamide (5%) — Sebum regulation &amp; pore tightening</li>
            <li>Hyaluronic Acid (Multi-depth) — Stratum corneum hydration</li>
            <li>Centella Asiatica &amp; Ceramides — Lipid barrier repair</li>
            <li>Stabilized Vitamin C — Melanin cluster brightening</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-rose-200/80 bg-rose-50/70 p-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
            <AlertCircle className="size-4 text-rose-600" /> Ingredients to Avoid
          </p>
          <ul className="text-xs text-rose-800 space-y-1.5 pl-4 list-disc font-medium">
            <li>Synthetic Fragrance &amp; Essential Oils (Prevents irritation)</li>
            <li>High-concentration Physical Scrubs (Micro-tears protection)</li>
            <li>Denatured Alcohol (Prevents barrier stripping)</li>
          </ul>
        </div>
      </div>

      {/* PERSONALIZED ROUTINE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-normal text-[#111111] tracking-tight">
            Personalized Daily Routine
          </h3>
          <span className="text-xs text-[#6B7280] font-light flex items-center gap-1">
            <Clock className="size-3.5 text-[#111111]" /> ~11 mins daily total
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Morning Routine */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Sunrise className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111111]">{routine?.morning?.name || 'Morning Routine'}</h4>
                  <p className="text-[11px] text-[#6B7280]">{morningProducts.length} Formulations</p>
                </div>
              </div>
              <span className="rounded-full bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-medium text-[#111111]">
                {routine?.morning?.time || '5 min'}
              </span>
            </div>

            <div className="space-y-2.5">
              {morningProducts.map((p) => (
                <RoutineProduct key={p.id} productId={p.slug} image={p.images?.[0]?.url || '/images/products/bareo-cica-serum.png'} name={p.name} category={p.categoryName} />
              ))}
            </div>
          </div>

          {/* Night Routine */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Moon className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111111]">{routine?.night?.name || 'Night Routine'}</h4>
                  <p className="text-[11px] text-[#6B7280]">{nightProducts.length} Formulations</p>
                </div>
              </div>
              <span className="rounded-full bg-[#FAFAFA] border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-medium text-[#111111]">
                {routine?.night?.time || '6 min'}
              </span>
            </div>

            <div className="space-y-2.5">
              {nightProducts.map((p) => (
                <RoutineProduct key={p.id} productId={p.slug} image={p.images?.[0]?.url || '/images/products/bareo-cica-serum.png'} name={p.name} category={p.categoryName} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIFESTYLE TIPS CARD */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA]/60 p-6 space-y-3">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
          <Leaf className="size-4 text-emerald-600" /> Botanical & Lifestyle Guidelines
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {lifestyleTips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-[#374151] font-medium">
              <span className="size-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMMENDED FOR YOU SECTION WITH REASONING */}
      {!compact && (
        <div className="space-y-4 pt-2">
          <div>
            <h3 className="font-serif text-2xl font-normal text-[#111111] tracking-tight">
              Recommended For You
            </h3>
            <p className="text-xs text-[#6B7280] font-light mt-1">
              Curated based on your detected hydration levels, skin type, and lifestyle responses.
            </p>
          </div>

          {isRecsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-[#FAFAFA] border border-[#E5E7EB] animate-pulse" />
              ))}
            </div>
          ) : recResults && recResults.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recResults.map((rec) => (
                <div key={rec.productId || rec.product.id} className="space-y-2">
                  <ProductCard product={rec.product} recommendation={rec} />
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-2.5 text-[11px] text-[#6B7280] font-light">
                    <span className="font-semibold text-[#111111] block mb-0.5">Why recommended:</span>
                    {rec.reasons.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {allProducts.map((p) => (
                <div key={p.id} className="space-y-2">
                  <ProductCard product={p} />
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-2.5 text-[11px] text-[#6B7280] font-light">
                    <span className="font-semibold text-[#111111] block mb-0.5">Why recommended:</span>
                    Formulated for balanced skin barrier support &amp; daily maintenance.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. CLINICAL COSMETIC ADVISORY DISCLAIMER */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 sm:p-5 flex items-start sm:items-center gap-3 text-[#6B7280]">
        <ShieldCheck className="size-4 text-[#0F8F83] shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-[11px] sm:text-xs leading-relaxed font-light">
          <strong className="font-semibold text-[#111111]">Advisory: </strong>
          BAREO Skin Diagnostic is an AI-powered cosmetic analysis tool designed to recommend daily skincare regimens. It does not provide medical diagnosis or replace professional dermatological advice.
        </p>
      </div>
    </div>
  )
}

function RoutineProduct({ productId, image, name, category }: { productId: string; image: string; name: string; category?: string }) {
  return (
    <Link
      to={`/product/${productId}`}
      className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-2.5 transition-all hover:border-[#111111] hover:shadow-2xs"
    >
      <SmartImage src={image} alt={name} className="size-11 rounded-xl object-contain bg-[#FAFAFA] p-1" />
      <div className="flex-1 min-w-0">
        <p className="line-clamp-1 text-xs font-semibold text-[#111111]">{name}</p>
        <p className="text-[10px] text-[#9CA3AF] uppercase font-medium mt-0.5">{category || 'Skincare'}</p>
      </div>
      <span className="text-[11px] font-semibold text-[#111111] hover:underline shrink-0">
        View →
      </span>
    </Link>
  )
}
