import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'

import App from './App.tsx'
import { AuthHydrate } from '@/components/AuthHydrate'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/queryClient'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AuthHydrate>
            <App />
            <Toaster richColors position="top-center" />
          </AuthHydrate>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
