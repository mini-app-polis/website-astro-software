/**
 * Build-time fetchers for ecosystem-standards.
 *
 * This module is the single source of truth for how the site reads the
 * ecosystem-standards repo at build time. All other build-time consumers
 * (StandardsBrowser, the /ecosystem page, the severity and source enum
 * generators) go through here — there is no other allowed path to the
 * standards repo.
 *
 * Why raw.githubusercontent.com, not api.github.com:
 *   The api.github.com Contents endpoint is rate-limited to 60 req/hour
 *   per IP for unauthenticated calls. Cloudflare Pages build containers
 *   share IPs and blow through the quota, which caused the "Unable to
 *   load standards" fallback to render. raw.githubusercontent.com serves
 *   raw file bytes with no practical rate limit for public repos.
 */

export const STANDARDS_RAW_BASE =
  "https://raw.githubusercontent.com/mini-app-polis/ecosystem-standards/main";

// ── YAML loader (lazy, single import) ─────────────────────────

let yamlLoad: ((input: string) => unknown) | null = null;

async function getYamlLoader(): Promise<(input: string) => unknown> {
  if (!yamlLoad) {
    const yamlModule = await import("js-yaml");
    yamlLoad = yamlModule.load as (input: string) => unknown;
  }
  return yamlLoad;
}

async function parseYamlText<T>(yamlText: string): Promise<T> {
  const load = await getYamlLoader();
  return load(yamlText) as T;
}

async function fetchYamlText(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${STANDARDS_RAW_BASE}/${path}`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function fetchYaml<T>(path: string): Promise<T | null> {
  const text = await fetchYamlText(path);
  if (text == null) return null;
  try {
    return await parseYamlText<T>(text);
  } catch (error) {
    console.error(`Failed to parse ${path} from ${STANDARDS_RAW_BASE}`, error);
    return null;
  }
}

// ── index.yaml schema ─────────────────────────────────────────

export interface IndexFileEntry {
  file: string;
  domain?: string;
  description?: string;
  rule_prefix?: string;
}

export interface IndexFile {
  dimensions?: Record<string, string>;
  severities?: Record<string, string>;
  statuses?: Record<string, { description?: string }>;
  schema?: {
    repo_types?: Record<string, string>;
    traits?: Record<string, unknown>;
  };
  files?: IndexFileEntry[];
}

export async function fetchIndex(): Promise<IndexFile | null> {
  return fetchYaml<IndexFile>("index.yaml");
}

// ── Standards domain files ────────────────────────────────────

export type RuleStatus = "requirement" | "convention" | "gap";
export type RuleSeverity = "ERROR" | "WARN" | "INFO";

export interface Rule {
  id: string;
  title: string;
  status: RuleStatus;
  dimension?: string;
  severity?: RuleSeverity;
  description: string;
  checkable?: boolean;
  check_notes?: string;
  applies_to?: string[] | string;
  origin?: string;
}

export interface DomainFile {
  domain?: string;
  standards?: Rule[];
  rules?: Rule[];
}

export interface DomainFileResult {
  key: string;
  description?: string;
  rules: Rule[];
}

/**
 * Fetch every domain file listed in index.yaml.
 *
 * "Domain file" = an entry in index.yaml's `files:` list that carries a
 * `rule_prefix`. Non-domain entries (ecosystem.yaml, definitions-of-done.yaml)
 * omit `rule_prefix` and are excluded structurally — adding a new domain
 * file to index.yaml will automatically pick it up here, and new non-domain
 * files will be excluded without code changes.
 *
 * Returns an empty array if index.yaml cannot be fetched or parsed. Domain
 * files that fail to parse individually are logged and skipped.
 */
export async function fetchDomainFiles(): Promise<DomainFileResult[]> {
  const index = await fetchIndex();
  if (!index) return [];

  const domainEntries = (index.files ?? []).filter(
    (entry): entry is IndexFileEntry =>
      typeof entry === "object" &&
      entry !== null &&
      typeof entry.file === "string" &&
      typeof entry.rule_prefix === "string",
  );

  const fetched = await Promise.all(
    domainEntries.map(async (entry) => {
      const data = await fetchYaml<DomainFile>(entry.file);
      if (!data) return null;
      const filename = entry.file.split("/").pop() ?? entry.file;
      const key = filename.replace(/\.ya?ml$/, "");
      const rules = Array.isArray(data.standards)
        ? data.standards
        : Array.isArray(data.rules)
          ? data.rules
          : [];
      return { key, description: entry.description, rules };
    }),
  );

  return fetched.filter((r): r is DomainFileResult => r !== null);
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
