import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/types'
import { cn } from '@/utils'
import { getCategoryImage } from '@/utils/productImages'

interface CategoryCardProps {
  category: Category
  className?: string
}

function getCategoryMeta(category: Category): { code: string; tag: string } {
  const slug = (category.slug || category.name || '').toLowerCase()
  if (slug.includes('hair')) return { code: '02', tag: 'HAIR / REPAIR' }
  if (slug.includes('body')) return { code: '03', tag: 'BODY / RENEW' }
  if (slug.includes('baby')) return { code: '04', tag: 'BABY / SOOTHE' }
  return { code: '01', tag: 'SKIN / BALANCE' }
}

/**
 * Formulation Plate Category Card — BAREO Clinical Editorial Luxury Aesthetic.
 * Lightweight outer shell (#DCE6E9 border, bg-white), dominant editorial photography window (60-65% visual weight),
 * micro-catalogue metadata index (01 — SKIN / BALANCE), Playfair Display title, and restrained hover transition.
 */
export function CategoryCard({ category, className }: CategoryCardProps) {
  const imageUrl = getCategoryImage(category)
  const meta = getCategoryMeta(category)

  return (
    <Link
      to={`/shop?category=${category.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white p-3.5 sm:p-4 shadow-2xs transition-all duration-300 hover:shadow-xs hover:border-[#167C86]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167C86] h-full',
        className
      )}
    >
      {/* Micro Catalogue Index Header */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#DCE6E9]/60 text-[10px] font-bold tracking-widest text-[#7A8A91] uppercase">
        <span className="font-serif text-xs font-bold text-[#167C86]">{meta.code} —</span>
        <span>{meta.tag}</span>
      </div>

      {/* Dominant 1:1 Editorial Photography Window (60-65% visual weight) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#EDF6F8] mb-3.5 border border-[#DCE6E9]/60">
        <img
          src={imageUrl}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* Editorial Content */}
      <div className="flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[#172126] group-hover:text-[#167C86] transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-[#52636B] line-clamp-2 leading-relaxed font-normal">
              {category.description}
            </p>
          )}
        </div>

        {/* Action Link */}
        <div className="pt-3 border-t border-[#DCE6E9] flex items-center justify-between text-xs font-semibold text-[#172126] group-hover:text-[#167C86] transition-colors min-h-[32px]">
          <span>Explore Products</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}
