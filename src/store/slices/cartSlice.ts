import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, Coupon } from '@/types'

export interface CartState {
  items: CartItem[]
  coupon: (Pick<Coupon, 'code' | 'discountType' | 'value' | 'maxDiscount'> & { discount: number }) | null
  isDrawerOpen: boolean
}

const initialState: CartState = {
  items: [],
  coupon: null,
  isDrawerOpen: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{ product: CartItem['product']; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload
      const maxAllowed = 99

      const existing = state.items.find((i) => i.product.id === product.id)
      if (existing) {
        existing.quantity = Math.min(maxAllowed, existing.quantity + quantity)
      } else {
        state.items.push({ product, quantity: Math.min(maxAllowed, quantity) })
      }
    },

    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload
      const item = state.items.find((i) => i.product.id === productId)
      if (item) {
        const maxAllowed = 99
        item.quantity = Math.min(maxAllowed, Math.max(1, quantity))
      }
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.product.id !== action.payload)
      if (state.items.length === 0) state.coupon = null
    },

    clearCart(state) {
      state.items = []
      state.coupon = null
    },

    applyCoupon(state, action: PayloadAction<CartState['coupon']>) {
      state.coupon = action.payload
    },

    setDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isDrawerOpen = action.payload
    },
  },
})

export const { addItem, updateQuantity, removeItem, clearCart, applyCoupon, setDrawerOpen } = cartSlice.actions
export default cartSlice.reducer
