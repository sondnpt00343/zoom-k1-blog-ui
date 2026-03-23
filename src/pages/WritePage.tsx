import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import * as api from '@/api/resources'
import { MarkdownBody } from '@/components/posts/MarkdownBody'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const MarkdownRichEditor = lazy(async () => {
  const m = await import('@/components/editor/MarkdownRichEditor')
  return { default: m.MarkdownRichEditor }
})
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  qk,
  useAddRevision,
  useMyPosts,
  usePostTags,
  usePostTopics,
  usePublishPost,
  usePutPostTags,
  usePutPostTopics,
  useRevisions,
  useTags,
  useTopics,
  useUpdatePost,
} from '@/queries/hooks'
import { useAuthStore } from '@/store/useAuthStore'
import type { Post } from '@/types/domain'

/** Must match URL segment from route `write/:postId` (not a separate static route). */
const NEW_POST_ROUTE = 'new-post'
const DRAFT_CREATE_DEBOUNCE_MS = 4000

function CoverImageField({
  cover,
  onCoverChange,
  disabled,
}: {
  cover: string
  onCoverChange: (url: string) => void
  disabled?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    try {
      const { url } = await api.uploadImage(f)
      onCoverChange(url)
      toast.success('Đã tải ảnh lên')
    } catch {
      toast.error('Không tải ảnh được')
    } finally {
      setBusy(false)
    }
  }

  const pick = () => fileRef.current?.click()

  return (
    <div className="space-y-2">
      <Label htmlFor="cover-file">Ảnh bìa</Label>
      <input
        ref={fileRef}
        id="cover-file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        disabled={disabled || busy}
        onChange={(e) => void onFile(e)}
      />
      {cover.trim() ? (
        <div className="flex flex-wrap items-start gap-3">
          <img
            src={cover}
            alt=""
            className="h-28 w-auto max-w-[min(100%,280px)] shrink-0 rounded-md border border-border/60 object-cover"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || busy}
              onClick={() => pick()}
            >
              Thay ảnh
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCoverChange('')}
              disabled={disabled || busy}
            >
              Gỡ ảnh
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || busy}
          onClick={() => pick()}
        >
          Chọn ảnh bìa
        </Button>
      )}
    </div>
  )
}

function WriteLanding() {
  useDocumentTitle('Viết bài')
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <h1 className="font-heading text-3xl font-semibold">Viết bài mới</h1>
      <p className="text-muted-foreground">
        Tạo bản nháp trống — chỉnh sửa, thêm ảnh bìa và tag, rồi xuất bản khi
        sẵn sàng.
      </p>
      <Button type="button" onClick={() => navigate('/write/new-post')}>
        Tạo bản nháp
      </Button>
    </div>
  )
}

