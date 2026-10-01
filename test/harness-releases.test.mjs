import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HARNESS_GITHUB, installerFromRelease, releaseSnapshot, releaseSummaryIssues } from "../scripts/lib/harness-releases.mjs";
const fixture = (tag = "v1.2.3") => ({ tag_name: tag, draft: false, prerelease: false, published_at: "2026-10-01T00:00:00Z", html_url: `${HARNESS_GITHUB}/releases/tag/${tag}`, body: "Release notes", assets: ["arm64.dmg", "x64.exe"].map((suffix) => ({ name: `TritonAI-Harness-${tag.slice(1)}-${suffix}`, browser_download_url: `${HARNESS_GITHUB}/releases/download/${tag}/TritonAI-Harness-${tag.slice(1)}-${suffix}`, size: 123, digest: `sha256:${"a".repeat(64)}`, state: "uploaded" })) });
const previous = { version: "1.0.0", platforms: { mac: { label: "Download for Mac", architecture: "Apple Silicon", format: "DMG" }, windows: { label: "Download for Windows", architecture: "x64", format: "Setup EXE" } } };

test("exclude draft, prerelease, nightly, and unknown-status releases", () => {
  const stable = fixture();
  const snapshot = releaseSnapshot([stable, { ...fixture("v1.2.4"), draft: true }, { ...fixture("v1.2.5"), prerelease: true }, fixture("v1.3.0-nightly.1"), { ...fixture("v1.2.6"), draft: undefined }], stable.tag_name, "2026-10-01");
  assert.deepEqual(snapshot.releases.map((r) => r.tag), [stable.tag_name]);
});
test("reject unsafe source links and incomplete release lists", () => {
  assert.throws(() => releaseSnapshot([{ ...fixture(), html_url: "https://example.com/release" }], "v1.2.3", "2026-10-01"), /Invalid published release/);
  assert.throws(() => releaseSnapshot([fixture()], "v9.0.0", "2026-10-01"), /missing/);
});
test("select actual installer files rather than blockmaps or release pages", () => {
  const release = fixture();
  release.assets.unshift({ name: "TritonAI-Harness-1.2.3-arm64.dmg.blockmap" });
  const result = installerFromRelease(release, previous, "2026-10-01");
  assert.match(result.platforms.mac.downloadUrl, /\/releases\/download\/v1\.2\.3\/TritonAI-Harness-1\.2\.3-arm64\.dmg$/);
  assert.match(result.platforms.windows.downloadUrl, /1\.2\.3-x64\.exe$/);
  assert.equal(previous.version, "1.0.0");
});
test("reject missing Windows installers, bad digests, and foreign download URLs", () => {
  for (const alter of [r => r.assets.pop(), r => r.assets[0].digest = "bad", r => r.assets[0].browser_download_url = "https://example.com/app.dmg"]) {
    const release = fixture(); alter(release);
    assert.throws(() => installerFromRelease(release, previous, "2026-10-01"), /Missing or invalid/);
  }
});
test("edited notes and new releases require a matching public summary", () => {
  const release = fixture();
  const snapshot = releaseSnapshot([release], release.tag_name, "2026-10-01");
  const installer = installerFromRelease(release, previous, "2026-10-01");
  const summaries = { schemaVersion: 1, owner: "TritonAI service team", releases: { [release.tag_name]: { source: release.html_url, sourceDigest: snapshot.releases[0].notesDigest, lastReviewed: "2026-10-01", highlights: ["An update"] } } };
  assert.deepEqual(releaseSummaryIssues(snapshot, summaries, installer), []);
  const edited = releaseSnapshot([{ ...release, body: "Edited source notes" }], release.tag_name, "2026-10-01");
  assert.match(releaseSummaryIssues(edited, summaries, installer).join(" "), /Source notes changed/);
  assert.match(releaseSummaryIssues(snapshot, { ...summaries, releases: {} }, installer).join(" "), /public summary/);
});
test("committed notes, summaries, and direct downloads agree", async () => {
  const read = async (name) => JSON.parse(await readFile(new URL(`../content/harness/${name}.json`, import.meta.url), "utf8"));
  assert.deepEqual(releaseSummaryIssues(await read("releases"), await read("release-summaries"), await read("installer")), []);
});
test("generated summaries require review and verified on-premises provenance", () => {
  const release = fixture();
  const snapshot = releaseSnapshot([release], release.tag_name, "2026-10-01");
  const installer = installerFromRelease(release, previous, "2026-10-01");
  const summary = { source: release.html_url, sourceDigest: snapshot.releases[0].notesDigest, lastReviewed: "2026-10-01", reviewStatus: "reviewed", highlights: ["Find saved work."], generatedBy: { kind: "on-premises-llm", method: "harness-task", providerInstance: "tritonai_onprem", model: "api-glm-5.3", threadId: "test-thread", generatedAt: "2026-10-01T00:00:00Z" } };
  const check = (entry) => releaseSummaryIssues(snapshot, { schemaVersion: 1, owner: "TritonAI service team", releases: { [release.tag_name]: entry } }, installer).join(" ");
  assert.equal(check(summary), "");
  assert.match(check({ ...summary, reviewStatus: "pending" }), /Review the generated/);
  assert.match(check({ ...summary, generatedBy: { ...summary.generatedBy, providerInstance: "codex" } }), /Invalid on-premises/);
  assert.equal(check({ ...summary, generatedBy: { ...summary.generatedBy, method: "gateway-api", threadId: undefined, responseId: "gateway-test-response" } }), "");
});
