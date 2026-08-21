import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'

function debugSunscreenPackshot() {
  const filePath = path.resolve('public/new-img/bareo-invisible-shield-fluid-sunscreen-spf-50-pa.png')
  const fileBuf = fs.readFileSync(filePath)
  const png = PNG.sync.read(fileBuf)

  const w = png.width
  const h = png.height
  const pixels = new Uint8ClampedArray(png.data.buffer)

  let totalLum = 0
  let skinPixelCount = 0
  let minX = w, maxX = 0, minY = h, maxY = 0

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4
      const r = pixels[idx]
      const g = pixels[idx + 1]
      const b = pixels[idx + 2]

      const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b

      const isStandardSkin = Cr >= 128 && Cr <= 175 && Cb >= 75 && Cb <= 135 && r > g && r > b
      const isDeepToneSkin = (r + g + b) > 35 && r >= g * 0.9 && g >= b * 0.75 && (r - b) > 10

      if (isStandardSkin || isDeepToneSkin) {
        skinPixelCount++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  const sampledPixels = (w * h) / 4
  const skinRatio = skinPixelCount / sampledPixels
  const faceWidth = maxX - minX
  const faceHeight = maxY - minY
  const faceAreaRatio = (faceWidth * faceHeight) / (w * h)
  const faceAspectRatio = faceWidth / Math.max(1, faceHeight)

  console.log('====================================================')
  console.log('DEBUGGING REAL BAREO SUNSCREEN PACKSHOT (bareo-invisible-shield-fluid-sunscreen-spf-50-pa.png)')
  console.log('====================================================')
  console.log(`SKIN RATIO: ${skinRatio.toFixed(3)}`)
  console.log(`FACE BOUNDING BOX: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`)
  console.log(`FACE WIDTHxHEIGHT: ${faceWidth}x${faceHeight}`)
  console.log(`FACE AREA RATIO: ${faceAreaRatio.toFixed(3)}`)
  console.log(`FACE ASPECT RATIO: ${faceAspectRatio.toFixed(3)}`)
  console.log('====================================================')
}

debugSunscreenPackshot()
