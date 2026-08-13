import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, Store, ArrowLeft, Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser } from '@/store/slices/authSlice'
import { AppInput } from '@/components/common/AppInput'
import { AppPasswordInput } from '@/components/common/AppPasswordInput'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/layout/Logo'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

type Form = z.infer<typeof schema>

/**
 * Bareo Executive Admin Console Authentication — Editorial Lifestyle Aesthetic
 */
export function AdminLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const error = useAppSelector((s) => s.auth.error)
  const isLoading = useAppSelector((s) => s.auth.isLoading)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Bareo Admin — Sign In'
  }, [])

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@luminaskin.com', password: 'admin123' },
  })

  const onSubmit = async (data: Form) => {
    setSubmitting(true)
    const res = await dispatch(loginUser({ email: data.email, password: data.password, remember: true }))
    setSubmitting(false)
    if (loginUser.fulfilled.match(res)) {
      if (res.payload.user?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }

  const handleQuickFill = async (email: string, pass: string) => {
    setValue('email', email)
    setValue('password', pass)
    setSubmitting(true)
    const res = await dispatch(loginUser({ email, password: pass, remember: true }))
    setSubmitting(false)
    if (loginUser.fulfilled.match(res)) {
      if (res.payload.user?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white">
      {/* Left Marketing Hero — Luxury Editorial Lifestyle Hero */}
      <div className="relative hidden overflow-hidden bg-[#111111] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-[#111111] to-black p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="relative z-10 flex items-center justify-between">
          <Logo className="text-white [&_span]:text-white" />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-medium text-white backdrop-blur-md">
            <Sparkles className="size-3.5 text-amber-400" /> Administrative Control
          </span>
        </div>

        <div className="relative z-10 my-auto py-8">
          <div className="space-y-4">
            <h1 className="font-serif text-5xl font-normal leading-[1.15] tracking-tight text-white xl:text-6xl">
              Store management, <br />
              <span className="italic text-amber-200">crafted cleanly.</span>
            </h1>
            <p className="max-w-md text-sm text-slate-300 font-light leading-relaxed">
              Formulations, orders, real-time analytics, and customer profiles — managed from a unified control deck.
            </p>
          </div>

          {/* EDITORIAL LIFESTYLE IMAGE */}
          <div className="relative mt-10 flex items-center justify-center py-4">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85"
                alt="Luxury Skincare Studio Setup"
                className="h-64 w-full max-w-md object-cover brightness-[0.92] contrast-[1.05] xl:h-72"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute left-4 top-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-xl"
            >
              <span className="size-1.5 rounded-full bg-emerald-300" />
              Role Encrypted Security
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-white hover:underline font-medium"
          >
            <ArrowLeft className="size-4" /> Return to Storefront
          </button>
          <span>© {new Date().getFullYear()} Bareo Executive Admin</span>
        </div>
      </div>

      {/* Right Login Container — Floating Minimal Form Surface */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#111111] transition-colors lg:hidden"
          >
            <ArrowLeft className="size-3.5" />
            <span>Storefront</span>
          </button>
          <div className="lg:hidden"><Logo /></div>
        </div>

        <div className="my-auto mx-auto w-full max-w-[420px] py-10 space-y-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#111111] text-white shadow-xs">
            <Lock className="size-5" />
          </div>

          <div>
            <h2 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#111111]">
              Admin Access
            </h2>
            <p className="mt-2.5 text-xs text-[#6B7280] font-light leading-relaxed">
              Authenticate with your store administrator credentials.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/5 px-4 py-3 text-xs font-medium text-[#EF4444]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AppInput label="Admin email" type="email" error={errors.email?.message} {...register('email')} />
            <AppPasswordInput label="Password" hint="Min. 4 characters" error={errors.password?.message} {...register('password')} />
            <Button
              type="submit"
              variant="primary"
              className="h-13 w-full rounded-2xl bg-[#111111] text-white font-medium text-sm shadow-xs transition-all duration-300 hover:bg-black hover:-translate-y-0.5 active:translate-y-0"
              loading={isLoading || submitting}
            >
              Access Admin Console
            </Button>
          </form>

          {/* Text-Only Quick Fill */}
          <div className="pt-6 border-t border-[#F3F4F6] text-center space-y-2">
            <p className="text-xs font-serif font-normal text-[#111111]">Development Credentials</p>
            <p className="text-[11px] text-[#9CA3AF] font-light">admin@luminaskin.com · admin123</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2.5 h-10 w-full rounded-2xl border-[#E5E7EB] bg-white text-xs font-medium text-[#111111] transition-all hover:border-[#111111] hover:bg-[#FAFAFA]"
              onClick={() => handleQuickFill('admin@luminaskin.com', 'admin123')}
            >
              <Store className="size-3.5" /> Sign in as Admin
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-[#9CA3AF] pt-4 border-t border-[#F3F4F6]">
          © {new Date().getFullYear()} Bareo Cosmetics. All rights reserved.
        </div>
      </div>
    </div>
  )
}
