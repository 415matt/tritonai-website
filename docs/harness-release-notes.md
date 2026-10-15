# Harness release notes

## Location and links

`/developer-apis/harness-release-notes.html` is the Harness product history.
Getting Started offers the guided TritonAI Installer for first-time setup and
links to the Harness product history. The notes page offers standalone Harness
app downloads for existing installations. The Harness overview links to the full history.

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

First-time setup downloads come from the latest stable release of
`dbalders/TritonAI-Installer`. Their independent version, source, direct asset URLs,
sizes, and SHA-256 digests are saved under `guided` in `content/harness/installer.json`.
The sync validates both products before writing. Installer and Harness version
numbers can differ; the website does not assume they are the same.

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

## TritonGPT updates

TritonGPT retains its existing sources: verified campus deployment notes,
`content/updates/tritonai-updates.json`, and historical detail pages under
`src/site/tritongpt/release-notes/`. Do not automatically copy upstream Onyx
release notes into the campus feature history. Verify what was deployed,
then update that product stream; significant program milestones can also receive
a separate entry in the TritonAI program stream.

## Daily n8n maintenance

The workflow `TritonAI Harness stable release website update` checks every day
at 8 AM in `America/Los_Angeles`, including weekends and daylight-saving changes.
Its reviewed template is `integrations/n8n/harness-release-trigger.draft.json`.
The exported template remains inactive and contains no credentials. The live
workflow is activated only after its dedicated credential and publication test.

n8n starts `.github/workflows/harness-release-maintenance.yml` on `main` and
waits for the exact returned run ID. The worker runs in GitHub Actions, so a
sleeping or disconnected maintainer Mac does not interrupt maintenance. No
second local or Codex schedule runs this job.

The worker validates the separately versioned stable Harness and guided Installer
releases. Drafts, prereleases and nightly tags are excluded. New releases or
edited source notes receive a UC-hosted GLM 5.3 summary and guidance for setup,
FAQs, privacy, skills, citizen development and model selection.

Release highlights are written for nontechnical staff and faculty: what they
will notice, what they can do, and any action they need to take. Engineering
jargon is rejected, and the source reviewer also checks audience suitability.
An audience policy change refreshes the current summary even without a new
release. Each statement carries an exact source quotation; another GLM 5.3
request checks whether the source supports it. Rejected or malformed output stops without changing saved
website content. No cloud model fallback is used. `source-verified` records an
automated source check, not a human review.

The build fills current-version text, source-note links, tagged-document links,
highlights and page guidance from this same snapshot. The worker changes only
`content/harness/releases.json`, `installer.json` and `release-summaries.json`.
It cannot rewrite arbitrary page markup or the Decorator shell. Stable content
outside those generated sections continues to need editorial maintenance.

Before pushing, the worker runs `npm test` and the required GitHub Pages
build and validation. A dedicated repository credential pushes the scoped
commit to `main`, which starts the normal Cascade publication workflow.
The worker waits for the matching commit's successful Cascade run and verifies
eight public pages and the exact guided download links. Product pages must show
the current version, release highlights and any generated guidance. The Build
hub does not display a version; verification requires its links to the Harness
overview, release history and setup, and checks any version fields it does carry.
Failures report the route and mismatched field. n8n reports success
only when this worker finishes successfully; HTTP dispatch acceptance is not
completion. Unchanged source snapshots stop without another model call or push.

Repository secrets:

- `TRITONAI_RELEASE_API_KEY`: the existing UC-hosted model credential.
- `HARNESS_RELEASE_PUSH_TOKEN`: a dedicated token for this website repository,
  with Contents write and Actions write permissions. GitHub's default job token
  cannot start the normal publication workflows when it pushes a commit.

The n8n GitHub credential uses that dedicated repository token. Keep it out of
exported workflow JSON and logs; record and monitor its expiration. Source reads,
model failures, site-check failures, push conflicts and publication failures
fail the worker visibly. A new commit on main during validation causes the push
to fail safely; the next run starts from current main.

Manual validation is available with `npm run maintain:harness`; the model key
must be provided through `TRITONAI_RELEASE_API_KEY`. The `--refresh-summary`
flag refreshes the current summary even when source fingerprints are unchanged.

Summary corrections retain the previous candidate and all verification issues
from the run, so a correction does not lose earlier fixes. Current setup sources
include the tagged UC San Diego account guide for optional campus sign-in.
New plugin cards and recorded training material still require editorial review;
updating release metadata does not rewrite those sections.

## Manual candidate generation

`scripts/harness-release-job.py` remains an optional manual candidate generator
using the supported local Harness API. Its tasks use approval-required mode,
validate runtime model identity, reject malformed summaries, and save private
candidates outside the checkout. It does not push or publish.

The pairing action accepts a one-time connection link through standard input
and saves its exchanged credential in a private `0600` file. Only pair after
explicit approval for persistent access. A failed or expired credential stops
the job. No local schedule is installed for this manual helper.

Candidate summaries carry `reviewStatus: pending` and no `lastReviewed` date.
The build rejects these until their statements have been checked against the
original source, marked reviewed, and dated. Keep the model provenance when
copying reviewed candidates into the saved website content.

The initial two public summaries were generated by GLM 5.3 through the UC San
Diego TritonAI Gateway and checked against their original release notes. Their
saved provenance identifies the gateway response, model, source fingerprint,
and generation time. This verifies the initial synthesis, not the future n8n
connection or automatic publication path.
