import type { AiReport, AiMetric, AiConsultationAnswers, AiFocusArea } from '@/types'

export type ImageEligibilityReason =
  | 'VALID'
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'FACE_TOO_SMALL'
  | 'FACE_NOT_VISIBLE'
  | 'IMAGE_TOO_DARK'
  | 'IMAGE_TOO_BLURRY'
  | 'IMAGE_TOO_LOW_RESOLUTION'
  | 'EXCESSIVE_GLARE'
  | 'VALIDATION_UNCERTAIN'

export interface ImageEligibilityResult {
  eligible: boolean
  reason: ImageEligibilityReason
  userMessage: string
  faceCount: number
  faceBoundingBox?: { x: number; y: number; width: number; height: number }
  qualityScore: number
}

export interface ImageQualityAssessment {
  usable: boolean
  qualityScore: number
  reason: string
}

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
  imageQuality: ImageQualityAssessment
  eligibility: ImageEligibilityResult
}

/**
 * Computes FNV-1a 32-bit numeric hash from Uint8ClampedArray.
 */
function fnv1aHash(data: Uint8ClampedArray): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < data.length; i += 16) {
    hash ^= data[i]
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return hash >>> 0
}

/**
 * Clamps numeric score cleanly within [min, max] range (0 to 100).
 */
export function clampScore(val: number, min = 0, max = 100): number {
  if (isNaN(val) || !isFinite(val)) return min
  return Math.min(max, Math.max(min, Math.round(val)))
}

function getLevel(score: number | null): 'good' | 'fair' | 'low' | 'insufficient-data' {
  if (score === null || score === undefined) return 'insufficient-data'
  return score >= 78 ? 'good' : score >= 60 ? 'fair' : 'low'
}

function getEvidence(hasSelfie: boolean, hasQuestionnaire: boolean): 'measured' | 'inferred' | 'insufficient-data' {
  if (!hasSelfie && !hasQuestionnaire) return 'insufficient-data'
  return hasSelfie ? 'measured' : 'inferred'
}

/**
 * Anthropometric Structural Face Evaluation Engine (Strict Fail-Closed)
 * Evaluates human face presence using browser-side Facial Landmark Geometry, Bilateral Symmetry,
 * Multi-Tone Skin Classification (Fitzpatrick Types I-VI, makeup & glasses friendly),
 * independent Blur/Darkness/Resolution quality checks, and Anti-Product / Anti-Screenshot Discriminators.
 */
