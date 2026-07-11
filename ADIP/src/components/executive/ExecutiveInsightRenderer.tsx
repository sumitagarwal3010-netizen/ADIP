import { Box, Typography, Chip } from '@mui/material';
import type { ReactNode } from 'react';
import type { ExecutiveInsight } from '../../types/executiveInsight';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: colors.secondary,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.62rem',
          display: 'block',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <Box>
      {items.map((item) => (
        <Typography
          key={item}
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: '0.72rem', display: 'block', pl: 1, lineHeight: 1.5, mb: 0.35 }}
        >
          • {item}
        </Typography>
      ))}
    </Box>
  );
}

function Paragraph({ text }: { text: string }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', lineHeight: 1.55 }}>
      {text}
    </Typography>
  );
}

export function ExecutiveInsightRenderer({ insight }: { insight: ExecutiveInsight }) {
  return (
    <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <ModuleHeader title={insight.prompt} subtitle="Deterministic CIO insight · local demo data" />
        <Chip
          label={`Confidence ${insight.confidenceScore}%`}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: `${colors.success}22`,
            color: colors.success,
            border: `1px solid ${colors.success}55`,
          }}
        />
      </Box>

      <Section title="Executive Summary">
        <Paragraph text={insight.executiveSummary} />
      </Section>
      <Section title="Key Risks">
        <BulletList items={insight.keyRisks} />
      </Section>
      <Section title="Business Impact">
        <Paragraph text={insight.businessImpact} />
      </Section>
      <Section title="Recommended Actions">
        <BulletList items={insight.recommendedActions} />
      </Section>
      <Section title="Decision Required">
        <Paragraph text={insight.decisionRequired} />
      </Section>
      <Section title="Financial Impact">
        <Paragraph text={insight.financialImpact} />
      </Section>
      <Section title="Owner / Timeline">
        <Paragraph text={insight.ownerTimeline} />
      </Section>
      <Section title="Confidence Score">
        <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text.primary }}>
          {insight.confidenceScore}%
        </Typography>
      </Section>
    </GlassCard>
  );
}
