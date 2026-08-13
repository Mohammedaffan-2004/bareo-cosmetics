import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '@/types'

export interface WishlistState {
  products: Product[]
}

const initialState: WishlistState = {
  products: [],
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<Product>) {
      const exists = state.products.some((p) => p.id === action.payload.id)
      if (exists) {
        state.products = state.products.filter((p) => p.id !== action.payload.id)
      } else {
        state.products.unshift(action.payload)
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.products = state.products.filter((p) => p.id !== action.payload)
    },
    clearWishlist(state) {
      state.products = []
    },
  },
})

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
