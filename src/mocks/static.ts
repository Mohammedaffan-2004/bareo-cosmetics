// Static marketing mock data: banners, coupons, offers, testimonials, blogs.

import type { Coupon, HomeBanner, Offer, Testimonial } from '@/types'
import { avatarImage } from '@/utils/images'

const addDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString()

export const HOME_BANNERS: HomeBanner[] = [
  {
    id: 'b1',
    eyebrow: 'The AI Skin Consult',
    title: 'Your skin, decoded by AI in 90 seconds.',
    subtitle: 'Answer a few questions, upload a selfie and get a dermatologist-grade routine made just for you.',
    ctaText: 'Start Free Skin Analysis',
    ctaLink: '/skin-analysis',
    image: '/images/products/bareo-cica-serum.png',
    bgGradient: 'from-slate-900 to-slate-800',
    tag: 'AI',
  },
  {
    id: 'b2',
    eyebrow: 'Doctor Recommended',
    title: 'Dermatologist-approved actives at honest prices.',
    subtitle: 'Clean, effective, science-backed formulas — no fragrance, no fluff, no 10-step nonsense.',
    ctaText: 'Shop Best Sellers',
    ctaLink: '/shop?sort=best',
    image: '/images/products/bareo-barrier-hydrator.png',
    bgGradient: 'from-stone-900 to-stone-800',
    tag: 'Bestseller',
  },
  {
    id: 'b3',
    eyebrow: 'Sun Smart Week',
    title: 'Glow that stays. SPF that never fails.',
    subtitle: 'Flat 25% off on our entire sun-protection range. Your future self will thank you.',
    ctaText: 'Shop Sun Care',
    ctaLink: '/shop?category=sunscreen',
    image: '/images/products/bareo-fluid-sunscreen.png',
    bgGradient: 'from-amber-900 to-amber-800',
    tag: 'Sale',
  },
]

export const COUPONS: Coupon[] = [
  { id: 'cp1', code: 'WELCOME10', description: 'Flat 10% off your first order', discountType: 'percent', value: 10, minOrder: 0, maxDiscount: 300, validTill: addDays(30) },
  { id: 'cp2', code: 'GLOW100', description: '₹100 off on orders above ₹799', discountType: 'flat', value: 100, minOrder: 799, validTill: addDays(15) },
  { id: 'cp3', code: 'SUN25', description: '25% off on sun protection range', discountType: 'percent', value: 25, minOrder: 499, maxDiscount: 400, validTill: addDays(7) },
  { id: 'cp4', code: 'DIVA', description: 'Free express shipping on all orders', discountType: 'flat', value: 0, minOrder: 299, validTill: addDays(10) },
  { id: 'cp5', code: 'FESTIVE', description: '₹250 off on orders above ₹1499', discountType: 'flat', value: 250, minOrder: 1499, validTill: addDays(5) },
]

export const OFFERS: Offer[] = [
  { id: 'o1', title: 'Buy 2 Get 1 Free', subtitle: 'On serums & treatments', badge: 'FLASH', code: 'B2G1', background: 'from-slate-900 to-slate-800', discountLabel: '1 FREE', type: 'flash' },
  { id: 'o2', title: 'Monsoon Glow Sale', subtitle: 'Up to 40% off bestsellers', badge: 'SEASON', code: 'MONSOON40', background: 'from-rose-600 to-rose-500', discountLabel: '40% OFF', type: 'season' },
  { id: 'o3', title: 'The Starter Routine', subtitle: 'Cleanser + Serum + Moisturizer at ₹999', badge: 'COMBO', code: 'COMBO', background: 'from-slate-900 to-slate-800', discountLabel: 'SAVE 30%', type: 'combo' },
  { id: 'o4', title: 'Refer & Earn', subtitle: '₹200 credit for every friend', badge: 'REFERRAL', code: 'REFER200', background: 'from-rose-600 to-rose-500', discountLabel: '₹200', type: 'referral' },
]

