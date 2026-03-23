import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { loginRequest, registerRequest } from '@/api/authRequests'
import type { User, UserProfile } from '@/types/domain'

interface AuthState {
  accessToken: string | null
  user: User | null
  profile: UserProfile | null
  setSession: (token: string, user: User, profile: UserProfile | null) => void
  setProfile: (profile: UserProfile) => void
  clearSession: () => void
  login: (email: string, password: string) => Promise<boolean>
  register: (input: {
    email: string
    password: string
    displayName: string
    username: string
  }) => Promise<boolean>
  fetchMe: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      profile: null,

      setSession: (token, user, profile) =>
        set({ accessToken: token, user, profile }),

      setProfile: (profile) => set({ profile }),

      clearSession: () =>
        set({ accessToken: null, user: null, profile: null }),

      logout: () => get().clearSession(),

      login: async (email, password) => {
        try {
          const data = await loginRequest(email, password)
          set({
            accessToken: data.token,
            user: data.user,
            profile: data.profile,
          })
          return true
        } catch {
          return false
        }
      },

      register: async (input) => {
        try {
          const data = await registerRequest(input)
          set({
            accessToken: data.token,
            user: data.user,
            profile: data.profile,
          })
          return true
        } catch {
          return false
        }
      },

      fetchMe: async () => {
        const token = get().accessToken
        if (!token) return
        try {
          const { apiGet } = await import('@/api/http')
          const data = await apiGet<{ user: User; profile: UserProfile | null }>(
            '/auth/me',
          )
          set({ user: data.user, profile: data.profile })
        } catch {
          get().clearSession()
        }
      },
    }),
    {
      name: 'inkwell-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        profile: s.profile,
      }),
    },
  ),
)

export function useCurrentUserId() {
  return useAuthStore((s) => s.user?.id ?? null)
}
