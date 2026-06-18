#!/usr/bin/env node
/**
 * Enterprise KPI unit-formatting scanner.
 *
 * Scans src/ for KPI/metric rendering that risks duplicate or malformed units:
 *   - <KpiCard value="₹15.9M" /> with a percentage suffix (default '%' or suffix="%")
 *   - <KpiCard value="61/100" /> with any suffix
 *   - <KpiCard value="75 risks" /> with a percentage suffix
 *   - string concatenations like `${pct}%` where pct already contains '%'
 *   - duplicate literal symbols: "%%", "% %", "₹₹", "/100/100"
 *
 * Output: a File / Line / Issue / Suggested-Fix report (text + JSON).
 *
 * Usage: node scripts/auditKpiUnits.mjs [--json]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      scanFile(full);
    }
  }
}

// Trailing-unit tokens that mean a value already carries its unit.
const UNIT_RE = /(%|\/\d{2,3}|[\d.](?:M|K|B|GB|TB|x)\b|\b(?:risks?|incidents?|days?|hrs?|hours?|mins?|count|items?|models?|controls?|findings?|alerts?))\s*$/i;
const CURRENCY_RE = /₹/;

function addFinding(file, line, issue, fix, snippet) {
  findings.push({ file: relative(ROOT, file), line, issue, fix, snippet: snippet.trim().slice(0, 160) });
}

// Files that legitimately contain unit literals (the framework + this scanner).
const SELF_FILES = ['utils/formatMetric.ts', 'scripts/auditKpiUnits.mjs'];

function scanFile(file) {
  const rel = relative(ROOT, file);
  if (SELF_FILES.some((s) => rel.endsWith(s))) return;
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  // 1) Multi-line-aware: find <KpiCard ...> blocks (props may span lines)
  const kpiBlocks = [...text.matchAll(/<KpiCard\b[\s\S]*?\/>/g)];
  for (const m of kpiBlocks) {
    const block = m[0];
    const startLine = text.slice(0, m.index).split('\n').length;
    // extract value="..." or value={`...`} or value={...}
    const valStr = block.match(/value=\{`([^`]*)`\}/);
    const valDq = block.match(/value="([^"]*)"/);
    const valExpr = block.match(/value=\{([^}]*)\}/);
    const hasSuffixProp = /suffix=/.test(block);
    const suffixVal = block.match(/suffix=\{?["'`]([^"'`]*)["'`]\}?/);
    const suffix = hasSuffixProp ? (suffixVal ? suffixVal[1] : '?') : '%'; // default suffix is '%'

    // literal value we can reason about
    const literal = valStr ? valStr[1] : valDq ? valDq[1] : null;

    if (literal !== null) {
      const carriesUnit = UNIT_RE.test(literal) || CURRENCY_RE.test(literal) || /[a-zA-Z]{2,}\s*$/.test(literal.replace(/M$|K$|B$/, ''));
      if (carriesUnit && suffix === '%') {
        addFinding(file, startLine,
          `KpiCard value "${literal}" already carries a unit but suffix is "%" → renders "${literal} %"`,
          `Pass suffix="" (value is pre-formatted) or use formatMetric(); KpiCard now auto-suppresses duplicate units.`,
          block);
      } else if (/\/\d{2,3}$/.test(literal) && hasSuffixProp && suffix && suffix !== '') {
        addFinding(file, startLine,
          `KpiCard value "${literal}" is a ratio/score but suffix "${suffix}" is also set`,
          `Drop the suffix; value already includes the denominator.`,
          block);
      }
    } else if (valExpr) {
      // expression value: flag template literals that produce a unit AND rely on default % suffix
      const expr = valExpr[1];
      const exprCarries = /₹|`[^`]*(M|K|\/100|risks|days|hrs)`|toFixed\(\d\)\s*\}?\s*(M|K)/.test(expr) || /\$\{[^}]*\}(M|K|%)/.test(block);
      if (exprCarries && !hasSuffixProp) {
        addFinding(file, startLine,
          `KpiCard value expression appears pre-formatted (currency/unit) but no suffix set → default "%" appended`,
          `Add suffix="" for pre-formatted values, or render via formatMetric().`,
          block);
      }
    }
  }

  // 2) Per-line: duplicate literal symbols & risky string concatenation
  lines.forEach((ln, i) => {
    const lineNo = i + 1;
    // Skip comment lines — they may legitimately document example patterns.
    const trimmed = ln.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    if (/%%|%\s%/.test(ln)) addFinding(file, lineNo, 'Duplicate percent symbols ("%%" / "% %")', 'Remove the extra "%".', ln);
    if (/₹₹|₹\s₹/.test(ln)) addFinding(file, lineNo, 'Duplicate currency symbols ("₹₹")', 'Remove the extra "₹".', ln);
    if (/\/100\/100/.test(ln)) addFinding(file, lineNo, 'Duplicate score denominator ("/100/100")', 'Keep a single "/100".', ln);
    // `${something%}%` or `${x}% %`
    if (/\}\s*%\s*%/.test(ln)) addFinding(file, lineNo, 'Template appends "%" to a value already ending in "%"', 'Drop the trailing "%".', ln);
    // Standalone "count" unit word appended to a rendered metric value.
    // Only flag JSX `{value} count`/`{value}count` as a displayed metric — NOT
    // descriptive prose (meta:/detail:/supportingEvidence strings, status
    // sentences) where a connector word or object key is present.
    const isProse = /(meta|detail|title|label|aria|subtitle|name|evidence)\s*:/i.test(ln)
      || /·|\bin\b|\bacross\b|\bof\b|catalog/i.test(ln);
    if (/\}\s*count\b/.test(ln) && !isProse) {
      addFinding(file, lineNo, 'Unit word "count" appended to a rendered value (e.g. "18 count")', 'Use COUNT format (no unit word).', ln);
    }
  });
}

walk(SRC);

// ---- Report ----
const json = process.argv.includes('--json');
if (json) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  if (findings.length === 0) {
    console.log('KPI UNIT AUDIT: PASS — no duplicate/malformed unit patterns found.');
  } else {
    console.log(`KPI UNIT AUDIT: ${findings.length} issue(s) found\n`);
    console.log('FILE'.padEnd(56) + 'LINE'.padEnd(6) + 'ISSUE');
    console.log('-'.repeat(120));
    for (const f of findings) {
      console.log(`${f.file.padEnd(56)}${String(f.line).padEnd(6)}${f.issue}`);
      console.log(`${' '.repeat(62)}FIX: ${f.fix}`);
    }
  }
}

// also write a JSON artifact for CI
try {
  writeFileSync(join(ROOT, 'kpi-unit-audit.json'), JSON.stringify(findings, null, 2));
} catch {
  /* ignore */
}

process.exit(findings.length > 0 && process.argv.includes('--ci') ? 1 : 0);
