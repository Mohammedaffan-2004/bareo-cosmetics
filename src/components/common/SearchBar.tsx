import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp } from 'lucide-react'
import type { Product } from '@/types'
import { productService } from '@/services/productService'
import { useDebounce } from '@/hooks/useDebounce'
import { formatINR } from '@/utils'

interface SearchBarProps {
  className?: string
  autoFocus?: boolean
  onNavigate?: () => void
}

export function SearchBar({ className, autoFocus, onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(query, 300)
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    if (!debounced.trim()) {
      setSuggestions([])
      return
    }
    productService()
      .searchSuggestions(debounced)
      .then((items) => {
        if (active) setSuggestions(items)
      })
      .catch(() => {
        if (active) setSuggestions([])
      })
    return () => {
      active = false
    }
  }, [debounced])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const goToProduct = (slug: string) => {
    setOpen(false)
    setQuery('')
    onNavigate?.()
    navigate(`/product/${slug}`)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
    onNavigate?.()
    navigate(`/shop?q=${encodeURIComponent(query)}`)
  }

  return (
    <div ref={rootRef} className={`relative w-full ${className ?? ''}`}>
      <form onSubmit={submit} className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search serums, sunscreens, cleansers…"
          className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-14 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lift animate-content-in">
          <p className="flex items-center gap-1.5 px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="size-3.5" /> Suggestions
          </p>
          <ul className="max-h-80 overflow-y-auto p-1">
            {suggestions.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => goToProduct(p.slug)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary"
                >
                  <img src={p.images[0].url} alt="" className="size-10 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{p.brand}</span>
                  </span>
                  <span className="text-sm font-semibold text-primary">{formatINR(p.offerPrice)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
