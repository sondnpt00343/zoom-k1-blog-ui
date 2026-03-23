import { useQueries } from '@tanstack/react-query'
import { Bookmark, Pencil, Share2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { fetchProfileByUserId } from '@/api/resources'
import { AuthorByline } from '@/components/posts/AuthorByline'
import { cn } from '@/lib/utils'
import { ClapControl } from '@/components/posts/ClapControl'
import { CommentThread } from '@/components/posts/CommentThread'
import { MarkdownBody } from '@/components/posts/MarkdownBody'
import { TagChip } from '@/components/posts/TagChip'
import { ReadingProgress } from '@/components/layout/ReadingProgress'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useBookmarkMutation,
  useComments,
  useDeleteComment,
  useMyBookmarks,
  usePostBySlug,
  usePostComment,
  usePostTags,
  useProfile,
  useReadEvent,
} from '@/queries/hooks'
import { useAuthStore } from '@/store/useAuthStore'

export function ArticlePage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)

  const postQuery = usePostBySlug(username, slug)
  const post = postQuery.data
  const profileQuery = useProfile(username)
  const authorProfile = profileQuery.data

  const { data: tags = [] } = usePostTags(post?.id)
  const { data: comments = [] } = useComments(post?.id)

  const userIds = useMemo(
    () => [...new Set(comments.map((c) => c.userId))],
    [comments],
  )

  const profileQueries = useQueries({
    queries: userIds.map((uid) => ({
      queryKey: ['profiles', 'user', uid],
      queryFn: () => fetchProfileByUserId(uid),
      enabled: userIds.length > 0,
    })),
  })

  const profilesByUserId = useMemo(() => {
    const o: Record<string, (typeof profileQueries)[0]['data']> = {}
    userIds.forEach((id, i) => {
      const p = profileQueries[i]?.data
      if (p) o[id] = p
    })
    return o as Record<string, import('@/types/domain').UserProfile>
  }, [userIds, profileQueries])

  const postComment = usePostComment(post?.id ?? '')
  const deleteComment = useDeleteComment(post?.id ?? '')
  const readEvent = useReadEvent(post?.id ?? '')

  const { data: bookmarks } = useMyBookmarks()
  const bookmarkMut = useBookmarkMutation(post?.id ?? '')

  useDocumentTitle(post?.title)

  useEffect(() => {
    if (!post?.id) return
    const key = `inkwell:view:${post.id}`
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) {
        return
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, '1')
      }
    } catch {
      /* */
    }
    readEvent.mutate({ sessionId: crypto.randomUUID() })
  }, [post?.id, readEvent])

  if (postQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        Đang tải bài viết…
      </div>
    )
  }

  if (postQuery.isError || !post || !authorProfile) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-heading text-lg">Không tìm thấy bài viết.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Có thể đường dẫn sai, bài đã gỡ, hoặc chưa kết nối được. Thử lại sau.
        </p>
      </div>
    )
  }

  const isAuthor = currentUserId === post.authorId
  if (post.status !== 'published' && !isAuthor) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center">
        <p className="font-heading text-lg">Bài viết không công khai.</p>
      </div>
    )
  }

  const bookmarked =
    bookmarks?.some((b) => b.id === post.id) ?? false

  const share = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Đã sao chép liên kết')
    } catch {
      toast.error('Không sao chép được liên kết')
    }
  }

  return (
    <>
      <ReadingProgress targetId="article-body" />
      <article className="mx-auto max-w-3xl">
        {post.coverImageUrl ? (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border/60 shadow-sm">
            <img
              src={post.coverImageUrl}
              alt=""
              className="aspect-[2/1] w-full object-cover"
            />
          </div>
        ) : null}

        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <TagChip key={t.id} slug={t.slug} name={t.name} />
            ))}
          </div>
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          {post.subtitle ? (
            <p className="text-xl text-muted-foreground">{post.subtitle}</p>
          ) : null}
          <AuthorByline
            profile={authorProfile}
            publishedAt={post.publishedAt}
            readingTimeMinutes={post.readingTimeMinutes}
          />
          <div className="flex flex-wrap items-center gap-2">
            {isAuthor ? (
              <Link
                to={`/write/${post.id}`}
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'inline-flex items-center gap-2',
                )}
              >
                <Pencil className="size-4" />
                Sửa
              </Link>
            ) : null}
            <Button
              type="button"
              variant={bookmarked ? 'secondary' : 'outline'}
              size="sm"
              disabled={!post.id}
              onClick={() => {
                if (!currentUserId) {
                  toast.message('Đăng nhập để lưu vào thư viện')
                  return
                }
                bookmarkMut.mutate(!bookmarked, {
                  onSuccess: () => {
                    toast.success(bookmarked ? 'Đã bỏ lưu' : 'Đã lưu vào thư viện')
                  },
                  onError: () =>
                    toast.error('Không cập nhật được thư viện. Thử lại.'),
                })
              }}
              className="gap-2"
            >
              <Bookmark className="size-4" />
              {bookmarked ? 'Đã lưu' : 'Lưu'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void share()}
              className="gap-2"
            >
              <Share2 className="size-4" />
              Chia sẻ
            </Button>
            <span className="text-xs text-muted-foreground sm:ms-auto">
              {post.viewCount.toLocaleString('vi-VN')} lượt xem
            </span>
          </div>
        </header>

        <Separator className="mb-10" />

        <div id="article-body">
          <MarkdownBody content={post.body} />
        </div>

        <Separator className="my-12" />

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <ClapControl postId={post.id} clapTotal={post.clapCount} />
          <aside className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            <p className="font-heading text-foreground">Về tác giả</p>
            <p>{authorProfile.bio}</p>
          </aside>
        </div>

        <Separator className="my-12" />

        <CommentThread
          postId={post.id}
          comments={comments}
          profiles={profilesByUserId}
          currentUserId={currentUserId}
          onAdd={(body, parentId) => {
            postComment.mutate(
              { body, parentId },
              {
                onSuccess: () => toast.success('Đã gửi bình luận'),
                onError: () => toast.error('Không gửi được. Kiểm tra kết nối rồi thử lại.'),
              },
            )
          }}
          onDelete={(id) => {
            deleteComment.mutate(id, {
              onSuccess: () => toast.success('Đã xóa bình luận'),
              onError: () => toast.error('Không xóa được. Thử lại.'),
            })
          }}
        />
      </article>
    </>
  )
}
