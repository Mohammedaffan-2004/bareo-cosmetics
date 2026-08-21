import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'
import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

/**
 * Decodes real PNG file into RGBA pixel array and evaluates it via evaluateImageEligibility()
 */
async function testRealBareoPackshot(fileName: string) {
  const filePath = path.resolve('public/new-img', fileName)
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    return
  }

  const fileBuf = fs.readFileSync(filePath)
  const png = PNG.sync.read(fileBuf)

  const w = png.width
  const h = png.height
  const pixels = new Uint8ClampedArray(png.data.buffer)

  // Calculate average brightness & specular ratio from raw decoded pixels
  let totalLum = 0
  let specularCount = 0
  const sampledCount = (w * h)

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const lum = 0.299 * r + 0.587 * g + 0.114 * b
    totalLum += lum
    if (r > 240 && g > 240 && b > 240) specularCount++
  }

  const brightness = Math.round(totalLum / sampledCount)
  const specularRatio = specularCount / sampledCount

  const result = evaluateImageEligibility(pixels, w, h, brightness, specularRatio)

  console.log('====================================================')
  console.log(`REAL PRODUCTION IMAGE AUDIT: ${fileName}`)
  console.log(`DIMENSIONS: ${w}x${h} | BRIGHTNESS: ${brightness} | SPECULAR RATIO: ${specularRatio.toFixed(3)}`)
  console.log('====================================================')
  console.log('ELIGIBLE    :', result.eligible)
  console.log('REASON      :', result.reason)
  console.log('FACE COUNT  :', result.faceCount)
  console.log('USER MESSAGE:', result.userMessage)
  console.log('QUALITY SCORE:', result.qualityScore)
  console.log('====================================================')
  return result
}

async function runAllRealPackshots() {
  const realFiles = [
    'bareo-comfort-cream-mineral-sunscreen-spf-50-pa.png',
    'bareo-gel-cream-ultra-light-sunscreen-spf-50-pa.png',
    'bareo-invisible-shield-fluid-sunscreen-spf-50-pa.png',
    'bareo-niacinamide-barrier-gel-moisturizer.png',
    'bareo-hydrate-hyaluronic-acid-serum-2.png',
    'bareo-cica-niacinamide-calming-cleanser.png',
    'bareo-gentle-tear-free-baby-head-to-toe-wash.png',
    'bareo-hydrating-baby-face-body-butter.png',
    'bareo-oat-chamomile-ultra-calming-baby-lotion.png',
    'bareo-zinc-oxide-protective-diaper-rash-cream.png'
  ]

  for (const f of realFiles) {
    await testRealBareoPackshot(f)
  }
}

runAllRealPackshots()
