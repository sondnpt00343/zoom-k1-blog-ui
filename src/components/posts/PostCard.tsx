import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { Post, UserProfile } from '@/types/domain'

interface PostCardProps {
  post: Post
  author: UserProfile
  tagNames?: string[]
  /** Toolbar / actions below meta row (e.g. Stories, Library). */
  footer?: ReactNode
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export const PostCard = memo(function PostCard({
  post,
  author,
  tagNames = [],
  footer,
}: PostCardProps) {
  const href = `/p/${author.username}/${post.slug}`

  return (
    <Card className="group border-border/60 bg-card/80 shadow-sm transition-colors hover:border-border hover:shadow-md motion-reduce:transition-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link
            to={`/u/${author.username}`}
            className="inline-flex max-w-full items-center gap-2 rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Avatar className="size-7 shrink-0 border border-border/50">
              <AvatarImage src={author.avatarUrl} alt="" />
              <AvatarFallback>{initials(author.displayName)}</AvatarFallback>
            </Avatar>
            <span className="truncate font-medium text-foreground">
              {author.displayName}
            </span>
          </Link>
          <span className="text-border" aria-hidden>
            ·
          </span>
          <time
            className="shrink-0 tabular-nums"
            dateTime={post.publishedAt ?? undefined}
          >
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('vi-VN')
              : '—'}
          </time>
        </div>

        <Link
          to={href}
          className="block min-w-0 space-y-1 rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h2 className="font-heading text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
            {post.title}
          </h2>
          {post.subtitle ? (
            <p className="text-sm leading-snug text-muted-foreground">
              {post.subtitle}
            </p>
          ) : null}
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        </Link>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {tagNames.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] leading-none text-muted-foreground"
            >
              {t}
            </span>
          ))}
          <span className="ms-auto inline-flex shrink-0 items-center gap-2 tabular-nums">
            <span>{post.readingTimeMinutes} phút</span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span>{post.clapCount} vỗ tay</span>
          </span>
        </div>

        {footer ? (
          <div className="border-t border-border/50 pt-3">{footer}</div>
        ) : null}
      </CardContent>
    </Card>
  )
})
