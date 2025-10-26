"use client";

import React from "react";
import { trackEvent } from "@/lib/monitoring";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export class MonitoringErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    trackEvent({
      type: "client_error",
      data: { message: error.message, stack: error.stack, componentStack: errorInfo.componentStack },
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-red-300">
          Something went wrong. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

export default MonitoringErrorBoundary;

