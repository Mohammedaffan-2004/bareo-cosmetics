import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginUser, clearError } from '@/store/slices/authSlice'
import { AppInput } from '@/components/common/AppInput'
import { AppPasswordInput } from '@/components/common/AppPasswordInput'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  remember: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

/**
 * Bareo Login Page — Quiet Editorial Authentication.
 * Restrained form rhythm with zero promotional noise.
 */
export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isLoading = useAppSelector((s) => s.auth.isLoading)
  const error = useAppSelector((s) => s.auth.error)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const user = useAppSelector((s) => s.auth.user)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  // Auto-redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        const destination = from === '/login' ? '/' : from
        navigate(destination, { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate, from])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const onSubmit = async (data: LoginForm) => {
    const res = await dispatch(loginUser({ email: data.email, password: data.password, remember: data.remember }))
    if (loginUser.fulfilled.match(res)) {
      if (res.payload.user?.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        const destination = from === '/login' ? '/' : from
        navigate(destination, { replace: true })
      }
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Editorial Heading */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
          BAREO MEMBER ACCESS
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight">
          Welcome back.
        </h1>
        <p className="text-xs text-[#52636B] font-light leading-relaxed">
          Continue your personalized skincare journey.
        </p>
      </div>

      {/* Inline Customer-Facing Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Authentication Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <AppInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
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

        <div className="flex items-center justify-between pt-0.5 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-[#52636B] font-medium">
            <Checkbox defaultChecked onCheckedChange={(c) => setValue('remember', !!c)} />
            <span className="select-none text-[#52636B]">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-[#172126] hover:text-[#167C86] hover:underline"
            onClick={() => dispatch(clearError())}
          >
            Forgot password?
          </Link>
        </div>

        {/* Primary CTA */}
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-[#172126] text-white text-xs sm:text-sm font-semibold hover:bg-[#253239] transition-all duration-200 shadow-2xs mt-2 border border-[#172126]"
          loading={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In →'}
        </Button>
      </form>

      {/* Create Account Link */}
      <p className="text-center text-xs text-[#52636B] font-light pt-4 border-t border-[#DCE6E9]">
        New to Bareo?{' '}
        <Link
          to="/register"
          className="font-semibold text-[#172126] hover:text-[#167C86] hover:underline"
          onClick={() => dispatch(clearError())}
        >
          Create an account →
        </Link>
      </p>

      {/* BAREO TRUST & SKIN INTELLIGENCE DIFFERENTIATOR BLOCK */}
      <div className="rounded-2xl border border-[#DCE6E9] bg-white/80 p-4 text-xs text-[#52636B] space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-[#167C86]">
          <Sparkles className="size-3.5 text-[#167C86]" />
          <span className="font-bold text-[10px] uppercase tracking-widest text-[#167C86]">
            PERSONALIZED SKIN INTELLIGENCE
          </span>
        </div>
        <p className="font-light text-[11px] leading-relaxed">
          Your BAREO account securely maintains your <strong className="font-semibold text-[#172126]">orders</strong>, <strong className="font-semibold text-[#172126]">skin profile</strong>, and <strong className="font-semibold text-[#172126]">AI consultations</strong> in one place.
        </p>
      </div>
    </div>
  )
}
