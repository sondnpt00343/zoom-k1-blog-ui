import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagChipProps {
  slug: string
  name: string
  className?: string
}

export function TagChip({ slug, name, className }: TagChipProps) {
  return (
    <Link to={`/tag/${slug}`} className={cn('inline-flex', className)}>
      <Badge
        variant="secondary"
        className="rounded-full px-3 py-1 text-xs font-normal tracking-tight"
      >
        {name}
      </Badge>
    </Link>
  )
}
