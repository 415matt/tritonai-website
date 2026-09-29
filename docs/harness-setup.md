# Setting up the TritonAI website for editing in the harness

This is a general, shareable guide for getting a workable copy of the TritonAI
website open inside an AI coding harness (a shell-based agent with a browser
preview) so you can edit content, run the guardrails, and look at the result —
without accidentally publishing anything.

The source of truth for *rules* is [AGENTS.md](../AGENTS.md); read it before you
touch anything outside page content. This page is only about *standing it up*.

---

## What you need

- **Node 22 or newer** (`node --version`).
- **npm** (ships with Node).
- **git**.
- **Network access.** The validation and accessibility gates fetch from
  `cdn.ucsd.edu`, so a green local run needs to reach the UC San Diego CDN.
- **A copy of the repo.** Working copies live under the harness project
  directory (e.g. `~/.tritonai-harness/projects/tritonai-website`) and usually
  have dependencies already installed. If yours does, skip straight to
  [Standing it up](#stand-it-up).

Republish this guide and replace paths as needed. The examples use
`/path/to/tritonai-website` and the standard dev-server port `4173`.

## 1. Get a working copy

Clone from the canonical remote (or re-enter the harness project folder if one
already exists):

```bash
git clone https://github.com/bpollak/tritonai-website.git
cd tritonai-website
```

Check which branch you are on:

```bash
git status -sb
```

**Work on `playground`** (or branch off `main`). It exists to be broken, nobody
sees it, and pushing there costs nothing. Do not push to `main` — a push to
`main` publishes to tritonai.ucsd.edu with no approval step. Promoting to
`preview` or `main` is a human decision.

## 2. Install dependencies

```bash
npm install
npx playwright install chromium
```

Node 22 or newer. **`npx playwright install chromium` is its own step** because
npm blocks the install script that downloads the browser. Skip it and only
`npm run test:a11y` fails later.

## 3. Confirm the guardrails run

Run the same suite CI runs:

```bash
npm test
```

This covers the build, validation, the chrome integrity gate, accessibility at
mobile and desktop widths, and the language check. Expect a few minutes and a
clean exit. It needs network access because validation contacts the UC San Diego
CDN.

> A green run here means a green run on the branch. This is the whole
> enforcement system, and it is plain Node and Playwright, so it applies
> whatever editor or assistant you work in.

## 4. Stand it up

Build, then serve the built `dist/` folder:

```bash
npm run build
python3 -m http.server 4173 -d dist
```

Open the site in the harness's collaborative browser preview — a dev server on
port `4173` in the current environment:

```
http://127.0.0.1:4173/
```

You now have a local copy of the real site (same URL structure and Decorator
shell) that you can edit, screenshot, and inspect at desktop and mobile widths.

## 5. The editing loop

**Where content lives:**

- **High-change pages** live in `content/` (`content/pages/`, `content/use-cases/`,
  `content/roadmap/`, `content/facts/`, `content/newsletters/`, `content/home/`,
  `content/skills/`).
- **Legacy snapshot pages** stay at their existing path under `src/site/`.

The loop:

1. Make the change in `content/` (or `src/site/` for legacy pages).
2. Run `npm test`.
3. Also run the GitHub Pages path, which catches base-path breakage:

   ```bash
   SITE_BASE_PATH=/tritonai-website npm run build
   SITE_BASE_PATH=/tritonai-website npm run validate
   ```

4. Rebuild and reload the preview (`npm run build`, served on `4173`) and look
   at the rendered page at desktop **and** mobile widths before considering it
   done.

A red build leaves the branch unpublishable and leaves the previously published
site up. Fix forward on the same branch.

## 6. Get the Decorator rules for your tool

The repo itself ships one guardrail file (`AGENTS.md`) that is read in place.
The *guidance* for working inside the shell (the Decorator rules) is compiled
per tool from [decorator-kit](https://github.com/UCSD/decorator-kit):

| Your tool | Take from `decorator-kit` |
|---|---|
| Claude Code | the `ucsd-decorator` plugin, or copy `skills/ucsd-decorator/` into `.claude/skills/` |
| Cursor | `.cursorrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Codex, Zed, other agents | `AGENTS.md`, read in place |
| No assistant | `rules/*.md`, written for people |

**Do not copy decorator-kit's `AGENTS.md` into this repository.** Both files
carry that name, and a kit stamped on top of the repo one hides the repo contract
the agent has to follow. Read the repo's `AGENTS.md` (and the voice document,
`docs/voice-and-language.md`) directly.

## 7. Never hand-edit these

These files are machine-owned. Rebuild or regenerate them instead:

- `vendor/decorator-5/**` — written by `npm run sync:decorator`.
- `config/chrome-contract.json` — written by `npm run chrome:accept`.
- `config/chrome-selectors.json` — regenerated on the next sync.

Two rules from AGENTS.md that cover how these regressions actually happen:

- Never rebuild chrome markup from a rendered DOM or a browser inspection. The
  mobile drawer is cloned at runtime by
  `src/site/_resources/js/site-navigation.js`, so the live DOM contains
  navigation markup that exists in no file.
- If a task appears to require a chrome change, stop and say so. Do not reshape
  the shell to make a content change fit.

## 8. If the gate fails

Read the failure prefix first. Use the focused runners to reproduce without the
full suite:

```bash
npm run chrome:explain   # what is protected, and where the canvas starts
npm run chrome:check     # reproduce without the full suite
```

- `chrome/structure/*` — restore the markup from the file named in the
  `Derived from:` line, usually under `vendor/decorator-5/templates/`.
- `chrome/styling/*` — move the rule inside `main#main-content`, or delete it
  and let the Decorator's own stylesheet render the region.
- `chrome/consistent/*` — one route drifted from the rest. The message names a
  route that still has it right.
- `chrome/golden/*` alone — the only failure that can be a legitimate change.
  `npm run chrome:accept` records it, and a human decides that. Ask the content
  owner and quote the diff first.

Full triage lives in [AGENTS.md](../AGENTS.md#if-the-gate-fails).

## 9. Publishing (for whoever owns promotion)

The branch is the destination. A push publishes:

| Branch | Publishes to |
|---|---|
| `playground` | GitHub Pages. Safe to break, not campus facing. |
| `preview` | Cascade Stage. The real CMS, before it counts. |
| `main` | Cascade Production, tritonai.ucsd.edu. |

After pushing, confirm the run rather than assuming it passed:

```bash
gh run watch --exit-status
```

## 10. Where everything else is written down

| Topic | File |
|---|---|
| The contract: chrome, ownership, voice, publishing | [AGENTS.md](../AGENTS.md) |
| What the project is, and its architecture | [README.md](../README.md) |
| First-time contributor workflow | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Voice rules with before and after examples | [docs/voice-and-language.md](voice-and-language.md) |
| Content governance and required fields | [docs/content-governance.md](content-governance.md) |
| How updates reach the site | [docs/how-updates-and-publishing-work.md](how-updates-and-publishing-work.md) |
