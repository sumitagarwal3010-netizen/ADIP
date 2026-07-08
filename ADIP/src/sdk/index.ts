/**
 * Typed ADIP SDK — thin wrapper over existing apiClient (Role 8).
 * No duplicate HTTP layer; extends Phase 10 backend integration.
 */
export { adipSdk, AdipSdk } from './adipSdk';
export type { OrchestrateResult, HealthStatus } from './adipSdk';
export { useAdipQuery, useAdipMutation } from './hooks/useAdipQuery';
export { useFeatureFlags } from './hooks/useFeatureFlags';
export { useOrchestratorStream } from './hooks/useOrchestratorStream';
export { useTraceabilityMatrix } from './hooks/useTraceabilityData';
export { useSdlcHubSummary } from './hooks/useSdlcHubSummary';
export { useConnectors, useConnectorDashboard } from './hooks/useConnectors';
export { useConnectorArtifactWorkbench } from './hooks/useConnectorArtifactWorkbench';
export type { SdlcHubKey, SdlcHubSummaryView } from './hooks/useSdlcHubSummary';
