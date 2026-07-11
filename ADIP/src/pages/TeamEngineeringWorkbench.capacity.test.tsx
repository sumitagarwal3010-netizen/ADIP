import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { TeamEngineeringWorkbench } from './TeamEngineeringWorkbench';

vi.mock('../services/backend/apiClient', () => ({
  apiClient: {
    llmSmokeTest: vi.fn(),
    runGoldenRegression: vi.fn(),
    artifactScorecard: vi.fn(),
    runRules: vi.fn(),
    runCapacityPlan: vi.fn().mockResolvedValue({
      profile: 'medium',
      costs: { monthly_total_usd: 2100 },
      gke: { node_count_est: 4 },
      growth_forecast: [{ period: 'year', storage_gb: 50 }],
    }),
    capacitySection: vi.fn().mockResolvedValue({
      uploads_per_day: 200,
      storage_per_year_bytes: 8e9,
    }),
  },
}));

vi.mock('../services/backend/apiConfig', () => ({ isBackendMode: () => true }));
vi.mock('../services/auth/authConfig', () => ({ getAuthMode: () => 'demo' }));
vi.mock('../sdk/hooks/useConnectors', () => ({
  useConnectorDashboard: () => ({ data: { security_bypassed: false } }),
}));

describe('TeamEngineeringWorkbench capacity tabs', () => {
  it('renders capacity planning tab and runs plan', async () => {
    render(
      <MemoryRouter>
        <TeamEngineeringWorkbench />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Capacity Planning'));
    fireEvent.click(screen.getByText('Run capacity plan'));
    expect(await screen.findByText(/monthly_total_usd/)).toBeTruthy();
  });

  it('renders object storage tab', async () => {
    render(
      <MemoryRouter>
        <TeamEngineeringWorkbench />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Object Storage'));
    fireEvent.click(screen.getByText('Estimate object storage'));
    expect(await screen.findByText(/uploads_per_day/)).toBeTruthy();
  });
});
