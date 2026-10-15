import * as cheerio from "cheerio";

export const HARNESS_PUBLIC_ROUTES = ["/developer-apis/start.html", "/developer-apis/harness.html", "/developer-apis/harness-release-notes.html", "/developer-apis/faq.html", "/developer-apis/harness-privacy.html", "/developer-apis/citizen-developer.html", "/developer-apis/index.html", "/skills/index.html"];

export function harnessPublicationIssues(route, html, releases, summary, installer) {
  const $ = cheerio.load(html);
  const canvas = $("main#main-content");
  const issues = [];
  if (!canvas.length) return ["missing page canvas"];
  const versions = canvas.find("[data-harness-version]").toArray();
  if (route.endsWith("harness-release-notes.html")) {
    if (!canvas.find(`#harness-${releases.latestTag.replace(/\./g, "-")}`).length) issues.push("missing current release entry");
    if (summary.highlights.some((text) => !canvas.text().includes(text))) issues.push("current release highlights differ");
  } else if (route === "/developer-apis/index.html") {
    // The Build hub links to product details without displaying a version.
    // Keep its Harness navigation required even when it has no release block.
    const links = new Set(canvas.find("a[href]").toArray().map((e) => $(e).attr("href").split("#")[0]));
    for (const target of ["/developer-apis/harness.html", "/developer-apis/harness-release-notes.html", "/developer-apis/start.html"]) {
      if (!links.has(target)) issues.push(`missing Harness resource link: ${target}`);
    }
  } else if (!versions.length) {
    issues.push("missing current version field");
  }
  if (versions.some((element) => $(element).text().trim() !== releases.latestTag.slice(1))) issues.push("current version differs");
  canvas.find("[data-harness-guidance]").each((_, element) => {
    const topic = $(element).attr("data-harness-guidance");
    const expected = summary.guidance?.[topic]?.map((text) => topic === "setup" ? text.replace(/(?<!TritonAI )\bHarness\b/g, "TritonAI Harness") : text);
    const actual = $(element).find("li").toArray().map((item) => $(item).text().trim());
    if (!expected || JSON.stringify(actual) !== JSON.stringify(expected)) issues.push(`${topic} guidance differs`);
  });
  canvas.find("[data-harness-current-highlights]").each((_, element) => {
    const actual = $(element).find("li").toArray().map((item) => $(item).text().trim());
    if (JSON.stringify(actual) !== JSON.stringify(summary.highlights)) issues.push("current release highlights differ");
  });
  if (route.endsWith("start.html")) {
    const links = new Set(canvas.find("a[href]").toArray().map((e) => $(e).attr("href")));
    for (const id of ["mac", "windows"]) {
      if (!links.has(installer.guided.platforms[id].downloadUrl)) issues.push(`${id} guided installer link differs`);
    }
  }
  return issues;
}
