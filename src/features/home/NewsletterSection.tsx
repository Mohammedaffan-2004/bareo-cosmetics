import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const toast = useToast()

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Invalid email', 'Please enter a valid email address')
      return
    }
    setSubscribed(true)
    toast.success('Subscribed!', 'Welcome to Bareo Journal')
  }

  return (
    <section className="bg-[#FAFAFA] py-16 border-t border-[#E5E7EB]">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl text-center space-y-4"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">Join the Community</span>
          <h2 className="font-serif text-3xl font-normal text-[#111111]">Get 10% off your first Bareo order</h2>
          <p className="text-sm text-[#6B7280]">
            Subscribe to our weekly dispatch for skin barrier science, new product drops, and exclusive offers. No spam.
          </p>

          {subscribed ? (
            <div className="mx-auto mt-6 flex items-center justify-center gap-2 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-5 py-3 text-xs font-semibold text-[#22C55E]">
              <CheckCircle2 className="size-4" /> You're subscribed! Use promo code <b>WELCOME10</b> at checkout.
            </div>
          ) : (
            <form onSubmit={subscribe} className="mx-auto pt-2 flex flex-col gap-3 sm:flex-row max-w-md">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
              <Button type="submit" size="default" variant="primary" className="rounded-xl shrink-0">
                Subscribe <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
