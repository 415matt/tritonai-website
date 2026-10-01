# TritonAI Skills Library synchronization

The public page at `/skills/index.html` is generated from active entries in the `tritonai/` collection in the public [`UCSD/UCSD-Skills-Library`](https://github.com/UCSD/UCSD-Skills-Library) repository. It does not read from community or restricted skill collections. Compatibility pointers are not published in the catalog.

## Which repository

`config/skills-source.json` is the single source of truth. `scripts/sync-skills.mjs` pulls from it, `scripts/validate.mjs` asserts the synced snapshot came from it, and `scripts/skills-release-gate.mjs` looks for its commit link on the live page.

```json
{ "owner": "UCSD", "repository": "UCSD-Skills-Library", "collections": ["tritonai"] }
```

`SKILLS_REPOSITORY_OWNER` and `SKILLS_REPOSITORY_NAME` override it at runtime, which is how you test against a fork without committing a config change.

## Update flow

1. `npm run sync:skills` resolves the source repository's current default-branch commit.
2. The script validates the required skill frontmatter, inventories supporting files, and writes `content/skills/library.json`.
3. The site build renders the catalog with links pinned to that exact source commit.
4. The GitHub Pages workflow refreshes the catalog for pull-request validation, hourly validation, repository dispatches, and playground builds.
5. The Cascade workflow refreshes the catalog before a `preview` or `main` branch release.
6. The release gate compares the refreshed source commit with the commit shown on the live catalog and stops before upload when production already has that version.

Normal source-repository changes remain in source control until a `preview` or `main` branch release refreshes and publishes the catalog.

If synchronization or validation fails, the workflow stops before deployment and the last successful site remains live. If production already carries the current source commit, the manual release stops before the build and Cascade upload. The committed JSON snapshot also permits deterministic local builds without making GitHub API requests.

## Source contract

The public descriptions, example requests, expected results, and setup notes live in `SKILL_PRESENTATION` in `scripts/build.mjs`. These explain each skill to people using the website. Example requests use ordinary task language; naming a skill is optional because available skills can be selected from the task context. Keep them grounded in the upstream skill's instructions. The synced `description` remains the agent's trigger guidance and appears under Technical details; do not rewrite `content/skills/library.json` to change website copy. Search includes both the public explanations and the upstream descriptions. Newly synced skills use a general orientation request until a reviewed example is added.

- TritonAI-maintained skills must provide `name` and `description` in `SKILL.md` frontmatter.
- Each published skill must live at `tritonai/<skill>/SKILL.md`.
- A description beginning with `Retired` excludes that compatibility pointer from the public catalog.
- Supporting content may live under the skill directory in `references/`, `scripts/`, `assets/`, or other files.

The site validator rejects missing metadata, duplicate names or paths, collections outside `tritonai`, an empty catalog, a source other than the approved public repository, or a snapshot older than 14 days. It warns when a snapshot is more than 48 hours old.
