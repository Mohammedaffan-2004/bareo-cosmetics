import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'
import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

function testPngFile(filePath: string) {
  const fileBuf = fs.readFileSync(filePath)
  const png = PNG.sync.read(fileBuf)

  const w = png.width
  const h = png.height
  const pixels = new Uint8ClampedArray(png.data.buffer)

  let totalLum = 0
  let specularCount = 0
  const sampledCount = w * h

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

  const res = evaluateImageEligibility(pixels, w, h, brightness, specularRatio)
  console.log(`========================================`)
  console.log(`FILE: ${path.basename(filePath)} (${w}x${h})`)
  console.log(`ELIGIBLE: ${res.eligible}`)
  console.log(`REASON: ${res.reason}`)
  console.log(`FACES: ${res.faceCount}`)
  console.log(`MESSAGE: ${res.userMessage}`)
  console.log(`========================================\n`)
}

const files = [
  'scratch/bareo-category-babycare.png',
  'scratch/bareo-category-bodycare.png',
  'scratch/bareo-category-haircare.png',
  'scratch/bareo-category-skincare.png',
  'scratch/auth-hero.png',
  'scratch/bareo_login_atelier.png'
]

files.forEach(f => {
  if (fs.existsSync(f)) {
    testPngFile(f)
  }
})
