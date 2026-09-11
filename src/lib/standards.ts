/**
 * The standards catalog, as the site reads it.
 *
 * The site used to walk the ecosystem-standards repo at build time:
 * index.yaml to discover the domain files, then every domain file, then
 * package.json for the version. It now reads one compiled catalog from
 * the API, in the browser, like every other live panel on this site.
 *
 * Two things change as a result. The site no longer depends on GitHub for
 * rule text — raw.githubusercontent had been chosen over api.github.com
 * to dodge a 60-req/hour rate limit that Cloudflare Pages build
 * containers kept tripping, and that whole problem goes away with the
 * fetch. And the rules stop being as stale as the last site deploy:
 * nothing rebuilds this site when the standards release, so a build-time
 * fetch meant the page could sit months behind the catalog it claimed to
 * show.
 *
 * The catalog is always served from production. Catalogs are published
 * only from ecosystem-standards' release job on `main`, so there is no
 * development copy to point at — rule text is not environment-specific.
 */

import { apiFetch } from "./api";

// ── Catalog schema ────────────────────────────────────────────
//
// Mirrors what ecosystem-standards' compiler emits. Only the fields this
// site renders are declared; the catalog carries more.

export type RuleStatus = "requirement" | "convention" | "gap";
export type RuleSeverity = "ERROR" | "WARN" | "INFO";
export type CheckMode = "deterministic" | "llm" | null;

export interface Rule {
  id: string;
  /** Which standards file the rule came from, e.g. "delivery". */
  domain?: string;
  title: string;
  status: RuleStatus;
  dimension?: string;
  severity?: RuleSeverity;
  description: string;
  checkable?: boolean;
  /** Resolved by the compiler, not parsed out of check_notes here. */
  check_mode?: CheckMode;
  check_notes?: string;
  /** `["all"]` is the catalog's default posture. `null` means not a repo scan. */
  applies_to?: string[] | null;
  modifies?: string[];
  origin?: string;
}

export interface StandardsCatalog {
  version: string;
  compiled_at: string;
  rule_count: number;
  dimensions?: Record<string, string>;
  severities?: Record<string, string>;
  statuses?: Record<string, { description?: string }>;
  schema?: {
    repo_types?: Record<string, string>;
    traits?: Record<string, unknown>;
  };
  rules: Rule[];
}

/** Path on the API. Callers reach it through `apiFetch`, which resolves the base. */
export const CATALOG_PATH = "/v1/standards/catalog";

/**
 * Fetch the latest published catalog, or null.
 *
 * Never throws. A page that cannot reach the catalog should say so and
 * render the rest of itself, not fail to build or blank out.
 */
export async function fetchCatalog(): Promise<StandardsCatalog | null> {
  return apiFetch<StandardsCatalog | null>(CATALOG_PATH, null);
}

/**
 * Group rules by their domain, sorted for display.
 *
 * The domain comes off each rule now. It used to require reading
 * index.yaml's `files:` list to discover which files existed and then
 * fetching each one — the catalog resolves that at build time.
 */
export function groupByDomain(rules: Rule[]): Array<{ key: string; label: string; rules: Rule[] }> {
  const byKey = new Map<string, Rule[]>();
  for (const rule of rules) {
    const key = rule.domain || "other";
    const bucket = byKey.get(key);
    if (bucket) bucket.push(rule);
    else byKey.set(key, [rule]);
  }
  return [...byKey.entries()]
    .map(([key, domainRules]) => ({ key, label: titleCase(key), rules: domainRules }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function titleCase(key: string): string {
  return (
    key
      .split(/[-_]/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ") || key
  );
}

// ── The last GitHub dependency ────────────────────────────────
//
// `fetchEcosystem` below still reads ecosystem.yaml from the standards
// repo. That file is being deleted — the standards repo is to hold rules
// and no repo or org knowledge — and the /ecosystem page and the homepage
// service count are its only remaining readers. Until that inventory
// moves, this is the one path here that still touches GitHub.

export const STANDARDS_RAW_BASE =
  "https://raw.githubusercontent.com/mini-app-polis/ecosystem-standards/main";

let yamlLoad: ((input: string) => unknown) | null = null;

async function getYamlLoader(): Promise<(input: string) => unknown> {
  if (!yamlLoad) {
    const yamlModule = await import("js-yaml");
    yamlLoad = yamlModule.load as (input: string) => unknown;
  }
  return yamlLoad;
}

export async function fetchYaml<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${STANDARDS_RAW_BASE}/${path}`);
    if (!res.ok) return null;
    const load = await getYamlLoader();
    return load(await res.text()) as T;
  } catch (error) {
    console.error(`Failed to load ${path} from ${STANDARDS_RAW_BASE}`, error);
    return null;
  }
}

// ── ecosystem.yaml schema ─────────────────────────────────────
//
// Canonical inventory of every service and library in the ecosystem.
// Service `type:` values are drawn from index.yaml schema.repo_types
// (pipeline-cog, trigger-cog, api-service, shared-library, static-site,
// react-app, standards-repo). New type values added to repo_types there
// should be wired into LAYER_BY_TYPE below; unknown types fall into
// "Other" so they still render rather than disappearing.

export type ServiceStatus = "active" | "transitioning" | "retired";

export interface EcosystemService {
  id: string;
  type: string;
  status: ServiceStatus;
  host?: string;
  language?: string;
  framework?: string;
  repo?: string;
  monorepo?: string;
  monorepo_path?: string;
  description?: string;
}

export interface EcosystemMonorepo {
  id: string;
  repo?: string;
  package_manager?: string;
  description?: string;
  apps?: Array<{ service_id: string; path: string }>;
}

export interface Ecosystem {
  services?: EcosystemService[];
  monorepos?: EcosystemMonorepo[];
}

export async function fetchEcosystem(): Promise<Ecosystem | null> {
  return fetchYaml<Ecosystem>("ecosystem.yaml");
}

/**
 * Human-readable layer name for a service `type:` value. The /ecosystem
 * page uses this to group services into visual bands. Any type not listed
 * here renders under "Other" — preferable to silently omitting it, which
 * would happen if we hardcoded an allowlist.
 */
export const LAYER_BY_TYPE: Record<string, string> = {
  "trigger-cog": "Orchestration",
  "pipeline-cog": "Processing (Cogs)",
  "shared-library": "Shared Libraries",
  "api-service": "API",
  "static-site": "Sites",
  "react-app": "Sites",
  "standards-repo": "Standards",
};

/**
 * Stable layer order for display. Layers not in this list appear at the
 * end in alphabetical order.
 */
export const LAYER_ORDER = [
  "Orchestration",
  "Processing (Cogs)",
  "Shared Libraries",
  "API",
  "Sites",
  "Standards",
  "Other",
];

/**
 * Human-readable host label for the inventory card. Keys are the raw
 * `host:` values from ecosystem.yaml (lowercase). Unknown hosts render
 * their raw value (title-cased by the caller if needed).
 */
export const HOST_LABELS: Record<string, string> = {
  railway: "Railway",
  "cloudflare-pages": "Cloudflare Pages",
  github: "GitHub",
  "prefect-cloud": "Prefect Cloud",
};
