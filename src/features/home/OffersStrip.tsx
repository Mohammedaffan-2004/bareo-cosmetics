import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Offer } from '@/types'
import { OfferBanner } from '@/components/common/OfferBanner'

interface OffersStripProps {
  offers: Offer[]
}

export function OffersStrip({ offers }: OffersStripProps) {
  const navigate = useNavigate()
  return (
    <section className="container-page py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {offers.map((offer, i) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <OfferBanner
              title={offer.title}
              subtitle={offer.subtitle}
              badge={offer.badge}
              discountLabel={offer.discountLabel}
              gradient={offer.background}
              ctaLabel={offer.code ? `Use code ${offer.code}` : undefined}
              onClick={() => navigate('/shop')}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