function WriteNewDraft() {
  useDocumentTitle('Bài viết mới')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const myProfile = useAuthStore((s) => s.profile)
  const { data: tags = [] } = useTags()
  const { data: topics = [] } = useTopics()

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [slug, setSlug] = useState('')
  const [cover, setCover] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [createPending, setCreatePending] = useState(false)

  const formRef = useRef({
    title,
    subtitle,
    excerpt,
    body,
    slug,
    cover,
    selectedTags,
    selectedTopics,
  })
  useEffect(() => {
    formRef.current = {
      title,
      subtitle,
      excerpt,
      body,
      slug,
      cover,
      selectedTags,
      selectedTopics,
    }
  }, [title, subtitle, excerpt, body, slug, cover, selectedTags, selectedTopics])

  const createdRef = useRef(false)

  useEffect(() => {
    if (createdRef.current) return
    const trimmed = title.trim()
    if (!trimmed) return

    const timer = window.setTimeout(() => {
      void (async () => {
        if (createdRef.current) return
        createdRef.current = true
        setCreatePending(true)
        const s = formRef.current
        try {
          const coverUrl = s.cover.trim()
          const p = await api.createDraftPost({
            title: s.title.trim(),
            body: s.body.trim() || ' ',
            excerpt: s.excerpt.trim(),
            subtitle: s.subtitle.trim() ? s.subtitle.trim() : null,
            slug: s.slug.trim() || undefined,
            coverImageUrl: coverUrl ? coverUrl : null,
          })
          await Promise.all([
            s.selectedTags.length > 0
              ? api.putPostTags(p.id, s.selectedTags)
              : Promise.resolve(),
            s.selectedTopics.length > 0
              ? api.putPostTopics(p.id, s.selectedTopics)
              : Promise.resolve(),
          ])
          void qc.invalidateQueries({ queryKey: qk.myPosts() })
          toast.success('Đã lưu bản nháp')
          navigate(`/write/${p.id}`, { replace: true })
        } catch {
          createdRef.current = false
          toast.error('Không tạo được bản nháp. Thử lại.')
        } finally {
          setCreatePending(false)
        }
      })()
    }, DRAFT_CREATE_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [title, navigate, qc])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Soạn thảo
        </h1>
        {createPending ? (
          <span className="text-sm text-muted-foreground">Đang tạo bản nháp…</span>
        ) : null}
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Nhập <span className="font-medium text-foreground">tiêu đề</span> — bản
        nháp sẽ được lưu tự động sau khoảng {DRAFT_CREATE_DEBOUNCE_MS / 1000}{' '}
        giây (chỉ tạo một lần). Bạn có thể soạn nội dung, đường dẫn và thẻ trước
        đó.
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title-new">Tiêu đề</Label>
          <Input
            id="title-new"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bắt đầu với tiêu đề…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle-new">Phụ đề (tuỳ chọn)</Label>
          <Input
            id="subtitle-new"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt-new">Trích dẫn</Label>
          <Textarea
            id="excerpt-new"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug-new">Slug</Label>
          <Input
            id="slug-new"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="text-[0.8125rem] leading-snug text-muted-foreground">
            Đường dẫn xem trước:{' '}
            <span className="break-all font-mono text-foreground/90">
              /p/{myProfile?.username ?? 'username'}/
              {slug.trim() || 'slug-bai-viet'}
            </span>
          </p>
        </div>
        <CoverImageField
          cover={cover}
          onCoverChange={setCover}
          disabled={createPending}
        />
      </div>

      <div className="space-y-2">
        <Label>Thẻ</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const on = selectedTags.includes(t.id)
            return (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={on ? 'default' : 'outline'}
                onClick={() =>
                  setSelectedTags((s) =>
                    on ? s.filter((x) => x !== t.id) : [...s, t.id],
                  )
                }
              >
                {t.name}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Chủ đề</Label>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const on = selectedTopics.includes(t.id)
            return (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={on ? 'default' : 'outline'}
                onClick={() =>
                  setSelectedTopics((s) =>
                    on ? s.filter((x) => x !== t.id) : [...s, t.id],
                  )
                }
              >
                {t.name}
              </Button>
            )
          })}
        </div>
      </div>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Soạn thảo</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-4">
          <div className="space-y-2">
            <Label id="label-body-new" htmlFor="body-new-editor">
              Nội dung
            </Label>
            <Suspense
              fallback={
                <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  Đang tải trình soạn thảo…
                </div>
              }
            >
              <MarkdownRichEditor
                id="body-new-editor"
                aria-labelledby="label-body-new"
                value={body}
                onChange={setBody}
                disabled={createPending}
              />
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <MarkdownBody content={body || '*Chưa có nội dung*'} />
        </TabsContent>
      </Tabs>

      <Link
        to="/me/stories"
        className={cn(buttonVariants({ variant: 'link' }), 'h-auto px-0')}
      >
        ← Quản lý bài viết
      </Link>
    </div>
  )
}

interface WriteEditorProps {
  post: Post
}

