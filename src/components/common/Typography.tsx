import React from 'react'
import { cn } from '@/utils'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

/** Display XL — Primary Hero Editorial Title (Playfair Display 600) */
export function DisplayXL({ children, className, as: Component = 'h1', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-display-xl text-[#111111]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Display L — Secondary Hero / Major Landing Section Title (Playfair Display 600) */
export function DisplayL({ children, className, as: Component = 'h1', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-display-l text-[#111111]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Heading 1 — Page Title (Playfair Display 600) */
export function Heading1({ children, className, as: Component = 'h1', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-h1 text-[#111111]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Heading 2 — Section Title (Playfair Display 600) */
export function Heading2({ children, className, as: Component = 'h2', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-h2 text-[#111111]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Heading 3 — Component / Card Section Title (Playfair Display 600) */
export function Heading3({ children, className, as: Component = 'h3', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-h3 text-[#111111]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Body Large — Lead Paragraph / Hero Subtitle (Inter 400) */
export function BodyLarge({ children, className, as: Component = 'p', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-body-lg text-[#374151]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Body — Standard Content Paragraph (Inter 400) */
export function Body({ children, className, as: Component = 'p', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-body text-[#4B5563]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Body Small — Auxiliary Copy / Secondary Text (Inter 400) */
export function BodySmall({ children, className, as: Component = 'p', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-body-sm text-[#6B7280]', className)} {...props}>
      {children}
    </Component>
  )
}

/** Caption — Badges, Timestamps, Labels (Inter 500) */
export function Caption({ children, className, as: Component = 'span', ...props }: TypographyProps) {
  return (
    <Component className={cn('typo-caption text-[#9CA3AF]', className)} {...props}>
      {children}
    </Component>
  )
}
