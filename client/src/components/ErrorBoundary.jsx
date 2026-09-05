import React, { Component } from 'react';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lift p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-5">
              <FaExclamationTriangle className="text-2xl text-amber-600" />
            </div>
            <h2 className="font-display text-2xl text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 text-sm mb-7">
              A section of this page hit an unexpected error. Reload to try again, or head back to the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-neon-pink text-white font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                <FaRedo /> Reload Page
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-full hover:bg-slate-200 transition-colors"
              >
                <FaHome /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;