/**
 * Strongly typed deterministic enterprise artifact catalogue.
 * Source: ADIP_Deterministic_Data_Pack (prompt/artifact/page/golden-demo JSON).
 */
import type { Artifact, ArtifactSection, ApprovalStatus } from '../types/artifacts';
import { createArtifact } from './artifactBuilder';
import promptCatalogue from './deterministic/prompt-catalogue.json';
import artifactCatalogue from './deterministic/artifact-catalogue.json';
import pageMetadata from './deterministic/page-metadata.json';
import goldenDemoPacks from './deterministic/golden-demo-packs.json';
import promptToArtifactMapping from './deterministic/prompt-to-artifact-mapping.json';
import biometricScenario from './deterministic/biometric-login-linked-scenario.json';

export const GENERIC_FALLBACK_PHRASE =
  'Relevant supporting evidence generated from the same deterministic context.';

export type Pillar = 'Executive AI' | 'AI SDLC' | 'Governance' | 'Enterprise AI';

export interface PromptDefinition {
  prompt_id: string;
  pillar: Pillar;
  submenu: string;
  label: string;
  purpose: string;
  page_id: string;
  default_context: string;
  primary_artifact_id: string;
  supporting_artifact_ids: string[];
  workflow_id: string;
  reviewer_role: string;
  approver_role: string;
  supported_formats: ('docx' | 'pdf' | 'json')[];
  demo_pack_id: string;
  generation_mode: 'deterministic';
  status: string;
}

export interface ArtifactDefinition {
  artifact_id: string;
  pillar: Pillar;
  submenu: string;
  name: string;
  target_audience: string[];
  required_sections: string[];
  sample_realistic_data: string;
  formats: ('docx' | 'pdf' | 'json')[];
  review_status: string;
}

export interface PageMetadataEntry {
  page_id: string;
  pillar: Pillar;
  submenu: string;
  title: string;
  purpose: string;
  route: string;
  route_status: string;
  navigation_order: number;
  prompt_count: number;
  artifact_count: number;
  demo_pack_id: string;
  default_prompt_id: string;
  generation_mode: 'deterministic';
  runtime_llm_required: false;
  parked_capabilities: string[];
}

interface GoldenArtifactSection {
  section_id?: string;
  heading: string;
  content: string;
}

interface GoldenGeneratedArtifact {
  artifact_id: string;
  role?: string;
  title?: string;
  summary?: string;
  sections?: GoldenArtifactSection[];
}

interface PackKpi {
  kpi_id: string;
  label: string;
  value: number;
  unit: string;
}

interface PackRisk {
  risk_id: string;
  statement: string;
  severity: string;
  owner: string;
  due_date: string;
  status: string;
}

interface PackRecommendation {
  recommendation_id: string;
  text: string;
  owner: string;
  target_date: string;
  status: string;
}

export interface GoldenDemoPack {
  demo_pack_id: string;
  page_id: string;
  pillar: Pillar;
  submenu: string;
  selected_prompt_id: string;
  selected_prompt: string;
  input_context: {
    title?: string;
    scenario_id?: string | null;
    as_of_date?: string;
    data_classification?: string;
    generation_seed?: string;
  };
  generated_artifacts: GoldenGeneratedArtifact[];
  kpis?: PackKpi[];
  risks?: PackRisk[];
  recommendations?: PackRecommendation[];
  owners?: Array<{ role: string; name: string }>;
  dates?: { generated_on?: string; review_due?: string; approval_due?: string };
}

interface ContentContext {
  heading: string;
  sectionIndex: number;
  artifactId: string;
  def: ArtifactDefinition;
  prompt: PromptDefinition;
  pack?: GoldenDemoPack;
  page?: PageMetadataEntry;
  isPrimary: boolean;
  golden?: GoldenGeneratedArtifact;
}

