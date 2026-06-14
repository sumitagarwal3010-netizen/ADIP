import { useState } from 'react';
import { Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InboxIcon from '@mui/icons-material/Inbox';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import { GlassCard } from '../components/common/GlassCard';
import { NotificationDashboardPanel } from '../components/notification/NotificationDashboardPanel';
import { NotificationInboxPanel } from '../components/notification/NotificationInboxPanel';
import { EscalationQueuePanel } from '../components/notification/EscalationQueuePanel';
import { DeliveryStatusPanel } from '../components/notification/DeliveryStatusPanel';
import { AlertHistoryPanel } from '../components/notification/AlertHistoryPanel';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { colors } from '../theme/colors';

type TabKey = 'dashboard' | 'inbox' | 'escalations' | 'delivery' | 'history' | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Notification Dashboard', icon: DashboardIcon },
  { key: 'inbox', label: 'Notification Inbox', icon: InboxIcon },
  { key: 'escalations', label: 'Escalation Queue', icon: TrendingUpIcon },
  { key: 'delivery', label: 'Delivery Status', icon: SendIcon },
  { key: 'history', label: 'Alert History', icon: HistoryIcon },
  { key: 'reports', label: 'AI Reports', icon: DescriptionIcon },
];

interface NotificationCenterProps {
  initialTab?: TabKey;
}

export function NotificationCenter({ initialTab = 'dashboard' }: NotificationCenterProps) {
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

      {tab === 'dashboard' && <NotificationDashboardPanel />}
      {tab === 'inbox' && <NotificationInboxPanel />}
      {tab === 'escalations' && <EscalationQueuePanel />}
      {tab === 'delivery' && <DeliveryStatusPanel />}
      {tab === 'history' && <AlertHistoryPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="notification-center" />}
    </Box>
  );
}
