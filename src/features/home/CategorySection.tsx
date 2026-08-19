import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { CategoryCard } from '@/components/cards/CategoryCard'

interface CategorySectionProps {
  categories: Category[]
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="container-page py-14 sm:py-18">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E1E8EA] pb-5 mb-8">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#0F8F83]">
            Curated Formulations
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs text-[#52616A] font-normal">
            Everything you need for a complete, considered routine across all dermal disciplines.
          </p>
        </div>
      </div>

      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {categories.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="h-full"
          >
            <CategoryCard category={category} className="h-full" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
