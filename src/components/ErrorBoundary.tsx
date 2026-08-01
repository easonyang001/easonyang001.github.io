import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="section-container">
          <div className="max-w-prose">
            <h1 className="text-h2 text-text-primary">Something went wrong</h1>
            <p className="mt-4 text-body-lg text-text-secondary">
              This page failed to render. Try reloading, or return to the homepage.
            </p>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
