import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { ROOT } from "./lib.mjs";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

export function screenshotFilename(route, width, suffix = "") {
  const stem = route === "/" ? "home" : route.replace(/^\//, "").replaceAll("/", "-").replace(/\.html$/, "");
  return `${stem}-${width}${suffix}.png`;
}

function safeFilePath(distDir, requestPath, basePath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const mounted = decoded === basePath || decoded.startsWith(`${basePath}/`) ? decoded.slice(basePath.length) || "/" : decoded;
  const pathname = mounted === "/" ? "/index.html" : mounted;
  const candidate = path.resolve(distDir, `.${pathname}`);
  if (!candidate.startsWith(`${path.resolve(distDir)}${path.sep}`) && candidate !== path.join(path.resolve(distDir), "index.html")) return null;
  return candidate;
}

export async function startDistServer(distDir = path.join(ROOT, "dist")) {
  const packageName = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8")).name;
  const basePath = `/${packageName}`;
  const server = http.createServer(async (request, response) => {
    const filename = safeFilePath(distDir, request.url || "/", basePath);
    if (!filename) {
      response.writeHead(400).end("Bad request");
      return;
    }
    try {
      const entry = await stat(filename);
      if (!entry.isFile()) throw new Error("Not a file");
      response.writeHead(200, { "content-type": MIME_TYPES[path.extname(filename).toLowerCase()] || "application/octet-stream" });
      createReadStream(filename).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}

export async function preparePage(page) {
  await page.addStyleTag({
    content: "*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:0.01ms!important}",
  });
  await page.evaluate(() => {
    for (const carousel of document.querySelectorAll(".carousel")) carousel.classList.add("paused");
    for (const video of document.querySelectorAll("video")) video.pause();
  });
}

export async function visit(page, url, { settleMs = 600 } = {}) {
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(settleMs);
  await preparePage(page);
}

/**
 * The Decorator owns the drawer search across 768px, and it does so through an
 * id it rewrites at runtime: `base.min.js` renames `#search-m` to `#search`
 * below the breakpoint, and `base.min.css` styles the panel through
 * `.offcanvas > ul.nav.navbar-nav.navbar-right #search`. Site CSS that reaches
 * in, or site JS that touches those ids, breaks the drawer with the markup
 * still intact — so this asserts the rendered result on both sides of the
 * breakpoint rather than the markup.
 */
async function drawerSearchBreakpoint(page, width) {
  // The Decorator rewrites these ids in its own resize handler, which only runs
  // once base.min.js has loaded. Measuring before that reads the build's markup
  // rather than the rendered result.
  await page.waitForFunction(
    () => typeof window.toggleIdsAndClassesBasedOnScreenWidth === "function",
    null,
    { timeout: 3000 },
  ).catch(() => {});
  return page.evaluate((viewportWidth) => {
    const drawer = document.getElementById("mobile-navigation");
    const panel = drawer?.querySelector(".msearch .search-content");
    const term = drawer?.querySelector(".msearch input[type='search']");
    if (!panel || !term) return "not-present";
    const display = getComputedStyle(panel).display;
    if (viewportWidth >= 768) {
      // Above the breakpoint the Decorator hands the ids back and its own
      // stylesheet hides the panel. A site override would keep it laid out.
      return display === "none" && panel.id === "search-m" && term.classList.contains("search-term-m")
        ? "pass"
        : "fail";
    }
    // Below it, the panel is laid out inside the open drawer. The caller has the
    // drawer open, so height is measurable here.
    return display !== "none"
      && panel.id === "search"
      && term.classList.contains("search-term")
      && panel.getBoundingClientRect().height >= 49
      ? "pass"
      : "fail";
  }, width);
}

export async function interactionChecks(page, width) {
  const outcome = {
    mobileToggle: "not-present",
    mobileSearch: "not-applicable",
    desktopDropdown: "not-present",
    drawerSearchBreakpoint: "not-present",
  };
  const mobileToggle = page.locator("[data-tritonai-mobile-toggle]").first();
  if (await mobileToggle.count()) {
    const before = await mobileToggle.getAttribute("aria-expanded");
    if (width < 768) {
      await page.waitForFunction(
        () => typeof window.jQuery === "function" && typeof window.jQuery.fn?.offcanvas === "function",
        null,
        { timeout: 3000 },
      ).catch(() => {});
      await mobileToggle.press("Enter");
      await page.waitForFunction(
        () => document.querySelector("[data-tritonai-mobile-toggle]")?.getAttribute("aria-expanded") === "true",
        null,
        { timeout: 2000 },
      ).catch(() => {});
      await page.waitForFunction(() => {
        const navigation = document.getElementById("mobile-navigation");
        const scope = navigation?.querySelector(".msearch select.search-scope");
        const term = navigation?.querySelector(".msearch input.search-term");
        return (
          navigation?.classList.contains("in")
          && scope?.getClientRects().length
          && term?.getClientRects().length
          && document.activeElement === scope
        );
      }, null, { timeout: 2000 }).catch(() => {});
    }
    const after = await mobileToggle.getAttribute("aria-expanded");
    const controls = await mobileToggle.getAttribute("aria-controls");
    outcome.mobileToggle = (
      controls === "mobile-navigation"
      && ["true", "false"].includes(before)
      && ["true", "false"].includes(after)
      && (width >= 768 || after === "true")
    ) ? "pass" : "fail";
    if (width < 768) {
      const mobileSearch = page.locator("#mobile-navigation .msearch .search-content");
      const scope = mobileSearch.locator("select.search-scope");
      const term = mobileSearch.locator("input.search-term");
      outcome.mobileSearch = (
        after === "true"
        && await mobileSearch.isVisible()
        && await mobileSearch.evaluate((element) => element.getBoundingClientRect().height >= 49)
        && await scope.isVisible()
        && await term.isVisible()
        && await scope.evaluate((element) => element === document.activeElement)
      ) ? "pass" : "fail";
    }
    // Measured with the drawer open below 768px, closed above it — which is the
    // state each side of the breakpoint is supposed to be in.
    outcome.drawerSearchBreakpoint = await drawerSearchBreakpoint(page, width);
    if (width < 768 && after === "true") await mobileToggle.press("Escape");
  }
  const dropdown = page.locator("[data-tritonai-nav-dropdown]").first();
  if (await dropdown.count()) {
    await dropdown.focus();
    await dropdown.press("Escape");
    outcome.desktopDropdown = (await dropdown.getAttribute("aria-expanded")) === "false" ? "pass" : "fail";
  }
  return outcome;
}

export function failedInteractionNames(outcome) {
  return Object.entries(outcome)
    .filter(([, status]) => status === "fail")
    .map(([name]) => name);
}

// Decorator behavior depends on remote CDN scripts. A single clean reload lets
// the gate distinguish a transient dependency delay from a persistent shell
// defect without weakening the final interaction result.
export async function interactionChecksWithRetry(check, reload) {
  const initial = await check();
  const initialFailures = failedInteractionNames(initial);
  if (!initialFailures.length) {
    return { interactions: initial, attempts: 1, initialFailures };
  }

  await reload();
  return {
    interactions: await check(),
    attempts: 2,
    initialFailures,
  };
}

export async function axeResults(page) {
  const result = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  return result.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.length,
    targets: violation.nodes.slice(0, 5).map((node) => node.target),
  }));
}

export async function captureBrowserAudit({ config, routes, reportDir, routeFilter }) {
  const selectedRoutes = routeFilter ? routes.filter((route) => route === routeFilter) : routes;
  const representative = config.representativeRoutes.filter((route) => selectedRoutes.includes(route));
  const screenshotsDir = path.join(reportDir, "screenshots");
  const server = await startDistServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const pages = [];
  const references = [];
  try {
    for (const route of selectedRoutes) {
      const dimensions = [390, 1440];
      const pageResult = { route, viewports: [] };
      for (const width of dimensions) {
        await page.setViewportSize({ width, height: 1000 });
        try {
          await visit(page, `${server.origin}${route}`);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
          pageResult.viewports.push({ width, horizontalOverflow: overflow, axe: await axeResults(page), interactions: await interactionChecks(page, width) });
        } catch (error) {
          pageResult.viewports.push({ width, error: error.message });
        }
      }
      pages.push(pageResult);
    }
    for (const route of representative) {
      for (const width of config.breakpoints) {
        await page.setViewportSize({ width, height: 1000 });
        try {
          await visit(page, `${server.origin}${route}`);
          const name = screenshotFilename(route, width);
          await page.screenshot({ path: path.join(screenshotsDir, name), fullPage: true });
          if (width === 992) await page.screenshot({ path: path.join(screenshotsDir, screenshotFilename(route, width, "-viewport")), fullPage: false });
        } catch (error) {
          pages.find((entry) => entry.route === route)?.viewports.push({ width, screenshotError: error.message });
        }
      }
    }
    for (const reference of config.references) {
      const referenceResult = { id: reference.id, url: reference.url, screenshots: [] };
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        try {
          await visit(page, reference.url);
          const filename = `reference-${reference.id}-${width}.png`;
          await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: true });
          referenceResult.screenshots.push({ width, filename });
        } catch (error) {
          referenceResult.screenshots.push({ width, error: error.message });
        }
      }
      references.push(referenceResult);
    }
  } finally {
    await context.close();
    await browser.close();
    await server.close();
  }
  return { pages, references };
}
