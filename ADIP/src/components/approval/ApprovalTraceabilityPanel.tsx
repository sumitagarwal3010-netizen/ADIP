import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { ApprovalTraceabilityChain } from '../approval/ApprovalTraceabilityChain';
import { APPROVAL_REQUESTS } from '../../data/approvalWorkflowMock';
import { colors } from '../../theme/colors';

export function ApprovalTraceabilityPanel() {
  const [selectedId, setSelectedId] = useState(APPROVAL_REQUESTS[0]?.id ?? '');

  const selected = APPROVAL_REQUESTS.find((r) => r.id === selectedId) ?? APPROVAL_REQUESTS[0];

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader
          title="Approval Traceability"
          subtitle="Requirement → Architecture → Development → Testing → Release → Approval → Production"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Each approval gate is linked to upstream SDLC artifacts and downstream production deployment records.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {APPROVAL_REQUESTS.slice(0, 12).map((r) => (
            <Box
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(r.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(r.id); } }}
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: selectedId === r.id ? 700 : 500,
                bgcolor: selectedId === r.id ? `${colors.primary}22` : colors.bg.glass,
                border: `1px solid ${selectedId === r.id ? colors.primary : colors.border.subtle}`,
              }}
            >
              {r.id}
            </Box>
          ))}
        </Box>
        {selected && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>{selected.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {selected.stage} · {selected.domain} · {selected.status}
            </Typography>
            <ApprovalTraceabilityChain chain={selected.traceabilityChain} />
          </>
        )}
      </GlassCard>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Approval Gates in Flight" subtitle={`${APPROVAL_REQUESTS.length} enterprise workflow records`} />
        {APPROVAL_REQUESTS.slice(0, 8).map((r) => (
          <Box key={r.id} sx={{ py: 1, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Box sx={{ mt: 0.75 }}>
              <ApprovalTraceabilityChain chain={r.traceabilityChain} compact />
            </Box>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
