import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const [localVal, setLocalVal] = useState(value.toString())

  useEffect(() => {
    setLocalVal(value.toString())
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Filter out non-digits
    const cleanDigits = raw.replace(/\D/g, '')

    if (cleanDigits === '') {
      setLocalVal('')
      return
    }

    const num = parseInt(cleanDigits, 10)
    if (isNaN(num)) {
      setLocalVal('')
      return
    }

    if (num > max) {
      setLocalVal(max.toString())
      onChange(max)
    } else {
      setLocalVal(num.toString())
      if (num >= min) {
        onChange(num)
      }
    }
  }

  const handleBlur = () => {
    if (!localVal || localVal.trim() === '') {
      const clamped = Math.max(min, Math.min(max, value || min))
      setLocalVal(clamped.toString())
      onChange(clamped)
      return
    }

    const parsed = parseInt(localVal, 10)
    if (isNaN(parsed) || parsed < min) {
      setLocalVal(min.toString())
      onChange(min)
    } else if (parsed > max) {
      setLocalVal(max.toString())
      onChange(max)
    } else {
      setLocalVal(parsed.toString())
      onChange(parsed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    }
  }

  const decrement = () => {
    const next = Math.max(min, value - 1)
    setLocalVal(next.toString())
    onChange(next)
  }

  const increment = () => {
    const next = Math.min(max, value + 1)
    setLocalVal(next.toString())
    onChange(next)
  }

  const btnSize = size === 'sm' ? 'size-8' : 'size-9 sm:size-10'
  const inputSize = size === 'sm' ? 'w-10 text-xs sm:text-sm' : 'w-12 sm:w-14 text-sm sm:text-base'

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-[#DCE6E9] bg-white shadow-2xs transition-colors focus-within:border-[#167C86] focus-within:ring-1 focus-within:ring-[#167C86]',
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={decrement}
        className={cn(
          'flex items-center justify-center rounded-l-xl text-[#52636B] transition-colors hover:bg-[#FAF7F2] hover:text-[#172126] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer shrink-0',
          btnSize
        )}
      >
        <Minus className="size-3.5 sm:size-4" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={localVal}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label="Quantity"
        className={cn(
          'text-center font-semibold text-[#172126] tabular-nums bg-transparent border-x border-[#DCE6E9]/60 px-1 py-1 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          inputSize
        )}
      />

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={increment}
        className={cn(
          'flex items-center justify-center rounded-r-xl text-[#52636B] transition-colors hover:bg-[#FAF7F2] hover:text-[#172126] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer shrink-0',
          btnSize
        )}
      >
        <Plus className="size-3.5 sm:size-4" />
      </button>
    </div>
  )
}
