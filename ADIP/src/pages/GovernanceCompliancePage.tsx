import {
  Box,
  Chip,
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
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { EnterpriseArtifactWorkspace } from '../components/workflow/EnterpriseArtifactWorkspace';
import { useMemo, useState } from 'react';

const kpis = [
  { label: 'Regulations Covered', value: 14, suffix: '', trend: 3.1 },
  { label: 'Open Compliance Gaps', value: 9, suffix: '', trend: -10.0 },
  { label: 'Controls Tested (QTD)', value: 128, suffix: '', trend: 6.4 },
  { label: 'Regulatory Readiness', value: 92, trend: 1.8 },
];

const rows = [
  { regulation: 'RBI Cyber Security Framework', control: 'Privileged Access Quarterly Review', owner: 'IAM Governance', status: 'Compliant' },
  { regulation: 'PCI-DSS 4.0', control: 'Cardholder Data Encryption Rotation', owner: 'Card Security Ops', status: 'In Progress' },
  { regulation: 'ISO27001 A.12', control: 'SOC Log Correlation Coverage', owner: 'Security Operations', status: 'Compliant' },
  { regulation: 'RBI IT Governance Circular', control: 'DR Drill Evidence Sign-off', owner: 'Resilience Office', status: 'Action Required' },
];

type CompliancePrompt =
  | 'RBI Evidence Pack'
  | 'PCI DSS Evidence Pack'
  | 'Open Audit Findings'
  | 'Control Violations'
  | 'Remediation Plan'
  | 'Compliance Summary';

const COMPLIANCE_PROMPTS: CompliancePrompt[] = [
  'RBI Evidence Pack',
  'PCI DSS Evidence Pack',
  'Open Audit Findings',
  'Control Violations',
  'Remediation Plan',
  'Compliance Summary',
];

const COMPLIANCE_OUTPUTS: Record<
  CompliancePrompt,
  {
    checklist: string;
    controlMap: string;
    gapRegister: string;
    remediation: string;
    auditorResponse: string;
    closurePack: string;
  }
> = {
  'RBI Evidence Pack': {
    checklist: 'Evidence Checklist\n- RBI cyber policy attestation\n- DR drill evidence\n- privileged access review logs',
    controlMap: 'Control Mapping\n- RBI-CSF-7.2 -> IAM quarterly control\n- RBI-CSF-9.1 -> DR rehearsal evidence',
    gapRegister: 'Gap Register\n- G-11 delayed DR attestation closure\n- G-14 missing maker-checker evidence for one quarter',
    remediation: 'Remediation Plan\n- Complete DR sign-off within 7 business days\n- Backfill maker-checker artifacts and automate monthly extraction',
    auditorResponse: 'Auditor Response\n- Interim evidence shared\n- permanent control automation target date: 2026-08-15',
    closurePack: 'Closure Pack\n- signed evidence bundle\n- control owner attestation\n- closure memo and issue tracker links',
  },
  'PCI DSS Evidence Pack': {
    checklist: 'Evidence Checklist\n- key rotation report\n- segmentation validation\n- vulnerability remediation snapshots',
    controlMap: 'Control Mapping\n- PCI-3.6 -> key rotation control\n- PCI-11.3 -> penetration test control',
    gapRegister: 'Gap Register\n- G-22 delayed rotation evidence for one card domain\n- G-24 incomplete quarterly scan sign-off',
    remediation: 'Remediation Plan\n- enforce key-rotation runbook checks\n- add compliance gate for scan sign-off',
    auditorResponse: 'Auditor Response\n- compensating controls accepted pending automation cutover',
    closurePack: 'Closure Pack\n- QBR control results\n- signed compliance worksheet\n- exception retirement evidence',
  },
  'Open Audit Findings': {
    checklist: 'Evidence Checklist\n- finding owner action logs\n- proof of control execution\n- timeline vs agreed milestones',
    controlMap: 'Control Mapping\n- A-101 -> privileged access review\n- A-104 -> operational alert acknowledgement',
    gapRegister: 'Gap Register\n- two medium findings beyond SLA\n- one repeated observation in payments domain',
    remediation: 'Remediation Plan\n- weekly owner review\n- escalation to governance council for repeated finding',
    auditorResponse: 'Auditor Response\n- revised closure dates submitted with dependency notes',
    closurePack: 'Closure Pack\n- final test evidence\n- internal audit acceptance note\n- closure governance sign-off',
  },
  'Control Violations': {
    checklist: 'Evidence Checklist\n- violation event list\n- impacted systems\n- temporary compensating controls',
    controlMap: 'Control Mapping\n- CV-03 change approval bypass\n- CV-07 evidence retention exception',
    gapRegister: 'Gap Register\n- recurring after-hours approval bypass pattern',
    remediation: 'Remediation Plan\n- enforce approval API guardrail\n- alert on bypass attempts with pager escalation',
    auditorResponse: 'Auditor Response\n- root cause acknowledged and patch plan approved',
    closurePack: 'Closure Pack\n- post-fix validation run\n- no-repeat evidence for 30-day watch window',
  },
  'Remediation Plan': {
    checklist: 'Evidence Checklist\n- action owner matrix\n- target completion dates\n- dependency tracker',
    controlMap: 'Control Mapping\n- RP-01 owner accountability\n- RP-04 closure verification protocol',
    gapRegister: 'Gap Register\n- delayed control re-test schedule for one vendor dependency',
    remediation: 'Remediation Plan\n- phase 1 quick controls\n- phase 2 systemic automation and periodic attestation',
    auditorResponse: 'Auditor Response\n- phased plan accepted with monthly progress review',
    closurePack: 'Closure Pack\n- closure dashboard snapshot\n- governance council ratification note',
  },
  'Compliance Summary': {
    checklist: 'Evidence Checklist\n- quarterly control scorecard\n- unresolved findings list\n- exception inventory',
    controlMap: 'Control Mapping\n- summary aligns RBI, PCI DSS, ISO control clusters',
    gapRegister: 'Gap Register\n- 3 open medium gaps, 0 critical gaps',
    remediation: 'Remediation Plan\n- execute closure sprint for medium gaps in next cycle',
    auditorResponse: 'Auditor Response\n- compliance posture acceptable with active remediation',
    closurePack: 'Closure Pack\n- executive summary deck\n- signed compliance memo\n- evidentiary appendix',
  },
};

function statusStyle(status: string) {
  if (status === 'Compliant') return { c: colors.success, b: `${colors.success}22` };
  if (status === 'In Progress') return { c: colors.info, b: `${colors.info}22` };
  return { c: colors.warning, b: `${colors.warning}22` };
}

export function GovernanceCompliancePage() {
  const [selectedPrompt, setSelectedPrompt] = useState<CompliancePrompt>('RBI Evidence Pack');
  const pack = useMemo(() => COMPLIANCE_OUTPUTS[selectedPrompt], [selectedPrompt]);

  return (
    <Box>
      <EnterpriseArtifactWorkspace pillar="Governance" submenu="Compliance Automation" />

      <GlassCard sx={{ p: 2, mb: 1.5 }} glow="green" hover={false}>
        <ModuleHeader title="Compliance Automation Prompts" subtitle="Deterministic compliance packs by control objective" />
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.25 }}>
          {COMPLIANCE_PROMPTS.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              onClick={() => setSelectedPrompt(chip)}
              sx={{
                fontSize: '0.68rem',
                bgcolor: selectedPrompt === chip ? `${colors.success}24` : colors.bg.glass,
                color: selectedPrompt === chip ? colors.success : colors.text.secondary,
                border: `1px solid ${selectedPrompt === chip ? colors.success : colors.border.subtle}`,
              }}
            />
          ))}
        </Box>
        <Grid container spacing={1}>
          {[
            ['Evidence Checklist', pack.checklist],
            ['Control Mapping', pack.controlMap],
            ['Gap Register', pack.gapRegister],
            ['Remediation Plan', pack.remediation],
            ['Auditor Response', pack.auditorResponse],
            ['Closure Pack', pack.closurePack],
          ].map(([title, content]) => (
            <Grid key={title} size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 1.25, borderRadius: 1.25, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.success }}>{title}</Typography>
                <Typography component="pre" sx={{ m: 0, mt: 0.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.7rem', color: colors.text.secondary }}>
                  {content}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </GlassCard>

      <Grid container spacing={1.5}>
        {kpis.map((kpi, i) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <KpiCard label={kpi.label} value={kpi.value} suffix={kpi.suffix} trend={kpi.trend} compact delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Regulatory Compliance Control Register" subtitle="Context: RBI / PCI-DSS / ISO27001 tracking" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Regulation</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Control</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const s = statusStyle(row.status);
                return (
                  <TableRow key={row.control} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>{row.regulation}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.primary }}>{row.control}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.owner}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, color: s.c, bgcolor: s.b, fontWeight: 700 }}>{row.status}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <HubArtifactGenerator hubKey="compliance" />
    </Box>
  );
}
