import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, Sparkles, ShieldAlert } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser, logout, clearError } from '@/store/slices/authSlice'
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
 * Bareo Executive Admin Console Authentication — Separate Admin Auth Boundary.
 */
export function AdminLoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const user = useAppSelector((s) => s.auth.user)
  const error = useAppSelector((s) => s.auth.error)
  const isLoading = useAppSelector((s) => s.auth.isLoading)

  const [deniedError, setDeniedError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  useEffect(() => {
    document.title = 'Bareo Admin — Executive Access'
  }, [])

  // Auto-redirect if already logged in as ADMIN
  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      const target = from.startsWith('/admin') ? from : '/admin'
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: Form) => {
    setSubmitting(true)
    setDeniedError(null)
    dispatch(clearError())

    const res = await dispatch(
      loginUser({ email: data.email, password: data.password, remember: true })
    )
    setSubmitting(false)

    if (loginUser.fulfilled.match(res)) {
      if (res.payload.user?.role === 'ADMIN') {
        const target = from.startsWith('/admin') ? from : '/admin'
        navigate(target, { replace: true })
      } else {
        // Reject customer account attempting admin access
        dispatch(logout())
        setDeniedError(
          'Access Denied: Admin privileges required. Customer accounts cannot access the Admin Console.'
        )
      }
    }
  }

  const activeError = deniedError || error

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white">
      {/* Left Marketing Hero — Executive Editorial Panel */}
      <div className="relative hidden overflow-hidden bg-[#111111] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-[#111111] to-black p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="relative z-10 flex items-center justify-between">
          <Logo className="text-white [&_span]:text-white" />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-medium text-white backdrop-blur-md">
            <Sparkles className="size-3.5 text-[#167C86]" /> Administrative Control
          </span>
        </div>

        <div className="relative z-10 my-auto py-8">
          <div className="space-y-4">
            <h1 className="font-serif text-5xl font-normal leading-[1.15] tracking-tight text-white xl:text-6xl">
              Commerce management, <br />
              <span className="italic text-teal-200">authoritative & precise.</span>
            </h1>
            <p className="max-w-md text-sm text-slate-300 font-light leading-relaxed">
              Formulations, inventory, fulfillment desk, and commercial intelligence — managed from an executive operational deck.
            </p>
          </div>

          {/* EDITORIAL CARD */}
          <div className="relative mt-10 flex items-center justify-center py-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 overflow-hidden rounded-3xl border border-white/10 shadow-2xl h-64 w-full max-w-md bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-8 flex flex-col justify-between xl:h-72"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#167C86]">
                  BAREO FULFILLMENT DESK
                </span>
                <span className="text-xs font-serif italic text-slate-300">Executive Edition</span>
              </div>
              <div className="space-y-1 text-left">
                <p className="font-serif text-xl font-normal text-white">Clinical Precision Operations</p>
                <p className="text-xs text-slate-400 font-light">
                  Protected administrative console for internal executive operations.
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute left-4 top-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-xl"
            >
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Role-Encrypted Boundary
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-white hover:underline font-medium transition-colors"
          >
            <ArrowLeft className="size-4" /> Return to BAREO storefront
          </button>
          <span>© {new Date().getFullYear()} Bareo Executive Admin</span>
        </div>
      </div>

      {/* Right Login Workspace */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-medium text-[#52636B] hover:text-[#172126] transition-colors"
          >
            <ArrowLeft className="size-3.5 text-[#167C86]" />
            <span>Return to BAREO storefront</span>
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
        </div>

        <div className="my-auto mx-auto w-full max-w-[420px] py-10 space-y-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#172126] text-white shadow-xs">
            <Lock className="size-5" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
              BAREO ADMINISTRATIVE CONTROL
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#172126]">
              Admin Access
            </h2>
            <p className="text-xs text-[#52636B] font-light leading-relaxed">
              Administrative access to the BAREO commerce console.
            </p>
          </div>

          {activeError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <ShieldAlert className="size-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AppInput
              label="Admin email"
              type="email"
              placeholder="admin@bareo.in"
              error={errors.email?.message}
              {...register('email')}
            />
            <AppPasswordInput
              label="Password"
              placeholder="Enter password"
              hint="Min. 4 characters"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              variant="primary"
              className="h-13 w-full rounded-2xl bg-[#172126] text-white font-medium text-sm shadow-xs transition-all duration-300 hover:bg-[#253239] hover:-translate-y-0.5 active:translate-y-0 border border-[#172126]"
              loading={isLoading || submitting}
            >
              Access Admin Console
            </Button>
          </form>

          <p className="text-center text-[11px] text-[#7A8A91] font-light">
            Authorized personnel only.
          </p>
        </div>

        <div className="text-center text-xs text-[#7A8A91] pt-4 border-t border-[#F3F4F6]">
          © {new Date().getFullYear()} Bareo Cosmetics. All rights reserved.
        </div>
      </div>
    </div>
  )
}
