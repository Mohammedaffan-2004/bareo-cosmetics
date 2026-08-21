import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'

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

export interface ImageEligibilityResult {
  eligible: boolean
  reason: ImageEligibilityReason
  userMessage: string
  faceCount: number
  faceBoundingBox?: { x: number; y: number; width: number; height: number }
  qualityScore: number
}

/**
 * Anthropometric Structural Face Evaluation Engine (Fail-Closed)
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
      userMessage: 'Low image resolution. Please upload a clearer photo.',
      faceCount: 0,
      qualityScore: 20,
    }
  }

  // 2. Extreme Lighting Gate
  if (brightness < 28) {
    return {
      eligible: false,
      reason: 'IMAGE_TOO_DARK',
      userMessage: 'Photo is too dark. Please try again in brighter, even lighting.',
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
      userMessage: 'Please upload a clear photo of your face. Screenshots and packaging are not supported.',
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
  // Human face bounding box aspect ratio: 0.65 to 1.28
  if (faceAspectRatio < 0.62 || faceAspectRatio > 1.30) {
    return {
      eligible: false,
      reason: 'NO_FACE',
      userMessage: 'Photo not suitable for skin analysis. Please upload a clear photo of your face.',
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
  // Left eye zone: x in [0.18, 0.45], Right eye zone: x in [0.55, 0.82]
  // Nose bridge: x in [0.45, 0.55]
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

  // Bilateral Eye Luminance Similarity (Eyes should have similar ambient luminance)
  const eyeLumDiff = Math.abs(avgLeftEyeLum - avgRightEyeLum)
  const avgEyeLum = (avgLeftEyeLum + avgRightEyeLum) / 2

  if (eyeLumDiff < 45 && avgEyeLum > 15) {
    anthropometricScore += 20
  }

  // Nose Bridge Contrast Invariant: The nose bridge between the eyes is raised and reflects more light than eye depressions
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
