# Contributing to the TritonAI website

This page gets you working. The rules live in [AGENTS.md](AGENTS.md), which is the
contract for this repository. Read it before you touch anything outside page
content.

## First time from GitHub

Six steps. Steps 1 through 3 give you the guardrails. Step 4 gives you the
guidance for staying inside them.

### 1. Clone and install

```bash
git clone https://github.com/bpollak/tritonai-website.git
cd tritonai-website
npm install
npx playwright install chromium
```

Node 22 or newer.

`npx playwright install chromium` is its own step because npm blocks the install
script that downloads the browser. Skip it and `npm run test:a11y` is the step
that fails.

### 2. Confirm the guardrails run

```bash
npm test
```

This runs the same suite CI runs: build, validation, the chrome integrity gate,
accessibility at mobile and desktop widths, and the language check. Expect a few
minutes and a clean exit. It needs network access, because validation checks the
UC San Diego CDN.

A green run here means a green run on the branch. This is the whole enforcement
system, and it is plain Node and Playwright, so it applies whatever editor or
assistant you work in.

### 3. Look at the site

```bash
npm run build
python3 -m http.server 4173 -d dist
```

Open `http://127.0.0.1:4173/`.

### 4. Get the Decorator rules for your tool

Cloning gives you every guardrail that rejects a bad change. It does not give you
the guidance for working inside them, because that lives in
[decorator-kit](https://github.com/UCSD/decorator-kit). One canonical rule set is
compiled there into a file per tool:

| Your tool | Take from `decorator-kit` |
|---|---|
| Claude Code | the `ucsd-decorator` plugin, or copy `skills/ucsd-decorator/` into `.claude/skills/` |
| Cursor | `.cursorrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Codex, Zed, other agents | `AGENTS.md`, read in place. See the warning below. |
| No assistant | `rules/*.md`, written for people |

**Do not copy decorator-kit's `AGENTS.md` into this repository.** Both files carry
that name and they are different documents. This repository's `AGENTS.md` is the
project contract and is the more important of the two. Keep `decorator-kit`
checked out beside this project and read its copy there.

Without any of this, a chrome violation arrives as a failed build with a rule name
and no explanation. That is when people reach for the config that generated the
rule, which is the one repair that makes the problem permanent.

### 5. Read the contract

[AGENTS.md](AGENTS.md) in this repository. It covers the writable canvas, the
protected chrome, edit ownership, voice, and publishing. Read it before touching
anything outside page content.

### 6. Know where a push goes

See [Know which branch you are on](#know-which-branch-you-are-on) below. Do this
before your first push, not after.

## Already have a clone

```bash
git checkout main
git pull
npm install
npx playwright install chromium
npm test
```

Run `npm install` even when nothing looks different, because dependencies move
with the lockfile. `npx playwright install chromium` is once per machine, and it
is the step people skip, so run it if you have never run it here.

See what you are sitting on before you start:

```bash
git status -sb          # uncommitted work, and the branch you track
git log --oneline -3
```

Then pick up at [step 4](#4-get-the-decorator-rules-for-your-tool) for the
Decorator rules, which live outside this repository and do not arrive with a pull.

## A failure you did not cause

The mobile drawer search check reads ids that the Decorator's `base.min.js`
renames at 768px, and that script loads from `cdn.ucsd.edu` while the page runs.
When the CDN is slow, the check samples the page before the rename lands and
reports a route you never touched:

```
- /some/route.html at 390px: mobile navigation search check failed
```

Run `npm run test:a11y` again. A real regression names the same route every time.
This one moves between routes and clears on a rerun. Treat a repeat on the same
route as real.

## Know which branch you are on

The branch is the destination. A push to `main` publishes to
[tritonai.ucsd.edu](https://tritonai.ucsd.edu/) with no approval step, and `main`
carries no branch protection. The full table is in
[README.md](README.md#publishing).

Work on `playground`. It exists to be broken, and pushing there costs nothing.
Moving work to `preview` or `main` is a human decision, because those rungs are
what people look at and what the campus sees.

## The loop

1. Work on `playground`, or branch from `main`.
2. Make the change. High-change pages live in `content/`. Legacy snapshot pages
   stay at their existing path under `src/site/`.
3. Run `npm test`.
4. Run the GitHub Pages path as well, which catches base-path breakage:

   ```bash
   SITE_BASE_PATH=/tritonai-website npm run build
   SITE_BASE_PATH=/tritonai-website npm run validate
   ```

5. Push, then confirm the run rather than assuming it passed:

   ```bash
   gh run watch --exit-status
   ```

6. Look at the rendered page at desktop and mobile widths before promoting.

A red build leaves the branch unpublishable and leaves the previously published
site up. Fix forward on the same branch.

## When the gate fails

Every failure names its rule. Read the prefix first, because two of the three
cannot be cleared by regenerating anything.

```bash
npm run chrome:explain   # what is protected, and where the canvas starts
npm run chrome:check     # reproduce without the full suite
```

- `chrome/structure/*` — restore the markup from the file named in the
  `Derived from:` line, usually under `vendor/decorator-5/templates/`.
- `chrome/styling/*` — move the rule inside `main#main-content`, or delete it and
  let the Decorator's own stylesheet render the region.
- `chrome/consistent/*` — one route drifted from the rest. The message names a
  route that still has it right.
- `chrome/golden/*` alone — the only failure that can be a legitimate change.
  `npm run chrome:accept` records it, and a human decides that, so ask the content
  owner and quote the diff first.

Full triage: [AGENTS.md](AGENTS.md#if-the-gate-fails).

## Never hand-edit these

- `vendor/decorator-5/**`, written by `npm run sync:decorator`
- `config/chrome-contract.json`, written by `npm run chrome:accept`
- `config/chrome-selectors.json`, regenerated on the next sync

Two rules from AGENTS.md that cover how these regressions actually happen:

- Never rebuild chrome markup from a rendered DOM or a browser inspection. The
  mobile drawer is cloned at runtime by `src/site/_resources/js/site-navigation.js`,
  so the live DOM contains navigation markup that exists in no file.
- If a task appears to require a chrome change, stop and say so. Do not reshape
  the shell to make a content change fit.

`npm run crawl` deletes and recreates `src/site/`. It is for an intentional
whole-site refresh only.

## Adding a page outside the Decorator

A self-contained tool or deck that does not use the Decorator shell registers as a
standalone route in four places, and the validator cross-checks them:

| Location | Effect |
|---|---|
| `UNLISTED_ROUTES` in `scripts/build.mjs` | keeps it out of the sitemap and route manifest |
| `standaloneRoutes` in `scripts/validate.mjs` | exempts it from the chrome gate, navigation, and stylesheet checks |
| `STANDALONE_ROUTES` in `scripts/chrome-contract.mjs` | the same exemption for the standalone gate runner |
| the route's entry in `content/seo.json` | carries the `robots` directive |

Files placed under `src/site/` are copied into `dist/` as they are, so no build
rule is needed for the assets.

The `content/seo.json` entry is load-bearing. The build rewrites the `robots` meta
tag on every page from that file, so a page carrying its own `noindex` is
published as indexable when the entry is missing. Nothing catches that today.

The exemption also drops the campus emergency-alert script from the page, which
suits an internal tool and deserves a second look for anything linked publicly.

## Where the rest is written down

| Topic | File |
|---|---|
| The contract: chrome, ownership, voice, publishing | [AGENTS.md](AGENTS.md) |
| What the project is, and its architecture | [README.md](README.md) |
| Voice rules with before and after examples | [docs/voice-and-language.md](docs/voice-and-language.md) |
| Content governance and required fields | [docs/content-governance.md](docs/content-governance.md) |
| How updates reach the site | [docs/how-updates-and-publishing-work.md](docs/how-updates-and-publishing-work.md) |
