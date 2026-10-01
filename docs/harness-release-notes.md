# Harness release notes

## Location and links

`/developer-apis/harness-release-notes.html` is the Harness product history.
Getting Started links to the notes for the version offered by its direct Mac
and Windows download buttons. The Harness overview links to the full history.

The shared links within the page canvas connect:

- Roadmap: planned direction and delivery status.
- TritonAI Updates: verified program milestones.
- TritonGPT Feature Updates: capabilities verified in the campus deployment.
- Harness Release Notes: published stable desktop releases.

Existing TritonGPT URLs and historical release pages remain in place. These
links do not add or change a global navigation item or the Decorator shell.

## Sources

Harness metadata comes from the public GitHub Releases API for
`dbalders/TritonAI-Harness`. The sync reads all release-list pages and the
repository's designated latest stable release. It excludes drafts, prereleases,
and nightly tags, and validates the exact Mac DMG and Windows EXE asset URLs,
sizes, and source-provided SHA-256 digests before writing files.

`content/harness/releases.json` stores version, publication date, original
notes URL, and a fingerprint of the source note body. It does not mirror raw
GitHub Markdown, embedded images, or downloads. Public summaries live in
`content/harness/release-summaries.json`; each identifies the exact source note
and its fingerprint. The build refuses a missing current summary, an edited
source note with an outdated summary, or a mismatch between notes and installers.
Older stable releases can link directly to the original notes without a summary.

The website is built from saved content. It makes no release API calls in the
visitor's browser, and builds do not require GitHub to be available.

## Update procedure

1. Run `npm run check:harness`. It reads the source without changing files;
   exit status 1 means source changes or review work are pending.
2. Run `npm run sync:harness` to save the stable release metadata and matching
   installer metadata together. API or artifact validation failures preserve the
   saved files. A new release or edited source note can save a candidate while
   returning status 1 to request a summary review; do not push that candidate yet.
3. Read the linked original notes. Add or revise a brief public summary, copy the
   matching `notesDigest` to its `sourceDigest`, and set `lastReviewed` only after
   checking the claims. Avoid internal operational detail and unsupported campus
   availability claims. Check permissions and configuration qualifiers.
4. Run `npm test`, then the required GitHub Pages build and validation. Review the
   new page, Getting Started, Harness overview, and the shared update links at
   desktop and mobile widths. Check keyboard focus and zoom/reflow.
5. Push the complete change to `playground` and verify its rendered pages. Promote
   only the reviewed change to `preview` or `main` after the owner's approval.

`HARNESS_GITHUB_TOKEN` or `GITHUB_TOKEN` is optional for public reads, but can
increase the API rate limit. Do not store a token in content or browser code.

## Recommended future automation

No new schedule or webhook is enabled by this change. A daily GitHub Actions
check could run `check:harness`, stay quiet when unchanged, and provide a review
report or candidate artifact when a stable release or note changes. A release
webhook from the Harness repository could provide a faster trigger if its owner
agrees. Neither should push directly to production. A maintainer reviews the
public summary and rendered playground result before promotion.

TritonGPT retains its existing sources: verified campus deployment notes,
`content/updates/tritonai-updates.json`, and historical detail pages under
`src/site/tritongpt/release-notes/`. Do not automatically copy upstream Onyx
release notes into the campus feature history. Verify what was deployed,
then update that product stream; significant program milestones can also receive
a separate entry in the TritonAI program stream.
