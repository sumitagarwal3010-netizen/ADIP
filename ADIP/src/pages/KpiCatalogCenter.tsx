import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { KpiCard } from '../components/common/KpiCard';
import { KPI_CATALOG, computeKpiCatalogStats, type KpiAnswers, type KpiCatalogEntry } from '../data/kpiCatalog';
import { createArtifact } from '../data/artifactBuilder';
import { useArtifactsRegistry } from '../context/ArtifactsContext';
import { colors } from '../theme/colors';

const ANSWER_COLOR: Record<KpiAnswers, string> = {
  Health: colors.success,
  Risk: colors.critical,
  Progress: colors.info,
  Adoption: colors.secondary,
  Compliance: colors.primary,
  Value: colors.warning,
};

function entryToCsvRow(k: KpiCatalogEntry): string {
  const fields = [
    k.id,
    k.name,
    k.center,
    k.answers,
    k.unit ?? '',
    k.target ?? '',
    k.frequency,
    k.owner,
    k.executiveConsumer,
    k.source,
    k.formula,
    k.definition,
  ];
  return fields.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(',');
}

function buildCatalogMarkdown(): string {
  const lines: string[] = [];
  lines.push('# ADIP KPI Catalog');
  lines.push('');
  lines.push('Single source of truth for every KPI surfaced in the platform.');
  lines.push('');
  lines.push('| KPI | Center | Answers | Unit | Target | Owner | Consumer |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  KPI_CATALOG.forEach((k) => {
    lines.push(
      `| ${k.name} | ${k.center} | ${k.answers} | ${k.unit ?? '—'} | ${k.target ?? '—'} | ${k.owner} | ${k.executiveConsumer} |`,
    );
  });
  lines.push('');
  lines.push('## Definitions & Formulas');
  lines.push('');
  KPI_CATALOG.forEach((k) => {
    lines.push(`### ${k.name}`);
    lines.push('');
    lines.push(`- **Center**: ${k.center}`);
    lines.push(`- **Answers**: ${k.answers}`);
    lines.push(`- **Definition**: ${k.definition}`);
    lines.push(`- **Formula**: \`${k.formula}\``);
    lines.push(`- **Source**: ${k.source}`);
    lines.push(`- **Frequency**: ${k.frequency}`);
    lines.push(`- **Owner**: ${k.owner}`);
    lines.push(`- **Executive Consumer**: ${k.executiveConsumer}`);
    if (k.unit) lines.push(`- **Unit**: ${k.unit}`);
    if (k.target) lines.push(`- **Target**: ${k.target}`);
    lines.push('');
  });
  return lines.join('\n');
}

function buildCatalogCsv(rows: KpiCatalogEntry[]): string {
  const header = [
    'KPI ID', 'KPI Name', 'Center', 'Answers', 'Unit', 'Target',
    'Frequency', 'Owner', 'Executive Consumer', 'Source', 'Formula', 'Definition',
  ].join(',');
  return [header, ...rows.map(entryToCsvRow)].join('\n');
}

