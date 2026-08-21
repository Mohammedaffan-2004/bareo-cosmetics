import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { authService } from '@/services/authService'
import { OtpInput } from '@/components/ui/otp-input'
import { Button } from '@/components/ui/button'
import { useCountdown } from '@/hooks/useCountdown'
import { useToast } from '@/hooks/useToast'

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const email = (location.state as { email?: string } | null)?.email ?? 'you@example.com'
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const countdown = useCountdown(60)

  const verify = async () => {
    if (otp.length !== 4) {
      setError('Enter the 4-digit verification code')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await authService().verifyOtp(email, otp)
      toast.success('OTP verified', 'Set your new password')
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError((err as Error).message ?? 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const resend = () => {
    countdown.start()
    toast.info('OTP resent', `A new code was sent to ${email}`)
  }

  return (
    <div className="space-y-5 sm:space-y-6 text-center">
      {/* Editorial Headline */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#167C86] block">
          ACCOUNT RECOVERY
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#172126] tracking-tight">
          Verify Your Identity
        </h1>
        <p className="text-xs text-[#52636B] font-light leading-relaxed">
          Enter the 4-digit security code sent to <strong className="font-mono text-[#172126]">{email}</strong>.
        </p>
      </div>

      <div className="py-2">
        <OtpInput length={4} value={otp} onChange={(v) => { setOtp(v); setError(null) }} error={!!error} />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-800 flex items-center justify-center gap-2">
          <AlertCircle className="size-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        disabled={loading}
        className="h-12 w-full rounded-xl bg-[#172126] text-white text-xs sm:text-sm font-semibold hover:bg-[#253239] transition-all shadow-2xs border border-[#172126]"
        loading={loading}
        onClick={verify}
      >
        Verify OTP →
      </Button>

      <div className="text-xs text-[#52636B] font-light pt-2">
        {countdown.active ? (
          <p>Resend code in {countdown.mm}:{countdown.ss}</p>
        ) : (
          <button type="button" onClick={resend} className="font-semibold text-[#172126] hover:text-[#167C86] hover:underline">
            Resend OTP Code
          </button>
        )}
      </div>
    </div>
  )
}
