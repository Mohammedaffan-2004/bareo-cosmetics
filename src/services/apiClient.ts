// Central API Client connecting the frontend to the Express + MongoDB Backend

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api/v1'

export interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

export function getStoredToken(): string | null {
  const token =
    localStorage.getItem('bareo_auth_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('lumina_auth_token') ||
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('bareo_auth_token') ||
    sessionStorage.getItem('lumina_auth_token') ||
    sessionStorage.getItem('auth_token')

  if (token && token.startsWith('mock-')) {
    removeStoredToken()
    return null
  }
  return token
}

export function setStoredToken(token: string): void {
  localStorage.setItem('token', token)
  localStorage.setItem('bareo_auth_token', token)
  localStorage.setItem('lumina_auth_token', token)
  localStorage.setItem('auth_token', token)
}

export function removeStoredToken(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('bareo_auth_token')
  localStorage.removeItem('lumina_auth_token')
  localStorage.removeItem('auth_token')
  sessionStorage.removeItem('bareo_auth_token')
  sessionStorage.removeItem('lumina_auth_token')
  sessionStorage.removeItem('auth_token')
}

/**
  Makes HTTP REST requests to the backend server.
  Automatically attaches Bearer JWT token if present in localStorage or sessionStorage.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const text = await response.text()
    let result: any = null

    if (text && text.trim()) {
      try {
        result = JSON.parse(text)
      } catch {
        result = null
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        removeStoredToken()
      }

      const defaultErrorMessage =
        response.status === 504 || response.status === 502
          ? 'Backend API server unavailable. Please ensure the backend server is running on port 5000.'
          : `HTTP ${response.status} Error: ${response.statusText || 'API request failed'}`

      const errorMessage =
        (result && typeof result === 'object' && result.message) ||
        (typeof text === 'string' && text.length < 120 && text.trim() ? text.trim() : defaultErrorMessage)

      throw {
        message: errorMessage,
        status: response.status,
      }
    }

    if (!result) {
      return {
        data: null as unknown as T,
        message: 'Success',
        status: response.status,
      }
    }

    return result
  } catch (error: any) {
    if (error && typeof error === 'object' && error.message) {
      throw error
    }
    throw {
      message: error?.message || 'Network connection failed. Ensure backend server is running.',
      status: 0,
    }
  }
}
