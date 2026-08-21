async function checkBackendApiResponse() {
  const res = await fetch('http://localhost:5000/api/v1/products')
  const json = await res.json()
  const items = json?.data?.items || []
  console.log(`Total products returned from backend API: ${items.length}`)
  for (const item of items.slice(0, 8)) {
    console.log(`Product: ${item.name}`)
    console.log(`  id: ${item.id}`)
    console.log(`  slug: ${item.slug}`)
    console.log(`  images:`, JSON.stringify(item.images))
  }
}

checkBackendApiResponse().catch(console.error)
