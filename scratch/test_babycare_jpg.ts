import fs from 'fs'
import path from 'path'
import jpeg from 'jpeg-js'
import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

function testImage(filePath: string) {
  const fileBuf = fs.readFileSync(filePath)
  const rawData = jpeg.decode(fileBuf, { useTArray: true })
  
  const w = rawData.width
  const h = rawData.height
  const pixels = rawData.data

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
  console.log(`FILE: ${path.basename(filePath)}`)
  console.log('RESULT:', res)
}

const file = path.resolve('public/editorial/category/bareo-category-babycare.jpg')
testImage(file)
