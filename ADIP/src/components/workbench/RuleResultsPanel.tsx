import { Box, Chip, Typography } from '@mui/material';
import { colors } from '../../theme/colors';

export interface RuleResultRow {
  rule_id: string;
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  remediation?: string;
}

interface RuleResultsPanelProps {
  results: RuleResultRow[];
  overallStatus?: string;
}

const statusColor = (s: string) => {
  if (s === 'pass') return 'success';
  if (s === 'fail') return 'error';
  return 'warning';
};

export function RuleResultsPanel({ results, overallStatus }: RuleResultsPanelProps) {
  if (!results.length) return null;
  return (
    <Box>
      {overallStatus && (
        <Chip size="small" label={`Overall: ${overallStatus}`} color={statusColor(overallStatus) as 'success'} sx={{ mb: 1 }} />
      )}
      {results.map((r) => (
        <Box key={r.rule_id} sx={{ py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip size="small" color={statusColor(r.status) as 'success'} label={r.status} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{r.name}</Typography>
            <Chip size="small" variant="outlined" label={r.category} />
          </Box>
          <Typography variant="caption" sx={{ color: colors.text.muted }}>{r.message}</Typography>
          {r.remediation && r.status !== 'pass' && (
            <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic' }}>→ {r.remediation}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
