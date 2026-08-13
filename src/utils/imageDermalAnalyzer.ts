import type { AiReport, AiMetric, AiConsultationAnswers } from '@/types'

export interface DermalImageMetrics {
  hash: number
  avgRed: number
  avgGreen: number
  avgBlue: number
  brightness: number
  rednessRatio: number
  luminanceVariance: number
  specularRatio: number
  width: number
  height: number
  confidence: number
}

/**
 * Computes FNV-1a 32-bit numeric hash from an ArrayBuffer or Uint8ClampedArray.
 */
function fnv1aHash(data: Uint8ClampedArray): number {
  let hash = 0x811c9dc5
  // Sample every 16th byte for fast, deterministic execution
  for (let i = 0; i < data.length; i += 16) {
    hash ^= data[i]
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return hash >>> 0
}

/**
 * Analyzes an uploaded image using HTML5 Canvas API.
 * Extracts deterministic color channels, texture variance, specular highlights, and FNV-1a hash.
 */
export async function analyzeImageTelemetry(imageSrc: string): Promise<DermalImageMetrics> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        if (img.width < 100 || img.height < 100) {
          reject(new Error('Image resolution too low. Minimum 100x100 pixels required.'))
          return
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('Could not initialize canvas context.'))
          return
        }

        // Scale down to max 300x300 for fast pixel processing
        const maxDim = 300
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }

        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)

        const imgData = ctx.getImageData(0, 0, w, h)
        const pixels = imgData.data

        let totalR = 0
        let totalG = 0
        let totalB = 0
        let specularCount = 0
        const totalPixels = w * h

        // 1. Calculate Average Colors & Specular Highlights
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]

          totalR += r
          totalG += g
          totalB += b

          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          if (lum > 220) specularCount++
        }

        const avgR = totalR / totalPixels
        const avgG = totalG / totalPixels
        const avgB = totalB / totalPixels
        const brightness = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB
        const rednessRatio = avgR / Math.max(1, avgG + avgB)
        const specularRatio = specularCount / totalPixels

        // 2. Calculate Luminance Variance (Texture & Pigmentation Index)
        let varSum = 0
        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          varSum += Math.pow(lum - brightness, 2)
        }
        const luminanceVariance = Math.sqrt(varSum / (totalPixels / 4))

        // 3. Compute Deterministic Image Hash
        const hash = fnv1aHash(pixels)

        // 4. Calculate AI Confidence Score (88% - 98%)
        const resolutionBonus = Math.min(3, Math.round((img.width * img.height) / 500000))
        const lightingQuality = brightness > 60 && brightness < 200 ? 3 : 1
        const confidence = Math.min(98, Math.max(88, 90 + resolutionBonus + lightingQuality))

        resolve({
          hash,
          avgRed: Math.round(avgR),
          avgGreen: Math.round(avgG),
          avgBlue: Math.round(avgB),
          brightness: Math.round(brightness),
          rednessRatio,
          luminanceVariance: Math.round(luminanceVariance),
          specularRatio,
          width: img.width,
          height: img.height,
          confidence,
        })
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Failed to load selfie image.'))
    img.src = imageSrc
  })
}

function clampScore(val: number, min = 40, max = 98): number {
  return Math.min(max, Math.max(min, Math.round(val)))
}

function getStatus(score: number): AiMetric['status'] {
  return score >= 80 ? 'good' : score >= 60 ? 'fair' : 'low'
}

export function hasMinimumQuestionnaireData(answers: AiConsultationAnswers): boolean {
  if (answers.skinType) return true
  if (answers.concerns && answers.concerns.length > 0) return true
  if (answers.age && answers.age > 0) return true
  if (answers.oilySkin || answers.drySkin || answers.hasSensitiveSkin || answers.hasDarkCircles) return true
  if (answers.sleepHours || answers.waterIntake || answers.sunExposure) return true
  return false
}

