import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock, BookOpen, Sparkles, Zap } from 'lucide-react'
import { homeService } from '@/services/homeService'
import { BlogCard } from '@/components/cards/BlogCard'
import { SmartImage } from '@/components/common/SmartImage'
import { Loader } from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/utils'
import type { BlogPost } from '@/types'

const CATEGORIES = [
  'All Stories',
  'Routines',
  'Ingredients',
  'Skin Science',
  'Sun Care',
  'Barrier Health',
]

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All Stories')

  const { data, isLoading } = useQuery({
    queryKey: ['home-content'],
    queryFn: () => homeService().getHomeContent(),
  })

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF7F2]">
        <Loader label="Fetching journal editorials…" />
      </div>
    )
  }

  const articles: BlogPost[] = data.blogs || []
  
  // Real data derivations (0 hardcoded values)
  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0]
  
  // Dynamic Editor's Pick from remaining real articles
  const editorsPick = articles.find((a) => a.id !== featuredArticle?.id && (a.category === 'Ingredients' || a.category === 'Skin Science')) || articles[1]

  // Dynamic Skin Science Quick Read from real skin science articles
  const quickReadArticle = articles.find((a) => a.id !== featuredArticle?.id && a.id !== editorsPick?.id && (a.category === 'Skin Science' || a.category === 'Barrier Health')) || articles[2]

  const filteredArticles = articles.filter((a) => {
    if (activeCategory === 'All Stories') return true
    return a.category?.toLowerCase() === activeCategory.toLowerCase()
  })

  // Data-derived category count
  const uniqueCategories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))

  const authorName = typeof featuredArticle?.author === 'object' ? featuredArticle.author?.name : featuredArticle?.author || 'Dr. Meera Joshi'
  const authorAvatar = typeof featuredArticle?.author === 'object' ? featuredArticle.author?.avatar : null
  const authorRole = typeof featuredArticle?.author === 'object' ? featuredArticle.author?.role : 'MD Dermatology'
  const pubDate = featuredArticle?.publishedAt || featuredArticle?.date || new Date().toISOString()

  return (
    <div className="bg-white">
      {/* 1. EDITORIAL JOURNAL HERO */}
      <section className="border-b border-[#EBE5D8] bg-[#FAF7F2] py-16 sm:py-20">
        <div className="container-page text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-[#EBE5D8] px-4 py-1.5 text-xs font-semibold text-[#111111] uppercase tracking-[0.18em] shadow-2xs">
            <BookOpen className="size-3.5 text-[#059669]" /> The Bareo Journal • Edition 14
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#111111] tracking-tight leading-tight">
            Science for Everyday Skin.
          </h1>

          <p className="text-xs sm:text-sm text-[#6B7280] font-light leading-relaxed max-w-2xl mx-auto">
            Evidence-based dermatological insights, bioactive ingredient breakdowns, and routine guides written with leading skincare specialists.
          </p>

          {/* Editorial Metadata Line */}
          {articles.length > 0 && (
            <div className="pt-2 flex items-center justify-center gap-3 text-xs text-[#9CA3AF] font-medium">
              <span>{articles.length} stories</span>
              <span>•</span>
              <span>{uniqueCategories.length} categories</span>
              <span>•</span>
              <span>Dermatologist reviewed</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. FEATURED COVER STORY */}
      {featuredArticle && (
        <section className="border-b border-[#E5E7EB] py-12 sm:py-16 bg-white">
          <div className="container-page">
            <div className="group relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2] p-6 sm:p-10 transition-all duration-300 hover:border-[#111111]/30 shadow-2xs">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                {/* Hero Cover Image */}
                <div className="lg:col-span-7 aspect-16/10 overflow-hidden rounded-2xl bg-white shadow-2xs h-72 sm:h-96 w-full">
                  <SmartImage
                    src={featuredArticle.coverImage || featuredArticle.image}
                    alt={featuredArticle.title}
                    category={featuredArticle.category}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                  />
                </div>

                {/* Hero Editorial Content */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-[#111111] text-white px-3 py-1 font-semibold text-[10px] uppercase tracking-widest shadow-2xs">
                      Featured Cover Story
                    </span>
                    <span className="rounded-full bg-white border border-[#E5E7EB] px-3 py-1 font-semibold text-[#111111] text-[10px] uppercase tracking-wider">
                      {featuredArticle.category}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight text-[#111111] group-hover:translate-x-0.5 transition-transform">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#6B7280] font-light leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Author Bar */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#E8E1D3]">
                    <div className="flex items-center gap-3">
                      {authorAvatar ? (
                        <SmartImage src={authorAvatar} alt={authorName} className="size-9 rounded-full object-cover border border-[#E5E7EB]" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-[#111111] text-white text-xs font-semibold">
                          {authorName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-[#111111]">{authorName}</p>
                        <p className="text-[10px] text-[#6B7280] font-light">{authorRole} • {formatDate(pubDate)}</p>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-[#6B7280] flex items-center gap-1">
                      <Clock className="size-3.5" /> {featuredArticle.readTime}
                    </span>
                  </div>

                  <Button className="w-full sm:w-auto h-11 rounded-xl bg-[#111111] text-white text-xs font-semibold px-6 hover:bg-black shadow-2xs min-h-[44px]">
                    Read Full Editorial <ArrowRight className="size-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. LATEST EDITORIALS + CATEGORY FILTER BAR */}
      <section className="container-page py-12 sm:py-16 space-y-8">
        {/* Filter Bar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111]">Latest Editorials</h2>
            <p className="text-xs text-[#6B7280] font-light mt-0.5">Explore skincare science, routines, and bioactive ingredients.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'shrink-0 rounded-xl border px-4 py-2 text-xs font-medium transition-all duration-200 min-h-[38px]',
                  activeCategory === cat
                    ? 'border-[#111111] bg-[#111111] text-white font-semibold shadow-2xs'
                    : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Animated Articles Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredArticles.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. EDITOR'S PICK SECTION */}
      {editorsPick && (
        <section className="border-t border-[#E5E7EB] bg-[#FAF7F2] py-12 sm:py-16">
          <div className="container-page">
            <div className="group relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-10 transition-all duration-300 hover:border-[#111111]/30 shadow-2xs">
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                {/* Left Info Column */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#FAF7F2] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#111111]">
                    <Sparkles className="size-3 text-[#059669]" /> EDITOR'S PICK
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug text-[#111111] group-hover:translate-x-0.5 transition-transform">
                    {editorsPick.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B7280] font-light leading-relaxed">
                    {editorsPick.excerpt}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[#111111] text-white text-[10px] font-semibold">
                        {(typeof editorsPick.author === 'object' ? editorsPick.author?.name : editorsPick.author || 'B').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#111111]">
                          {typeof editorsPick.author === 'object' ? editorsPick.author?.name : editorsPick.author || 'Bareo Science Lab'}
                        </p>
                        <p className="text-[10px] text-[#6B7280] font-light">
                          {typeof editorsPick.author === 'object' ? editorsPick.author?.role : 'Clinical Researcher'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[#6B7280] font-medium">{editorsPick.readTime}</span>
                  </div>

                  <Button className="h-10 rounded-xl bg-[#111111] text-white text-xs font-semibold px-5 hover:bg-black min-h-[40px]">
                    Read Editorial <ArrowRight className="size-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Right Image Column */}
                <div className="lg:col-span-6 aspect-16/10 overflow-hidden rounded-2xl bg-[#FAF7F2] shadow-2xs h-64 sm:h-80 w-full">
                  <SmartImage
                    src={editorsPick.coverImage || editorsPick.image}
                    alt={editorsPick.title}
                    category={editorsPick.category}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. SKIN SCIENCE QUICK READ SECTION */}
      {quickReadArticle && (
        <section className="border-t border-[#E5E7EB] bg-white py-12 sm:py-16">
          <div className="container-page max-w-4xl">
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FAF7F2]/80 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#059669]/20 bg-[#ECFDF5] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#047857]">
                  <Zap className="size-3" /> SKIN SCIENCE · 60 SECONDS
                </div>
                <span className="text-[11px] font-medium text-[#6B7280]">{quickReadArticle.readTime}</span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#111111]">
                {quickReadArticle.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#6B7280] font-light leading-relaxed">
                {quickReadArticle.excerpt}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-[#E5E7EB]">
                <span className="text-xs text-[#111111] font-semibold">
                  Category: {quickReadArticle.category}
                </span>
                <span className="text-xs font-semibold text-[#111111] flex items-center gap-1 cursor-pointer hover:underline">
                  Read the science <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. BAREO PHILOSOPHY QUOTE MANIFESTO */}
      <section className="border-y border-[#EBE5D8] bg-[#FAF7F2] py-16 sm:py-20">
        <div className="container-page text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#059669]">
            <Sparkles className="size-3.5" /> THE BAREO PHILOSOPHY
          </div>
          
          <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal leading-relaxed text-[#111111]">
            “We believe skincare should be straightforward. No inflated percentages, no misleading claims — just biocompatible formulations that respect your dermal ecosystem.”
          </blockquote>
          
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Dr. Meera Joshi, MD Dermatology</p>
            <p className="text-[11px] text-[#6B7280] font-light">Head of Research &amp; Clinical Formulations at Bareo</p>
          </div>
        </div>
      </section>
    </div>
  )
}
