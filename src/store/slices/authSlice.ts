import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { User } from '@/types'
import { authService, type LoginPayload, type RegisterPayload } from '@/services/authService'
import { removeStoredToken } from '@/services/apiClient'

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload) => {
    const res = await authService().login(payload)
    return res
  },
  { serializeError: (e) => ({ message: (e as Error).message }) }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload) => {
    const res = await authService().register(payload)
    return res
  },
  { serializeError: (e) => ({ message: (e as Error).message }) }
)

export const googleLogin = createAsyncThunk('auth/google', async () => {
  return authService().loginWithGoogle()
})

export const appleLogin = createAsyncThunk('auth/apple', async () => {
  return authService().loginWithApple()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      removeStoredToken()
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? 'Login failed'
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message ?? 'Registration failed'
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(appleLogin.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
