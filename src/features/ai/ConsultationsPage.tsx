import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ScanFace, TrendingUp, Calendar, CheckCircle2, ChevronDown } from 'lucide-react'
import { aiService } from '@/services/aiService'
import { useQuery } from '@tanstack/react-query'
import type { AiConsultation } from '@/types'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { formatDate, cn } from '@/utils'
import { AiConsultationReport } from './AiConsultationReport'

export function ConsultationsPage() {
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['user-consultations'],
    queryFn: () => aiService().getConsultations(),
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)

  const latestConsultation = consultations[0]
  const historyConsultations = consultations.slice(1)
  const totalCount = consultations.length
  const hasMultiple = totalCount >= 2

  // Calculate real progression metrics from actual user consultation history
  let scoreDiff: number | null = null
  let oldestScore: number | null = null
  if (hasMultiple) {
    const oldest = consultations[consultations.length - 1]
    const newestScore = latestConsultation?.report?.skinScore ?? 0
    oldestScore = oldest?.report?.skinScore ?? 0
    scoreDiff = newestScore - oldestScore
  }

  const currentScore = latestConsultation?.report?.skinScore ?? null

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
            My Skin Consultations
          </h1>
          <p className="mt-1 text-xs text-[#6B7280] font-light">
            Your skin profile, assessments and personalized routines.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-5 hover:bg-black min-h-[44px]">
          <Link to="/skin-analysis">
            <Sparkles className="size-3.5 text-[#7C3AED] mr-1.5" /> Start AI Skin Analysis
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-[#FAFAFA] border border-[#E5E7EB] animate-pulse" />
          ))}
        </div>
      ) : !consultations || consultations.length === 0 ? (
        <div className="py-10">
          <EmptyState
            icon={<ScanFace className="size-8 text-[#111111]" />}
            title="No skin consultations yet"
            description="Run your first 60-second AI skin analysis to decode your moisture barrier, hydration levels and receive a custom daily routine."
            action={
              <Button asChild className="rounded-xl bg-[#111111] text-white text-xs px-6 font-semibold hover:bg-black min-h-[44px]">
                <Link to="/skin-analysis">Start AI Skin Analysis</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2. TOP SUMMARY METRICS STRIP */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">CURRENT SKIN SCORE</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-normal text-[#111111]">{currentScore ?? '—'}</span>
                <span className="text-xs text-[#9CA3AF]">/100</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">CHANGE SINCE INITIAL</span>
              <div className="flex items-center gap-1.5 pt-1">
                {hasMultiple && scoreDiff !== null ? (
                  <span className="font-semibold text-xs text-[#047857] flex items-center gap-1">
                    <TrendingUp className="size-3.5" /> {scoreDiff >= 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`}
                  </span>
                ) : (
                  <span className="text-xs text-[#6B7280] font-light">Baseline Assessment</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">TOTAL ASSESSMENTS</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-normal text-[#111111]">{totalCount}</span>
                <span className="text-xs text-[#9CA3AF]">recorded</span>
              </div>
            </div>
          </div>

          {/* 3. LATEST ASSESSMENT HERO CARD */}
          {latestConsultation && (
            <div className="rounded-3xl border-2 border-[#111111]/20 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#059669]/20 bg-[#ECFDF5] px-3 py-1 text-[11px] font-semibold text-[#047857]">
                  <CheckCircle2 className="size-3.5" /> LATEST ASSESSMENT
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-[#111111]" /> {formatDate(latestConsultation.date)}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-[#047857]">
                    AI Confidence: {latestConsultation.report.confidence ?? 92}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FAF7F2] border border-[#E5E7EB] p-4 min-w-[90px]">
                    <span className="font-serif text-4xl font-normal text-[#111111] leading-none">
                      {latestConsultation.report.skinScore}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF] font-medium uppercase mt-0.5">/100</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#111111]">
                      {(latestConsultation.report.skinScore ?? 0) >= 78 ? 'Healthy Barrier' : (latestConsultation.report.skinScore ?? 0) >= 60 ? 'Balanced Skin' : 'Requires Focus'}
                    </h3>
                    <p className="text-xs text-[#6B7280] font-light mt-0.5">
                      {latestConsultation.answers.skinType ? `${latestConsultation.answers.skinType} skin` : 'Standard skin profile'} • {latestConsultation.recommendedProductIds.length} recommended formulations
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setExpandedId(expandedId === latestConsultation.id ? null : latestConsultation.id)}
                  className="rounded-xl bg-[#111111] text-white text-xs font-semibold px-5 hover:bg-black min-h-[40px] shrink-0"
                >
                  {expandedId === latestConsultation.id ? 'Hide Full Report' : 'View Full Report →'}
                </Button>
              </div>

              {/* Metrics Quick Preview Bar */}
              <div className="grid grid-cols-3 gap-2 border-t border-[#E5E7EB] pt-4 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">HYDRATION</span>
                  <span className="font-serif text-base font-normal text-[#111111]">{latestConsultation.report.hydration.score}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">OIL BALANCE</span>
                  <span className="font-serif text-base font-normal text-[#111111]">{latestConsultation.report.oilBalance.score}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] block">SENSITIVITY</span>
                  <span className="font-serif text-base font-normal text-[#111111]">{latestConsultation.report.sensitivity.score}%</span>
                </div>
              </div>

              {/* Smooth Expanded Report Panel */}
              <AnimatePresence>
                {expandedId === latestConsultation.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-[#E5E7EB] pt-6 mt-6 space-y-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> Full Consultation Report
                    </div>
                    <AiConsultationReport consultation={latestConsultation} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* 4. REAL SKIN PROGRESS VISUALIZATION (If 2+ consultations exist) */}
          {hasMultiple && scoreDiff !== null && (
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">SKIN SCORE PROGRESS</span>
                <span className="text-xs font-semibold text-[#047857]">
                  {scoreDiff >= 0 ? `+${scoreDiff} since first assessment` : `${scoreDiff} since first assessment`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                {consultations.slice().reverse().map((c) => (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <span className="size-2.5 rounded-full bg-[#111111]" />
                    <span className="font-semibold text-[#111111]">{c.report.skinScore}</span>
                    <span className="text-[10px] text-[#9CA3AF]">{formatDate(c.date).split(' ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. PAST CONSULTATIONS HISTORY LIST */}
          {historyConsultations.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-normal text-[#111111]">Past Assessments</h2>
              <div className="space-y-3">
                {historyConsultations.map((c) => {
                  const isExpanded = expandedId === c.id
                  return (
                    <div
                      key={c.id}
                      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs space-y-4 transition-all hover:border-[#111111]/30"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] px-3 py-1.5 min-w-[60px]">
                            <span className="font-serif text-xl font-normal text-[#111111]">{c.report.skinScore}</span>
                            <span className="text-[9px] text-[#9CA3AF]">/100</span>
                          </div>
                          <div>
                            <p className="font-serif text-sm font-semibold text-[#111111]">{formatDate(c.date)}</p>
                            <p className="text-xs text-[#6B7280] font-light mt-0.5">
                              {(c.report.skinScore ?? 0) >= 78 ? 'Healthy Barrier' : (c.report.skinScore ?? 0) >= 60 ? 'Balanced Skin' : 'Requires Focus'} • {c.recommendedProductIds.length} formulations
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                          className="rounded-xl border-[#E5E7EB] bg-white text-xs font-medium text-[#111111] hover:bg-[#FAFAFA]"
                        >
                          {isExpanded ? 'Hide Report' : 'View Report'} <ChevronDown className={cn('size-3.5 ml-1 transition-transform', isExpanded && 'rotate-180')} />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden border-t border-[#E5E7EB] pt-6 mt-4 space-y-4"
                          >
                            <div className="text-xs font-semibold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                              <Sparkles className="size-3.5" /> Full Consultation Report
                            </div>
                            <AiConsultationReport consultation={c} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
