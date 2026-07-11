import { Box } from '@mui/material';
import { EnterpriseArtifactWorkspace } from '../components/workflow/EnterpriseArtifactWorkspace';

/**
 * Executive Advisor — deterministic artifact workspace for CIO briefings,
 * portfolio summaries, and executive action tracking.
 */
export function DeliveryHealthOutcome() {
  return (
    <Box>
      <EnterpriseArtifactWorkspace pillar="Executive AI" submenu="Executive Advisor" />
    </Box>
  );
}
