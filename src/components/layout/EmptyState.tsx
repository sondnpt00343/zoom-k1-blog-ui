import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card/40 px-8 py-16 text-center">
      <Icon className="size-10 text-muted-foreground" aria-hidden />
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
