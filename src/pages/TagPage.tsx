import { useParams } from 'react-router-dom'

import { PostCard } from '@/components/posts/PostCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTagPosts, useTags } from '@/queries/hooks'

export function TagPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: allTags, isLoading: tagsLoading } = useTags()
  const {
    data: feed,
    isLoading: postsLoading,
    isError: postsError,
  } = useTagPosts(slug)

  const tag = slug ? allTags?.find((t) => t.slug === slug) : undefined
  const posts = feed?.posts ?? []
  const profilesByUserId = feed?.profilesByUserId ?? {}

  useDocumentTitle(tag?.name)

  if (!slug) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        Thiếu slug thẻ.
      </div>
    )
  }

  if (tagsLoading || postsLoading) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
        Đang tải…
      </div>
    )
  }

  if (!tag) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        Không tìm thấy thẻ.
      </div>
    )
  }

  if (postsError) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        Không tải được bài theo thẻ.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Thẻ
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {tag.name}
        </h1>
      </header>
      <div className="grid gap-6">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có bài gắn thẻ này.
          </p>
        ) : (
          posts.map((post) => {
            const author = profilesByUserId[post.authorId]
            if (!author) return null
            return (
              <PostCard
                key={post.id}
                post={post}
                author={author}
                tagNames={[]}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
