import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info });

    console.error('[RootErrorBoundary] React render crash:', error);
    console.error('[RootErrorBoundary] Component stack:', info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          data-testid="root-error-boundary"
          style={{
            padding: 24,
            fontFamily: 'monospace',
            color: '#fca5a5',
            background: '#0a0a0a',
            minHeight: '100vh',
            whiteSpace: 'pre-wrap',
          }}
        >
          <h2 style={{ color: '#ef4444' }}>Application failed to render</h2>
          <div style={{ color: '#fde047', marginBottom: 12 }}>
            {this.state.error.name}: {this.state.error.message}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {this.state.error.stack}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 16 }}>
            {this.state.info?.componentStack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
