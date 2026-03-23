import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuthStore } from '@/store/useAuthStore'

const schema = z.object({
  email: z.string().min(1, 'Nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Nhập mật khẩu'),
})

type Form = z.infer<typeof schema>

export function LoginPage() {
  useDocumentTitle('Đăng nhập')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const from =
    (location.state as { from?: string } | null)?.from &&
    typeof (location.state as { from?: string }).from === 'string'
      ? (location.state as { from: string }).from
      : '/'

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await login(values.email, values.password)
    if (!ok) {
      toast.error('Email hoặc mật khẩu không đúng')
      return
    }
    toast.success('Đã đăng nhập')
    navigate(from, { replace: true })
  })

  return (
    <div className="mx-auto max-w-md space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Đăng nhập
        </h1>
        <p className="text-sm text-muted-foreground">
          Đăng nhập bằng tài khoản đã đăng ký trên server API.
        </p>
      </header>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register('email')}
          />
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
            autoComplete="current-password"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          Đăng nhập
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-primary underline">
          Đăng ký
        </Link>
      </p>
    </div>
  )
}
