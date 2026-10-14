import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error in ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this view. You can reload the page or navigate back to the home portal.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-left overflow-x-auto text-[11px] font-mono text-rose-600 dark:text-rose-400">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home Portal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
