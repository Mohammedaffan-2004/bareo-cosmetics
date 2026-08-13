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

  return (
    <Link
      to={`/blog`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs transition-all duration-300 hover:shadow-md hover:border-[#111111]/30 h-full',
        className
      )}
    >
      {/* Article Cover Image */}
      <div className="relative aspect-16/10 overflow-hidden bg-[#FAF7F2] w-full shrink-0">
        <SmartImage
          src={imageUrl}
          alt={post.title}
          category={post.category}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
        />
        <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-2">
          <span className="rounded-full bg-white/95 backdrop-blur-sm border border-[#E5E7EB] px-3 py-1 font-semibold text-[#111111] text-[10px] uppercase tracking-wider shadow-2xs">
            {post.category}
          </span>
        </div>
      </div>

      {/* Article Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Read time & Date */}
          <div className="flex items-center gap-3 text-[11px] text-[#6B7280] font-normal">
            <span className="flex items-center gap-1">
              <Clock className="size-3 text-[#6B7280]" />
              <span>{post.readTime || '5 min read'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3 text-[#6B7280]" />
              <span>{formatDate(pubDate)}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-normal leading-snug text-[#111111] group-hover:text-black group-hover:translate-x-0.5 transition-all">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="line-clamp-2 text-xs text-[#6B7280] font-light leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Card Footer: Author & Read CTA */}
        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {authorAvatar ? (
              <SmartImage src={authorAvatar} alt={authorName} className="size-7 rounded-full object-cover border border-[#E5E7EB]" />
            ) : (
              <div className="flex size-7 items-center justify-center rounded-full bg-[#111111] text-white text-[10px] font-semibold">
                {authorName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-[#111111]">{authorName}</p>
              {authorRole && <p className="text-[10px] text-[#9CA3AF] font-light">{authorRole}</p>}
            </div>
          </div>

          <span className="flex items-center gap-1 text-xs font-medium text-[#111111] group-hover:translate-x-1 transition-transform">
            Read <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
