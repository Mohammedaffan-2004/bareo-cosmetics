import fs from 'fs'
import path from 'path'
import { PNG } from 'pngjs'
import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

async function auditAll48BareoProductFiles() {
  const dir = path.resolve('public/new-img')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'))

  console.log('====================================================')
  console.log(`AUDITING ALL ${files.length} REAL BAREO PRODUCT PACKSHOT IMAGES`)
  console.log('====================================================')

  let rejectedCount = 0
  let falselyPassed: string[] = []

  for (const f of files) {
    const filePath = path.join(dir, f)
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

    if (!res.eligible && res.faceCount === 0) {
      rejectedCount++
    } else {
      falselyPassed.push(`${f} (Eligible: ${res.eligible}, Reason: ${res.reason}, Faces: ${res.faceCount})`)
    }
  }

  console.log(`REJECTED PACKSHOTS : ${rejectedCount} / ${files.length}`)
  console.log(`FALSELY PASSED     : ${falselyPassed.length}`)
  if (falselyPassed.length > 0) {
    console.log('LIST OF FALSELY PASSED FILES:')
    falselyPassed.forEach((fp) => console.log(` - ${fp}`))
  }
  console.log('====================================================')
}

auditAll48BareoProductFiles()
