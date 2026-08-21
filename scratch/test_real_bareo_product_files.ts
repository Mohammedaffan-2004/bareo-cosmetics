import fs from 'fs'
import path from 'path'
import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

/**
 * Diagnostic runner for real BAREO product packshot image files in public/new-img/
 */
async function testRealBareoImageFile(filePath: string) {
  const fileBuffer = fs.readFileSync(filePath)
  const fileName = path.basename(filePath)
  const base64 = fileBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64}`

  console.log('====================================================')
  console.log(`TESTING REAL BAREO FILE: ${fileName}`)
  console.log(`FILE SIZE: ${fileBuffer.length} bytes`)
  console.log('====================================================')

  // We can also decode raw PNG chunks or test base64 in evaluateImageEligibility
}

const testFiles = [
  'public/new-img/bareo-comfort-cream-mineral-sunscreen-spf-50-pa.png',
  'public/new-img/bareo-invisible-shield-fluid-sunscreen-spf-50-pa.png',
  'public/new-img/bareo-niacinamide-barrier-gel-moisturizer.png',
  'public/new-img/bareo-hydrate-hyaluronic-acid-serum-2.png'
]

testFiles.forEach((f) => {
  const fullPath = path.resolve(f)
  if (fs.existsSync(fullPath)) {
    testRealBareoImageFile(fullPath)
  } else {
    console.log(`File not found: ${f}`)
  }
})
