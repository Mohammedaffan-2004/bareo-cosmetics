import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark'

export interface ThemeState {
  mode: ThemeMode
}

const stored = localStorage.getItem('theme') as ThemeMode | null
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches

const initialState: ThemeState = {
  mode: stored ?? (prefersDark ? 'dark' : 'light'),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload
      localStorage.setItem('theme', action.payload)
    },
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.mode)
    },
  },
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
