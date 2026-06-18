/**
 * KPIExplainabilityDrawer
 *
 * Universal right-side drawer attached to every KPI card. Resolves the Universal
 * Explainability Model live (authored catalog + live drilldown enrichment) and
 * surfaces it across six tabs: Formula, Contributors, Traceability, AI Analysis,
 * Recommendations and Trend.
 */
import { useEffect, useMemo, useState } from 'react';
import { Box, Drawer, IconButton, Tab, Tabs, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/theme';
import { useSimulation } from '../../context/SimulationContext';
import { getKpiExplainability } from '../../services/kpiExplainabilityEngine.js';
import { KPIFormulaPanel } from './KPIFormulaPanel.jsx';
import { KPIContributorsPanel } from './KPIContributorsPanel.jsx';
import { KPITraceabilityPanel } from './KPITraceabilityPanel.jsx';
import { KPIAiAnalysisPanel } from './KPIAiAnalysisPanel.jsx';
import { KPIRecommendationPanel } from './KPIRecommendationPanel.jsx';
import { KPITrendAnalysisPanel } from './KPITrendAnalysisPanel.jsx';
import { KPIChallengePanel } from './KPIChallengePanel.jsx';

const DRAWER_WIDTH = 420;

const TABS = [
  { label: 'Formula', render: (model) => <KPIFormulaPanel model={model} /> },
  { label: 'Contributors', render: (model) => <KPIContributorsPanel model={model} /> },
  { label: 'Traceability', render: (model) => <KPITraceabilityPanel model={model} /> },
  { label: 'AI Analysis', render: (model) => <KPIAiAnalysisPanel model={model} /> },
  { label: 'Recommendations', render: (model) => <KPIRecommendationPanel model={model} /> },
  { label: 'Trend', render: (model) => <KPITrendAnalysisPanel model={model} /> },
  { label: 'Challenge', render: (model) => <KPIChallengePanel model={model} /> },
];

export function KPIExplainabilityDrawer({ ctx, onClose }) {
  const { state } = useSimulation();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    setTab(0);
  }, [ctx]);

  const model = useMemo(() => (ctx ? getKpiExplainability(ctx, state) : null), [ctx, state]);
  const open = ctx !== null && ctx !== undefined;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: DRAWER_WIDTH,
            right: layout.aiAdvisorWidth,
            left: 'auto',
            background: `linear-gradient(180deg, ${colors.bg.tertiary} 0%, ${colors.bg.primary} 100%)`,
            borderLeft: `1px solid ${colors.border.subtle}`,
            boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
          },
        },
      }}
      ModalProps={{
        sx: { zIndex: 1190 },
        slotProps: { backdrop: { sx: { backgroundColor: 'rgba(4, 11, 31, 0.45)' } } },
      }}
      sx={{ '& .MuiDrawer-paper': { position: 'fixed', right: layout.aiAdvisorWidth } }}
    >
      {model && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${colors.border.subtle}`,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Explainability
                </Typography>
                <Box
                  sx={{
                    px: 0.6,
                    py: 0.05,
                    borderRadius: 0.75,
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    bgcolor: model.authored ? `${colors.success}22` : `${colors.info}22`,
                    color: model.authored ? colors.success : colors.info,
                  }}
                >
                  {model.authored ? 'Defensible' : 'Live-derived'}
                </Box>
                {model.confidence && (
                  <Box
                    sx={{
                      px: 0.6,
                      py: 0.05,
                      borderRadius: 0.75,
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      bgcolor: `${colors.success}22`,
                      color: colors.success,
                    }}
                  >
                    Confidence {model.confidence.score}%
                  </Box>
                )}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, mt: 0.25 }}>
                {model.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: colors.primary }}>
                  {model.value}
                </Typography>
                {model.suffix && (
                  <Typography variant="body2" color="text.secondary">
                    {model.suffix}
                  </Typography>
                )}
              </Box>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ color: colors.text.secondary }} aria-label="Close explainability">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Tabs
            value={tab}
            onChange={(_e, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 38,
              borderBottom: `1px solid ${colors.border.subtle}`,
              '& .MuiTab-root': {
                minHeight: 38,
                fontSize: '0.68rem',
                textTransform: 'none',
                fontWeight: 600,
                color: colors.text.muted,
                minWidth: 0,
                px: 1.25,
              },
              '& .Mui-selected': { color: `${colors.primary} !important` },
              '& .MuiTabs-indicator': { backgroundColor: colors.primary },
            }}
          >
            {TABS.map((t) => (
              <Tab key={t.label} label={t.label} />
            ))}
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>{TABS[tab].render(model)}</Box>

          <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>
              Sources: {(model.dataSources || []).join(' · ')}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.58rem', color: colors.text.muted, mt: 0.25 }}>
              Last updated: {model.lastUpdated}
            </Typography>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
