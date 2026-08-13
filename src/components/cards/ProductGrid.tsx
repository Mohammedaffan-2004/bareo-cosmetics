import type { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { ProductCardList } from './ProductCardList'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
  view?: 'grid' | 'list'
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}

export function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
  view = 'grid',
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your filters or search terms.',
  emptyAction,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid gap-4'}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} className="col-span-full" />
  }

  if (view === 'list') {
    return (
      <div className="grid gap-4">
        {products.map((p) => (
          <ProductCardList key={p.id} product={p} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