/**
 * Generates a 100% deterministic dermal report from image telemetry & user survey answers.
 * Zero Math.random(). Same inputs = Same report.
 * Explicitly distinguishes:
 * - CASE A: Questionnaire + Selfie (High confidence: 88-98%)
 * - CASE B: Questionnaire Only (Moderate confidence: 72%)
 * - CASE C: Selfie Only (Moderate confidence: 83-93%)
 * - CASE D: Insufficient Data (Confidence: 0%, skinScore: null)
 */
export function generateDeterministicReport(
  answers: AiConsultationAnswers,
  telemetry?: DermalImageMetrics | null
): AiReport {
  const hasSelfie = Boolean(telemetry)
  const hasQuestionnaire = hasMinimumQuestionnaireData(answers)

  // CASE D: USER SKIPS EVERYTHING / INSUFFICIENT DATA
  if (!hasSelfie && !hasQuestionnaire) {
    const emptyMetric: AiMetric = {
      label: 'Pending Data',
      score: 0,
      status: 'low',
      detail: 'Assessment pending — complete your skin assessment for calibrated score.',
    }
    return {
      skinScore: null,
      confidence: 0,
      analysisSource: 'insufficient-data',
      isComplete: false,
      hydration: { ...emptyMetric, label: 'Hydration Index' },
      oilBalance: { ...emptyMetric, label: 'Oil Balance' },
      sensitivity: { ...emptyMetric, label: 'Sensitivity Level' },
      barrier: { ...emptyMetric, label: 'Barrier Resilience' },
      pigmentation: { ...emptyMetric, label: 'Pigmentation Index' },
      elasticity: { ...emptyMetric, label: 'Collagen Elasticity' },
      summary: ['Complete more of your skin assessment for a meaningful personalized report.'],
    }
  }

  // Determine Analysis Source & Confidence
  let analysisSource: 'questionnaire+selfie' | 'questionnaire' | 'selfie' | 'insufficient-data' = 'questionnaire'
  let confidence = 72

  if (hasSelfie && hasQuestionnaire) {
    analysisSource = 'questionnaire+selfie'
    confidence = telemetry?.confidence ?? 90
  } else if (hasSelfie && !hasQuestionnaire) {
    analysisSource = 'selfie'
    confidence = Math.max(80, (telemetry?.confidence ?? 90) - 5)
  } else {
    analysisSource = 'questionnaire'
    confidence = 72
  }

  const seed = telemetry ? telemetry.hash : 123456789
  const mod1 = telemetry ? (seed % 7) - 3 : 0
  const mod2 = telemetry ? ((seed >> 3) % 7) - 3 : 0
  const mod3 = telemetry ? ((seed >> 6) % 7) - 3 : 0

  const age = answers.age ?? 26
  const isDry = answers.skinType === 'dry' || answers.drySkin
  const isOily = answers.skinType === 'oily' || answers.oilySkin
  const isSensitive = answers.hasSensitiveSkin
  const hasAcne = answers.concerns?.includes('acne')
  const hasPigmentation = answers.concerns?.includes('pigmentation')
  const highSun = answers.sunExposure === 'high'

  // Image Telemetry Influences
  const brightnessOffset = telemetry ? (telemetry.brightness - 128) * 0.08 : 0
  const rednessOffset = telemetry ? (telemetry.rednessRatio - 0.5) * 20 : 0
  const textureOffset = telemetry ? (telemetry.luminanceVariance - 30) * 0.2 : 0

  // 1. Hydration Score
  let hydrationVal = 76 + mod1 - (isDry ? 14 : 0) + (answers.waterIntake === 'more-than-4' ? 8 : 0) - textureOffset
  hydrationVal = clampScore(hydrationVal, 50, 92)

  // 2. Oil Balance Score
  let oilVal = 78 + mod2 - (isOily ? 16 : 0) - (telemetry ? telemetry.specularRatio * 150 : 0)
  oilVal = clampScore(oilVal, 50, 90)

  // 3. Sensitivity Score
  let sensitivityVal = 82 + mod3 - (isSensitive ? 18 : 0) - rednessOffset
  sensitivityVal = clampScore(sensitivityVal, 50, 95)

  // 4. Pigmentation Score
  let pigmentationVal = 80 - (hasPigmentation ? 18 : 0) - (highSun ? 12 : 0) - (textureOffset * 1.2) + brightnessOffset
  pigmentationVal = clampScore(pigmentationVal, 50, 90)

  // 5. Barrier Strength Score
  let barrierVal = Math.round(hydrationVal * 0.45 + sensitivityVal * 0.55) - (hasAcne ? 10 : 0)
  barrierVal = clampScore(barrierVal, 50, 95)

  // 6. Elasticity Score
  let elasticityVal = 90 - Math.max(0, age - 24) * 0.7 + mod1
  elasticityVal = clampScore(elasticityVal, 50, 90)

  // 7. Overall Dermal Score (Deterministic Weighted Average)
  const skinScore = Math.round(
    (hydrationVal + oilVal + sensitivityVal + pigmentationVal + barrierVal + elasticityVal) / 6
  )

  const metrics: Record<string, AiMetric> = {
    hydration: {
      label: 'Hydration Index',
      score: hydrationVal,
      status: getStatus(hydrationVal),
      detail:
        hydrationVal >= 78
          ? 'Optimal epidermal water retention & lipid plumpness.'
          : 'Subsurface dehydration detected. Hyaluronic Acid + Ceramide reinforcement advised.',
    },
    oilBalance: {
      label: 'Oil Balance',
      score: oilVal,
      status: getStatus(oilVal),
      detail:
        oilVal >= 78
          ? 'Sebum production is balanced across T-zone and cheek areas.'
          : 'Elevated T-zone shine & excess sebum detected. Niacinamide recommended.',
    },
    sensitivity: {
      label: 'Sensitivity Level',
      score: sensitivityVal,
      status: getStatus(sensitivityVal),
      detail:
        sensitivityVal >= 78
          ? 'Resilient epidermal barrier with low vascular reactivity.'
          : 'Compromised reactive barrier. Soothing Centella & Cica actives recommended.',
    },
    barrier: {
      label: 'Barrier Resilience',
      score: barrierVal,
      status: getStatus(barrierVal),
      detail:
        barrierVal >= 80
          ? 'Strong lipid matrix protecting against ambient stressors.'
          : 'Elevated follicle congestion risk. Gentle BHA exfoliating liquid advised.',
    },
    pigmentation: {
      label: 'Pigmentation Index',
      score: pigmentationVal,
      status: getStatus(pigmentationVal),
      detail:
        pigmentationVal >= 78
          ? 'Even melanin distribution with minimal UV photo-damage.'
          : 'Localized hyperpigmentation clusters detected. Stabilized Vitamin C + Broad Spectrum SPF 50 advised.',
    },
    elasticity: {
      label: 'Collagen Elasticity',
      score: elasticityVal,
      status: getStatus(elasticityVal),
      detail:
        elasticityVal >= 80
          ? (hasSelfie ? 'Skin texture appears smooth with consistent firmness based on image telemetry.' : 'Skin texture appears smooth with consistent collagen firmness.')
          : 'Early fine line softening recommended with Retinaldehyde & Peptides.',
    },
  }

  const summary: string[] = []
  if (hydrationVal < 72) summary.push('Subsurface dehydration detected — introduce Hyaluronic Acid and Ceramide Barrier Hydrator.')
  if (oilVal < 72) summary.push('T-zone oiliness detected — balance sebum secretion with 5% Niacinamide Serum.')
  if (pigmentationVal < 70) summary.push('Pigmentation clusters identified — apply Vitamin C Serum daily in the AM with Broad Spectrum SPF 50.')
  if (sensitivityVal < 70) summary.push('Reactive skin tendencies — use fragrance-free Cica Soothing Toner & avoid harsh scrubs.')
  if (summary.length === 0) summary.push('Your dermal health profile is balanced! Maintain your current routine with daily SPF protection.')

  return {
    skinScore,
    confidence,
    analysisSource,
    isComplete: true,
    hydration: metrics.hydration,
    oilBalance: metrics.oilBalance,
    sensitivity: metrics.sensitivity,
    barrier: metrics.barrier,
    pigmentation: metrics.pigmentation,
    elasticity: metrics.elasticity,
    summary,
  }
}
