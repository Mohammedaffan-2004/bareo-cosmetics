// AI Skin Assistant service v2.0 — turns consultation answers into an
// explainable clinical dermal intelligence report, routine and product recommendations.

import type { AiConsultation, AiConsultationAnswers, ChatMessage, Product } from '../types'
import { getCatalog } from './productStore'
import { uid } from '../utils'
import { apiFetch } from './apiClient'
import { analyzeImageTelemetry, generateDeterministicReport, type DermalImageMetrics } from '../utils/imageDermalAnalyzer'

/** Deterministic preference score: a product's fit for this skin profile. */
function fitScore(product: Product, answers: AiConsultationAnswers): number {
  let score = 0
  if (answers.concerns && Array.isArray(product.concerns)) {
    score += product.concerns.filter((c) => answers.concerns?.includes(c)).length * 3
  }
  if (answers.skinType && Array.isArray(product.skinTypes) && product.skinTypes.includes(answers.skinType)) score += 2
  if (answers.drySkin && (product.concerns || []).includes('dryness')) score += 2
  if (answers.oilySkin && (product.concerns || []).includes('oiliness')) score += 2
  if (answers.hasSensitiveSkin && (product.concerns || []).includes('sensitivity')) score += 3
  if (answers.hasDarkCircles && product.categorySlug === 'eye-cream') score += 3
  return score
}

export function getProductStepCategory(product: Product): string {
  const name = (product.name || '').toLowerCase()
  const desc = ((product.shortDescription || '') + ' ' + (product.description || '')).toLowerCase()
  const tags = Array.isArray(product.tags) ? product.tags.map((t: string) => t.toLowerCase()) : []

  if (tags.includes('cleanser') || tags.includes('face-wash') || name.includes('wash') || name.includes('cleanser') || desc.includes('cleanser')) {
    return 'cleanser'
  }
  if (tags.includes('sunscreen') || tags.includes('spf') || name.includes('sunscreen') || name.includes('spf') || desc.includes('sunscreen') || desc.includes('spf')) {
    return 'sunscreen'
  }
  if (tags.includes('moisturizer') || tags.includes('cream') || name.includes('cream') || name.includes('lotion') || name.includes('moisturizer') || name.includes('gel') || name.includes('hydrator') || desc.includes('moisturizer')) {
    return 'moisturizer'
  }
  if (tags.includes('toner') || tags.includes('essence') || name.includes('toner') || name.includes('mist') || desc.includes('toner')) {
    return 'toner'
  }
  if (tags.includes('treatment') || name.includes('exfoliat') || name.includes('peel') || name.includes('bha') || name.includes('treatment')) {
    return 'treatment'
  }
  return 'serum'
}

function bestInStep(step: string, answers: AiConsultationAnswers, exclude: Product[] = []): Product | null {
  const source = getCatalog()
  if (!source || source.length === 0) return null

  const candidates = source.filter((p) => {
    if (p.status !== undefined && p.status !== 'active') return false
    if (p.stock !== undefined && p.stock <= 0) return false
    if (exclude.some((x) => x.id === p.id)) return false

    const catSlug = (p.categorySlug || '').toLowerCase()
    if (['babycare', 'haircare', 'bodycare', 'baby-care', 'hair-care', 'body-care', 'scalp'].includes(catSlug)) return false

    const cat = getProductStepCategory(p)
    if (step === 'cleanser') return cat === 'cleanser'
    if (step === 'sunscreen') return cat === 'sunscreen'
    if (step === 'moisturizer') return cat === 'moisturizer'
    if (step === 'toner') return cat === 'toner'
    if (step === 'treatment') return cat === 'treatment' || cat === 'serum'
    return cat === 'serum' || cat === 'treatment'
  })

  if (candidates.length === 0) return null
  candidates.sort((a, b) => fitScore(b, answers) - fitScore(a, answers))
  return candidates[0]
}

