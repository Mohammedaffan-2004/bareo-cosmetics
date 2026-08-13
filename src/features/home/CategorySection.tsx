import { motion } from 'framer-motion'
import type { Category } from '@/types'
import { CategoryCard } from '@/components/cards/CategoryCard'
import { SectionHeading } from '@/components/common/SectionHeading'

interface CategorySectionProps {
  categories: Category[]
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="container-page py-12">
      <SectionHeading
        eyebrow="Explore the range"
        title="Shop by category"
        subtitle="Everything you need for a complete, considered routine."
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((category, i) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <CategoryCard category={category} className="h-full" />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
