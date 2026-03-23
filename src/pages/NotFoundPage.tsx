import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Không tìm thấy')

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="font-heading text-6xl font-semibold text-muted-foreground">
        404
      </p>
      <h1 className="font-heading text-2xl font-semibold">
        Trang không tồn tại
      </h1>
      <Link to="/" className={cn(buttonVariants())}>
        Về trang chủ
      </Link>
    </div>
  )
}