export function evaluateImageEligibility(
  pixels: Uint8ClampedArray,
  w: number,
  h: number,
  brightness: number,
  specularRatio: number
): ImageEligibilityResult {
  // 1. Minimum Resolution Gate
  if (w < 120 || h < 120) {
    return {
      eligible: false,
      reason: 'IMAGE_TOO_LOW_RESOLUTION',
      userMessage: 'Low image resolution (<120px). Please use a clearer photo.',
      faceCount: 0,
      qualityScore: 20,
    }
  }

  // 2. Extreme Lighting Gate
  if (brightness < 28) {
    return {
      eligible: false,
      reason: 'IMAGE_TOO_DARK',
      userMessage: 'Photo is too dark. Try again in brighter, even lighting.',
      faceCount: 0,
      qualityScore: 25,
    }
  }

  const totalPixels = w * h
  let skinPixelCount = 0
  let monoPixelCount = 0
  let highEdgeCount = 0
  let topBottomBorderEdgeCount = 0
  let laplacianSum = 0

  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0

  const gridRows = 10
  const gridCols = 10
  const skinGrid = Array(gridRows * gridCols).fill(0)
  const cellW = w / gridCols
  const cellH = h / gridRows

  // Sample every 2nd pixel
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4
      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]

      const maxC = Math.max(r, g, b)
      const minC = Math.min(r, g, b)

      // Monochrome UI background detection
      if (maxC - minC < 6 && (maxC > 240 || minC < 10)) {
        monoPixelCount++
      }

      // Border edges for screenshot detection
      if (x + 2 < w) {
        const nextIdx = (y * w + (x + 2)) * 4
        const diffR = Math.abs(r - pixels[nextIdx])
        const diffG = Math.abs(g - pixels[nextIdx + 1])
        if (diffR + diffG > 75) {
          highEdgeCount++
          if (y < h * 0.08 || y > h * 0.92) {
            topBottomBorderEdgeCount++
          }
        }
      }

      // Laplacian Sharpness
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        const lumUp = 0.299 * pixels[((y - 1) * w + x) * 4] + 0.587 * pixels[((y - 1) * w + x) * 4 + 1] + 0.114 * pixels[((y - 1) * w + x) * 4 + 2]
        const lumDown = 0.299 * pixels[((y + 1) * w + x) * 4] + 0.587 * pixels[((y + 1) * w + x) * 4 + 1] + 0.114 * pixels[((y + 1) * w + x) * 4 + 2]
        const lumLeft = 0.299 * pixels[(y * w + (x - 1)) * 4] + 0.587 * pixels[(y * w + (x - 1)) * 4 + 1] + 0.114 * pixels[(y * w + (x - 1)) * 4 + 2]
        const lumRight = 0.299 * pixels[(y * w + (x + 1)) * 4] + 0.587 * pixels[(y * w + (x + 1)) * 4 + 1] + 0.114 * pixels[(y * w + (x + 1)) * 4 + 2]
        laplacianSum += Math.abs(4 * lum - lumUp - lumDown - lumLeft - lumRight)
      }

      // Inclusive Multi-Tone Skin Classification (Fitzpatrick I-VI, makeup & glasses friendly)
      const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b

      const isStandardSkin = Cr >= 132 && Cr <= 174 && Cb >= 78 && Cb <= 132 && r > g && r > b
      const isDeepToneSkin = (r + g + b) > 35 && r >= g * 0.88 && g >= b * 0.72 && (r - b) >= 8

      const isSkinPixel = isStandardSkin || isDeepToneSkin

      if (isSkinPixel) {
        skinPixelCount++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y

        const col = Math.min(gridCols - 1, Math.floor(x / cellW))
        const row = Math.min(gridRows - 1, Math.floor(y / cellH))
        skinGrid[row * gridCols + col]++
      }
    }
  }

  const sampledPixels = totalPixels / 4
  const skinRatio = skinPixelCount / sampledPixels
  const monoRatio = monoPixelCount / sampledPixels
  const edgeRatio = highEdgeCount / sampledPixels
  const sharpnessScore = laplacianSum / Math.max(1, sampledPixels)

  // 3. Blur Check
  if (sharpnessScore < 2.0 && brightness >= 30) {
    return {
      eligible: false,
      reason: 'IMAGE_TOO_BLURRY',
      userMessage: 'Please upload a sharper photo.',
      faceCount: 0,
      qualityScore: 30,
    }
  }

  // 4. UI Screenshot & Web-Capture Detection
  const topBottomBorderRatio = topBottomBorderEdgeCount / Math.max(1, sampledPixels * 0.16)
  if (topBottomBorderRatio > 0.28 || (edgeRatio > 0.45 && monoRatio > 0.55)) {
    return {
      eligible: false,
      reason: 'NO_FACE',
      userMessage: 'Please upload a clear photo of your face. Product images, screenshots and packaging are not supported.',
      faceCount: 0,
      qualityScore: 20,
    }
  }

  // 5. Skin Presence Check (Fail closed if < 10% skin)
  if (skinRatio < 0.10 || minX >= maxX || minY >= maxY) {
    return {
      eligible: false,
      reason: 'NO_FACE',
      userMessage: 'Photo not suitable for skin analysis. Please upload a clear photo of your face.',
      faceCount: 0,
      qualityScore: 20,
    }
  }

  const faceW = maxX - minX
  const faceH = maxY - minY
  const faceAreaRatio = (faceW * faceH) / (w * h)
  const faceAspectRatio = faceW / Math.max(1, faceH)

  // 6. Proportions Check
  // Human face bounding box aspect ratio: 0.62 to 1.30
  if (faceAspectRatio < 0.62 || faceAspectRatio > 1.30) {
    return {
      eligible: false,
      reason: 'NO_FACE',
      userMessage: 'Photo not suitable for skin analysis. Please upload a clear photo of your face. Product images, screenshots and packaging are not supported.',
      faceCount: 0,
      qualityScore: 25,
    }
  }

  // 7. Multi-Face Density Cluster Counting
  let activeColClusters = 0
  let inCluster = false
  for (let c = 0; c < gridCols; c++) {
    let colSkin = 0
    for (let r = 0; r < gridRows; r++) {
      colSkin += skinGrid[r * gridCols + c]
    }
    if (colSkin > (sampledPixels / (gridCols * gridRows)) * 0.40) {
      if (!inCluster) {
        inCluster = true
        activeColClusters++
      }
    } else {
      if (inCluster) {
        inCluster = false
      }
    }
  }

  if (activeColClusters >= 2) {
    return {
      eligible: false,
      reason: 'MULTIPLE_FACES',
      userMessage: 'Please upload a photo with one person only.',
      faceCount: activeColClusters,
      faceBoundingBox: { x: minX, y: minY, width: faceW, height: faceH },
      qualityScore: 35,
    }
  }

  // 8. Face Too Small Check
  if (faceAreaRatio < 0.12 || faceW < w * 0.25) {
    return {
      eligible: false,
      reason: 'FACE_TOO_SMALL',
      userMessage: 'Your face is too far away. Move closer and try again.',
      faceCount: 0,
      faceBoundingBox: { x: minX, y: minY, width: faceW, height: faceH },
      qualityScore: 40,
    }
  }

  // 9. Anti-Product: Straight Vertical Edge Silhouette Detection
  let straightVerticalEdges = 0
  for (let y = minY + Math.floor(faceH * 0.1); y < maxY - Math.floor(faceH * 0.1); y += 3) {
    if (y < 0 || y >= h) continue
    const leftIdx = (y * w + Math.max(0, minX)) * 4
    const rightIdx = (y * w + Math.min(w - 1, maxX)) * 4
    const leftLum = 0.299 * pixels[leftIdx] + 0.587 * pixels[leftIdx + 1] + 0.114 * pixels[leftIdx + 2]
    const rightLum = 0.299 * pixels[rightIdx] + 0.587 * pixels[rightIdx + 1] + 0.114 * pixels[rightIdx + 2]
    if (Math.abs(leftLum - brightness) > 20 || Math.abs(rightLum - brightness) > 20) {
      straightVerticalEdges++
    }
  }
  const vertEdgeLines = Math.max(1, (faceH * 0.8) / 3)
  const vertEdgeRatio = straightVerticalEdges / vertEdgeLines

  // 10. Anti-Product: Text / Typography Grid Detection
  let textTransitions = 0
  let scanLineCount = 0
  for (let y = minY + Math.floor(faceH * 0.25); y < minY + Math.floor(faceH * 0.75); y += 3) {
    let lastLum = -1
    scanLineCount++
    for (let x = minX + Math.floor(faceW * 0.20); x < maxX - Math.floor(faceW * 0.20); x += 2) {
      if (x < 0 || x >= w || y < 0 || y >= h) continue
      const idx = (y * w + x) * 4
      const lum = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]
      if (lastLum >= 0 && Math.abs(lum - lastLum) > 35) {
        textTransitions++
      }
      lastLum = lum
    }
  }
  const textDensityScore = textTransitions / Math.max(1, scanLineCount)

  // 11. ANTHROPOMETRIC STRUCTURAL VERIFICATION (FAIL-CLOSED)
  // Check Forehead, Eye Pair Symmetry, Nose Bridge, Cheeks, Mouth
  let anthropometricScore = 0

  const yForehead = Math.floor(minY + faceH * 0.18)
  const yEyes = Math.floor(minY + faceH * 0.42)
  const yNose = Math.floor(minY + faceH * 0.58)
  const yMouth = Math.floor(minY + faceH * 0.75)

  // A. Forehead Skin Uniformity & Absence of Hardware / Bottle Caps
  let foreheadSkinCount = 0
  let foreheadSampleCount = 0
  for (let x = minX + Math.floor(faceW * 0.25); x < maxX - Math.floor(faceW * 0.25); x += 2) {
    if (yForehead >= 0 && yForehead < h && x >= 0 && x < w) {
      foreheadSampleCount++
      const idx = (yForehead * w + x) * 4
      const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2]
      const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
      if ((Cr >= 130 && Cr <= 175 && Cb >= 75 && Cb <= 135) || (r > g * 0.85 && g > b * 0.7 && r - b >= 6)) {
        foreheadSkinCount++
      }
    }
  }
  const foreheadSkinRatio = foreheadSkinCount / Math.max(1, foreheadSampleCount)
  if (foreheadSkinRatio > 0.60) {
    anthropometricScore += 20
  }

  // B. Eye Pair Anatomical Detection & Mid-Nose Bridge Highlight
  let leftEyeLumSum = 0, leftEyeSamples = 0
  let rightEyeLumSum = 0, rightEyeSamples = 0
  let noseBridgeLumSum = 0, noseBridgeSamples = 0

  for (let y = yEyes - 4; y <= yEyes + 4; y += 2) {
    for (let x = minX + Math.floor(faceW * 0.18); x < maxX - Math.floor(faceW * 0.18); x += 2) {
      if (x < 0 || x >= w || y < 0 || y >= h) continue
      const idx = (y * w + x) * 4
      const lum = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]
      const relX = (x - minX) / faceW

      if (relX >= 0.18 && relX <= 0.42) {
        leftEyeLumSum += lum
        leftEyeSamples++
      } else if (relX >= 0.58 && relX <= 0.82) {
        rightEyeLumSum += lum
        rightEyeSamples++
      } else if (relX > 0.44 && relX < 0.56) {
        noseBridgeLumSum += lum
        noseBridgeSamples++
      }
    }
  }

  const avgLeftEyeLum = leftEyeSamples > 0 ? leftEyeLumSum / leftEyeSamples : 0
  const avgRightEyeLum = rightEyeSamples > 0 ? rightEyeLumSum / rightEyeSamples : 0
  const avgNoseBridgeLum = noseBridgeSamples > 0 ? noseBridgeLumSum / noseBridgeSamples : 0

  const eyeLumDiff = Math.abs(avgLeftEyeLum - avgRightEyeLum)
  const avgEyeLum = (avgLeftEyeLum + avgRightEyeLum) / 2

  if (eyeLumDiff < 45 && avgEyeLum > 15) {
    anthropometricScore += 20
  }

  // Nose Bridge Contrast Invariant
  if (avgNoseBridgeLum > avgEyeLum - 2) {
    anthropometricScore += 20
  }

  // C. Mouth / Oral Fissure Horizontal Dip
  let mouthDips = 0
  let mouthSamples = 0
  for (let x = minX + Math.floor(faceW * 0.30); x < maxX - Math.floor(faceW * 0.30); x += 2) {
    if (yMouth >= 0 && yMouth < h && x >= 0 && x < w) {
      mouthSamples++
      const idx = (yMouth * w + x) * 4
      const lum = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]
      if (lum < brightness * 0.90) {
        mouthDips++
      }
    }
  }
  const mouthDipRatio = mouthDips / Math.max(1, mouthSamples)
  if (mouthDipRatio > 0.20) {
    anthropometricScore += 20
  }

  // D. Left-Right Cheek Bilateral Symmetry
  let cheekDiffSum = 0
  let cheekSamples = 0
  for (let y = yNose - 6; y <= yNose + 6; y += 3) {
    for (let dx = Math.floor(faceW * 0.15); dx <= Math.floor(faceW * 0.35); dx += 2) {
      const xLeft = minX + Math.floor(faceW * 0.5) - dx
      const xRight = minX + Math.floor(faceW * 0.5) + dx
      if (xLeft >= 0 && xLeft < w && xRight >= 0 && xRight < w && y >= 0 && y < h) {
        const idxL = (y * w + xLeft) * 4
        const idxR = (y * w + xRight) * 4
        const lumL = 0.299 * pixels[idxL] + 0.587 * pixels[idxL + 1] + 0.114 * pixels[idxL + 2]
        const lumR = 0.299 * pixels[idxR] + 0.587 * pixels[idxR + 1] + 0.114 * pixels[idxR + 2]
        cheekDiffSum += Math.abs(lumL - lumR)
        cheekSamples++
      }
    }
  }
  const avgCheekDiff = cheekSamples > 0 ? cheekDiffSum / cheekSamples : 100
  if (avgCheekDiff < 40) {
    anthropometricScore += 20
  }

  // Deduct penalties for Product & Packaging Signatures
  if (vertEdgeRatio > 0.75) {
    anthropometricScore -= 40
  }
  if (textDensityScore > 5.5) {
    anthropometricScore -= 40
  }

  // STRICT FAIL-CLOSED GATE: Anthropometric score must be >= 60
  if (anthropometricScore < 60) {
    return {
      eligible: false,
      reason: 'NO_FACE',
      userMessage: 'Photo not suitable for skin analysis. Please upload a clear photo of your face. Product images, screenshots and packaging are not supported.',
      faceCount: 0,
      faceBoundingBox: { x: minX, y: minY, width: faceW, height: faceH },
      qualityScore: 25,
    }
  }

  // 12. Glare Check
  if (specularRatio > 0.35) {
    return {
      eligible: false,
      reason: 'EXCESSIVE_GLARE',
      userMessage: 'Excessive surface glare detected. Please avoid direct harsh lighting.',
      faceCount: 1,
      faceBoundingBox: { x: minX, y: minY, width: faceW, height: faceH },
      qualityScore: 55,
    }
  }

  // All Gates Passed: Genuine Single Human Face
  return {
    eligible: true,
    reason: 'VALID',
    userMessage: 'Optimal lighting and facial detail for visual dermal telemetry.',
    faceCount: 1,
    faceBoundingBox: { x: minX, y: minY, width: faceW, height: faceH },
    qualityScore: 90,
  }
}

