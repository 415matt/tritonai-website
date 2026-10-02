# TritonAI Harness training

The Harness course is a standalone learning experience. Keep its chapter player,
narration, captions, knowledge checks, and practice kit together. The short
capability video on the Harness overview introduces the product; the course
teaches people how to use it.

## Entry points

- `/developer-apis/harness.html#harness-training`: a dedicated training section
  directly below the capability video, with an introductory shortcut above it.
- `/developer-apis/start.html#verify`: the next action after installation and a
  successful first prompt.
- `/training-resources/pathways.html`: a course listing alongside other training.
- `/`: a featured course near the top of the homepage.
- `/training-resources/index.html`: a featured course before the role pathways.
- `/developer-apis/index.html`: links in the Harness client card and setup actions.
- `/tools/index.html`: a training link on the Harness service card.
- `/developer-apis/citizen-developer.html`: an Essentials starting point before connected-tool exercises.
- `/skills/index.html`: a link beside the introduction to using skills.
- `/developer-apis/harness-release-notes.html`: a training link after the release history.

The production course is at `https://tritonai.ucsd.edu/training/harness/`.
These entry points link directly to `/training/harness/`. The course has its own
chapter player and layout, with navigation back to the Harness overview and setup.
It is listed in the public route manifest and sitemap. Do not embed the whole
course in an iframe; its controls, chapters, downloads, and keyboard navigation
need their own space.

## Standalone course contract

The content owner authorized the standalone layout. Only this course is added to
the existing standalone-route exclusions in the chrome checker and validator;
all normal website routes retain the Decorator contract. Standalone routes and
unlisted routes are distinct: the training is standalone and publicly listed.

The course has a main landmark, skip link, canonical URL, narrated captions, and a
readable transcript with visual descriptions. Recorded app screens are inert and
hidden from assistive technology; the transcript and caption player provide the
text alternative. Reduced-motion settings disable decorative motion. The quiz's
next-chapter button stays hidden until the correct answer is selected.

`npm run test:harness-training` exercises desktop and mobile playback, caption
text, chapter selection, knowledge-check feedback, transcript access, skip-link
focus, audio and practice downloads, overflow, and axe checks. It runs within
`npm test`; normal routes continue to receive the full site-wide accessibility
gate. The course owns its typography, so Decorator font assertions apply to the
normal website routes rather than the standalone course.

The deployed course files originate from playground commit
`ae59d16` (v21: opening montage, hosting update, Essentials start and stopping point). Only
`src/site/training/harness/` was promoted; unrelated playground content was not
merged. Audio and practice-kit links remain relative, supporting both host modes.

## Release and upkeep

Use playground for course revisions and review. Run the site's required tests in
both base-path modes, then promote the reviewed course to preview and production
through the existing branch-driven Cascade release path. Verify the actual
production player, an audio segment, a caption, a knowledge check, and the
practice ZIP after publication.

Publish a revision date and the demonstrated Harness version in the course.
Review the course when installation, permissions, plugin connections, or skills
change. Re-record affected chapters and their narration together; preserve the
stable course URL. Do not schedule automatic narration or publish unreviewed
training changes.

Avoid using the playground deployment as the permanent address for campus-wide
announcements. Once the production course is verified, use its stable URL in
onboarding messages, workshops, and any future in-app help link. Those additional
communications and app changes are separate work from the website entry points.