function WriteEditor({ post }: WriteEditorProps) {
  const postId = post.id
  const navigate = useNavigate()
  const myProfile = useAuthStore((s) => s.profile)
  const { data: tags = [] } = useTags()
  const { data: topics = [] } = useTopics()
  const { data: postTags } = usePostTags(postId)
  const { data: postTopics } = usePostTopics(postId)
  const { data: revisions = [] } = useRevisions(postId)

  const updateMut = useUpdatePost(postId)
  const publishMut = usePublishPost()
  const putTagsMut = usePutPostTags(postId)
  const putTopicsMut = usePutPostTopics(postId)
  const addRevisionMut = useAddRevision(postId)

  const [title, setTitle] = useState(post.title)
  const [subtitle, setSubtitle] = useState(post.subtitle ?? '')
  const [excerpt, setExcerpt] = useState(post.excerpt)
  const [body, setBody] = useState(post.body)
  const [slug, setSlug] = useState(post.slug)
  const [cover, setCover] = useState(post.coverImageUrl ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  useEffect(() => {
    setTitle(post.title)
    setSubtitle(post.subtitle ?? '')
    setExcerpt(post.excerpt)
    setBody(post.body)
    setSlug(post.slug)
    setCover(post.coverImageUrl ?? '')
  }, [
    post.id,
    post.title,
    post.subtitle,
    post.excerpt,
    post.body,
    post.slug,
    post.coverImageUrl,
  ])

  useEffect(() => {
    if (postTags) setSelectedTags(postTags.map((t) => t.id))
  }, [postId, postTags])

  useEffect(() => {
    if (postTopics) setSelectedTopics(postTopics.map((t) => t.id))
  }, [postId, postTopics])

  useDocumentTitle(`Sửa: ${title}`)

  const revisionList = useMemo(
    () => [...revisions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [revisions],
  )

  const save = async (quiet?: boolean) => {
    try {
      await updateMut.mutateAsync({
        title: title.trim() || 'Không tiêu đề',
        subtitle: subtitle.trim() || null,
        excerpt: excerpt.trim(),
        body,
        slug: slug.trim() || post.slug,
        coverImageUrl: cover.trim() || null,
      })
      await Promise.all([
        putTagsMut.mutateAsync(selectedTags),
        putTopicsMut.mutateAsync(selectedTopics),
      ])
      await addRevisionMut.mutateAsync({
        title: title.trim() || 'Không tiêu đề',
        body,
        subtitle: subtitle.trim() || null,
      })
      if (!quiet) toast.success('Đã lưu nháp')
    } catch {
      toast.error('Không lưu được. Thử lại.')
    }
  }

  const publish = async () => {
    try {
      await save(true)
      await publishMut.mutateAsync(postId)
      toast.success('Đã xuất bản')
      const finalSlug = slug.trim() || post.slug
      if (myProfile) {
        navigate(`/p/${myProfile.username}/${finalSlug}`)
      }
    } catch {
      toast.error('Không xuất bản được. Thử lại.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Soạn thảo
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={updateMut.isPending}
            onClick={() => void save()}
          >
            Lưu nháp
          </Button>
          <Button
            type="button"
            disabled={publishMut.isPending}
            onClick={() => void publish()}
          >
            Xuất bản
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề thu hút"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Phụ đề (tuỳ chọn)</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="excerpt">Trích dẫn</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="text-[0.8125rem] leading-snug text-muted-foreground">
            Đường dẫn xem trước:{' '}
            <span className="break-all font-mono text-foreground/90">
              /p/{myProfile?.username ?? 'username'}/
              {slug.trim() || 'slug-bai-viet'}
            </span>
          </p>
        </div>
        <CoverImageField
          cover={cover}
          onCoverChange={setCover}
          disabled={updateMut.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label>Thẻ</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const on = selectedTags.includes(t.id)
            return (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={on ? 'default' : 'outline'}
                onClick={() =>
                  setSelectedTags((s) =>
                    on ? s.filter((x) => x !== t.id) : [...s, t.id],
                  )
                }
              >
                {t.name}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Chủ đề</Label>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const on = selectedTopics.includes(t.id)
            return (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={on ? 'default' : 'outline'}
                onClick={() =>
                  setSelectedTopics((s) =>
                    on ? s.filter((x) => x !== t.id) : [...s, t.id],
                  )
                }
              >
                {t.name}
              </Button>
            )
          })}
        </div>
      </div>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Soạn thảo</TabsTrigger>
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="mt-4">
          <div className="space-y-2">
            <Label id="label-body" htmlFor="body-editor">
              Nội dung
            </Label>
            <Suspense
              fallback={
                <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  Đang tải trình soạn thảo…
                </div>
              }
            >
              <MarkdownRichEditor
                id="body-editor"
                aria-labelledby="label-body"
                value={body}
                onChange={setBody}
                disabled={updateMut.isPending}
              />
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <MarkdownBody content={body || '*Chưa có nội dung*'} />
        </TabsContent>
      </Tabs>

      <Separator />

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Phiên bản đã lưu</h2>
        {revisionList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Lưu nháp để tạo bản ghi lịch sử.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {revisionList.slice(0, 8).map((r) => (
              <li
                key={r.id}
                className="flex justify-between gap-4 rounded-lg border border-border/60 px-3 py-2"
              >
                <span className="truncate font-medium">
                  {r.snapshot.title}
                </span>
                <time className="shrink-0 text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString('vi-VN')}
                </time>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/me/stories"
          className={cn(
            buttonVariants({ variant: 'link' }),
            'h-auto px-0',
          )}
        >
          ← Quản lý bài viết
        </Link>
      </section>
    </div>
  )
}

export function WritePage() {
  const { postId } = useParams<{ postId: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const { data: myPosts, isLoading, isError } = useMyPosts()

  if (!currentUserId) {
    return null
  }

  if (!postId) {
    return <WriteLanding />
  }

  if (postId === NEW_POST_ROUTE) {
    return <WriteNewDraft />
  }

  const post = myPosts?.find((p) => p.id === postId)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
        Đang tải bài viết…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        Không tải được danh sách bài. Kiểm tra kết nối rồi thử lại.
      </div>
    )
  }

  if (!post) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        Không tìm thấy bài viết này.
      </div>
    )
  }

  if (post.authorId !== currentUserId) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        Bạn không có quyền sửa bài này.
      </div>
    )
  }

  return <WriteEditor key={postId} post={post} />
}
