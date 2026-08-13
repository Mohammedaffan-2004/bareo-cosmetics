import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred while displaying this page. We've logged the error and are working on it.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-4 max-w-xl overflow-auto rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left font-mono text-xs text-destructive">
              {this.state.error.message}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-95 shadow-sm hover:opacity-90"
            >
              <RefreshCw className="size-4" /> Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-transform active:scale-95 shadow-sm hover:bg-accent"
            >
              <Home className="size-4" /> Go to Homepage
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
