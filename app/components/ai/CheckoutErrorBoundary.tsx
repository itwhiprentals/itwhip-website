'use client'

import React from 'react'
import { IoAlertCircle, IoRefresh } from 'react-icons/io5'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class CheckoutErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CheckoutErrorBoundary]', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <IoAlertCircle size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              Payment couldn&apos;t load
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            This may be caused by an ad blocker or network issue. Try refreshing or use a different browser.
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <IoRefresh size={12} />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
