import { Box, Chip, MenuItem, Select, TextField, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

const DOMAINS = ['', 'Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'];
const APPS = ['', 'UPI Gateway', 'Payment Switch', 'Fraud Engine', 'Mobile SDK', 'Net Banking Portal'];

export function SearchDiscoveryPanel() {
  const { searchFilters, setSearchFilters, searchResults } = useKnowledgeCenter();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Search & Discovery" subtitle="Full-text search with category, domain, and application filters" />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search knowledge..."
            value={searchFilters.query}
            onChange={(e) => setSearchFilters({ ...searchFilters, query: e.target.value })}
            sx={{ minWidth: 220, '& input': { fontSize: '0.75rem' } }}
          />
          <Select
            size="small"
            value={searchFilters.category}
            onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
            sx={{ fontSize: '0.72rem', minWidth: 140 }}
          >
            <MenuItem value="all">All categories</MenuItem>
            <MenuItem value="lesson">Lessons</MenuItem>
            <MenuItem value="best-practice">Best Practices</MenuItem>
            <MenuItem value="pattern">Patterns</MenuItem>
            <MenuItem value="rca">RCA Articles</MenuItem>
            <MenuItem value="playbook">Playbooks</MenuItem>
            <MenuItem value="control">Controls</MenuItem>
          </Select>
          <Select
            size="small"
            value={searchFilters.domain}
            onChange={(e) => setSearchFilters({ ...searchFilters, domain: e.target.value })}
            sx={{ fontSize: '0.72rem', minWidth: 140 }}
          >
            {DOMAINS.map((d) => <MenuItem key={d || 'all'} value={d}>{d || 'All domains'}</MenuItem>)}
          </Select>
          <Select
            size="small"
            value={searchFilters.application}
            onChange={(e) => setSearchFilters({ ...searchFilters, application: e.target.value })}
            sx={{ fontSize: '0.72rem', minWidth: 160 }}
          >
            {APPS.map((a) => <MenuItem key={a || 'all'} value={a}>{a || 'All applications'}</MenuItem>)}
          </Select>
        </Box>
        <Typography variant="caption" color="text.secondary">{searchResults.length} results</Typography>
      </GlassCard>

      <GlassCard sx={{ p: 2 }}>
        {searchResults.length === 0 ? (
          <Typography variant="caption" color="text.secondary">Enter a search term or adjust filters to discover knowledge artifacts.</Typography>
        ) : (
          searchResults.map((r) => (
            <Box key={`${r.type}-${r.id}`} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={r.type} size="small" sx={{ fontSize: '0.58rem', height: 18, minWidth: 80 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 70 }}>{r.id}</Typography>
              <Typography variant="caption" sx={{ flex: 1 }}>{r.title}</Typography>
              <Typography variant="caption" color="text.secondary">{r.domain}</Typography>
            </Box>
          ))
        )}
      </GlassCard>
    </Box>
  );
}
