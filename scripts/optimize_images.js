import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const dir = path.join(process.cwd(), 'public/images/products')
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png'))

async function processImages() {
  console.log('Optimizing product images...')

  for (const file of files) {
    const inputPath = path.join(dir, file)
    const nameWithoutExt = path.parse(file).name
    const webpPath = path.join(dir, `${nameWithoutExt}.webp`)
    const buffer = fs.readFileSync(inputPath)

    // 1. Generate WebP version (High Quality 85%, max 800px)
    await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath)

    // 2. Generate Optimized PNG version (max 800px)
    const optimizedPngBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer()

    fs.writeFileSync(inputPath, optimizedPngBuffer)

    const pngSize = (fs.statSync(inputPath).size / 1024).toFixed(1)
    const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1)
    console.log(`✓ ${file}: PNG = ${pngSize} KB | WebP = ${webpSize} KB`)
  }
}

processImages().catch(console.error)
