import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Camera,
  ChevronLeft,
  ChevronRight,
  ScanFace,
  CheckCircle2,
  ShieldCheck,
  Activity,
  HeartHandshake,
  Award,
  Upload,
  Lock,
  RefreshCw,
  Check,
  ArrowRight,
} from 'lucide-react'
import type { AiConsultationAnswers, AiConsultation, Concern, SkinType } from '@/types'
import { useAppDispatch } from '@/store/hooks'
import { runAnalysis, setAnalyzing } from '@/store/slices/aiSlice'
import { Stepper } from '@/components/common/Stepper'
import { Button } from '@/components/ui/button'
import { AppSelect } from '@/components/common/AppSelect'
import { AppInput } from '@/components/common/AppInput'
import { AiConsultationReport } from './AiConsultationReport'
import { CONCERNS, SKIN_TYPES, SLEEP_OPTIONS, WATER_OPTIONS, SUN_OPTIONS } from './consultationQuestions'
import { avatarImage } from '@/utils/images'
import { cn } from '@/utils'

const STEPS = [
  { key: 'intro', label: 'Intro' },
  { key: 'questions', label: 'Questions' },
  { key: 'selfie', label: 'Selfie' },
  { key: 'scan', label: 'Scanning' },
  { key: 'report', label: 'Report' },
]

const INTRO_METRICS = [
  { icon: Activity, label: 'Hydration Index', desc: 'Dermal moisture retention' },
  { icon: Sparkles, label: 'Sebum Balance', desc: 'T-zone oil regulation' },
  { icon: ShieldCheck, label: 'Barrier Resilience', desc: 'Epidermal protection' },
  { icon: HeartHandshake, label: 'Sensitivity Level', desc: 'Reactivity to actives' },
  { icon: ScanFace, label: 'Pigmentation Risk', desc: 'Melanin distribution' },
  { icon: Award, label: 'Collagen Elasticity', desc: 'Skin firmness & bounce' },
]

const SCAN_STEPS = [
  { label: 'Hydration analysis', status: 'Analysing hydration levels...' },
  { label: 'Oil balance', status: 'Evaluating T-zone sebum production...' },
  { label: 'Skin sensitivity', status: 'Scanning erythema & reactivity markers...' },
  { label: 'Pigmentation analysis', status: 'Detecting melanin & UV exposure risk...' },
  { label: 'Barrier appearance', status: 'Calculating epidermal lipid barrier score...' },
]

