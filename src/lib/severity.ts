/**
 * Canonical severity model for pipeline_evaluations findings.
 *
 * The canon comes from ecosystem-standards/index.yaml — the `severities:`
 * block at the top of that file. There are five values:
 *
 *   - CRITICAL   emission-only; system-level failure blocking evaluation
 *   - ERROR      rule violation at ERROR severity
 *   - WARN       rule violation at WARN severity
 *   - INFO       observation; no action required
 *   - SUCCESS    emission-only; clean-run completion from pipeline cogs
 *
 * Rule-level severities are ERROR | WARN | INFO only. CRITICAL and
 * SUCCESS appear in `pipeline_evaluations.severity` as outcome severities
 * emitted by pipeline cogs and the evaluator itself.
 *
 * This file is imported by build-time components (Astro frontmatter) and
 * by client-side scripts (inline <script type="module"> blocks). The
 * functions and constants below are pure and framework-agnostic.
 */

export const EMISSION_SEVERITIES = [
  "CRITICAL",
  "ERROR",
  "WARN",
  "INFO",
  "SUCCESS",
] as const;

export type EmissionSeverity = (typeof EMISSION_SEVERITIES)[number];

/**
 * Normalize any raw severity value observed on a finding row to an
 * EmissionSeverity. Unknown or missing values default to INFO — this
 * matches the pipeline_evaluations default for rows written without an
 * explicit severity.
 *
 * Accepts `WARNING` as an alias for `WARN` (legacy rows).
 */
export function normalizeSeverity(level: unknown): EmissionSeverity {
  const s = String(level ?? "INFO").toUpperCase();
  if (s === "WARNING") return "WARN";
  if (
    s === "CRITICAL" ||
    s === "ERROR" ||
    s === "WARN" ||
    s === "INFO" ||
    s === "SUCCESS"
  ) {
    return s;
  }
  return "INFO";
}

/**
 * Sort rank for severity — lower number = higher priority. Used to order
 * finding lists so the loudest items surface first.
 */
export function severityRank(level: unknown): number {
  const s = normalizeSeverity(level);
  if (s === "CRITICAL") return 0;
  if (s === "ERROR") return 1;
  if (s === "WARN") return 2;
  if (s === "INFO") return 3;
  return 4; // SUCCESS
}

/**
 * Tailwind class string for a severity pill/badge. Returns a triple of
 * `text-*`, `border-*`, and `bg-*` utilities.
 */
export function severityClass(level: unknown): string {
  const s = normalizeSeverity(level);
  if (s === "CRITICAL") return "text-rose-300 border-rose-500/40 bg-rose-500/15";
  if (s === "ERROR") return "text-red-400 border-red-500/30 bg-red-500/10";
  if (s === "WARN") return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  if (s === "SUCCESS") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  return "text-slate-300 border-slate-500/30 bg-slate-500/10";
}

/**
 * Tailwind text-color class for an inline count tag (e.g. "3 error").
 * Used in count formatters where the surrounding container already has
 * its own border and background.
 */
export function severityTextClass(level: unknown): string {
  const s = normalizeSeverity(level);
  if (s === "CRITICAL") return "text-rose-300";
  if (s === "ERROR") return "text-red-400";
  if (s === "WARN") return "text-amber-400";
  if (s === "INFO") return "text-slate-400";
  return "text-emerald-400"; // SUCCESS
}

/**
 * Zero-initialized severity counter record.
 */
export function emptySeverityCounts(): Record<EmissionSeverity, number> {
  return { CRITICAL: 0, ERROR: 0, WARN: 0, INFO: 0, SUCCESS: 0 };
}

/**
 * Count findings by severity using normalizeSeverity.
 */
export function countSeverities(
  findings: ReadonlyArray<{ severity?: unknown }>,
): Record<EmissionSeverity, number> {
  const counts = emptySeverityCounts();
  for (const f of findings) {
    counts[normalizeSeverity(f?.severity)]++;
  }
  return counts;
}

/**
 * Render severity counts as an HTML fragment of the form
 * `<span>3 error</span> · <span>2 warn</span>`. Severities with zero
 * count are elided. An empty input renders a neutral "No findings" span.
 *
 * Returns an HTML string because the current consumers inject it via
 * innerHTML. Safe because all values are fixed-format integers.
 */
export function formatCounts(
  counts: Record<EmissionSeverity, number>,
): string {
  const parts: string[] = [];
  for (const sev of EMISSION_SEVERITIES) {
    const n = counts[sev];
    if (n > 0) {
      parts.push(
        `<span class="${severityTextClass(sev)}">${n} ${sev.toLowerCase()}</span>`,
      );
    }
  }
  if (parts.length === 0) {
    return '<span class="text-slate-500">No findings</span>';
  }
  return parts.join('<span class="text-slate-600"> · </span>');
}
