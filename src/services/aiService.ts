// AI Skin Assistant service — turns consultation answers into a
// clinical-looking report, routine and product recommendations.
// Everything is deterministic so the demo feels consistent.

import type { AiConsultation, AiConsultationAnswers, AiMetric, AiReport, AiRoutineStep, ChatMessage, Product } from '../types'
import { PRODUCTS } from '../mocks/productCatalog'
import { MOCK_CONSULTATIONS } from '../mocks/consultations'
import { uid } from '../utils'
import { mockFetch } from './mockApi'

type MetricKey = 'hydration' | 'oilBalance' | 'sensitivity' | 'barrier' | 'pigmentation' | 'elasticity'

function statusFor(score: number): AiMetric['status'] {
  return score >= 80 ? 'good' : score >= 55 ? 'fair' : 'low'
}

/** Deterministic preference score: a product's fit for this skin profile. */
function fitScore(product: Product, answers: AiConsultationAnswers): number {
  let score = 0
  if (answers.concerns) {
    score += product.concerns.filter((c) => answers.concerns?.includes(c)).length * 3
  }
  if (answers.skinType && product.skinTypes.includes(answers.skinType)) score += 2
  if (answers.drySkin && product.concerns.includes('dryness')) score += 2
  if (answers.oilySkin && product.concerns.includes('oiliness')) score += 2
  if (answers.hasSensitiveSkin && product.concerns.includes('sensitivity')) score += 3
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

function bestInStep(step: string, answers: AiConsultationAnswers, exclude: Product[] = []): Product {
  const candidates = PRODUCTS.filter((p) => {
    if (p.status !== undefined && p.status !== 'active') return false
    if (p.stock <= 0) return false
    if (exclude.some((x) => x.id === p.id)) return false
    const cat = getProductStepCategory(p)
    if (step === 'cleanser') return cat === 'cleanser'
    if (step === 'sunscreen') return cat === 'sunscreen'
    if (step === 'moisturizer') return cat === 'moisturizer'
    if (step === 'treatment') return cat === 'treatment' || cat === 'serum'
    if (step === 'serum') return cat === 'serum'
    if (step === 'toner') return cat === 'toner' || cat === 'serum'
    return true
  }).sort((a, b) => fitScore(b, answers) - fitScore(a, answers))

  return candidates[0] || PRODUCTS.filter((p) => (p.status === undefined || p.status === 'active') && p.stock > 0 && !exclude.some((x) => x.id === p.id))[0]
}

export function buildReport(answers: AiConsultationAnswers): AiReport {
  const age = answers.age ?? 25
  const waterOk = answers.waterIntake === 'more-than-4'
  const sleepOk = answers.sleepHours === 'more-than-8' || answers.sleepHours === '6-8'
  const sunHigh = answers.sunExposure === 'high'

  const metrics: Record<MetricKey, AiMetric> = {
    hydration: {
      label: 'Hydration',
      score: (answers.skinType === 'dry' ? 55 : 74) + (waterOk ? 14 : 0),
      status: 'fair',
      detail: answers.skinType === 'dry' ? 'Dullness & tightness detected' : 'Barrier looks reasonably hydrated',
    },
    oilBalance: {
      label: 'Oil Balance',
      score: answers.oilySkin ? 58 : 78,
      status: 'fair',
      detail: answers.oilySkin ? 'Excess sebum in the T-zone' : 'Oil production looks balanced',
    },
    sensitivity: {
      label: 'Sensitivity',
      score: answers.hasSensitiveSkin ? 44 : 84,
      status: 'fair',
      detail: answers.hasSensitiveSkin ? 'Reactive barrier, use fragrance-free actives' : 'Low reactivity detected',
    },
    barrier: {
      label: 'Barrier Resilience',
      score: (answers.concerns?.includes('acne') ? 45 : 78) + (answers.oilySkin ? -10 : 0),
      status: 'fair',
      detail: answers.concerns?.includes('acne') ? 'Moderate breakout activity' : 'Low breakout probability',
    },
    pigmentation: {
      label: 'Pigmentation',
      score: (answers.concerns?.includes('pigmentation') ? 42 : 82) - (sunHigh ? 18 : 0),
      status: 'fair',
      detail: answers.concerns?.includes('pigmentation') ? 'UV spots on the cheeks & forehead' : 'Minimal sun damage',
    },
    elasticity: {
      label: 'Elasticity',
      score: Math.max(45, 92 - Math.max(0, age - 25) * 0.8 - (sleepOk ? 0 : 8)),
      status: 'good',
      detail: age > 34 ? 'Early fine lines softening' : 'Good firmness for your age',
    },
  }

  // clamp 0..100
  Object.values(metrics).forEach((m) => {
    m.score = Math.round(Math.min(100, Math.max(0, m.score)))
    m.status = statusFor(m.score)
  })

  const skinScore = Math.round(
    Object.values(metrics).reduce((sum, m) => sum + m.score, 0) / Object.values(metrics).length
  )

  const summary: string[] = []
  if (metrics.oilBalance.score < 70) summary.push('Your skin leans oily in the T-zone — balance with niacinamide and light-weight gels.')
  if (metrics.hydration.score < 70) summary.push('Dehydration is present under the surface. Layer a hydrating toner and hyaluronic serum.')
  if (metrics.pigmentation.score < 60) summary.push('Pigmentation is your priority. Vitamin C in the AM + SPF daily is non-negotiable.')
  if (metrics.barrier.score < 60) summary.push('Breakout risk is elevated. Introduce a BHA or azelaic acid 2–3 nights a week.')
  if (metrics.sensitivity.score < 55) summary.push('Your barrier is reactive. Stick to fragrance-free, ceramide-rich formulas for 2 weeks.')
  if (metrics.elasticity.score < 70) summary.push('Start a gentle retinal or bakuchiol at night to support collagen.')
  if (summary.length === 0) summary.push('Your skin is in great shape — keep up your consistent routine and SPF.')

  return { skinScore, ...metrics, summary }
}

export function buildRoutine(answers: AiConsultationAnswers, report: AiReport): AiConsultation['routine'] {
  const cleanser = bestInStep('cleanser', answers)
  const serum = bestInStep('serum', answers)
  const moisturizer = bestInStep('moisturizer', answers)
  const sunscreen = bestInStep('sunscreen', answers)
  const treatment = bestInStep('treatment', answers, [serum])

  const morningProducts = [cleanser, serum, moisturizer, sunscreen].filter(
    (p, i, arr) => p && p.stock > 0 && (p.status === undefined || p.status === 'active') && arr.findIndex((x) => x?.id === p?.id) === i
  ) as Product[]

  const nightProducts = [cleanser, treatment || serum, moisturizer].filter(
    (p, i, arr) => p && p.stock > 0 && (p.status === undefined || p.status === 'active') && arr.findIndex((x) => x?.id === p?.id) === i
  ) as Product[]

  const morning: AiRoutineStep = {
    name: 'Morning Routine',
    time: '5 min',
    products: morningProducts,
  }
  const night: AiRoutineStep = {
    name: 'Night Routine',
    time: '6 min',
    products: nightProducts,
  }
  return { morning, night }
}

export function buildLifestyleTips(answers: AiConsultationAnswers): string[] {
  const tips: string[] = []
  if (answers.sleepHours === 'less-than-6') tips.push('Sleep less than 6h slows barrier repair — aim for 7–8 hours.')
  if (answers.waterIntake !== 'more-than-4') tips.push('Increase water intake to ~3 litres a day for plumper skin.')
  if (answers.sunExposure === 'high') tips.push('You get high sun exposure — reapply SPF every 3 hours, even over makeup.')
  if (answers.oilySkin) tips.push('Don’t skip moisturiser on oily skin — a light gel keeps oil production in check.')
  if (answers.hasSensitiveSkin) tips.push('Introduce one active at a time and patch-test for 3 days.')
  tips.push('Change pillowcases twice a week and clean your phone screen daily.')
  return tips
}

import { apiFetch } from './apiClient'
import { analyzeImageTelemetry, generateDeterministicReport, type DermalImageMetrics } from '../utils/imageDermalAnalyzer'

export function aiService() {
  return {
    /** Runs the dermal analysis engine locally and persists consultation to MongoDB via backend API. */
    async analyzeSkin(answers: AiConsultationAnswers, selfieSrc?: string | null): Promise<AiConsultation> {
      let telemetry: DermalImageMetrics | null = null
      if (selfieSrc) {
        try {
          telemetry = await analyzeImageTelemetry(selfieSrc)
        } catch (err) {
          console.warn('[AI Service] Image telemetry fallback:', err)
        }
      }

      const report = generateDeterministicReport(answers, telemetry)
      const routine = buildRoutine(answers, report)
      const recommended = [...routine.morning.products, ...routine.night.products].filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
      )

      const payload = {
        answers,
        selfie: selfieSrc || undefined,
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
        report: report as any,
        routine,
        lifestyleTips: buildLifestyleTips(answers),
        recommendedProductIds: recommended.map((p) => p.id),
      }

      return fallbackConsultation
    },

    /** Retrieves user's saved skin consultation history from MongoDB. */
    async getConsultations(): Promise<AiConsultation[]> {
      try {
        const res = await apiFetch<AiConsultation[]>('/ai/consultations')
        if (Array.isArray(res.data)) {
          return res.data
        }
      } catch (err) {
        console.warn('[AI Service] Error fetching consultations from backend:', err)
      }
      return []
    },

    /** Sends message to AI chat assistant and persists conversation in MongoDB. */
    async chatReply(text: string): Promise<ChatMessage> {
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

      // Fallback keyword reply if unauthenticated
      const q = text.toLowerCase()
      let reply = ''
      let products: Product[] = []

      if (q.includes('acne') || q.includes('pimple') || q.includes('breakout')) {
        reply = 'For active acne, look for salicylic acid or azelaic acid. Here are the ones our community rates highest:'
        products = PRODUCTS.filter((p) => p.concerns.includes('acne')).sort((a, b) => b.rating - a.rating).slice(0, 3)
      } else if (q.includes('pigment') || q.includes('dark spot') || q.includes('tan')) {
        reply = 'Pigmentation needs vitamin C in the AM and SPF discipline. Try these brightening heroes:'
        products = PRODUCTS.filter((p) => p.concerns.includes('pigmentation')).sort((a, b) => b.rating - a.rating).slice(0, 3)
      } else if (q.includes('dry') || q.includes('flaky') || q.includes('hydrat')) {
        reply = 'Dehydration is under the surface. Pair a hydrating toner with a hyaluronic serum and seal with ceramides:'
        products = PRODUCTS.filter((p) => p.concerns.includes('dryness')).sort((a, b) => b.rating - a.rating).slice(0, 3)
      } else if (q.includes('oily') || q.includes('shine') || q.includes('pore')) {
        reply = 'Oil control starts with niacinamide and a gel moisturizer — never skip hydration on oily skin:'
        products = PRODUCTS.filter((p) => p.concerns.includes('oiliness')).sort((a, b) => b.rating - a.rating).slice(0, 3)
      } else if (q.includes('spf') || q.includes('sun')) {
        reply = 'SPF is the single best anti-aging step. Pick your texture from these favourites:'
        products = PRODUCTS.filter((p) => p.categorySlug === 'sunscreen').sort((a, b) => b.rating - a.rating).slice(0, 3)
      } else if (q.includes('wrinkle') || q.includes('aging') || q.includes('fine line')) {
        reply = 'For early aging, introduce a retinal night serum and peptides. Gradual, gentle, consistent:'
        products = PRODUCTS.filter((p) => p.concerns.includes('anti-aging')).sort((a, b) => b.rating - a.rating).slice(0, 3)
      } else {
        reply =
          'I can help with acne, pigmentation, dryness, oiliness, sun protection and anti-aging. Ask me about any concern — or start a full AI skin analysis for a complete routine.'
      }

      return {
        id: uid('msg'),
        role: 'assistant',
        text: reply,
        products: products.length ? products : undefined,
        timestamp: new Date().toISOString(),
      }
    },

    /** Retrieves persisted chat history from MongoDB. */
    async getChatHistory(): Promise<ChatMessage[]> {
      try {
        const res = await apiFetch<ChatMessage[]>('/ai/chat')
        if (Array.isArray(res.data)) {
          return res.data
        }
      } catch (err) {
        console.warn('[AI Service] Error fetching chat history from backend:', err)
      }
      return []
    },
  }
}