export const TESTIMONIALS: Testimonial[] = [
  { id: 't1', name: 'Ananya Sharma', role: 'Verified Customer', avatar: '', rating: 5, comment: 'The AI analysis was scarily accurate. My routine finally makes sense and my breakouts are gone in 6 weeks.', skinConcern: 'Acne', productUsed: 'CICA Repair Serum', verified: true, skinType: 'Combination', quote: 'The AI analysis was scarily accurate.', result: 'Clearer skin in 6 weeks', avatarColor: '#0F172A' },
  { id: 't2', name: 'Priya Nair', role: 'Verified Customer', avatar: '', rating: 5, comment: 'I stopped guessing. The recommended hydrating stack fixed my flakiness.', skinConcern: 'Dry Skin', productUsed: 'Barrier Hydrator', verified: true, skinType: 'Dry', quote: 'I stopped guessing.', result: 'Hydrated, calm skin', avatarColor: '#FF5A5F' },
  { id: 't3', name: 'Karan Mehta', role: 'Verified Customer', avatar: '', rating: 4, comment: "Finally a brand that doesn't overload my oily skin.", skinConcern: 'Oily Skin', productUsed: 'Niacinamide 5%', verified: true, skinType: 'Oily', quote: "Finally a brand that doesn't overload my oily skin.", result: 'Balanced oil control', avatarColor: '#0F172A' },
  { id: 't4', name: 'Divya Reddy', role: 'Verified Customer', avatar: '', rating: 5, comment: 'Zero irritation. The centella toner and barrier cream are the only products my reactive skin has ever accepted.', skinConcern: 'Sensitivity', productUsed: 'Centella Toner', verified: true, skinType: 'Sensitive', quote: 'Zero irritation.', result: 'No more redness', avatarColor: '#FF5A5F' },
  { id: 't5', name: 'Sneha Iyer', role: 'Verified Customer', avatar: '', rating: 5, comment: 'Vitamin C + SPF from the routine visibly faded my dark spots.', skinConcern: 'Pigmentation', productUsed: 'Vitamin C 10% Serum', verified: true, skinType: 'Combination', quote: 'Vitamin C + SPF faded my dark spots.', result: 'Even, glowing tone', avatarColor: '#0F172A' },
  { id: 't6', name: 'Ritika Bose', role: 'Verified Customer', avatar: '', rating: 4, comment: 'The retinal night serum is gentle but effective.', skinConcern: 'Anti-Aging', productUsed: 'Retinal Night Serum', verified: true, skinType: 'Normal', quote: 'The retinal night serum is gentle but effective.', result: 'Smoother fine lines', avatarColor: '#FF5A5F' },
]

