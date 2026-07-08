import { useMemo } from 'react';
import { apiClient } from '../../services/backend/apiClient';
import { useAdipQuery } from './useAdipQuery';

export interface ConnectorRow {
  id: number;
  connector_type: string;
  name: string;
  category: string;
  status: string;
  enabled: boolean;
  mock_mode: boolean;
  last_health_status?: string;
}

export interface ConnectorDashboard {
  total_connectors: number;
  enabled_connectors: number;
  mock_connectors: number;
  healthy_connectors: number;
  security_bypassed: boolean;
  auth_mode: string;
}

const MOCK_DASHBOARD: ConnectorDashboard = {
  total_connectors: 24,
  enabled_connectors: 24,
  mock_connectors: 24,
  healthy_connectors: 22,
  security_bypassed: true,
  auth_mode: 'demo',
};

export const MOCK_CONNECTORS: ConnectorRow[] = [
  { id: 1, connector_type: 'jira', name: 'Demo Jira', category: 'alm', status: 'mock', enabled: true, mock_mode: true, last_health_status: 'healthy' },
  { id: 2, connector_type: 'sonarqube', name: 'Demo SonarQube', category: 'security', status: 'mock', enabled: true, mock_mode: true, last_health_status: 'healthy' },
  { id: 3, connector_type: 'aws', name: 'Demo AWS', category: 'cloud', status: 'mock', enabled: true, mock_mode: true, last_health_status: 'healthy' },
];

export function useConnectorDashboard() {
  return useAdipQuery(() => apiClient.connectorDashboard<ConnectorDashboard>(), MOCK_DASHBOARD, []);
}

export function useConnectors(projectId = 1) {
  const fetcher = useMemo(() => () => apiClient.listConnectors<ConnectorRow[]>(projectId), [projectId]);
  return useAdipQuery(fetcher, MOCK_CONNECTORS, [projectId]);
}

export { MOCK_DASHBOARD };
