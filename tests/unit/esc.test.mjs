// esc() is the escape seam for every panel that renders API-supplied text
// through innerHTML. Runs on Node's built-in type stripping (Node >= 22.18).

import { test } from "node:test";
import assert from "node:assert/strict";
import { esc } from "../../src/lib/repos.ts";

test("esc escapes the five HTML-significant characters", () => {
  assert.equal(esc(`<a href="x" title='y'>&</a>`), "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
});

test("esc neutralises a script/event-handler payload", () => {
  const out = esc(`<img src=x onerror="alert(1)">`);
  assert.ok(!out.includes("<"));
  assert.ok(!out.includes('"'));
});

test("esc escapes & first so existing entities are not double-decoded", () => {
  assert.equal(esc("&lt;"), "&amp;lt;");
});

test("esc renders null and undefined as empty and stringifies other values", () => {
  assert.equal(esc(null), "");
  assert.equal(esc(undefined), "");
  assert.equal(esc(42), "42");
});
