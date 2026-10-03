import { createHash } from "node:crypto";

export const HARNESS_REPOSITORY = "dbalders/TritonAI-Harness";
export const HARNESS_RELEASE_PAGE = "/developer-apis/harness-release-notes.html";
export const HARNESS_GITHUB = `https://github.com/${HARNESS_REPOSITORY}`;
export const GUIDED_INSTALLER_REPOSITORY = "dbalders/TritonAI-Installer";
const GUIDED_INSTALLER_GITHUB = `https://github.com/${GUIDED_INSTALLER_REPOSITORY}`;
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
  return downloadMetadata(release, previous, reviewedDate, HARNESS_GITHUB, (version, id) => `TritonAI-Harness-${version}-${id === "mac" ? "arm64.dmg" : "x64.exe"}`);
}

export function guidedInstallerFromRelease(release, previous, reviewedDate) {
  const result = downloadMetadata(release, previous, reviewedDate, GUIDED_INSTALLER_GITHUB, (version, id) => id === "mac" ? `TritonAI-Installer-${version}-arm64.dmg` : `TritonAI-Installer-Setup-${version}-x64.exe`);
  return { ...result, product: "TritonAI Installer", source: `${GUIDED_INSTALLER_GITHUB}/releases/latest`, releaseUrl: release.html_url };
}

function downloadMetadata(release, previous, reviewedDate, repositoryUrl, filenameFor) {
  if (!stableRelease(release)) throw new Error("Installer source must be a published stable release.");
  if (release.html_url !== `${repositoryUrl}/releases/tag/${release.tag_name}`) throw new Error("Installer release must come from its official repository.");
  const version = release.tag_name.slice(1);
  const platforms = {};
  for (const id of ["mac", "windows"]) {
    const filename = filenameFor(version, id);
    const matching = (release.assets || []).filter((asset) => asset.name === filename);
    const asset = matching[0];
    const downloadUrl = `${repositoryUrl}/releases/download/${release.tag_name}/${filename}`;
    if (matching.length !== 1 || asset.browser_download_url !== downloadUrl || !Number.isInteger(asset.size) || asset.size <= 0 || !/^sha256:[a-f0-9]{64}$/.test(asset.digest || "") || (asset.state && asset.state !== "uploaded")) {
      throw new Error(`Missing or invalid ${id} installer for ${release.tag_name}; current downloads were preserved.`);
    }
    platforms[id] = { ...previous.platforms[id], filename, sizeBytes: asset.size, sha256: asset.digest.slice(7), downloadUrl };
  }
  return { ...previous, version, publishedAt: release.published_at, lastReviewed: reviewedDate, platforms };
}

export function guidedInstallerIssues(installer) {
  const issues = [];
  if (!installer || installer.product !== "TritonAI Installer" || installer.source !== `${GUIDED_INSTALLER_GITHUB}/releases/latest` || !/^\d+\.\d+\.\d+$/.test(installer.version || "") || installer.releaseUrl !== `${GUIDED_INSTALLER_GITHUB}/releases/tag/v${installer.version}` || !Number.isFinite(Date.parse(installer.publishedAt)) || !/^\d{4}-\d{2}-\d{2}$/.test(installer.lastReviewed || "")) return ["Missing or invalid guided TritonAI Installer metadata."];
  for (const id of ["mac", "windows"]) {
    const platform = installer.platforms?.[id];
    const filename = id === "mac" ? `TritonAI-Installer-${installer.version}-arm64.dmg` : `TritonAI-Installer-Setup-${installer.version}-x64.exe`;
    if (!platform || platform.filename !== filename || platform.downloadUrl !== `${GUIDED_INSTALLER_GITHUB}/releases/download/v${installer.version}/${filename}` || !Number.isInteger(platform.sizeBytes) || platform.sizeBytes <= 0 || !/^[a-f0-9]{64}$/.test(platform.sha256 || "") || !platform.label || !platform.architecture || !platform.format) issues.push(`Invalid guided ${id} Installer artifact.`);
  }
  return issues;
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
