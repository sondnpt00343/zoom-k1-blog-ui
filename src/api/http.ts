import { API_BASE } from '@/config/env'
import { useAuthStore } from '@/store/useAuthStore'

import { ApiError } from './errors'

function parseError(json: unknown, status: number, statusText: string): never {
  const msg =
    typeof json === 'object' &&
    json !== null &&
    'error' in json &&
    typeof (json as { error?: { message?: string } }).error?.message === 'string'
      ? (json as { error: { message: string } }).error.message
      : statusText
  const code =
    typeof json === 'object' &&
    json !== null &&
    'error' in json &&
    typeof (json as { error?: { code?: string } }).error?.code === 'string'
      ? (json as { error: { code?: string } }).error.code
      : undefined
  throw new ApiError(status, msg, code)
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    if (!(init.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }
  }
  const token = !init?.skipAuth ? useAuthStore.getState().accessToken : null
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(url, { ...init, headers })
  const text = await res.text()
  const json = text ? JSON.parse(text) : null
  if (!res.ok) {
    if (res.status === 401 && !init?.skipAuth) {
      useAuthStore.getState().clearSession()
    }
    parseError(json, res.status, res.statusText)
  }
  return json as T
}

export const apiGet = <T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
) => apiFetch<T>(path, { ...init, method: 'GET' })

export const apiPost = <T>(
  path: string,
  body?: unknown,
  init?: RequestInit & { skipAuth?: boolean },
) =>
  apiFetch<T>(path, {
    ...init,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

export const apiPatch = <T>(path: string, body: unknown, init?: RequestInit) =>
  apiFetch<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) })

export const apiPut = <T>(path: string, body: unknown, init?: RequestInit) =>
  apiFetch<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) })

export const apiDelete = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { ...init, method: 'DELETE' })

export async function apiPostFormData<T>(
  path: string,
  formData: FormData,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  return apiFetch<T>(path, { ...init, method: 'POST', body: formData })
}
