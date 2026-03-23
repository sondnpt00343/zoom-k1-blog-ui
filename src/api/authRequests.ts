import { API_BASE } from '@/config/env'
import type { User, UserProfile } from '@/types/domain'

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

export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : null
  if (!res.ok) parseError(json, res.status, res.statusText)
  return json as {
    token: string
    user: User
    profile: UserProfile | null
  }
}

export async function registerRequest(input: {
  email: string
  password: string
  displayName: string
  username: string
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : null
  if (!res.ok) parseError(json, res.status, res.statusText)
  return json as {
    token: string
    user: User
    profile: UserProfile | null
  }
}
