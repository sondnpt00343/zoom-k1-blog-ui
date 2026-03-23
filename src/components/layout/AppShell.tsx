import { Outlet } from 'react-router-dom'

import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeader } from '@/components/layout/AppHeader'

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}
