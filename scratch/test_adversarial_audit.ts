import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

interface TestCase {
  id: string
  category: 'NON-FACE' | 'VALID-FACE' | 'ADVERSARIAL'
  description: string
  expectedEligible: boolean
  generator: (w: number, h: number) => { pixels: Uint8ClampedArray; w: number; h: number; brightness: number; specularRatio: number }
}

function createAdversarialBuffer(type: string, w = 300, h = 300) {
  const pixels = new Uint8ClampedArray(w * h * 4)

  // 1. Genuine Human Face on Beige Background with Beige Clothing
  if (type === 'valid_human_face_beige_bg') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const dx = (x - w / 2) / (w * 0.28)
        const dy = (y - h / 2) / (h * 0.36)
        if (dx * dx + dy * dy <= 1) {
          // Human face oval
          const noise = ((x * 17 + y * 31) % 11) - 5
          pixels[idx] = Math.min(255, Math.max(0, 215 + noise))
          pixels[idx + 1] = Math.min(255, Math.max(0, 165 + noise))
          pixels[idx + 2] = Math.min(255, Math.max(0, 140 + noise))
          pixels[idx + 3] = 255
          // Eyes
          if (y >= h * 0.30 && y <= h * 0.42) {
            if ((x >= w * 0.32 && x <= w * 0.44) || (x >= w * 0.56 && x <= w * 0.68)) {
              pixels[idx] = 50; pixels[idx + 1] = 35; pixels[idx + 2] = 25
            }
          }
          // Mouth
          if (y >= h * 0.65 && y <= h * 0.72 && x >= w * 0.38 && x <= w * 0.62) {
            pixels[idx] = 140; pixels[idx + 1] = 70; pixels[idx + 2] = 65
          }
        } else {
          // Beige travertine wall & clothing (BAREO brand aesthetic)
          pixels[idx] = 220; pixels[idx + 1] = 200; pixels[idx + 2] = 180; pixels[idx + 3] = 255
        }
      }
    }
    return { pixels, w, h, brightness: 175, specularRatio: 0.04 }
  }

  // 2. Dark Skin Tone Single Face (Fitzpatrick Type V-VI)
  if (type === 'valid_deep_skin_tone') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const dx = (x - w / 2) / (w * 0.28)
        const dy = (y - h / 2) / (h * 0.36)
        if (dx * dx + dy * dy <= 1) {
          const noise = ((x * 13 + y * 23) % 9) - 4
          pixels[idx] = Math.min(255, Math.max(0, 110 + noise))
          pixels[idx + 1] = Math.min(255, Math.max(0, 75 + noise))
          pixels[idx + 2] = Math.min(255, Math.max(0, 55 + noise))
          pixels[idx + 3] = 255
          // Eyes
          if (y >= h * 0.30 && y <= h * 0.42) {
            if ((x >= w * 0.32 && x <= w * 0.44) || (x >= w * 0.56 && x <= w * 0.68)) {
              pixels[idx] = 30; pixels[idx + 1] = 20; pixels[idx + 2] = 15
            }
          }
          // Mouth
          if (y >= h * 0.65 && y <= h * 0.72 && x >= w * 0.38 && x <= w * 0.62) {
            pixels[idx] = 85; pixels[idx + 1] = 45; pixels[idx + 2] = 40
          }
        } else {
          pixels[idx] = 160; pixels[idx + 1] = 160; pixels[idx + 2] = 160; pixels[idx + 3] = 255
        }
      }
    }
    return { pixels, w, h, brightness: 90, specularRatio: 0.03 }
  }

  // 3. Face Printed on Packaging Box / Magazine
  if (type === 'face_printed_on_packaging') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        // Packaging box border lines running down
        const isBoxBorder = x === Math.floor(w * 0.15) || x === Math.floor(w * 0.85) || y === Math.floor(h * 0.10) || y === Math.floor(h * 0.90)
        // High density barcode / text lines at top and bottom of packaging
        const isPackagingText = (y < h * 0.25 || y > h * 0.75) && ((x + y) % 3 === 0)

        if (isBoxBorder || isPackagingText) {
          pixels[idx] = 20; pixels[idx + 1] = 20; pixels[idx + 2] = 20; pixels[idx + 3] = 255
        } else {
          // Printed face area
          pixels[idx] = 210; pixels[idx + 1] = 165; pixels[idx + 2] = 135; pixels[idx + 3] = 255
        }
      }
    }
    return { pixels, w, h, brightness: 160, specularRatio: 0.02 }
  }

  // 4. BAREO Moisturizer Jar (Wide Circular Jar)
  if (type === 'bareo_jar_wide') {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        const dx = (x - w / 2) / (w * 0.45)
        const dy = (y - h / 2) / (h * 0.22) // Wide flat jar shape
        if (dx * dx + dy * dy <= 1) {
          pixels[idx] = 235; pixels[idx + 1] = 210; pixels[idx + 2] = 185; pixels[idx + 3] = 255
          // Printed typography on jar lid
          if (y >= h * 0.45 && y <= h * 0.55 && x % 4 !== 0) {
            pixels[idx] = 40; pixels[idx + 1] = 40; pixels[idx + 2] = 40
          }
        } else {
          pixels[idx] = 220; pixels[idx + 1] = 210; pixels[idx + 2] = 200; pixels[idx + 3] = 255
        }
      }
    }
    return { pixels, w, h, brightness: 200, specularRatio: 0.06 }
  }

  // Fallback neutral
  pixels.fill(150)
  return { pixels, w, h, brightness: 150, specularRatio: 0.02 }
}

