import { chromium } from 'playwright'
import path from 'path'

async function runBrowserPackshotAudit() {
  console.log('====================================================')
  console.log('RUNNING BROWSER QA AUDIT ON /skin-analysis WITH REAL BAREO PACKSHOT')
  console.log('====================================================')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Collect browser console messages & errors
  page.on('console', (msg) => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`))
  page.on('pageerror', (err) => console.error(`[BROWSER UNCAUGHT ERROR]`, err))

  try {
    console.log('Navigating to http://localhost:5173/skin-analysis...')
    await page.goto('http://localhost:5173/skin-analysis', { waitUntil: 'networkidle' })

    // Find upload photo button or file input
    const fileInput = page.locator('input[type="file"]')
    const realPackshotPath = path.resolve('public/new-img/bareo-comfort-cream-mineral-sunscreen-spf-50-pa.png')
    
    console.log(`Setting file input to: ${realPackshotPath}`)
    await fileInput.setInputFiles(realPackshotPath)

    // Wait for step 3 quality check or UI evaluation
    await page.waitForTimeout(3000)

    // Inspect UI text and step state
    const bodyText = await page.innerText('body')
    console.log('----------------------------------------------------')
    console.log('PAGE TEXT SNIPPET AFTER REAL PACKSHOT UPLOAD:')
    console.log(bodyText.slice(0, 1200))
    console.log('----------------------------------------------------')

    // Check if 1 FACE DETECTED or NO FACE DETECTED is shown
    const hasOneFace = bodyText.includes('1 FACE DETECTED')
    const hasNoFace = bodyText.includes('NO FACE DETECTED')
    const buttonText = await page.locator('button:has-text("ANALYSE MY SKIN")').count()

    console.log(`UI RESULT - Has "1 FACE DETECTED": ${hasOneFace}`)
    console.log(`UI RESULT - Has "NO FACE DETECTED": ${hasNoFace}`)
    console.log(`UI RESULT - "ANALYSE MY SKIN" button count: ${buttonText}`)
    console.log('====================================================')

  } catch (err) {
    console.error('Playwright Test Error:', err)
  } finally {
    await browser.close()
  }
}

runBrowserPackshotAudit()
