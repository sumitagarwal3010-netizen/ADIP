import type { ReactElement } from 'react';
import { Box, Typography } from '@mui/material';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { colors } from '../theme/colors';
import { AIControlsModule, AIIncidentsModule, AIRiskModule, ModelInventoryModule, PromptGovernanceModule } from './aiGovernanceModules';

interface ComingSoonProps {
  title: string;
  hub: string;
}

const AI_GOVERNANCE_MODULES: Record<string, () => ReactElement> = {
  'Model Inventory': ModelInventoryModule,
  'AI Risk': AIRiskModule,
  'Prompt Governance': PromptGovernanceModule,
  'AI Controls': AIControlsModule,
  'AI Incidents': AIIncidentsModule,
};

export function ComingSoon({ title, hub }: ComingSoonProps) {
  const ModuleView = AI_GOVERNANCE_MODULES[title];
  if (ModuleView) {
    return <ModuleView />;
  }

  return (
    <Box>
      <GlassCard sx={{ p: 4, textAlign: 'center' }} glow="blue">
        <ModuleHeader title={title} subtitle={hub} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
          This module is part of the {hub} navigation structure and will be available in a future release.
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'inline-block',
            mt: 3,
            px: 2,
            py: 0.75,
            borderRadius: 1,
            bgcolor: `${colors.primary}18`,
            color: colors.primary,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Coming Soon
        </Typography>
      </GlassCard>
    </Box>
  );
}
