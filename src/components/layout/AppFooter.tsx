import { Link } from 'react-router-dom'

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-heading text-foreground/80">
          Inkwell — không gian đọc & viết tối giản.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/" className="hover:text-foreground">
            Trang chủ
          </Link>
          <Link to="/topic/thiet-ke-ux" className="hover:text-foreground">
            Chủ đề
          </Link>
          <a
            href="https://vite.dev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Vite
          </a>
        </div>
      </div>
    </footer>
  )
}
