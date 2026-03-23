import { useCallback, useEffect, useMemo, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import MarkdownIt from 'markdown-it'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import {
  Bold,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react'
import { toast } from 'sonner'

import * as api from '@/api/resources'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const mdParser = new MarkdownIt({ html: false, linkify: true, breaks: true })

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})
turndown.use(gfm)

function markdownToHtml(src: string): string {
  const t = src.trim()
  if (!t) return '<p></p>'
  return mdParser.render(src)
}

function htmlToMarkdown(html: string): string {
  return turndown.turndown(html).trim()
}

export function MarkdownRichEditor({
  value,
  onChange,
  disabled,
  id,
  'aria-labelledby': ariaLabelledby,
}: {
  value: string
  onChange: (markdown: string) => void
  disabled?: boolean
  id?: string
  'aria-labelledby'?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const lastFromEditor = useRef(value)

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { HTMLAttributes: { class: 'ml-6 list-disc' } },
        orderedList: { HTMLAttributes: { class: 'ml-6 list-decimal' } },
      }),
      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: 'my-3 max-h-[min(70vh,520px)] w-auto max-w-full rounded-lg border border-border/60 object-contain',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
        },
      }),
      Placeholder.configure({
        placeholder: 'Soạn nội dung…',
      }),
    ],
    [],
  )

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions,
      editable: !disabled,
      content: markdownToHtml(value),
      editorProps: {
        attributes: {
          class: 'tiptap focus:outline-none',
          spellcheck: 'false',
          ...(id ? { id } : {}),
          ...(ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : {}),
        },
      },
      onUpdate: ({ editor: ed }) => {
        const md = htmlToMarkdown(ed.getHTML())
        lastFromEditor.current = md
        onChange(md)
      },
    },
    [extensions],
  )

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (value === lastFromEditor.current) return
    editor.commands.setContent(markdownToHtml(value), { emitUpdate: false })
    lastFromEditor.current = value
  }, [value, editor])

  const runImage = useCallback(async (file: File) => {
    if (!editor || editor.isDestroyed) return
    try {
      const { url } = await api.uploadImage(file)
      editor.chain().focus().setImage({ src: url, alt: '' }).run()
      toast.success('Đã chèn ảnh')
    } catch {
      toast.error('Không tải ảnh được. Thử lại hoặc đổi ảnh khác.')
    }
  }, [editor])

  const onPickImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0]
      e.target.value = ''
      if (f) void runImage(f)
    },
    [runImage],
  )

  if (!editor) {
    return (
      <div
        className="markdown-rich-editor flex min-h-[420px] items-center justify-center rounded-lg border border-input bg-muted/20 text-sm text-muted-foreground"
        aria-busy
      >
        Đang tải trình soạn thảo…
      </div>
    )
  }

  return (
    <div className="markdown-rich-editor rounded-lg border border-input bg-transparent dark:bg-input/30">
      <div className="flex flex-wrap gap-1 border-b border-border/60 p-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Đậm"
        >
          <Bold className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={disabled || !editor.can().toggleItalic()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Nghiêng"
        >
          <Italic className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Tiêu đề 2"
        >
          <Heading2 className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Danh sách dấu đầu dòng"
        >
          <List className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Danh sách đánh số"
        >
          <ListOrdered className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Trích dẫn"
        >
          <Quote className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          aria-label="Chèn ảnh"
        >
          <ImageIcon className="size-3.5" />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          tabIndex={-1}
          onChange={onPickImage}
        />
      </div>
      <EditorContent
        editor={editor}
        className={cn(
          'max-w-none px-3 py-2 text-sm leading-relaxed text-foreground',
          disabled && 'pointer-events-none opacity-60',
        )}
      />
    </div>
  )
}
