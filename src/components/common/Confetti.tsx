import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#0F766E', '#4ADE80', '#14B8A6', '#F59E0B', '#3B82F6', '#F43F5E']

interface ConfettiProps {
  count?: number
}

/** Lightweight CSS-confetti burst for the order-success moment. */
export function Confetti({ count = 80 }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.4 + Math.random() * 1.8,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 720 - 360,
        size: 6 + Math.random() * 8,
        round: Math.random() > 0.5,
      })),
    [count]
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, x: `${p.left}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '105vh', x: `calc(${p.left}vw + ${Math.sin(p.id) * 90}px)`, opacity: [1, 1, 0.9], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          className="absolute top-0"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}
