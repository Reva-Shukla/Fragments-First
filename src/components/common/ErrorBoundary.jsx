import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#172D46] text-[#FCFBF9] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-lg p-8 rounded-3xl bg-[#FCFBF9] border border-[#D8D2C6] shadow-xl text-left">
            <h2 className="font-serif-clean text-2xl font-bold text-[#172D46] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#5E7A91] mb-4 font-reading">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div className="bg-[#FAF9F5] p-3 rounded-xl text-xs font-mono text-[#5E7A91] overflow-auto max-h-40 mb-5 border border-[#D8D2C6]">
              {this.state.error?.stack}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="px-4 py-2.5 bg-[#294D6B] hover:bg-[#172D46] text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reload Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
