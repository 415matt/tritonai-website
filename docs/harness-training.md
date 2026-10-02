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

These entry points currently link to
`https://bpollak.github.io/tritonai-website/training/harness/`. They open the
standalone course in the current tab. Do not embed the whole course in an iframe;
its controls, chapters, downloads, and keyboard navigation need their own space.

## Recommended production destination

Use `https://tritonai.ucsd.edu/training/harness/` as the stable shareable address.
The course can retain its own player and layout at that path while the surrounding
website provides discovery and installation instructions. It does not require a
second domain or a new hosting service.

Promotion is a separate release from these discovery links. Bring across only
`src/site/training/harness/` and its required build support from the reviewed
playground version. Do not merge all playground content. Keep relative audio and
practice-kit paths so the same artifact works on GitHub Pages and at the campus
root. Change the three entry points together after the production course works.

The current course needs a main landmark before production promotion: a browser
accessibility spot check reported `landmark-one-main` and `region` findings.
Review keyboard playback, captions, chapter selection, knowledge-check feedback,
practice downloads, reduced motion, and mobile reflow. Preserve the full narration
text as a readable alternative. Check the demonstrated app behavior against the
current installed Harness before advertising a new training revision.

The repository currently treats standalone routes as unlisted. For production,
make an explicit distinction between a standalone presentation and an unlisted
route so this course can appear in the public route manifest and sitemap. Keep
the normal website's Decorator chrome contract unchanged. The training needs its
own main landmark, skip link, page title, canonical URL, and links back to the
Harness overview and setup instructions.

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
