import { MessageCircle } from 'lucide-react'
import { memo, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Comment, UserProfile } from '@/types/domain'

interface CommentThreadProps {
  postId: string
  comments: Comment[]
  profiles: Record<string, UserProfile>
  currentUserId: string | null
  onAdd: (body: string, parentId: string | null) => void
  onDelete: (commentId: string) => void
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

const CommentItem = memo(function CommentItem({
  comment,
  profile,
  onReply,
  onDelete,
  canDelete,
  inlineReply,
}: {
  comment: Comment
  profile?: UserProfile
  onReply: (id: string) => void
  onDelete: (id: string) => void
  canDelete: boolean
  inlineReply?: {
    body: string
    setBody: (v: string) => void
    onSubmit: () => void
    onCancel: () => void
  }
}) {
  const deleted = Boolean(comment.deletedAt)

  return (
    <article className="rounded-xl border border-border/60 bg-card/50 p-4">
      <div className="flex gap-3">
        <Avatar className="size-9 shrink-0 border border-border/50">
          <AvatarImage src={profile?.avatarUrl} alt="" />
          <AvatarFallback>
            {profile ? initials(profile.displayName) : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {profile?.displayName ?? 'Ẩn danh'}
            </span>
            <time dateTime={comment.createdAt}>
              {new Date(comment.createdAt).toLocaleString('vi-VN')}
            </time>
          </div>
          {deleted ? (
            <p className="text-sm italic text-muted-foreground">Đã xóa</p>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {comment.body}
            </p>
          )}
          {!deleted ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onReply(comment.id)}
              >
                Trả lời
              </Button>
              {canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="text-destructive"
                  onClick={() => onDelete(comment.id)}
                >
                  Xóa
                </Button>
              ) : null}
            </div>
          ) : null}
          {inlineReply ? (
            <form
              className="mt-3 min-w-0 max-w-full space-y-2 border-t border-border/50 pt-3"
              onSubmit={(e) => {
                e.preventDefault()
                inlineReply.onSubmit()
              }}
            >
              <Textarea
                value={inlineReply.body}
                onChange={(e) => inlineReply.setBody(e.target.value)}
                placeholder="Viết phản hồi…"
                rows={3}
                className="resize-y"
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inlineReply.body.trim()}
                >
                  Gửi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={inlineReply.onCancel}
                >
                  Hủy
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  )
})

export const CommentThread = memo(function CommentThread({
  postId,
  comments,
  profiles,
  currentUserId,
  onAdd,
  onDelete,
}: CommentThreadProps) {
  const [rootBody, setRootBody] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')

  const tree = useMemo(() => {
    const byParent = new Map<string | null, Comment[]>()
    for (const c of comments) {
      const key = c.parentId
      const list = byParent.get(key) ?? []
      list.push(c)
      byParent.set(key, list)
    }
    for (const [, list] of byParent) {
      list.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    }
    return byParent
  }, [comments])

  const submitReply = () => {
    const t = replyBody.trim()
    if (!t || !replyingToId) return
    onAdd(t, replyingToId)
    setReplyBody('')
    setReplyingToId(null)
  }

  const renderBranch = (parent: string | null, depth: number) => {
    const list = tree.get(parent) ?? []
    if (list.length === 0) return null
    return (
      <ul
        className={cn(
          'flex flex-col gap-4',
          depth > 0 && 'mt-4 border-l border-border/50 pl-4',
        )}
      >
        {list.map((c) => (
          <li key={c.id} className="list-none">
            <CommentItem
              comment={c}
              profile={profiles[c.userId]}
              onReply={(id) => {
                setReplyingToId(id)
                setReplyBody('')
              }}
              onDelete={onDelete}
              canDelete={Boolean(currentUserId && currentUserId === c.userId)}
              inlineReply={
                currentUserId && replyingToId === c.id
                  ? {
                      body: replyBody,
                      setBody: setReplyBody,
                      onSubmit: submitReply,
                      onCancel: () => {
                        setReplyingToId(null)
                        setReplyBody('')
                      },
                    }
                  : undefined
              }
            />
            {renderBranch(c.id, depth + 1)}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className="space-y-6" aria-labelledby={`comments-${postId}`}>
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-primary" aria-hidden />
        <h2
          id={`comments-${postId}`}
          className="font-heading text-lg font-semibold tracking-tight"
        >
          Bình luận
        </h2>
      </div>

      {currentUserId ? (
        <form
          className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4"
          onSubmit={(e) => {
            e.preventDefault()
            const t = rootBody.trim()
            if (!t) return
            onAdd(t, null)
            setRootBody('')
          }}
        >
          <p className="text-xs text-muted-foreground">
            Thêm bình luận mới. Để hồi âm một người, dùng nút Trả lời ngay dưới bình luận
            của họ.
          </p>
          <Textarea
            value={rootBody}
            onChange={(e) => setRootBody(e.target.value)}
            placeholder="Chia sẻ suy nghĩ của bạn…"
            rows={4}
            className="resize-y"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!rootBody.trim()}>
              Gửi
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Đăng nhập để tham gia trao đổi.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có bình luận — hãy mở màn hình.
        </p>
      ) : (
        renderBranch(null, 0)
      )}
    </section>
  )
})
