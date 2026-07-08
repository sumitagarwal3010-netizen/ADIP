import { Navigate } from 'react-router-dom';

/**
 * The "Delivery Health" route is preserved for bookmark compatibility, but the
 * conceptual experience has been renamed to **AI SDLC Copilot** and replaces
 * the KPI-first outcome page with the 6-tab AI Copilot workflow
 * (Requirements → Architecture → Development → Testing → Release → Audit).
 */
export function DeliveryHealthOutcome() {
  return <Navigate to="/executive/ai-copilot/requirements" replace />;
}
