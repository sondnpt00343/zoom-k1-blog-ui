/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown'

  export function gfm(service: TurndownService): void
}
