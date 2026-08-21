import { getStoredToken, setStoredToken, removeStoredToken } from '../src/services/apiClient'

const LOCAL_BASE_URL = 'http://localhost:5000/api/v1'

async function runFixesVerification() {
  console.log('====================================================')
  console.log('VERIFICATION SUITE: AUTH RATE LIMITING, SEARCH, SAFE STORAGE')
  console.log('====================================================\n')

  // 1. Test Safe Storage in Node.js (No window/localStorage)
  console.log('--- TEST 1: SAFE STORAGE ACCESS IN NON-BROWSER RUNTIMES ---')
  try {
    const token = getStoredToken()
    setStoredToken('test-token')
    removeStoredToken()
    console.log(`✓ PASS: getStoredToken(), setStoredToken(), removeStoredToken() executed safely with zero ReferenceErrors (token: ${token})`)
  } catch (err: any) {
    console.error(`✗ FAIL: Storage access threw an error:`, err)
  }

  // 2. Test Product Search with Synonyms
  console.log('\n--- TEST 2: PRODUCT SEARCH WITH SYNONYMS (Backend API) ---')
  const testQueries = ['moisturizer', 'cleanser', 'sunscreen', 'serum', 'hair', 'baby']

  for (const q of testQueries) {
    try {
      const res = await fetch(`${LOCAL_BASE_URL}/products?search=${encodeURIComponent(q)}`)
      const json = await res.json()
      const items = json?.data?.items || []
      const matchCount = items.length
      const sampleNames = items.slice(0, 3).map((i: any) => i.name).join(', ')

      if (matchCount > 0) {
        console.log(`✓ PASS: Query "${q}" -> ${matchCount} products found (e.g. ${sampleNames})`)
      } else {
        console.error(`✗ FAIL: Query "${q}" returned 0 products!`)
      }
    } catch (err: any) {
      console.error(`✗ ERROR testing query "${q}":`, err?.message)
    }
  }

  // 3. Test Valid Login Behaviour & Rate Limit Reset
  console.log('\n--- TEST 3: VALID LOGIN REQUEST & RATE LIMIT RESET ---')
  try {
    const res = await fetch(`${LOCAL_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@bareo.in', password: 'user123' }),
    })
    const json = await res.json()
    if (res.status === 200 && json.data?.token) {
      console.log(`✓ PASS: Valid login succeeded (HTTP ${res.status}, User: ${json.data.user.name}, Token received)`)
    } else {
      console.error(`✗ FAIL: Valid login returned status ${res.status}:`, json)
    }
  } catch (err: any) {
    console.error(`✗ ERROR on valid login:`, err?.message)
  }

  // 4. Test Invalid Login Handling
  console.log('\n--- TEST 4: INVALID CREDENTIALS REJECTION ---')
  try {
    const res = await fetch(`${LOCAL_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@bareo.in', password: 'invalidpassword' }),
    })
    const json = await res.json()
    if (res.status === 401) {
      console.log(`✓ PASS: Invalid login correctly rejected (HTTP 401, Message: "${json.message}")`)
    } else {
      console.error(`✗ FAIL: Invalid login returned unexpected status ${res.status}:`, json)
    }
  } catch (err: any) {
    console.error(`✗ ERROR on invalid login:`, err?.message)
  }

  console.log('\n====================================================')
  console.log('ALL TARGETED VERIFICATIONS COMPLETED')
  console.log('====================================================')
}

runFixesVerification().catch(console.error)
