/**
 * Error Boundary Component
 * Implements Task 12.2 - Add error boundaries to UI
 * 
 * Features:
 * - Wrap components in error boundaries
 * - Display fallback UI on errors
 * - Provide retry actions
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { NewsletterError, ErrorLogger } from '@/services/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch React errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Log to error logger if it's a NewsletterError
    if (error instanceof NewsletterError) {
      ErrorLogger.getInstance().log(error);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const isNewsletterError = error instanceof NewsletterError;
  const errorMessage = isNewsletterError
    ? error.getUserMessage()
    : 'An unexpected error occurred. Please try again.';

  return (
    <div className="error-boundary-fallback">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">Something went wrong</h2>
      <p className="error-message">{errorMessage}</p>
      
      {isNewsletterError && error.retryable && (
        <p className="error-hint">This error might be temporary. Please try again.</p>
      )}

      <div className="error-actions">
        <button onClick={reset} className="error-retry-button">
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="error-home-button"
        >
          Go to Home
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <details className="error-details">
          <summary>Error Details (Development Only)</summary>
          <pre className="error-stack">{error.stack}</pre>
        </details>
      )}
    </div>
  );
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