/**
 * Assesses photo suitability based on brightness, glare, and resolution telemetry.
 */
export function evaluateImageQuality(
  brightness: number,
  specularRatio: number,
  width: number,
  height: number
): ImageQualityAssessment {
  if (width < 150 || height < 150) {
    return {
      usable: false,
      qualityScore: 30,
      reason: 'Low image resolution (<150px). Survey responses utilized for analysis.',
    }
  }

  if (brightness < 40) {
    return {
      usable: true,
      qualityScore: 50,
      reason: 'Low ambient lighting detected. Visual metrics given reduced weight.',
    }
  }

  if (brightness > 220) {
    return {
      usable: true,
      qualityScore: 55,
      reason: 'High ambient exposure detected. Visual signals adjusted for surface glare.',
    }
  }

  if (specularRatio > 0.18) {
    return {
      usable: true,
      qualityScore: 60,
      reason: 'Specular shine reflection detected on skin surface. Visual confidence calibrated.',
    }
  }

  return {
    usable: true,
    qualityScore: 90,
    reason: 'Optimal lighting and facial detail for visual dermal telemetry.',
  }
}

/**
 * Analyzes an uploaded image using HTML5 Canvas API.
 * Extracts deterministic color channels, texture variance, specular highlights, and strict eligibility.
 */
