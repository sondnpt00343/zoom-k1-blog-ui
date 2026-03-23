import { useQueries } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { fetchPostTags } from '@/api/resources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PostCard } from '@/components/posts/PostCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSearchPosts } from '@/queries/hooks'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = (searchParams.get('q') ?? '').trim()
  const [draft, setDraft] = useState(q)

  useEffect(() => {
    setDraft(q)
  }, [q])

  const { data, isFetching, isError } = useSearchPosts(q)
  const posts = data?.posts ?? []
  const profilesByUserId = data?.profilesByUserId ?? {}

  const tagQueries = useQueries({
    queries: posts.map((post) => ({
      queryKey: ['posts', post.id, 'tags'],
      queryFn: () => fetchPostTags(post.id),
      enabled: q.length > 0 && posts.length > 0,
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

  useDocumentTitle(q ? `Tìm “${q}”` : 'Tìm kiếm')

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Tìm kiếm
        </h1>
        <form
          className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault()
            const s = draft.trim()
            if (s) {
              setSearchParams({ q: s })
            } else {
              setSearchParams({})
            }
          }}
          role="search"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Nhập từ khóa…"
              className="h-10 ps-9"
              aria-label="Từ khóa tìm kiếm"
              spellCheck
            />
          </div>
          <Button type="submit" className="shrink-0 sm:w-auto">
            Tìm
          </Button>
        </form>
        {q ? (
          <p className="text-muted-foreground">
            Kết quả cho “{q}” — {posts.length} bài
            {isFetching ? ' (đang tải…)' : ''}
            {isError ? ' — không tải được kết quả' : ''}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nhập từ khóa và nhấn Tìm, hoặc dùng ô tìm trên thanh điều hướng (màn hình
            lớn).
          </p>
        )}
      </header>
      <div className="grid gap-4">
        {q && !isFetching && cards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có bài nào khớp. Thử từ khóa khác.
          </p>
        ) : null}
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
