import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Sparkles,
  Camera,
  ChevronLeft,
  CheckCircle2,
  Upload,
  Lock,
  Check,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  BookmarkPlus,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import type { AiConsultationAnswers, AiConsultation, Concern, SkinType } from '@/types'
import { useAppDispatch } from '@/store/hooks'
import { runAnalysis, setAnalyzing } from '@/store/slices/aiSlice'
import { Button } from '@/components/ui/button'
import { AppSelect } from '@/components/common/AppSelect'
import { AppInput } from '@/components/common/AppInput'
import { AiConsultationReport } from './AiConsultationReport'
import { CONCERNS, SLEEP_OPTIONS, WATER_OPTIONS, SUN_OPTIONS } from './consultationQuestions'
import { cn } from '@/utils'
import { analyzeImageTelemetry, type ImageEligibilityResult } from '@/utils/imageDermalAnalyzer'

const SKIN_TYPE_CARDS: { value: SkinType; title: string; desc: string }[] = [
  { value: 'dry', title: 'DRY', desc: 'Skin feels tight after washing or experiences flakiness.' },
  { value: 'combination', title: 'COMBINATION', desc: 'Oily T-zone (forehead, nose, chin) with normal or dry cheeks.' },
  { value: 'oily', title: 'OILY', desc: 'Shine appears quickly, especially through the T-zone.' },
  { value: 'sensitive', title: 'SENSITIVE', desc: 'Easily reacts to active products with redness or burning.' },
  { value: 'normal', title: 'NORMAL', desc: 'Well-balanced moisture with minimal oiliness or dry patches.' },
]

const SCAN_PROGRESS_STEPS = [
  { step: '01', title: 'QUESTIONNAIRE SIGNALS', status: 'Evaluating survey responses...' },
  { step: '02', title: 'VISUAL SIGNALS', status: 'Measuring optical luminance & texture...' },
  { step: '03', title: 'SKIN PROFILE', status: 'Calculating dermal indicator index...' },
  { step: '04', title: 'FORMULATION MATCH', status: 'Selecting compatible catalog actives...' },
]

export type SkinAnalysisState =
  | 'IDLE'          // Initial landing state
  | 'UPLOADING'     // Image loading
  | 'VALIDATING'    // Face detection & quality evaluation running
  | 'VALID'         // Exactly 1 valid human face detected & passed quality checks
  | 'INVALID'       // No face, multiple faces, blurry, screenshot, or product image
  | 'ANALYZING'     // Dermal score computation & scanning
  | 'COMPLETED'     // Dermal intelligence report displayed
  | 'ERROR'         // General error state

