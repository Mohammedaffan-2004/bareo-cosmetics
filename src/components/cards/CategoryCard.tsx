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
 * Editorial Category Card — Scandinavian Luxury Clinical Skincare Aesthetic.
 * Hairline border (#E1E8EA), 20px card radius, 1:1 art-directed photography,
 * serif heading, and restrained typography.
 */
export function CategoryCard({ category, className }: CategoryCardProps) {
  const imageUrl = getCategoryImage(category)

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[#E1E8EA] bg-white p-4 sm:p-5 shadow-2xs transition-all duration-300 hover:shadow-xs hover:border-[#0F8F83]/40 h-full',
        className
      )}
    >
      {/* 1:1 Editorial Photography Window */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F3F8FA] mb-4 border border-[#E1E8EA]/60">
        <img
          src={imageUrl}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
        />
      </div>

      {/* Editorial Content */}
      <div className="flex flex-col flex-1 justify-between space-y-2">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-normal text-[#111111] group-hover:text-[#0F8F83] transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-[#52616A] line-clamp-2 leading-relaxed font-normal">
              {category.description}
            </p>
          )}
        </div>

        {/* Action Link */}
        <div className="pt-3 border-t border-[#E1E8EA]/70 flex items-center justify-between text-xs font-semibold text-[#111111] group-hover:text-[#0F8F83] transition-colors">
          <span>Explore Range</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
