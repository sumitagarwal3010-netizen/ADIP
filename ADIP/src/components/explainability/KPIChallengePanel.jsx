/**
 * Tab 7 — Executive Challenge Mode.
 *
 * Lets any executive interrogate the KPI ("Why is this 85%? Which apps reduced
 * it? Show the evidence.") and get a generated, evidence-backed answer. Preset
 * challenges cover the questions executives ask most; free-text is matched to
 * the closest preset by `answerKpiChallenge`.
 */
import { useEffect, useState } from 'react';
import { Box, Chip, IconButton, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { colors } from '../../theme/colors';
import { answerKpiChallenge } from '../../services/kpiExplainabilityEngine.js';

export function KPIChallengePanel({ model }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    setQuery('');
    setAnswer(null);
  }, [model?.id]);

  if (!model) return null;
  const presets = model.challenges || [];

  const ask = (q) => {
    if (!q || !q.trim()) return;
    setAnswer(answerKpiChallenge(model, q));
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.72rem', display: 'block', mb: 1 }}>
        Challenge this number. Pick a question or ask your own — every answer is grounded in the formula, contributors and evidence.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.25 }}>
        {presets.map((p) => (
          <Chip
            key={p.id}
            label={p.question}
            size="small"
            onClick={() => {
              setQuery(p.question);
              setAnswer(p.answer);
            }}
            sx={{
              fontSize: '0.62rem',
              height: 'auto',
              py: 0.4,
              '& .MuiChip-label': { whiteSpace: 'normal', display: 'block', lineHeight: 1.3 },
              bgcolor: colors.bg.glass,
              border: `1px solid ${colors.border.subtle}`,
              '&:hover': { bgcolor: colors.bg.cardHover, borderColor: colors.border.glow },
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask: Why is this 85%? Which apps reduced it?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') ask(query);
          }}
          slotProps={{ input: { sx: { fontSize: '0.72rem' } } }}
        />
        <IconButton size="small" onClick={() => ask(query)} sx={{ color: colors.primary }} aria-label="Ask">
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>

      {answer && (
        <Box sx={{ mt: 1.25, p: 1.25, borderRadius: 1, bgcolor: `${colors.secondary}14`, border: `1px solid ${colors.border.purple}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <AutoAwesomeIcon sx={{ fontSize: 13, color: colors.secondary }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary, fontSize: '0.62rem', textTransform: 'uppercase' }}>
              AI Answer
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.76rem', whiteSpace: 'pre-line', lineHeight: 1.55 }}>
            {answer}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
