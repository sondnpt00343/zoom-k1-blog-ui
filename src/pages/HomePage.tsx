import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { PostCard } from '@/components/posts/PostCard'
import { fetchPostTags } from '@/api/resources'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublishedPosts } from '@/queries/hooks'

export function HomePage() {
  useDocumentTitle('Trang chủ')
  const { data, isLoading, isError, error } = usePublishedPosts()

  const posts = data?.posts ?? []
  const profilesByUserId = data?.profilesByUserId ?? {}

  const tagQueries = useQueries({
    queries: posts.map((post) => ({
      queryKey: ['posts', post.id, 'tags'],
      queryFn: () => fetchPostTags(post.id),
      enabled: posts.length > 0,
    })),
  })

  const cards = useMemo(
    () =>
      posts.map((post, i) => ({
        post,
        author: profilesByUserId[post.authorId],
        tags: tagQueries[i]?.data ?? [],
      })),
    [posts, profilesByUserId, tagQueries],
  )

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        Đang tải bài viết…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/50 bg-destructive/5 p-8 text-center">
        <p className="font-medium text-destructive">
          {error instanceof Error ? error.message : 'Không tải được dữ liệu.'}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Kiểm tra API đang chạy và biến môi trường VITE_API_URL.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Feed
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Dòng chảy hôm nay
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Những bài được xuất bản gần đây — đọc chậm, ghi chú, và vỗ tay khi
          thấy đồng cảm.
        </p>
      </header>

      <div className="grid gap-6">
        {cards
          .filter((c) => c.author)
          .map(({ post, author, tags }) => (
            <PostCard
              key={post.id}
              post={post}
              author={author!}
              tagNames={tags.map((t) => t.name)}
            />
          ))}
      </div>
    </div>
  )
}
