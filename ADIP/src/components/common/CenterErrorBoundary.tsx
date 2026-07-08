import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { GlassCard } from './GlassCard';
import { colors } from '../../theme/colors';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  error: Error | null;
}

/** Per-center error boundary (Role 8) — does not replace RootErrorBoundary. */
export class CenterErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CenterErrorBoundary]', this.props.title, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <GlassCard sx={{ p: 2, my: 1.5 }} glow="purple">
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {this.props.title ?? 'Module'} encountered an error
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {this.state.error.message}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => this.setState({ error: null })}>
            Retry
          </Button>
          <Box component="pre" sx={{ mt: 1, fontSize: '0.65rem', color: colors.text.muted, overflow: 'auto' }}>
            {this.state.error.stack}
          </Box>
        </GlassCard>
      );
    }
    return this.props.children;
  }
}
