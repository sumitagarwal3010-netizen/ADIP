import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { ArtifactRepositoryPanel } from './ArtifactRepositoryPanel';
import { ArtifactViewerPanel } from './ArtifactViewerPanel';
import { ApprovalActionDialog } from '../approval/ApprovalActionDialog';
import { colors } from '../../theme/colors';
import type { Artifact, ApprovalStatus } from '../../types/artifacts';
import type { ApprovalRequest, ApprovalWorkflowAction } from '../../data/approvalWorkflowEngine';
import { useArtifactsRegistry } from '../../context/ArtifactsContext';
import { useAIAdvisor } from '../../context/AIAdvisorContext';
import {
  generateDeterministicArtifacts,
  getPageById,
  getPageByPillarAndSubmenu,
  getPageByRoute,
  getPromptsForPage,
  type PageMetadataEntry,
  type Pillar,
  type PromptDefinition,
} from '../../data/enterpriseArtifactCatalog';

export interface EnterpriseArtifactWorkspaceProps {
  /** Lookup by stable page id (e.g. PAGE-EXE-ADV). */
  pageId?: string;
  /** Lookup by pillar + submenu label when pageId omitted. */
  pillar?: Pillar;
  submenu?: string;
}

function toApprovalRequest(artifact: Artifact): ApprovalRequest {
  return {
    id: artifact.id,
    title: artifact.name,
    itemType: 'Deterministic Artifact',
    stage: 'Governance',
    domain: 'Enterprise AI',
    submitter: artifact.generatedBy,
    assignedReviewer: 'CIO Chief of Staff',
    status: artifact.approvalStatus === 'Approved'
      ? 'Approved'
      : artifact.approvalStatus === 'Rejected'
        ? 'Rejected'
        : 'Under Review',
    priority: 'medium',
    submittedAt: artifact.timestamp ?? artifact.generatedDate,
    submittedDate: artifact.generatedDate,
    dueDate: artifact.generatedDate,
    reviewNotes: [],
    relatedArtifacts: [{ id: artifact.id, name: artifact.name, type: artifact.fileType }],
    traceabilityChain: [],
  };
}

function resolvePage(props: EnterpriseArtifactWorkspaceProps, pathname: string): PageMetadataEntry | undefined {
  if (props.pageId) return getPageById(props.pageId);
  if (props.pillar && props.submenu) return getPageByPillarAndSubmenu(props.pillar, props.submenu);
  return getPageByRoute(pathname);
}

