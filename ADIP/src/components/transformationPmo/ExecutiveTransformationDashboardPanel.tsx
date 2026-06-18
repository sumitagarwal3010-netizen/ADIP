import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTransformationPmo } from '../../context/TransformationPmoContext';
import { useExplainability } from '../explainability/ExplainabilityProvider';
import {
  applicationRegister,
  benefitRegister,
  milestoneRegister,
  dependencyRegister,
  roiRegister,
  transformationHistoryDetail,
} from '../../data/transformationPmoEngine';
import type { TransformationKpiBreakdown } from '../../types/transformationPmo';
import { colors } from '../../theme/colors';

/**
 * Explainable Transformation KPIs (June 2026 KPI Explainability & Traceability).
 *
 * Each of the five hero KPIs now answers: what it is, why it exists, how it is
 * calculated, what records contribute, when it was last calculated and what
 * changed. Clicking a KPI opens its drill-down register (contributing records);
 * the "How Calculated" info icon opens the universal explainability drawer
 * (purpose, formula, inputs, weighting, contributors, traceability, confidence).
 */

const REGISTER_COLUMNS: Record<TransformationKpiBreakdown['register'], string[]> = {
  applications: ['Application', 'Program', 'Domain', 'Health', 'Owner', 'Last Assessment', 'Risk Rating', 'Status'],
  benefits: ['Program', 'Expected', 'Realized', 'Variance', 'Owner', 'Evidence', 'Business Case'],
  milestones: ['Program', 'Milestone', 'Planned', 'Actual', 'Delay', 'Status', 'Owner'],
  dependencies: ['Source Program', 'Target Program', 'Dependency', 'Severity', 'Status', 'Impact'],
  roi: ['Program', 'Investment', 'Benefit', 'ROI', 'Payback', 'Owner', 'Evidence'],
};

function registerRows(register: TransformationKpiBreakdown['register']): (string | number)[][] {
  switch (register) {
    case 'applications':
      return applicationRegister(120).map((r) => [r.application, r.program, r.domain, `${r.health}%`, r.owner, r.lastAssessment, r.riskRating, r.status]);
    case 'benefits':
      return benefitRegister(50).map((r) => [r.program, r.expected, r.realized, r.variance, r.owner, r.evidence, r.businessCase]);
    case 'milestones':
      return milestoneRegister(80).map((r) => [r.program, r.milestone, r.plannedDate, r.actualDate, r.delayDays ? `${r.delayDays}d` : '—', r.status, r.owner]);
    case 'dependencies':
      return dependencyRegister(80).map((r) => [r.sourceProgram, r.targetProgram, r.dependency, r.severity, r.status, r.impact]);
    case 'roi':
      return roiRegister(50).map((r) => [r.program, r.investment, r.benefit, r.roi, r.payback, r.owner, r.evidence]);
    default:
      return [];
  }
}

