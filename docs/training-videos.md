# TritonAI Discovery Series

The library lives at `/training-resources/videos/`. Each Markdown file in
`content/training-videos/` supplies a lesson page. `discoverySeries: true` selects
lessons for the main sequence; `order` places them within Foundations, Using the
Tools, and Building. Existing supplemental URLs remain available without being
included in that sequence.

## Content and media

- `status: Draft` keeps a lesson out of the generated site.
- `status: Coming soon` publishes the lesson text and knowledge check with a
  clearly labeled empty video area. It does not load sample footage or export a
  placeholder transcript. Leave `durationMinutes: null` until the runtime is known.
- `presenters` is a list of `name`, `title`, and optional `image` values. Missing
  photos show a neutral placeholder. Add approved TritonAI-owned photos under
  `_images/`; media-team hero images can use `videoPoster`.
- `quiz` contains each `question`, an `options` array, the zero-based correct
  `answer`, and an `explanation`. `discussionPoints` contains team prompts.
- Supplied September 29 editorial content is the source for the 15 lessons and
  47 questions. Final recordings still need to be checked against the copy.

The recordings will be hosted on Kaltura. Kaltura entry/player URLs, final hero
artwork, presenter photos, captions, and transcripts are still pending. The
current player supports captioned MP4 sources. Connect and test the approved
Kaltura player when its embed details arrive, including captions, keyboard
controls, transcript access, and playback progress. Do not mark Kaltura playback
or resume as verified before that integration is tested.

For the existing MP4 player, `status: Published` requires `videoSrc`,
`videoCaptionsSrc`, and `durationMinutes`. Playback is user-initiated, with native
controls and no autoplay or muting. A `## Transcript` section supplies a prose
transcript; local WebVTT captions generate the interactive transcript. Published
transcripts are exported to `transcripts.json` for ingestion.

## Knowledge checks

The quiz and discussion topics are available without waiting for a video to end,
including while a recording is pending. Selecting an answer immediately opens a
native dialog with Correct or Incorrect and the explanation. It stays open until
Continue, Escape, or a click outside the dialog. Focus returns to the selected
answer; the same feedback remains inline.

The score counts the first answer to each question. Learners may change answers
and review explanations without inflating that score. Restart clears the current
quiz. Answers survive reloads in this browser via `tritonai.discoveryQuiz.v1` in
localStorage. A content hash invalidates saved answers when quiz content changes.
Storage failures leave the quiz usable and display a notice that it cannot save.
There is no quiz analytics, fetch, account, server-side grading, or result upload.

The existing MP4 playback script saves watch position separately and retains its
existing playback analytics. Pending lessons ignore old sample-footage watch
states. Quiz completion never marks a video watched.

## Validation and release

Run `npm test`, `npm run test:video-quiz`, and the
`SITE_BASE_PATH=/tritonai-website` build and validate commands. Review desktop,
390px mobile, keyboard focus, dialog dismissal, and zoom/reflow. Human
screen-reader review is still required before campus release.

This revision is authorized for GitHub Pages through `playground` only. Follow
AGENTS.md before any promotion to `preview` or `main`.

## Static web-server hosting

The generated `dist/` is a static website and does not require CMS processing,
Node.js on the host, server-side APIs, a database, or a JavaScript bundler at
runtime. Build with an empty `SITE_BASE_PATH` for a site root, or the actual
mount path for subdirectory hosting. Publish the complete HTML, CSS, and JS
output together so content and versioned asset URLs stay in sync. The web server
must serve `.js` as JavaScript and `.css` as CSS over HTTPS. Existing campus CDN
assets remain external as required by the site shell.

Progress is local to the browser and origin. GitHub Pages progress does not
transfer to a campus hostname. Actual server headers and the future Kaltura
embed remain host-level checks for the eventual release; this work does not
publish to that server or change its deployment configuration.
