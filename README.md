# TritonAI static website

This repository is a static, agent-maintainable source for the public website at [tritonai.ucsd.edu](https://tritonai.ucsd.edu/). It preserves the current URL structure, visual presentation, and browser-side integrations. Cascade remains the controlled production publishing path.

## Architecture

- `src/site/` contains the complete public site snapshot at its original paths and supplies the UC San Diego Decorator shell for generated pages.
- `content/pages/` contains high-change pages, including the homepage, strategy, impact, integrations, hosting, and learning pathways.
- `content/use-cases/`, `content/roadmap/`, and `content/facts/` contain structured, public-safe portfolio content. The build validates their ownership, source, review, audience, status, and data-boundary fields.
- `content/newsletters/` contains the weekly-update source as Markdown. The three newest entries are rendered on the homepage; all entries are rendered on `/about/ai-updates.html`.
- `content/updates/tritonai-updates.json` contains two verified histories: program delivery at `/about/tritonai-updates.html` and deployed TritonGPT features at `/tritongpt/release-notes/index.html`. Dated historical release pages remain under `/tritongpt/release-notes/`.
- `content/home/hero.json` controls the homepage hero rotator, including slide copy, images, links, review date, and rotation interval.
- `content/skills/library.json` is the build-safe snapshot of the public [TritonAI Skills Library](https://github.com/UCSD/UCSD-Skills-Library/tree/main/tritonai). GitHub Actions refreshes it before every build and on an hourly schedule.
- UC San Diego Decorator styles and scripts continue to load from `cdn.ucsd.edu`, so supported upstream Decorator changes flow through without being vendored here.
- TritonAI-owned images and small site-specific assets are stored locally so the site can eventually move away from the current domain.
- External services—including emergency messaging, UCSD search, Today@UCSD news, Google Analytics, and the TritonGPT widget—remain linked to their existing hosted implementations.
- `scripts/build.mjs` produces a deployable `dist/` directory and can apply a project-site base path for GitHub Pages without changing canonical source routes.
- Each build generates `sitemap.xml`, `robots.txt`, `_data/routes.json`, and `_data/public-content.json`. The last file is the public synchronization contract for presentation decks and other approved consumers.

## Local development

```bash
npm install
npx playwright install chromium
npm test
python3 -m http.server 4173 -d dist
```

Open `http://127.0.0.1:4173/`.

Node 22 or newer. The accessibility gate drives a real browser, and npm now blocks
the install script that would download one, so `npx playwright install chromium`
is a separate step. Skip it and `npm run test:a11y` is the step that fails.

`npm test` runs the same suite as CI, including the chrome integrity gate. A change
that passes here passes on the branch.

Run `npm run sync:skills` when you want to refresh the Skills Library catalog locally. The committed snapshot keeps ordinary builds deterministic and available if GitHub is temporarily unreachable.

To reproduce the GitHub Pages path locally:

```bash
SITE_BASE_PATH=/tritonai-website npm run build
SITE_BASE_PATH=/tritonai-website npm run validate
```

## Publishing

The branch is the destination. A push publishes, and nothing else starts a release.

| Branch | Publishes to |
|---|---|
| `playground` | GitHub Pages. Safe to break, not campus facing. |
| `preview` | Cascade Stage. The real CMS, before it counts. |
| `main` | Cascade Production, [tritonai.ucsd.edu](https://tritonai.ucsd.edu/). |

A push to `main` reaches the campus site with no further approval step. `main`
carries no branch protection, so the validation gate is what stands between a
change and publication: it blocks a broken build, and it cannot judge whether
content was ready to publish. Work on `playground`, look at the rendered page,
and promote when it reads correctly. Promoting is a human decision.

The procedure, the ownership map, and how to triage a failed gate live in
[AGENTS.md](AGENTS.md#publishing). This section deliberately does not restate
them, because the copy that used to live here went stale and described
production as manual after publishing became branch-driven.

New here? Start with [CONTRIBUTING.md](CONTRIBUTING.md).

## Publishing a weekly update

1. Add a file named `content/newsletters/ucsd-ai-newsletter-YYYY-MM-DD.md`.
2. Include this frontmatter:

   ```yaml
   ---
   title: "Monday, July 13"
   date: 2026-07-13
   source: "ucsd-ai-newsletter-2026-07-13.md"
   items: 3
   ---
   ```

3. Write the newsletter body in Markdown.
4. Run `npm test` and open the homepage plus `/about/ai-updates.html` locally.
5. Push to `playground` and read the rendered page. See [Publishing](#publishing) before promoting it.

Newsletter files are sorted by `date`, so agents do not need to edit the homepage HTML or archive page directly.

## Publishing site content

- Add or revise a high-change page in `content/pages/`.
- Add approved program, service, platform, or TritonGPT changes to `content/updates/tritonai-updates.json`.
- Add a use case in `content/use-cases/` with an approved status: `Production`, `Shipped`, `Pilot`, `In development`, or `Exploring`.
- Update `content/roadmap/milestones.json` when delivery status changes.
- Put reusable public claims in `content/facts/public-facts.json`; do not copy a quantitative claim out of a presentation without its definition, owner, source, measurement period, and review date.
- Update `content/site.json` when a page should appear in global navigation.

The validator warns after 120 days without review and fails after 365 days. Generated pages are also checked for semantic structure, metadata, JSON-LD, route registration, sitemap coverage, image alternatives, and accessible video controls/captions.

See [content governance](docs/content-governance.md), [voice and language](docs/voice-and-language.md), [deck synchronization](docs/deck-synchronization.md), the [Skills Library synchronization guide](docs/skills-library-sync.md), and the [search cutover plan](docs/search-cutover.md).

## Refreshing the public snapshot

`npm run crawl` performs a same-domain crawl starting from the homepage, sitemap, and all discovered internal links. It replaces `src/site/`, so use it only for an intentional full refresh. Afterward, run `npm run extract:newsletters` only if the production-rendered newsletters should replace the repository's Markdown sources.

The original crawl found two already-broken production destinations. They remain warnings in `reports/validation.json`; the build does not invent replacement content.

## Hosting portability

Source links retain the original route structure. GitHub Pages supplies `SITE_BASE_PATH=/tritonai-website` during its build. A future root-domain host should build with an empty `SITE_BASE_PATH`, which restores routes such as `/about/roadmap.html` without repository-name prefixes.
