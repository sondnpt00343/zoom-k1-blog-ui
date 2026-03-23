import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PostCard } from '@/components/posts/PostCard'
import { TopicCard } from '@/components/topics/TopicCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useFollowTopicMutation,
  useTopicBySlug,
  useTopicPosts,
} from '@/queries/hooks'
import { useAuthStore } from '@/store/useAuthStore'

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const {
    data: topic,
    isLoading: topicLoading,
    isError: topicError,
  } = useTopicBySlug(slug)
  const {
    data: feed,
    isLoading: postsLoading,
    isError: postsError,
  } = useTopicPosts(slug)
  const followMut = useFollowTopicMutation(slug ?? '')

  const posts = feed?.posts ?? []
  const profilesByUserId = feed?.profilesByUserId ?? {}

  useDocumentTitle(topic?.name)

  if (!slug) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        Thiếu slug chủ đề.
      </div>
    )
  }

  if (topicLoading || postsLoading) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
        Đang tải chủ đề…
      </div>
    )
  }

  if (topicError || !topic) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        Không tìm thấy chủ đề.
      </div>
    )
  }

  if (postsError) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        Không tải được bài trong chủ đề. Thử lại sau.
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <TopicCard
        topic={topic}
        following={topic.viewerFollows}
        onToggleFollow={() => {
          const was = topic.viewerFollows
          followMut.mutate(
            { topicId: topic.id, follow: !topic.viewerFollows },
            {
              onSuccess: () => {
                toast.success(
                  was ? 'Đã bỏ theo dõi chủ đề' : 'Đã theo dõi chủ đề',
                )
              },
              onError: () =>
                toast.error('Không cập nhật được theo dõi. Thử lại.'),
            },
          )
        }}
        canFollow={Boolean(currentUserId)}
      />
      <div>
        <h2 className="font-heading mb-6 text-xl font-semibold">
          Bài trong chủ đề
        </h2>
        <div className="grid gap-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có bài trong chủ đề này.
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
    </div>
  )
}
