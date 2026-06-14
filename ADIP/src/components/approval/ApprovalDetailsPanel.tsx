import { Box, Chip, Divider, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { ApprovalTraceabilityChain } from './ApprovalTraceabilityChain';
import { colors } from '../../theme/colors';
import type { ApprovalHistoryEntry, ApprovalRequest } from '../../data/approvalWorkflowMock';
import { isOverdue } from '../../data/approvalWorkflowMock';

interface ApprovalDetailsPanelProps {
  request: ApprovalRequest | null;
  history: ApprovalHistoryEntry[];
}

function statusColor(status: string): string {
  if (status === 'Approved' || status === 'Closed') return colors.success;
  if (status === 'Rejected' || status === 'Escalated') return colors.critical;
  if (status === 'Changes Requested') return colors.warning;
  if (status === 'Under Review' || status === 'Assigned') return colors.info;
  return colors.text.muted;
}

export function ApprovalDetailsPanel({ request, history }: ApprovalDetailsPanelProps) {
  if (!request) {
    return (
      <GlassCard sx={{ p: 2, height: '100%', minHeight: 320 }}>
        <ModuleHeader title="Approval Details" subtitle="Select a queue item to view metadata and history" />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 4, textAlign: 'center' }}>
          Click any row in the approval queue to inspect the full lifecycle.
        </Typography>
      </GlassCard>
    );
  }

  const itemHistory = history.filter((h) => h.approvalId === request.id);

  return (
    <GlassCard sx={{ p: 2, height: '100%' }}>
      <ModuleHeader title="Approval Details" subtitle={request.id} />
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>{request.title}</Typography>
      <Chip
        label={request.status}
        size="small"
        sx={{ mb: 1.5, fontWeight: 700, color: statusColor(request.status), bgcolor: `${statusColor(request.status)}18` }}
      />
      {isOverdue(request) && (
        <Chip label="SLA Breach" size="small" sx={{ ml: 0.5, mb: 1.5, fontWeight: 700, color: colors.critical, bgcolor: `${colors.critical}18` }} />
      )}

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem' }}>
        Metadata
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mb: 1.5, mt: 0.5 }}>
        {[
          ['Type', request.itemType],
          ['Stage', request.stage],
          ['Domain', request.domain],
          ['Priority', request.priority],
          ['Submitter', request.submitter],
          ['Reviewer', request.assignedReviewer ?? 'Unassigned'],
          ['Submitted', request.submittedDate],
          ['Due', request.dueDate],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{label}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', textTransform: label === 'Priority' ? 'capitalize' : 'none' }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: colors.border.subtle, my: 1 }} />

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem' }}>
        Review Notes
      </Typography>
      {request.reviewNotes.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>No review notes yet.</Typography>
      ) : (
        request.reviewNotes.map((note, i) => (
          <Typography key={i} variant="caption" sx={{ display: 'block', mb: 0.25 }}>• {note}</Typography>
        ))
      )}

      <Divider sx={{ borderColor: colors.border.subtle, my: 1 }} />

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem', mb: 0.5, display: 'block' }}>
        Related Artifacts
      </Typography>
      {request.relatedArtifacts.map((a) => (
        <Typography key={a.id} variant="caption" sx={{ display: 'block', mb: 0.25 }}>
          {a.id} — {a.name}
        </Typography>
      ))}

      <Divider sx={{ borderColor: colors.border.subtle, my: 1 }} />

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem', mb: 0.75, display: 'block' }}>
        Traceability Chain
      </Typography>
      <ApprovalTraceabilityChain chain={request.traceabilityChain} compact />

      <Divider sx={{ borderColor: colors.border.subtle, my: 1 }} />

      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.62rem', mb: 0.5, display: 'block' }}>
        Lifecycle History ({itemHistory.length})
      </Typography>
      {itemHistory.length === 0 ? (
        <Typography variant="caption" color="text.secondary">No actions recorded for this item yet.</Typography>
      ) : (
        itemHistory.slice(0, 5).map((h) => (
          <Box key={h.id} sx={{ mb: 0.75, p: 0.75, borderRadius: 1, bgcolor: colors.bg.glass }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{h.action}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem' }}>
              {h.timestamp} · {h.actor}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              {h.previousStatus} → {h.newStatus}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem' }}>
              {h.comment}
            </Typography>
          </Box>
        ))
      )}
    </GlassCard>
  );
}
