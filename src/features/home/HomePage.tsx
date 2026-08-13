import { useQuery } from '@tanstack/react-query'
import { homeService } from '@/services/homeService'
import { Hero } from './Hero'
import { TrustStrip } from './TrustStrip'
import { ProductRail } from './ProductRail'
import { ShopByConcern } from './ShopByConcern'
import { IngredientsSection } from './IngredientsSection'
import { AiTeaser } from './AiTeaser'
import { TestimonialsSection } from './TestimonialsSection'
import { BlogSection } from './BlogSection'
import { CategorySection } from './CategorySection'
import { Skeleton } from '@/components/ui/skeleton'

export function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['home-content'],
    queryFn: () => homeService().getHomeContent(),
  })

  if (isError) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <p className="text-[#6B7280]">Something went wrong loading the homepage.</p>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-10 py-10">
        <div className="container-page">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
        <div className="container-page">
          <Skeleton className="mx-auto mb-6 h-8 w-64 rounded-full" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white text-[#111111]">
      {/* Hero */}
      <Hero banner={data.banners[0]} />

      {/* Trust Strip */}
      <TrustStrip />

      {/* Shop by Category */}
      <CategorySection categories={data.categories} />

      {/* Best Sellers */}
      <ProductRail
        eyebrow="Curated Routines"
        title="Best Sellers"
        subtitle="Our most loved, dermatologist-tested active formulations starting from ₹199."
        products={data.bestSellers.slice(0, 8)}
        viewAllLink="/shop?sort=popular"
      />

      {/* AI Skin Assessment */}
      <AiTeaser />

      {/* Shop by Concern */}
      <ShopByConcern />

      {/* Why Bareo */}
      <IngredientsSection />

      {/* Customer Reviews */}
      <TestimonialsSection testimonials={data.testimonials} />

      {/* Journal */}
      <BlogSection posts={data.blogs} />
    </div>
  )
}