const TEST_CASES: TestCase[] = [
  {
    id: 'ADV-01',
    category: 'VALID-FACE',
    description: 'Human face on beige travertine background with beige clothing',
    expectedEligible: true,
    generator: () => createAdversarialBuffer('valid_human_face_beige_bg'),
  },
  {
    id: 'ADV-02',
    category: 'VALID-FACE',
    description: 'Dark skin tone single face (Fitzpatrick V-VI)',
    expectedEligible: true,
    generator: () => createAdversarialBuffer('valid_deep_skin_tone'),
  },
  {
    id: 'ADV-03',
    category: 'ADVERSARIAL',
    description: 'Face printed on packaging box with text borders',
    expectedEligible: false,
    generator: () => createAdversarialBuffer('face_printed_on_packaging'),
  },
  {
    id: 'ADV-04',
    category: 'ADVERSARIAL',
    description: 'BAREO Moisturizer Jar (wide circular container)',
    expectedEligible: false,
    generator: () => createAdversarialBuffer('bareo_jar_wide'),
  },
]

console.log('====================================================')
console.log('ADVERSARIAL & HARDENING AUDIT TEST RUNNER')
console.log('====================================================')

let totalPassed = 0

TEST_CASES.forEach((tc) => {
  const buf = tc.generator(300, 300)
  const res = evaluateImageEligibility(buf.pixels, buf.w, buf.h, buf.brightness, buf.specularRatio)
  const passed = res.eligible === tc.expectedEligible

  if (passed) totalPassed++

  console.log(`[${tc.id}] ${tc.description}`)
  console.log(`  CATEGORY       : ${tc.category}`)
  console.log(`  RESULT ELIGIBLE: ${res.eligible} (Expected: ${tc.expectedEligible})`)
  console.log(`  REASON         : ${res.reason}`)
  console.log(`  USER MESSAGE   : ${res.userMessage}`)
  console.log(`  MATCHES EXPECTED: ${passed ? 'YES ✓' : 'NO ✗'}`)
  console.log('----------------------------------------------------')
})

console.log(`TOTAL ADVERSARIAL CASES PASSED: ${totalPassed} / ${TEST_CASES.length}`)
console.log('====================================================')
