import test from "node:test";
import assert from "node:assert/strict";
import {
  liveCommitFromHtml,
  shouldDeploySkills,
  snapshotCommit,
} from "../scripts/skills-release-gate.mjs";
import { isRetiredSkillDescription } from "../scripts/lib/skills-source.mjs";

const COMMIT = "4d4c48be70156d1d18c80576037f8770f5a68c34";

test("snapshotCommit accepts and normalizes a full commit SHA", () => {
  assert.equal(snapshotCommit({ source: { commitSha: COMMIT.toUpperCase() } }), COMMIT);
});

test("snapshotCommit rejects a missing or abbreviated commit SHA", () => {
  assert.throws(() => snapshotCommit({ source: { commitSha: COMMIT.slice(0, 12) } }), /valid source commit SHA/);
});

test("liveCommitFromHtml reads the pinned Skills Library commit link", () => {
  const html = `<a href="https://github.com/dbalders/UCSD-Skills-Library/commit/${COMMIT}">source</a>`;
  assert.equal(liveCommitFromHtml(html, "dbalders/UCSD-Skills-Library"), COMMIT);
});

test("scheduled and repository-triggered runs skip a current production catalog", () => {
  assert.equal(shouldDeploySkills("schedule", COMMIT, COMMIT), false);
  assert.equal(shouldDeploySkills("repository_dispatch", COMMIT, COMMIT), false);
});

test("scheduled runs deploy a changed or unreadable production catalog", () => {
  assert.equal(shouldDeploySkills("schedule", COMMIT, "f".repeat(40)), true);
  assert.equal(shouldDeploySkills("schedule", COMMIT, ""), true);
});

test("main pushes and manual runs always deploy", () => {
  assert.equal(shouldDeploySkills("push", COMMIT, COMMIT), true);
  assert.equal(shouldDeploySkills("workflow_dispatch", COMMIT, COMMIT), true);
});

test("retired skills are excluded from the public catalog", () => {
  assert.equal(isRetiredSkillDescription("Retired. Superseded by ucsd-decorator."), true);
  assert.equal(isRetiredSkillDescription("Build and edit UC San Diego web pages."), false);
});
