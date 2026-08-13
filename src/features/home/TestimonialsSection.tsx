import { motion } from 'framer-motion'
import type { Testimonial } from '@/types'
import { TestimonialCard } from '@/components/cards/TestimonialCard'
import { SectionHeading } from '@/components/common/SectionHeading'

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <section className="bg-secondary py-12">
      <div className="container-page">
        <SectionHeading
          eyebrow="18,000+ happy skin stories"
          title="Loved by real skin"
          subtitle="Real results from verified customers across India."
          align="center"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            >
              <TestimonialCard testimonial={t} className="h-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
