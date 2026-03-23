import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useBookmarkMutation,
  useMyBookmarks,
  useProfilesByUserIds,
} from '@/queries/hooks'
import { useAuthStore } from '@/store/useAuthStore'
import type { Post, UserProfile } from '@/types/domain'
import { Library } from 'lucide-react'

function LibraryPostRow({
  post,
  author,
}: {
  post: Post
  author: UserProfile
}) {
  const bookmarkMut = useBookmarkMutation(post.id)
  const removing =
    bookmarkMut.isPending && bookmarkMut.variables === false

  const footer = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={removing}
      onClick={() =>
        bookmarkMut.mutate(false, {
          onSuccess: () => toast.success('Đã bỏ lưu'),
          onError: () => toast.error('Không bỏ lưu được. Thử lại.'),
        })
      }
    >
      Bỏ lưu
    </Button>
  )

  return (
    <PostCard post={post} author={author} tagNames={[]} footer={footer} />
  )
}

export function LibraryPage() {
  useDocumentTitle('Thư viện')
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const { data: bookmarks, isLoading, isError } = useMyBookmarks()

  const authorIds = useMemo(
    () => [...new Set((bookmarks ?? []).map((p) => p.authorId))],
    [bookmarks],
  )
  const profilesByUserId = useProfilesByUserIds(authorIds)

  if (!currentUserId) {
    return (
      <EmptyState
        icon={Library}
        title="Đăng nhập để xem thư viện"
        description="Lưu bài để đọc lại bất cứ lúc nào."
        actionLabel="Đăng nhập"
        onAction={() => {
          navigate('/login')
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Thư viện của bạn
          </h1>
        </header>
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        Không tải được thư viện. Kiểm tra kết nối API.
      </div>
    )
  }

  const saved = (bookmarks ?? []).filter((p) => !p.deletedAt)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Thư viện của bạn
        </h1>
        <p className="text-muted-foreground">
          Các bài bạn đã lưu để đọc lại.
        </p>
      </header>
      {saved.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Chưa có bài đã lưu"
          description="Mở một bài và nhấn 'Lưu' để thêm vào đây."
          actionLabel="Khám phá trang chủ"
          onAction={() => {
            navigate('/')
          }}
        />
      ) : (
        <div className="grid gap-4">
          {saved.map((post) => {
            const author = profilesByUserId[post.authorId]
            if (!author) return null
            return (
              <LibraryPostRow key={post.id} post={post} author={author} />
            )
          })}
        </div>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Gợi ý:{' '}
        <Link to="/" className="text-primary underline">
          về trang chủ
        </Link>
      </p>
    </div>
  )
}
