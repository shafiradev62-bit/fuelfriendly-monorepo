import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught error:', error, errorInfo);
    console.error('🚨 Error stack:', error.stack);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    // DISABLED: Auto-redirect to home after 1 second
    // setTimeout(() => {
    //   console.error('🚨 ErrorBoundary redirecting to home due to error');
    //   window.location.href = '/home';
    // }, 1000);
  }

  public render() {
    if (this.state.hasError) {
      // Show error details instead of silent redirect for debugging
      return (
        <div className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Application Error</h1>
          <pre className="bg-gray-900 p-4 rounded overflow-auto max-w-full text-xs text-red-400 mb-6">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.href = '/home'}
            className="px-6 py-2 bg-[#3AC36C] hover:bg-[#2da85a] rounded-full font-bold transition-all"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;