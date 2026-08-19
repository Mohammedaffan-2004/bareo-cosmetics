import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock, BookOpen, Sparkles, Zap, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeService } from '@/services/homeService'
import { BlogCard } from '@/components/cards/BlogCard'
import { SmartImage } from '@/components/common/SmartImage'
import { Loader } from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/utils'
import type { BlogPost } from '@/types'

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All Stories')
  const [subscribed, setSubscribed] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['home-content'],
    queryFn: () => homeService().getHomeContent(),
  })

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFBFA]">
        <Loader label="Fetching journal editorials…" />
      </div>
    )
  }

  const articles: BlogPost[] = data.blogs || []
  
  // Real data derivations
  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0]
  const editorsPick = articles.find((a) => a.id === 'bg2') || articles[1]
  const quickReadArticle = articles.find((a) => a.id === 'bg4') || articles[3]

  // Dynamic Categories from actual data
  const rawCategories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))
  const filterCategories = ['All Stories', ...rawCategories]

  const filteredArticles = articles.filter((a) => {
    if (activeCategory === 'All Stories') return true
    return a.category?.toLowerCase() === activeCategory.toLowerCase()
  })

  const getCategoryCount = (category: string) => {
    if (category === 'All Stories') return articles.length
    return articles.filter((a) => a.category?.toLowerCase() === category.toLowerCase()).length
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailInput.trim()) {
      setSubscribed(true)
      setEmailInput('')
    }
  }

  const authorName = typeof featuredArticle?.author === 'object' ? featuredArticle.author?.name : featuredArticle?.author || 'Dr. Meera Joshi'
  const authorAvatar = typeof featuredArticle?.author === 'object' ? featuredArticle.author?.avatar : null
  const authorRole = typeof featuredArticle?.author === 'object' ? featuredArticle.author?.role : 'MD Dermatology'
  const pubDate = featuredArticle?.publishedAt || featuredArticle?.date || new Date().toISOString()

  return (
    <div className="bg-[#FAFBFA] min-h-screen text-[#111111]">
      {/* 1. EDITORIAL JOURNAL HERO (Subtle gradient: #F7FBFC → #EEF6F8 → #FAFBFA) */}
      <section className="border-b border-[#E1E8EA] bg-gradient-to-b from-[#F7FBFC] via-[#EEF6F8] to-[#FAFBFA] py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Subtle Ambient Light Caustic */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(15,143,131,0.035),transparent)] pointer-events-none" />
        
        <div className="container-page relative z-10 text-center space-y-4 max-w-3xl">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/95 border border-[#E1E8EA] px-3.5 py-1 text-[11px] font-semibold text-[#111111] uppercase tracking-[0.18em] shadow-2xs">
            <BookOpen className="size-3 text-[#0F8F83]" /> THE BAREO JOURNAL · EDITION 14
          </div>

          {/* Main Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] font-normal text-[#111111] tracking-tight leading-[1.08]">
            Science for <br />
            <span className="italic font-serif">Everyday Skin.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base text-[#52616A] font-normal leading-relaxed max-w-xl mx-auto">
            Evidence-based dermatological insights, bioactive ingredient breakdowns, and routine guides written with leading skincare specialists.
          </p>

          {/* Clinical Verification Badges Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-[#52616A] uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[#111111]">
              <span className="text-[#0F8F83]">✦</span> {articles.length} STORIES
            </span>
            <span className="text-[#E1E8EA]">•</span>
            <span className="flex items-center gap-1.5 text-[#111111]">
              <span className="text-[#0F8F83]">✦</span> {rawCategories.length} CLINICAL DISCIPLINES
            </span>
            <span className="text-[#E1E8EA]">•</span>
            <span className="flex items-center gap-1.5 text-[#0F8F83]">
              <ShieldCheck className="size-3.5" /> DERMATOLOGIST REVIEWED
            </span>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COVER STORY (Magazine Spread Layout with Clear Separation) */}
      {featuredArticle && (
        <section className="py-16 sm:py-20 bg-[#F3F8FA] border-b border-[#E1E8EA]">
          <div className="container-page">
            <div className="rounded-[20px] border border-[#E1E8EA] bg-white p-7 sm:p-10 lg:p-12 shadow-2xs">
              <div className="grid gap-10 lg:grid-cols-12 items-center">
                {/* Left Column: Large Editorial Photography (58% width on desktop) */}
                <div className="lg:col-span-7 aspect-16/10 overflow-hidden rounded-2xl bg-[#F3F8FA] border border-[#E1E8EA]/60 shadow-2xs w-full">
                  <SmartImage
                    src={featuredArticle.coverImage || featuredArticle.image}
                    alt={featuredArticle.title}
                    category={featuredArticle.category}
                    priority
                    className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-102"
                  />
                </div>

                {/* Right Column: Editorial Byline & Spaced Content (42% width) */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full">
                  {/* Category Labels */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="rounded-full bg-[#111111] text-white px-3.5 py-1 font-semibold text-[10px] uppercase tracking-widest shadow-2xs">
                      Cover Story
                    </span>
                    <span className="rounded-full bg-[#F3F8FA] border border-[#E1E8EA] px-3.5 py-1 font-semibold text-[#0F8F83] text-[10px] uppercase tracking-wider">
                      {featuredArticle.category}
                    </span>
                  </div>

                  {/* Article Title */}
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-normal leading-[1.18] text-[#111111] mb-4">
                    {featuredArticle.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-[#52616A] font-normal leading-relaxed mb-6">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Hairline Divider */}
                  <div className="border-t border-[#E1E8EA] pt-5 mb-6">
                    {/* Author + Date (Left) and Read Time (Right) */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {authorAvatar ? (
                          <SmartImage src={authorAvatar} alt={authorName} className="size-9 rounded-full object-cover border border-[#E1E8EA]" />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-[#111111] text-white text-xs font-semibold">
                            {authorName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-[#111111]">{authorName}</p>
                          <p className="text-[11px] text-[#7B8790] font-normal">{authorRole} • {formatDate(pubDate)}</p>
                        </div>
                      </div>

                      <span className="text-xs font-medium text-[#7B8790] flex items-center gap-1.5">
                        <Clock className="size-3.5 text-[#0F8F83]" /> {featuredArticle.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Read Full Editorial CTA (Separate Row) */}
                  <div>
                    <Link to="/blog" className="inline-block w-full sm:w-auto">
                      <Button className="h-[46px] w-full sm:w-auto rounded-full bg-[#111111] text-white text-xs font-semibold px-7 hover:bg-black transition-all hover:scale-[1.01] inline-flex items-center justify-center gap-2">
                        <span>Read Full Editorial</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. LATEST EDITORIALS + CATEGORY FILTER BAR */}
      <section className="container-page py-16 sm:py-20 space-y-8">
        {/* Filter Bar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E1E8EA] pb-5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#0F8F83]">The Clinical Archive</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] mt-0.5">Latest Editorials</h2>
          </div>

          {/* Filter Tabs with Live Count Badges */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filterCategories.map((cat) => {
              const count = getCategoryCount(cat)
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase()
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 min-h-[38px] flex items-center gap-1.5 cursor-pointer',
                    isActive
                      ? 'border-[#111111] bg-[#111111] text-white font-semibold shadow-2xs'
                      : 'border-[#E1E8EA] bg-white text-[#52616A] hover:bg-[#F3F8FA] hover:text-[#111111]'
                  )}
                >
                  <span>{cat}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.2 rounded-full', isActive ? 'bg-white/20 text-white' : 'bg-[#EEF6F8] text-[#52616A]')}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Animated Articles Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        <AnimatePresence mode="wait">
          {filteredArticles.length > 0 ? (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredArticles.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </motion.div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#E1E8EA]">
              <p className="font-serif text-lg text-[#111111]">No articles found in this category.</p>
              <p className="text-xs text-[#52616A]">Explore other active ingredient guides or view all stories.</p>
              <Button variant="outline" size="sm" onClick={() => setActiveCategory('All Stories')}>
                View All Stories
              </Button>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. EDITOR'S PICK SECTION */}
      {editorsPick && (
        <section className="border-t border-[#E1E8EA] bg-[#F3F8FA] py-18 sm:py-22">
          <div className="container-page">
            <div className="rounded-[20px] border border-[#E1E8EA] bg-white p-7 sm:p-10 lg:p-12 shadow-2xs">
              <div className="grid gap-10 lg:grid-cols-12 items-center">
                {/* Left Column: Image (55% width) */}
                <div className="lg:col-span-7 aspect-16/10 overflow-hidden rounded-2xl bg-[#F3F8FA] border border-[#E1E8EA]/60 shadow-2xs w-full">
                  <SmartImage
                    src={editorsPick.coverImage || editorsPick.image}
                    alt={editorsPick.title}
                    category={editorsPick.category}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-102"
                  />
                </div>

                {/* Right Column: Info (45% width) */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E1E8EA] bg-[#F3F8FA] px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0F8F83] self-start mb-4">
                    <Sparkles className="size-3 text-[#0F8F83]" /> EDITOR'S PICK · {editorsPick.category}
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-[1.2] text-[#111111] mb-4">
                    {editorsPick.title}
                  </h3>

                  <p className="text-sm text-[#52616A] font-normal leading-relaxed mb-6">
                    {editorsPick.excerpt}
                  </p>

                  <div className="border-t border-[#E1E8EA] pt-5 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#111111] text-white text-xs font-semibold">
                        {(typeof editorsPick.author === 'object' ? editorsPick.author?.name : editorsPick.author || 'B').charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#111111]">
                          {typeof editorsPick.author === 'object' ? editorsPick.author?.name : editorsPick.author || 'Bareo Science Lab'}
                        </p>
                        <p className="text-[10px] text-[#7B8790] font-normal">
                          {typeof editorsPick.author === 'object' ? editorsPick.author?.role : 'Clinical Researcher'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[#7B8790] font-medium flex items-center gap-1">
                      <Clock className="size-3.5 text-[#0F8F83]" /> {editorsPick.readTime}
                    </span>
                  </div>

                  <div>
                    <Link to="/blog" className="inline-block w-full sm:w-auto">
                      <Button className="h-[46px] w-full sm:w-auto rounded-full bg-[#111111] text-white text-xs font-semibold px-7 hover:bg-black transition-all hover:scale-[1.01] inline-flex items-center justify-center gap-2">
                        <span>Read Editorial</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. 60-SECOND SKIN SCIENCE (Compact Sidebar/Callout Note) */}
      {quickReadArticle && (
        <section className="border-t border-[#E1E8EA] bg-[#FAFBFA] py-18 sm:py-22">
          <div className="container-page max-w-[780px]">
            <div className="rounded-2xl border border-[#E1E8EA] bg-[#EDF6F7] p-8 sm:p-10 space-y-5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0F8F83]/20 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0F8F83]">
                  <Zap className="size-3 text-[#0F8F83]" /> SKIN SCIENCE · 60 SECONDS
                </div>
                <span className="text-xs font-semibold text-[#52616A]">{quickReadArticle.readTime}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] leading-snug">
                {quickReadArticle.title}
              </h3>

              <p className="text-sm text-[#52616A] font-normal leading-relaxed">
                {quickReadArticle.excerpt}
              </p>

              <div className="pt-4 border-t border-[#E1E8EA]/70 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111111]">
                  Focus: {quickReadArticle.category} &amp; Intercellular Lipids
                </span>
                <Link to="/blog" className="font-semibold text-[#0F8F83] flex items-center gap-1.5 hover:underline">
                  <span>Read the science</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. BAREO PHILOSOPHY QUOTE MANIFESTO (Warm-Neutral Ivory #FAF9F6) */}
      <section className="border-y border-[#E1E8EA] bg-[#FAF9F6] py-[90px]">
        <div className="container-page text-center max-w-[820px] space-y-6">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#0F8F83]">
            <Sparkles className="size-3 text-[#0F8F83]" /> THE BAREO CLINICAL PHILOSOPHY
          </div>
          
          <blockquote className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-normal leading-relaxed text-[#111111]">
            “We believe skincare should be straightforward. No inflated percentages, no misleading claims — just biocompatible formulations that respect your dermal ecosystem.”
          </blockquote>
          
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Dr. Meera Joshi, MD Dermatology</p>
            <p className="text-[11px] text-[#7B8790] font-normal">Head of Research &amp; Clinical Formulations at Bareo</p>
          </div>
        </div>
      </section>

      {/* 7. CLINICAL DISPATCH NEWSLETTER CAPTURE (Refined Luxury Skincare Editorial Finish) */}
      <section className="relative overflow-hidden border-b border-[#E1E8EA] bg-gradient-to-b from-[#F8FBFC] to-[#F2F8FA] py-14 sm:py-[72px]">
        {/* Soft Radial Ambient Depth */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,235,239,0.55),transparent_55%)]" />

        <div className="container-page relative z-10 mx-auto max-w-[760px] text-center">
          {/* Clinical Squircle Icon */}
          <div className="mx-auto flex size-11 items-center justify-center rounded-[14px] border border-[#DCE7EB] bg-white text-[#0F8F83] shadow-2xs">
            <Mail className="size-5" />
          </div>

          {/* Editorial Headline */}
          <h3 className="mt-[18px] font-serif text-[28px] font-normal leading-tight text-[#111111] sm:text-[34px]">
            Subscribe to Clinical Notes
          </h3>

          {/* Description Copy */}
          <p className="mx-auto mt-2.5 max-w-[560px] text-sm font-normal leading-[1.55] text-[#52616A]">
            Receive new dermatological studies, bioactive ingredient deep-dives, and routine breakdowns directly in your inbox.
          </p>

          {/* Form / Subscription State */}
          {subscribed ? (
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#0F8F83]/30 bg-[#EDF6F7] px-5 py-2.5 text-xs font-semibold text-[#0F8F83]">
              <CheckCircle2 className="size-4" /> You're subscribed to the Bareo Clinical Dispatch.
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mx-auto mt-7 flex w-full max-w-[540px] flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:items-center"
            >
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your clinical email..."
                className="h-[48px] w-full flex-1 rounded-full border border-[#DCE7EB] bg-white px-5 text-sm text-[#111111] placeholder:text-[#7B8790] shadow-2xs transition-colors focus:border-[#0F8F83] focus:outline-none"
              />
              <Button
                type="submit"
                className="h-[48px] w-full shrink-0 flex-none rounded-full bg-[#111111] px-6 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-black sm:w-auto"
              >
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
