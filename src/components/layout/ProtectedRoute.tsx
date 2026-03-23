import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const location = useLocation()

  if (!currentUserId) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return children
}
