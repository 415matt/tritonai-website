import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { ROOT, listDistRoutes } from "./ux-agent/lib.mjs";
import { axeResults, interactionChecks, interactionChecksWithRetry, startDistServer, visit } from "./ux-agent/browser.mjs";

const VIEWPORTS = [390, 1440];
const reportFile = path.join(ROOT, "reports", "accessibility.json");
const allRoutes = await listDistRoutes();
const routeManifest = JSON.parse(await readFile(path.join(ROOT, "dist", "_data", "routes.json"), "utf8"));
const redirectRoutes = new Set(
  routeManifest.routes.filter((route) => route.redirectTo).map((route) => route.path),
);
const routes = allRoutes.filter((route) => !redirectRoutes.has(route));
const server = await startDistServer();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const pages = [];

try {
  for (const route of routes) {
    const result = { route, viewports: [] };
    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 1000 });
      try {
        const url = `${server.origin}${route}`;
        await visit(page, url, { settleMs: 150 });
        const viewportResult = {
          width,
          horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
          comparisonTableIssues: await page.evaluate(() => {
            const issues = [];
            for (const table of document.querySelectorAll("main .comparison-table")) {
              const wrapper = table.closest(".comparison-table-wrapper");
              if (!wrapper) continue;
              const bounds = wrapper.getBoundingClientRect();
              if (wrapper.scrollWidth > wrapper.clientWidth + 1) issues.push("clipped table content");
              for (const cell of table.querySelectorAll("tbody th, tbody td")) {
                const rect = cell.getBoundingClientRect();
                if (!rect.width || !rect.height) continue;
                if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1
                  || cell.scrollWidth > cell.clientWidth + 1) {
                  issues.push(`clipped cell: ${cell.textContent.trim().replace(/\s+/g, " ").slice(0, 60)}`);
                }
              }
              if (window.innerWidth <= 991) {
                for (const row of table.querySelectorAll("tbody tr:not(.comparison-table-action-row)")) {
                  const cells = [...row.querySelectorAll("td")];
                  const labels = cells.map((cell) => cell.querySelector(".comparison-mobile-label"));
                  if (labels.length !== 2 || labels.some((label) => !label || !label.getBoundingClientRect().height)
                    || labels[0]?.textContent.trim() !== "TritonGPT"
                    || labels[1]?.textContent.trim() !== "TritonAI Harness") {
                    issues.push("missing mobile product labels");
                  }
                  if (cells.length === 2 && cells[1].getBoundingClientRect().top < cells[0].getBoundingClientRect().bottom - 1) {
                    issues.push("mobile product values are not stacked");
                  }
                }
              }
            }
            return issues;
          }),
          collapsedHubMedia: width <= 991
            ? await page.evaluate(() => Array.from(document.querySelectorAll(".hub-split-media")).filter((media) => {
              const mediaRect = media.getBoundingClientRect();
              const splitRect = media.closest(".hub-split")?.getBoundingClientRect();
              return splitRect && mediaRect.height > 0 && mediaRect.width < splitRect.width * 0.9;
            }).length)
            : 0,
          adjacentButtonSizeMismatches: await page.evaluate(() => {
            const findings = [];
            for (const parent of document.querySelectorAll("main *")) {
              const buttons = Array.from(parent.children).filter((child) => child.matches?.(".btn"));
              if (buttons.length < 2) continue;
              const rows = new Map();
              for (const button of buttons) {
                const rect = button.getBoundingClientRect();
                if (!rect.width || !rect.height) continue;
                const row = Math.round(rect.top);
                if (!rows.has(row)) rows.set(row, []);
                rows.get(row).push({ button, rect });
              }
              for (const rowButtons of rows.values()) {
                if (rowButtons.length < 2) continue;
                const measurements = rowButtons.map(({ button, rect }) => {
                  const styles = getComputedStyle(button);
                  return {
                    text: (button.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
                    height: Math.round(rect.height),
                    fontSize: styles.fontSize,
                    paddingBlock: `${styles.paddingTop} ${styles.paddingBottom}`,
                  };
                });
                const first = measurements[0];
                if (measurements.some((measurement) => (
                  Math.abs(measurement.height - first.height) > 1
                  || measurement.fontSize !== first.fontSize
                  || measurement.paddingBlock !== first.paddingBlock
                ))) {
                  findings.push(measurements);
                }
              }
            }
            return findings;
          }),
          decoratorFonts: await page.evaluate(() => {
            const findings = [];
            const check = (selector, expectedFamily) => {
              for (const element of document.querySelectorAll(selector)) {
                const family = getComputedStyle(element).fontFamily;
                if (!family.toLowerCase().includes(expectedFamily.toLowerCase())) {
                  findings.push({
                    selector,
                    element: element.tagName.toLowerCase(),
                    family,
                    expectedFamily,
                    text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
                  });
                }
              }
            };
            check("body", "Roboto");
            check("main h1, main .hero-slide-heading", "Teko-SemiBold");
            check("main h3, main h4, main h5, main h6, nav, main .btn", "Roboto");
            return findings;
          }),
          axe: await axeResults(page),
        };
        const interactionResult = await interactionChecksWithRetry(
          () => interactionChecks(page, width),
          () => visit(page, url),
        );
        result.viewports.push({
          ...viewportResult,
          interactions: interactionResult.interactions,
          interactionAttempts: interactionResult.attempts,
          initialInteractionFailures: interactionResult.initialFailures,
        });
      } catch (error) {
        result.viewports.push({ width, error: error.message });
      }
    }
    pages.push(result);
  }
} finally {
  await context.close();
  await browser.close();
  await server.close();
}