const PROMPTS = promptCatalogue as PromptDefinition[];
const ARTIFACTS = artifactCatalogue as ArtifactDefinition[];
const PAGES = pageMetadata as PageMetadataEntry[];
const PACKS = goldenDemoPacks as GoldenDemoPack[];
const MAPPINGS = promptToArtifactMapping as Array<{
  prompt_id: string;
  primary_artifact_id: string;
  supporting_artifact_ids: string[];
  demo_pack_id: string;
}>;

const BIOMETRIC_SCENARIO = biometricScenario as {
  scenario_id: string;
  name: string;
  application_id: string;
  release_id: string;
  flow: Array<{ prompt_id: string }>;
  traceability: {
    requirements: Array<{ id: string; text: string; status: string }>;
    design_components: Array<{ id: string; name: string; requirements: string[] }>;
    apis: Array<{ id: string; method: string; path: string; component_id: string }>;
    sprint_tasks: Array<{ id: string; story_id: string; title: string; status: string }>;
    tests: Array<{ id: string; type: string; expected: string }>;
    controls: Array<{ id: string; name: string }>;
    release_artifacts: Array<{ id: string; type: string; release_id: string }>;
  };
};

const BIOMETRIC_PROMPT_IDS = new Set(BIOMETRIC_SCENARIO.flow.map((s) => s.prompt_id));

const PROMPTS_BY_PAGE = new Map<string, PromptDefinition[]>();
const ARTIFACT_BY_ID = new Map(ARTIFACTS.map((a) => [a.artifact_id, a]));
const PAGE_BY_ID = new Map(PAGES.map((p) => [p.page_id, p]));
const PACK_BY_ID = new Map(PACKS.map((p) => [p.demo_pack_id, p]));
const MAPPING_BY_PROMPT = new Map(MAPPINGS.map((m) => [m.prompt_id, m]));

for (const prompt of PROMPTS) {
  if (prompt.status !== 'active') continue;
  const list = PROMPTS_BY_PAGE.get(prompt.page_id) ?? [];
  if (list.length < 6) list.push(prompt);
  PROMPTS_BY_PAGE.set(prompt.page_id, list);
}

