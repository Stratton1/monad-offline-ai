/**
 * ErrorBoundary.tsx
 * Purpose: React error boundary to catch errors and prevent white screens
 * Usage: Wraps app tree in App.tsx
 * Privacy: No data transmitted, only local error logging
 */

import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to console for debugging (in production, could send to local log file)
    console.error('[ErrorBoundary] Error stack:', error.stack);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-center"
          >
            <h1 className="text-4xl font-bold mb-4 text-red-400">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              MONAD encountered an unexpected error. Your data is safe.
            </p>
            
            {(import.meta as { env?: { DEV?: boolean } }).env?.DEV && this.state.error && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 text-left text-sm overflow-auto max-h-64">
                <p className="text-red-400 font-mono mb-2">{this.state.error.toString()}</p>
                {this.state.error.stack && (
                  <pre className="text-gray-400 text-xs whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Reload App
              </button>
            </div>

            <p className="text-gray-500 text-xs mt-6">
              0 bytes leave your device. Error logged locally only.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
