import assert from "node:assert/strict";
import test from "node:test";
import { failedInteractionNames, interactionChecksWithRetry } from "../../scripts/ux-agent/browser.mjs";

test("failedInteractionNames returns only failed checks", () => {
  assert.deepEqual(
    failedInteractionNames({
      mobileToggle: "pass",
      mobileSearch: "fail",
      desktopDropdown: "not-present",
      drawerSearchBreakpoint: "fail",
    }),
    ["mobileSearch", "drawerSearchBreakpoint"],
  );
});

test("interactionChecksWithRetry does not reload a passing page", async () => {
  let reloads = 0;
  const outcome = { mobileToggle: "pass" };
  const result = await interactionChecksWithRetry(
    async () => outcome,
    async () => { reloads += 1; },
  );

  assert.deepEqual(result, { interactions: outcome, attempts: 1, initialFailures: [] });
  assert.equal(reloads, 0);
});

test("interactionChecksWithRetry retries once and preserves the initial evidence", async () => {
  let checks = 0;
  let reloads = 0;
  const result = await interactionChecksWithRetry(
    async () => {
      checks += 1;
      return checks === 1
        ? { mobileToggle: "fail", drawerSearchBreakpoint: "fail" }
        : { mobileToggle: "pass", drawerSearchBreakpoint: "pass" };
    },
    async () => { reloads += 1; },
  );

  assert.deepEqual(result, {
    interactions: { mobileToggle: "pass", drawerSearchBreakpoint: "pass" },
    attempts: 2,
    initialFailures: ["mobileToggle", "drawerSearchBreakpoint"],
  });
  assert.equal(checks, 2);
  assert.equal(reloads, 1);
});

test("interactionChecksWithRetry keeps a persistent defect failing", async () => {
  let reloads = 0;
  const result = await interactionChecksWithRetry(
    async () => ({ drawerSearchBreakpoint: "fail" }),
    async () => { reloads += 1; },
  );

  assert.deepEqual(result, {
    interactions: { drawerSearchBreakpoint: "fail" },
    attempts: 2,
    initialFailures: ["drawerSearchBreakpoint"],
  });
  assert.equal(reloads, 1);
});
