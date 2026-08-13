import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const onSubmit = async (data: LoginForm) => {
    const res = await dispatch(loginUser({ email: data.email, password: data.password, remember: data.remember }))
    if (loginUser.fulfilled.match(res)) {
      if (res.payload.user?.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate(from)
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Editorial Heading */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#111111] tracking-tight">
          Welcome back.
        </h1>
        <p className="text-xs text-[#6B7280] font-light leading-relaxed">
          Sign in to your Bareo account.
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-[#374151] font-medium">
            <Checkbox defaultChecked onCheckedChange={(c) => setValue('remember', !!c)} />
            <span className="select-none text-[#6B7280]">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-[#111111] hover:underline"
            onClick={() => dispatch(clearError())}
          >
            Forgot password?
          </Link>
        </div>

        {/* Primary CTA */}
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-[#111111] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-all duration-200 shadow-2xs mt-2"
          loading={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Create Account Link */}
      <p className="text-center text-xs text-[#6B7280] font-light pt-4 border-t border-[#F3F4F6]">
        New to Bareo?{' '}
        <Link
          to="/register"
          className="font-semibold text-[#111111] hover:underline"
          onClick={() => dispatch(clearError())}
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
