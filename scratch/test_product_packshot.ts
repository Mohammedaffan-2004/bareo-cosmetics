import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

function createBareoProductPackshotDetailed(w = 300, h = 300) {
  const pixels = new Uint8ClampedArray(w * h * 4)

  // Warm Ivory Travertine Background & Cream Product Bottle with Sharp Label Typography
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      
      // Bottle geometry: Rectangular bottle in center (x from 0.25 to 0.75, y from 0.15 to 0.85)
      const isBottle = x >= w * 0.25 && x <= w * 0.75 && y >= h * 0.15 && y <= h * 0.85

      if (isBottle) {
        // Cream/Ivory formulation bottle texture with subtle photo noise
        const noise = ((x * 13 + y * 29) % 7) - 3
        pixels[idx] = Math.min(255, Math.max(0, 230 + noise))
        pixels[idx + 1] = Math.min(255, Math.max(0, 205 + noise))
        pixels[idx + 2] = Math.min(255, Math.max(0, 180 + noise))
        pixels[idx + 3] = 255

        // Printed dark label text on bottle ("BAREO NIACINAMIDE 5% GEL MOISTURIZER")
        // Alternating printed character strokes
        const isTextLine1 = y >= h * 0.30 && y <= h * 0.42 && ((x >= w * 0.30 && x <= w * 0.45) || (x >= w * 0.55 && x <= w * 0.70)) && (x % 3 !== 0)
        const isTextLine2 = y >= h * 0.62 && y <= h * 0.75 && (x >= w * 0.32 && x <= w * 0.68) && ((x + y) % 4 !== 0)

        if (isTextLine1 || isTextLine2) {
          pixels[idx] = 30  // Dark charcoal printed typography
          pixels[idx + 1] = 35
          pixels[idx + 2] = 40
        }
      } else {
        // Travertine warm mineral stone background
        const bgNoise = ((x * 19 + y * 37) % 9) - 4
        pixels[idx] = Math.min(255, Math.max(0, 215 + bgNoise))
        pixels[idx + 1] = Math.min(255, Math.max(0, 195 + bgNoise))
        pixels[idx + 2] = Math.min(255, Math.max(0, 175 + bgNoise))
        pixels[idx + 3] = 255
      }
    }
  }

  return { pixels, w, h, brightness: 185, specularRatio: 0.05 }
}

const packshot = createBareoProductPackshotDetailed(300, 300)
const result = evaluateImageEligibility(packshot.pixels, packshot.w, packshot.h, packshot.brightness, packshot.specularRatio)

console.log('====================================================')
console.log('BAREO DETAILED PRODUCT PACKSHOT REJECTION TEST')
console.log('====================================================')
console.log('ELIGIBLE:', result.eligible)
console.log('REASON:', result.reason)
console.log('FACE COUNT:', result.faceCount)
console.log('USER MESSAGE:', result.userMessage)
console.log('QUALITY SCORE:', result.qualityScore)
console.log('====================================================')
