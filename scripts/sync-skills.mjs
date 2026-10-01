import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { isRetiredSkillDescription, loadSkillsSource, skillPathPattern } from "./lib/skills-source.mjs";

const source = await loadSkillsSource();
const OWNER = source.owner;
const REPOSITORY = source.repository;
const TOKEN = process.env.SKILLS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "";
const OUTPUT_FILE = path.resolve("content/skills/library.json");
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPOSITORY}`;

async function githubJson(endpoint) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tritonai-website-skills-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const response = await fetch(`${API_ROOT}${endpoint}`, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${endpoint}`);
  return response.json();
}

async function rawFile(commitSha, filename) {
  const response = await fetch(
    `https://raw.githubusercontent.com/${OWNER}/${REPOSITORY}/${commitSha}/${filename}`,
    { headers: { "User-Agent": "tritonai-website-skills-sync" }, signal: AbortSignal.timeout(30000) },
  );
  if (!response.ok) throw new Error(`GitHub raw content ${response.status} for ${filename}`);
  return response.text();
}

function requireValue(value, field, filename) {
  if (value === undefined || value === null || value === "") throw new Error(`${filename} is missing ${field}`);
  return String(value).trim();
}

const repository = await githubJson("");
const defaultBranch = repository.default_branch;
const commit = await githubJson(`/commits/${encodeURIComponent(defaultBranch)}`);
const tree = await githubJson(`/git/trees/${commit.sha}?recursive=1`);
if (tree.truncated) throw new Error("Skills repository tree was truncated; refusing to publish an incomplete catalog.");

const skillPaths = tree.tree
  .filter((entry) => entry.type === "blob" && skillPathPattern(source.collections).test(entry.path))
  .map((entry) => entry.path)
  .sort();
if (!skillPaths.length) throw new Error("No public SKILL.md entrypoints were found.");

const skillResults = await Promise.all(
  skillPaths.map(async (skillPath) => {
    const skillDirectory = path.posix.dirname(skillPath);
    const collection = skillPath.split("/")[0];
    const parsed = matter(await rawFile(commit.sha, skillPath));
    const name = requireValue(parsed.data.name, "frontmatter name", skillPath);
    const description = requireValue(parsed.data.description, "frontmatter description", skillPath);
    if (isRetiredSkillDescription(description)) return null;
    const maintainer = parsed.data.maintainer ? String(parsed.data.maintainer).trim() : null;
    if (collection === "community" && !maintainer) throw new Error(`${skillPath} is a community skill without a maintainer.`);
    const supportingFiles = tree.tree.filter(
      (entry) => entry.type === "blob" && entry.path.startsWith(`${skillDirectory}/`) && entry.path !== skillPath,
    );
    const countDirectory = (directory) => supportingFiles.filter((entry) => entry.path.startsWith(`${skillDirectory}/${directory}/`)).length;
    return {
      name,
      description,
      collection,
      collectionLabel: collection === "tritonai" ? "TritonAI maintained" : "Community maintained",
      maintainer,
      path: skillPath,
      directory: skillDirectory,
      sourceUrl: `https://github.com/${OWNER}/${REPOSITORY}/blob/${commit.sha}/${skillPath}`,
      directoryUrl: `https://github.com/${OWNER}/${REPOSITORY}/tree/${commit.sha}/${skillDirectory}`,
      resources: {
        references: countDirectory("references"),
        scripts: countDirectory("scripts"),
        assets: countDirectory("assets"),
        other: supportingFiles.filter(
          (entry) => !["references", "scripts", "assets"].some((directory) => entry.path.startsWith(`${skillDirectory}/${directory}/`)),
        ).length,
      },
    };
  }),
);
const skills = skillResults.filter(Boolean);

skills.sort((left, right) => left.collection.localeCompare(right.collection) || left.name.localeCompare(right.name));
const collections = source.collections.map((id) => ({
  id,
  label: id === "tritonai" ? "TritonAI maintained" : "Community maintained",
  count: skills.filter((skill) => skill.collection === id).length,
}));
const payload = {
  schemaVersion: 1,
  syncedAt: new Date().toISOString(),
  source: {
    repository: `${OWNER}/${REPOSITORY}`,
    url: repository.html_url,
    description: repository.description,
    defaultBranch,
    commitSha: commit.sha,
    commitUrl: commit.html_url,
    commitDate: commit.commit.committer.date,
    pushedAt: repository.pushed_at,
    license: repository.license?.spdx_id || null,
  },
  collections,
  skills,
};

await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
process.stdout.write(`Synced ${skills.length} public skills from ${payload.source.repository}@${payload.source.commitSha.slice(0, 12)}.\n`);
