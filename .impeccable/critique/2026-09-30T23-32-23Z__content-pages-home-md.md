---
target: "TritonAI site structure and wording: baseline review and revised result"
total_score: 19
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 2
target_identity: "file:/Users/work/Projects/tritonai-website/content/pages/home.md"
target_fingerprint: "sha256:274d90b995ed57c273eb1dcf15b0b5032f716311c164dda8d59c0ff2b7381d0f"
target_path: /Users/work/Projects/tritonai-website/content/pages/home.md
timestamp: 2026-09-30T23-32-23Z
slug: content-pages-home-md
---
Method: dual-agent (A: /root/design_review · B: /root/evidence_review)

# TritonAI site structure and wording review

Reviewed September 30, 2026. Scope: homepage, Tools, Learn and learning pathways, Build, TritonGPT, integrations, interface guide, webinars, and the latest newsletter. Independent assessments covered source content and representative public desktop/mobile pages. Revised pages were inspected locally.

This records baseline findings and the resulting changes. The heuristic scores describe the original site; no post-change score was assigned. The edits were prepared on local `playground`; this snapshot records the review before commit or publication.

## Design specificity and overall impression

The UC San Diego identity, campus photographs, named campus services, and production/pilot labels make this recognizably a university service site. Repeated abstract illustrations, introductory sections, and similar card grids flatten the hierarchy. The biggest opportunity is to put a visitor's next step before the program's architecture.

The original homepage repeated Build invitations before campus examples. Tools offered six service cards before helping visitors choose. Learn contained a Staff pathway that returned visitors to the page they had just left. These are navigation and presentation problems that a clean automated scan does not resolve.

## Baseline heuristic assessment

| # | Heuristic | Score | Baseline evidence |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Useful Production/Pilot and access labels; inconsistent approval badges. |
| 2 | Match with the real world | 2 | Technical terms and vague headings obscure concrete tasks. |
| 3 | User control and freedom | 3 | Working navigation and on-page anchors; long journeys to some actions. |
| 4 | Consistency and standards | 2 | Tool badges mix access, data rules, and capabilities. |
| 5 | Error prevention | 1 | Tools claims P4 approval that conflicts with service guidance. |
| 6 | Recognition over recall | 2 | Some action labels lead to broad or unexpected destinations. |
| 7 | Flexibility and efficiency | 2 | Build details and repeated homepage sections delay useful actions. |
| 8 | Aesthetic and minimalist design | 2 | Repeated section introductions and similar grids dilute emphasis. |
| 9 | Error recovery | n/a | No recoverable transaction or application error state in this static-page review. |
| 10 | Help and documentation | 2 | Many useful resources; Staff pathway loops and model-choice link misses instructions. |
| | Total | **19/36** | Needs clearer navigation, hierarchy, and decision guidance. |

## What works

- The campus imagery and Decorator presentation establish the site's identity.
- Named services, actual campus examples, and Production/Pilot labels give visitors concrete evidence.
- Build distinguishes interactive agent work, repeatable automation, and API integration. Its on-page anchors help experienced users.

## Priority findings and changes

1. **P1: Contradictory data approval labels on Tools.** “P3 / P4 Approved” for TritonGPT and “P3 / P4 Governed” for Harness contradicted the site's own service guidance. Visitors could infer that restricted data is permitted. Replaced these with qualified P3 labels and explicit P4 exclusions, preserving the existing approval boundaries. Added a Protection Levels link and replaced unexplained SSO badges with sign-in labels. Clarify action completed.

2. **P1: Homepage favors repeated Build invitations over balanced starting points.** The hero carousel and consecutive Build sections delayed campus examples and obscured the three main audiences. Following the user's direction, the homepage has three equally presented Use/Learn/Build paths, fewer repeated invitations, and campus examples before the shared-platform explanation. The October 1 follow-up restores the original two-slide carousel and the introduction's Open TritonGPT button and See the strategy link. The balanced paths remain below the introduction. Shape/distill actions completed. The title band and Decorator shell remain intact.

3. **P2: Tools begins with a catalog before a decision aid.** Six equal service cards ask visitors to compare different kinds of badges before they know which service fits. Moved the task chooser above the catalog. “Work from source material” now links to the specific Google source-tool guidance, replacing its generic training destination. Clarify/layout actions completed. A future pass should separate access requirements, data rules, and capabilities into consistent fields across every service.

4. **P2: Learn contains a circular Staff journey and vague section headings.** Learn sent visitors to Pathways, where the Staff action sent them back to Learn. Staff now links directly to AI Foundations. Retained role pathways as the organizing approach and replaced headings such as “Different work, different practice” with “Learning paths by role.” Clarify action completed. The optional question about prioritizing Foundations versus roles remains unanswered; the existing role structure was retained.

5. **P2: Some TritonGPT actions and prose promise the wrong thing.** “Choose a model” led to architecture information, while the guide promised “quick, accurate answers.” The action now leads to the interface guide's Getting started section. The guide asks visitors to check cited sources. Integrations and webinar descriptions now state what users can do in plain language. Clarify action completed.

## Humanizer edits

Edits preserve factual claims, source URLs, product names, course eligibility, metadata, and official event titles.

