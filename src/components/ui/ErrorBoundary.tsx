import { Component, type ErrorInfo, type ReactNode } from 'react'
import { StatusBanner } from './StatusBanner.tsx'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected interface error occurred.',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[silverfour-app-boundary]', error, info.componentStack)
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main id="main-content" tabIndex={-1} className="sf-container" style={{ paddingBlock: '3rem' }}>
          <StatusBanner
            variant="error"
            title="Unable to render this view"
            message={this.state.errorMessage ?? undefined}
            actionLabel="Retry view"
            onAction={this.handleReset}
          />
        </main>
      )
    }

    return this.props.children
  }
}
