// What software.kaianolevine.com expects of api-kaianolevine-com (TEST-016).
//
// One test per call the site makes, asserting the fields the site reads —
// not the API's whole schema. When the site starts reading a new field, add
// it here; when it stops, remove it. See harness.mjs for the guard and why
// this suite is read-only.

import { test } from "node:test";
import assert from "node:assert/strict";
import { call, expectData, expectRows, expectShape, notProvisioned } from "./harness.mjs";

// EvaluationSummary, RecentFindings and the pipeline page read these. The
// pipeline page also tolerates `repository`, `created_at`, `message`, `text`
// and `timestamp` as fallbacks, so those are not required.
const EVALUATION = {
  run_id: "string|null",
  violation_id: "string|null",
  repo: "string",
  dimension: "string",
  severity: "string",
  finding: "string",
  suggestion: "string|null",
  standards_version: "string|null",
  evaluator_version: "string|null",
  "source?": "string|null",
  "flow_name?": "string|null",
  evaluated_at: "string",
};

test("GET /v1/evaluations — pages with limit and offset, and reports meta.total", async (t) => {
  // EvaluationSummary pages at the API's cap of 500 and stops at meta.total.
  const path = "/v1/evaluations?limit=500&offset=0";
  const res = await call(path);
  const rows = expectRows(t, expectData(res, path), EVALUATION, path);
  assert.ok(rows.length <= 500, `${path} ignored limit (${rows.length} rows)`);
  const total = res.body.meta?.total;
  assert.equal(typeof total, "number", `${path} envelope has no numeric meta.total`);
  assert.ok(total >= rows.length, `${path} meta.total ${total} is below the rows returned`);

  if (total > 1) {
    const next = "/v1/evaluations?limit=1&offset=1";
    const page = expectData(await call(next), next);
    assert.ok(Array.isArray(page) && page.length === 1, `${next} did not return the next row`);
  }
});

test("GET /v1/flags — FeatureFlags", async (t) => {
  const path = "/v1/flags";
  expectRows(t, expectData(await call(path), path), {
    name: "string",
    enabled: "boolean",
    description: "string|null",
  }, path);
});

test("GET /v1/github/status — RepoStatus", async (t) => {
  const path = "/v1/github/status";
  const res = await call(path);
  if (notProvisioned(t, res, path, 501, "not_configured")) return;
  const status = expectData(res, path);
  expectShape(status, {
    fetched_at: "string",
    stale: "boolean",
    repositories: "array",
    unavailable_orgs: "array",
    orgs: "array",
    totals: "object",
  }, path);
  expectShape(status.totals, {
    repositories: "number",
    open_pull_requests: "number",
    open_issues: "number",
    builds: "object",
  }, `${path}.totals`);
  for (const state of ["failure", "error", "pending", "none", "success"]) {
    assert.equal(typeof status.totals.builds[state], "number", `${path}.totals.builds.${state}`);
  }
  status.repositories.forEach((repo, i) =>
    expectShape(repo, {
      org: "string",
      name: "string",
      private: "boolean",
      url: "string",
      description: "string|null",
      language: "string|null",
      build: "string",
      open_pull_requests: "number",
      open_issues: "number",
      branches: "number",
      pushed_at: "string|null",
    }, `${path}.repositories[${i}]`),
  );
});

test("GET /v1/standards/catalog — StandardsBrowser and StandardsVersion", async (t) => {
  const path = "/v1/standards/catalog";
  const res = await call(path);
  if (notProvisioned(t, res, path, 404, "no_catalog_published")) return;
  const catalog = expectData(res, path);
  expectShape(catalog, {
    version: "string",
    compiled_at: "string",
    rule_count: "number",
    rules: "array",
  }, path);
  catalog.rules.forEach((rule, i) =>
    expectShape(rule, {
      id: "string",
      "domain?": "string",
      title: "string",
      status: "string",
      description: "string",
      "severity?": "string",
      "applies_to?": "array|null",
    }, `${path}.rules[${i}]`),
  );
});

test("GET /v1/resume — the resume page links straight to a PDF", async (t) => {
  const path = "/v1/resume";
  const res = await call(path, { headers: { accept: "application/pdf" } });
  if (notProvisioned(t, res, path, 501, "not_configured")) return;
  assert.equal(res.status, 200, `${path} answered ${res.status}`);
  assert.match(res.headers.get("content-type") ?? "", /application\/pdf/, `${path} is not a PDF`);
});