export function SkinAnalysisPage() {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AiConsultationAnswers>({})
  const [selfie, setSelfie] = useState<string | null>(null)
  const [analysisMode, setAnalysisMode] = useState<'photo' | 'questionnaire'>('photo')

  const [scanCheckIndex, setScanCheckIndex] = useState(0)
  const [scanPhaseText, setScanPhaseText] = useState('Preparing dermal scan...')
  const [animatedScore, setAnimatedScore] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const [result, setResult] = useState<AiConsultation | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Defensive Guard: Step 3 (Scanning Screen) should ONLY be reachable when a selfie exists and photo mode is active
  useEffect(() => {
    if (step === 3 && (!selfie || analysisMode === 'questionnaire')) {
      startQuestionnaireAnalysis()
    }
  }, [step, selfie, analysisMode])

  const toggleConcern = (c: Concern) => {
    setAnswers((a) => {
      const current = a.concerns ?? []
      const next = current.includes(c) ? current.filter((x) => x !== c) : [...current, c]
      return { ...a, concerns: next }
    })
  }

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp']
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const validExts = ['jpg', 'jpeg', 'png', 'webp']

    const MIN_FILE_SIZE = 1024
    const MAX_FILE_SIZE = 10 * 1024 * 1024

    const isValidType = validTypes.includes(file.type.toLowerCase()) || validExts.includes(ext)
    const isValidSize = file.size >= MIN_FILE_SIZE && file.size <= MAX_FILE_SIZE

    if (!isValidType || !isValidSize) {
      setError('Please upload a JPG, PNG, or WEBP image between 1KB and 10MB.')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (event) => {
      const src = event.target?.result as string
      if (typeof src === 'string' && src.startsWith('data:image/')) {
        setSelfie(src)
        setError(null)
      } else {
        setError('Please upload a JPG, PNG, or WEBP image between 1KB and 10MB.')
      }
    }
    reader.onerror = () => {
      setError('Please upload a JPG, PNG, or WEBP image between 1KB and 10MB.')
    }
    reader.readAsDataURL(file)
  }

  /**
   * PATH A: PHOTO ANALYSIS FLOW
   * Executed when a valid selfie photo exists and user clicks "Analyse My Skin".
   */
  const startPhotoAnalysis = async () => {
    if (!selfie) {
      startQuestionnaireAnalysis()
      return
    }

    setAnalysisMode('photo')
    dispatch(setAnalyzing(true))
    setStep(3) // Enter Step 3: Scanning screen
    setScanCheckIndex(0)
    setScanComplete(false)
    setScanPhaseText('Preparing dermal scan...')
    setError(null)

    // Run actual consultation analysis with selfie image telemetry
    const consultationPromise = dispatch(runAnalysis(answers, selfie))

    // 0.0s Preparation delay
    await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 500))

    // Progressive scanning presentation sequence (5 indicators: ~650ms per step = 3.25s total)
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setScanCheckIndex(i)
      setScanPhaseText(SCAN_STEPS[i].status)
      await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 650))
    }

    setScanCheckIndex(SCAN_STEPS.length)
    setScanPhaseText('All dermal indicators analysed')
    await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 500))

    setScanPhaseText('Compiling your skin profile...')
    await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 600))

    const consultation = (await consultationPromise) as unknown as AiConsultation | null
    dispatch(setAnalyzing(false))

    if (consultation) {
      setResult(consultation)
      setScanComplete(true)

      const targetScore = consultation.report.skinScore ?? 75
      if (shouldReduceMotion) {
        setAnimatedScore(targetScore)
      } else {
        const steps = 16
        const stepDuration = 35
        for (let i = 1; i <= steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, stepDuration))
          setAnimatedScore(Math.round((targetScore / steps) * i))
        }
      }

      setTimeout(() => {
        setStep(4) // Move to Step 4: Report
      }, shouldReduceMotion ? 200 : 1000)
    } else {
      setError('Analysis could not be completed. Please try uploading a clearer daylight portrait.')
      setStep(2)
    }
  }

  /**
   * PATH B: QUESTIONNAIRE-ONLY ANALYSIS FLOW
   * Executed when the user clicks "Skip & Analyse" or chooses not to upload a selfie.
   * DOES NOT enter Step 3 scanning screen or run photo scanning animation.
   */
  const startQuestionnaireAnalysis = async () => {
    setAnalysisMode('questionnaire')
    setError(null)
    dispatch(setAnalyzing(true))

    // Pass null for selfie to ensure questionnaire-only report generation
    const consultation = (await dispatch(runAnalysis(answers, null))) as unknown as AiConsultation | null
    dispatch(setAnalyzing(false))

    if (consultation) {
      setResult(consultation)
      setAnimatedScore(consultation.report.skinScore ?? 75)
      setStep(4) // Direct transition to Step 4: Report view
    } else {
      setError('Could not generate questionnaire analysis. Please check your survey inputs.')
      setStep(1)
    }
  }

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      {/* Header Section */}
      <div className="mx-auto max-w-3xl text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#FAF7F2] px-3.5 py-1 text-xs font-semibold text-[#111111]">
          <Sparkles className="size-3.5 text-[#7C3AED]" /> Bareo Dermal Intelligence v2.4
        </div>
        <h1 className="font-serif text-3xl font-normal text-[#111111] sm:text-4xl tracking-tight">
          AI Dermal Assessment
        </h1>
        <p className="text-xs text-[#6B7280] font-light max-w-md mx-auto leading-relaxed">
          Clinical-grade skin diagnostic engine analyzing hydration, lipid barrier resilience, and active formulation compatibility.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="mx-auto max-w-2xl">
        <Stepper steps={STEPS} current={step} />
      </div>

      {/* Step Panels Container */}
      <div className="mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          {/* STEP 0: INTRO SCREEN */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-2xs space-y-6"
            >
              <div className="text-center space-y-2.5">
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111]">
                  Clinical-Grade Skin Assessment
                </h2>
                <p className="text-xs text-[#6B7280] font-light max-w-lg mx-auto leading-relaxed">
                  Engineered with dermatologist-reviewed protocols to analyze 6 vital dermal indicators in under 60 seconds.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#111111] pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#059669]" /> Dermatologist-Inspired AI
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#059669]" /> Private Analysis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-[#059669]" /> 60-Second Assessment
                  </span>
                </div>
              </div>

              {/* 6 Key Metrics Grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INTRO_METRICS.map((m) => {
                  const Icon = m.icon
                  return (
                    <div key={m.label} className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2]/60 p-3.5 space-y-1 hover:border-[#111111]/20 transition-colors">
                      <div className="flex size-7 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#111111]">
                        <Icon className="size-3.5" />
                      </div>
                      <h4 className="text-xs font-semibold text-[#111111] pt-0.5">{m.label}</h4>
                      <p className="text-[11px] text-[#6B7280] font-light leading-snug">{m.desc}</p>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <Button
                  size="lg"
                  className="h-11 w-full sm:w-auto px-8 rounded-xl bg-[#111111] text-white font-semibold text-xs transition-colors hover:bg-black min-h-[44px]"
                  onClick={() => setStep(1)}
                >
                  Start Analysis <ChevronRight className="size-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-11 w-full sm:w-auto px-6 rounded-xl border-[#E5E7EB] text-xs font-medium text-[#111111] hover:bg-[#FAFAFA] min-h-[44px]"
                  onClick={() => setStep(1)}
                >
                  Learn More about Methodology
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: QUESTIONS SCREEN */}
          {step === 1 && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-2xs space-y-6"
            >
              <div>
                <h2 className="font-serif text-2xl font-normal text-[#111111]">
                  Personal Skincare Profile
                </h2>
                <p className="text-xs text-[#6B7280] font-light mt-1">
                  Let's understand your skin to calibrate your formulation analysis.
                </p>
              </div>

              {/* Group 1: Personal Information */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111] border-b border-[#E5E7EB] pb-2">
                  1. Personal Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AppInput
                    label="Your Age"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 28"
                    value={answers.age ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, age: Number(e.target.value) || undefined }))}
                  />
                  <AppSelect
                    label="Primary Skin Type"
                    placeholder="Select skin type"
                    value={answers.skinType ?? ''}
                    onValueChange={(v) => setAnswers((a) => ({ ...a, skinType: v as SkinType }))}
                    options={SKIN_TYPES.map((s) => ({ value: s.value, label: s.label }))}
                  />
                </div>
              </div>

              {/* Group 2: Skin Concerns */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111] border-b border-[#E5E7EB] pb-2">
                  2. Skin Concerns (Select all that apply)
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {CONCERNS.map((c) => {
                    const selected = answers.concerns?.includes(c.value)
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => toggleConcern(c.value)}
                        className={cn(
                          'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 border min-h-[36px]',
                          selected
                            ? 'bg-[#111111] text-white border-[#111111] shadow-2xs font-semibold'
                            : 'bg-white text-[#374151] border-[#E5E7EB] hover:border-[#111111]/30 hover:bg-[#FAFAFA]'
                        )}
                      >
                        <span>{c.emoji}</span>
                        <span>{c.label}</span>
                        {selected && <Check className="size-3.5 text-white ml-0.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Group 3: Lifestyle & Environment */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111] border-b border-[#E5E7EB] pb-2">
                  3. Lifestyle & Environment
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <AppSelect
                    label="Sleep Duration"
                    value={answers.sleepHours ?? ''}
                    onValueChange={(v) => setAnswers((a) => ({ ...a, sleepHours: v }))}
                    options={SLEEP_OPTIONS}
                  />
                  <AppSelect
                    label="Daily Water Intake"
                    value={answers.waterIntake ?? ''}
                    onValueChange={(v) => setAnswers((a) => ({ ...a, waterIntake: v }))}
                    options={WATER_OPTIONS}
                  />
                  <AppSelect
                    label="Sun Exposure"
                    value={answers.sunExposure ?? ''}
                    onValueChange={(v) => setAnswers((a) => ({ ...a, sunExposure: v }))}
                    options={SUN_OPTIONS}
                  />
                </div>
              </div>

              {/* Group 4: Quick Dermal Checks */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111111] border-b border-[#E5E7EB] pb-2">
                  4. Quick Dermal Checks
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      ['oilySkin', 'Is your T-zone shiny by noon?'],
                      ['drySkin', 'Does your skin feel tight after washing?'],
                      ['hasSensitiveSkin', 'Do you get redness from active products?'],
                      ['hasDarkCircles', 'Do you experience dark under-eye circles?'],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all text-xs',
                        answers[key]
                          ? 'border-[#111111] bg-[#FAF7F2] font-semibold text-[#111111]'
                          : 'border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#FAFAFA]'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(answers[key])}
                        onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.checked }))}
                        className="size-4 rounded border-[#E5E7EB] accent-[#111111]"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <Button variant="ghost" onClick={() => setStep(0)} className="text-xs text-[#6B7280]">
                  <ChevronLeft className="size-4 mr-1" /> Back
                </Button>
                <Button
                  size="lg"
                  className="h-11 rounded-xl bg-[#111111] text-white text-xs font-semibold px-6 hover:bg-black min-h-[44px]"
                  onClick={() => setStep(2)}
                >
                  Continue to Selfie Scan <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELFIE SCREEN */}
          {step === 2 && (
            <motion.div
              key="selfie"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-2xs space-y-6 text-center"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/webp,image/jpg,.jpg,.jpeg,.png,.webp"
                className="hidden"
              />

              <div>
                <h2 className="font-serif text-2xl font-normal text-[#111111]">
                  Facial Skin Scan
                </h2>
                <p className="text-xs text-[#6B7280] font-light max-w-md mx-auto mt-1">
                  Upload a clear facial photo so we can analyze visible skin texture, hydration and tone — or skip for questionnaire-only analysis.
                </p>
              </div>

              {error && (
                <div className="mx-auto max-w-sm rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  {error}
                </div>
              )}

              {/* STATE A — NO PHOTO UPLOADED YET */}
              {!selfie && (
                <div className="mx-auto max-w-md rounded-3xl border-2 border-dashed border-[#E5E7EB] bg-[#FAFAFA]/70 p-8 space-y-4">
                  <div
                    onClick={triggerFileSelect}
                    className="mx-auto flex size-20 cursor-pointer items-center justify-center rounded-2xl bg-white border border-[#E5E7EB] text-[#111111] shadow-2xs hover:bg-[#FAFAFA] transition-all"
                  >
                    <Camera className="size-9 text-[#111111]" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#111111]">Upload your selfie</p>
                    <p className="text-[11px] text-[#6B7280] font-light">
                      JPG · PNG · WEBP · Max 10MB
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-xl bg-[#111111] text-white text-xs font-semibold h-10 px-5 hover:bg-black min-h-[40px]"
                      onClick={triggerFileSelect}
                    >
                      <Upload className="size-3.5 mr-1.5" /> Upload Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-[#E5E7EB] text-xs font-medium h-10 px-4 text-[#111111] hover:bg-[#FAFAFA] min-h-[40px]"
                      onClick={() => {
                        setSelfie(avatarImage(2, '#0F766E'))
                      }}
                    >
                      Use Sample Portrait
                    </Button>
                  </div>
                </div>
              )}

              {/* STATE B — PHOTO SELECTED PREVIEW */}
              {selfie && (
                <div className="mx-auto max-w-md space-y-6">
                  <div className="relative mx-auto size-52 sm:size-60 overflow-hidden rounded-3xl border border-[#E5E7EB] shadow-xs bg-[#FAF7F2]">
                    <img src={selfie} alt="Selfie Preview" className="size-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                      <span className="rounded-lg bg-[#047857] text-white text-[11px] font-semibold px-3 py-1 flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="size-3.5" /> Photo ready for analysis
                      </span>
                    </div>
                  </div>

                  {/* Concise 5-metric breakdown */}
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAF7F2] p-4 text-left space-y-2 text-xs">
                    <p className="font-semibold text-[#111111]">We'll evaluate:</p>
                    <ul className="grid grid-cols-2 gap-1.5 text-[#6B7280]">
                      <li className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-[#111111]" /> Hydration</li>
                      <li className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-[#111111]" /> Oil balance</li>
                      <li className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-[#111111]" /> Skin sensitivity</li>
                      <li className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-[#111111]" /> Pigmentation</li>
                      <li className="flex items-center gap-1.5 col-span-2"><span className="size-1 rounded-full bg-[#111111]" /> Barrier appearance</li>
                    </ul>
                  </div>

                  {/* Actions for Photo Mode */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full sm:w-auto h-11 rounded-xl bg-[#111111] text-white text-xs font-semibold px-6 hover:bg-black min-h-[44px]"
                      onClick={startPhotoAnalysis}
                    >
                      Analyse My Skin <ArrowRight className="size-4 ml-1.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-11 rounded-xl border-[#E5E7EB] text-xs font-medium text-[#111111] hover:bg-[#FAFAFA] min-h-[44px]"
                      onClick={triggerFileSelect}
                    >
                      <RefreshCw className="size-3.5 mr-1.5" /> Change Photo
                    </Button>
                  </div>
                </div>
              )}

              {/* Privacy Reassurance Banner */}
              <div className="mx-auto max-w-md rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-center text-[11px] text-[#6B7280] font-light flex items-center justify-center gap-2">
                <Lock className="size-3.5 text-[#111111] shrink-0" />
                <span>
                  Photos never leave your device. Dermal metrics are processed locally for your session report.
                </span>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-xs text-[#6B7280]">
                  <ChevronLeft className="size-4 mr-1" /> Back
                </Button>
                {/* Skip Photo Action */}
                <Button
                  type="button"
                  variant={selfie ? 'ghost' : 'default'}
                  className={cn(
                    'h-11 rounded-xl text-xs font-semibold px-6 min-h-[44px]',
                    selfie
                      ? 'text-[#6B7280] hover:text-[#111111] hover:bg-[#FAFAFA]'
                      : 'bg-[#111111] text-white hover:bg-black'
                  )}
                  onClick={() => {
                    setSelfie(null)
                    startQuestionnaireAnalysis()
                  }}
                >
                  Skip &amp; Analyse <ScanFace className="size-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: STATE C & D — PHOTO SCANNING ANIMATION & SCORE REVEAL */}
          {step === 3 && selfie && analysisMode === 'photo' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-8 sm:p-12 text-center space-y-8 shadow-2xs"
            >
              {!scanComplete ? (
                /* STATE C — SCANNING BEAM & PROGRESSIVE CHECKLIST */
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="relative mx-auto size-52 sm:size-60 overflow-hidden rounded-3xl border-2 border-[#7C3AED]/40 bg-[#FAF7F2] shadow-[0_0_20px_rgba(124,58,237,0.15)] transition-all">
                    <img src={selfie} alt="Scanning" className="size-full object-cover" />
                    {/* Laser scanning line */}
                    {!shouldReduceMotion && (
                      <motion.div
                        animate={{ y: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-x-0 h-1 bg-[#7C3AED] shadow-[0_0_12px_#7C3AED]"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-serif text-2xl font-normal text-[#111111]">
                      {scanPhaseText}
                    </h2>
                    <p className="text-xs text-[#6B7280] font-light">
                      {scanCheckIndex < SCAN_STEPS.length
                        ? SCAN_STEPS[scanCheckIndex]?.status
                        : 'Compiling formulation compatibility matrix...'}
                    </p>
                  </div>

                  {/* Synchronized Progressive Checklist */}
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 space-y-2 text-left">
                    {SCAN_STEPS.map((s, idx) => {
                      const isDone = idx < scanCheckIndex
                      const isCurrent = idx === scanCheckIndex
                      return (
                        <div key={s.label} className="flex items-center justify-between text-xs">
                          <span
                            className={cn(
                              'transition-colors',
                              isDone
                                ? 'font-semibold text-[#111111]'
                                : isCurrent
                                ? 'font-semibold text-[#7C3AED]'
                                : 'text-[#9CA3AF]'
                            )}
                          >
                            {s.label}
                          </span>
                          {isDone ? (
                            <span className="text-[#047857] font-bold text-xs">✓</span>
                          ) : isCurrent ? (
                            <span className="size-2 rounded-full bg-[#7C3AED] animate-ping" />
                          ) : (
                            <span className="size-1.5 rounded-full bg-[#D1D5DB]" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FAF7F2] px-4 py-1 text-xs font-medium text-[#111111]">
                    <Sparkles className="size-3.5 text-[#7C3AED]" />
                    <span>
                      Analysing ({Math.min(scanCheckIndex + 1, 5)} of 5 indicators)
                    </span>
                  </div>
                </div>
              ) : (
                /* STATE D — ANALYSIS COMPLETE & SCORE REVEAL */
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6 max-w-md mx-auto py-4"
                >
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#ECFDF5] border border-[#059669]/20 text-[#047857]">
                    <CheckCircle2 className="size-9" />
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#047857]">
                      ✓ Analysis Complete
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] mt-1">
                      Your skin profile is ready.
                    </h2>
                  </div>

                  {/* Score Reveal Box */}
                  <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2] p-6 text-center space-y-1 shadow-2xs">
                    <div className="flex items-baseline justify-center gap-1 font-serif">
                      <span className="text-5xl font-normal text-[#111111]">
                        {animatedScore}
                      </span>
                      <span className="text-sm font-sans font-medium text-[#6B7280]">/100</span>
                    </div>
                    <p className="text-sm font-serif font-semibold text-[#111111]">
                      {result?.report?.skinScore && result.report.skinScore >= 78
                        ? 'Healthy Barrier'
                        : result?.report?.skinScore && result.report.skinScore >= 60
                        ? 'Balanced Skin'
                        : 'Requires Focus'}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4: REPORT PAGE */}
          {step === 4 && result && (
            <motion.div key="report" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Top Banner Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2] p-6">
                <div>
                  <h3 className="font-serif text-xl font-normal text-[#111111]">
                    Diagnostic Profile Compiled
                  </h3>
                  <p className="text-xs text-[#6B7280] font-light mt-0.5">
                    Your formulation routine has been compiled. You can consult with our AI skin assistant anytime.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button asChild variant="outline" className="rounded-xl border-[#E5E7EB] text-xs font-medium h-10 text-[#111111] hover:bg-white min-h-[40px]">
                    <Link to="/skin-analysis/chat"><Sparkles className="size-3.5 text-[#7C3AED] mr-1" /> Ask Follow-up</Link>
                  </Button>
                  <Button asChild className="rounded-xl bg-[#111111] text-white text-xs font-semibold h-10 hover:bg-black min-h-[40px]">
                    <Link to="/account/overview">View in Profile</Link>
                  </Button>
                </div>
              </div>

              <AiConsultationReport consultation={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
