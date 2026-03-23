import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FilePenLine, MoreVertical } from 'lucide-react'

import { PostCard } from '@/components/posts/PostCard'
import { EmptyState } from '@/components/layout/EmptyState'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useDeletePost,
  useMyPosts,
  usePublishPost,
  useUnpublishPost,
  useUpdatePost,
} from '@/queries/hooks'
import { useAuthStore } from '@/store/useAuthStore'
import type { Post } from '@/types/domain'
import { cn } from '@/lib/utils'

type StoryTab = 'draft' | 'published' | 'archived'

function StoryPostActions({ post, tab }: { post: Post; tab: StoryTab }) {
  const navigate = useNavigate()
  const updateMut = useUpdatePost(post.id)
  const deleteMut = useDeletePost()
  const publishMut = usePublishPost()
  const unpublishMut = useUnpublishPost()

  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleting = deleteMut.isPending && deleteMut.variables === post.id
  const publishing =
    publishMut.isPending && publishMut.variables === post.id
  const unpublishing =
    unpublishMut.isPending && unpublishMut.variables === post.id
  const archiving = updateMut.isPending

  const busy = deleting || publishing || unpublishing || archiving

  const confirmDelete = () => {
    deleteMut.mutate(post.id, {
      onSuccess: () => {
        toast.success('Đã xóa bài')
        setDeleteOpen(false)
      },
      onError: () => toast.error('Không xóa được. Thử lại sau.'),
    })
  }

  const deleteDescription =
    tab === 'published'
      ? 'Bài sẽ không còn hiển thị trên trang chủ và trong danh sách của bạn.'
      : 'Bài sẽ không còn hiển thị trong danh sách của bạn.'

  const onPublish = () => {
    publishMut.mutate(post.id, {
      onSuccess: () => toast.success('Đã xuất bản'),
      onError: () => toast.error('Không xuất bản được. Thử lại.'),
    })
  }

  const onArchive = () => {
    updateMut.mutate(
      { status: 'archived' },
      {
        onSuccess: () => toast.success('Đã chuyển vào lưu trữ'),
        onError: () => toast.error('Không lưu trữ được. Thử lại.'),
      },
    )
  }

  const onUnpublish = () => {
    unpublishMut.mutate(post.id, {
      onSuccess: () => toast.success('Đã chuyển về nháp'),
      onError: () => toast.error('Không chuyển về nháp được. Thử lại.'),
    })
  }

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            disabled={busy}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
            )}
            aria-label="Thao tác với bài viết"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem
              disabled={busy}
              onClick={() => navigate(`/write/${post.id}`)}
            >
              Sửa
            </DropdownMenuItem>
            {tab === 'draft' ? (
              <>
                <DropdownMenuItem disabled={busy} onClick={() => void onPublish()}>
                  Xuất bản
                </DropdownMenuItem>
                <DropdownMenuItem disabled={busy} onClick={() => void onArchive()}>
                  Lưu trữ
                </DropdownMenuItem>
              </>
            ) : null}
            {tab === 'published' ? (
              <DropdownMenuItem disabled={busy} onClick={() => void onArchive()}>
                Lưu trữ
              </DropdownMenuItem>
            ) : null}
            {tab === 'archived' ? (
              <>
                <DropdownMenuItem disabled={busy} onClick={() => void onPublish()}>
                  Đăng lại
                </DropdownMenuItem>
                <DropdownMenuItem disabled={busy} onClick={() => void onUnpublish()}>
                  Về nháp
                </DropdownMenuItem>
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onClick={() => setDeleteOpen(true)}
            >
              {tab === 'archived' ? 'Xóa bài' : 'Xóa'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa bài viết?</DialogTitle>
            <DialogDescription>{deleteDescription}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa…' : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function StoriesPage() {
  useDocumentTitle('Bài viết của tôi')
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const profile = useAuthStore((s) => s.profile)
  const { data: posts = [], isLoading, isError } = useMyPosts()

  const mine = posts.filter((p) => !p.deletedAt)
  const drafts = mine.filter((p) => p.status === 'draft')
  const published = mine.filter((p) => p.status === 'published')
  const archived = mine.filter((p) => p.status === 'archived')

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Bài viết của tôi
          </h1>
          <p className="text-muted-foreground">
            Bản nháp, đã xuất bản và lưu trữ.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/write/new-post')}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Viết bài mới
        </button>
      </div>

      {!currentUserId || !profile ? (
        <EmptyState
          icon={FilePenLine}
          title="Chưa đăng nhập"
          description="Đăng nhập để xem và quản lý bài viết của bạn."
        />
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Không tải được danh sách. Kiểm tra kết nối rồi thử lại.
        </p>
      ) : (
        <Tabs defaultValue="draft">
          <TabsList>
            <TabsTrigger value="draft">Nháp ({drafts.length})</TabsTrigger>
            <TabsTrigger value="published">
              Đã xuất bản ({published.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Lưu trữ ({archived.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="draft" className="mt-6">
            <div className="grid gap-4">
              {drafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có bản nháp.
                </p>
              ) : (
                drafts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={profile}
                    tagNames={[]}
                    footer={<StoryPostActions post={post} tab="draft" />}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="published" className="mt-6">
            <div className="grid gap-4">
              {published.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có bài đã xuất bản.
                </p>
              ) : (
                published.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={profile}
                    tagNames={[]}
                    footer={<StoryPostActions post={post} tab="published" />}
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="archived" className="mt-6">
            <div className="grid gap-4">
              {archived.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Không có bài lưu trữ.
                </p>
              ) : (
                archived.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    author={profile}
                    tagNames={[]}
                    footer={<StoryPostActions post={post} tab="archived" />}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
