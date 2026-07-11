/**
 * Connector Artifact Workbench — SDK hook with mock fallback.
 */
import { useCallback, useMemo, useState } from 'react';
import { apiClient } from '../../services/backend/apiClient';
import { useAdipQuery } from './useAdipQuery';
import { useConnectors } from './useConnectors';

export interface ArtifactUseCase {
  id: string;
  label: string;
  description: string;
  supported_connectors: string[];
  multi_source: boolean;
}

export interface SourceRecord {
  external_id?: string;
  title?: string;
  connector_type?: string;
  classification?: string;
  severity?: string;
  artifact_role?: string;
}

export interface GeneratedArtifact {
  id: string;
  title: string;
  artifact_type: string;
  summary: string;
  body: string;
  source_connectors: string[];
  source_records: SourceRecord[];
  prompt: string;
  quality_score: number;
  confidence: string;
  quality_checks: string[];
  traceability: Array<{ label?: string; external_id?: string; phase?: string }>;
  explainability: {
    contributing_records: string[];
    prompt_used: string;
    quality_checks: string[];
    generation_mode: string;
  };
  mock_mode: boolean;
  dry_run: boolean;
  generated_at: string;
}

const MOCK_USE_CASES: ArtifactUseCase[] = [
  { id: 'requirements_document', label: 'Requirements document', description: 'From Jira + Confluence', supported_connectors: ['jira', 'confluence'], multi_source: true },
  { id: 'architecture_summary', label: 'Architecture summary', description: 'From SharePoint + Confluence', supported_connectors: ['sharepoint', 'confluence'], multi_source: true },
  { id: 'security_findings_report', label: 'Security findings report', description: 'From SonarQube + Prisma Cloud', supported_connectors: ['sonarqube', 'prisma_cloud'], multi_source: true },
  { id: 'release_readiness_report', label: 'Release readiness report', description: 'Multi-source release assessment', supported_connectors: ['jira', 'sonarqube', 'teams'], multi_source: true },
  { id: 'executive_sdlc_summary', label: 'Executive SDLC summary', description: 'Cross-connector executive view', supported_connectors: ['jira', 'sonarqube', 'sharepoint'], multi_source: true },
];

const MOCK_SOURCES: SourceRecord[] = [
  { external_id: 'jira-101', title: 'UPI-101: Settlement gap', connector_type: 'jira', classification: 'story', severity: 'high' },
  { external_id: 'sq-vuln-1', title: 'SQL injection risk', connector_type: 'sonarqube', classification: 'vulnerability', severity: 'critical' },
  { external_id: 'sp-doc-1', title: 'Target Architecture v2.1', connector_type: 'sharepoint', classification: 'architecture' },
];

export function useArtifactUseCases() {
  return useAdipQuery(
    () => apiClient.connectorArtifactUseCases<ArtifactUseCase[]>(),
    MOCK_USE_CASES,
    [],
  );
}

export function useConnectorArtifactWorkbench() {
  const { data: useCases } = useArtifactUseCases();
  const { data: connectors } = useConnectors();
  const [artifactType, setArtifactType] = useState('release_readiness_report');
  const [selectedConnectorIds, setSelectedConnectorIds] = useState<number[]>([]);
  const [sources, setSources] = useState<SourceRecord[]>(MOCK_SOURCES);
  const [promptPreview, setPromptPreview] = useState('');
  const [requirement, setRequirement] = useState('');
  const [generated, setGenerated] = useState<GeneratedArtifact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultRequirement = useMemo(() => {
    const useCase = useCases.find((u) => u.id === artifactType);
    return useCase?.description ?? useCase?.label ?? artifactType.replace(/_/g, ' ');
  }, [artifactType, useCases]);

  const targetConnectors = useMemo(() => {
    const uc = useCases.find((u) => u.id === artifactType);
    if (!selectedConnectorIds.length) {
      return connectors.filter((c) => !uc || uc.supported_connectors.includes(c.connector_type));
    }
    return connectors.filter((c) => selectedConnectorIds.includes(c.id));
  }, [connectors, useCases, artifactType, selectedConnectorIds]);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = targetConnectors.map((c) => c.id);
      const ctypes = [...new Set(targetConnectors.map((c) => c.connector_type))];
      const src = await apiClient.previewConnectorSources<{
        records: SourceRecord[];
        mode: string;
      }>({ artifact_type: artifactType, connector_ids: ids, connector_types: ctypes });
      setSources(src.records?.length ? src.records : MOCK_SOURCES);
      const prompt = await apiClient.previewConnectorPrompt<{ prompt: string }>(artifactType, ctypes);
      setPromptPreview(prompt.prompt ?? '');
    } catch (e) {
      setSources(MOCK_SOURCES);
      setPromptPreview(`[Mock prompt] Generate ${artifactType} from connector sources.`);
      setError(e instanceof Error ? e.message : 'Preview fallback to mock');
    } finally {
      setLoading(false);
    }
  }, [artifactType, targetConnectors]);

  const generate = useCallback(async (dryRun = false) => {
    setLoading(true);
    setError(null);
    try {
      const ids = targetConnectors.map((c) => c.id);
      const ctypes = [...new Set(targetConnectors.map((c) => c.connector_type))];
      const prompt = requirement.trim() || defaultRequirement;
      const art = await apiClient.generateConnectorArtifact<GeneratedArtifact>({
        artifact_type: artifactType,
        connector_ids: ids,
        connector_types: ctypes,
        dry_run: dryRun,
        prompt,
      });
      setGenerated(art);
      if (art.prompt) setPromptPreview(art.prompt);
    } catch (e) {
      setGenerated(null);
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [artifactType, defaultRequirement, requirement, targetConnectors]);

  return {
    useCases,
    connectors,
    artifactType,
    setArtifactType,
    selectedConnectorIds,
    setSelectedConnectorIds,
    targetConnectors,
    sources,
    promptPreview,
    requirement,
    setRequirement,
    defaultRequirement,
    generated,
    loading,
    error,
    loadPreview,
    generate,
  };
}

export { MOCK_USE_CASES, MOCK_SOURCES };
