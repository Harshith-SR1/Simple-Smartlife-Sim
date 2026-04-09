import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('Frontend runtime error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell error-shell">
          <div className="status-card">
            <h2>Frontend Error</h2>
            <p className="log-text">The SmartLifeSim frontend hit a runtime error.</p>
            <p className="effect-text">{String(this.state.error.message || this.state.error)}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
