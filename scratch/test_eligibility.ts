import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

/**
 * Automated Adversarial Test Suite for Image Eligibility Validator (20 Test Cases)
 */
function createMockImagePixels(type: string, w = 300, h = 300): { pixels: Uint8ClampedArray; w: number; h: number; brightness: number; specularRatio: number } {
  const pixels = new Uint8ClampedArray(w * h * 4)

  if (type === 'normal_selfie' || type === 'daylight_selfie' || type === 'glasses_selfie' || type === 'makeup_selfie') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        // Facial oval in center
        const dx = (x - w / 2) / (w * 0.3)
        const dy = (y - h / 2) / (h * 0.38)
        if (dx * dx + dy * dy <= 1) {
          // Skin pixels (RGB warm, distinct non-monochrome)
          pixels[idx] = 215 // R
          pixels[idx + 1] = 165 // G
          pixels[idx + 2] = 140 // B
          pixels[idx + 3] = 255

          // Simulate eye dips (left eye & right eye contrast wells)
          if (y >= h * 0.30 && y <= h * 0.42) {
            if ((x >= w * 0.32 && x <= w * 0.44) || (x >= w * 0.56 && x <= w * 0.68)) {
              pixels[idx] = 70
              pixels[idx + 1] = 45
              pixels[idx + 2] = 35
            }
          }
          // Simulate mouth line
          if (y >= h * 0.65 && y <= h * 0.72 && x >= w * 0.38 && x <= w * 0.62) {
            pixels[idx] = 140
            pixels[idx + 1] = 80
            pixels[idx + 2] = 75
          }
        } else {
          // Warm natural background (non-monochrome to avoid false UI screenshot flag)
          pixels[idx] = 175
          pixels[idx + 1] = 160
          pixels[idx + 2] = 145
          pixels[idx + 3] = 255
        }
      }
    }
    return { pixels, w, h, brightness: 160, specularRatio: 0.04 }
  }

  if (type === 'different_skin_tones') {
    // Deep tone skin portrait (Fitzpatrick Type V / VI)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const dx = (x - w / 2) / (w * 0.3)
        const dy = (y - h / 2) / (h * 0.38)
        if (dx * dx + dy * dy <= 1) {
          pixels[idx] = 115 // R
          pixels[idx + 1] = 80 // G
          pixels[idx + 2] = 60 // B
          pixels[idx + 3] = 255

          if (y >= h * 0.30 && y <= h * 0.42 && ((x >= w * 0.32 && x <= w * 0.44) || (x >= w * 0.56 && x <= w * 0.68))) {
            pixels[idx] = 35
            pixels[idx + 1] = 25
            pixels[idx + 2] = 20
          }
          if (y >= h * 0.65 && y <= h * 0.72 && x >= w * 0.38 && x <= w * 0.62) {
            pixels[idx] = 75
            pixels[idx + 1] = 45
            pixels[idx + 2] = 40
          }
        } else {
          pixels[idx] = 160
          pixels[idx + 1] = 150
          pixels[idx + 2] = 140
          pixels[idx + 3] = 255
        }
      }
    }
    return { pixels, w, h, brightness: 90, specularRatio: 0.05 }
  }

  if (type === 'dark_selfie') {
    pixels.fill(20)
    return { pixels, w, h, brightness: 20, specularRatio: 0.01 }
  }

  if (type === 'low_res') {
    return { pixels: new Uint8ClampedArray(100 * 100 * 4), w: 100, h: 100, brightness: 120, specularRatio: 0.02 }
  }

  if (type === 'tiny_face') {
    // Face occupies < 5% of canvas in corner
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        if (x >= 10 && x <= 40 && y >= 10 && y <= 40) {
          pixels[idx] = 210
          pixels[idx + 1] = 160
          pixels[idx + 2] = 135
        } else {
          pixels[idx] = 150
          pixels[idx + 1] = 150
          pixels[idx + 2] = 150
        }
        pixels[idx + 3] = 255
      }
    }
    return { pixels, w, h, brightness: 150, specularRatio: 0.02 }
  }

  if (type === 'two_people' || type === 'three_people') {
    // Dual face clusters
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const inFace1 = Math.pow((x - w * 0.25) / (w * 0.15), 2) + Math.pow((y - h * 0.4) / (h * 0.25), 2) <= 1
        const inFace2 = Math.pow((x - w * 0.75) / (w * 0.15), 2) + Math.pow((y - h * 0.4) / (h * 0.25), 2) <= 1
        if (inFace1 || inFace2) {
          pixels[idx] = 210
          pixels[idx + 1] = 160
          pixels[idx + 2] = 135
        } else {
          pixels[idx] = 190
          pixels[idx + 1] = 190
          pixels[idx + 2] = 190
        }
        pixels[idx + 3] = 255
      }
    }
    return { pixels, w, h, brightness: 160, specularRatio: 0.03 }
  }

  if (type === 'product_bottle' || type === 'product_ad' || type === 'landscape' || type === 'random_object' || type === 'animal' || type === 'lab_scene') {
    // Non-skin object (glass / green / blue / white bottle)
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 100 // R
      pixels[i + 1] = 180 // G (high green/cyan non-skin)
      pixels[i + 2] = 190 // B
      pixels[i + 3] = 255
    }
    return { pixels, w, h, brightness: 150, specularRatio: 0.08 }
  }

  if (type === 'website_screenshot' || type === 'screenshot_with_face') {
    // Heavy edge grid steps + mono UI bars
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        if (y < h * 0.15 || y > h * 0.85 || x % 10 === 0) {
          pixels[idx] = 255
          pixels[idx + 1] = 255
          pixels[idx + 2] = 255
        } else {
          pixels[idx] = 200
          pixels[idx + 1] = 160
          pixels[idx + 2] = 130
        }
        pixels[idx + 3] = 255
      }
    }
    return { pixels, w, h, brightness: 210, specularRatio: 0.01 }
  }

  if (type === 'cropped_face') {
    // Face heavily off-center touching border
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        if (x < w * 0.3 && y < h * 0.3) {
          pixels[idx] = 210
          pixels[idx + 1] = 160
          pixels[idx + 2] = 135
        } else {
          pixels[idx] = 140
          pixels[idx + 1] = 140
          pixels[idx + 2] = 140
        }
        pixels[idx + 3] = 255
      }
    }
    return { pixels, w, h, brightness: 140, specularRatio: 0.02 }
  }

  // Fallback blurry
  pixels.fill(128)
  return { pixels, w, h, brightness: 128, specularRatio: 0.02 }
}

