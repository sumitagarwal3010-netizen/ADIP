import { useState } from 'react';
import { Box, Chip, MenuItem, Select, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useEventBus } from '../../context/EventContext';
import { WORKFLOWS } from '../../data/activityCenterMock';
import { colors } from '../../theme/colors';
import type { EventLineageNode } from '../../types/events';

const KIND_COLOR: Record<EventLineageNode['kind'], string> = {
  workflow: colors.primary,
  event: colors.info,
  notification: colors.warning,
  'audit-finding': colors.critical,
  'audit-observation': colors.secondary,
  evidence: colors.success,
};

const KIND_LABEL: Record<EventLineageNode['kind'], string> = {
  workflow: 'Workflow',
  event: 'Event',
  notification: 'Notification',
  'audit-finding': 'Audit Finding',
  'audit-observation': 'Observation',
  evidence: 'Evidence',
};

export function EventLineagePanel() {
  const { getLineage } = useEventBus();
  const [workflowId, setWorkflowId] = useState(WORKFLOWS[0]);
  const chain = getLineage(workflowId);

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader
        title="Event Lineage"
        subtitle="Workflow → Events → Notifications → Audit Records"
      />
      <Box sx={{ mb: 1.5 }}>
        <Select
          size="small"
          value={workflowId}
          onChange={(e) => setWorkflowId(e.target.value)}
          sx={{ fontSize: '0.72rem', minWidth: 240 }}
        >
          {WORKFLOWS.map((w) => (
            <MenuItem key={w} value={w} sx={{ fontSize: '0.72rem' }}>{w} — {chain.workflowTitle}</MenuItem>
          ))}
        </Select>
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mb: 1, color: colors.text.secondary }}>
        {chain.workflowTitle} · {chain.nodes.length} lineage nodes
      </Typography>
      {chain.nodes.map((node, i) => (
        <Box
          key={`${node.kind}-${node.id}-${i}`}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            py: 0.75,
            pl: node.kind === 'workflow' ? 0 : 2,
            borderLeft: node.kind !== 'workflow' ? `2px solid ${colors.border.subtle}` : 'none',
            ml: node.kind !== 'workflow' ? 1 : 0,
          }}
        >
          <Chip
            label={KIND_LABEL[node.kind]}
            size="small"
            sx={{ height: 18, fontSize: '0.52rem', color: KIND_COLOR[node.kind], minWidth: 90 }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>
              {node.id} — {node.label}
            </Typography>
            {node.timestamp && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.58rem' }}>
                {new Date(node.timestamp).toLocaleString()}
                {node.severity ? ` · ${node.severity}` : ''}
                {node.status ? ` · ${node.status}` : ''}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </GlassCard>
  );
}