function normalizeHeading(heading: string): string {
  return heading.trim().toLowerCase().replace(/\s+/g, ' ');
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isLowQualityContent(content: string, summary?: string): boolean {
  if (!content?.trim()) return true;
  if (content.includes(GENERIC_FALLBACK_PHRASE)) return true;
  const colonIdx = content.indexOf(':');
  if (colonIdx > 0 && summary) {
    const after = content.slice(colonIdx + 1).trim();
    if (after === summary.trim()) return true;
  }
  return false;
}

function isBiometricContext(ctx: ContentContext): boolean {
  return (
    ctx.pack?.input_context?.scenario_id === BIOMETRIC_SCENARIO.scenario_id
    || BIOMETRIC_PROMPT_IDS.has(ctx.prompt.prompt_id)
    || /biometric/i.test(ctx.prompt.label)
  );
}

function biometricSectionContent(artifactId: string, headingKey: string): string | undefined {
  const t = BIOMETRIC_SCENARIO.traceability;
  const reqLines = t.requirements.map((r) => `• ${r.id}: ${r.text} (${r.status})`).join('\n');
  const apiLines = t.apis.map((a) => `• ${a.id} ${a.method} ${a.path}`).join('\n');
  const taskLines = t.sprint_tasks.map((s) => `• ${s.id} [${s.story_id}] ${s.title} — ${s.status}`).join('\n');
  const testLines = t.tests.map((tc) => `• ${tc.id} (${tc.type}): ${tc.expected}`).join('\n');
  const compLines = t.design_components.map((c) => `• ${c.id} ${c.name}`).join('\n');

  if (artifactId === 'AR-020') {
    switch (headingKey) {
      case 'executive summary':
        return `Business case for ${BIOMETRIC_SCENARIO.name} on ${BIOMETRIC_SCENARIO.application_id} (${BIOMETRIC_SCENARIO.release_id}). Retail customers authenticate with device biometrics and MPIN fallback under RBI-aligned controls.`;
      case 'objectives':
        return '• Reduce authentication friction for enrolled retail customers.\n• Maintain strong customer authentication with auditable fallback.\n• Achieve p95 login completion within three seconds (NFR-BIO-001).';
      case 'scope':
        return 'In scope: Mobile Banking Android/iOS clients, authentication orchestrator, device registry integration, audit service.\nOut of scope: corporate banking channels and web-only login in this release.';
      case 'stakeholders':
        return '• Product: Mobile Banking Product Head\n• Engineering: Identity Platform Lead\n• Risk: CISO Office\n• Operations: Service Desk Manager';
      case 'business requirements':
        return reqLines;
      case 'assumptions':
        return '• Device binding is completed before biometric enrollment.\n• IAM session tokens remain authoritative for authorization.\n• MPIN fallback remains available after three failed biometric attempts.';
      case 'risks':
        return '• Android 15 biometric SDK defect may affect 8% of active users.\n• Fraud replay attempts require nonce validation (CTRL-SEC-12).';
      case 'success measures':
        return '• 45% biometric adoption within 90 days of rollout.\n• 32% reduction in password-reset calls.\n• p95 login latency ≤ 3 seconds.';
      default:
        break;
    }
  }

  if (artifactId === 'AR-021') {
    switch (headingKey) {
      case 'actors':
        return '• Retail customer (enrolled device)\n• Mobile Banking app\n• Authentication Orchestrator (CMP-BIO-AUTH)\n• IAM token service';
      case 'functional requirements':
        return t.requirements.filter((r) => r.id.startsWith('FR')).map((r) => `• ${r.id}: ${r.text}`).join('\n');
      case 'flows':
        return 'Main flow: customer launches app → device enrollment verified → biometric prompt → assertion validated → session issued.\nAlternate: MPIN fallback via API-BIO-003 after failure threshold.';
      case 'exception handling':
        return '• Expired biometric keys route to re-enrollment.\n• Device binding mismatch blocks login and raises SEC alert.\n• Three failures trigger MPIN path (TC-BIO-004).';
      case 'interfaces':
        return apiLines;
      case 'controls':
        return t.controls.map((c) => `• ${c.id}: ${c.name}`).join('\n');
      default:
        break;
    }
  }

  if (artifactId === 'AR-022' && headingKey === 'story') {
    return '• US-BIO-001: Biometric login for enrolled retail customers\n• US-BIO-002: MPIN fallback after failed biometric attempts\n• US-BIO-003: Structured authentication audit events';
  }

  if (artifactId === 'AR-027' || artifactId === 'AR-028') {
    if (headingKey.includes('component') || headingKey.includes('architecture')) return compLines;
    if (headingKey.includes('api') || headingKey.includes('interface')) return apiLines;
  }

  if (artifactId === 'AR-035' && headingKey.includes('sprint')) return taskLines;
  if (artifactId === 'AR-042' && (headingKey.includes('readiness') || headingKey.includes('release'))) {
    return t.release_artifacts.map((r) => `• ${r.id} ${r.type} for ${r.release_id}`).join('\n');
  }

  if (headingKey.includes('test')) return testLines;
  if (headingKey.includes('requirement')) return reqLines;
  return undefined;
}

function investmentBusinessCaseSection(headingKey: string, ctx: ContentContext): string | undefined {
  if (ctx.artifactId !== 'AR-014') return undefined;
  const kpis = ctx.pack?.kpis ?? [];
  const ask = kpis.find((k) => k.label.toLowerCase().includes('investment'));
  const benefit = kpis.find((k) => k.label.toLowerCase().includes('benefit'));
  const roi = kpis.find((k) => k.label.toLowerCase().includes('roi'));
  const payback = kpis.find((k) => k.label.toLowerCase().includes('payback'));
  const risk = ctx.pack?.risks?.[0];
  const rec = ctx.pack?.recommendations?.[0];

  switch (headingKey) {
    case 'problem':
      return 'Password-reset call volume and authentication abandonment remain elevated in Mobile Banking. Legacy OTP flows increase fraud exposure and operational cost across the service desk.';
    case 'options':
      return 'Option A — Passkey / biometric authentication (recommended): phased rollout with device-level feature flags.\nOption B — SMS OTP hardening only: lower cost, limited CX uplift.\nOption C — Status quo: no incremental funding; continued cost leakage.';
    case 'benefits':
      return `Projected three-year benefit: ${benefit ? `${benefit.value} ${benefit.unit}` : '₹4.8 crore'}.\n• 32% reduction in password-reset calls.\n• 4.5 percentage-point improvement in successful login conversion.`;
    case 'cost':
      return `Total investment ask: ${ask ? `${ask.value} ${ask.unit}` : '₹2.1 crore'} including mobile client changes, IAM integration, audit logging and hypercare.`;
    case 'roi':
      return `Three-year ROI: ${roi ? `${roi.value}${roi.unit}` : '128%'}; payback ${payback ? `${payback.value} ${payback.unit}` : '16 months'}.`;
    case 'risk':
      return risk
        ? `${risk.statement} Severity: ${risk.severity}. Owner: ${risk.owner}. Target: ${risk.due_date}.`
        : 'Adoption risk if customer enrollment campaigns slip beyond Q3 FY27.';
    case 'recommendation':
      return rec
        ? `${rec.text} Owner: ${rec.owner}. Target date: ${rec.target_date}.`
        : 'Approve phased funding for Passkey authentication with Investment Committee review on 2026-07-31.';
    default:
      return undefined;
  }
}

function headingTemplate(ctx: ContentContext): string {
  const { heading, sectionIndex, def, prompt, pack, artifactId } = ctx;
  const hk = normalizeHeading(heading);
  const sample = def.sample_realistic_data;
  const title = pack?.input_context?.title ?? prompt.default_context;
  const audience = def.target_audience.join(', ');
  const kpis = pack?.kpis ?? [];
  const risks = pack?.risks ?? [];
  const recs = pack?.recommendations ?? [];
  const kpi = kpis[sectionIndex % Math.max(kpis.length, 1)];
  const owner = pack?.owners?.[0]?.name ?? prompt.reviewer_role;
  const date = pack?.dates?.review_due ?? pack?.input_context?.as_of_date ?? '2026-07-15';

  switch (hk) {
    case 'executive summary':
    case 'executive context':
      return `${def.name} prepared for ${prompt.label}.\n${sample}\n\nContext: ${title}\nAudience: ${audience}\nReview due: ${date}.`;
    case 'top changes':
      return '• Mobile Banking v9.2 biometric login enters CAB review.\n• UPI Lite settlement resilience patch scheduled for 2026-07-18.\n• Portfolio health steady at 87% with one high-risk dependency on identity service.';
    case 'key risks':
    case 'risks':
    case 'risk':
      return risks.length
        ? risks.map((r) => `• [${r.severity}] ${r.statement} (Owner: ${r.owner}, due ${r.due_date})`).join('\n')
        : `Tracked risks for ${prompt.label} under workflow ${prompt.workflow_id}.`;
    case 'decisions required':
      return '• Approve phased biometric rollout percentage for July CAB.\n• Confirm hypercare staffing for release weekend.\n• Endorse exception path for legacy OTP sunset timeline.';
    case 'recommended actions':
    case 'recommendations':
    case 'recommendation':
      return recs.length
        ? recs.map((r) => `• ${r.text} — ${r.owner} (target ${r.target_date})`).join('\n')
        : `Complete governance review for ${prompt.label} and attach evidence to ${prompt.workflow_id}.`;
    case 'owners':
      return (pack?.owners ?? [])
        .map((o) => `• ${o.role.replace(/_/g, ' ')}: ${o.name}`)
        .join('\n') || `Reviewer: ${prompt.reviewer_role}; Approver: ${prompt.approver_role}.`;
    case 'portfolio kpis':
    case 'delivery health':
      return kpis.length
        ? kpis.map((k) => `• ${k.label}: ${k.value}${k.unit ? ` ${k.unit}` : ''}`).join('\n')
        : `Delivery health indicators for ${prompt.submenu} remain within tolerance bands.`;
    case 'incidents':
      return '• INC-4421: intermittent biometric SDK timeout on Android 15 (mitigated).\n• No Sev-1 production incidents open for payments core.';
    case 'cost and benefit':
    case 'financial impact':
    case 'benefits':
      return kpi
        ? `${kpi.label}: ${kpi.value}${kpi.unit ? ` ${kpi.unit}` : ''}. ${sample}`
        : sample;
    case 'wave plan':
      return 'Wave 1 (Q3 FY27): identity and mobile client modernization.\nWave 2 (Q4 FY27): payments core decoupling.\nWave 3 (Q1 FY28): legacy channel retirement.';
    case 'candidate systems':
      return '• APP-CORE-PAY (EOL 2027-Q2) — priority 1\n• APP-LEG-OTP (technical debt index 78) — priority 2\n• APP-MB-001 Mobile Banking — cloud-ready';
    case 'dependencies':
      return '• Identity service upgrade gates biometric release.\n• Device registry API capacity review required before 10% rollout.\n• Audit log pipeline must accept 12k events/minute.';
    case 'milestones':
      return '• 2026-07-15 — architecture sign-off\n• 2026-07-22 — CAB readiness review\n• 2026-07-29 — phased production rollout';
    default:
      return `${capitalize(heading)} — ${def.name} (${artifactId})\n${sample}\n\nMetric focus: ${kpi ? `${kpi.label} ${kpi.value}${kpi.unit ? ` ${kpi.unit}` : ''}` : prompt.label}\nWorkflow: ${prompt.workflow_id} · Owner: ${owner}`;
  }
}

function buildSectionContent(ctx: ContentContext): string {
  const hk = normalizeHeading(ctx.heading);
  const goldenSection = ctx.golden?.sections?.find((s) => normalizeHeading(s.heading) === hk);
  if (goldenSection && !isLowQualityContent(goldenSection.content, ctx.golden?.summary)) {
    return goldenSection.content;
  }

  if (isBiometricContext(ctx)) {
    const bio = biometricSectionContent(ctx.artifactId, hk);
    if (bio) return bio;
  }

  const investment = investmentBusinessCaseSection(hk, ctx);
  if (investment) return investment;

  return headingTemplate(ctx);
}

function buildSections(
  def: ArtifactDefinition,
  ctx: Omit<ContentContext, 'heading' | 'sectionIndex'>,
): ArtifactSection[] {
  const golden = ctx.golden;
  const headings =
    golden?.sections?.length && golden.sections.some((s) => !isLowQualityContent(s.content, golden.summary))
      ? golden.sections.map((s) => s.heading)
      : def.required_sections;

  return headings.map((heading, sectionIndex) => ({
    title: heading,
    content: buildSectionContent({ ...ctx, heading, sectionIndex }),
  }));
}

function buildExecutiveSummary(
  sections: ArtifactSection[],
  def: ArtifactDefinition,
  prompt: PromptDefinition,
  golden?: GoldenGeneratedArtifact,
  pack?: GoldenDemoPack,
): string {
  if (golden?.summary && !isLowQualityContent(golden.summary)) {
    return golden.summary;
  }
  const lead = sections[0]?.content?.split('\n')[0];
  if (lead && !isLowQualityContent(lead)) return lead;
  return `${def.name} for ${prompt.label}: ${def.sample_realistic_data} Context: ${pack?.input_context?.title ?? prompt.default_context}.`;
}

function previewFromSections(sections: ArtifactSection[], title: string): string {
  return sections.map((s) => `${s.title}\n${s.content}`).join('\n\n').slice(0, 4000) || title;
}

function fileTypeFromFormats(formats: string[]): 'docx' | 'xlsx' | 'yaml' | 'png' {
  if (formats.includes('docx')) return 'docx';
  return 'docx';
}

export function listPages(): PageMetadataEntry[] {
  return [...PAGES].sort((a, b) => a.navigation_order - b.navigation_order);
}

export function getPageById(pageId: string): PageMetadataEntry | undefined {
  return PAGE_BY_ID.get(pageId);
}

export function getPageByRoute(route: string): PageMetadataEntry | undefined {
  return PAGES.find((p) => p.route === route);
}

export function getPageByPillarAndSubmenu(pillar: Pillar, submenu: string): PageMetadataEntry | undefined {
  return PAGES.find((p) => p.pillar === pillar && p.submenu === submenu);
}

export function getPromptsForPage(pageId: string): PromptDefinition[] {
  return PROMPTS_BY_PAGE.get(pageId) ?? [];
}

export function getPromptById(promptId: string): PromptDefinition | undefined {
  return PROMPTS.find((p) => p.prompt_id === promptId);
}

export function getArtifactDefinition(artifactId: string): ArtifactDefinition | undefined {
  return ARTIFACT_BY_ID.get(artifactId);
}

export function getDemoPack(demoPackId: string): GoldenDemoPack | undefined {
  return PACK_BY_ID.get(demoPackId);
}

/** Deterministic offline generation — no LLM, stable AR-### IDs. */
export function generateDeterministicArtifacts(promptId: string): Artifact[] {
  const prompt = getPromptById(promptId);
  const mapping = MAPPING_BY_PROMPT.get(promptId);
  if (!prompt || !mapping) return [];

  const pack = getDemoPack(mapping.demo_pack_id);
  const page = getPageById(prompt.page_id);
  const artifactIds = [mapping.primary_artifact_id, ...mapping.supporting_artifact_ids];
  const seen = new Set<string>();
  const results: Artifact[] = [];
  const anchorDate = pack?.dates?.generated_on ?? pack?.input_context?.as_of_date ?? '2026-07-11';
  const anchorTimestamp = `${anchorDate} 10:00:00`;

  for (const artifactId of artifactIds) {
    if (seen.has(artifactId)) continue;
    seen.add(artifactId);
    const def = getArtifactDefinition(artifactId);
    if (!def) continue;

    const golden = pack?.generated_artifacts.find((g) => g.artifact_id === artifactId);
    const isPrimary = artifactId === mapping.primary_artifact_id;
    const name = golden?.title ?? `${def.name} — ${prompt.label}`;
    const sections = buildSections(def, {
      artifactId,
      def,
      prompt,
      pack,
      page,
      isPrimary,
      golden,
    });
    const executiveSummary = buildExecutiveSummary(sections, def, prompt, golden, pack);
    const previewContent = previewFromSections(sections, name);

    const artifact = createArtifact({
      id: artifactId,
      name,
      generatedBy: 'Enterprise Artifact Workspace (Deterministic)',
      modelUsed: 'Not applicable',
      version: '1.0',
      approvalStatus: 'Pending Review' as ApprovalStatus,
      fileType: fileTypeFromFormats(def.formats),
      previewContent,
      executiveSummary,
      riskRating: isPrimary ? 'Medium' : 'Low',
      sections,
      changeSummary: `Deterministic generation for ${prompt.prompt_id} / ${pack?.demo_pack_id ?? mapping.demo_pack_id}`,
      context: {
        source: prompt.page_id,
        feature: prompt.submenu,
        subject: prompt.label,
      },
    });

    results.push({
      ...artifact,
      generatedDate: anchorDate,
      timestamp: anchorTimestamp,
      previewContent,
    });
  }

  return results;
}
