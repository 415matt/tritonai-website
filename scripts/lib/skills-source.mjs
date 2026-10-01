import { readFile } from "node:fs/promises";
import path from "node:path";

// Resolves which public Skills Library repository this site syncs from.
//
// The identity used to be hardcoded in four places — the sync script, the
// release gate, a hard equality assertion in the validator, and the docs — so
// moving the library to a different repository would have failed validation
// with "Unexpected repository" rather than just working. It now lives in
// config/skills-source.json.

export const SKILLS_SOURCE_JSON = path.resolve("config/skills-source.json");

export async function loadSkillsSource() {
  const config = JSON.parse(await readFile(SKILLS_SOURCE_JSON, "utf8"));
  // Env overrides let a fork be tested without editing committed config.
  const owner = process.env.SKILLS_REPOSITORY_OWNER || config.owner;
  const repository = process.env.SKILLS_REPOSITORY_NAME || config.repository;
  if (!owner || !repository) throw new Error("config/skills-source.json must define owner and repository.");
  return {
    owner,
    repository,
    slug: `${owner}/${repository}`,
    liveUrl: process.env.LIVE_SKILLS_URL || config.liveUrl,
    collections: config.collections?.length ? config.collections : ["tritonai", "community"],
  };
}

/** Matches `<collection>/<skill-name>/SKILL.md` and nothing deeper. */
export function skillPathPattern(collections) {
  return new RegExp(`^(?:${collections.join("|")})/[^/]+/SKILL\\.md$`);
}

export function isRetiredSkillDescription(description) {
  return /^retired(?:[.:\s]|$)/i.test(String(description || "").trim());
}
