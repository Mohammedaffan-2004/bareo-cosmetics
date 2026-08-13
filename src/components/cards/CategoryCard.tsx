import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/types'
import { cn } from '@/utils'
import { getCategoryImage } from '@/utils/productImages'

interface CategoryCardProps {
  category: Category
  className?: string
}

/**
 * Modernized Category Card — Apple & Rhode inspired minimal glass styling.
 * Soft borders (#F1F3F5), 2xl card radius, ambient gradient backdrop,
 * and micro-interaction hover lift.
 */
export function CategoryCard({ category, className }: CategoryCardProps) {
  const imageUrl = getCategoryImage(category)

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-2xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#CBD5E1]',
        className
      )}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#FAFAFA] mb-3 border border-[#E5E7EB]">
        <img
          src={imageUrl}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-contain p-2.5 transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-1 gap-1">
        <h3 className="font-serif text-base font-semibold text-[#111111] group-hover:underline transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed font-normal">
            {category.description}
          </p>
        )}
        <div className="mt-auto pt-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#111111] transition-transform group-hover:translate-x-1">
          <span>Explore Range</span>
          <ArrowRight className="size-3.5 text-[#111111]" />
        </div>
      </div>
    </Link>
  )
}
