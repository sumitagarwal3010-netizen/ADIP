import { Alert, Box, Chip, CircularProgress, Typography } from '@mui/material';
import type { SdlcHubSummaryView } from '../../sdk/hooks/useSdlcHubSummary';

interface SdlcBackendStripProps {
  hubLabel: string;
  loading: boolean;
  error: string | null;
  source: 'mock' | 'backend';
  summary: SdlcHubSummaryView | null;
  onRetry?: () => void;
}

/** Non-intrusive backend/mock indicator for SDLC hubs — no layout redesign. */
export function SdlcBackendStrip({
  hubLabel,
  loading,
  error,
  source,
  summary,
  onRetry,
}: SdlcBackendStripProps) {
  if (!loading && !error && source === 'mock') return null;

  return (
    <Box sx={{ mb: 1 }}>
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={14} />
          <Typography variant="caption" color="text.secondary">
            Loading {hubLabel} summary ({source})…
          </Typography>
        </Box>
      )}
      {error && (
        <Alert
          severity="warning"
          sx={{ py: 0.25 }}
          action={
            onRetry ? (
              <Typography
                component="button"
                variant="caption"
                onClick={onRetry}
                sx={{ cursor: 'pointer', border: 0, bgcolor: 'transparent' }}
              >
                Retry
              </Typography>
            ) : undefined
          }
        >
          Backend unavailable — using mock KPIs. {error}
        </Alert>
      )}
      {!loading && !error && source === 'backend' && summary && (
        <Chip
          size="small"
          color="success"
          variant="outlined"
          label={`Backend · ${summary.readiness} · score ${summary.score}${summary.projectName ? ` · ${summary.projectName}` : ''}`}
          sx={{ fontSize: '0.65rem', height: 22 }}
        />
      )}
    </Box>
  );
}
