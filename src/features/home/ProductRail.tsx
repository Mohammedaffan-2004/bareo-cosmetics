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
    <section className="container-page py-16 sm:py-20 border-b border-[#DCE6E9]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCE6E9] pb-6 mb-10">
        <div className="space-y-1.5">
          {eyebrow && <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">{eyebrow}</span>}
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-[#52636B] max-w-xl">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="outline" size="sm" className="rounded-xl border-[#DCE6E9] text-[#172126] hover:bg-[#EDF6F8] text-xs font-semibold">
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
