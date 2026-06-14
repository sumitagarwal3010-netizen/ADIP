import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableChartIcon from '@mui/icons-material/TableChart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HubIcon from '@mui/icons-material/Hub';
import InsightsIcon from '@mui/icons-material/Insights';
import DescriptionIcon from '@mui/icons-material/Description';
import { GlassCard } from '../components/common/GlassCard';
import { TraceabilityDashboard } from '../components/traceability/TraceabilityDashboard';
import { RequirementTraceabilityMatrix } from '../components/traceability/RequirementTraceabilityMatrix';
import { AiTraceability } from '../components/traceability/AiTraceability';
import { ImpactAnalysis } from '../components/traceability/ImpactAnalysis';
import { TraceabilityExecutiveView } from '../components/traceability/TraceabilityExecutiveView';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TimelineIcon from '@mui/icons-material/Timeline';
import { ApprovalTraceabilityPanel } from '../components/approval/ApprovalTraceabilityPanel';
import { WorkflowLifecyclePanel } from '../components/traceability/WorkflowLifecyclePanel';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import StreamIcon from '@mui/icons-material/Stream';
import { AuditEvidenceLineagePanel } from '../components/audit/AuditEvidenceLineagePanel';
import { EventLineagePanel } from '../components/activity/EventLineagePanel';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { colors } from '../theme/colors';
import type { TraceNode } from '../data/traceabilityModel';

type TabKey = 'dashboard' | 'rtm' | 'ai' | 'impact' | 'executive' | 'lifecycle' | 'approvals' | 'evidence' | 'events' | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof AccountTreeIcon }[] = [
  { key: 'dashboard', label: 'Lineage Dashboard', icon: AccountTreeIcon },
  { key: 'rtm', label: 'Requirement Matrix', icon: TableChartIcon },
  { key: 'ai', label: 'AI Traceability', icon: PsychologyIcon },
  { key: 'impact', label: 'Impact Analysis', icon: HubIcon },
  { key: 'executive', label: 'Executive View', icon: InsightsIcon },
  { key: 'lifecycle', label: 'Workflow Lifecycle', icon: TimelineIcon },
  { key: 'approvals', label: 'Approval Lineage', icon: AssignmentTurnedInIcon },
  { key: 'evidence', label: 'Evidence Lineage', icon: FolderSharedIcon },
  { key: 'events', label: 'Event Lineage', icon: StreamIcon },
  { key: 'reports', label: 'AI Reports', icon: DescriptionIcon },
];

interface TraceabilityCenterProps {
  initialTab?: TabKey;
}

export function TraceabilityCenter({ initialTab = 'dashboard' }: TraceabilityCenterProps) {
  const [searchParams] = useSearchParams();
  const nodeParam = searchParams.get('node') ?? undefined;
  const [tab, setTab] = useState<TabKey>(nodeParam ? 'impact' : initialTab);
  const [selectedId, setSelectedId] = useState<string | undefined>(nodeParam);

  // Clicking any artifact anywhere jumps to Impact Analysis with it selected.
  const handleSelectNode = (node: TraceNode) => {
    setSelectedId(node.id);
    setTab('impact');
  };
  const handleSelectId = (id: string) => {
    setSelectedId(id);
    setTab('impact');
  };

  return (
    <Box>
      <GlassCard sx={{ p: 1, mb: 1.5 }} hover={false}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {TABS.map((t) => {
            const active = t.key === tab;
            const Icon = t.icon;
            return (
              <Box
                key={t.key}
                role="button"
                tabIndex={0}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(t.key); } }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? colors.text.primary : colors.text.secondary,
                  bgcolor: active ? `${colors.primary}1f` : 'transparent',
                  border: `1px solid ${active ? colors.primary : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.primary}12` },
                  '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 1 },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.primary : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <TraceabilityDashboard onSelectNode={handleSelectNode} />}
      {tab === 'rtm' && <RequirementTraceabilityMatrix onSelectNode={handleSelectNode} />}
      {tab === 'ai' && <AiTraceability onSelectNode={handleSelectNode} />}
      {tab === 'impact' && <ImpactAnalysis selectedId={selectedId} onSelectNode={(n) => setSelectedId(n.id)} />}
      {tab === 'executive' && <TraceabilityExecutiveView onSelectNode={handleSelectId} />}
      {tab === 'lifecycle' && <WorkflowLifecyclePanel />}
      {tab === 'approvals' && <ApprovalTraceabilityPanel />}
      {tab === 'evidence' && <AuditEvidenceLineagePanel />}
      {tab === 'events' && <EventLineagePanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="traceability" />}
    </Box>
  );
}
