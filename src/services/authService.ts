// Authentication service — communicates with live backend / fallback mock layer.

import type { User } from '@/types'
import { MOCK_CUSTOMERS } from '@/mocks/customers'
import { mockError, mockFetch } from './mockApi'
import { apiFetch, setStoredToken } from './apiClient'

const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Aarav Malhotra',
  email: 'user@bareo.in',
  phone: '+91 98765 43210',
  joinedAt: new Date(Date.now() - 220 * 86400000).toISOString(),
  skinType: 'combination',
  gender: 'male',
  role: 'USER',
}

const ADMIN_USER: User = {
  id: 'admin-user',
  name: 'Admin System',
  email: 'admin@bareo.in',
  phone: '+91 90000 00000',
  joinedAt: new Date(Date.now() - 400 * 86400000).toISOString(),
  role: 'ADMIN',
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

export function authService() {
  return {
    async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
      const response = await apiFetch<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      })
      if (response.data?.token) {
        setStoredToken(response.data.token)
      }
      return response.data
    },

    logout(): void {
      removeStoredToken()
    },

    async loginWithGoogle(): Promise<{ user: User; token: string }> {
      const res = { user: DEMO_USER, token: 'mock-google-token' }
      setStoredToken(res.token)
      return mockFetch(res).then((r) => r.data)
    },

    async loginWithApple(): Promise<{ user: User; token: string }> {
      const res = { user: DEMO_USER, token: 'mock-apple-token' }
      setStoredToken(res.token)
      return mockFetch(res).then((r) => r.data)
    },

    async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
      try {
        const response = await apiFetch<{ user: User; token: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        if (response.data?.token) {
          setStoredToken(response.data.token)
        }
        return response.data
      } catch (err) {
        if (!payload.name || !payload.email.includes('@') || payload.password.length < 6) {
          mockError('Please fill the form correctly', 422)
        }
        const res = {
          user: { ...DEMO_USER, name: payload.name, email: payload.email, phone: payload.phone },
          token: 'mock-register-token',
        }
        setStoredToken(res.token)
        return res
      }
    },

    async forgotPassword(email: string): Promise<{ sent: boolean }> {
      if (!email.includes('@')) mockError('Enter a valid email', 422)
      return mockFetch({ sent: true }).then((r) => r.data)
    },

    async verifyOtp(_email: string, otp: string): Promise<{ verified: boolean }> {
      if (otp.length !== 4 && otp.length !== 6) mockError('Invalid OTP', 400)
      return mockFetch({ verified: true }).then((r) => r.data)
    },

    async resetPassword(_email: string, password: string): Promise<{ reset: boolean }> {
      if (password.length < 6) mockError('Password must be at least 6 characters', 422)
      return mockFetch({ reset: true }).then((r) => r.data)
    },

    async getProfile(): Promise<User> {
      try {
        const response = await apiFetch<User>('/auth/me')
        return response.data
      } catch {
        return DEMO_USER
      }
    },

    async updateProfile(patch: Partial<User>): Promise<User> {
      const updated = { ...DEMO_USER, ...patch }
      return mockFetch(updated).then((r) => r.data)
    },
  }
}

/** Lookup for admin customer list (shares the same data source). */
export function customerLookup(): typeof MOCK_CUSTOMERS {
  return MOCK_CUSTOMERS
}
