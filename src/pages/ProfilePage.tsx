import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { PostCard } from '@/components/posts/PostCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useFollowUserMutation,
  useProfile,
  usePublishedPosts,
} from '@/queries/hooks'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfile(username)
  const {
    data: feed,
    isLoading: postsLoading,
    isError: postsError,
  } = usePublishedPosts(
    username ? { authorUsername: username } : undefined,
  )
  const followMut = useFollowUserMutation(username ?? '')

  const userPosts = feed?.posts ?? []
  const profilesByUserId = feed?.profilesByUserId ?? {}

  useDocumentTitle(profile?.displayName)

  if (profileLoading || (username && postsLoading)) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
        Đang tải hồ sơ…
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <p className="font-heading text-lg">Không tìm thấy hồ sơ.</p>
      </div>
    )
  }

  if (postsError) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        Không tải được bài viết.
      </div>
    )
  }

  const followers = profile.followerCount
  const following = profile.viewerFollows

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-5">
          <Avatar className="size-24 border-2 border-border shadow-md">
            <AvatarImage src={profile.avatarUrl} alt="" />
            <AvatarFallback className="text-lg">
              {initials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {profile.displayName}
            </h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/90">
              {profile.bio}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {followers} người theo dõi
            </p>
          </div>
        </div>
        {currentUserId && currentUserId !== profile.userId ? (
          <Button
            type="button"
            variant={following ? 'secondary' : 'default'}
            disabled={followMut.isPending}
            onClick={() => {
              if (!username) return
              const was = following
              followMut.mutate(
                { userId: profile.userId, follow: !following },
                {
                  onSuccess: () => {
                    toast.success(was ? 'Đã bỏ theo dõi' : 'Đã theo dõi')
                  },
                  onError: () => {
                    toast.error('Không cập nhật được theo dõi. Thử lại.')
                  },
                },
              )
            }}
          >
            {following ? 'Đang theo dõi' : 'Theo dõi'}
          </Button>
        ) : null}
      </section>

      <Separator />

      <div>
        <h2 className="font-heading mb-6 text-xl font-semibold">
          Bài viết công khai
        </h2>
        <div className="grid gap-4">
          {userPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có bài xuất bản.
            </p>
          ) : (
            userPosts.map((post) => {
              const author =
                profilesByUserId[post.authorId] ?? profile
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
