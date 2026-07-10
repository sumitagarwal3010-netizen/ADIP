import type { CioAdvisorKind, CioAdvisorPromptDef, ExecutiveInsight } from '../types/executiveInsight';

export const EXECUTIVE_ADVISOR_PROMPTS: CioAdvisorPromptDef[] = [
  { id: 'cio-briefing', label: "Today's CIO Briefing" },
  { id: 'delivery-risk', label: 'Delivery Risk Summary' },
  { id: 'blocked-releases', label: 'Blocked Releases' },
  { id: 'incident-impact', label: 'Incident Impact' },
  { id: 'regulatory-alerts', label: 'Regulatory Alerts' },
  { id: 'executive-actions', label: 'Executive Actions' },
];

export const TECHNOLOGY_ADVISOR_PROMPTS: CioAdvisorPromptDef[] = [
  { id: 'modernization-candidates', label: 'Modernization Candidates' },
  { id: 'cloud-migration-order', label: 'Cloud Migration Order' },
  { id: 'tech-debt-hotspots', label: 'Tech Debt Hotspots' },
  { id: 'obsolete-platforms', label: 'Obsolete Platforms' },
  { id: 'architecture-risk', label: 'Architecture Risk' },
  { id: 'platform-health', label: 'Platform Health' },
];

export const INVESTMENT_ADVISOR_PROMPTS: CioAdvisorPromptDef[] = [
  { id: 'roi-prioritization', label: 'ROI Prioritization' },
  { id: 'budget-risk', label: 'Budget Risk' },
  { id: 'cost-optimization', label: 'Cost Optimization' },
  { id: 'vendor-bottlenecks', label: 'Vendor Bottlenecks' },
  { id: 'roadmap-recommendation', label: 'Roadmap Recommendation' },
  { id: 'three-year-plan', label: '3-Year Investment Plan' },
];

export const CIO_ADVISOR_PROMPTS: Record<CioAdvisorKind, CioAdvisorPromptDef[]> = {
  executive: EXECUTIVE_ADVISOR_PROMPTS,
  technology: TECHNOLOGY_ADVISOR_PROMPTS,
  investment: INVESTMENT_ADVISOR_PROMPTS,
};

