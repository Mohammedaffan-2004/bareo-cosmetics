import { evaluateImageEligibility } from './anthropometric_evaluator'
import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'

function testAdversarial() {
  console.log('====================================================')
  console.log('TESTING ANTHROPOMETRIC EVALUATOR ON ALL EDITORIAL & PRODUCT IMAGES')
  console.log('====================================================')

  const files = [
    'scratch/bareo-category-babycare.png',
    'scratch/bareo-category-bodycare.png',
    'scratch/bareo-category-haircare.png',
    'scratch/bareo-category-skincare.png',
    'scratch/auth-hero.png',
    'scratch/bareo_login_atelier.png'
  ]

  let allBlocked = true

  files.forEach((f) => {
    if (!fs.existsSync(f)) return
    const fileBuf = fs.readFileSync(f)
    const png = PNG.sync.read(fileBuf)
    const pixels = new Uint8ClampedArray(png.data.buffer)
    const w = png.width
    const h = png.height

    let totalLum = 0
    let specularCount = 0
    const sampledCount = w * h
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i], g = pixels[i+1], b = pixels[i+2]
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      totalLum += lum
      if (r > 240 && g > 240 && b > 240) specularCount++
    }
    const brightness = Math.round(totalLum / sampledCount)
    const specularRatio = specularCount / sampledCount

    const res = evaluateImageEligibility(pixels, w, h, brightness, specularRatio)
    console.log(`[TEST] ${path.basename(f)}`)
    console.log(`  ELIGIBLE: ${res.eligible}`)
    console.log(`  REASON: ${res.reason}`)
    console.log(`  FACES: ${res.faceCount}`)
    console.log(`  BLOCKED: ${!res.eligible ? 'YES ✓' : 'FAILED ✗'}`)
    if (res.eligible) allBlocked = false
  })

  console.log(`ALL EDITORIAL OBJECTS BLOCKED: ${allBlocked ? 'YES ✓' : 'NO ✗'}`)
}

testAdversarial()
