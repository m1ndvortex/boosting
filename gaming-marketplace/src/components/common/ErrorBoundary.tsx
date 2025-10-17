import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorService } from '../../services/errorService';
import { Button } from '../discord/Button';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'feature';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to our error service
    const appError = ErrorService.handleError(
      error,
      `ErrorBoundary-${this.props.level || 'component'}`
    );
    
    this.setState({ errorId: appError.code });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on level
      const level = this.props.level || 'component';
      
      if (level === 'page') {
        return (
          <div className="error-boundary error-boundary--page">
            <div className="error-boundary__content">
              <div className="error-boundary__icon">⚠️</div>
              <h1 className="error-boundary__title">Something went wrong</h1>
              <p className="error-boundary__message">
                We encountered an unexpected error while loading this page.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="error-boundary__details">
                  <summary>Error Details (Development)</summary>
                  <pre className="error-boundary__stack">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="error-boundary__actions">
                <Button variant="primary" onClick={this.handleRetry}>
                  Try Again
                </Button>
                <Button variant="secondary" onClick={this.handleReload}>
                  Reload Page
                </Button>
              </div>
              
              {this.state.errorId && (
                <p className="error-boundary__error-id">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </div>
          </div>
        );
      }

      if (level === 'feature') {
        return (
          <div className="error-boundary error-boundary--feature">
            <div className="error-boundary__content">
              <div className="error-boundary__icon">⚠️</div>
              <h3 className="error-boundary__title">Feature Unavailable</h3>
              <p className="error-boundary__message">
                This feature is temporarily unavailable due to an error.
              </p>
              
              <div className="error-boundary__actions">
                <Button variant="secondary" size="sm" onClick={this.handleRetry}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Component level error
      return (
        <div className="error-boundary error-boundary--component">
          <div className="error-boundary__content">
            <span className="error-boundary__icon">⚠️</span>
            <span className="error-boundary__message">
              Component failed to load
            </span>
            <Button variant="secondary" size="sm" onClick={this.handleRetry}>
              Retry
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  level: 'page' | 'component' | 'feature' = 'component'
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary level={level}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    // This will be caught by the nearest error boundary
    throw ErrorService.handleError(error, errorInfo);
  };
}