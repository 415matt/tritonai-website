# UC San Diego AI Weekly sync

The TritonAI homepage and AI Updates archive use Markdown files in `content/newsletters/`. The public source is Brett Pollak's [UC San Diego AI Weekly Update](https://brettcpollak.com/ucsd-ai-news).

## Publishing flow

1. A newsletter edition is published on `brettcpollak.com/ucsd-ai-news`.
2. `npm run sync:ai-news` fetches the archive page, accepts only files named `ucsd-ai-newsletter-YYYY-MM-DD.md`, validates the required sections and a positive item count, removes executable markup, normalizes links, and writes new or changed editions to `content/newsletters/`.
3. The normal site build replaces the newsletter panels on `/` and `/about/ai-updates.html`.
4. The scheduled GitHub workflow runs on Monday after the source's normal publishing window. When content changes, it checks every HTTP(S) destination in the changed newsletter files and fails before opening a pull request if a destination cannot be reached.
5. The workflow then runs the standard site, language, and accessibility checks and opens or refreshes a focused pull request.
6. Merge the pull request after review. A push to `main` runs the production Cascade build, upload, and publish workflow.

## Manual refresh

Run:

```bash
npm run sync:ai-news
npm run check:newsletter-links -- content/newsletters/ucsd-ai-newsletter-YYYY-MM-DD.md
npm test
SITE_BASE_PATH=/tritonai-website npm run build
SITE_BASE_PATH=/tritonai-website npm run validate
```

To check whether the source has unpublished local changes without writing files:

```bash
npm run check:ai-news
```

Use the workflow's **Run workflow** action when an edition publishes after the Monday schedule.

## Safety boundaries

- The sync never deletes newsletter files.
- Only the expected newsletter filename pattern can be written.
- Required newsletter sections must be present.
- Editions reporting zero items are rejected and require review before publication.
- Scripts, forms, frames, event handlers, and unsafe URL schemes are removed.
- Known retired TritonAI release-note targets are mapped to the current TritonAI Updates page.
- HTTP(S) links in changed editions must return a successful response after redirects. The checker tries `HEAD` first and falls back to `GET` for hosts that do not support `HEAD`.
- The workflow creates a pull request. It does not merge or deploy source changes without review.
