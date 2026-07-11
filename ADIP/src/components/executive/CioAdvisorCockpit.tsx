import { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { CioAdvisorKind } from '../../types/executiveInsight';
import { CIO_ADVISOR_PROMPTS, getCioInsight } from '../../data/executiveCioInsights';
import { ExecutiveInsightRenderer } from './ExecutiveInsightRenderer';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';

const ADVISOR_META: Record<CioAdvisorKind, { title: string; subtitle: string }> = {
  executive: {
    title: 'Executive Advisor',
    subtitle: 'CIO daily briefing · delivery risk · incidents · regulatory · actions',
  },
  technology: {
    title: 'Technology Advisor',
    subtitle: 'Modernization · cloud order · debt · obsolescence · architecture · platforms',
  },
  investment: {
    title: 'Investment Advisor',
    subtitle: 'ROI · budget risk · cost · vendors · roadmap · 3-year plan',
  },
};

interface CioAdvisorCockpitProps {
  advisor: CioAdvisorKind;
  /** Optional default prompt id to pre-select (e.g. cio-briefing). */
  defaultPromptId?: string;
}

export function CioAdvisorCockpit({ advisor, defaultPromptId }: CioAdvisorCockpitProps) {
  const prompts = CIO_ADVISOR_PROMPTS[advisor];
  const meta = ADVISOR_META[advisor];
  const initial = defaultPromptId && prompts.some((p) => p.id === defaultPromptId)
    ? defaultPromptId
    : undefined;
  const [activeId, setActiveId] = useState<string | undefined>(initial);
  const insight = activeId ? getCioInsight(activeId) : undefined;

  return (
    <Box>
      <GlassCard sx={{ p: 2 }} glow="purple" hover={false}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: colors.secondary }} />
          <ModuleHeader title={meta.title} subtitle={meta.subtitle} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            mb: 0.75,
          }}
        >
          Prompt chips
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {prompts.map((p) => {
            const selected = p.id === activeId;
            return (
              <Chip
                key={p.id}
                label={p.label}
                size="small"
                onClick={() => setActiveId(p.id)}
                sx={{
                  fontSize: '0.65rem',
                  bgcolor: selected ? `${colors.secondary}28` : colors.bg.glass,
                  border: `1px solid ${selected ? colors.secondary : colors.border.subtle}`,
                  color: selected ? colors.text.primary : colors.text.secondary,
                  fontWeight: selected ? 700 : 500,
                  cursor: 'pointer',
                  '&:hover': { borderColor: colors.secondary, color: colors.secondary },
                }}
              />
            );
          })}
        </Box>
      </GlassCard>

      {insight ? (
        <ExecutiveInsightRenderer insight={insight} />
      ) : (
        <GlassCard sx={{ p: 2, mt: 1.5 }} hover={false}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Select a prompt chip to generate a deterministic CIO-level insight. No LLM or network calls — local demo data only.
          </Typography>
        </GlassCard>
      )}
    </Box>
  );
}
