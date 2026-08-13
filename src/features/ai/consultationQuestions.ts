import type { Concern, SkinType } from '@/types'

export const CONCERNS: { value: Concern; label: string; emoji: string }[] = [
  { value: 'acne', label: 'Acne & Breakouts', emoji: '🔴' },
  { value: 'pigmentation', label: 'Pigmentation & Spots', emoji: '🧴' },
  { value: 'dryness', label: 'Dryness & Flakiness', emoji: '💧' },
  { value: 'oiliness', label: 'Oiliness & Shine', emoji: '✨' },
  { value: 'anti-aging', label: 'Fine Lines & Aging', emoji: '🕰️' },
  { value: 'sensitivity', label: 'Sensitivity & Redness', emoji: '🌸' },
  { value: 'dark-circles', label: 'Dark Circles', emoji: '👁️' },
  { value: 'redness', label: 'Redness', emoji: '🔥' },
]

export const SKIN_TYPES: { value: SkinType; label: string }[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
  { value: 'normal', label: 'Normal' },
  { value: 'sensitive', label: 'Sensitive' },
]

export const SLEEP_OPTIONS = [
  { value: 'more-than-8', label: '8+ hours' },
  { value: '6-8', label: '6 – 8 hours' },
  { value: 'less-than-6', label: 'Less than 6 hours' },
]

export const WATER_OPTIONS = [
  { value: 'more-than-4', label: 'More than 4 glasses' },
  { value: '2-4', label: '2 – 4 glasses' },
  { value: 'less-than-2', label: 'Less than 2 glasses' },
]

export const SUN_OPTIONS = [
  { value: 'low', label: 'Mostly indoors' },
  { value: 'medium', label: 'A few hours a day' },
  { value: 'high', label: 'Outdoor most of the day' },
]
