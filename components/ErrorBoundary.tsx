'use client';
import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                If you&apos;re using a browser translator, try disabling it and refresh the page.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
