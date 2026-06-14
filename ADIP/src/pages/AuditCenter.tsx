import { useState } from 'react';
import { Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import TimelineIcon from '@mui/icons-material/Timeline';
import PolicyIcon from '@mui/icons-material/Policy';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { GlassCard } from '../components/common/GlassCard';
import { AuditDashboardPanel } from '../components/audit/AuditDashboardPanel';
import { AuditFindingsPanel } from '../components/audit/AuditFindingsPanel';
import { AuditObservationsPanel } from '../components/audit/AuditObservationsPanel';
import { EvidenceRepositoryPanel } from '../components/audit/EvidenceRepositoryPanel';
import { AuditTimelinePanel } from '../components/audit/AuditTimelinePanel';
import { ComplianceStatusPanel } from '../components/audit/ComplianceStatusPanel';
import { AuditReadinessPanel } from '../components/audit/AuditReadinessPanel';
import { AuditEvidenceLineagePanel } from '../components/audit/AuditEvidenceLineagePanel';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'findings'
  | 'observations'
  | 'evidence'
  | 'timeline'
  | 'compliance'
  | 'readiness'
  | 'lineage'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Audit Dashboard', icon: DashboardIcon },
  { key: 'findings', label: 'Audit Findings', icon: BugReportIcon },
  { key: 'observations', label: 'Observations', icon: VisibilityIcon },
  { key: 'evidence', label: 'Evidence Repository', icon: FolderSharedIcon },
  { key: 'timeline', label: 'Audit Timeline', icon: TimelineIcon },
  { key: 'compliance', label: 'Compliance Status', icon: PolicyIcon },
  { key: 'readiness', label: 'Audit Readiness', icon: FactCheckIcon },
  { key: 'lineage', label: 'Evidence Lineage', icon: AccountTreeIcon },
  { key: 'reports', label: 'AI Reports', icon: DescriptionIcon },
];

interface AuditCenterProps {
  initialTab?: TabKey;
}

export function AuditCenter({ initialTab = 'dashboard' }: AuditCenterProps) {
  const [tab, setTab] = useState<TabKey>(initialTab);

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

      {tab === 'dashboard' && <AuditDashboardPanel />}
      {tab === 'findings' && <AuditFindingsPanel />}
      {tab === 'observations' && <AuditObservationsPanel />}
      {tab === 'evidence' && <EvidenceRepositoryPanel />}
      {tab === 'timeline' && <AuditTimelinePanel />}
      {tab === 'compliance' && <ComplianceStatusPanel />}
      {tab === 'readiness' && <AuditReadinessPanel />}
      {tab === 'lineage' && <AuditEvidenceLineagePanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="audit-center" />}
    </Box>
  );
}
