import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuthStore } from '@/store/useAuthStore'

const schema = z
  .object({
    email: z.string().min(1, 'Nhập email').email('Email không hợp lệ'),
    password: z.string().min(8, 'Tối thiểu 8 ký tự (theo API)'),
    displayName: z.string().min(2, 'Tối thiểu 2 ký tự'),
    username: z
      .string()
      .min(2, 'Tối thiểu 2 ký tự')
      .regex(/^[a-zA-Z0-9_]+$/, 'Chỉ chữ, số và gạch dưới'),
  })

type Form = z.infer<typeof schema>

export function RegisterPage() {
  useDocumentTitle('Đăng ký')
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      username: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await register({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
      username: values.username,
    })
    if (!ok) {
      toast.error('Email hoặc tên người dùng đã tồn tại')
      return
    }
    toast.success('Tài khoản đã được tạo')
    navigate('/', { replace: true })
  })

  return (
    <div className="mx-auto max-w-md space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Đăng ký
        </h1>
        <p className="text-sm text-muted-foreground">
          Tài khoản được tạo trên server qua API.
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
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register('email')} />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full">
          Tạo tài khoản
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-primary underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
