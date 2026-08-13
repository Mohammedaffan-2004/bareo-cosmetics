import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Product } from '@/types'
import { ProductCard } from '@/components/cards/ProductCard'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface ProductRailProps {
  eyebrow?: string
  title: string
  subtitle?: string
  products: Product[]
  viewAllLink?: string
}

export function ProductRail({ eyebrow, title, subtitle, products, viewAllLink }: ProductRailProps) {
  return (
    <section className="container-page py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E7EB] pb-6 mb-8">
        <div className="space-y-1">
          {eyebrow && <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">{eyebrow}</span>}
          <h2 className="font-serif text-3xl font-normal text-[#111111]">{title}</h2>
          {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="outline" size="sm" className="rounded-lg text-xs font-medium">
              View All <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
          >
            <ProductCard product={p} className="h-full" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
