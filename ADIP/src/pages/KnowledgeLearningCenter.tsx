import { useState } from 'react';
import { Box } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ShieldIcon from '@mui/icons-material/Shield';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import { Navigate } from 'react-router-dom';
import { GlassCard } from '../components/common/GlassCard';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { KnowledgeDashboardPanel } from '../components/knowledge/KnowledgeDashboardPanel';
import { LessonsLearnedPanel } from '../components/knowledge/LessonsLearnedPanel';
import { BestPracticesPanel } from '../components/knowledge/BestPracticesPanel';
import { ArchitecturePatternsPanel } from '../components/knowledge/ArchitecturePatternsPanel';
import { ReusableControlsPanel } from '../components/knowledge/ReusableControlsPanel';
import { RcaKnowledgePanel } from '../components/knowledge/RcaKnowledgePanel';
import { SdlcPlaybooksPanel } from '../components/knowledge/SdlcPlaybooksPanel';
import { SearchDiscoveryPanel } from '../components/knowledge/SearchDiscoveryPanel';
import { LearningRecommendationsPanel } from '../components/knowledge/LearningRecommendationsPanel';
import { useKnowledgeCenter } from '../context/KnowledgeCenterContext';
import { usePersona } from '../context/PersonaContext';
import { canAccessKnowledgeCenter } from '../data/knowledgeCenterEngine';
import { colors } from '../theme/colors';

type TabKey =
  | 'dashboard'
  | 'lessons'
  | 'best-practices'
  | 'patterns'
  | 'controls'
  | 'rca'
  | 'playbooks'
  | 'search'
  | 'recommendations'
  | 'reports';

const TABS: { key: TabKey; label: string; icon: typeof DashboardIcon }[] = [
  { key: 'dashboard', label: 'Knowledge Dashboard', icon: DashboardIcon },
  { key: 'lessons', label: 'Lessons Learned', icon: HistoryEduIcon },
  { key: 'best-practices', label: 'Best Practices', icon: LightbulbIcon },
  { key: 'patterns', label: 'Architecture Patterns', icon: AccountTreeIcon },
  { key: 'controls', label: 'Reusable Controls', icon: ShieldIcon },
  { key: 'rca', label: 'RCA Knowledge', icon: PsychologyIcon },
  { key: 'playbooks', label: 'SDLC Playbooks', icon: MenuBookOutlinedIcon },
  { key: 'search', label: 'Search & Discovery', icon: SearchIcon },
  { key: 'recommendations', label: 'Learning Recommendations', icon: SchoolIcon },
  { key: 'reports', label: 'AI Reports', icon: DescriptionIcon },
];

interface KnowledgeLearningCenterProps {
  initialTab?: TabKey;
}

export function KnowledgeLearningCenter({ initialTab = 'dashboard' }: KnowledgeLearningCenterProps) {
  const { personaId } = usePersona();
  const { execSummary } = useKnowledgeCenter();
  const [tab, setTab] = useState<TabKey>(initialTab);

  if (!canAccessKnowledgeCenter(personaId)) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <MenuBookIcon sx={{ color: colors.info, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Knowledge & Learning Center</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Every incident, audit finding, and copilot recommendation becomes reusable organizational knowledge
          </Box>
        </Box>
      </GlassCard>

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
                  bgcolor: active ? `${colors.info}1f` : 'transparent',
                  border: `1px solid ${active ? colors.info : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.info}12` },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.info : colors.text.muted }} />
                {t.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {tab === 'dashboard' && <KnowledgeDashboardPanel />}
      {tab === 'lessons' && <LessonsLearnedPanel />}
      {tab === 'best-practices' && <BestPracticesPanel />}
      {tab === 'patterns' && <ArchitecturePatternsPanel />}
      {tab === 'controls' && <ReusableControlsPanel />}
      {tab === 'rca' && <RcaKnowledgePanel />}
      {tab === 'playbooks' && <SdlcPlaybooksPanel />}
      {tab === 'search' && <SearchDiscoveryPanel />}
      {tab === 'recommendations' && <LearningRecommendationsPanel />}
      {tab === 'reports' && <HubArtifactGenerator hubKey="knowledge-center" />}

      {tab === 'dashboard' && (
        <Box sx={{ mt: 1.5 }}>
          <AIInsightBox title="Knowledge & Learning — Executive Summary" insight={execSummary} />
        </Box>
      )}
    </Box>
  );
}