export function ExecutiveTransformationDashboardPanel() {
  const { kpiBreakdowns, history, progByUnit, progByStatus, lastCalculated } = useTransformationPmo();
  const { openExplainability } = useExplainability();
  const [selectedKpi, setSelectedKpi] = useState<string>(kpiBreakdowns[0]?.id ?? '');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const selected = kpiBreakdowns.find((k) => k.id === selectedKpi) ?? kpiBreakdowns[0];
  const historyDetail = transformationHistoryDetail(history);
  const yearDetail = historyDetail.find((h) => h.year === selectedYear) ?? null;

  const explain = (k: TransformationKpiBreakdown) =>
    openExplainability({ label: k.label, value: k.value, suffix: k.suffix, chartId: k.chartId });

  return (
    <Box>
      {/* Explainable KPI tiles */}
      <Grid container spacing={1.5}>
        {kpiBreakdowns.map((k) => {
          const active = k.id === selectedKpi;
          const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedKpi(k.id);
            }
          };
          return (
            <Grid key={k.id} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <GlassCard
                role="button"
                tabIndex={0}
                onClick={() => setSelectedKpi(k.id)}
                onKeyDown={onKey}
                title={`Click to drill down: ${k.label}`}
                sx={{
                  p: 1.5,
                  minHeight: 150,
                  cursor: 'pointer',
                  border: `1px solid ${active ? colors.primary : 'transparent'}`,
                  bgcolor: active ? `${colors.primary}12` : undefined,
                  '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 2 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>
                    {k.label}
                  </Typography>
                  <Tooltip title="How Calculated">
                    <IconButton
                      size="small"
                      aria-label={`How ${k.label} is calculated`}
                      onClick={(e) => { e.stopPropagation(); explain(k); }}
                      sx={{ p: 0.25, color: colors.text.muted, '&:hover': { color: colors.primary } }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.25 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text.primary }}>{k.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{k.suffix}</Typography>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: '0.62rem', color: colors.text.muted, lineHeight: 1.35 }}>
                  {k.basedOn}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontSize: '0.58rem', fontFamily: 'monospace', color: colors.text.secondary, lineHeight: 1.3 }}>
                  {k.formula}
                </Typography>
              </GlassCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected KPI — explainability summary + drill-down register */}
      {selected && (
        <GlassCard sx={{ p: 2, mt: 1.5 }}>
          <ModuleHeader
            title={`${selected.label} — Details & Evidence`}
            subtitle={`Last calculated ${selected.lastCalculated} · ${selected.changeSinceLast}`}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Box sx={{ flex: '1 1 280px', p: 1.25, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.glow}` }}>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.secondary }}>
                Formula
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 0.5, color: colors.text.primary, lineHeight: 1.5 }}>
                {selected.formula}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {selected.inputs.map((inp) => (
                  <Box key={inp.label} sx={{ px: 1, py: 0.5, borderRadius: 0.75, bgcolor: colors.bg.primary, border: `1px solid ${colors.border.subtle}` }}>
                    <Typography variant="caption" sx={{ fontSize: '0.58rem', color: colors.text.muted, display: 'block' }}>{inp.label}</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 700, color: colors.text.primary }}>{inp.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 340, borderRadius: 1, border: `1px solid ${colors.border.subtle}` }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {REGISTER_COLUMNS[selected.register].map((col) => (
                    <TableCell
                      key={col}
                      sx={{ fontSize: '0.66rem', fontWeight: 700, color: colors.text.secondary, bgcolor: colors.bg.secondary, borderColor: colors.border.subtle, textTransform: 'uppercase', letterSpacing: '0.03em' }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {registerRows(selected.register).map((row, ri) => (
                  <TableRow key={ri} hover>
                    {row.map((cell, ci) => (
                      <TableCell key={ci} sx={{ fontSize: '0.7rem', color: ci === 0 ? colors.text.primary : colors.text.secondary, borderColor: colors.border.subtle, whiteSpace: 'nowrap' }}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.75, fontSize: '0.62rem', color: colors.text.muted }}>
            Showing contributing records for {selected.label}. Use the info icon on the KPI for the full methodology, weighting and traceability.
          </Typography>
        </GlassCard>
      )}

      {/* Traceable 5-year history — clickable points */}
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="5-Year Transformation History" subtitle="Health · benefits · milestones — click a year for traceable detail" />
            <MultiLineChart
              data={history.map((h) => ({ month: h.year, ...h })) as Record<string, string | number>[]}
              series={[
                { key: 'transformationHealth', name: 'Health %', color: colors.success },
                { key: 'benefitsRealization', name: 'Benefits %', color: colors.primary },
                { key: 'milestoneCompletion', name: 'Milestones %', color: colors.secondary },
              ]}
              height={200}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {historyDetail.map((h) => {
                const active = h.year === selectedYear;
                return (
                  <Box
                    key={h.year}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedYear(active ? null : h.year)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedYear(active ? null : h.year); } }}
                    sx={{
                      px: 1, py: 0.5, borderRadius: 1, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                      color: active ? colors.text.primary : colors.text.secondary,
                      bgcolor: active ? `${colors.primary}1f` : colors.bg.glass,
                      border: `1px solid ${active ? colors.primary : colors.border.subtle}`,
                      '&:hover': { bgcolor: `${colors.primary}12` },
                      '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 2 },
                    }}
                  >
                    {h.year} · {h.value}%
                  </Box>
                );
              })}
            </Box>
            {yearDetail && (
              <Box sx={{ mt: 1, p: 1.25, borderRadius: 1, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.glow}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', color: colors.text.primary }}>
                  {yearDetail.year} · Transformation Health {yearDetail.value}%
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25, fontSize: '0.66rem', color: colors.text.secondary }}>
                  Change from previous year: {yearDetail.changeFromPrevious === null ? 'baseline year' : `${yearDetail.changeFromPrevious >= 0 ? '+' : ''}${yearDetail.changeFromPrevious} pts`}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25, fontSize: '0.66rem', color: colors.text.muted }}>
                  Programs contributing: {yearDetail.programsContributing} · Applications contributing: {yearDetail.applicationsContributing}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25, fontSize: '0.62rem', fontFamily: 'monospace', color: colors.text.secondary }}>
                  {yearDetail.formula}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.25, fontSize: '0.62rem', color: colors.text.muted }}>
                  Source: {yearDetail.sourceData}
                </Typography>
              </Box>
            )}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Programs by Business Unit" subtitle="50 transformation programs" />
            <HorizontalBarChart chartId="transformation-pmo.business-unit-performance" data={progByUnit} height={200} barColor={colors.info} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Program Status Distribution" subtitle={`KPI snapshot last calculated ${lastCalculated}`} />
            <HorizontalBarChart chartId="transformation-pmo.program-delivery" data={progByStatus} height={180} barColor={colors.warning} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
