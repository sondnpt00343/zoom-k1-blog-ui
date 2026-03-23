import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-heading text-lg font-semibold text-foreground">
            Đã xảy ra lỗi khi tải trang.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Thử tải lại hoặc về trang chủ.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={() => {
                this.setState({ hasError: false })
                window.location.assign('/')
              }}
            >
              Về trang chủ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Tải lại
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
