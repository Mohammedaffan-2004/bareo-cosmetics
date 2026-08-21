import fs from 'fs'
import path from 'path'
import { evaluateImageEligibility } from '../src/utils/imageDermalAnalyzer'

/**
 * Reads raw PNG file data from disk and extracts pixels using basic PNG chunk / header inspection or Uint8Array.
 */
function inspectPngDimensionsAndHeader(filePath: string) {
  const buf = fs.readFileSync(filePath)
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    throw new Error('Not a valid PNG file')
  }
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  return { width, height, bufferSize: buf.length }
}

const dir = path.resolve('public/new-img')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'))

console.log('====================================================')
console.log(`FOUND ${files.length} REAL BAREO PRODUCT PACKSHOT IMAGES IN public/new-img/`)
console.log('====================================================')

files.slice(0, 10).forEach((f, idx) => {
  const fullPath = path.join(dir, f)
  const meta = inspectPngDimensionsAndHeader(fullPath)
  console.log(`[${idx + 1}] ${f} (${meta.width}x${meta.height}, ${Math.round(meta.bufferSize / 1024)} KB)`)
})
console.log('====================================================')
