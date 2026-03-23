import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { RouteErrorBoundary } from '@/components/layout/RouteErrorBoundary'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

const ArticlePage = lazy(async () => ({
  default: (await import('@/pages/ArticlePage')).ArticlePage,
}))
const LibraryPage = lazy(async () => ({
  default: (await import('@/pages/LibraryPage')).LibraryPage,
}))
const LoginPage = lazy(async () => ({
  default: (await import('@/pages/LoginPage')).LoginPage,
}))
const ProfilePage = lazy(async () => ({
  default: (await import('@/pages/ProfilePage')).ProfilePage,
}))
const RegisterPage = lazy(async () => ({
  default: (await import('@/pages/RegisterPage')).RegisterPage,
}))
const SearchPage = lazy(async () => ({
  default: (await import('@/pages/SearchPage')).SearchPage,
}))
const SettingsPage = lazy(async () => ({
  default: (await import('@/pages/SettingsPage')).SettingsPage,
}))
const StoriesPage = lazy(async () => ({
  default: (await import('@/pages/StoriesPage')).StoriesPage,
}))
const TagPage = lazy(async () => ({
  default: (await import('@/pages/TagPage')).TagPage,
}))
const TopicPage = lazy(async () => ({
  default: (await import('@/pages/TopicPage')).TopicPage,
}))
const WritePage = lazy(async () => ({
  default: (await import('@/pages/WritePage')).WritePage,
}))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Đang tải…
    </div>
  )
}

function SuspensePage({ children }: { children: React.ReactNode }) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteFallback />}>{children}</Suspense>
    </RouteErrorBoundary>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={
            <SuspensePage>
              <LoginPage />
            </SuspensePage>
          }
        />
        <Route
          path="register"
          element={
            <SuspensePage>
              <RegisterPage />
            </SuspensePage>
          }
        />
        <Route
          path="search"
          element={
            <SuspensePage>
              <SearchPage />
            </SuspensePage>
          }
        />
        <Route
          path="library"
          element={
            <SuspensePage>
              <LibraryPage />
            </SuspensePage>
          }
        />
        <Route
          path="tag/:slug"
          element={
            <SuspensePage>
              <TagPage />
            </SuspensePage>
          }
        />
        <Route
          path="topic/:slug"
          element={
            <SuspensePage>
              <TopicPage />
            </SuspensePage>
          }
        />
        <Route
          path="u/:username"
          element={
            <SuspensePage>
              <ProfilePage />
            </SuspensePage>
          }
        />
        <Route
          path="p/:username/:slug"
          element={
            <SuspensePage>
              <ArticlePage />
            </SuspensePage>
          }
        />
        <Route
          path="me/stories"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <StoriesPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="write"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <WritePage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="write/:postId"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <WritePage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings/profile"
          element={
            <ProtectedRoute>
              <SuspensePage>
                <SettingsPage />
              </SuspensePage>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
