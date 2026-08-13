// Static marketing mock data: banners, coupons, offers, testimonials, blogs.

import type { BlogPost, Coupon, HomeBanner, Offer, Testimonial } from '@/types'
import { avatarImage } from '@/utils/images'

const addDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString()

export const HOME_BANNERS: HomeBanner[] = [
  {
    id: 'b1',
    eyebrow: 'The AI Skin Consult',
    title: 'Your skin, decoded by AI in 90 seconds.',
    subtitle: 'Answer a few questions, upload a selfie and get a dermatologist-grade routine made just for you.',
    ctaLabel: 'Start Free Skin Analysis',
    ctaLink: '/skin-analysis',
    image: '/images/products/bareo-cica-serum.png',
  },
  {
    id: 'b2',
    eyebrow: 'Doctor Recommended',
    title: 'Dermatologist-approved actives at honest prices.',
    subtitle: 'Clean, effective, science-backed formulas — no fragrance, no fluff, no 10-step nonsense.',
    ctaLabel: 'Shop Best Sellers',
    ctaLink: '/shop?sort=best',
    image: '/images/products/bareo-barrier-hydrator.png',
  },
  {
    id: 'b3',
    eyebrow: 'Sun Smart Week',
    title: 'Glow that stays. SPF that never fails.',
    subtitle: 'Flat 25% off on our entire sun-protection range. Your future self will thank you.',
    ctaLabel: 'Shop Sun Care',
    ctaLink: '/shop?category=sunscreen',
    image: '/images/products/bareo-fluid-sunscreen.png',
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
  { id: 't1', name: 'Ananya Sharma', skinType: 'Combination', rating: 5, quote: 'The AI analysis was scarily accurate. My routine finally makes sense and my breakouts are gone in 6 weeks.', result: 'Clearer skin in 6 weeks', avatarColor: '#0F172A' },
  { id: 't2', name: 'Priya Nair', skinType: 'Dry', rating: 5, quote: 'I stopped guessing. The recommended hydrating stack fixed my flakiness that every "hydrating" cream before failed at.', result: 'Hydrated, calm skin', avatarColor: '#FF5A5F' },
  { id: 't3', name: 'Karan Mehta', skinType: 'Oily', rating: 4, quote: 'Finally a brand that doesn\'t overload my oily skin. The mattifying moisturizer + niacinamide duo is perfect.', result: 'Balanced oil control', avatarColor: '#0F172A' },
  { id: 't4', name: 'Divya Reddy', skinType: 'Sensitive', rating: 5, quote: 'Zero irritation. The centella toner and barrier cream are the only products my reactive skin has ever accepted.', result: 'No more redness', avatarColor: '#FF5A5F' },
  { id: 't5', name: 'Sneha Iyer', skinType: 'Pigmentation', rating: 5, quote: 'Vitamin C + SPF from the routine visibly faded my dark spots. I get compliments on my "glass skin" now.', result: 'Even, glowing tone', avatarColor: '#0F172A' },
  { id: 't6', name: 'Ritika Bose', skinType: 'Anti-Aging', rating: 4, quote: 'The retinal night serum is gentle but effective. Fine lines around my eyes look softer after a month.', result: 'Smoother fine lines', avatarColor: '#FF5A5F' },
]

export const BLOGS: any[] = [
  {
    id: 'bg1',
    slug: 'the-minimalist-4-step-skincare-routine',
    title: 'The Minimalist 4-Step Routine: Why Less Is Scientifically More',
    excerpt: 'Cleanse, treat, moisturise, protect. Discover why leading dermatologists advocate stripping back 12-step routines in favor of high-purity bioactive actives.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    category: 'Routines',
    readTime: '5 min read',
    author: { name: 'Dr. Meera Joshi', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80', role: 'MD Dermatology' },
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
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    category: 'Ingredients',
    readTime: '7 min read',
    author: { name: 'Dr. Rohan Kapoor', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80', role: 'Clinical Researcher' },
    publishedAt: addDays(-5),
    date: addDays(-5),
    tags: ['Retinal', 'Anti-Aging', 'Skin Science'],
  },
  {
    id: 'bg3',
    slug: 'sun-protection-science-broad-spectrum-spf',
    title: 'The Anatomy of SPF: Modern UV Filters & Photostability',
    excerpt: 'Why physical and chemical photostable filters are non-negotiable for hyperpigmentation prevention and long-term collagen preservation.',
    image: 'https://images.unsplash.com/photo-1512290900676-26c2a4d48dc1?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1512290900676-26c2a4d48dc1?auto=format&fit=crop&w=1200&q=80',
    category: 'Sun Care',
    readTime: '4 min read',
    author: { name: 'Dr. Ananya Rao', avatar: 'https://images.unsplash.com/photo-1594824813571-24a699857317?auto=format&fit=crop&w=200&q=80', role: 'Dermatology Fellow' },
    publishedAt: addDays(-8),
    date: addDays(-8),
    tags: ['Sunscreen', 'SPF 50', 'Pigmentation'],
  },
  {
    id: 'bg4',
    slug: 'repairing-a-compromised-skin-barrier',
    title: 'Repairing a Damaged Barrier: Ceramides & Centella Asiatica',
    excerpt: 'Flaking, redness, or stinging after applying products? Here is your step-by-step emergency protocol to restore intercellular lipid matrixes.',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80',
    category: 'Skin Science',
    readTime: '6 min read',
    author: { name: 'Dr. Meera Joshi', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80', role: 'MD Dermatology' },
    publishedAt: addDays(-11),
    date: addDays(-11),
    tags: ['Barrier Repair', 'Ceramides', 'Centella'],
  },
  {
    id: 'bg5',
    slug: 'niacinamide-and-sebum-regulation',
    title: 'The Multi-Target Power of 5% Pure Niacinamide',
    excerpt: 'From controlling excess sebum secretion to tightening enlarged pore walls, explore why Niacinamide remains dermatologys ultimate multitasker.',
    image: 'https://images.unsplash.com/photo-1608248597262-8382d61d15bf?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1608248597262-8382d61d15bf?auto=format&fit=crop&w=1200&q=80',
    category: 'Ingredients',
    readTime: '5 min read',
    author: { name: 'Bareo Science Lab', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'Formulation Team' },
    publishedAt: addDays(-14),
    date: addDays(-14),
    tags: ['Niacinamide', 'Oily Skin', 'Pores'],
  },
  {
    id: 'bg6',
    slug: 'hyaluronic-acid-molecular-weights',
    title: 'Multi-Depth Hydration: Why Molecular Weight Matters',
    excerpt: 'High, medium, and low molecular weight Hyaluronic Acid work synergistically across epidermal layers to lock in 1000x cellular water volume.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1200&q=80',
    coverImage: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1200&q=80',
    category: 'Skin Science',
    readTime: '6 min read',
    author: { name: 'Dr. Rohan Kapoor', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80', role: 'Clinical Researcher' },
    publishedAt: addDays(-18),
    date: addDays(-18),
    tags: ['Hydration', 'Hyaluronic Acid', 'Dry Skin'],
  },
]

export const STATIC_IMAGES = { testimonialAvatars: TESTIMONIALS.map((t) => avatarImage(9, t.avatarColor)) }
