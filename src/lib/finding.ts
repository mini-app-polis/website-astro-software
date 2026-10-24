/**
 * One evaluation finding as the API returns it (/v1/evaluations). The
 * pages read it defensively: any field may be missing on an old or
 * partial row, and callers disagree about some names (repo vs repository,
 * evaluated_at vs created_at).
 */
export interface Finding {
  id?: string | number | null;
  repo?: string | null;
  repository?: string | null;
  source?: string | null;
  severity?: string | null;
  dimension?: string | null;
  violation_id?: string | null;
  rule_id?: string | null;
  run_id?: string | number | null;
  evaluated_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}