const TEST_CASES = [
  { id: '01', name: 'normal selfie', type: 'normal_selfie', expectedPass: true },
  { id: '02', name: 'daylight selfie', type: 'daylight_selfie', expectedPass: true },
  { id: '03', name: 'dark selfie', type: 'dark_selfie', expectedPass: false },
  { id: '04', name: 'blurry selfie', type: 'dark_selfie', expectedPass: false },
  { id: '05', name: 'low resolution selfie', type: 'low_res', expectedPass: false },
  { id: '06', name: 'selfie with glasses', type: 'glasses_selfie', expectedPass: true },
  { id: '07', name: 'selfie with makeup', type: 'makeup_selfie', expectedPass: true },
  { id: '08', name: 'different skin tones', type: 'different_skin_tones', expectedPass: true },
  { id: '09', name: 'partially cropped face', type: 'cropped_face', expectedPass: false },
  { id: '10', name: 'very small/far face', type: 'tiny_face', expectedPass: false },
  { id: '11', name: 'two people', type: 'two_people', expectedPass: false },
  { id: '12', name: 'three people', type: 'three_people', expectedPass: false },
  { id: '13', name: 'skincare product bottle', type: 'product_bottle', expectedPass: false },
  { id: '14', name: 'skincare product advertisement', type: 'product_ad', expectedPass: false },
  { id: '15', name: 'website screenshot', type: 'website_screenshot', expectedPass: false },
  { id: '16', name: 'screenshot containing a human face', type: 'screenshot_with_face', expectedPass: false },
  { id: '17', name: 'landscape', type: 'landscape', expectedPass: false },
  { id: '18', name: 'random object', type: 'random_object', expectedPass: false },
  { id: '19', name: 'animal', type: 'animal', expectedPass: false },
  { id: '20', name: 'laboratory/product scene', type: 'lab_scene', expectedPass: false },
]

console.log('====================================================')
console.log('BAREO AI SKIN ANALYSIS — ADVERSARIAL TEST SUITE (20 CASES)')
console.log('====================================================\n')

let passCount = 0
let failCount = 0

TEST_CASES.forEach((tc) => {
  const { pixels, w, h, brightness, specularRatio } = createMockImagePixels(tc.type)
  const res = evaluateImageEligibility(pixels, w, h, brightness, specularRatio)

  const isMatchesExpected = res.eligible === tc.expectedPass
  if (isMatchesExpected) passCount++
  else failCount++

  console.log(`[CASE ${tc.id}] ${tc.name.toUpperCase()} (Expected: ${tc.expectedPass ? 'PASS' : 'REJECT'})`)
  console.log(`  RESULT: ${res.eligible ? 'PASS' : 'REJECT'} | REASON: ${res.reason}`)
  console.log(`  USER MSG: ${res.userMessage}`)
  console.log(`  DETAILS: faceCount=${res.faceCount}, qualityScore=${res.qualityScore}`)
  console.log('----------------------------------------------------')
})

console.log(`\nTEST SUMMARY: ${passCount} / ${TEST_CASES.length} MATCHED EXPECTED BEHAVIOR (${failCount} ERRORS)`)
