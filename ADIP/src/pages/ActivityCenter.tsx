import { useState } from 'react';
import { Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StreamIcon from '@mui/icons-material/Stream';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HubIcon from '@mui/icons-material/Hub';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { ActivityDashboardPanel } from '../components/activity/ActivityDashboardPanel';
import { ActivityStreamPanel } from '../components/activity/ActivityStreamPanel';
import { EventAnalyticsPanel } from '../components/activity/EventAnalyticsPanel';
import { EventSourcesPanel } from '../components/activity/EventSourcesPanel';
import { EventHistoryPanel } from '../components/activity/EventHistoryPanel';
import { EventLineagePanel } from '../components/activity/EventLineagePanel';
import { useEventBus } from '../context/EventContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessActivityCenter } from '../data/activityStreamEngine';
import { colors } from '../theme/colors';

type TabKey = 'dashboard' | 'stream' | 'analytics' | 'sources' | 'history' | 'lineage' | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Event Dashboard', icon: DashboardIcon },
  { key: 'stream', label: 'Activity Stream', icon: StreamIcon },
  { key: 'analytics', label: 'Event Analytics', icon: AnalyticsIcon },
  { key: 'sources', label: 'Event Sources', icon: HubIcon },
  { key: 'history', label: 'Event History', icon: HistoryIcon },
  { key: 'lineage', label: 'Event Lineage', icon: AccountTreeIcon },
  { key: 'reports', label: 'AI Reports', icon: DescriptionIcon },
];

interface ActivityCenterProps {
  initialTab?: TabKey;
}

export function ActivityCenter({ initialTab = 'dashboard' }: ActivityCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useEventBus();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessActivityCenter(personaId)) {
    return <Navigate to="/" replace />;
  }

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
                  display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.7, borderRadius: 1.5, cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                  color: active ? colors.text.primary : colors.text.secondary,
                  bgcolor: active ? `${colors.primary}1f` : 'transparent',
                  border: `1px solid ${active ? colors.primary : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.primary}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.primary : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <ActivityDashboardPanel />}
      {tab === 'stream' && <ActivityStreamPanel />}
      {tab === 'analytics' && <EventAnalyticsPanel />}
      {tab === 'sources' && <EventSourcesPanel />}
      {tab === 'history' && <EventHistoryPanel />}
      {tab === 'lineage' && <EventLineagePanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="activity-center" />}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Activity Center — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
