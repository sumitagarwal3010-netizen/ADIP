import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { colors } from '../theme/colors';

const modelInventoryKpis = [
  { label: 'Total Models', value: 10, suffix: '', trend: 5.3 },
  { label: 'Approved Models', value: 7, suffix: '', trend: 2.1 },
  { label: 'Models In Review', value: 2, suffix: '', trend: 0 },
  { label: 'High Risk Models', value: 1, suffix: '', trend: -50 },
];

const models = [
  { model: 'Retail Credit Underwriting Copilot', vendor: 'Azure OpenAI', version: 'gpt-4.1', risk: 'High', status: 'In Review' },
  { model: 'UPI Fraud Pattern Detector', vendor: 'AWS SageMaker', version: 'v3.8', risk: 'Medium', status: 'Approved' },
  { model: 'AML Alert Prioritization Engine', vendor: 'Databricks Mosaic AI', version: 'v2.6', risk: 'Medium', status: 'Approved' },
  { model: 'Collections Promise-to-Pay Predictor', vendor: 'Google Vertex AI', version: 'v1.9', risk: 'Medium', status: 'Approved' },
  { model: 'Card Dispute Triage Assistant', vendor: 'Anthropic Claude', version: '4.6 Sonnet', risk: 'Low', status: 'Approved' },
  { model: 'KYC Document Verification Model', vendor: 'Azure AI Document Intelligence', version: '2025.11', risk: 'Medium', status: 'Approved' },
  { model: 'Treasury Liquidity Forecast Model', vendor: 'AWS Bedrock', version: 'v2.1', risk: 'Low', status: 'Approved' },
  { model: 'Branch Demand Forecasting Model', vendor: 'Google Vertex AI', version: 'v4.2', risk: 'Low', status: 'Approved' },
  { model: 'Regulatory Circular Summarizer', vendor: 'OpenAI', version: 'o3', risk: 'Low', status: 'In Review' },
  { model: 'Corporate Loan Covenant Monitor', vendor: 'Databricks Mosaic AI', version: 'v1.4', risk: 'Medium', status: 'Pilot' },
];

function getRiskStyle(risk: string) {
  if (risk === 'High') return { color: colors.critical, bg: `${colors.critical}22` };
  if (risk === 'Medium') return { color: colors.warning, bg: `${colors.warning}22` };
  return { color: colors.success, bg: `${colors.success}22` };
}

function getStatusStyle(status: string) {
  if (status === 'Approved') return { color: colors.success, bg: `${colors.success}22` };
  if (status === 'In Review') return { color: colors.info, bg: `${colors.info}22` };
  return { color: colors.warning, bg: `${colors.warning}22` };
}

export function ModelInventory() {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {modelInventoryKpis.map((kpi, index) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <KpiCard
              label={kpi.label}
              value={kpi.value}
              suffix={kpi.suffix}
              trend={kpi.trend}
              delay={index * 0.05}
              compact
            />
          </Grid>
        ))}
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Banking AI Model Inventory" subtitle="Risk and lifecycle status across production and review pipelines" />
        <TableContainer>
          <Table size="small" aria-label="model inventory table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Model</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Vendor</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Version</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Risk</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((row) => {
                const riskStyle = getRiskStyle(row.risk);
                const statusStyle = getStatusStyle(row.status);
                return (
                  <TableRow key={row.model} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                        {row.model}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.vendor}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.version}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography
                        variant="caption"
                        sx={{ px: 1, py: 0.25, borderRadius: 1, color: riskStyle.color, bgcolor: riskStyle.bg, fontWeight: 700 }}
                      >
                        {row.risk}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography
                        variant="caption"
                        sx={{ px: 1, py: 0.25, borderRadius: 1, color: statusStyle.color, bgcolor: statusStyle.bg, fontWeight: 700 }}
                      >
                        {row.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>
    </Box>
  );
}