export function SkinAnalysisPage() {
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const uploadIdRef = useRef<number>(0)
  const shouldReduceMotion = useReducedMotion()

  // State Machine: 0: Intro, 1: Questions (sub 0..2), 2: Selfie, 3: Image Quality Check, 4: Scanning, 5: Report
  const [step, setStep] = useState(0)
  const [questionSubStep, setQuestionSubStep] = useState(0)
  const [answers, setAnswers] = useState<AiConsultationAnswers>({})
  const [selfie, setSelfie] = useState<string | null>(null)
  const [analysisState, setAnalysisState] = useState<SkinAnalysisState>('IDLE')

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  // Image quality telemetry state
  const [imageQuality, setImageQuality] = useState<{ usable: boolean; qualityScore: number; reason: string } | null>(null)
  const [imageEligibility, setImageEligibility] = useState<ImageEligibilityResult | null>(null)

  // Scanning sequence state
  const [scanStepIndex, setScanStepIndex] = useState(0)
  const [scanPhaseText, setScanPhaseText] = useState('Preparing dermal assessment...')
  const [animatedScore, setAnimatedScore] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const [result, setResult] = useState<AiConsultation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false)

  // Stop camera stream tracks cleanly
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop())
      setCameraStream(null)
    }
    setIsCameraActive(false)
  }

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream()
    }
  }, [cameraStream])

  // Complete State Reset Guard & Invalidation
  const handleResetAnalysis = () => {
    uploadIdRef.current++ // Invalidate any pending async evaluations
    stopCameraStream()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setAnswers({})
    setSelfie(null)
    setImageQuality(null)
    setImageEligibility(null)
    setResult(null)
    setError(null)
    setFormError(null)
    setAnalysisState('IDLE')
    setStep(0)
    setQuestionSubStep(0)
    setScanStepIndex(0)
    setScanComplete(false)
    setSavedProfileSuccess(false)
  }

  const toggleConcern = (c: Concern) => {
    setFormError(null)
    setAnswers((a) => {
      const current = a.concerns ?? []
      const next = current.includes(c) ? current.filter((x) => x !== c) : [...current, c]
      return { ...a, concerns: next }
    })
  }

  const triggerFileSelect = () => {
    uploadIdRef.current++ // Invalidate previous image evaluation
    stopCameraStream()
    setSelfie(null)
    setImageQuality(null)
    setImageEligibility(null)
    setAnalysisState('IDLE')
    setError(null)
    setStep(2) // Return to Visual Skin Check step
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Reset so re-selecting identical file triggers onChange
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const currentUploadId = ++uploadIdRef.current
    const validTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp']
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const validExts = ['jpg', 'jpeg', 'png', 'webp']

    if (!validTypes.includes(file.type.toLowerCase()) && !validExts.includes(ext)) {
      setError('Please upload a JPG, PNG, or WEBP image under 10MB.')
      setAnalysisState('INVALID')
      return
    }

    setError(null)
    setAnalysisState('UPLOADING')

    const reader = new FileReader()
    reader.onload = async (event) => {
      if (currentUploadId !== uploadIdRef.current) return
      const src = event.target?.result as string
      if (typeof src === 'string' && src.startsWith('data:image/')) {
        setSelfie(src)
        await evaluateImage(src, currentUploadId)
      }
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } })
      setCameraStream(stream)
      setIsCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Camera access unavailable. You can upload a selfie photo instead.')
    }
  }

  const captureCameraPhoto = async () => {
    if (!videoRef.current) return
    const currentUploadId = ++uploadIdRef.current
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 400
    canvas.height = video.videoHeight || 400
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      stopCameraStream()
      setSelfie(dataUrl)
      await evaluateImage(dataUrl, currentUploadId)
    }
  }

  const evaluateImage = async (imgSrc: string, reqUploadId?: number) => {
    const currentUploadId = reqUploadId || ++uploadIdRef.current
    setAnalysisState('VALIDATING')
    setStep(3) // Enter Step 3: Image Quality & Face Eligibility Check
    setImageQuality(null)
    setImageEligibility(null)

    try {
      const telemetry = await analyzeImageTelemetry(imgSrc)
      
      // Prevent Stale Async Results: Discard if user retook/reuploaded during async telemetry
      if (currentUploadId !== uploadIdRef.current) {
        console.warn('[SKIN_ANALYSIS_VALIDATION] Stale upload evaluation discarded:', { currentUploadId, activeUploadId: uploadIdRef.current })
        return
      }

      setImageQuality(telemetry.imageQuality)
      setImageEligibility(telemetry.eligibility)

      const isStrictlyValid = Boolean(
        telemetry.eligibility?.eligible === true &&
        telemetry.eligibility?.reason === 'VALID' &&
        telemetry.eligibility?.faceCount === 1
      )

      if (isStrictlyValid) {
        setAnalysisState('VALID')
        console.log('[SKIN_ANALYSIS_VALIDATION]', { imageId: currentUploadId, faceCount: 1, eligibility: true, reason: 'VALID', canAnalyze: true })
      } else {
        setAnalysisState('INVALID')
        console.warn('[SKIN_ANALYSIS_VALIDATION]', { imageId: currentUploadId, faceCount: telemetry.eligibility?.faceCount, eligibility: false, reason: telemetry.eligibility?.reason, canAnalyze: false })
      }
    } catch (err) {
      if (currentUploadId !== uploadIdRef.current) return
      setImageQuality({
        usable: false,
        qualityScore: 30,
        reason: 'Image could not be processed cleanly.',
      })
      setImageEligibility({
        eligible: false,
        reason: 'NO_FACE',
        userMessage: 'Please upload a clear photo of your face. Product images, screenshots and packaging are not supported.',
        faceCount: 0,
        qualityScore: 20,
      })
      setAnalysisState('INVALID')
    }
  }

  /**
   * GATE 2: Runs Photo Analysis Scanning Sequence STRICTLY gated by analysisState === 'VALID'
   */
  const startPhotoAnalysis = async () => {
    console.log('[SKIN_ANALYSIS_GATE]', {
      imageId: uploadIdRef.current,
      analysisState,
      eligible: imageEligibility?.eligible,
      faceCount: imageEligibility?.faceCount,
      reason: imageEligibility?.reason,
      analysisAllowed: analysisState === 'VALID' && imageEligibility?.eligible === true
    })

    // GATE 2 HARD SECURITY STOP: If current upload is not strictly VALID, halt execution immediately!
    if (analysisState !== 'VALID' || !imageEligibility || imageEligibility.eligible !== true || imageEligibility.faceCount !== 1 || imageEligibility.reason !== 'VALID') {
      console.error('[SKIN_ANALYSIS_GATE] Execution blocked: Current image is NOT eligible for dermal analysis.')
      setError("Photo not suitable for dermal assessment. Please upload a well-lit photo of your human face.")
      return
    }

    stopCameraStream()
    setAnalysisState('ANALYZING')
    dispatch(setAnalyzing(true))
    setStep(4) // Enter Step 4: Scanning animation
    setScanStepIndex(0)
    setScanComplete(false)
    setScanPhaseText('Preparing dermal scan...')
    setError(null)

    const consultationPromise = dispatch(runAnalysis(answers, selfie))

    await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 400))

    for (let i = 0; i < SCAN_PROGRESS_STEPS.length; i++) {
      setScanStepIndex(i)
      setScanPhaseText(SCAN_PROGRESS_STEPS[i].status)
      await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 750))
    }

    setScanStepIndex(SCAN_PROGRESS_STEPS.length)
    setScanPhaseText('Compiling formulation matrix...')
    await new Promise((resolve) => setTimeout(resolve, shouldReduceMotion ? 100 : 500))

    const consultation = (await consultationPromise) as unknown as AiConsultation | null
    dispatch(setAnalyzing(false))

    if (consultation) {
      setResult(consultation)
      setScanComplete(true)

      const targetScore = consultation.report?.skinScore ?? 75
      if (shouldReduceMotion) {
        setAnimatedScore(targetScore)
      } else {
        const steps = 15
        for (let i = 1; i <= steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, 30))
          setAnimatedScore(Math.round((targetScore / steps) * i))
        }
      }

      setTimeout(() => {
        setStep(5) // Move to Step 5: Report View
      }, shouldReduceMotion ? 200 : 900)
    } else {
      setError("WE COULDN'T COMPLETE THE ASSESSMENT. Your information is safe. Please try again.")
      setStep(1)
    }
  }

  /**
   * Runs Questionnaire-only Analysis
   */
  const startQuestionnaireAnalysis = async () => {
    stopCameraStream()
    setError(null)
    dispatch(setAnalyzing(true))

    const consultation = (await dispatch(runAnalysis(answers, null))) as unknown as AiConsultation | null
    dispatch(setAnalyzing(false))

    if (consultation) {
      setResult(consultation)
      setAnimatedScore(consultation.report?.skinScore ?? 75)
      setStep(5) // Move to Step 5: Report View
    } else {
      setError("WE COULDN'T COMPLETE THE ASSESSMENT. Please check your survey inputs and try again.")
      setStep(1)
    }
  }

  // Handle Question Step Continuation Validation
  const handleQuestionContinue = () => {
    setFormError(null)
    if (questionSubStep === 0) {
      if (!answers.skinType) {
        setFormError('Please select a skin type that best describes your skin to continue.')
        return
      }
      setQuestionSubStep(1)
    } else if (questionSubStep === 1) {
      if (!answers.concerns || answers.concerns.length === 0) {
        setFormError('Please select at least one focus area to calibrate your analysis.')
        return
      }
      setQuestionSubStep(2)
    } else if (questionSubStep === 2) {
      if (!answers.age || answers.age <= 0) {
        setFormError('Please enter your age to help us calculate skin elasticity.')
        return
      }
      setStep(2) // Move to Selfie step
    }
  }

  return (
    <div className="container-page py-8 sm:py-12 space-y-8">
      {/* Header Badge & Brand Title (for Step > 0) */}
      {step > 0 && (
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E9] bg-[#EDF6F8] px-4 py-1.5 text-xs font-semibold text-[#172126]">
            <Sparkles className="size-3.5 text-[#167C86]" /> BAREO / DERMAL INTELLIGENCE
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#172126] tracking-tight">
            Personal Skin Assessment
          </h1>
          <p className="text-xs sm:text-sm text-[#52636B] font-light max-w-lg mx-auto leading-relaxed">
            Guided AI-assisted assessment analyzing hydration, lipid barrier integrity, and active formulation compatibility.
          </p>
        </div>
      )}

      {/* Main Step Panels Container */}
      <div className={cn('mx-auto transition-all duration-300', step === 0 ? 'max-w-6xl' : 'max-w-3xl')}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/jpeg,image/png,image/webp,image/jpg,.jpg,.jpeg,.png,.webp"
          className="hidden"
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          {/* STEP 0: PREMIUM EDITORIAL INTRO */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-10 lg:p-12 shadow-2xs"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* LEFT COLUMN: EDITORIAL STATEMENT & PRIMARY CTA */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E9] bg-[#EDF6F8] px-3.5 py-1 text-xs font-semibold text-[#172126]">
                      <Sparkles className="size-3.5 text-[#167C86]" /> BAREO / DERMAL INTELLIGENCE
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#172126] tracking-tight leading-[1.15]">
                      Personal Skin Assessment
                    </h1>
                    <h2 className="font-serif text-xl sm:text-2xl text-[#167C86] font-normal leading-snug">
                      "Understand your skin. <br className="hidden sm:inline" /> Then build around it."
                    </h2>
                    <p className="text-xs sm:text-sm text-[#52636B] font-light leading-relaxed max-w-xl">
                      A guided assessment that considers your skin profile, routine priorities, and — when available — visual skin signals.
                    </p>
                  </div>

                  {/* TRUST METADATA CHIPS */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <span className="rounded-full bg-[#FAF7F2] border border-[#DCE6E9] px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-[#172126] uppercase">
                      ~2 MINUTES
                    </span>
                    <span className="rounded-full bg-[#FAF7F2] border border-[#DCE6E9] px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-[#172126] uppercase">
                      PRIVATE
                    </span>
                    <span className="rounded-full bg-[#FAF7F2] border border-[#DCE6E9] px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-[#172126] uppercase">
                      PERSONALIZED
                    </span>
                  </div>

                  {/* PRIMARY CTA & DISCLAIMER */}
                  <div className="space-y-3 pt-2">
                    <Button
                      size="lg"
                      className="h-12 w-full sm:w-auto px-8 rounded-2xl bg-[#172126] text-white font-semibold text-xs transition-all hover:bg-[#253239] border border-[#172126] min-h-[48px] cursor-pointer shadow-2xs"
                      onClick={() => {
                        setStep(1)
                        setQuestionSubStep(0)
                      }}
                    >
                      BEGIN YOUR ASSESSMENT <ArrowRight className="size-4 ml-2 text-[#167C86]" />
                    </Button>
                    <p className="text-[11px] text-[#7A8A91] font-light">
                      Cosmetic skin assessment. Not a medical diagnosis.
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN: RESTRAINED DERMAL INTELLIGENCE PREVIEW (SAMPLE PREVIEW) */}
                <div className="lg:col-span-5 relative rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2]/80 p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-[#167C86]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#172126]">
                        DERMAL PROFILE
                      </span>
                    </div>
                    <span className="rounded-md bg-white border border-[#DCE6E9] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#167C86]">
                      SAMPLE PREVIEW
                    </span>
                  </div>

                  {/* SAMPLE INDICATORS */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-serif font-medium text-[#172126]">Combination · Sensitive</span>
                      <span className="text-[10px] font-bold text-[#167C86]">INDEX 78/100</span>
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] text-[#52636B] mb-1">
                          <span>HYDRATION</span>
                          <span className="font-medium text-[#172126]">84%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#DCE6E9] overflow-hidden">
                          <div className="h-full bg-[#167C86] rounded-full w-[84%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-[#52636B] mb-1">
                          <span>BARRIER INTEGRITY</span>
                          <span className="font-medium text-[#172126]">78%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#DCE6E9] overflow-hidden">
                          <div className="h-full bg-[#167C86] rounded-full w-[78%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-[#52636B] mb-1">
                          <span>OIL BALANCE</span>
                          <span className="font-medium text-[#172126]">65%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#DCE6E9] overflow-hidden">
                          <div className="h-full bg-[#167C86] rounded-full w-[65%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SAMPLE ROUTINE MATCH */}
                  <div className="border-t border-[#DCE6E9] pt-3 space-y-2 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8A91] block">
                      PERSONALIZED ROUTINE MATCH
                    </span>
                    <div className="space-y-1.5 text-xs text-[#172126]">
                      <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-[#DCE6E9]/60">
                        <span className="text-[#167C86] font-bold text-[10px]">01</span>
                        <span className="font-medium truncate text-[11.5px]">Dewy Barrier Hyaluronic Cleanser</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-[#DCE6E9]/60">
                        <span className="text-[#167C86] font-bold text-[10px]">02</span>
                        <span className="font-medium truncate text-[11.5px]">Cica Niacinamide Calming Serum</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-[#DCE6E9]/60">
                        <span className="text-[#167C86] font-bold text-[10px]">03</span>
                        <span className="font-medium truncate text-[11.5px]">Centella Cica Soothing Gel</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: GUIDED QUESTION EXPERIENCE (SUB-STEPS 0..2) */}
          {step === 1 && (
            <motion.div
              key={`questions-${questionSubStep}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-10 shadow-2xs space-y-8"
            >
              {/* Question Header & Step Counter */}
              <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86]">
                  QUESTION 0{questionSubStep + 1} / 03
                </span>
                <span className="text-xs font-medium text-[#7A8A91]">
                  {questionSubStep === 0 ? 'Skin profile' : questionSubStep === 1 ? 'Primary concerns' : 'Daily environment'}
                </span>
              </div>

              {formError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-700 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SUB-STEP 0: SKIN TYPE SELECTION CARDS */}
              {questionSubStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126]">
                      What best describes your skin?
                    </h2>
                    <p className="text-xs text-[#52636B] font-light mt-1">
                      Select the primary characteristic that feels most consistent daily.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {SKIN_TYPE_CARDS.map((card) => {
                      const isSelected = answers.skinType === card.value
                      return (
                        <button
                          key={card.value}
                          type="button"
                          onClick={() => {
                            setFormError(null)
                            setAnswers((a) => ({ ...a, skinType: card.value }))
                          }}
                          className={cn(
                            'flex flex-col justify-between text-left p-5 rounded-2xl border transition-all duration-200 min-h-[110px]',
                            isSelected
                              ? 'border-[#167C86] bg-[#FAF7F2] shadow-2xs ring-1 ring-[#167C86]'
                              : 'border-[#DCE6E9] bg-white hover:border-[#172126]/30 hover:bg-[#FAF7F2]/50'
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-[#172126] tracking-wider">{card.title}</span>
                            {isSelected ? (
                              <div className="flex size-5 items-center justify-center rounded-full bg-[#167C86] text-white">
                                <Check className="size-3" />
                              </div>
                            ) : (
                              <span className="size-4 rounded-full border border-[#DCE6E9]" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#52636B] font-light leading-relaxed mt-2">
                            {card.desc}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SUB-STEP 1: PRIMARY CONCERNS MULTI-SELECT */}
              {questionSubStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126]">
                      Select your primary skin focus areas
                    </h2>
                    <p className="text-xs text-[#52636B] font-light mt-1">
                      Choose all concerns you would like BAREO products to target.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {CONCERNS.map((c) => {
                      const isSelected = answers.concerns?.includes(c.value)
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => toggleConcern(c.value)}
                          className={cn(
                            'flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-xs min-h-[54px]',
                            isSelected
                              ? 'border-[#167C86] bg-[#FAF7F2] font-semibold text-[#172126] ring-1 ring-[#167C86]'
                              : 'border-[#DCE6E9] bg-white text-[#52636B] hover:border-[#172126]/30 hover:bg-[#FAF7F2]/50'
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-base">{c.emoji}</span>
                            <span>{c.label}</span>
                          </span>
                          {isSelected ? (
                            <div className="flex size-5 items-center justify-center rounded-full bg-[#167C86] text-white shrink-0">
                              <Check className="size-3" />
                            </div>
                          ) : (
                            <span className="size-4 rounded-full border border-[#DCE6E9] shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SUB-STEP 2: AGE & LIFESTYLE HABITS */}
              {questionSubStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126]">
                      Tell us about your daily environment
                    </h2>
                    <p className="text-xs text-[#52636B] font-light mt-1">
                      Environmental exposure directly affects epidermal barrier resilience.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <AppInput
                      label="Your Age"
                      type="number"
                      inputMode="numeric"
                      placeholder="e.g. 28"
                      value={answers.age ?? ''}
                      onChange={(e) => {
                        setFormError(null)
                        setAnswers((a) => ({ ...a, age: Number(e.target.value) || undefined }))
                      }}
                    />

                    <AppSelect
                      label="Sleep Duration"
                      placeholder="Select average sleep"
                      value={answers.sleepHours ?? ''}
                      onValueChange={(v) => setAnswers((a) => ({ ...a, sleepHours: v }))}
                      options={SLEEP_OPTIONS}
                    />

                    <AppSelect
                      label="Daily Water Intake"
                      placeholder="Select water intake"
                      value={answers.waterIntake ?? ''}
                      onValueChange={(v) => setAnswers((a) => ({ ...a, waterIntake: v }))}
                      options={WATER_OPTIONS}
                    />

                    <AppSelect
                      label="Sun Exposure"
                      placeholder="Select sun exposure"
                      value={answers.sunExposure ?? ''}
                      onValueChange={(v) => setAnswers((a) => ({ ...a, sunExposure: v }))}
                      options={SUN_OPTIONS}
                    />
                  </div>

                  {/* Adaptive Indicator Badge */}
                  <div className="rounded-2xl border border-[#DCE6E9] bg-[#EDF6F8]/60 p-3.5 text-xs text-[#167C86] font-medium flex items-center gap-2">
                    <Sparkles className="size-4 shrink-0 text-[#167C86]" />
                    <span>3 questions tailored to your responses</span>
                  </div>
                </div>
              )}

              {/* Bottom Progress & Navigation Bar */}
              <div className="space-y-4 pt-4 border-t border-[#DCE6E9]">
                {/* Visual Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE6E9]/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((questionSubStep + 1) / 3) * 100}%` }}
                    className="h-full rounded-full bg-[#167C86]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFormError(null)
                      if (questionSubStep > 0) {
                        setQuestionSubStep((s) => s - 1)
                      } else {
                        setStep(0)
                      }
                    }}
                    className="text-xs text-[#52636B] hover:text-[#172126]"
                  >
                    <ChevronLeft className="size-4 mr-1" /> BACK
                  </Button>

                  <Button
                    size="lg"
                    className="h-11 rounded-xl bg-[#172126] text-white text-xs font-semibold px-6 hover:bg-[#253239] min-h-[44px]"
                    onClick={handleQuestionContinue}
                  >
                    CONTINUE →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: VISUAL SKIN CHECK (SELFIE STEP) */}
          {step === 2 && (
            <motion.div
              key="selfie"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-10 shadow-2xs space-y-6 text-center"
            >
              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
                  OPTIONAL VISUAL SIGNAL
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126]">
                  Visual Skin Check
                </h2>
                <p className="text-xs text-[#52636B] font-light leading-relaxed">
                  Let's add one visual signal. Your camera image helps us complement your questionnaire with visual telemetry.
                </p>
              </div>

              {error && (
                <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900 space-y-2 text-center">
                  <p>{error}</p>
                  <div className="flex justify-center gap-2 pt-1">
                    <Button type="button" size="sm" onClick={triggerFileSelect} className="rounded-xl bg-[#172126] text-white text-xs px-4">
                      UPLOAD PHOTO
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => startQuestionnaireAnalysis()} className="rounded-xl border-[#DCE6E9] text-xs">
                      CONTINUE WITHOUT PHOTO
                    </Button>
                  </div>
                </div>
              )}

              {/* CAMERA STREAM VIEW */}
              {isCameraActive ? (
                <div className="mx-auto max-w-sm space-y-4">
                  <div className="relative mx-auto size-64 overflow-hidden rounded-full border-4 border-[#167C86] bg-black shadow-lg">
                    <video ref={videoRef} autoPlay playsInline className="size-full object-cover" />
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/60 pointer-events-none" />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                      type="button"
                      size="lg"
                      className="rounded-xl bg-[#167C86] text-white text-xs font-semibold h-11 px-6 hover:bg-[#13646D]"
                      onClick={captureCameraPhoto}
                    >
                      <Camera className="size-4 mr-1.5" /> CAPTURE PHOTO
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="rounded-xl border-[#DCE6E9] text-xs font-medium h-11 px-4 text-[#172126]"
                      onClick={stopCameraStream}
                    >
                      CANCEL
                    </Button>
                  </div>
                </div>
              ) : (
                /* CAMERA / UPLOAD AREA WITH FRAMING GUIDE */
                <div className="mx-auto max-w-md rounded-3xl border-2 border-dashed border-[#DCE6E9] bg-[#FAF7F2]/60 p-8 space-y-6">
                  <div className="relative mx-auto flex size-44 items-center justify-center rounded-full border-2 border-[#167C86]/40 bg-white shadow-2xs">
                    <Camera className="size-10 text-[#167C86]" />
                    <div className="absolute inset-0 rounded-full border border-dashed border-[#167C86]/60 animate-spin-slow" />
                  </div>

                  {/* Photo Instructions List */}
                  <div className="rounded-2xl border border-[#DCE6E9] bg-white p-4 text-left space-y-1.5 text-xs text-[#52636B]">
                    <p className="font-semibold text-[#172126] mb-1">For optimal visual accuracy:</p>
                    <p>• FACE THE CAMERA DIRECTLY</p>
                    <p>• USE NATURAL DAYLIGHT</p>
                    <p>• REMOVE SUNGLASSES</p>
                    <p>• KEEP FACE CLEAR</p>
                  </div>

                  {/* Privacy Guarantee Note */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A8A91] font-light">
                    <Lock className="size-3.5 text-[#167C86] shrink-0" />
                    <span>Processed locally for visual analysis. Photos are never stored or uploaded.</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      type="button"
                      size="lg"
                      className="w-full sm:w-auto h-11 rounded-xl bg-[#172126] text-white text-xs font-semibold px-5 hover:bg-[#253239]"
                      onClick={startCamera}
                    >
                      <Camera className="size-4 mr-1.5 text-[#167C86]" /> USE CAMERA
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto h-11 rounded-xl border-[#DCE6E9] text-xs font-medium px-5 text-[#172126] hover:bg-white"
                      onClick={triggerFileSelect}
                    >
                      <Upload className="size-4 mr-1.5 text-[#167C86]" /> UPLOAD PHOTO
                    </Button>
                  </div>
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-[#DCE6E9]">
                <Button
                  variant="ghost"
                  onClick={() => {
                    stopCameraStream()
                    setStep(1)
                  }}
                  className="text-xs text-[#52636B]"
                >
                  <ChevronLeft className="size-4 mr-1" /> BACK
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs font-semibold text-[#52636B] hover:text-[#172126]"
                  onClick={() => {
                    stopCameraStream()
                    setSelfie(null)
                    startQuestionnaireAnalysis()
                  }}
                >
                  SKIP FOR NOW →
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: IMAGE QUALITY & FACE ELIGIBILITY CHECK */}
          {step === 3 && selfie && (
            <motion.div
              key="quality-check"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-3xl border border-[#DCE6E9] bg-white p-6 sm:p-10 shadow-2xs space-y-6 text-center max-w-md mx-auto"
            >
              <h2 className="font-serif text-2xl font-normal text-[#172126] tracking-tight">
                CHECKING YOUR PHOTO
              </h2>

              <div className="relative mx-auto size-40 overflow-hidden rounded-full border-2 border-[#167C86] shadow-2xs">
                <img src={selfie} alt="Preview" className="size-full object-cover" />
              </div>

              {/* Compact 3-Row Validation Summary */}
              <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-4 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#172126]">
                  <span className="font-normal text-[#52636B]">Image quality</span>
                  <span className="text-[#167C86] font-semibold text-[11px] flex items-center gap-1">
                    {imageQuality?.usable !== false ? <CheckCircle className="size-3.5 text-[#167C86]" /> : <XCircle className="size-3.5 text-rose-600" />} {imageQuality?.usable !== false ? 'PASS' : 'NEEDS ATTENTION'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#172126]">
                  <span className="font-normal text-[#52636B]">Human face</span>
                  {analysisState === 'VALIDATING' ? (
                    <span className="text-[#167C86] font-semibold text-[11px] flex items-center gap-1">
                      <RefreshCw className="size-3 animate-spin text-[#167C86]" /> VERIFYING...
                    </span>
                  ) : imageEligibility?.reason === 'NO_FACE' || imageEligibility?.eligible === false ? (
                    <span className="text-rose-700 font-semibold text-[11px] flex items-center gap-1">
                      <XCircle className="size-3.5 text-rose-600" /> NOT DETECTED
                    </span>
                  ) : imageEligibility?.reason === 'MULTIPLE_FACES' ? (
                    <span className="text-amber-700 font-semibold text-[11px]">MULTIPLE FACES</span>
                  ) : (
                    <span className="text-[#167C86] font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle className="size-3.5 text-[#167C86]" /> 1 FACE DETECTED
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[#172126]">
                  <span className="font-normal text-[#52636B]">Face visibility</span>
                  {analysisState === 'VALIDATING' ? (
                    <span className="text-[#52636B] font-normal text-[11px]">CHECKING...</span>
                  ) : imageEligibility?.reason === 'NO_FACE' || imageEligibility?.eligible === false ? (
                    <span className="text-[#7A8A91] font-normal text-[11px]">
                      — NOT AVAILABLE
                    </span>
                  ) : imageEligibility?.reason === 'FACE_TOO_SMALL' ? (
                    <span className="text-amber-700 font-semibold text-[11px]">FACE TOO FAR</span>
                  ) : imageEligibility?.reason === 'FACE_NOT_VISIBLE' ? (
                    <span className="text-amber-700 font-semibold text-[11px]">FACE OBSTRUCTED</span>
                  ) : (
                    <span className="text-[#167C86] font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle className="size-3.5 text-[#167C86]" /> OPTIMAL
                    </span>
                  )}
                </div>
              </div>

              {/* GATE 1: Premium Soft-Tint Invalid Message & Action Gating */}
              {analysisState === 'VALIDATING' ? (
                <div className="rounded-2xl border border-[#DCE6E9] bg-[#FAF7F2] p-4 text-center space-y-2">
                  <RefreshCw className="size-5 text-[#167C86] animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-[#172126]">Validating photo telemetry...</p>
                </div>
              ) : analysisState === 'VALID' && imageEligibility?.eligible === true ? (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    size="lg"
                    className="w-full h-11 rounded-xl bg-[#172126] text-white text-xs font-semibold hover:bg-[#253239]"
                    onClick={startPhotoAnalysis}
                  >
                    ANALYSE MY SKIN →
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-11 rounded-xl border-[#DCE6E9] text-xs font-medium text-[#172126]"
                    onClick={triggerFileSelect}
                  >
                    RETAKE
                  </Button>
                </div>
              ) : (
                <div className="space-y-5 text-left pt-1">
                  {/* Soft Warm-Rose Tint Panel */}
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 space-y-2 text-xs">
                    <p className="font-bold text-[#172126] uppercase tracking-wider text-[11px]">
                      PHOTO NEEDS ANOTHER TRY
                    </p>
                    <p className="text-[#52636B] font-normal leading-relaxed">
                      We couldn't verify a clear human face in this photo. Please upload a well-lit photo with your face clearly visible.
                    </p>
                    <p className="text-[#7A8A91] text-[11px] font-light pt-0.5">
                      Product images, packaging and screenshots aren't supported.
                    </p>
                  </div>

                  {/* Compact Horizontal Photo Hints */}
                  <div className="text-center pt-1 text-[11px] text-[#7A8A91] space-y-1">
                    <p className="font-medium text-[#52636B]">For best results</p>
                    <p className="font-light">Face the camera directly &middot; Natural light &middot; Face clearly visible</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2.5 pt-1">
                    <Button
                      size="lg"
                      className="w-full h-11 rounded-xl bg-[#172126] text-white text-xs font-semibold hover:bg-[#253239] border border-[#172126]"
                      onClick={triggerFileSelect}
                    >
                      TRY ANOTHER PHOTO →
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full h-11 rounded-xl border-[#DCE6E9] text-xs font-medium text-[#52636B] hover:text-[#172126] hover:bg-[#FAF7F2]"
                      onClick={() => {
                        setSelfie(null)
                        startQuestionnaireAnalysis()
                      }}
                    >
                      CONTINUE WITHOUT PHOTO →
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: SIGNATURE SCANNING EXPERIENCE (3-5s SEQUENCE) */}
          {step === 4 && (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-3xl border border-[#DCE6E9] bg-white p-8 sm:p-12 text-center space-y-8 shadow-2xs max-w-lg mx-auto"
            >
              {!scanComplete ? (
                <div className="space-y-6">
                  {/* Facial Telemetry Scanning Beam */}
                  {selfie ? (
                    <div className="relative mx-auto size-52 sm:size-60 overflow-hidden rounded-full border-2 border-[#167C86]/40 bg-[#EDF6F8] shadow-[0_0_25px_rgba(22,124,134,0.2)]">
                      <img src={selfie} alt="Scanning" className="size-full object-cover" />
                      {!shouldReduceMotion && (
                        <motion.div
                          animate={{ y: ['0%', '100%', '0%'] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-x-0 h-1 bg-[#167C86] shadow-[0_0_14px_#167C86]"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="relative mx-auto flex size-44 items-center justify-center rounded-full border-2 border-[#167C86] bg-[#EDF6F8]">
                      <Sparkles className="size-10 text-[#167C86] animate-pulse" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h2 className="font-serif text-2xl font-normal text-[#172126]">
                      ANALYZING YOUR SKIN
                    </h2>
                    <p className="text-xs text-[#52636B] font-light">
                      {scanPhaseText}
                    </p>
                  </div>

                  {/* Progressive Step Sequence */}
                  <div className="rounded-2xl border border-[#DCE6E9] bg-[#EDF6F8]/60 p-4 space-y-2.5 text-left">
                    {SCAN_PROGRESS_STEPS.map((s, idx) => {
                      const isDone = idx < scanStepIndex
                      const isCurrent = idx === scanStepIndex
                      return (
                        <div key={s.step} className="flex items-center justify-between text-xs">
                          <span className={cn('transition-colors', isDone ? 'font-semibold text-[#172126]' : isCurrent ? 'font-semibold text-[#167C86]' : 'text-[#7A8A91]')}>
                            {s.step} {s.title}
                          </span>
                          {isDone ? (
                            <span className="text-[#167C86] font-bold text-xs">COMPLETE</span>
                          ) : isCurrent ? (
                            <span className="text-[#167C86] font-semibold text-[11px] animate-pulse">ANALYZING</span>
                          ) : (
                            <span className="text-[#7A8A91] text-[11px]">PENDING</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* REVEAL COMPLETE STATE */
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 py-4">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#EDF6F8] text-[#167C86]">
                    <CheckCircle2 className="size-9" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#167C86]">
                      ✓ Assessment Complete
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#172126] mt-1">
                      Your skin profile is ready ({animatedScore}/100).
                    </h2>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 5: FULL REPORT, FORMULATION MATCH & SAVE PROFILE */}
          {step === 5 && result && (
            <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-[#DCE6E9] bg-[#FAF7F2] p-6">
                <div>
                  <h3 className="font-serif text-xl font-normal text-[#172126]">
                    YOUR SKIN PROFILE IS READY
                  </h3>
                  <p className="text-xs text-[#52636B] font-light mt-0.5">
                    Keep this assessment in your BAREO account and use it as your starting point.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    className="rounded-xl bg-[#172126] text-white text-xs font-semibold h-10 px-5 hover:bg-[#253239]"
                    onClick={() => setSavedProfileSuccess(true)}
                  >
                    <BookmarkPlus className="size-3.5 mr-1.5 text-[#167C86]" />
                    {savedProfileSuccess ? 'PROFILE SAVED ✓' : 'SAVE MY SKIN PROFILE →'}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-[#DCE6E9] text-xs font-medium h-10 text-[#172126] hover:bg-white"
                    onClick={handleResetAnalysis}
                  >
                    <RotateCcw className="size-3.5 mr-1.5" /> START AGAIN
                  </Button>
                </div>
              </div>

              {/* Renders Dermal Report & Recommendations */}
              <AiConsultationReport consultation={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
