import { useEffect } from 'react'

const APP = 'Inkwell'

export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP}` : APP
  }, [title])
}
