import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import type { ApprovalRequest, ApprovalWorkflowAction } from '../../data/approvalWorkflowMock';
import { REVIEWERS } from '../../data/approvalWorkflowMock';

interface ApprovalActionDialogProps {
  open: boolean;
  action: ApprovalWorkflowAction | null;
  request: ApprovalRequest | null;
  onClose: () => void;
  onConfirm: (comment: string, reviewer?: string) => void;
}

interface ApprovalActionFormProps {
  action: ApprovalWorkflowAction;
  request: ApprovalRequest;
  onClose: () => void;
  onConfirm: (comment: string, reviewer?: string) => void;
}

function ApprovalActionForm({ action, request, onClose, onConfirm }: ApprovalActionFormProps) {
  const [comment, setComment] = useState('');
  const [reviewer, setReviewer] = useState(request.assignedReviewer ?? REVIEWERS[0]);
  const needsReviewer = action === 'Assign Reviewer' || action === 'Reassign Reviewer';

  return (
    <>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
        {action} — {request.id}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Item
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{request.title}</Typography>
        {needsReviewer && (
          <FormControl size="small" fullWidth>
            <InputLabel>Reviewer</InputLabel>
            <Select label="Reviewer" value={reviewer} onChange={(e) => setReviewer(e.target.value)}>
              {REVIEWERS.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          label="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          minRows={3}
          placeholder="Enter review comments or rationale..."
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => onConfirm(comment, needsReviewer ? reviewer : undefined)}
          disabled={needsReviewer && !reviewer}
        >
          Confirm {action}
        </Button>
      </DialogActions>
    </>
  );
}

export function ApprovalActionDialog({
  open,
  action,
  request,
  onClose,
  onConfirm,
}: ApprovalActionDialogProps) {
  if (!action || !request) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <ApprovalActionForm
        key={`${request.id}-${action}`}
        action={action}
        request={request}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
}