function buildRoutineFromCatalog(answers: AiConsultationAnswers): {
  morning: { name: string; time: string; products: Product[] }
  night: { name: string; time: string; products: Product[] }
} {
  const selectedMorning: Product[] = []
  const selectedNight: Product[] = []

  const mCleanser = bestInStep('cleanser', answers, selectedMorning)
  if (mCleanser) selectedMorning.push(mCleanser)

  const mToner = bestInStep('toner', answers, selectedMorning)
  if (mToner) selectedMorning.push(mToner)

  const mSerum = bestInStep('serum', answers, selectedMorning)
  if (mSerum) selectedMorning.push(mSerum)

  const mMoisturizer = bestInStep('moisturizer', answers, selectedMorning)
  if (mMoisturizer) selectedMorning.push(mMoisturizer)

  const mSpf = bestInStep('sunscreen', answers, selectedMorning)
  if (mSpf) selectedMorning.push(mSpf)

  const nCleanser = bestInStep('cleanser', answers, selectedNight) || mCleanser
  if (nCleanser && !selectedNight.some((x) => x.id === nCleanser.id)) selectedNight.push(nCleanser)

  const nTreatment = bestInStep('treatment', answers, selectedNight)
  if (nTreatment) selectedNight.push(nTreatment)

  const nSerum = bestInStep('serum', answers, selectedNight)
  if (nSerum) selectedNight.push(nSerum)

  const nMoisturizer = bestInStep('moisturizer', answers, selectedNight) || mMoisturizer
  if (nMoisturizer && !selectedNight.some((x) => x.id === nMoisturizer.id)) selectedNight.push(nMoisturizer)

  return {
    morning: { name: 'Morning Routine', time: '5 min', products: selectedMorning },
    night: { name: 'Night Routine', time: '6 min', products: selectedNight },
  }
}

function buildLifestyleTips(answers: AiConsultationAnswers): string[] {
  const tips: string[] = []
  if (answers.sunExposure === 'high') tips.push('Apply SPF 50+ broad-spectrum sunscreen every 2 hours during outdoor activity.')
  if (answers.sleepHours === 'less-than-5') tips.push('Aim for 7–8 hours of continuous sleep to support nighttime cellular repair.')
  if (answers.waterIntake === 'low') tips.push('Increase daily water intake to 2.5L to maintain skin cell turgor and hydration.')
  if (answers.skinType === 'sensitive' || answers.hasSensitiveSkin) tips.push('Patch-test all new active products on your inner forearm 24h before full face application.')
  if (answers.oilySkin) tips.push('Use non-comedogenic formulas and avoid over-cleansing which triggers rebound oil production.')
  if (answers.drySkin) tips.push('Apply hydrating serums to damp skin immediately after cleansing to trap moisture.')
  if (tips.length === 0) {
    tips.push('Maintain a consistent routine for at least 4–6 weeks to evaluate skin barrier adaptation.')
    tips.push('Use lukewarm water when cleansing to protect natural surface lipids.')
  }
  return tips
}

async function generateSkinReport(answers: AiConsultationAnswers, selfieSrc?: string | null): Promise<AiConsultation> {
  let telemetry: DermalImageMetrics | null = null
  if (selfieSrc && typeof selfieSrc === 'string' && selfieSrc.startsWith('data:image/')) {
    try {
      telemetry = await analyzeImageTelemetry(selfieSrc)
    } catch (err) {
      console.warn('[AI Service] Image telemetry extraction skipped:', err)
    }
  }

  const report = generateDeterministicReport(answers, telemetry)
  const routine = buildRoutineFromCatalog(answers)
  const catalog = getCatalog()
  const recommended = [...catalog].sort((a, b) => fitScore(b, answers) - fitScore(a, answers)).slice(0, 6)

  const hasValidPhotoAnalysis = Boolean(
    selfieSrc &&
    telemetry?.imageQuality?.usable !== false &&
    telemetry?.eligibility?.eligible === true &&
    telemetry?.eligibility?.faceCount === 1 &&
    telemetry?.eligibility?.reason === 'VALID'
  )

  console.log('[SKIN_ANALYSIS_REPORT_GATE]', {
    imageId: telemetry?.hash,
    eligible: telemetry?.eligibility?.eligible,
    faceCount: telemetry?.eligibility?.faceCount,
    visualAnalysisAllowed: hasValidPhotoAnalysis,
  })

  const payload = {
    answers,
    hasPhotoAnalysis: hasValidPhotoAnalysis,
    dermalMetrics: hasValidPhotoAnalysis ? telemetry : undefined,
    report,
    routine,
    lifestyleTips: buildLifestyleTips(answers),
    recommendedProductIds: recommended.map((p) => p.id),
  }

  try {
    const res = await apiFetch<AiConsultation>('/ai/consultation', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res.data) {
      return res.data
    }
  } catch (err) {
    console.warn('[AI Service] Backend consultation submission error, using local computation:', err)
  }

  const fallbackConsultation: AiConsultation = {
    id: uid('con'),
    date: new Date().toISOString(),
    answers,
    hasPhotoAnalysis: hasValidPhotoAnalysis,
    dermalMetrics: telemetry,
    report: report as any,
    routine,
    lifestyleTips: buildLifestyleTips(answers),
    recommendedProductIds: recommended.map((p) => p.id),
  }

  return fallbackConsultation
}

