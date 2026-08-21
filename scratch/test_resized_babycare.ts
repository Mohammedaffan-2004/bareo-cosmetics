import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'
import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

function resizePngNearest(srcPng: PNG, targetW: number, targetH: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(targetW * targetH * 4)
  const xRatio = srcPng.width / targetW
  const yRatio = srcPng.height / targetH

  for (let y = 0; y < targetH; y++) {
    const srcY = Math.floor(y * yRatio)
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.floor(x * xRatio)
      const srcIdx = (srcY * srcPng.width + srcX) * 4
      const outIdx = (y * targetW + x) * 4
      out[outIdx] = srcPng.data[srcIdx]
      out[outIdx + 1] = srcPng.data[srcIdx + 1]
      out[outIdx + 2] = srcPng.data[srcIdx + 2]
      out[outIdx + 3] = srcPng.data[srcIdx + 3]
    }
  }
  return out
}

function testResized(filePath: string) {
  const fileBuf = fs.readFileSync(filePath)
  const png = PNG.sync.read(fileBuf)

  const maxDim = 300
  let w = png.width
  let h = png.height
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w)
      w = maxDim
    } else {
      w = Math.round((w * maxDim) / h)
      h = maxDim
    }
  }

  const pixels = resizePngNearest(png, w, h)

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
  console.log(`RESIZED FILE: ${path.basename(filePath)} (${w}x${h})`)
  console.log(`ELIGIBLE: ${res.eligible}`)
  console.log(`REASON: ${res.reason}`)
  console.log(`FACES: ${res.faceCount}`)
  console.log(`MESSAGE: ${res.userMessage}`)
  console.log(`========================================\n`)
}

testResized('scratch/bareo-category-babycare.png')
