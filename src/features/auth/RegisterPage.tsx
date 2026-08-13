import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { registerUser } from '@/store/slices/authSlice'
import { AppInput } from '@/components/common/AppInput'
import { AppPasswordInput } from '@/components/common/AppPasswordInput'
import { AppSelect } from '@/components/common/AppSelect'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/useToast'
import { GENDERS } from '@/constants'

const registerSchema = z
  .object({
    name: z.string().min(3, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    gender: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
    terms: z.boolean().refine((v) => v, 'Please accept the Terms & Privacy Policy to continue'),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isLoading = useAppSelector((s) => s.auth.isLoading)
  const error = useAppSelector((s) => s.auth.error)
  const toast = useToast()
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', gender: '', password: '', confirm: '', terms: true },
  })

  const onSubmit = async (data: RegisterForm) => {
    const res = await dispatch(registerUser({ name: data.name, email: data.email, phone: data.phone, password: data.password }))
    if (registerUser.fulfilled.match(res)) {
      setDone(true)
      toast.success('Account created', 'Welcome to Bareo Cosmetics!')
      setTimeout(() => navigate('/'), 1200)
    }
  }

  return (
    <div className="space-y-6">
      {/* Editorial Heading */}
      <div className="space-y-1.5">
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#111111] tracking-tight">
          Create your Bareo account.
        </h1>
        <p className="text-xs text-[#6B7280] font-light leading-relaxed">
          Enter your details to create a profile.
        </p>
      </div>

      {done && (
        <div className="rounded-xl border border-[#059669]/30 bg-[#ECFDF5] px-4 py-3 text-xs font-semibold text-[#047857] flex items-center gap-2">
          <Check className="size-4 shrink-0" />
          <span>Account created successfully! Redirecting to store…</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AppInput
          label="Full name *"
          placeholder="Aarav Malhotra"
          error={errors.name?.message}
          {...register('name')}
        />

        <AppInput
          label="Email address *"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AppInput
            label="Mobile number *"
            inputMode="numeric"
            placeholder="98765 43210"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <AppSelect
            label="Gender"
            placeholder="Select"
            value={watch('gender')}
            onValueChange={(v) => setValue('gender', v)}
            options={GENDERS.map((g) => ({ value: g.value, label: g.label }))}
            error={errors.gender?.message}
          />
        </div>

        <AppPasswordInput
          label="Password *"
          placeholder="Minimum 8 characters"
          showStrength
          error={errors.password?.message}
          {...register('password')}
        />

        <AppPasswordInput
          label="Confirm password *"
          placeholder="Repeat your password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />

        <div className="pt-1">
          <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#374151]">
            <Checkbox defaultChecked onCheckedChange={(c) => setValue('terms', !!c)} className="mt-0.5" />
            <span className="text-[#6B7280] font-light leading-relaxed">
              I agree to the <a href="#" className="font-semibold text-[#111111] hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="font-semibold text-[#111111] hover:underline">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <p className="text-xs font-medium text-rose-600 mt-1">{errors.terms.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-[#111111] text-white text-xs sm:text-sm font-semibold hover:bg-black transition-all shadow-2xs mt-2"
          loading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-[#6B7280] font-light pt-2">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#111111] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
