'use client'
import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-[#f5f0e8] mb-2">
              Something went wrong
            </h2>
            <p className="text-[#a0b0a0] text-sm mb-6 leading-relaxed">
              We encountered an unexpected error. This has been logged and our team
              will look into it. Please try again.
            </p>
            {this.state.error && (
              <div className="bg-[#162216] border border-[#243824] rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#1a2e1a] font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#dfc06a] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional error display for server components / inline use
export function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
      <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-[#f5f0e8] mb-2">{title}</h3>
      <p className="text-[#a0b0a0] text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-[#243824] text-[#f5f0e8] px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d4a2d] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      )}
    </div>
  )
}