function downloadFile(name: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function KpiCatalogCenter() {
  const stats = useMemo(() => computeKpiCatalogStats(), []);
  const { recordArtifacts } = useArtifactsRegistry();
  const [query, setQuery] = useState('');
  const [centerFilter, setCenterFilter] = useState<'all' | string>('all');
  const [answersFilter, setAnswersFilter] = useState<'all' | KpiAnswers>('all');
  const [consumerFilter, setConsumerFilter] = useState<'all' | KpiCatalogEntry['executiveConsumer']>('all');

  const centers = useMemo(() => {
    const set = new Set<string>();
    KPI_CATALOG.forEach((k) => set.add(k.center));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KPI_CATALOG.filter((k) => {
      if (centerFilter !== 'all' && k.center !== centerFilter) return false;
      if (answersFilter !== 'all' && k.answers !== answersFilter) return false;
      if (consumerFilter !== 'all' && k.executiveConsumer !== consumerFilter) return false;
      if (!q) return true;
      const haystack = [k.name, k.center, k.definition, k.formula, k.owner, k.source].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [query, centerFilter, answersFilter, consumerFilter]);

  const handleGenerateCatalog = () => {
    const md = buildCatalogMarkdown();
    const csv = buildCatalogCsv(KPI_CATALOG);
    const ts = new Date().toLocaleString('en-IN');
    const runId = `KPI-${Date.now().toString(36).toUpperCase()}`;

    const mdArtifact = createArtifact({
      id: `${runId}-md`,
      name: 'ADIP_KPI_Catalog.docx',
      generatedBy: 'KPI Governance AI',
      fileType: 'docx',
      approvalStatus: 'Approved',
      riskRating: 'Low',
      previewContent: md,
      executiveSummary: `Authoritative KPI dictionary covering ${stats.totalKpis} KPIs across ${stats.uniqueCenters} centers. Each KPI documents definition, formula, source, frequency, owner and executive consumer.`,
      context: { subject: 'KPI Catalog' },
    });
    const csvArtifact = createArtifact({
      id: `${runId}-csv`,
      name: 'ADIP_KPI_Catalog.xlsx',
      generatedBy: 'KPI Governance AI',
      fileType: 'xlsx',
      approvalStatus: 'Approved',
      riskRating: 'Low',
      previewContent: csv,
      executiveSummary: `Tabular KPI catalog (${stats.totalKpis} rows) with definition, formula, source, frequency, owner and executive consumer.`,
      context: { subject: 'KPI Catalog' },
    });
    const tagged = [mdArtifact, csvArtifact].map((a) => ({
      ...a,
      sourceHub: 'kpi-catalog',
      sourceLabel: 'KPI Catalog',
      timestamp: ts,
    }));
    recordArtifacts(tagged);
    downloadFile('ADIP_KPI_Catalog.md', md, 'text/markdown;charset=utf-8');
    downloadFile('ADIP_KPI_Catalog.csv', csv, 'text/csv;charset=utf-8');
  };

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} hover={false}>
        <LibraryBooksIcon sx={{ color: colors.primary, fontSize: 22 }} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: '0.85rem', fontWeight: 700 }}>KPI Catalog</Box>
          <Box sx={{ fontSize: '0.65rem', color: colors.text.secondary }}>
            Authoritative KPI dictionary — every metric documented with definition, formula, source, frequency, owner &amp; executive consumer
          </Box>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
          onClick={handleGenerateCatalog}
          sx={{ textTransform: 'none', fontSize: '0.72rem', bgcolor: colors.secondary, '&:hover': { bgcolor: colors.primary } }}
        >
          Generate KPI Catalog
        </Button>
      </GlassCard>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(6, 1fr)' }, gap: 1.5, mb: 1.5 }}>
        <KpiCard label="KPIs" value={stats.totalKpis} suffix="" compact />
        <KpiCard label="Centers" value={stats.uniqueCenters} suffix="" compact />
        <KpiCard label="Health" value={stats.byAnswer.Health} suffix="" compact />
        <KpiCard label="Risk" value={stats.byAnswer.Risk} suffix="" compact />
        <KpiCard label="Compliance" value={stats.byAnswer.Compliance} suffix="" compact />
        <KpiCard label="Value" value={stats.byAnswer.Value} suffix="" compact />
      </Box>

      <GlassCard sx={{ p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search KPI name, formula, owner, source…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 260, flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: colors.text.muted }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '0.78rem' },
              },
            }}
          />
          <Select
            size="small"
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value as string)}
            sx={{ minWidth: 240, fontSize: '0.78rem' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>All centers</MenuItem>
            {centers.map((c) => (
              <MenuItem key={c} value={c} sx={{ fontSize: '0.78rem' }}>{c}</MenuItem>
            ))}
          </Select>
          <Select
            size="small"
            value={answersFilter}
            onChange={(e) => setAnswersFilter(e.target.value as 'all' | KpiAnswers)}
            sx={{ minWidth: 140, fontSize: '0.78rem' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>All questions</MenuItem>
            <MenuItem value="Health" sx={{ fontSize: '0.78rem' }}>Health</MenuItem>
            <MenuItem value="Risk" sx={{ fontSize: '0.78rem' }}>Risk</MenuItem>
            <MenuItem value="Progress" sx={{ fontSize: '0.78rem' }}>Progress</MenuItem>
            <MenuItem value="Adoption" sx={{ fontSize: '0.78rem' }}>Adoption</MenuItem>
            <MenuItem value="Compliance" sx={{ fontSize: '0.78rem' }}>Compliance</MenuItem>
            <MenuItem value="Value" sx={{ fontSize: '0.78rem' }}>Value</MenuItem>
          </Select>
          <Select
            size="small"
            value={consumerFilter}
            onChange={(e) => setConsumerFilter(e.target.value as 'all' | KpiCatalogEntry['executiveConsumer'])}
            sx={{ minWidth: 110, fontSize: '0.78rem' }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.78rem' }}>All execs</MenuItem>
            <MenuItem value="CIO" sx={{ fontSize: '0.78rem' }}>CIO</MenuItem>
            <MenuItem value="CTO" sx={{ fontSize: '0.78rem' }}>CTO</MenuItem>
            <MenuItem value="CISO" sx={{ fontSize: '0.78rem' }}>CISO</MenuItem>
            <MenuItem value="CRO" sx={{ fontSize: '0.78rem' }}>CRO</MenuItem>
            <MenuItem value="CFO" sx={{ fontSize: '0.78rem' }}>CFO</MenuItem>
            <MenuItem value="COO" sx={{ fontSize: '0.78rem' }}>COO</MenuItem>
            <MenuItem value="CEO" sx={{ fontSize: '0.78rem' }}>CEO</MenuItem>
          </Select>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
            onClick={() => downloadFile('ADIP_KPI_Catalog.csv', buildCatalogCsv(filtered), 'text/csv;charset=utf-8')}
            sx={{ textTransform: 'none', fontSize: '0.72rem' }}
          >
            Export CSV
          </Button>
        </Box>
      </GlassCard>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="KPI Dictionary" subtitle={`${filtered.length} of ${KPI_CATALOG.length} KPIs shown`} />
        {filtered.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 4, textAlign: 'center' }}>
            No KPIs match the current filters.
          </Typography>
        ) : (
          filtered.map((k) => (
            <Box
              key={k.id}
              sx={{
                py: 1.25,
                borderBottom: `1px solid ${colors.border.subtle}`,
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{k.name}</Typography>
                <Chip
                  label={k.answers}
                  size="small"
                  sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${ANSWER_COLOR[k.answers]}26`, color: ANSWER_COLOR[k.answers] }}
                />
                <Chip
                  label={k.center}
                  size="small"
                  sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.05)', color: colors.text.secondary }}
                />
                {k.unit && (
                  <Chip
                    label={`Unit: ${k.unit}`}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.05)', color: colors.text.secondary }}
                  />
                )}
                {k.target && (
                  <Chip
                    label={`Target: ${k.target}`}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${colors.success}1f`, color: colors.success }}
                  />
                )}
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                  <Chip
                    label={`Owner: ${k.owner}`}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.05)' }}
                  />
                  <Chip
                    label={k.executiveConsumer}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${colors.primary}1f`, color: colors.primary }}
                  />
                  <Chip
                    label={k.frequency}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(255,255,255,0.05)' }}
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', lineHeight: 1.5 }}>
                {k.definition}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  display: 'block',
                  mt: 0.5,
                  fontFamily: 'monospace',
                  color: colors.secondary,
                  wordBreak: 'break-word',
                }}
              >
                {`Formula: ${k.formula}`}
              </Typography>
              <Typography variant="caption" color="text.muted" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.25 }}>
                Source: {k.source}
              </Typography>
            </Box>
          ))
        )}
      </GlassCard>
    </Box>
  );
}
