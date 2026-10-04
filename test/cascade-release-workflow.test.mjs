import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// These tests protect one rule: a change reaches a published destination only
// by being pushed to the branch that owns it, and only after validation passes.
//
// They previously asserted that Cascade could not be triggered by a push at
// all. That was aimed at the wrong pipeline. The accidental publishes came from
// GitHub Pages, which deployed from main on every push and again hourly;
// locking down Cascade stopped the release path while leaving the cause in
// place. Pages now publishes from the playground branch, and Cascade is
// branch-driven again.

const cascadeUrl = new URL("../.github/workflows/cascade-upload.yml", import.meta.url);
const pagesUrl = new URL("../.github/workflows/pages.yml", import.meta.url);

test("Cascade publishes from main and preview, and no other branch", async () => {
  const workflow = await readFile(cascadeUrl, "utf8");

  const pushBlock = /^\s{2}push:\n\s{4}branches:\n((?:\s{6}- \S+\n)+)/m.exec(workflow);
  assert.ok(pushBlock, "cascade-upload.yml must publish on push");

  const branches = pushBlock[1].match(/- (\S+)/g).map((line) => line.slice(2)).sort();
  assert.deepEqual(branches, ["main", "preview"]);
});

test("each branch is bound to its own destination", async () => {
  const workflow = await readFile(cascadeUrl, "utf8");

  assert.match(workflow, /main:refs\/heads\/main/);
  assert.match(workflow, /preview:refs\/heads\/preview/);
  // A mismatch between the chosen target and the branch is always rejected.
  assert.match(workflow, /does not match selected ref/);
});

test("a manual production run still requires confirmation", async () => {
  const workflow = await readFile(cascadeUrl, "utf8");

  assert.match(workflow, /confirm_production:/);
  assert.match(workflow, /Manual production publishing requires confirm_production=true/);
  // The confirmation applies to workflow_dispatch only. Pushing to main is
  // itself the decision to release, so it must not demand a second one that
  // nobody is present to give.
  const guardLine = workflow
    .split("\n")
    .find((line) => line.includes("confirm_production") && line.includes("!= \"true\""));
  assert.ok(guardLine, "expected a shell guard comparing confirm_production");
  assert.ok(
    guardLine.includes("workflow_dispatch"),
    `the confirm_production guard must be scoped to workflow_dispatch, otherwise every push to main fails. Found: ${guardLine.trim()}`,
  );
});

test("Cascade upload is skipped when the release gate finds no update", async () => {
  const workflow = await readFile(cascadeUrl, "utf8");

  assert.match(workflow, /deploy:\n(?:.|\n)*?if: needs\.build\.outputs\.should_deploy == 'true'/);
});

test("GitHub Pages publishes from playground, never from main", async () => {
  const workflow = await readFile(pagesUrl, "utf8");

  const pushBlock = /^\s{2}push:\n\s{4}branches:\n((?:\s{6}- \S+\n)+)/m.exec(workflow);
  assert.ok(pushBlock, "pages.yml must declare its push branches");

  const branches = pushBlock[1].match(/- (\S+)/g).map((line) => line.slice(2));
  assert.deepEqual(branches, ["playground"]);
  assert.ok(!branches.includes("main"), "Pages must not deploy from main");
});

test("the hourly Pages run validates without deploying", async () => {
  const workflow = await readFile(pagesUrl, "utf8");

  // Scheduled workflows only ever run on the default branch, so a scheduled
  // deploy would overwrite the playground with main's content every hour.
  assert.match(workflow, /schedule:/);
  assert.match(
    workflow,
    /deploy:\n(?:.|\n)*?if: github\.event_name == 'push' \|\| github\.event_name == 'workflow_dispatch'/,
  );
});


test("production path guard permits external courses and rejects local base paths", async () => {
  const { hasProductionBasePathLeak } = await import("../scripts/check-production-base-path.mjs");
  for (const value of [
    '<a href="https://bpollak.github.io/tritonai-website/training/harness/">Training</a>',
    '<a href="https://github.com/bpollak/tritonai-website">Source</a>',
    '<a href="//bpollak.github.io/tritonai-website/training/harness/">Training</a>',
    '<a href="/training/harness/">Training</a>',
  ]) assert.equal(hasProductionBasePathLeak(value), false, value);
  for (const value of [
    '<a href="/tritonai-website/training/harness/">Training</a>',
    'url(/tritonai-website/_images/banner.webp)',
    '{"path":"/tritonai-website/"}',
    '<loc>https://tritonai.ucsd.edu/tritonai-website/training/harness/</loc>',
    '<a href="//tritonai.ucsd.edu/tritonai-website/">Training</a>',
    '<a href="https://bpollak.github.io/tritonai-website/"></a><img src="/tritonai-website/banner.webp">',
  ]) assert.equal(hasProductionBasePathLeak(value), true, value);
  const workflow = await readFile(cascadeUrl, "utf8");
  assert.match(workflow, /run: node scripts\/check-production-base-path\.mjs/);
});
