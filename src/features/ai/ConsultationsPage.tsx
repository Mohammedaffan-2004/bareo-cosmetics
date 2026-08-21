import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ScanFace, TrendingUp, Calendar, CheckCircle2, UserCheck } from 'lucide-react'
import { aiService } from '@/services/aiService'
import { useQuery } from '@tanstack/react-query'
import { useAppSelector } from '@/store/hooks'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils'
import { AiConsultationReport } from './AiConsultationReport'

export function ConsultationsPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const localConsultations = useAppSelector((s) => s.ai.consultations)

  const { data: serverConsultations = [], isLoading } = useQuery({
    queryKey: ['user-consultations', isAuthenticated],
    queryFn: () => (isAuthenticated ? aiService().getConsultations() : Promise.resolve([])),
    enabled: isAuthenticated,
  })

  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Use server consultations if authenticated and available, otherwise fallback to local Redux consultations
  const consultations =
    isAuthenticated && serverConsultations.length > 0
      ? serverConsultations
      : localConsultations

  const latestConsultation = consultations[0]
  const totalCount = consultations.length
  const hasMultiple = totalCount >= 2

  // Calculate real progression metrics from actual user consultation history
  let scoreDiff: number | null = null
  if (hasMultiple) {
    const oldest = consultations[consultations.length - 1]
    const newestScore = latestConsultation?.report?.skinScore ?? 0
    const oldestScore = oldest?.report?.skinScore ?? 0
    scoreDiff = newestScore - oldestScore
  }

  const currentScore = latestConsultation?.report?.skinScore ?? null

  return (
    <div className="container-page py-8 sm:py-10 max-w-5xl mx-auto space-y-8">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE6E9] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
            SKIN INTELLIGENCE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight mt-0.5">
            My Skin Assessments
          </h1>
          <p className="mt-1 text-xs text-[#52636B] font-medium">
            Your skin profile, intelligence assessments and personalized routines.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-5 hover:bg-[#253239] min-h-[44px] border border-[#172126] shadow-2xs">
          <Link to="/skin-analysis">
            <Sparkles className="size-3.5 text-[#167C86] mr-1.5" /> Start AI Skin Analysis →
          </Link>
        </Button>
      </div>

      {/* Guest Session Persist Notification Banner */}
      {!isAuthenticated && consultations.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <p className="font-semibold flex items-center gap-1.5">
              <UserCheck className="size-4 text-amber-700" /> Viewing Guest Assessment Session
            </p>
            <p className="text-[11px] text-amber-800 font-light">
              Sign in or create a BAREO account to permanently save your assessments and skin progression across devices.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="rounded-xl bg-[#172126] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#253239]"
            >
              Sign In →
            </Link>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-[#FAF7F2] border border-[#DCE6E9] animate-pulse" />
          ))}
        </div>
      ) : !consultations || consultations.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<ScanFace className="size-8 text-[#167C86]" />}
            title="No skin consultations yet"
            description="Run your first 60-second AI skin analysis to decode your moisture barrier, hydration levels and receive a custom daily routine."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="rounded-xl bg-[#172126] text-white text-xs px-6 font-semibold hover:bg-[#253239] min-h-[44px] border border-[#172126]">
                  <Link to="/skin-analysis">Start AI Skin Analysis →</Link>
                </Button>
                {!isAuthenticated && (
                  <Button asChild variant="outline" className="rounded-xl border-[#DCE6E9] text-xs font-semibold px-5 min-h-[44px]">
                    <Link to="/login">Sign In to Sync History</Link>
                  </Button>
                )}
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* 2. TOP SUMMARY METRICS STRIP */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-5 space-y-1 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">CURRENT SKIN SCORE</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-normal text-[#172126] leading-none">{currentScore ?? '—'}</span>
                <span className="text-xs text-[#7A8A91] font-medium font-sans">/100</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">CHANGE SINCE INITIAL</span>
              <div className="flex items-center gap-1.5 pt-1">
                {hasMultiple && scoreDiff !== null ? (
                  <span className="font-semibold text-xs text-[#167C86] flex items-center gap-1">
                    <TrendingUp className="size-3.5 text-[#167C86]" /> {scoreDiff >= 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`}
                  </span>
                ) : (
                  <span className="text-xs text-[#52636B] font-light">Baseline Assessment</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#DCE6E9] bg-white p-5 space-y-1 shadow-2xs flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91] block">TOTAL ASSESSMENTS</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl font-normal text-[#172126] leading-none">{totalCount}</span>
                <span className="text-xs text-[#7A8A91] font-medium font-sans">recorded</span>
              </div>
            </div>
          </div>

          {/* 3. LATEST ASSESSMENT HERO CARD */}
          {latestConsultation && (
            <div className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE6E9] pb-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#167C86]/30 bg-[#EDF6F8] px-3 py-1 text-[11px] font-semibold text-[#167C86]">
                  <CheckCircle2 className="size-3.5" /> LATEST ASSESSMENT
                </div>
                <div className="flex items-center gap-3 text-xs text-[#52636B]">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-[#172126]" /> {formatDate(latestConsultation.date)}
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-[#167C86]">
                    AI Confidence: {latestConsultation.report?.confidence ?? 92}%
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-[#FAF7F2] border border-[#DCE6E9] p-4 min-w-[90px]">
                    <span className="font-serif text-4xl font-normal text-[#172126] leading-none">
                      {latestConsultation.report?.skinScore ?? '—'}
                    </span>
                    <span className="text-[10px] text-[#7A8A91] font-medium uppercase mt-0.5">/100</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#172126]">
                      {(latestConsultation.report?.skinScore ?? 0) >= 78 ? 'Healthy Barrier' : (latestConsultation.report?.skinScore ?? 0) >= 60 ? 'Balanced Skin' : 'Requires Focus'}
                    </h3>
                    <p className="text-xs text-[#52636B] font-light mt-0.5">
                      {latestConsultation.answers?.skinType ? `${latestConsultation.answers.skinType} skin` : 'Standard skin profile'} • {latestConsultation.recommendedProductIds?.length || 0} recommended formulations
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setExpandedId(expandedId === latestConsultation.id ? null : latestConsultation.id)}
                  className="rounded-xl bg-[#172126] text-white text-xs font-semibold px-5 hover:bg-[#253239] border border-[#172126] min-h-[40px] shrink-0 shadow-2xs"
                >
                  {expandedId === latestConsultation.id ? 'Hide Full Report' : 'View Full Report →'}
                </Button>
              </div>

              {/* Metrics Quick Preview Bar */}
              <div className="grid grid-cols-3 gap-2 border-t border-[#DCE6E9] pt-4 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91] block">HYDRATION</span>
                  <span className="font-serif text-base font-normal text-[#172126]">{latestConsultation.report?.hydration?.score ?? 0}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91] block">OIL BALANCE</span>
                  <span className="font-serif text-base font-normal text-[#172126]">{latestConsultation.report?.oilBalance?.score ?? 0}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A8A91] block">SENSITIVITY</span>
                  <span className="font-serif text-base font-normal text-[#172126]">{latestConsultation.report?.sensitivity?.score ?? 0}%</span>
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
                    className="overflow-hidden border-t border-[#DCE6E9] pt-6 mt-6 space-y-4"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-[#167C86] flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#167C86]" /> Full Consultation Report
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
