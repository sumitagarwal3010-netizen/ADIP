/** Tab 3 — Traceability: data lineage, evidence chain, audit trail and KPI registry. */
import { Box, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { colors } from '../../theme/colors';

function SectionLabel({ children }) {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        color: colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontSize: '0.65rem',
        display: 'block',
        mb: 1,
        mt: 2.5,
      }}
    >
      {children}
    </Typography>
  );
}

function KeyValueRow({ k, v }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.4, borderBottom: `1px solid ${colors.border.subtle}` }}>
      <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.66rem' }}>
        {k}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.66rem', textAlign: 'right' }}>
        {v}
      </Typography>
    </Box>
  );
}

export function KPITraceabilityPanel({ model }) {
  if (!model) return null;
  const lineage = model.traceability || [];
  const chain = model.lineageChain || [];
  const evidence = model.evidenceChain || [];
  const audit = model.audit || null;
  const registry = model.registry || null;

  return (
    <Box>
      {chain.length > 0 && (
        <>
          <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.65rem', display: 'block', mb: 1 }}>
            Evidence Chain
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', mb: 1 }}>
            {chain.map((node, i) => (
              <Box key={node.stage}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 0.75, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${i === chain.length - 1 ? colors.border.glow : colors.border.subtle}` }}>
                  <Box sx={{ px: 0.6, py: 0.1, borderRadius: 0.75, bgcolor: `${colors.secondary}22`, color: colors.secondary, fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', minWidth: 72, textAlign: 'center' }}>
                    {node.stage}
                  </Box>
                  <Typography variant="caption" sx={{ fontSize: '0.64rem', color: colors.text.secondary, lineHeight: 1.35 }}>
                    {node.detail}
                  </Typography>
                </Box>
                {i < chain.length - 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.1 }}>
                    <ArrowDownwardIcon sx={{ fontSize: 13, color: colors.secondary }} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
      {lineage.length > 0 ? (
        <>
          <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.72rem', display: 'block', mb: 1.5 }}>
            Derived from the following lineage. Each stage feeds the next, ending in the executive KPI.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {lineage.map((node, i) => (
              <Box key={`${node.stage}-${i}`}>
                <Box
                  role="button"
                  tabIndex={0}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: i === lineage.length - 1 ? `${colors.primary}14` : colors.bg.glass,
                    border: `1px solid ${i === lineage.length - 1 ? colors.border.glow : colors.border.subtle}`,
                    cursor: 'pointer',
                    transition: 'border-color 150ms, background 150ms',
                    '&:hover': { borderColor: colors.border.glow, bgcolor: colors.bg.cardHover },
                    '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 2 },
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 700, color: colors.text.primary }}>
                    {node.stage}
                  </Typography>
                  {node.description && (
                    <Typography variant="caption" sx={{ fontSize: '0.66rem', color: colors.text.muted, display: 'block', mt: 0.25 }}>
                      {node.description}
                    </Typography>
                  )}
                </Box>
                {i < lineage.length - 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
                    <ArrowDownwardIcon sx={{ fontSize: 16, color: colors.secondary }} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>
          No staged lineage resolved; evidence and audit trail are shown below.
        </Typography>
      )}

      {evidence.length > 0 && (
        <>
          <SectionLabel>Evidence Records</SectionLabel>
          {evidence.map((e) => (
            <Box key={e.evidenceRecord} sx={{ p: 0.75, mb: 0.4, borderRadius: 0.75, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                  {e.metric}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.info }}>
                  {e.evidenceRecord}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>
                {e.sourceSystem} · {e.timestamp}
              </Typography>
            </Box>
          ))}
        </>
      )}

      {registry && (
        <>
          <SectionLabel>KPI Registry Metadata</SectionLabel>
          <KeyValueRow k="KPI ID" v={registry.kpiId} />
          <KeyValueRow k="KPI Owner" v={registry.owner} />
          <KeyValueRow k="Business Owner" v={registry.businessOwner} />
          <KeyValueRow k="Formula Definition" v={registry.formulaDefinition} />
          <KeyValueRow k="Threshold Definition" v={registry.thresholdDefinition} />
          <KeyValueRow k="Review Frequency" v={registry.reviewFrequency} />
          <KeyValueRow k="Governance Status" v={registry.governanceStatus} />
          <KeyValueRow k="Refresh Frequency" v={registry.refreshFrequency} />
          <KeyValueRow k="Confidence Method" v={registry.confidenceMethod} />
          <KeyValueRow k="Explainability Method" v={registry.explainabilityMethod} />
          <KeyValueRow k="Evidence Mapping" v={registry.evidenceMapping} />
          <KeyValueRow k="Version" v={registry.version} />
        </>
      )}

      {audit && (
        <>
          <SectionLabel>Audit Traceability</SectionLabel>
          <KeyValueRow k="Generated By" v={audit.generatedBy} />
          <KeyValueRow k="Generated On" v={audit.generatedOn} />
          <KeyValueRow k="Data Source" v={audit.dataSource} />
          <KeyValueRow k="Formula Version" v={audit.formulaVersion} />
          <KeyValueRow k="Last Recalculation" v={audit.lastRecalculation} />
          <KeyValueRow k="Calculation Run ID" v={audit.calculationRunId} />
          <KeyValueRow k="Data Snapshot ID" v={audit.dataSnapshotId} />
          <KeyValueRow k="AI Model Version" v={audit.aiModelVersion} />
        </>
      )}

      {audit && Array.isArray(audit.changeHistory) && audit.changeHistory.length > 0 && (
        <>
          <SectionLabel>Change History</SectionLabel>
          {audit.changeHistory.map((c) => (
            <Box key={`${c.date}-${c.version}`} sx={{ display: 'flex', gap: 1, py: 0.4, borderBottom: `1px solid ${colors.border.subtle}` }}>
              <Box sx={{ minWidth: 64 }}>
                <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.text.secondary, display: 'block' }}>
                  {c.date}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.info }}>
                  {c.version}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.64rem', color: colors.text.muted, lineHeight: 1.35 }}>
                {c.change}
              </Typography>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}
