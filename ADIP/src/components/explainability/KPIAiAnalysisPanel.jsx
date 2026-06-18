/** Tab 4 — AI Analysis: why the score exists, confidence, risk drivers and generated insights. */
import { Box, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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
        mt: 2,
      }}
    >
      {children}
    </Typography>
  );
}

function ConfidenceBar({ label, value }) {
  return (
    <Box sx={{ mb: 0.6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
        <Typography variant="caption" sx={{ fontSize: '0.64rem', color: colors.text.secondary }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '0.64rem', fontWeight: 700 }}>
          {value}%
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: 3, bgcolor: colors.bg.primary, overflow: 'hidden' }}>
        <Box sx={{ width: `${value}%`, height: '100%', bgcolor: colors.success, borderRadius: 3 }} />
      </Box>
    </Box>
  );
}

export function KPIAiAnalysisPanel({ model }) {
  if (!model) return null;
  const ai = model.aiReasoning || {};
  const conf = model.confidence || null;
  const confidence = conf ? conf.score : typeof ai.confidence === 'number' ? ai.confidence : null;

  return (
    <Box>
      {model.aiNarrative && (
        <>
          <SectionLabel>AI Generated Narrative</SectionLabel>
          <Box sx={{ p: 1.25, mb: 0.5, borderRadius: 1, bgcolor: `${colors.secondary}14`, border: `1px solid ${colors.border.purple}` }}>
            <Typography variant="body2" sx={{ fontSize: '0.76rem', whiteSpace: 'pre-line', lineHeight: 1.55 }}>
              {model.aiNarrative}
            </Typography>
          </Box>
        </>
      )}

      {confidence !== null && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mt: 2,
            p: 1.25,
            borderRadius: 1,
            bgcolor: `${colors.secondary}14`,
            border: `1px solid ${colors.border.purple}`,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 20, color: colors.secondary }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Confidence
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: colors.bg.primary, overflow: 'hidden' }}>
                <Box sx={{ width: `${confidence}%`, height: '100%', bgcolor: colors.secondary, borderRadius: 3 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: colors.secondary }}>
                {confidence}%
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {conf && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.text.muted, display: 'block', mb: 0.6 }}>
            Confidence is based on:
          </Typography>
          <ConfidenceBar label="Source Coverage" value={conf.sourceCoverage} />
          <ConfidenceBar label="Data Freshness" value={conf.dataFreshness} />
          <ConfidenceBar label="Sample Size" value={conf.sampleSize} />
          <ConfidenceBar label="Completeness" value={conf.completeness} />
        </Box>
      )}

      {conf && Array.isArray(conf.evidenceMix) && conf.evidenceMix.length > 0 && (
        <>
          <SectionLabel>Confidence Breakdown · Evidence Type</SectionLabel>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.text.muted, display: 'block', mb: 0.6 }}>
            Share of the score backed by each grade of evidence.
          </Typography>
          {conf.evidenceMix.map((e) => (
            <Box key={e.type} sx={{ mb: 0.7 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
                <Typography variant="caption" sx={{ fontSize: '0.64rem', color: colors.text.secondary }}>
                  {e.type}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.64rem', fontWeight: 700 }}>
                  {e.pct}%
                </Typography>
              </Box>
              <Box sx={{ height: 5, borderRadius: 3, bgcolor: colors.bg.primary, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${e.pct}%`,
                    height: '100%',
                    borderRadius: 3,
                    bgcolor: /ai-derived/i.test(e.type) ? colors.warning : /manual/i.test(e.type) ? colors.info : colors.secondary,
                  }}
                />
              </Box>
              {e.note && (
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.text.muted, display: 'block', mt: 0.1 }}>
                  {e.note}
                </Typography>
              )}
            </Box>
          ))}
        </>
      )}

      {Array.isArray(model.sampleSize) && model.sampleSize.length > 0 && (
        <>
          <SectionLabel>Sample Size</SectionLabel>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {model.sampleSize.map((s) => (
              <Box key={s.label} sx={{ flex: '1 1 30%', p: 0.75, borderRadius: 0.75, bgcolor: colors.bg.glass, textAlign: 'center', border: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.82rem' }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.text.muted, lineHeight: 1.2, display: 'block' }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {ai.drivers && ai.drivers.length > 0 && (
        <>
          <SectionLabel>Why this score exists</SectionLabel>
          <Box component="ul" sx={{ m: 0, pl: 2, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {ai.drivers.map((d, i) => (
              <Typography key={i} component="li" variant="body2" sx={{ fontSize: '0.76rem', color: colors.text.secondary, lineHeight: 1.5 }}>
                {d}
              </Typography>
            ))}
          </Box>
        </>
      )}

      {ai.insights && ai.insights.length > 0 && (
        <>
          <SectionLabel>Generated Insights</SectionLabel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {ai.insights.map((line, i) => (
              <Typography
                key={i}
                variant="body2"
                sx={{
                  fontSize: '0.76rem',
                  color: colors.text.secondary,
                  lineHeight: 1.5,
                  pl: 1,
                  borderLeft: `2px solid ${colors.border.purple}`,
                }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
