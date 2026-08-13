import type { Review } from '@/types'

const REVIEWERS = ['Ananya', 'Priya', 'Rohan', 'Sneha', 'Meera', 'Karan', 'Divya', 'Arjun', 'Isha', 'Vikram', 'Neha', 'Aditya', 'Ritika', 'Sanjana', 'Kavya', 'Manav']
const REVIEW_TEMPLATES: string[] = [
  'Absolutely love this. My skin feels so much calmer within two weeks of consistent use.',
  'Been using this for a month now and the results are genuinely visible. Would recommend.',
  'Lightweight texture and zero irritation. Perfect addition to my routine.',
  'The packaging is premium and the product feels gentle yet effective.',
  'My dermatologist recommended this and it has become a staple in my AM routine.',
  'Great value for money. A little goes a long way so the tube lasts forever.',
  'Noticed a visible difference in texture. My makeup sits better now.',
  'Lovely non-sticky finish. Absorbs fast without any residue.',
  'My skin is sensitive and this didn’t break me out. Huge win.',
  'Consistent use has really helped with my concerns. 10/10 experience.',
  'Subtle, clean fragrance. Packaging feels sustainable and thoughtful.',
  'Finally a product that works without overloading my skin.',
]
const TITLES = ['Works wonders', 'Holy grail', 'Worth every rupee', 'Gentle yet effective', 'Visible results', 'Instant glow', 'Dermatologist favourite', 'Staple in my routine']
const MONTHS_AGO = [3, 6, 12, 20, 28, 40, 55, 70, 90, 120, 150, 180]

function seeded(seed: number): () => number {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/** Deterministically generate reviews for a product from its id + index. */
export function generateReviews(productId: string, seed: number, count = 3): Review[] {
  const rand = seeded(seed)
  const reviews: Review[] = []
  for (let i = 0; i < count; i++) {
    const rating = rand() < 0.7 ? 5 : rand() < 0.85 ? 4 : 3
    const daysAgo = MONTHS_AGO[Math.floor(rand() * MONTHS_AGO.length)]
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    reviews.push({
      id: `${productId}-r${i}`,
      productId,
      userId: `user-${i}`,
      userName: REVIEWERS[Math.floor(rand() * REVIEWERS.length)],
      rating,
      title: TITLES[Math.floor(rand() * TITLES.length)],
      comment: REVIEW_TEMPLATES[Math.floor(rand() * REVIEW_TEMPLATES.length)],
      date,
      verified: rand() > 0.2,
      helpful: Math.floor(rand() * 60),
    })
  }
  return reviews
}