export const BLOGS: any[] = [
  {
    id: 'bg1',
    slug: 'the-minimalist-4-step-skincare-routine',
    title: 'The Minimalist 4-Step Routine: Why Less Is Scientifically More',
    excerpt: 'Cleanse, treat, moisturise, protect. Discover why leading dermatologists advocate stripping back 12-step routines in favor of high-purity bioactive actives.',
    image: '/editorial/journal/bareo-journal-cover-minimalist-routine.webp',
    coverImage: '/editorial/journal/bareo-journal-cover-minimalist-routine.webp',
    category: 'Routines',
    readTime: '5 min read',
    author: { name: 'Dr. Meera Joshi', role: 'MD Dermatology' },
    publishedAt: addDays(-2),
    date: addDays(-2),
    isFeatured: true,
    tags: ['Routine', 'Minimalism', 'Active Ingredients'],
  },
  {
    id: 'bg2',
    slug: 'demystifying-retinoids-retinol-retinal-retinoic',
    title: 'Demystifying Retinoids: Retinol vs. Retinaldehyde',
    excerpt: 'Understanding molecular conversion rates, optimal concentration percentages, and how to introduce retinal into your night routine without purging.',
    image: '/editorial/journal/bareo-journal-retinoids-retinal.webp',
    coverImage: '/editorial/journal/bareo-journal-retinoids-retinal.webp',
    category: 'Ingredients',
    readTime: '7 min read',
    author: { name: 'Dr. Rohan Kapoor', role: 'Clinical Researcher' },
    publishedAt: addDays(-5),
    date: addDays(-5),
    tags: ['Retinal', 'Anti-Aging', 'Skin Science'],
  },
  {
    id: 'bg3',
    slug: 'sun-protection-science-broad-spectrum-spf',
    title: 'The Anatomy of SPF: Modern UV Filters & Photostability',
    excerpt: 'Why physical and chemical photostable filters are non-negotiable for hyperpigmentation prevention and long-term collagen preservation.',
    image: '/editorial/journal/bareo-journal-spf-uv-filters.webp',
    coverImage: '/editorial/journal/bareo-journal-spf-uv-filters.webp',
    category: 'Sun Care',
    readTime: '4 min read',
    author: { name: 'Dr. Ananya Rao', role: 'Dermatology Fellow' },
    publishedAt: addDays(-8),
    date: addDays(-8),
    tags: ['Sunscreen', 'SPF 50', 'Pigmentation'],
  },
  {
    id: 'bg4',
    slug: 'repairing-a-compromised-skin-barrier',
    title: 'Repairing a Damaged Barrier: Ceramides & Centella Asiatica',
    excerpt: 'Flaking, redness, or stinging after applying products? Here is your step-by-step emergency protocol to restore intercellular lipid matrixes.',
    image: '/editorial/journal/bareo-journal-barrier-ceramides-cica.webp',
    coverImage: '/editorial/journal/bareo-journal-barrier-ceramides-cica.webp',
    category: 'Skin Science',
    readTime: '6 min read',
    author: { name: 'Dr. Meera Joshi', role: 'MD Dermatology' },
    publishedAt: addDays(-11),
    date: addDays(-11),
    tags: ['Barrier Repair', 'Ceramides', 'Centella'],
  },
  {
    id: 'bg5',
    slug: 'niacinamide-and-sebum-regulation',
    title: 'The Multi-Target Power of 5% Pure Niacinamide',
    excerpt: 'From controlling excess sebum secretion to tightening enlarged pore walls, explore why Niacinamide remains dermatologys ultimate multitasker.',
    image: '/editorial/journal/bareo-journal-niacinamide-sebum.webp',
    coverImage: '/editorial/journal/bareo-journal-niacinamide-sebum.webp',
    category: 'Ingredients',
    readTime: '5 min read',
    author: { name: 'Bareo Science Lab', role: 'Formulation Team' },
    publishedAt: addDays(-14),
    date: addDays(-14),
    tags: ['Niacinamide', 'Oily Skin', 'Pores'],
  },
  {
    id: 'bg6',
    slug: 'hyaluronic-acid-molecular-weights',
    title: 'Multi-Depth Hydration: Why Molecular Weight Matters',
    excerpt: 'High, medium, and low molecular weight Hyaluronic Acid work synergistically across epidermal layers to lock in 1000x cellular water volume.',
    image: '/editorial/journal/bareo-journal-hyaluronic-molecular-weight.webp',
    coverImage: '/editorial/journal/bareo-journal-hyaluronic-molecular-weight.webp',
    category: 'Skin Science',
    readTime: '6 min read',
    author: { name: 'Dr. Rohan Kapoor', role: 'Clinical Researcher' },
    publishedAt: addDays(-18),
    date: addDays(-18),
    tags: ['Hydration', 'Hyaluronic Acid', 'Dry Skin'],
  },
]

export const STATIC_IMAGES = { testimonialAvatars: TESTIMONIALS.map((t) => avatarImage(9, t.avatarColor ?? '#0F172A')) }
