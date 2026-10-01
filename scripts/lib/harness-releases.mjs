import { createHash } from "node:crypto";

export const HARNESS_REPOSITORY = "dbalders/TritonAI-Harness";
export const HARNESS_RELEASE_PAGE = "/developer-apis/harness-release-notes.html";
export const HARNESS_GITHUB = `https://github.com/${HARNESS_REPOSITORY}`;
export const releaseFragment = (tag) => `harness-${tag.replaceAll(".", "-")}`;

export function stableRelease(release) {
  return release.draft === false && release.prerelease === false && /^v\d+\.\d+\.\d+$/.test(release.tag_name || "") && Boolean(release.published_at);
}

export function releaseSnapshot(releases, latestTag, reviewedDate) {
  const stable = releases.filter(stableRelease).sort((a, b) => b.published_at.localeCompare(a.published_at));
  if (!stable.length || !stable.some((release) => release.tag_name === latestTag)) throw new Error("Latest stable release is missing from the release list.");
  if (new Set(stable.map((release) => release.tag_name)).size !== stable.length) throw new Error("Duplicate stable release tags.");
  return {
    schemaVersion: 1,
    owner: "TritonAI service team",
    source: `${HARNESS_GITHUB}/releases`,
    canonicalUrl: HARNESS_RELEASE_PAGE,
    dataClassification: "Public",
    lastReviewed: reviewedDate,
    latestTag,
    releases: stable.map((release) => {
      const notesUrl = `${HARNESS_GITHUB}/releases/tag/${release.tag_name}`;
      if (release.html_url !== notesUrl || !Number.isFinite(Date.parse(release.published_at))) throw new Error(`Invalid published release: ${release.tag_name}`);
      return {
        tag: release.tag_name,
        publishedAt: release.published_at,
        notesUrl,
        notesDigest: createHash("sha256").update(release.body || "").digest("hex"),
      };
    }),
  };
}

export function installerFromRelease(release, previous, reviewedDate) {
  if (!stableRelease(release)) throw new Error("Installer source must be a published stable release.");
  const version = release.tag_name.slice(1);
  const platforms = {};
  for (const [id, suffix] of [["mac", "arm64.dmg"], ["windows", "x64.exe"]]) {
    const filename = `TritonAI-Harness-${version}-${suffix}`;
    const matching = (release.assets || []).filter((asset) => asset.name === filename);
    const asset = matching[0];
    const downloadUrl = `${HARNESS_GITHUB}/releases/download/${release.tag_name}/${filename}`;
    if (matching.length !== 1 || asset.browser_download_url !== downloadUrl || !Number.isInteger(asset.size) || asset.size <= 0 || !/^sha256:[a-f0-9]{64}$/.test(asset.digest || "") || (asset.state && asset.state !== "uploaded")) {
      throw new Error(`Missing or invalid ${id} installer for ${release.tag_name}; current downloads were preserved.`);
    }
    platforms[id] = { ...previous.platforms[id], filename, sizeBytes: asset.size, sha256: asset.digest.slice(7), downloadUrl };
  }
  return { ...previous, version, publishedAt: release.published_at, lastReviewed: reviewedDate, platforms };
}

export function releaseSummaryIssues(snapshot, summaries, installer) {
  const issues = [];
  if (summaries.schemaVersion !== 1 || !summaries.owner) issues.push("Invalid Harness public summary metadata.");
  if (snapshot.schemaVersion !== 1 || snapshot.canonicalUrl !== HARNESS_RELEASE_PAGE || snapshot.source !== `${HARNESS_GITHUB}/releases` || !snapshot.releases?.length) issues.push("Invalid Harness release snapshot.");
  const byTag = new Map((snapshot.releases || []).map((release) => [release.tag, release]));
  if (byTag.size !== snapshot.releases?.length) issues.push("Duplicate Harness release tags.");
  for (const release of snapshot.releases || []) {
    if (!/^v\d+\.\d+\.\d+$/.test(release.tag) || release.notesUrl !== `${HARNESS_GITHUB}/releases/tag/${release.tag}` || !Number.isFinite(Date.parse(release.publishedAt)) || !/^[a-f0-9]{64}$/.test(release.notesDigest || "")) issues.push(`Invalid release metadata: ${release.tag}`);
  }
  if (snapshot.latestTag !== `v${installer.version}` || !byTag.has(snapshot.latestTag)) issues.push("Harness notes and installer versions differ.");
  if (!summaries.releases?.[snapshot.latestTag]) issues.push(`Add a public summary for ${snapshot.latestTag} before publishing.`);
  for (const [tag, summary] of Object.entries(summaries.releases || {})) {
    const release = byTag.get(tag);
    if (!release || summary.source !== release.notesUrl || summary.sourceDigest !== release.notesDigest) issues.push(`Source notes changed or are missing for ${tag}; review its public summary.`);
    if (!Array.isArray(summary.highlights) || !summary.highlights.length || summary.highlights.some((text) => typeof text !== "string" || !text.trim()) || !/^\d{4}-\d{2}-\d{2}$/.test(summary.lastReviewed || "")) issues.push(`Incomplete public summary: ${tag}`);
    if (summary.reviewStatus === "pending") issues.push(`Review the generated public summary for ${tag} before publishing.`);
    if (summary.generatedBy) {
      const generation = summary.generatedBy;
      const traceable = generation.method === "gateway-api" ? Boolean(generation.responseId) : generation.method === "harness-task" && Boolean(generation.threadId);
      if (generation.kind !== "on-premises-llm" || generation.providerInstance !== "tritonai_onprem" || generation.model !== "api-glm-5.3" || !traceable || !Number.isFinite(Date.parse(generation.generatedAt))) issues.push(`Invalid on-premises summary provenance: ${tag}`);
    }
  }
  return issues;
}
