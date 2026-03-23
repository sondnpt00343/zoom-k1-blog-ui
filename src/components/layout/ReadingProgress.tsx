import { useEffect, useState } from 'react'

interface ReadingProgressProps {
  targetId: string
}

export function ReadingProgress({ targetId }: ReadingProgressProps) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight - window.innerHeight
      const scrolled = Math.min(
        Math.max(-rect.top, 0),
        Math.max(total, 1)
      )
      setPct(Math.min(100, (scrolled / Math.max(total, 1)) * 100))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [targetId])

  return (
    <div
      className="pointer-events-none fixed start-0 top-0 z-50 h-0.5 w-full bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
