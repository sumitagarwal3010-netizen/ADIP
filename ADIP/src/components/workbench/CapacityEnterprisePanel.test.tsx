import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CapacityEnterprisePanel } from './CapacityEnterprisePanel';

vi.mock('../../services/backend/apiClient', () => ({
  apiClient: {
    runEnterpriseCapacityPlan: vi.fn().mockResolvedValue({
      enterprise: {
        kubernetes_platform: { total_resources: 40 },
        architect_recommendations: { overall_status: 'healthy' },
      },
    }),
    compareCapacityScenarios: vi.fn(),
    calibrateCapacity: vi.fn(),
  },
}));

describe('CapacityEnterprisePanel', () => {
  it('runs enterprise plan', async () => {
    const setLoading = vi.fn();
    const setMsg = vi.fn();
    render(<CapacityEnterprisePanel profile="medium" loading={false} setLoading={setLoading} setMsg={setMsg} />);
    fireEvent.click(screen.getByText('Run enterprise plan'));
    expect(await screen.findByText(/total_resources/)).toBeTruthy();
  });
});
