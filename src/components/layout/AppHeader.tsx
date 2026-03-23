import {
  BookMarked,
  Feather,
  Library,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const { setTheme, resolvedTheme } = useTheme()

  /** Đồng bộ ô tìm với URL khi route/search thay đổi (remount form nhờ key). */
  const searchFormKey = `${location.pathname}${location.search}`
  const searchInputDefault =
    location.pathname === '/search' ? (searchParams.get('q') ?? '') : ''

  const dark = resolvedTheme === 'dark'

  const nav = (
    <>
      <Link
        to="/"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
      >
        Trang chủ
      </Link>
      <Link
        to="/library"
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'inline-flex items-center gap-1.5'
        )}
      >
        <Library className="size-3.5" />
        Thư viện
      </Link>
      {currentUserId ? (
        <Link
          to="/me/stories"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'inline-flex items-center gap-1.5'
          )}
        >
          <BookMarked className="size-3.5" />
          Bài viết của tôi
        </Link>
      ) : null}
    </>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4">
        <Link
          to="/"
          className="font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Inkwell
        </Link>

        <form
          key={`hdr-${searchFormKey}`}
          className="hidden min-w-0 flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const s = String(fd.get('header-q') ?? '').trim()
            if (s) navigate(`/search?q=${encodeURIComponent(s)}`)
          }}
          role="search"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              name="header-q"
              defaultValue={searchInputDefault}
              placeholder="Tìm bài viết…"
              className="h-9 ps-9"
              aria-label="Tìm kiếm"
              spellCheck
            />
          </div>
        </form>

        <div className="hidden items-center gap-1 md:flex">{nav}</div>

        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => navigate('/search')}
            aria-label="Mở trang tìm kiếm"
          >
            <Search className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            aria-label={dark ? 'Chế độ sáng' : 'Chế độ tối'}
          >
            {dark ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>

          {currentUserId && profile ? (
            <>
              <Link
                to="/write/new-post"
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'hidden sm:inline-flex items-center gap-1.5'
                )}
              >
                <Feather className="size-3.5" />
                Viết bài
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                    'rounded-full'
                  )}
                  aria-label="Tài khoản"
                >
                  <Avatar className="size-8 border border-border/60">
                    <AvatarImage src={profile.avatarUrl} alt="" />
                    <AvatarFallback>
                      {initials(profile.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-sm font-medium">
                          {profile.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @{profile.username}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate(`/u/${profile.username}`)}
                  >
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/settings/profile')}
                  >
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/write/new-post')}>
                    Viết bài
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                to="/login"
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className={cn(buttonVariants({ size: 'sm' }))}
              >
                Đăng ký
              </Link>
            </div>
          )}

          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon-sm' }),
                'md:hidden'
              )}
              aria-label="Mở menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4">
              <div className="font-heading text-lg font-semibold">Menu</div>
              <form
                key={`sheet-${searchFormKey}`}
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData(e.currentTarget)
                  const s = String(fd.get('sheet-q') ?? '').trim()
                  if (s) navigate(`/search?q=${encodeURIComponent(s)}`)
                }}
              >
                <Input
                  name="sheet-q"
                  defaultValue={searchInputDefault}
                  placeholder="Tìm kiếm…"
                  spellCheck
                />
                <Button type="submit" className="w-full">
                  Tìm
                </Button>
              </form>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                {nav}
              </div>
              {currentUserId ? (
                <Link
                  to="/write/new-post"
                  className={cn(
                    buttonVariants(),
                    'inline-flex w-full items-center justify-center gap-2'
                  )}
                >
                  <Feather className="size-4" />
                  Viết bài
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={cn(
                    buttonVariants({ variant: 'secondary' }),
                    'inline-flex w-full items-center justify-center gap-2'
                  )}
                >
                  <UserRound className="size-4" />
                  Đăng nhập
                </Link>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
