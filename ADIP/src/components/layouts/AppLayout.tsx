import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AIAdvisor } from './AIAdvisor';
import { KpiDrilldownDrawer } from '../common/KpiDrilldownDrawer';
import { ExecutiveSummaryDrawer } from '../common/ExecutiveSummaryDrawer';
import { PageTransition } from './PageTransition';
import { layout } from '../../theme/theme';
import { colors } from '../../theme/colors';
import { useSimulation } from '../../context/SimulationContext';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/portfolio-health': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/program-status': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/strategic-risks': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/executive-summary': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/executive/board-reporting': { title: 'Executive Control Tower', subtitle: 'Live banking operations intelligence' },
  '/delivery': { title: 'Delivery Intelligence', subtitle: 'SDLC pipeline & change metrics' },
  '/requirements': { title: 'Requirements Intelligence Hub', subtitle: 'AI-powered requirement analysis' },
  '/architecture': { title: 'Architecture Intelligence Hub', subtitle: 'Dependency mapping & readiness' },
  '/development': { title: 'Development Intelligence Hub', subtitle: 'Code quality & engineering metrics' },
  '/testing': { title: 'Testing Intelligence Hub', subtitle: 'Coverage, automation & optimization' },
  '/release': { title: 'Release Intelligence Center', subtitle: 'Readiness assessment & go/no-go' },
  '/production': { title: 'Production Intelligence Center', subtitle: 'Availability, incidents & RCA' },
  '/operations': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/operations/incidents': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/operations/availability': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/operations/capacity': { title: 'Operations Intelligence Center', subtitle: 'Capacity, batch & operational health' },
  '/governance': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/governance/compliance': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/governance/risk': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/governance/evidence': { title: 'Governance Intelligence Center', subtitle: 'Security, compliance & audit' },
  '/ai-governance': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/model-inventory': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/prompt-governance': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/ai-risk': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/ai-controls': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/ai-governance/ai-incidents': { title: 'AI Governance Hub', subtitle: 'AI use case registry & model oversight' },
  '/traceability': { title: 'AI SDLC Traceability Center', subtitle: 'End-to-end lineage from requirement to compliance' },
  '/traceability/matrix': { title: 'AI SDLC Traceability Center', subtitle: 'Requirement traceability matrix' },
  '/traceability/ai': { title: 'AI SDLC Traceability Center', subtitle: 'AI lifecycle traceability' },
  '/traceability/impact': { title: 'AI SDLC Traceability Center', subtitle: 'Impact analysis' },
  '/traceability/executive': { title: 'AI SDLC Traceability Center', subtitle: 'Executive traceability view' },
  '/traceability/reports': { title: 'AI SDLC Traceability Center', subtitle: 'AI-generated traceability reports' },
  '/learning': { title: 'Continuous Learning Hub', subtitle: 'Knowledge base & lessons learned' },
  '/knowledge/best-practices': { title: 'Continuous Learning Hub', subtitle: 'Knowledge base & lessons learned' },
  '/knowledge/reusable-assets': { title: 'Continuous Learning Hub', subtitle: 'Knowledge base & lessons learned' },
  '/knowledge/lessons-learned': { title: 'Continuous Learning Hub', subtitle: 'Knowledge base & lessons learned' },
  '/reports': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/reports/compliance': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/reports/audit': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/reports/trends': { title: 'Enterprise Reports', subtitle: 'Executive scorecards & analytics' },
  '/administration': { title: 'Platform Administration', subtitle: 'Configuration & access management' },
};

export function AppLayout() {
  const location = useLocation();
  const { state } = useSimulation();
  const meta = pageMeta[location.pathname] || { title: 'ADIP', subtitle: '' };
  const opsStatus = state.operations.operationalHealth >= 85 ? 'Healthy' : 'Attention';
  const statusColor = opsStatus === 'Healthy' ? colors.success : colors.warning;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <TopBar title={meta.title} subtitle={meta.subtitle} />
      <AIAdvisor />
      <KpiDrilldownDrawer />
      <ExecutiveSummaryDrawer />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${layout.sidebarWidth}px`,
          mr: `${layout.aiAdvisorWidth}px`,
          mt: `${layout.topBarHeight}px`,
          p: 2,
          pb: 6,
          minHeight: `calc(100vh - ${layout.topBarHeight}px)`,
        }}
      >
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: layout.sidebarWidth,
          right: layout.aiAdvisorWidth,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          bgcolor: 'rgba(4, 11, 31, 0.9)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${colors.border.subtle}`,
          zIndex: 1000,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
            <Box component="span" sx={{ fontSize: '0.7rem', color: colors.text.secondary }}>
              Operations: {opsStatus} · {state.executive.openIncidents} incidents
            </Box>
          </Box>
          <Box component="span" sx={{ fontSize: '0.7rem', color: colors.text.muted }}>
            Last sync: {new Date(state.lastUpdated).toLocaleTimeString()}
          </Box>
        </Box>
        <Box component="span" sx={{ fontSize: '0.7rem', color: colors.success, fontWeight: 600 }}>
          Portfolio Health {state.executive.portfolioHealth}% · UPI Release 24.6
        </Box>
      </Box>
    </Box>
  );
}
