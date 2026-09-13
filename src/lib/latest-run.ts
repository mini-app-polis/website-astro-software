/**
 * Keep only the findings from the most recent run, per repository and per
 * run type.
 *
 * ## Why this is keyed on the repository
 *
 * It did not used to be. Conformance ran as one nightly sweep over the whole
 * fleet, so every repo's deterministic findings shared a run_id and a
 * timestamp, and "the latest deterministic run" was a single global fact.
 * Filtering on the cluster alone was correct, and cheaper.
 *
 * Evaluation is now triggered per repository on release (evaluator-cog
 * ADR-0004). One repo cutting a version produces conformance_deterministic
 * rows for itself, with a fresh run_id and a newer timestamp than the last
 * sweep. Under the old rule that run became the bar for every repo, so a
 * single release blanked the conformance findings of the other fifteen and
 * the board looked clean because it was empty.
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
 * @template T
 * @param {T[]} findings
 * @param {{
 *   repo: (f: T) => string,
 *   cluster: (f: T) => string,
 *   runId: (f: T) => string,
 *   timestamp: (f: T) => number,
 * }} read Accessors, because callers disagree about field names
 *   (repo vs repository, evaluated_at vs created_at).
 * @returns {T[]} the subset belonging to the newest run of each
 *   (repository, cluster) pair.
 */
export function keepLatestRunPerRepoCluster(findings, read) {
  const latest = new Map();

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
function classify(f, read) {
  const repo = String(read.repo(f) || "").trim();
  const cluster = String(read.cluster(f) || "").trim();
  const runId = String(read.runId(f) || "").trim();
  if (!repo || !cluster || !runId) return null;
  return repo + " " + cluster;
}
