import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes with conditional support. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian Rupees. Safe against undefined, null, and NaN. */
export function formatINR(value: number | null | undefined): string {
  const safeValue = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: safeValue % 1 === 0 ? 0 : 2,
  }).format(safeValue)
}

/** Format a number with Indian grouping (1,23,456). Safe against undefined, null, and NaN. */
export function formatNumber(value: number | null | undefined): string {
  const safeValue = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0
  return new Intl.NumberFormat('en-IN').format(safeValue)
}

/** Compact format for dashboard metrics (₹1.2L, 3.4k). Safe against undefined, null, and NaN. */
export function formatCompact(value: number | null | undefined): string {
  const safeValue = typeof value === 'number' && !isNaN(value) && isFinite(value) ? value : 0
  if (safeValue >= 100000) return `₹${(safeValue / 100000).toFixed(1)}L`
  if (safeValue >= 1000) return `₹${(safeValue / 1000).toFixed(1)}k`
  return `₹${Math.round(safeValue)}`
}

/** Format an ISO date string to "12 Jan 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Format time from ISO string to "09:45 PM". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

/** Relative time like "2h ago". */
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

/** Generate a realistic order ID like "LMS-2026-482139". */
export function generateOrderId(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `LMS-${year}-${rand}`
}

/** Generate a short unique id. */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/** Shuffle an array (used for pseudo-random mock data). */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Calculate discount percent given mrp and offer price. */
export function discountPercent(mrp: number, offer: number): number {
  if (mrp <= 0) return 0
  return Math.round(((mrp - offer) / mrp) * 100)
}

/** Delay helper that simulates a network round-trip. */
export function wait(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Deep clone a mock JSON object so mutations never leak between calls. */
export function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
