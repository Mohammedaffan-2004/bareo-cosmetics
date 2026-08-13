import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { uid } from '@/utils'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'success' | 'error' | 'info' | 'warning'
}

export interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: [],
}

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    pushToast(state, action: PayloadAction<Omit<Toast, 'id'> & { id?: string }>) {
      state.toasts.push({ id: action.payload.id ?? uid('toast'), ...action.payload })
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { pushToast, dismissToast } = toastSlice.actions
export default toastSlice.reducer
