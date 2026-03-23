import { useEffect } from 'react'

import { useAuthStore } from '@/store/useAuthStore'

/** Validates persisted JWT on load. */
export function AuthHydrate({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    if (accessToken) {
      void fetchMe()
    }
  }, [accessToken, fetchMe])

  return children
}