| Original wording | Revised wording |
|---|---|
| Different work, different practice | Learning paths by role |
| Watch someone do it | Watch recorded webinars |
| Choose an assistant by the work | Find an assistant for your task |
| Get quick, accurate answers about campus policies… | Ask about campus policies… Check the cited sources before using the answer. |
| Discover ready-made prompts designed to inspire ideas… streamline your workflow. | Browse ready-made prompts for ideas and step-by-step help with your work. |
| Discover how far we've come and where we're headed! | This webinar reviews TritonGPT's launch and demonstrates… |

The newest newsletter also loses promotional asides, unnecessary boosters, and a manufactured contrast about branded slides. The homepage newsletter renderer uses “Latest edition” rather than implying an older edition is from the current week. Older newsletter archives retain inherited language warnings; they were not broadly rewritten.

## Cognitive load, emotional journey, and audience risks

The original six-service catalog exceeded four choices without first narrowing the decision. Repeated homepage Build sections created competing entry points. The revision presents three homepage paths and four task choices before the service catalog.

Campus identity and named examples support confidence. Ambiguous approval badges create false reassurance at a consequential decision, while long scrolling and circular links create frustration. The edits address the false reassurance and Staff loop; the Build journey remains long.

- **First-time visitor:** Harness, routing, and data classifications require explanation. Revised task labels and the Protection Levels link reduce the interpretation needed, but consistent service comparison fields would help further.
- **Staff learner:** The previous Learn → Pathways → Learn loop prevented a concrete next step. The Staff course link now completes that journey.
- **Mobile builder:** The Build catalog contains 31 model entries before lower service guidance. The independently inspected page was about 21,187 pixels tall at 390 pixels wide. Its labeled, focusable table scrolls horizontally, but the overall journey is still lengthy.

## Remaining improvements

- **Build page:** Compact or disclose the model catalog, or place the full directory on its own preserved public route with a link from Build. Keep the three build choices and access steps prominent. The current validator enforces the existing section order; redesign that expectation deliberately rather than weakening the gate. Suggested action: Impeccable distill/layout.
- **Mobile chat widget:** The fixed chat button can overlap links, including the Learn primary action. This was reproduced on the public site and remains visible in local checks. The widget belongs to protected chrome. AGENTS.md says, “If a task appears to require a chrome change, stop and say so.” An owner-reviewed widget/chrome change is required; no shell CSS or exception was added. Suggested action after approval: Impeccable adapt/harden.
- **Training accessibility guidance:** The Accessible formats aside still reads partly as instructions for content producers on a learner-facing page. Move the requirements to author guidance and link learners to available accessible formats once that content exists.
- **Eligibility:** “Campus sign-in” is clearer than “All Campus SSO,” but each service should explain its actual eligibility. No eligibility expansion was inferred.
- **Visual repetition:** Keep campus photographs and meaningful service imagery; reduce abstract illustrations when they add no information in a later presentation pass.

## Detector evidence

The independent baseline detector scanned 23 Markdown pages and returned no findings or advisories. Human review found semantic problems that this scan does not detect.

The finish scan of changed markup reported four warnings. Two hierarchy warnings assumed uniform text sizes in legacy HTML whose typography comes from the external Decorator CSS; rendered pages showed differentiated headings. One marketing-word warning identified “streamline” in the prompt-library description and was corrected. The other refers to an official webinar title and was preserved. No reliable browser overlay was available because the browser's evaluate API is read-only; screenshots, accessibility trees, geometry, and the CLI scan supplied the evidence.

## Validation

- Final `npm test` passed, including all required validation and the site-wide accessibility gate.
- Automated accessibility scanned 60 nonredirect routes at 390 and 1440 pixels, with no failures, horizontal overflow, or shared-navigation failures. The existing redirect route was skipped by design.
- `SITE_BASE_PATH=/tritonai-website npm run build` and `SITE_BASE_PATH=/tritonai-website npm run validate` both passed.
- Visually inspected affected pages on desktop and mobile, plus the homepage at the tablet breakpoint. Inspected both the homepage and newsletter archive after the newsletter edit.
- Additional 320-pixel reflow checks found no document overflow on affected routes. Keyboard/focus checks included shared navigation and the webinar disclosure; accessible names and reading order were inspected in browser snapshots.
- Actual browser zoom did not change the viewport in the available browser, and no VoiceOver session was run. These manual checks remain unverified; narrow-width reflow and automated accessibility do not replace them.
- `git diff --check` passed. UCSD chrome, integrations, public routes, and human-owned strategic/policy pages were preserved.

The full suite initially caught the existing skills snapshot as stale. It was refreshed from its source using the normal sync command; the source commit did not change.

## Direction and follow-up

The user chose equal prominence for using, learning, and building. That direction is implemented. The next structural choices are whether to separate the Build model directory from the task guide and whether the content owner authorizes a protected widget adjustment. A final polish pass should follow either change.

### October 1 homepage follow-up

Restored the original two-slide carousel and the introduction's Open TritonGPT button and See the strategy link at the user's request. The equal Use/Learn/Build cards remain below the introduction. Desktop and mobile inspection confirmed the restored layout, keyboard pause and slide controls, visible intro-link focus, and 320-pixel reflow without document overflow.

After the main sync and these restorations, `npm test` passed across 61 nonredirect routes and 122 viewport checks. The first run reported a mobile search focus failure on the model list page. Browser inspection showed the search scope receiving focus correctly, and the full suite passed on rerun without a navigation or test change. Actual browser zoom and VoiceOver remain unverified.
