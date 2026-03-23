import { Link } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { UserProfile } from '@/types/domain'

interface AuthorBylineProps {
  profile: UserProfile
  publishedAt: string | null
  readingTimeMinutes: number
  compact?: boolean
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function AuthorByline({
  profile,
  publishedAt,
  readingTimeMinutes,
  compact,
}: AuthorBylineProps) {
  const dateLabel = publishedAt
    ? new Date(publishedAt).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Bản nháp'

  return (
    <div
      className={
        compact
          ? 'flex items-center gap-3'
          : 'flex flex-wrap items-center gap-4 sm:gap-6'
      }
    >
      <Link
        to={`/u/${profile.username}`}
        className="flex items-center gap-3 rounded-xl outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-12 border border-border/60 shadow-sm">
          <AvatarImage src={profile.avatarUrl} alt="" />
          <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
        </Avatar>
        <div className="text-start">
          <p className="font-heading text-sm font-semibold text-foreground">
            {profile.displayName}
          </p>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </Link>
      <div className="text-xs text-muted-foreground sm:text-sm">
        <span>{dateLabel}</span>
        <span className="mx-2 text-border">·</span>
        <span>{readingTimeMinutes} phút đọc</span>
      </div>
    </div>
  )
}
