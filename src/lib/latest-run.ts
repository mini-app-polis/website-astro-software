/**
 * Keep only the findings from the most recent run, per repository and per
 * run type.
 *
 * ## Why this is keyed on the repository
 *
 * Evaluation is triggered both as a fleet sweep and per repository on
 * release. One repo cutting a version produces conformance_deterministic
 * rows for itself, with a fresh run_id and a newer timestamp than the last
 * sweep. Filtering on the cluster alone would make that run the bar for
 * every repo, so a single release would blank the conformance findings of
 * every other repo and the board would look clean because it was empty.
 *
 * The rule that holds under both trigger shapes is the one the API already
 * applies server-side: latest run per repository per type. A fleet sweep
 * satisfies it for every repo at once because they genuinely share a run; a
 * solo evaluation satisfies it for one repo and leaves the rest alone.
 *
 * ## Why "cluster" rather than "source"
 *
 * Several sources come from one run and must supersede together. A
 * deterministic run emits conformance_deterministic plus, on a sweep,
 * data_quality and standards_drift. When a later run finds nothing to say
 * about drift it emits no drift rows at all, and the previous run's drift
 * rows would otherwise still be "the latest" for that source: pinned to a
 * standards version that has since moved, sitting on the page indefinitely.
 * Grouping them means a newer run of any member supersedes older runs of all
 * of them. A source belonging to no group is its own group of one, so the
 * same rule covers pipeline-eval rows with no special case.
 *
 * Rows that cannot be classified (no source, no run id, no repository) pass
 * through rather than being dropped. Being unable to tell whether something
 * is current is not evidence that it is stale.
 *
 * `read` holds accessors, because callers disagree about field names
 * (repo vs repository, evaluated_at vs created_at). Returns the subset
 * belonging to the newest run of each (repository, cluster) pair.
 */
export interface RunAccessors<T> {
  repo: (f: T) => unknown;
  cluster: (f: T) => unknown;
  runId: (f: T) => unknown;
  timestamp: (f: T) => number;
}

export function keepLatestRunPerRepoCluster<T>(
  findings: T[],
  read: RunAccessors<T>,
): T[] {
  const latest = new Map<string, { ts: number; runIds: Set<string> }>();

  for (const f of findings) {
    const key = classify(f, read);
    if (key === null) continue;
    const ts = read.timestamp(f);
    if (!Number.isFinite(ts)) continue;

    const seen = latest.get(key);
    if (!seen || ts > seen.ts) {
      latest.set(key, { ts, runIds: new Set([String(read.runId(f))]) });
    } else if (ts === seen.ts) {
      // Rows written within one run can land on the same timestamp under
      // different ids; keep all of them rather than picking one.
      seen.runIds.add(String(read.runId(f)));
    }
  }

  return findings.filter((f) => {
    const key = classify(f, read);
    if (key === null) return true;
    const newest = latest.get(key);
    if (!newest) return true;
    // Timestamps inside one run drift by milliseconds, so a matching run id
    // is the stronger signal and is checked first.
    if (newest.runIds.has(String(read.runId(f)))) return true;
    const ts = read.timestamp(f);
    return Number.isFinite(ts) && ts === newest.ts;
  });
}

/** The (repository, cluster) key, or null when the row cannot be classified. */
function classify<T>(f: T, read: RunAccessors<T>): string | null {
  const repo = String(read.repo(f) || "").trim();
  const cluster = String(read.cluster(f) || "").trim();
  const runId = String(read.runId(f) || "").trim();
  if (!repo || !cluster || !runId) return null;
  return repo + " " + cluster;
}