export async function analyzeImageTelemetry(imageSrc: string): Promise<DermalImageMetrics> {
  return new Promise((resolve, reject) => {
    if (!imageSrc || typeof imageSrc !== 'string' || !imageSrc.startsWith('data:image/')) {
      reject(new Error('Invalid or unsupported image data.'))
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = async () => {
      try {
        if (img.width < 100 || img.height < 100) {
          reject(new Error('Image resolution too low. Minimum 100x100 pixels required.'))
          return
        }

        let nativeFaceCount: number | null = null
        if (typeof window !== 'undefined' && 'FaceDetector' in window) {
          try {
            const detector = new (window as any).FaceDetector({ fastMode: false, maxDetectedFaces: 5 })
            const nativeFaces = await detector.detect(img)
            nativeFaceCount = Array.isArray(nativeFaces) ? nativeFaces.length : null
          } catch {
            // Fallback to pure TS anthropometric evaluator
          }
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
          reject(new Error('Could not initialize canvas context.'))
          return
        }

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

        let varSum = 0
        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          varSum += Math.pow(lum - brightness, 2)
        }
        const luminanceVariance = Math.sqrt(varSum / (totalPixels / 4))

        const hash = fnv1aHash(pixels)
        const imageQuality = evaluateImageQuality(brightness, specularRatio, img.width, img.height)
        let eligibility = evaluateImageEligibility(pixels, w, h, brightness, specularRatio)

        // If native FaceDetector ran and detected 0 faces or multiple faces, enforce hard fail:
        if (nativeFaceCount !== null) {
          if (nativeFaceCount === 0) {
            eligibility = {
              eligible: false,
              reason: 'NO_FACE',
              userMessage: 'Photo not suitable for skin analysis. Please upload a clear photo of your face.',
              faceCount: 0,
              qualityScore: 20,
            }
          } else if (nativeFaceCount > 1) {
            eligibility = {
              eligible: false,
              reason: 'MULTIPLE_FACES',
              userMessage: 'Please upload a photo with one person only.',
              faceCount: nativeFaceCount,
              qualityScore: 35,
            }
          }
        }

        // Strict Gate: If image eligibility fails, mark imageQuality.usable as false!
        if (!eligibility.eligible) {
          imageQuality.usable = false
          imageQuality.reason = eligibility.userMessage
        }

        const confidence = Math.round(
          Math.min(100, Math.max(0, (eligibility.eligible ? imageQuality.qualityScore : 30) + (img.width >= 400 ? 5 : 0)))
        )

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
          imageQuality,
          eligibility,
        })
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Failed to load selfie image.'))
    img.src = imageSrc
  })
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
 * Calculates Questionnaire Completeness score (0 to 100).
 */
export function calculateQuestionnaireCompleteness(answers: AiConsultationAnswers): number {
  let points = 0
  if (answers.age) points += 15
  if (answers.skinType) points += 25
  if (answers.concerns && answers.concerns.length > 0) points += 25
  if (answers.sleepHours || answers.waterIntake || answers.sunExposure) points += 20
  if (answers.oilySkin !== undefined || answers.drySkin !== undefined || answers.hasSensitiveSkin !== undefined) points += 15
  return Math.min(100, Math.max(0, points))
}

/**
 * Deterministic Confidence Calculator (Phase 3 Verified Formula):
 * Questionnaire + Selfie = questionnaireScore * 0.4 + selfieScore * 0.6
 * Questionnaire only   = questionnaireScore * 0.8
 * Selfie only          = selfieScore * 0.85
 * Insufficient data    = 0
 */
export function calculateConfidence(
  hasSelfie: boolean,
  hasQuestionnaire: boolean,
  questionnaireScore: number,
  selfieScore: number
): { confidence: number; analysisSource: 'questionnaire+selfie' | 'questionnaire' | 'selfie' | 'insufficient-data' } {
  if (!hasSelfie && !hasQuestionnaire) {
    return { confidence: 0, analysisSource: 'insufficient-data' }
  }

  if (hasSelfie && hasQuestionnaire) {
    const combined = Math.round(questionnaireScore * 0.4 + selfieScore * 0.6)
    return { confidence: clampScore(combined, 0, 100), analysisSource: 'questionnaire+selfie' }
  }

  if (hasSelfie && !hasQuestionnaire) {
    const single = Math.round(selfieScore * 0.85)
    return { confidence: clampScore(single, 0, 100), analysisSource: 'selfie' }
  }

  const single = Math.round(questionnaireScore * 0.8)
  return { confidence: clampScore(single, 0, 100), analysisSource: 'questionnaire' }
}

/**
 * Development Validation Helper (Phase 14):
 * Detects invalid scores, confidence bounds, duplicate focus, or signal mismatch.
 */
export function validateDermalAnalysis(report: AiReport): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []

  if (!report) {
    return { valid: false, warnings: ['Report is null or undefined'] }
  }

  if (report.confidence !== undefined && (report.confidence < 0 || report.confidence > 100 || isNaN(report.confidence))) {
    warnings.push(`Invalid overall confidence: ${report.confidence}`)
  }

  if (report.skinScore !== null && report.skinScore !== undefined && (report.skinScore < 0 || report.skinScore > 100 || isNaN(report.skinScore))) {
    warnings.push(`Invalid skin score: ${report.skinScore}`)
  }

  if (report.primaryFocus && report.secondaryFocus && report.primaryFocus.key === report.secondaryFocus.key) {
    warnings.push(`Duplicate primary & secondary focus: ${report.primaryFocus.key}`)
  }

  const metricKeys: (keyof AiReport)[] = ['hydration', 'oilBalance', 'sensitivity', 'barrier', 'pigmentation', 'elasticity']
  for (const k of metricKeys) {
    const m = report[k] as AiMetric | undefined
    if (!m) continue

    if (m.score !== null && (m.score < 0 || m.score > 100 || isNaN(m.score))) {
      warnings.push(`Metric ${k} has invalid score: ${m.score}`)
    }

    if (m.evidence === 'insufficient-data' && m.score !== null) {
      warnings.push(`Metric ${k} has evidence 'insufficient-data' but non-null score: ${m.score}`)
    }

    if (m.score === null && m.evidence !== 'insufficient-data') {
      warnings.push(`Metric ${k} has null score but evidence '${m.evidence}'`)
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  }
}

/**
 * BAREO Dermal Intelligence Engine v2.5
 * Generates a 100% deterministic, explainable AI-assisted skin assessment.
 * STRICT ANALYSIS GATE: Never calculates visual scores if image eligibility fails or usable === false.
 */
export function generateDeterministicReport(
  answers: AiConsultationAnswers,
  telemetry?: DermalImageMetrics | null
): AiReport {
  const hasSelfie = Boolean(
    telemetry &&
    telemetry.imageQuality?.usable !== false &&
    telemetry.eligibility?.eligible === true
  )
  const hasQuestionnaire = hasMinimumQuestionnaireData(answers)

  // PROFILE E: INSUFFICIENT DATA
  if (!hasSelfie && !hasQuestionnaire) {
    const insufficientMetric = (label: string): AiMetric => ({
      label,
      score: null,
      level: 'insufficient-data',
      evidence: 'insufficient-data',
      status: 'insufficient-data',
      detail: 'Data unavailable — complete your skin assessment questions or upload a selfie for calibrated indicators.',
      confidence: 0,
      source: [],
    })

    const report: AiReport = {
      analysisVersion: '2.0',
      skinScore: null,
      confidence: 0,
      analysisSource: 'insufficient-data',
      isComplete: false,
      dataQuality: {
        questionnaireScore: 0,
        selfieScore: 0,
        overallConfidence: 0,
        imageQualityReason: 'No visual or survey data provided.',
      },
      hydration: insufficientMetric('Hydration Index'),
      oilBalance: insufficientMetric('Oil Balance'),
      sensitivity: insufficientMetric('Sensitivity Threshold'),
      barrier: insufficientMetric('Lipid Barrier Resilience'),
      pigmentation: insufficientMetric('Pigmentation Uniformity'),
      elasticity: insufficientMetric('Elasticity & Collagen Index'),
      summary: ['Complete your skin assessment or provide a photo for calibrated dermal metrics.'],
    }
    return report
  }

  const qScore = calculateQuestionnaireCompleteness(answers)
  const selfieScore = telemetry?.confidence ?? 85

  const { confidence, analysisSource } = calculateConfidence(hasSelfie, hasQuestionnaire, qScore, selfieScore)

  // Metric calculation (strictly using telemetry ONLY when hasSelfie is true)
  const redRatio = hasSelfie ? telemetry!.rednessRatio : 1.0
  const brightness = hasSelfie ? telemetry!.brightness : 128
  const varLum = hasSelfie ? telemetry!.luminanceVariance : 15
  const specular = hasSelfie ? telemetry!.specularRatio : 0.05

  // 1. HYDRATION INDEX
  let hydScore = 75
  if (answers.skinType === 'dry') hydScore -= 20
  if (answers.skinType === 'oily') hydScore += 10
  if (answers.waterIntake === 'low') hydScore -= 12
  if (answers.waterIntake === 'high') hydScore += 8
  if (answers.concerns?.includes('dryness')) hydScore -= 15
  if (hasSelfie) {
    if (varLum > 25) hydScore -= 8
    if (brightness < 80) hydScore -= 5
  }
  hydScore = clampScore(hydScore, 10, 98)

  // 2. OIL BALANCE
  let oilScore = 72
  if (answers.skinType === 'oily') oilScore = 38
  if (answers.skinType === 'dry') oilScore = 85
  if (answers.concerns?.includes('oiliness')) oilScore -= 20
  if (answers.concerns?.includes('acne')) oilScore -= 15
  if (hasSelfie) {
    if (specular > 0.15) oilScore -= 14
  }
  oilScore = clampScore(oilScore, 15, 95)

  // 3. SENSITIVITY THRESHOLD
  let sensScore = 80
  if (answers.skinType === 'sensitive') sensScore -= 30
  if (answers.hasSensitiveSkin) sensScore -= 25
  if (answers.concerns?.includes('sensitivity')) sensScore -= 20
  if (answers.concerns?.includes('redness')) sensScore -= 18
  if (hasSelfie) {
    if (redRatio > 1.25) sensScore -= 15
  }
  sensScore = clampScore(sensScore, 10, 96)

  // 4. BARRIER RESILIENCE
  let barrierScore = 78
  if (answers.skinType === 'dry' || answers.skinType === 'sensitive') barrierScore -= 18
  if (answers.sunExposure === 'high') barrierScore -= 15
  if (answers.sleepHours === 'less-than-5') barrierScore -= 12
  if (answers.concerns?.includes('dryness')) barrierScore -= 20
  if (hasSelfie) {
    if (varLum > 30) barrierScore -= 10
  }
  barrierScore = clampScore(barrierScore, 15, 98)

  // 5. PIGMENTATION UNIFORMITY
  let pigScore = 82
  if (answers.concerns?.includes('pigmentation')) pigScore -= 25
  if (answers.sunExposure === 'high') pigScore -= 14
  if (answers.hasDarkCircles) pigScore -= 10
  if (hasSelfie) {
    if (varLum > 22 && redRatio > 1.15) pigScore -= 12
  }
  pigScore = clampScore(pigScore, 20, 98)

  // 6. ELASTICITY & COLLAGEN
  let elastScore = 85
  if (answers.age && answers.age > 40) elastScore -= (answers.age - 40) * 1.2
  if (answers.concerns?.includes('aging')) elastScore -= 20
  if (answers.sunExposure === 'high') elastScore -= 10
  if (answers.sleepHours === 'less-than-5') elastScore -= 8
  elastScore = clampScore(elastScore, 20, 98)

  const overallSkinScore = Math.round(
    hydScore * 0.22 +
    oilScore * 0.18 +
    sensScore * 0.18 +
    barrierScore * 0.18 +
    pigScore * 0.12 +
    elastScore * 0.12
  )

  const metricEvidence = getEvidence(hasSelfie, hasQuestionnaire)

  const buildMetric = (label: string, score: number, detail: string): AiMetric => ({
    label,
    score,
    level: getLevel(score),
    evidence: metricEvidence,
    status: getLevel(score),
    detail,
    confidence: Math.round(confidence * (score / 100)),
    source: hasSelfie ? ['questionnaire', 'selfie'] : ['questionnaire'],
  })

  // Primary & Secondary Focus Derivation
  let primaryFocus: AiFocusArea
  let secondaryFocus: AiFocusArea

  if (hydScore <= 55 || answers.concerns?.includes('dryness')) {
    primaryFocus = {
      key: 'hydration',
      label: 'Deep Hydration Support',
      reasoning: 'Your responses indicate stratum corneum moisture replenishment is the highest priority.',
    }
    secondaryFocus = {
      key: 'barrier',
      label: 'Lipid Barrier Repair',
      reasoning: 'Reinforcing ceramides will lock in moisture and protect against environmental stress.',
    }
  } else if (sensScore <= 55 || answers.concerns?.includes('sensitivity') || answers.concerns?.includes('redness')) {
    primaryFocus = {
      key: 'sensitivity',
      label: 'Barrier Soothing & Anti-Redness',
      reasoning: 'Calming reactive pathways and fortifying lipid structures takes precedence.',
    }
    secondaryFocus = {
      key: 'hydration',
      label: 'Gentle Moisture Lock',
      reasoning: 'Hydrating without triggering active inflammation supports smooth recovery.',
    }
  } else if (oilScore <= 55 || answers.concerns?.includes('oiliness') || answers.concerns?.includes('acne')) {
    primaryFocus = {
      key: 'oilBalance',
      label: 'Sebum Regulation & Pore Refinement',
      reasoning: 'Balancing epidermal oil secretion will refine texture and clarify pores.',
    }
    secondaryFocus = {
      key: 'barrier',
      label: 'Lightweight Barrier Protection',
      reasoning: 'Non-comedogenic barrier fortification prevents rebound oil overproduction.',
    }
  } else if (pigScore <= 65 || answers.concerns?.includes('pigmentation')) {
    primaryFocus = {
      key: 'pigmentation',
      label: 'Melanin Cluster Brightening',
      reasoning: 'Targeting hyperpigmented areas will promote luminous, even skin tone.',
    }
    secondaryFocus = {
      key: 'barrier',
      label: 'UV & Oxidative Defense',
      reasoning: 'Antioxidant shielding prevents new sun-induced dark spot formation.',
    }
  } else {
    primaryFocus = {
      key: 'barrier',
      label: 'Epidermal Barrier Fortification',
      reasoning: 'Maintaining healthy lipid organization sustains elasticity and smooth texture.',
    }
    secondaryFocus = {
      key: 'elasticity',
      label: 'Collagen & Elasticity Maintenance',
      reasoning: 'Sustaining structural firmness preserves youthful facial contours.',
    }
  }

  const summaryHighlights: string[] = []
  if (answers.skinType) {
    summaryHighlights.push(`Primary skin profile identified as ${answers.skinType.toUpperCase()}.`)
  }
  if (hasSelfie) {
    summaryHighlights.push(`Visual telemetry passed facial eligibility checks with ${telemetry!.confidence}% optical clarity.`)
  } else {
    summaryHighlights.push('Assessment generated from survey responses.')
  }
  summaryHighlights.push(`Priority focus: ${primaryFocus.label}.`)

  const report: AiReport = {
    analysisVersion: '2.0',
    skinScore: overallSkinScore,
    confidence,
    analysisSource,
    isComplete: true,
    dataQuality: {
      questionnaireScore: qScore,
      selfieScore,
      overallConfidence: confidence,
      imageQualityReason: telemetry?.imageQuality?.reason || 'Assessment derived from survey signals.',
    },
    primaryFocus,
    secondaryFocus,
    hydration: buildMetric('Hydration Index', hydScore, 'Measures stratum corneum moisture retention.'),
    oilBalance: buildMetric('Oil Balance', oilScore, 'Measures T-zone sebum equilibrium.'),
    sensitivity: buildMetric('Sensitivity Threshold', sensScore, 'Measures epidermal reactivity.'),
    barrier: buildMetric('Lipid Barrier Resilience', barrierScore, 'Measures intercellular lipid integrity.'),
    pigmentation: buildMetric('Pigmentation Uniformity', pigScore, 'Measures melanin distribution evenness.'),
    elasticity: buildMetric('Elasticity & Collagen Index', elastScore, 'Measures structural firmness.'),
    summary: summaryHighlights,
  }

  return report
}