async function getConsultations(): Promise<AiConsultation[]> {
  try {
    const res = await apiFetch<AiConsultation[]>('/ai/consultations')
    if (Array.isArray(res.data)) {
      return res.data
    }
  } catch (err) {
    console.warn('[AI Service] Error fetching consultations from backend:', err)
  }
  return []
}

async function getChatHistory(): Promise<ChatMessage[]> {
  try {
    const res = await apiFetch<ChatMessage[]>('/ai/chat')
    if (Array.isArray(res.data)) {
      return res.data
    }
  } catch (err) {
    console.warn('[AI Service] Error fetching chat history:', err)
  }
  return []
}

async function chatReply(text: string): Promise<ChatMessage> {
  try {
    const res = await apiFetch<ChatMessage>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    })
    if (res.data) {
      return res.data
    }
  } catch (err) {
    console.warn('[AI Service] Chat reply API error, using keyword fallback:', err)
  }

  const activeCatalog = getCatalog()
  const q = text.toLowerCase()
  let reply = ''
  let products: Product[] = []

  if (q.includes('acne') || q.includes('pimple') || q.includes('breakout')) {
    reply = 'For active acne, look for salicylic acid or azelaic acid. Here are the ones our community rates highest:'
    products = activeCatalog.filter((p) => (p.concerns || []).includes('acne')).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
  } else if (q.includes('pigment') || q.includes('dark spot') || q.includes('tan')) {
    reply = 'Pigmentation needs vitamin C in the AM and SPF discipline. Try these brightening heroes:'
    products = activeCatalog.filter((p) => (p.concerns || []).includes('pigmentation')).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
  } else if (q.includes('dry') || q.includes('flaky') || q.includes('hydrat')) {
    reply = 'Dehydration is under the surface. Pair a hydrating toner with a hyaluronic serum and seal with ceramides:'
    products = activeCatalog.filter((p) => (p.concerns || []).includes('dryness')).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
  } else if (q.includes('oily') || q.includes('shine') || q.includes('pore')) {
    reply = 'Oil control starts with niacinamide and a gel moisturizer — never skip hydration on oily skin:'
    products = activeCatalog.filter((p) => (p.concerns || []).includes('oiliness')).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
  } else {
    reply = 'Our dermal intelligence system formulates routines based on barrier support and hydration. Here are recommended products:'
    products = activeCatalog.slice(0, 3)
  }

  return {
    id: uid('msg'),
    role: 'assistant',
    text: reply,
    products,
    timestamp: new Date().toISOString(),
  }
}

const serviceImpl = {
  generateSkinReport,
  analyzeSkin: generateSkinReport,
  getConsultations,
  getChatHistory,
  chatReply,
}

// Callable function + object properties export for full backward compatibility
export function aiService() {
  return serviceImpl
}

aiService.generateSkinReport = generateSkinReport
aiService.analyzeSkin = generateSkinReport
aiService.getConsultations = getConsultations
aiService.getChatHistory = getChatHistory
aiService.chatReply = chatReply
