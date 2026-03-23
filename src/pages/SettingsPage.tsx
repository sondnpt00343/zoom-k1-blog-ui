import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import * as api from '@/api/resources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuthStore } from '@/store/useAuthStore'

function isAllowedAvatarRef(s: string): boolean {
  if (s === '') return true
  if (/^\/uploads\/[a-zA-Z0-9._-]+$/.test(s)) return true
  return /^https?:\/\//i.test(s)
}

const schema = z.object({
  displayName: z.string().min(2, 'Tối thiểu 2 ký tự'),
  username: z
    .string()
    .min(2)
    .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ chữ, số và gạch dưới'),
  bio: z.string().max(500).optional(),
  avatarUrl: z
    .string()
    .max(2048)
    .refine(
      (v) => isAllowedAvatarRef(v.trim()),
      'Nhập URL hợp lệ (http/https) hoặc tải ảnh lên',
    ),
})

type Form = z.infer<typeof schema>

export function SettingsPage() {
  useDocumentTitle('Cài đặt hồ sơ')
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      username: '',
      bio: '',
      avatarUrl: '',
    },
  })

  useEffect(() => {
    if (!profile) return
    form.reset({
      displayName: profile.displayName,
      username: profile.username,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
    })
  }, [profile, form])

  if (!currentUserId || !profile) {
    return null
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const updated = await api.updateMeProfile({
        displayName: values.displayName,
        username: values.username,
        bio: values.bio ?? '',
        avatarUrl: values.avatarUrl.trim(),
      })
      setProfile(updated)
      toast.success('Đã cập nhật hồ sơ')
    } catch {
      toast.error(
        'Không cập nhật được. Kiểm tra tên người dùng đã có người khác dùng chưa.',
      )
    }
  })

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Hồ sơ
        </h1>
        <p className="text-muted-foreground">
          Tên hiển thị, tên người dùng và ảnh đại diện hiển thị công khai.
        </p>
      </header>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="displayName">Tên hiển thị</Label>
          <Input id="displayName" {...form.register('displayName')} />
          {form.formState.errors.displayName ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.displayName.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Tên người dùng</Label>
          <Input id="username" {...form.register('username')} />
          {form.formState.errors.username ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.username.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Tiểu sử</Label>
          <Textarea id="bio" rows={4} {...form.register('bio')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatar-file">Ảnh đại diện</Label>
          <p className="text-xs text-muted-foreground">
            Tải ảnh lên (JPEG, PNG, WebP) hoặc dán URL ảnh có sẵn.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
            <Input
              id="avatar-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={avatarUploading || form.formState.isSubmitting}
              className="max-w-md cursor-pointer"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f) return
                setAvatarUploading(true)
                void (async () => {
                  try {
                    const { url } = await api.uploadImage(f)
                    form.setValue('avatarUrl', url, { shouldDirty: true })
                    toast.success('Đã tải ảnh lên')
                  } catch {
                    toast.error('Không tải ảnh được. Thử lại hoặc đổi ảnh khác.')
                  } finally {
                    setAvatarUploading(false)
                  }
                })()
              }}
            />
            {form.watch('avatarUrl')?.trim() ? (
              <div className="flex flex-col gap-2">
                <img
                  src={form.watch('avatarUrl')}
                  alt=""
                  className="size-20 rounded-full border border-border object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={avatarUploading || form.formState.isSubmitting}
                  onClick={() => {
                    form.setValue('avatarUrl', '', { shouldDirty: true })
                  }}
                >
                  Gỡ ảnh
                </Button>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL ảnh (tuỳ chọn)</Label>
            <Input id="avatarUrl" {...form.register('avatarUrl')} />
            {form.formState.errors.avatarUrl ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.avatarUrl.message}
              </p>
            ) : null}
          </div>
        </div>
        <Button type="submit">Lưu thay đổi</Button>
      </form>
    </div>
  )
}
