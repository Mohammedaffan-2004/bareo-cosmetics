import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Clock, Calendar, ShieldCheck, BookOpen } from 'lucide-react'
import { homeService } from '@/services/homeService'
import { BlogCard } from '@/components/cards/BlogCard'
import { SmartImage } from '@/components/common/SmartImage'
import { Loader } from '@/components/common/Loader'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils'
import type { BlogPost } from '@/types'

export function BlogPostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['home-content'],
    queryFn: () => homeService().getHomeContent(),
  })

  const articles: BlogPost[] = useMemo(() => data?.blogs || data?.blogPosts || [], [data])

  const post = useMemo(() => {
    if (!slug || !articles.length) return null
    return articles.find((a) => a.slug === slug || a.id === slug) || null
  }, [slug, articles])

  const relatedPosts = useMemo(() => {
    if (!post || !articles.length) return []
    return articles.filter((a) => a.id !== post.id && a.slug !== post.slug).slice(0, 3)
  }, [post, articles])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F6FAFB]">
        <Loader label="Loading editorial journal entry..." />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="bg-[#F6FAFB] min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="container-page max-w-md space-y-6 bg-white p-8 rounded-2xl border border-[#DCE6E9] shadow-2xs">
          <div className="size-12 rounded-full bg-[#EDF6F8] border border-[#DCE6E9] flex items-center justify-center mx-auto text-[#167C86]">
            <BookOpen className="size-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7A8A91]">BAREO JOURNAL</span>
            <h1 className="font-serif text-2xl font-normal text-[#172126]">Article Not Found</h1>
            <p className="text-xs text-[#52636B] leading-relaxed font-normal">
              The editorial article you are looking for does not exist or may have been archived.
            </p>
          </div>
          <Button
            onClick={() => navigate('/blog')}
            className="w-full rounded-xl bg-[#172126] text-white hover:bg-[#253239] text-xs font-semibold h-11"
          >
            ← Return to Bareo Journal
          </Button>
        </div>
      </div>
    )
  }

  const imageUrl = post.coverImage || post.image || ''
  const authorName = typeof post.author === 'string' ? post.author : post.author?.name || 'Dr. Meera Joshi'
  const authorAvatar = typeof post.author === 'object' ? post.author?.avatar : null
  const authorRole = typeof post.author === 'object' ? post.author?.role : 'MD Dermatology'
  const pubDate = post.publishedAt || post.date || new Date().toISOString()

  // Article paragraph content breakdown
  const contentParagraphs = post.content
    ? post.content.split('\n\n').filter(Boolean)
    : [post.excerpt, 'Dermatological studies confirm that calculating active ingredient concentrations to match epidermal absorption rates yields superior long-term lipid barrier recovery without inflammation.']

  return (
    <article className="bg-[#F6FAFB] min-h-screen text-[#172126]">
      {/* 1. EDITORIAL HEADER & NAVIGATION BAR */}
      <div className="border-b border-[#DCE6E9] bg-white py-4 sticky top-16 z-20 shadow-2xs">
        <div className="container-page flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#52636B] hover:text-[#172126] transition-colors"
          >
            <ArrowLeft className="size-4 text-[#167C86]" /> Back to BAREO Journal
          </Link>
          <div className="flex items-center gap-3 text-xs text-[#7A8A91]">
            <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider">
              ARTICLE SLUG / {post.slug}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ARTICLE HERO SPREAD */}
      <header className="py-12 sm:py-16 border-b border-[#DCE6E9] bg-gradient-to-b from-[#EDF6F8] to-[#F6FAFB]">
        <div className="container-page max-w-4xl space-y-6 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE6E9] bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#172126] shadow-2xs mx-auto">
            <span className="text-[#167C86]">✦</span> THE BAREO JOURNAL · {post.category || 'CLINICAL SCIENCE'}
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-normal leading-[1.12] text-[#172126] tracking-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-sm sm:text-base text-[#52636B] font-normal leading-relaxed max-w-2xl mx-auto">
            {post.excerpt}
          </p>

          {/* Author & Meta Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#52636B] border-t border-[#DCE6E9]/60 max-w-xl mx-auto">
            <div className="flex items-center gap-2.5">
              {authorAvatar ? (
                <SmartImage src={authorAvatar} alt={authorName} className="size-8 rounded-full object-cover border border-[#DCE6E9]" />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-[#172126] text-white text-xs font-bold">
                  {authorName.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <p className="font-semibold text-[#172126] leading-tight">{authorName}</p>
                <p className="text-[10px] text-[#7A8A91]">{authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#7A8A91]">
              <Calendar className="size-3.5 text-[#167C86]" />
              <span>{formatDate(pubDate)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#7A8A91]">
              <Clock className="size-3.5 text-[#167C86]" />
              <span>{post.readTime || '5 min read'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. HERO IMAGE SPREAD */}
      <div className="container-page max-w-4xl py-10">
        <div className="aspect-16/9 sm:aspect-21/9 overflow-hidden rounded-2xl border border-[#DCE6E9] bg-[#EDF6F8] shadow-2xs">
          <SmartImage
            src={imageUrl}
            alt={post.title}
            category={post.category}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* 4. MAIN EDITORIAL CONTENT BODY */}
      <div className="container-page max-w-3xl pb-16 space-y-8">
        {/* Paragraphs */}
        <div className="space-y-6 text-sm sm:text-base leading-[1.8] text-[#172126] font-normal">
          {contentParagraphs.map((para, idx) => (
            <p key={idx} className="first-letter:font-serif first-letter:text-3xl first-letter:font-bold first-letter:text-[#167C86] first-letter:mr-1">
              {para}
            </p>
          ))}
        </div>

        {/* Clinical Formulation Takeaway Block */}
        <div className="rounded-2xl border border-[#167C86]/30 bg-[#EDF6F8] p-6 sm:p-8 space-y-3 shadow-2xs my-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#167C86]">
            <ShieldCheck className="size-4" /> BAREO CLINICAL TAKEAWAY
          </div>
          <p className="text-xs sm:text-sm text-[#172126] font-medium leading-relaxed">
            Every formulation at BAREO is engineered around biocompatibility and barrier protection. If your skin exhibits inflammation, pause synthetic exfoliants and focus on high-purity ceramides and Centella Asiatica.
          </p>
        </div>

        {/* Optional Relevant Formulation CTA */}
        <div className="rounded-2xl border border-[#DCE6E9] bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86]">DERMAL MATCH</span>
            <h4 className="font-serif text-lg font-normal text-[#172126]">Have questions about your skin barrier?</h4>
            <p className="text-xs text-[#52636B]">Let BAREO's dermal intelligence analyze your exact formulation needs.</p>
          </div>
          <Button
            onClick={() => navigate('/skin-analysis')}
            className="rounded-xl px-6 h-11 bg-[#172126] text-white hover:bg-[#253239] text-xs font-semibold shrink-0 cursor-pointer"
          >
            Start Dermal Assessment <ArrowRight className="size-4 ml-2 text-[#167C86]" />
          </Button>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-[#DCE6E9] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#7A8A91]">TAGS:</span>
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white border border-[#DCE6E9] px-3 py-1 text-[11px] font-medium text-[#52636B]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 5. RELATED READING SECTION */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-[#DCE6E9] bg-white py-16">
          <div className="container-page space-y-8">
            <div className="flex items-center justify-between border-b border-[#DCE6E9] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86]">CONTINUE READING</span>
                <h3 className="font-serif text-2xl font-normal text-[#172126]">Related Clinical Editorials</h3>
              </div>
              <Link to="/blog" className="text-xs font-semibold text-[#167C86] hover:underline">
                View All Journal Entries →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rPost) => (
                <BlogCard key={rPost.id} post={rPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
