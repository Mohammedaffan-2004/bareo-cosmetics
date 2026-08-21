const LOCAL_BASE_URL = 'http://localhost:5000/api/v1'

async function testRateLimitActivation() {
  console.log('Testing rate limit threshold (20 attempts)...')
  let status429Hit = false

  for (let i = 1; i <= 22; i++) {
    const res = await fetch(`${LOCAL_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '198.51.100.42', // Isolated test IP
      },
      body: JSON.stringify({ email: 'baduser@example.com', password: 'wrongpassword' }),
    })
    
    const body = await res.json().catch(() => null)
    if (res.status === 429) {
      status429Hit = true
      console.log(`✓ Rate limiter correctly activated at attempt #${i} (HTTP 429, Retry-After: ${res.headers.get('retry-after')}s, Message: "${body.message}")`)
      break
    }
  }

  if (!status429Hit) {
    console.error('✗ Rate limiter did not activate after 22 attempts')
  }
}

testRateLimitActivation().catch(console.error)
