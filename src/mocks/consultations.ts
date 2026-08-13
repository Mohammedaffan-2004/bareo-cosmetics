// Mock saved AI consultations shown in the "My Consultations" page.

import type { AiConsultation } from '@/types'
import { PRODUCTS } from './productCatalog'

const DAYS_AGO = (n: number) => new Date(Date.now() - n * 86400000).toISOString()

const safeProd = (i: number) => PRODUCTS[i % PRODUCTS.length] || PRODUCTS[0]

const recommendedProducts = [
  safeProd(0), // Salicylic Acid Cleanser
  safeProd(4), // Niacinamide Serum
  safeProd(5), // Vitamin C Serum
  safeProd(7), // Ceramide Cream
  safeProd(8), // Sunscreen
  safeProd(11), // Eye Cream
].filter(Boolean)

export const MOCK_CONSULTATIONS: AiConsultation[] = [
  {
    id: 'con-1',
    date: DAYS_AGO(21),
    answers: {
      gender: 'female',
      age: 26,
      skinType: 'combination',
      concerns: ['pigmentation', 'acne'],
      oilySkin: true,
      sleepHours: '6-8',
      waterIntake: '2-4',
      sunExposure: 'moderate',
      hasDarkCircles: true,
    },
    selfie: undefined,
    report: {
      skinScore: 78,
      hydration: { label: 'Hydration', score: 74, status: 'fair', detail: 'Slightly dehydrated on cheeks' },
      oilBalance: { label: 'Oil Balance', score: 62, status: 'fair', detail: 'T-zone producing excess oil' },
      sensitivity: { label: 'Sensitivity', score: 81, status: 'good', detail: 'Low reactivity detected' },
      barrier: { label: 'Barrier Resilience', score: 72, status: 'fair', detail: 'Moderate lipid barrier integrity' },
      pigmentation: { label: 'Pigmentation', score: 47, status: 'low', detail: 'UV spots on cheeks & forehead' },
      elasticity: { label: 'Elasticity', score: 84, status: 'good', detail: 'Good firmness for your age' },
      summary: [
        'Your skin is combination with an oily T-zone and mild dehydration.',
        'Pigmentation is your #1 concern — UV exposure is likely worsening it.',
        'Add a vitamin C serum in the AM and a retinal at night to target tone.',
      ],
    },
    routine: {
      morning: {
        name: 'Morning Routine',
        time: '5 min',
        products: [safeProd(0), safeProd(5), safeProd(7), safeProd(8)],
      },
      night: {
        name: 'Night Routine',
        time: '6 min',
        products: [safeProd(0), safeProd(4), safeProd(7), safeProd(11)],
      },
    },
    lifestyleTips: [
      'Sleep 7+ hours to let skin repair overnight.',
      'Drink 3L of water and reduce sugar intake.',
      'Reapply SPF every 3 hours, even indoors near windows.',
      'Change pillowcases twice a week to reduce breakouts.',
    ],
    recommendedProductIds: recommendedProducts.map((p) => p.id),
  },
]
