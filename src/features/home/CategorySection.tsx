import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { CategoryCard } from '@/components/cards/CategoryCard'

interface CategorySectionProps {
  categories: Category[]
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="container-page py-16 sm:py-20 border-b border-[#DCE6E9]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCE6E9] pb-6 mb-10">
        <div className="space-y-2">
          {/* BAREO Catalogue Index Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E9] bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#172126] shadow-2xs">
            <span className="text-[#167C86]">✦</span> BAREO / 002 · THE COLLECTION
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#172126] tracking-tight">
            Four disciplines. One considered routine.
          </h2>
          <p className="text-xs text-[#52636B] font-normal sm:text-sm max-w-xl">
            Skincare, hair, body and baby care — formulated around what everyday skin actually needs.
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