export function EnterpriseArtifactWorkspace({ pageId, pillar, submenu }: EnterpriseArtifactWorkspaceProps) {
  const location = useLocation();
  const { recordArtifacts, updateArtifact } = useArtifactsRegistry();
  const { closeAdvisor } = useAIAdvisor();
  const page = resolvePage({ pageId, pillar, submenu }, location.pathname);
  const prompts = useMemo(() => (page ? getPromptsForPage(page.page_id) : []), [page]);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptDefinition | null>(null);
  const [sessionArtifacts, setSessionArtifacts] = useState<Artifact[]>([]);
  const [viewerArtifact, setViewerArtifact] = useState<Artifact | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [approvalAction, setApprovalAction] = useState<ApprovalWorkflowAction | null>(null);
  const [approvalTarget, setApprovalTarget] = useState<Artifact | null>(null);

  const handleGenerate = () => {
    if (!selectedPrompt) {
      setMessage('Select one of the predefined prompts.');
      return;
    }
    const generated = generateDeterministicArtifacts(selectedPrompt.prompt_id);
    if (generated.length === 0) {
      setMessage('No artifacts generated for this prompt.');
      return;
    }
    setSessionArtifacts((prev) => {
      const ids = new Set(prev.map((a) => a.id));
      const merged = [...generated.filter((a) => !ids.has(a.id)), ...prev];
      return merged;
    });
    recordArtifacts(generated);
    setMessage(`Generated ${generated.length} artifact(s) — Pending Review.`);
  };

  const patchStatus = (artifact: Artifact, status: ApprovalStatus) => {
    setSessionArtifacts((prev) => prev.map((a) => (a.id === artifact.id ? { ...a, approvalStatus: status } : a)));
    updateArtifact(artifact.id, { approvalStatus: status });
    if (viewerArtifact?.id === artifact.id) {
      setViewerArtifact({ ...viewerArtifact, approvalStatus: status });
    }
  };

  const withAdvisorDismiss = (action: () => void) => {
    closeAdvisor();
    action();
  };

  const openViewer = (artifact: Artifact) => {
    withAdvisorDismiss(() => setViewerArtifact(artifact));
  };

  const openApproval = (artifact: Artifact, action: ApprovalWorkflowAction) => {
    withAdvisorDismiss(() => {
      setApprovalTarget(artifact);
      setApprovalAction(action);
    });
  };

  const confirmApproval = (comment: string) => {
    if (!approvalTarget || !approvalAction) return;
    if (approvalAction === 'Reject' && !comment.trim()) {
      setMessage('Rejection requires a non-empty reason.');
      return;
    }
    if (approvalAction === 'Approve') patchStatus(approvalTarget, 'Approved');
    else if (approvalAction === 'Reject') patchStatus(approvalTarget, 'Rejected');
    else patchStatus(approvalTarget, 'Pending Review');
    setMessage(`${approvalAction} recorded for ${approvalTarget.id}${comment ? `: ${comment}` : ''}`);
    setApprovalAction(null);
    setApprovalTarget(null);
  };

  if (!page) {
    return (
      <Alert severity="warning" sx={{ mt: 1 }}>
        No deterministic page metadata found for this workspace context.
      </Alert>
    );
  }

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader
          title={page.title}
          subtitle={`${page.pillar} · ${page.submenu} · deterministic · ${page.prompt_count} prompts`}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {page.purpose}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Predefined prompts (offline generation — no LLM)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          {prompts.map((p) => (
            <Chip
              key={p.prompt_id}
              label={p.label}
              onClick={() => setSelectedPrompt(p)}
              color={selectedPrompt?.prompt_id === p.prompt_id ? 'primary' : 'default'}
              variant={selectedPrompt?.prompt_id === p.prompt_id ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleGenerate}
          disabled={!selectedPrompt}
        >
          Generate artifacts
        </Button>
        {message && (
          <Alert severity="success" sx={{ mt: 1.5 }}>
            {message}
          </Alert>
        )}
      </GlassCard>

      <ArtifactRepositoryPanel
        artifacts={sessionArtifacts}
        title="Deterministic artifacts"
        subtitle={`Demo pack ${page.demo_pack_id} · initial status Pending Review`}
        emptyMessage="Select a prompt and generate deterministic artifacts."
        onBeforeView={closeAdvisor}
      />

      {sessionArtifacts.length > 0 && (
        <GlassCard sx={{ p: 2, mt: 1.5 }}>
          <ModuleHeader title="Review & approval" subtitle="Approve · Reject · Preview · Download (DOCX/PDF/TXT)" />
          {sessionArtifacts.map((artifact) => (
            <Box
              key={artifact.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                py: 0.75,
                borderBottom: `1px solid ${colors.border.subtle}`,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>
                {artifact.id}
              </Typography>
              <Typography variant="caption" sx={{ flex: 1, minWidth: 120 }}>
                {artifact.name}
              </Typography>
              <Button size="small" onClick={() => openViewer(artifact)} sx={{ flexShrink: 0 }}>
                Preview
              </Button>
              <Chip size="small" label={artifact.approvalStatus} sx={{ flexShrink: 0 }} />
              <Button
                size="small"
                startIcon={<RateReviewIcon sx={{ fontSize: 14 }} />}
                onClick={() => openApproval(artifact, 'Request Changes')}
              >
                Review
              </Button>
              <Button
                size="small"
                color="success"
                startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                onClick={() => openApproval(artifact, 'Approve')}
              >
                Approve
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                onClick={() => openApproval(artifact, 'Reject')}
              >
                Reject
              </Button>
            </Box>
          ))}
        </GlassCard>
      )}

      <ArtifactViewerPanel
        artifact={viewerArtifact}
        open={!!viewerArtifact}
        onClose={() => setViewerArtifact(null)}
      />

      <ApprovalActionDialog
        open={!!approvalAction && !!approvalTarget}
        action={approvalAction}
        request={approvalTarget ? toApprovalRequest(approvalTarget) : null}
        onClose={() => {
          setApprovalAction(null);
          setApprovalTarget(null);
        }}
        onConfirm={confirmApproval}
      />
    </Box>
  );
}
