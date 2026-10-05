import { HARNESS_GITHUB, HARNESS_RELEASE_PAGE, releaseFragment } from "./harness-releases.mjs";

// All substitutions stay inside the writable page canvas. Release numbers,
// links, highlights and tagged documentation share one validated snapshot.
export function applyHarnessPageMetadata($, snapshot, summaries) {
  const canvas = $("main#main-content");
  const release = snapshot.releases.find((entry) => entry.tag === snapshot.latestTag);
  if (!release) throw new Error("Current Harness release is missing.");
  const summary = summaries.releases[release.tag];
  const version = release.tag.slice(1);
  canvas.find("[data-harness-version]").text(version);
  canvas.find("[data-harness-reviewed]").text(new Date(`${snapshot.lastReviewed}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }));
  canvas.find("[data-harness-release]").each((_, element) => {
    const target = $(element);
    target.attr("href", `${HARNESS_RELEASE_PAGE}${target.attr("data-harness-release") === "root" ? "" : `#${releaseFragment(release.tag)}`}`);
  });
  canvas.find("[data-harness-doc]").each((_, element) => {
    const target = $(element);
    const doc = target.attr("data-harness-doc");
    if (!/^docs\/[a-z0-9/-]+\.md$/.test(doc || "")) throw new Error("Invalid tagged Harness documentation path.");
    target.attr("href", `${HARNESS_GITHUB}/blob/${release.tag}/${doc}`);
  });
  canvas.find("[data-harness-current-highlights]").each((_, element) => {
    const target = $(element).empty();
    for (const highlight of summary.highlights) target.append($("<li>").text(highlight));
  });
  canvas.find("[data-harness-guidance]").each((_, element) => {
    const target = $(element);
    const topic = target.attr("data-harness-guidance");
    const guidance = summary.guidance?.[topic];
    if (!guidance?.length) throw new Error(`Missing current Harness guidance: ${topic}`);
    target.empty();
    for (const text of guidance) target.append($("<li>").text(topic === "setup" ? text.replace(/(?<!TritonAI )\bHarness\b/g, "TritonAI Harness") : text));
  });
}
