import { motion } from 'framer-motion'
import type { BlogPost } from '@/types'
import { BlogCard } from '@/components/cards/BlogCard'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface BlogSectionProps {
  posts: BlogPost[]
}

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section className="container-page py-16 sm:py-20 border-b border-[#DCE6E9]">
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#DCE6E9] pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">The Bareo Journal</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight">Skincare Science & Guides</h2>
          </div>
          <Link to="/blog">
            <Button variant="outline" size="sm" className="rounded-xl border-[#DCE6E9] text-xs font-semibold text-[#172126] hover:bg-[#EDF6F8]">
              View All Articles <ArrowRight className="size-3.5 ml-1 text-[#167C86]" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <BlogCard post={post} className="h-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
