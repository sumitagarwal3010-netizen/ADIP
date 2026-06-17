import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import { colors } from '../../theme/colors';
import type { ApprovalStatus, Artifact, ArtifactFileType } from '../../types/artifacts';
import { downloadArtifactAs, FORMAT_LABEL, type ExportFormat } from '../../services/artifactExportService';

const fileIcons: Record<ArtifactFileType, typeof DescriptionIcon> = {
  docx: DescriptionIcon,
  xlsx: TableChartIcon,
  yaml: CodeIcon,
  png: ImageIcon,
};

const statusColors: Record<ApprovalStatus, string> = {
  Approved: colors.success,
  'Pending Review': colors.warning,
  Draft: colors.info,
  Rejected: colors.critical,
};

function SectionTitle({ children }: { children: string }) {
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
        mb: 0.75,
      }}
    >
      {children}
    </Typography>
  );
}

interface ArtifactViewerPanelProps {
  artifact: Artifact | null;
  open: boolean;
  onClose: () => void;
}

const FORMATS: ExportFormat[] = ['docx', 'pdf', 'xlsx', 'pptx', 'txt'];

export function ArtifactViewerPanel({ artifact, open, onClose }: ArtifactViewerPanelProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!artifact) return null;

  const statusColor = statusColors[artifact.approvalStatus];
  const FileIcon = fileIcons[artifact.fileType];
  const riskColor =
    artifact.riskRating === 'High' || artifact.riskRating === 'Critical'
      ? colors.critical
      : artifact.riskRating === 'Low'
        ? colors.success
        : colors.warning;

  const handleSelectFormat = async (format: ExportFormat) => {
    setAnchorEl(null);
    try {
      await downloadArtifactAs(artifact, format);
    } catch (e) {
      // The export service is fully synchronous client-side; failures here
      // are environmental (e.g. browser blocked the download). Logging is
      // sufficient for the demo build.
      console.error('Artifact download failed', e);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: `linear-gradient(180deg, ${colors.bg.tertiary} 0%, ${colors.bg.primary} 100%)`,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 2,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
          },
        },
        backdrop: { sx: { backgroundColor: 'rgba(4, 11, 31, 0.65)' } },
      }}
    >
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileIcon sx={{ color: colors.primary, fontSize: 22 }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
              Artifact Viewer
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
              {artifact.name}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ fontSize: '0.72rem', mr: 0.5 }}
          >
            Download
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {FORMATS.map((f) => (
              <MenuItem key={f} onClick={() => handleSelectFormat(f)} sx={{ fontSize: '0.78rem' }}>
                {FORMAT_LABEL[f]}
              </MenuItem>
            ))}
          </Menu>
          <IconButton size="small" onClick={onClose} sx={{ color: colors.text.secondary }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            mb: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: colors.bg.glass,
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Generated By</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{artifact.generatedBy}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Model</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{artifact.modelUsed}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Version</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>v{artifact.version}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Generated Date</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{artifact.generatedDate}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Timestamp</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{artifact.timestamp ?? artifact.generatedDate}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>Status</Typography>
            <Chip
              label={artifact.approvalStatus}
              size="small"
              sx={{
                mt: 0.25,
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: `${statusColor}22`,
                color: statusColor,
                border: `1px solid ${statusColor}44`,
              }}
            />
          </Box>
        </Box>

        {artifact.riskRating && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`Risk: ${artifact.riskRating}`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: `${riskColor}22`,
                color: riskColor,
                border: `1px solid ${riskColor}44`,
              }}
            />
          </Box>
        )}

        {artifact.executiveSummary && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              background: `linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)`,
              border: `1px solid ${colors.border.purple}`,
            }}
          >
            <SectionTitle>Executive Summary</SectionTitle>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.55, color: colors.text.secondary }}>
              {artifact.executiveSummary}
            </Typography>
          </Box>
        )}

        {artifact.sections?.map((section) => (
          <Box
            key={section.title}
            sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 1,
              bgcolor: colors.bg.glass,
              border: `1px solid ${colors.border.subtle}`,
            }}
          >
            <SectionTitle>{section.title}</SectionTitle>
            <Typography
              component="pre"
              sx={{
                fontFamily: 'inherit',
                fontSize: '0.75rem',
                lineHeight: 1.55,
                color: colors.text.secondary,
                whiteSpace: 'pre-wrap',
                m: 0,
              }}
            >
              {section.content}
            </Typography>
          </Box>
        ))}

        <SectionTitle>Full Document Preview</SectionTitle>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: colors.bg.glass,
            border: `1px solid ${colors.border.subtle}`,
            maxHeight: 280,
            overflow: 'auto',
          }}
        >
          <Typography
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              lineHeight: 1.5,
              color: colors.text.secondary,
              whiteSpace: 'pre-wrap',
              m: 0,
            }}
          >
            {artifact.previewContent}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
