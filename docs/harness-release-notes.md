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

## n8n initiates the Harness job

The requested arrangement is a daily n8n trigger at 8 AM Pacific followed by
an update task in the installed TritonAI Harness on the maintainer's Mac.
The workflow template is `integrations/n8n/harness-release-trigger.draft.json`.
It is inactive, and both Harness write nodes are disabled until the incoming
connection and complete publication path have been verified. No Codex app
schedule or local launchd schedule is active.

The read-only part fetches the designated latest stable GitHub release, hashes
its original notes, and compares the saved website snapshot. It excludes drafts,
prereleases, and nonstable tags. Unchanged releases stop without another model
run. Changed notes for the same version also trigger an update. HTTP requests
have timeouts and bounded read retries; failed reads stop the workflow.

The intended worker is pinned to `tritonai_onprem` / `api-glm-5.3` (GLM 5.3).
It re-fetches and validates the stable release and both installer assets,
produces three to five plain-language highlights for staff and faculty, and
records the exact source fingerprint and model provenance. Source notes are
untrusted data. There is no cloud model fallback.

The update task is restricted by its instructions to the three saved content
files in `content/harness/`. It must verify claims against the source, preserve
configuration and permission qualifiers, run all required site checks, and
publish a scoped commit through the existing branch deployment path. A trigger
accepted by Harness does not mean the page was published. Completion requires
the matching successful production workflow and verification of the public
notes page and direct installer links.

Before activation:

1. Restore the disconnected Harness backend and verify its supported API.
2. Approve and create a dedicated incoming connection for n8n with only
   `orchestration:read` and `orchestration:operate`. The existing Harness-to-n8n
   connection is outbound and does not authorize this reverse connection.
3. Configure the template's private endpoint, job-only Harness project, and an
   n8n HTTP Bearer credential. Keep credentials and private endpoint details out
   of the public repository. Verify n8n can reach the Mac; the Mac and Harness
   must be running when the job is initiated.
4. Promote and verify the initial release page and helpers, then change the
   snapshot URL from `playground` to `main`.
5. Review the exact workflow, enable both worker nodes, test a complete update
   through publication and failure reporting, and only then activate its schedule.

The worker prompt is a draft, not proof of an enforced filesystem boundary.
The read-only detection path can be tested now; the write and publication path
cannot be tested until the incoming connection is configured.

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
