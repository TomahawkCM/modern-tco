"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary ${this.props.name ?? 'Unknown'}] Caught error:`, error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 m-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
          <h2 className="text-lg font-bold mb-2">Component Error in {this.props.name ?? 'Component'}</h2>
          <p className="text-sm">{this.state.error?.message ?? 'An unknown error occurred'}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs">Stack Trace</summary>
            <pre className="text-xs mt-2 overflow-auto">{this.state.error?.stack}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}