const failures = [];
for (const result of pages) {
  for (const viewport of result.viewports) {
    const label = `${result.route} at ${viewport.width}px`;
    if (viewport.error) failures.push(`${label}: browser check failed: ${viewport.error}`);
    if (viewport.horizontalOverflow) failures.push(`${label}: horizontal overflow`);
    for (const issue of viewport.comparisonTableIssues || []) failures.push(`${label}: comparison table ${issue}`);
    if (viewport.collapsedHubMedia) failures.push(`${label}: collapsed split media (${viewport.collapsedHubMedia} ${viewport.collapsedHubMedia === 1 ? "node" : "nodes"})`);
    for (const mismatch of viewport.adjacentButtonSizeMismatches || []) {
      failures.push(`${label}: adjacent button size mismatch (${mismatch.map((button) => `${button.text}: ${button.height}px, ${button.fontSize}, ${button.paddingBlock}`).join("; ")})`);
    }
    for (const finding of viewport.decoratorFonts || []) {
      failures.push(`${label}: Decorator font mismatch on ${finding.element} (${finding.family}; expected ${finding.expectedFamily})`);
    }
    for (const violation of viewport.axe || []) {
      failures.push(`${label}: axe ${violation.impact || "unknown"} ${violation.id} (${violation.nodes} ${violation.nodes === 1 ? "node" : "nodes"})`);
    }
    if (viewport.interactions?.mobileToggle === "fail") failures.push(`${label}: mobile navigation keyboard check failed`);
    if (viewport.interactions?.mobileSearch === "fail") failures.push(`${label}: mobile navigation search check failed`);
    if (viewport.interactions?.drawerSearchBreakpoint === "fail") {
      failures.push(
        `${label}: drawer search does not match the Decorator across 768px — below it the panel must be #search and laid out, above it #search-m and hidden. Check for site CSS or JS reaching into the shell (npm run chrome:check).`,
      );
    }
    if (viewport.interactions?.desktopDropdown === "fail") failures.push(`${label}: desktop navigation keyboard check failed`);
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  standard: "WCAG 2.1 AA automated coverage",
  routes: routes.length,
  redirectsSkipped: [...redirectRoutes],
  viewports: VIEWPORTS,
  failures,
  pages,
  manualChecksStillRequired: [
    "Keyboard-only task completion and focus order",
    "Screen-reader reading order and announcements",
    "Content clarity and meaningful alternatives",
    "Zoom, reflow, orientation, and component-state review",
  ],
};
await mkdir(path.dirname(reportFile), { recursive: true });
await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);

process.stdout.write(`${JSON.stringify({ report: path.relative(ROOT, reportFile), routes: routes.length, redirectsSkipped: redirectRoutes.size, viewportChecks: routes.length * VIEWPORTS.length, failures: failures.length }, null, 2)}\n`);
if (failures.length) {
  process.stderr.write(`${failures.slice(0, 30).map((failure) => `- ${failure}`).join("\n")}\n`);
  process.exitCode = 1;
}
