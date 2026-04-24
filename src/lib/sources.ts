/**
 * Canonical pipeline_evaluations.source values.
 *
 * The canon comes from ecosystem-standards/standards/evaluation.yaml — see
 * the "PIPELINE_EVALUATIONS.SOURCE — CANONICAL VALUES" banner at the
 * bottom of that file.
 *
 * Seven authoritative values:
 *
 *   External emission origins (set by the emitting cog):
 *     flow_inline         end-of-run self-assessment from a pipeline cog
 *     flow_hook           on_failure / on_crashed hook from a pipeline cog
 *     prefect_webhook     evaluator-cog webhook observer
 *
 *   Evaluator-cog conformance (repo structure vs standards catalog):
 *     conformance_deterministic   deterministic path of conformance flow
 *     conformance_llm             LLM path of conformance flow
 *
 *   Evaluator-cog introspection (no target repo — evaluator's own output):
 *     standards_drift     EVAL-007 drift detection
 *     data_quality        runtime data-quality checks on stored findings
 *
 * Legacy alias: `conformance_check` = old name for `conformance_llm`.
 * Pre-rename rows still live in the DB under this name, so every consumer
 * must treat the two as equivalent.
 */

export const CANONICAL_SOURCES = [
  "flow_inline",
  "flow_hook",
  "prefect_webhook",
  "conformance_deterministic",
  "conformance_llm",
  "standards_drift",
  "data_quality",
] as const;

export type CanonicalSource = (typeof CANONICAL_SOURCES)[number];

/** `conformance_check` is the pre-split name for `conformance_llm`. */
export const LEGACY_LLM_ALIAS = "conformance_check";

// ── Bucket model (used by EvaluationSummary and the pipeline page) ────
//
// Buckets group the seven sources into four human-meaningful runtime
// categories for the UI. "all" is a synthetic aggregate.
export const BUCKETS = [
  "all",
  "deterministic",
  "llm",
  "pipeline",
  "introspection",
] as const;

export type Bucket = (typeof BUCKETS)[number];

export const BUCKET_LABELS: Record<Bucket, string> = {
  all: "All",
  deterministic: "Deterministic",
  llm: "LLM Conformance",
  pipeline: "Pipeline Eval",
  introspection: "Introspection",
};

/**
 * Map a source value (or legacy alias) to its UI bucket. Unknown /
 * missing sources fall into `pipeline` so they still surface rather
 * than being silently dropped.
 */
export function sourceToBucket(source: unknown): Exclude<Bucket, "all"> {
  const s = String(source ?? "").trim();
  if (s === "conformance_deterministic") return "deterministic";
  if (s === "conformance_llm" || s === LEGACY_LLM_ALIAS) return "llm";
  if (s === "flow_inline" || s === "flow_hook" || s === "prefect_webhook")
    return "pipeline";
  if (s === "standards_drift" || s === "data_quality") return "introspection";
  return "pipeline";
}

// ── Sweep vs per-repo classification (for latest-run filtering) ───────
//
// Sweep sources fire as part of an orchestrated flow run that covers all
// repos (conformance, introspection). Per-repo sources fire independently
// per repo (pipeline eval — flow_inline/flow_hook/prefect_webhook).
//
// Rows without identifiable source default to sweep so they still surface.
export type SourceCategory = "sweep" | "per-repo";

export function sourceCategory(source: unknown): SourceCategory {
  const s = String(source ?? "").trim();
  if (s === "prefect_webhook" || s === "flow_inline" || s === "flow_hook") {
    return "per-repo";
  }
  return "sweep";
}

/**
 * Sweep-cluster assignment. All sources in the same flow share a run_id
 * and evaluated_at, so a newer run of any source in the cluster supersedes
 * older runs of every source in that cluster — even if one of those
 * sources produced zero findings in the newer run. Without clustering,
 * a source with nothing to report on the current run would appear to
 * still be "latest" and stale rows would persist across standards-version
 * bumps.
 *
 *   deterministic: conformance_deterministic + data_quality + standards_drift
 *   llm:           conformance_llm
 *   legacy:        conformance_check  (pre-split name, kept distinct)
 *   other:         single-member cluster named after the source
 */
export type SweepCluster =
  | "deterministic"
  | "llm"
  | "legacy"
  | "unknown"
  | string;

export function sweepCluster(source: unknown): SweepCluster {
  const s = String(source ?? "").trim();
  if (
    s === "conformance_deterministic" ||
    s === "data_quality" ||
    s === "standards_drift"
  ) {
    return "deterministic";
  }
  if (s === "conformance_llm") return "llm";
  if (s === LEGACY_LLM_ALIAS) return "legacy";
  return s || "unknown";
}

// ── Human-readable source labels for badges ───────────────────────────

/**
 * Short badge label for a source value. Returns null for empty/missing
 * sources so the caller can elide the badge.
 */
export function sourceLabel(source: unknown): string | null {
  const s = String(source ?? "").trim();
  if (!s) return null;
  // Pipeline-eval sources (behavioral — did a run behave correctly?)
  if (s === "prefect_webhook") return "automation";
  if (s === "flow_hook") return "crash hook";
  if (s === "flow_inline") return "pipeline";
  // Conformance sources (structural — does the repo meet the standards?)
  if (s === "conformance_deterministic") return "deterministic";
  if (s === "conformance_llm") return "llm";
  if (s === LEGACY_LLM_ALIAS) return "llm";
  // Evaluator introspection sources
  if (s === "standards_drift") return "drift";
  if (s === "data_quality") return "data quality";
  return s;
}
