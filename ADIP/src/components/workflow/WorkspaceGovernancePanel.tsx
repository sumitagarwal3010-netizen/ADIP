import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import type { WorkspaceGovernanceConfig } from '../../config/aiWorkspaceConfig';
import type { Artifact } from '../../types/artifacts';

interface WorkspaceGovernancePanelProps {
  governance: WorkspaceGovernanceConfig;
  artifacts: Artifact[];
  promptSummary: string;
  /** Executive ask-mode can show governance after analysis without artifacts. */
  showWithoutArtifacts?: boolean;
}

export function WorkspaceGovernancePanel({
  governance,
  artifacts,
  promptSummary,
  showWithoutArtifacts = false,
}: WorkspaceGovernancePanelProps) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (artifacts.length === 0 && !showWithoutArtifacts) return null;

  const allChecked = governance.checklist.every((item) => checked[item]);
  const checkedCount = governance.checklist.filter((item) => checked[item]).length;

  const toggleCheck = (item: string) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <GlassCard sx={{ p: 2 }} glow="green">
        <ModuleHeader
          title={governance.title}
          subtitle={governance.subtitle}
        />

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', display: 'block', mb: 1.5 }}>
          Intent: &ldquo;{promptSummary}&rdquo;
          {artifacts.length > 0 && ` · ${artifacts.length} artifact(s) ready for governance`}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
          {artifacts.map((a) => (
            <Chip
              key={a.id}
              label={a.name}
              size="small"
              sx={{ fontSize: '0.62rem', bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}
            />
          ))}
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            color: colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'block',
            mb: 0.75,
          }}
        >
          Governance checklist · {checkedCount}/{governance.checklist.length}
        </Typography>

        {governance.checklist.map((item) => {
          const done = !!checked[item];
          return (
            <Box
              key={item}
              role="button"
              tabIndex={0}
              onClick={() => toggleCheck(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCheck(item);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                py: 0.5,
                px: 0.75,
                borderRadius: 1,
                cursor: 'pointer',
                borderBottom: `1px solid ${colors.border.subtle}`,
                '&:hover': { bgcolor: `${colors.primary}08` },
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 14, color: done ? colors.success : colors.text.muted }} />
              <Typography variant="caption" sx={{ fontSize: '0.75rem', flex: 1, color: done ? colors.text.primary : colors.text.secondary }}>
                {item}
              </Typography>
              {done && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.success }}>Done</Typography>
              )}
            </Box>
          );
        })}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<SendIcon sx={{ fontSize: 16 }} />}
            disabled={!allChecked || submitted}
            onClick={() => setSubmitted(true)}
            sx={{ bgcolor: colors.success, fontSize: '0.75rem' }}
          >
            {submitted ? 'Submitted for Review' : 'Submit for Review'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<GavelIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate(governance.approvalRoute)}
            sx={{ fontSize: '0.75rem' }}
          >
            Open Approval Workflow
          </Button>
          <Button
            variant="text"
            startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/artifacts')}
            sx={{ fontSize: '0.75rem', color: colors.text.secondary }}
          >
            View in Artifact Repository
          </Button>
        </Box>

        {submitted && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.success, fontSize: '0.72rem' }}>
            Governance package submitted. Reviewers will be notified via the approval workflow.
          </Typography>
        )}
      </GlassCard>
    </Box>
  );
}