const INSIGHTS: Record<string, ExecutiveInsight> = {
  'cio-briefing': {
    id: 'cio-briefing',
    advisor: 'executive',
    prompt: "Today's CIO Briefing",
    executiveSummary:
      'Enterprise technology posture is stable at 78% health. UPI Auto-Reversal and Merchant Settlement remain the two programs requiring CIO attention today. Three P1 delivery risks and one open regulatory watch item (RBI digital lending circular) are on the morning board pack.',
    keyRisks: [
      'UPI Gateway timeout spike (P1) — 12% of peak-hour reversals delayed beyond SLA',
      'Release 24.6 blocked on CAB evidence for AML control attestation',
      'Java 8 estate on Cards Authorization still outside preferred standards',
    ],
    businessImpact:
      'Delayed reversals elevate customer complaint volume in Mobile Banking and Net Banking. A missed CAB window for Release 24.6 slips merchant settlement benefits by one sprint (~₹4.2M deferred value).',
    recommendedActions: [
      'Authorize surge capacity on UPI Gateway and freeze non-critical change until latency < 180ms p95',
      'Direct Audit & Release owners to close AML evidence pack before Thursday CAB',
      'Confirm Cards Authorization Java 17 wave funding in this week’s investment stand-up',
    ],
    decisionRequired:
      'Approve temporary change freeze on UPI critical path and escalate Release 24.6 to emergency CAB if evidence is not complete by Wednesday EOD.',
    financialImpact:
      'At-risk value this week: ₹4.2M deferred merchant settlement benefit; incident overtime exposure ~₹0.8M if P1 persists beyond 48 hours.',
    ownerTimeline: 'CIO / Head of Payments Engineering · Decision by today 17:00 IST · Follow-up in Thursday CAB',
    confidenceScore: 91,
  },

  'delivery-risk': {
    id: 'delivery-risk',
    advisor: 'executive',
    prompt: 'Delivery Risk Summary',
    executiveSummary:
      'Portfolio delivery risk averages 34% across active programs. Payments and Fraud Management concentrate 61% of high-severity delivery risk. Testing backlog on Mobile SDK and architecture sign-off lag on AML workflow are the primary drivers.',
    keyRisks: [
      'Mobile SDK regression pack coverage at 71% vs 90% gate',
      'AML workflow architecture sign-off overdue by 9 days',
      'Cross-border payments initiative capacity shortfall of 3 FTEs',
    ],
    businessImpact:
      'Elevated delivery risk threatens Q2 release commitments for UPI and Cards. Customer-facing defect escape probability rises ~18% if Mobile SDK gate is waived.',
    recommendedActions: [
      'Reallocate 2 QA engineers from Treasury batch to Mobile SDK regression',
      'Schedule emergency architecture board for AML workflow this week',
      'Hold Cross-border scope to MVP until capacity is restored',
    ],
    decisionRequired: 'Decide whether to slip Cross-border MVP by one sprint or approve contractor surge (₹1.1M).',
    financialImpact: 'Delivery risk exposure estimated at ₹9.6M in delayed benefits if both UPI and Cards slip one sprint.',
    ownerTimeline: 'Delivery PMO · CIO review Friday · Actions due within 5 business days',
    confidenceScore: 87,
  },

  'blocked-releases': {
    id: 'blocked-releases',
    advisor: 'executive',
    prompt: 'Blocked Releases',
    executiveSummary:
      'Four releases are blocked from production. Release 24.6 (UPI) and Cards Auth Hotfix are CAB-blocked; Trade Finance API and KYC Refresh await environment clearance.',
    keyRisks: [
      'Release 24.6 — missing AML control attestation evidence',
      'Cards Auth Hotfix — rollback drill not signed by Ops',
      'Trade Finance API — lower environment data refresh incomplete',
    ],
    businessImpact:
      'Blocked UPI release delays auto-reversal SLA improvement for ~2.1M daily transactions. Cards hotfix leaves known authorization timeout defect in production.',
    recommendedActions: [
      'Assign single evidence owner for Release 24.6 AML pack with daily CIO status',
      'Mandate Ops rollback sign-off for Cards Auth within 24 hours',
      'Prioritize Trade Finance data refresh over non-critical batch jobs tonight',
    ],
    decisionRequired: 'Approve emergency CAB slot for Release 24.6 on Thursday or formally slip to next window.',
    financialImpact: 'Each week of UPI slip defers ~₹2.1M benefit; Cards defect carries estimated ₹1.4M monthly complaint/ops cost.',
    ownerTimeline: 'Release Manager + CAB Chair · Decision by Wednesday · Execution this CAB cycle',
    confidenceScore: 89,
  },

  'incident-impact': {
    id: 'incident-impact',
    advisor: 'executive',
    prompt: 'Incident Impact',
    executiveSummary:
      'Last 24 hours: 1 P1 (UPI Gateway timeouts) and 2 P2s (Notification Hub lag, Fraud Scoring cold-start). Customer-impacting minutes: 47. Payments domain accounts for 82% of severity-weighted impact.',
    keyRisks: [
      'UPI Gateway connection pool saturation under peak NPCI traffic',
      'Notification Hub backlog delaying OTP and settlement alerts',
      'Fraud Scoring cold-start after overnight model reload',
    ],
    businessImpact:
      '47 customer-impacting minutes drove elevated complaint volume on Mobile Banking. Settlement alert lag increases operational reconciliation effort for merchant partners.',
    recommendedActions: [
      'Raise UPI Gateway pool limits and enable circuit-breaker telemetry dashboards',
      'Scale Notification Hub consumers and clear backlog before evening peak',
      'Move Fraud Scoring model warm-up into pre-peak runbook',
    ],
    decisionRequired: 'Authorize Priority-1 capacity spend for UPI Gateway (₹0.35M) without waiting for monthly change board.',
    financialImpact: 'Incident cost to date ~₹0.6M (ops + goodwill); avoided loss if stabilized today ~₹2.8M over the next week.',
    ownerTimeline: 'Incident Commander (Payments) · Stabilize within 6 hours · CIO readout at 20:00 IST',
    confidenceScore: 93,
  },

  'regulatory-alerts': {
    id: 'regulatory-alerts',
    advisor: 'executive',
    prompt: 'Regulatory Alerts',
    executiveSummary:
      'Three regulatory watch items are open: RBI digital lending disclosure update, PCI-DSS evidence refresh for Cards, and SEBI logging retention for Wealth APIs. None are overdue, but two close within 30 days.',
    keyRisks: [
      'Digital lending disclosure controls not yet mapped to Loan Origination APIs',
      'PCI-DSS quarterly evidence pack 62% complete for Cards Authorization',
      'Wealth API log retention below SEBI 8-year target on two microservices',
    ],
    businessImpact:
      'Non-compliance risk could trigger supervisory queries and delay product launches in Lending and Wealth. Cards PCI gap threatens merchant acquiring certification continuity.',
    recommendedActions: [
      'Map digital lending disclosures to Loan Origination API contracts this sprint',
      'Close PCI evidence gaps for Cards Authorization before month-end',
      'Extend Wealth API log retention and verify archival job success',
    ],
    decisionRequired: 'Confirm Compliance owner for digital lending mapping and accept 30-day remediation plan.',
    financialImpact: 'Potential supervisory / remediation exposure band ₹15–40M if alerts escalate; near-term remediation cost ~₹2.3M.',
    ownerTimeline: 'Chief Compliance Officer + CIO · Plan locked in 3 days · Remediation within 30 days',
    confidenceScore: 85,
  },

  'executive-actions': {
    id: 'executive-actions',
    advisor: 'executive',
    prompt: 'Executive Actions',
    executiveSummary:
      'Six CIO-level actions are open. Three are overdue: AML evidence for Release 24.6, Java 17 funding confirmation for Cards, and vendor concentration review with IBM/Oracle. Two actions are on track; one is blocked on Legal.',
    keyRisks: [
      'Overdue actions clustering in Payments and Cards domains',
      'Vendor concentration review blocked pending Legal contract extract',
      'No single owner for cross-domain capacity rebalancing',
    ],
    businessImpact:
      'Action slippage directly extends release and modernization delays, reducing confidence in the board technology pack.',
    recommendedActions: [
      'Close or formally re-date the three overdue actions by EOD tomorrow',
      'Unblock Legal extract for IBM/Oracle concentration review',
      'Appoint Delivery PMO as owner for cross-domain capacity rebalancing',
    ],
    decisionRequired: 'Accept re-dated action plan or escalate overdue owners in the Monday leadership forum.',
    financialImpact: 'Clearing overdue actions protects ₹11M of near-term committed benefits across UPI and Cards.',
    ownerTimeline: 'CIO Office · Daily stand-up until overdue count = 0 · Target: 5 business days',
    confidenceScore: 88,
  },

  'modernization-candidates': {
    id: 'modernization-candidates',
    advisor: 'technology',
    prompt: 'Modernization Candidates',
    executiveSummary:
      'Top modernization candidates: Mainframe COBOL Trade Finance modules, WebLogic on Cards Middleware, Java 8 services in Cards Authorization, and IBM MQ bridges on Payments. Combined estate covers 47 applications and ₹62M annual run cost.',
    keyRisks: [
      'Skills scarcity on Mainframe COBOL extending change lead times',
      'WebLogic license renewal in 11 months with rising unit cost',
      'Java 8 security patch cadence falling behind enterprise standard',
    ],
    businessImpact:
      'Delaying these waves keeps critical banking journeys on fragile platforms and inflates run cost versus strategic Kubernetes / Java 17 targets.',
    recommendedActions: [
      'Prioritize Trade Finance mainframe decomposition Wave 1 (8 apps)',
      'Move Cards Middleware from WebLogic to OpenShift-aligned runtime',
      'Complete Cards Authorization Java 17 upgrade in FY26 H1',
    ],
    decisionRequired: 'Approve Wave 1 modernization funding envelope of ₹28M for Trade Finance + Cards Middleware.',
    financialImpact: 'Wave 1 investment ₹28M; expected 3-year run-cost reduction ₹41M and risk reduction on 47 apps.',
    ownerTimeline: 'CTO / Technology Strategy · Funding decision this month · Wave 1 kickoff next quarter',
    confidenceScore: 86,
  },

  'cloud-migration-order': {
    id: 'cloud-migration-order',
    advisor: 'technology',
    prompt: 'Cloud Migration Order',
    executiveSummary:
      'Recommended migration order: (1) Notification Hub to AKS, (2) Merchant Settlement APIs to EKS, (3) Fraud Scoring batch to Databricks, (4) KYC document store to Blob/S3. Core Ledger and UPI Switch adapters remain on-prem through FY27.',
    keyRisks: [
      'Data residency constraints on KYC document store',
      'Latency sensitivity of UPI Switch adapters if moved prematurely',
      'Skills gap on AKS/EKS operations for Payments SRE',
    ],
    businessImpact:
      'Ordered migration reduces cloud spend waste and avoids latency regressions on UPI. Notification Hub move alone cuts peak OTP lag risk.',
    recommendedActions: [
      'Execute Notification Hub AKS migration in next change window',
      'Pilot Merchant Settlement on EKS with dual-run for two sprints',
      'Keep Core Ledger / UPI adapters on-prem pending latency proof',
    ],
    decisionRequired: 'Endorse the four-wave cloud order and defer Core Ledger cloud move to FY27.',
    financialImpact: 'Migration program ₹19M over 18 months; projected cloud efficiency gain ₹7.5M/year from Wave 1–2.',
    ownerTimeline: 'Cloud CoE + Payments Architecture · Decision in 2 weeks · Wave 1 in 45 days',
    confidenceScore: 84,
  },

  'tech-debt-hotspots': {
    id: 'tech-debt-hotspots',
    advisor: 'technology',
    prompt: 'Tech Debt Hotspots',
    executiveSummary:
      'Highest tech-debt concentration: Cards Authorization (Java 8 + WebLogic), Trade Finance (COBOL + DB2), and AML batch (monolith + Oracle 19c). Debt index 64% on these three vs enterprise average 38%.',
    keyRisks: [
      'Unpatched CVE exposure on Java 8 runtime in Cards',
      'Change failure rate 2.1× higher on Trade Finance COBOL modules',
      'AML monolith blocking parallel feature delivery',
    ],
    businessImpact:
      'Debt hotspots slow regulatory change and elevate production incident probability in Cards and Trade Finance.',
    recommendedActions: [
      'Ring-fence 15% of Cards capacity for debt retirement each sprint',
      'Extract AML screening API from monolith as first strangler step',
      'Fund Trade Finance automated test harness before further COBOL change',
    ],
    decisionRequired: 'Mandate debt-retirement capacity allocation (15%) for Cards and Trade Finance through FY26.',
    financialImpact: 'Debt interest (extra ops + delayed features) estimated ₹14M/year; remediation program ₹22M.',
    ownerTimeline: 'Application Portfolio + Domain CTOs · Policy decision this month',
    confidenceScore: 90,
  },

  'obsolete-platforms': {
    id: 'obsolete-platforms',
    advisor: 'technology',
    prompt: 'Obsolete Platforms',
    executiveSummary:
      'Obsolete / end-of-support platforms in production: Java 8 (34 apps), .NET Framework 4.8 (12 apps), WebLogic (9 apps), Mainframe COBOL modules (18 apps), IBM MQ legacy bridges (7 apps).',
    keyRisks: [
      'Vendor end-of-support leaving security patch gaps',
      'License renewals on obsolete stacks at premium pricing',
      'Hiring difficulty for COBOL and WebLogic specialists',
    ],
    businessImpact:
      'Obsolete platforms increase audit findings and constrain product velocity in Cards, Trade Finance, and Corporate Banking.',
    recommendedActions: [
      'Publish eliminate stance for Java 8 and WebLogic with FY26 exit dates',
      'Consolidate IBM MQ bridges onto Kafka 3.6 for Payments events',
      'Start COBOL exit for lowest-criticality Trade Finance batch first',
    ],
    decisionRequired: 'Approve enterprise eliminate stance and exit dates for Java 8 and WebLogic.',
    financialImpact: 'Avoided premium license/support ~₹8M/year post-exit; transition cost ₹31M across waves.',
    ownerTimeline: 'Technology Standards Board · Stance approval next standards cycle',
    confidenceScore: 88,
  },

  'architecture-risk': {
    id: 'architecture-risk',
    advisor: 'technology',
    prompt: 'Architecture Risk',
    executiveSummary:
      'Architecture risk is elevated on Payments event consistency, Cards session affinity, and AML synchronous coupling. Standards compliance sits at 74%; three open architecture exceptions are past review date.',
    keyRisks: [
      'Saga compensation gaps on Merchant Settlement event flow',
      'Cards session affinity blocking horizontal scale-out',
      'AML synchronous calls creating cascading timeout risk',
    ],
    businessImpact:
      'Architecture risks translate into peak-hour instability and longer recovery times during Payments and Cards incidents.',
    recommendedActions: [
      'Complete saga compensation design review for Merchant Settlement',
      'Remove Cards session affinity via shared session store',
      'Introduce async boundary for AML screening with timeout budgets',
    ],
    decisionRequired: 'Close or re-approve the three overdue architecture exceptions at next Architecture Board.',
    financialImpact: 'Risk-adjusted incident avoidance value ~₹6.5M/year if top three risks are remediated.',
    ownerTimeline: 'Chief Architect · Board this month · Remediation within two quarters',
    confidenceScore: 83,
  },

  'platform-health': {
    id: 'platform-health',
    advisor: 'technology',
    prompt: 'Platform Health',
    executiveSummary:
      'Strategic platform health: Payments Platform 82%, Data Platform 76%, Integration Platform 71%, API Platform 88%, Security Platform 79%. Integration Platform is below the 75% executive threshold due to IBM MQ / Kafka dual-stack complexity.',
    keyRisks: [
      'Integration Platform dual-stack operational overhead',
      'Data Platform Snowflake / Databricks overlap inflating spend',
      'Security Platform Vault adoption lagging on 22 apps',
    ],
    businessImpact:
      'Below-threshold Integration health slows onboarding of new Payments APIs and increases mean time to restore for messaging incidents.',
    recommendedActions: [
      'Accelerate Kafka adoption and retire low-value IBM MQ bridges',
      'Rationalize analytics spend between Snowflake and Databricks',
      'Enforce Vault onboarding for the 22 non-compliant apps',
    ],
    decisionRequired: 'Set Integration Platform recovery target of 80% within two quarters and fund dual-stack exit.',
    financialImpact: 'Platform recovery investment ₹12M; expected efficiency and risk benefit ₹9M/year.',
    ownerTimeline: 'Platform Engineering Leadership · Target review in 60 days',
    confidenceScore: 87,
  },

  'roi-prioritization': {
    id: 'roi-prioritization',
    advisor: 'investment',
    prompt: 'ROI Prioritization',
    executiveSummary:
      'Highest ROI investments: Kafka event streaming for Payments (ROI 2.4×), Java 17 Cards upgrade (ROI 1.9×), Notification Hub cloud move (ROI 1.7×). Lowest: net-new Wealth analytics lakehouse expansion (ROI 0.9×) under current adoption.',
    keyRisks: [
      'Wealth lakehouse expansion under-utilized relative to spend',
      'Cards Java 17 ROI sensitive to release slip',
      'Kafka ROI depends on MQ bridge retirement completing on time',
    ],
    businessImpact:
      'Reordering funding toward top-ROI items accelerates value realization in Payments and Cards while containing low-yield spend in Wealth.',
    recommendedActions: [
      'Bring forward Kafka and Cards Java 17 funding into current quarter',
      'Throttle Wealth lakehouse expansion pending adoption gates',
      'Tie Notification Hub cloud funding to measured OTP latency KPIs',
    ],
    decisionRequired: 'Reallocate ₹6M from Wealth lakehouse to Kafka + Cards Java 17 this quarter.',
    financialImpact: 'Reallocation improves expected FY26 value capture by ~₹8.4M versus current plan.',
    ownerTimeline: 'Investment Committee · Decision at next funding forum',
    confidenceScore: 86,
  },

  'budget-risk': {
    id: 'budget-risk',
    advisor: 'investment',
    prompt: 'Budget Risk',
    executiveSummary:
      'Technology budget risk is Moderate-High. Run-cost overrun risk ₹11M (vendor renewals + cloud growth). Change-the-bank underspend ₹7M on modernization waves slipping. Net forecast variance +₹4M vs plan.',
    keyRisks: [
      'Oracle and IBM renewal premiums above plan',
      'Cloud spend growth on non-approved sandboxes',
      'Modernization Wave 2 slip pushing CapEx into next FY',
    ],
    businessImpact:
      'Variance compresses discretionary innovation budget and may force mid-year cuts to lower-priority initiatives.',
    recommendedActions: [
      'Negotiate multi-year Oracle/IBM renewals before quote expiry',
      'Shut down non-approved cloud sandboxes within 14 days',
      'Re-baseline Wave 2 CapEx with Finance this month',
    ],
    decisionRequired: 'Approve cloud sandbox shutdown policy and renewal negotiation mandate.',
    financialImpact: 'Actions protect ₹11M run-cost overrun and preserve ₹7M modernization capacity.',
    ownerTimeline: 'CIO + CFO Technology Finance · Actions within 14 days',
    confidenceScore: 89,
  },

  'cost-optimization': {
    id: 'cost-optimization',
    advisor: 'investment',
    prompt: 'Cost Optimization',
    executiveSummary:
      'Identified optimization levers: retire duplicate observability (Splunk + overlapping Grafana stacks), right-size AKS/EKS node pools, consolidate API gateways (Apigee vs Kong), and eliminate idle Oracle non-prod instances.',
    keyRisks: [
      'Observability consolidation may temporarily reduce incident visibility',
      'Gateway consolidation needs careful traffic migration',
      'Non-prod Oracle shutdown requires data refresh redesign',
    ],
    businessImpact:
      'Optimization frees run budget for modernization without increasing overall technology spend.',
    recommendedActions: [
      'Execute observability rationalization plan (save ~₹3.2M/year)',
      'Right-size Kubernetes pools after peak-season (save ~₹2.1M/year)',
      'Decommission idle Oracle non-prod within 45 days (save ~₹1.8M/year)',
    ],
    decisionRequired: 'Approve the three optimization workstreams with a combined ₹7.1M/year savings target.',
    financialImpact: 'Gross annual savings ₹7.1M; one-time transition cost ₹1.4M; net year-1 benefit ₹5.7M.',
    ownerTimeline: 'FinOps + Platform Engineering · Kickoff in 2 weeks · Benefits within 2 quarters',
    confidenceScore: 85,
  },

  'vendor-bottlenecks': {
    id: 'vendor-bottlenecks',
    advisor: 'investment',
    prompt: 'Vendor Bottlenecks',
    executiveSummary:
      'Vendor bottlenecks: IBM (mainframe + MQ) concentration 28% of tech spend, Oracle DB licensing gating non-prod scale, and MuleSoft delivery lead times delaying Integration Platform APIs by 6–8 weeks.',
    keyRisks: [
      'Single-vendor concentration above risk appetite on IBM stack',
      'Oracle license constraints blocking test environment elasticity',
      'MuleSoft capacity queue delaying merchant API onboarding',
    ],
    businessImpact:
      'Bottlenecks slow delivery of Payments and Corporate Banking integrations and inflate negotiating leverage against the bank.',
    recommendedActions: [
      'Dual-source messaging with Kafka for new Payments events',
      'Expand PostgreSQL 16 for eligible non-prod workloads',
      'Shift two Integration backlog items from MuleSoft to Kong/Apigee where fit',
    ],
    decisionRequired: 'Endorse dual-sourcing policy for messaging and non-prod database platforms.',
    financialImpact: 'Reduces concentration risk and avoids ~₹4.5M in premium rush capacity over 12 months.',
    ownerTimeline: 'Vendor Management + Architecture · Policy in 30 days',
    confidenceScore: 84,
  },

  'roadmap-recommendation': {
    id: 'roadmap-recommendation',
    advisor: 'investment',
    prompt: 'Roadmap Recommendation',
    executiveSummary:
      'Recommended near-term roadmap focus: (Q1) UPI stability + Notification Hub cloud, (Q2) Cards Java 17 + Kafka bridges, (Q3) Trade Finance Wave 1, (Q4) AML strangler + standards compliance push to 85%.',
    keyRisks: [
      'Parallel Waves without capacity guardrails will slip all four',
      'Regulatory work may preempt Q3 Trade Finance capacity',
      'Standards push depends on Architecture Board throughput',
    ],
    businessImpact:
      'Sequenced roadmap balances customer-facing stability, debt retirement, and compliance without overloading engineering capacity.',
    recommendedActions: [
      'Lock Q1–Q2 capacity for UPI/Cards before starting Trade Finance Wave 1',
      'Reserve 10% capacity buffer for regulatory interrupts',
      'Publish quarterly roadmap OKRs to Investment Committee',
    ],
    decisionRequired: 'Adopt the Q1–Q4 sequenced roadmap as the executive baseline.',
    financialImpact: 'Baseline protects ₹52M of planned FY benefits with lower slip probability versus parallel overload.',
    ownerTimeline: 'Technology Strategy + Transformation PMO · Baseline this planning cycle',
    confidenceScore: 88,
  },

  'three-year-plan': {
    id: 'three-year-plan',
    advisor: 'investment',
    prompt: '3-Year Investment Plan',
    executiveSummary:
      '3-year plan: FY26 stabilize & modernize (₹120M), FY27 cloud & platform consolidation (₹95M), FY28 AI platform scale + legacy exit completion (₹80M). Cumulative investment ₹295M; projected cumulative benefit ₹410M.',
    keyRisks: [
      'FY26 overload if regulatory programs expand beyond buffer',
      'FY27 cloud benefits contingent on Wave 1–2 completion',
      'FY28 AI scale requires data platform readiness from FY27',
    ],
    businessImpact:
      'Plan exits obsolete platforms, lifts cloud adoption above 70%, and positions AI platform services for controlled enterprise scale.',
    recommendedActions: [
      'Approve FY26 envelope ₹120M with 10% contingency',
      'Gate FY27 cloud spend on FY26 modernization exit criteria',
      'Define FY28 AI platform KPIs (adoption, control coverage, unit cost)',
    ],
    decisionRequired: 'Endorse the 3-year investment envelope and stage-gates for FY27–FY28 release of funds.',
    financialImpact: '₹295M investment / ₹410M benefit (gross); net value ~₹115M over three years at plan confidence.',
    ownerTimeline: 'CIO + Investment Committee · Envelope approval this planning cycle · Annual stage-gates',
    confidenceScore: 82,
  },
};

export function getCioInsight(promptId: string): ExecutiveInsight | undefined {
  return INSIGHTS[promptId];
}

export function getCioInsightByLabel(label: string): ExecutiveInsight | undefined {
  const normalized = label.trim().toLowerCase();
  return Object.values(INSIGHTS).find((i) => i.prompt.toLowerCase() === normalized);
}

export function listCioInsights(advisor: CioAdvisorKind): ExecutiveInsight[] {
  return CIO_ADVISOR_PROMPTS[advisor]
    .map((p) => INSIGHTS[p.id])
    .filter((i): i is ExecutiveInsight => Boolean(i));
}
