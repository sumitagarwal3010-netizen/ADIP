import type { ReactNode, ReactElement } from 'react';

/** Context passed from a KPI card to open the explainability drawer. */
export interface KpiExplainabilityContext {
  label: string;
  value: string | number;
  suffix?: string;
  trend?: number;
  data?: { day?: string; label?: string; value: number }[];
  chartId?: string;
}

export interface ExplainabilityApi {
  openExplainability: (ctx: KpiExplainabilityContext) => void;
  closeExplainability: () => void;
}

export function ExplainabilityProvider(props: { children?: ReactNode }): ReactElement;

export function useExplainability(): ExplainabilityApi;
