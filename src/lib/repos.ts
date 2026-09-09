/**
 * Build-state model for the repository status board.
 *
 * The canon comes from `GET /v1/github/status` on api.kaianolevine.com,
 * which maps GitHub's `StatusState` enum onto five values before the
 * payload leaves the server:
 *
 *   - failure   at least one check on the default branch head failed
 *   - error     a check errored rather than reported a verdict
 *   - pending   checks queued, running, or declared but not yet reported
 *   - none      the head commit has no checks at all
 *   - success   every check passed
 *
 * `none` is deliberately not folded into `success`. A repo with no CI on
 * its default branch is not a passing repo — it is an unverified one, and
 * on a board about engineering standards that distinction is the whole
 * point. It sorts above `success` for the same reason.
 *
 * Imported by both Astro frontmatter and client-side module scripts; every
 * export here is pure.
 */

export const BUILD_STATES = [
  "failure",
  "error",
  "pending",
  "none",
  "success",
] as const;

export type BuildState = (typeof BUILD_STATES)[number];

/** Normalize any raw `build` value to a BuildState. Unknown means `none`. */
export function normalizeBuild(state: unknown): BuildState {
  const s = String(state ?? "none").toLowerCase();
  return (BUILD_STATES as readonly string[]).includes(s)
    ? (s as BuildState)
    : "none";
}

/** Sort rank — lower is louder. Mirrors the server's own ordering. */
export function buildRank(state: unknown): number {
  return BUILD_STATES.indexOf(normalizeBuild(state));
}

/** Human label for a build state. */
export function buildLabel(state: unknown): string {
  const s = normalizeBuild(state);
  if (s === "failure") return "failing";
  if (s === "error") return "errored";
  if (s === "pending") return "running";
  if (s === "none") return "no checks";
  return "passing";
}

/** Tailwind pill classes — `text-*`, `border-*`, `bg-*`. */
export function buildClass(state: unknown): string {
  const s = normalizeBuild(state);
  if (s === "failure") return "text-red-400 border-red-500/30 bg-red-500/10";
  if (s === "error") return "text-rose-300 border-rose-500/40 bg-rose-500/15";
  if (s === "pending") return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  if (s === "none") return "text-slate-400 border-slate-500/30 bg-slate-500/10";
  return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
}

/** Tailwind background class for the status dot on a row. */
export function buildDotClass(state: unknown): string {
  const s = normalizeBuild(state);
  if (s === "failure") return "bg-red-400";
  if (s === "error") return "bg-rose-300";
  if (s === "pending") return "bg-amber-400";
  if (s === "none") return "bg-slate-500";
  return "bg-emerald-400";
}

/** Zero-initialized counter record, matching the API's `builds` object. */
export function emptyBuildCounts(): Record<BuildState, number> {
  return { failure: 0, error: 0, pending: 0, none: 0, success: 0 };
}

/**
 * The filter chips above the list. `all` is synthetic; `attention` groups
 * everything that is not a clean pass, which is the view worth landing on
 * when something is wrong.
 */
export const REPO_FILTERS = [
  "all",
  "attention",
  "failure",
  "pending",
  "none",
  "success",
] as const;

export type RepoFilter = (typeof REPO_FILTERS)[number];

export const REPO_FILTER_LABELS: Record<RepoFilter, string> = {
  all: "All",
  attention: "Needs attention",
  failure: "Failing",
  pending: "Running",
  none: "No checks",
  success: "Passing",
};

/** Does a repo's build state belong under the given filter? */
export function matchesFilter(state: unknown, filter: RepoFilter): boolean {
  const s = normalizeBuild(state);
  if (filter === "all") return true;
  if (filter === "attention") return s !== "success";
  if (filter === "failure") return s === "failure" || s === "error";
  return s === filter;
}

/**
 * Escape a string for interpolation into innerHTML.
 *
 * Repository names, descriptions and languages are GitHub-controlled text.
 * They are not hostile today — they are all mine — but they are not
 * literals either, and the board renders through innerHTML like the other
 * panels on this site. Escaping at the seam costs nothing and removes the
 * question.
 */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Coerce an untrusted value (a data attribute, a query param) to a RepoFilter. */
export function normalizeFilter(value: unknown): RepoFilter {
  const v = String(value ?? "all");
  return (REPO_FILTERS as readonly string[]).includes(v) ? (v as RepoFilter) : "all";
}

// ── Response shapes ──────────────────────────────────────────────────────
//
// A hand-kept mirror of the `data` object in GET /v1/github/status, which is
// generated from the Pydantic models in kaianolevine_api.schemas. Declared
// here rather than inlined in the component so a field rename upstream
// breaks the type-check in one place instead of failing silently at runtime.

export interface BuildCounts {
  success: number;
  failure: number;
  error: number;
  pending: number;
  none: number;
}

export interface RepoRow {
  org: string;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  default_branch: string | null;
  build: BuildState;
  open_pull_requests: number;
  open_issues: number;
  pushed_at: string | null;
}

export interface PrivateSummary {
  repo_count: number;
  builds: BuildCounts;
  open_pull_requests: number;
  open_issues: number;
}

export interface OrgSummary {
  login: string;
  listed_repo_count: number;
  private: PrivateSummary | null;
}

export interface RepoTotals {
  repositories: number;
  open_pull_requests: number;
  open_issues: number;
  builds: BuildCounts;
}

export interface RepoStatusPayload {
  fetched_at: string;
  stale: boolean;
  cache_ttl_seconds: number;
  private_disclosure: "aggregate" | "hidden" | "full";
  orgs: OrgSummary[];
  repositories: RepoRow[];
  totals: RepoTotals;
}
