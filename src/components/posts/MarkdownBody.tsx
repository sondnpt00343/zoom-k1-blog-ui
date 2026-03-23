import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

interface MarkdownBodyProps {
  content: string
  className?: string
}

export function MarkdownBody({ content, className }: MarkdownBodyProps) {
  return (
    <div
      className={cn(
        'prose-article max-w-none text-base leading-[1.75] text-foreground',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="font-heading mt-10 mb-3 text-2xl font-semibold tracking-tight first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-heading mt-8 mb-2 text-xl font-semibold tracking-tight">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-5 text-[1.05rem] leading-relaxed text-foreground/90">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 ps-6 marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 ps-6 marker:font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-foreground/90">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-s-4 border-primary/50 bg-muted/40 py-2 pe-4 ps-5 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className?.includes('language-'))
            if (isBlock) {
              return (
                <code
                  className={cn(
                    'block overflow-x-auto rounded-xl bg-muted/80 p-4 font-mono text-sm',
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-5 overflow-x-auto rounded-xl bg-muted/80 p-0">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium text-primary underline-offset-4 hover:underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="mb-6 overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-muted/50 px-3 py-2 text-start font-heading">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/60 px-3 py-2">{children}</td>
          ),
          hr: () => <hr className="my-10 border-border/60" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
