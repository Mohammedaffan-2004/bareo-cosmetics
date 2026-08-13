// ============================================================
// Mock API client.
// This single module simulates network round-trips for the whole
// demo. When a real backend arrives, replace this file with an
// Axios / fetch client that returns the same ApiResponse<T>
// shape — every service and component keeps working untouched.
// ============================================================

import { MOCK_DELAY } from '@/constants'
import { wait } from '@/utils'

export interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

export interface MockError {
  message: string
  status: number
}

/**
 * Simulates a GET/POST to the backend.
 * Pass either a static value or a resolver function that builds it.
 */
export async function mockFetch<T>(
  resolver: T | (() => T),
  options?: { delay?: number }
): Promise<ApiResponse<T>> {
  const delay = options?.delay ?? MOCK_DELAY
  await wait(delay)
  const resolved = typeof resolver === 'function' ? (resolver as () => T)() : resolver
  return {
    data: JSON.parse(JSON.stringify(resolved)),
    message: 'OK',
    status: 200,
  }
}

/** Throw an error exactly like an Axios error interceptor would. */
export function mockError(message: string, status = 400): never {
  const err: MockError = { message, status }
  throw err
}
