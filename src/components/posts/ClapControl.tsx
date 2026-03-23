import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import {
  useClapMutation,
  useMyClap,
} from '@/queries/hooks'
import { useAuthStore } from '@/store/useAuthStore'

interface ClapControlProps {
  postId: string
  clapTotal: number
  className?: string
}

interface ClapSliderInnerProps {
  postId: string
  saved: number
  clapTotal: number
  className?: string
}

function ClapSliderInner({
  postId,
  saved,
  clapTotal,
  className,
}: ClapSliderInnerProps) {
  const mutation = useClapMutation(postId)
  const [local, setLocal] = useState(() => saved || 1)

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm backdrop-blur-sm',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sparkles
            className="size-5 text-primary"
            aria-hidden
            strokeWidth={1.75}
          />
          <span>Vỗ tay</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => {
            mutation.mutate(local)
          }}
          aria-label={`Lưu ${local} lượt vỗ tay`}
        >
          Lưu ({local})
        </Button>
      </div>
      <Slider
        min={1}
        max={50}
        step={1}
        value={[local]}
        onValueChange={(v) => {
          const n = Array.isArray(v) ? v[0] : v
          setLocal(typeof n === 'number' ? n : 1)
        }}
        aria-label="Số lượt vỗ tay từ 1 đến 50"
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Tổng trên bài: <strong>{clapTotal}</strong>
      </p>
    </div>
  )
}

export function ClapControl({ postId, clapTotal, className }: ClapControlProps) {
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const { data: myClap } = useMyClap(postId)

  const saved = myClap?.count ?? 0

  if (!currentUserId) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground',
          className
        )}
      >
        Đăng nhập để vỗ tay (1–50) cho bài viết này.
      </div>
    )
  }

  return (
    <ClapSliderInner
      key={`${postId}-${saved}`}
      postId={postId}
      saved={saved}
      clapTotal={clapTotal}
      className={className}
    />
  )
}
