import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Calendar } from 'lucide-react'
import type { BlogPost } from '@/types'
import { cn, formatDate } from '@/utils'
import { SmartImage } from '@/components/common/SmartImage'

interface BlogCardProps {
  post: BlogPost & { image?: string; date?: string; coverImage?: string }
  className?: string
}

export function BlogCard({ post, className }: BlogCardProps) {
  const imageUrl = post.coverImage || post.image || ''
  const authorName = typeof post.author === 'string' ? post.author : post.author?.name || 'Bareo Editorial'
  const authorAvatar = typeof post.author === 'object' ? post.author?.avatar : null
  const authorRole = typeof post.author === 'object' ? post.author?.role : null
  const pubDate = post.publishedAt || post.date || new Date().toISOString()

  const articleLink = `/blog/${post.slug || post.id}`

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-2xs transition-all duration-300 hover:shadow-xs hover:border-[#167C86]/40 h-full',
        className
      )}
    >
      <Link to={articleLink} className="flex flex-col h-full">
        {/* Article Cover Image (16:10 Standardized Ratio) */}
        <div className="relative aspect-16/10 overflow-hidden bg-[#EDF6F8] w-full shrink-0">
          <SmartImage
            src={imageUrl}
            alt={post.title}
            category={post.category}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
          />
          <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-2">
            <span className="rounded-full bg-white/95 backdrop-blur-xs border border-[#DCE6E9] px-3 py-1 font-bold text-[#172126] text-[9px] uppercase tracking-widest shadow-2xs">
              {post.category}
            </span>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            {/* Read time & Date */}
            <div className="flex items-center gap-3 text-[11px] text-[#7A8A91] font-medium">
              <span className="flex items-center gap-1">
                <Clock className="size-3 text-[#167C86]" />
                <span>{post.readTime || '5 min read'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3 text-[#7A8A91]" />
                <span>{formatDate(pubDate)}</span>
              </span>
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg sm:text-[19px] font-normal leading-snug text-[#172126] group-hover:text-[#167C86] transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="line-clamp-2 text-xs text-[#52636B] font-normal leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Card Footer: Author & Read CTA */}
          <div className="pt-4 border-t border-[#DCE6E9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {authorAvatar ? (
                <SmartImage src={authorAvatar} alt={authorName} className="size-7 rounded-full object-cover border border-[#DCE6E9]" />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-full bg-[#172126] text-white text-[10px] font-semibold">
                  {authorName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-[#172126]">{authorName}</p>
                {authorRole && <p className="text-[10px] text-[#7A8A91] font-normal">{authorRole}</p>}
              </div>
            </div>

            <span className="flex items-center gap-1 text-xs font-semibold text-[#172126] group-hover:text-[#167C86] group-hover:translate-x-1 transition-all">
              Read <ArrowRight className="size-3.5 text-[#167C86]" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}


