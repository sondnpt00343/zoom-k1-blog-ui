import { Link } from 'react-router-dom'

import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Topic } from '@/types/domain'

interface TopicCardProps {
  topic: Topic
  following: boolean
  onToggleFollow: () => void
  canFollow: boolean
}

export function TopicCard({
  topic,
  following,
  onToggleFollow,
  canFollow,
}: TopicCardProps) {
  return (
    <Card className="border-border/70 bg-card/70 shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="font-heading text-lg">
          <Link
            to={`/topic/${topic.slug}`}
            className="outline-none hover:text-primary focus-visible:underline"
          >
            {topic.name}
          </Link>
        </CardTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {topic.description}
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {canFollow ? (
          <Button
            type="button"
            size="sm"
            variant={following ? 'secondary' : 'default'}
            onClick={onToggleFollow}
          >
            {following ? 'Đang theo dõi' : 'Theo dõi chủ đề'}
          </Button>
        ) : (
          <Link
            to="/login"
            className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
          >
            Đăng nhập để theo dõi
          </Link>
        )}
        <Link
          to={`/topic/${topic.slug}`}
          className={cn(buttonVariants({ size: 'sm', variant: 'ghost' }))}
        >
          Xem bài
        </Link>
      </CardContent>
    </Card>
  )
}
