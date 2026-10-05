---
title: "Example: Editing the website with the TritonAI Harness"
slug: example-editing-with-harness
summary: Watch the Harness take one website change from request to live verification, with a person approving every gate.
series: Building
status: Published
owner: TritonAI training program (example entry)
lastReviewed: 2026-08-02
audiences: [staff, developers]
source: Recorded TritonAI Harness demonstration, August 2026
dataClassification: Public description; recording shows only public website content
canonicalUrl: /training-resources/videos/example-editing-with-harness.html
relatedSlides: []
order: 90
# Sample knowledge check and discussion prompts for the preview; the
# production team replaces these when the recording is produced.
quiz:
  - question: "What is the main focus of this video?"
    options:
      - "Purchasing procedures for campus software"
      - "Understanding how the Harness takes one website change from request to live verification"
      - "Configuring your campus email account"
    answer: 1
    explanation: "This video centers on how the Harness takes one website change from request to live verification."
  - question: "Who stays responsible for consequential decisions when AI supports campus work?"
    options:
      - "The AI tool that produced the output"
      - "A person who reviews the output"
      - "Nobody; reviewed output is automatic"
    answer: 1
    explanation: "Campus AI work keeps a person accountable for reviewing output before it matters."
discussionPoints:
  - "Where does the Harness workflow already show up in your team's work, and where could it help next?"
  - "What would need to be true before your team relied on AI for this, and who would review the results?"
  - "Pick one workflow from this discussion to try within two weeks, and name who owns the follow-up."
durationMinutes: 2
videoSrc: /presentations/_resources/tritonai-harness-editing-publishing-demo-v2.mp4
videoPoster: /presentations/_resources/tritonai-harness-editing-demo-poster.jpg
videoCaptionsSrc: /presentations/_resources/tritonai-harness-editing-publishing-demo.vtt
videoLabel: Recorded demonstration of the TritonAI Harness editing and publishing a website change
videoDescription: Screen recording with captions showing the Harness editing a page, running checks, preparing a pull request, and verifying the published result.
---

- How a plain-language request becomes a reviewed website edit
- Which skills run automatically: website maintenance, voice match, accessibility, browser preview
- Where the human decision points are before anything publishes

## Transcript

The TritonAI Harness shows files on the left, the update request in the center, and the private preview on the right. The contributor requests one change: revise Where to start, keep both links, run checks, refresh the preview, and stop before GitHub or publishing.

The website maintenance skill finds the file that controls the page, reads its update rules, and checks the existing links before editing. With approved voice context, voice-match follows the intended voice and humanizer removes generic AI phrasing. The branding skill keeps layout work aligned with UC San Diego. The accessibility skill checks headings and structure, keyboard use, phone layouts, and common automated accessibility problems while other required checks run. The browser skill refreshes the private preview, compares computer and phone layouts, confirms the updated text, and checks that both existing links still work.

The local edit is ready for human review. Nothing has been committed, pushed, submitted as a pull request, merged, or published; the contributor decides whether to continue. After approval, the auto-review skill checks for missed issues. The GitHub skill prepares the pull request and monitors checks without merging. The pull request shows the change, passed checks, affected page, and recovery steps. An authorized person decides whether to merge it.

The merge starts the website publishing workflow. It builds and checks the site, sends approved files to Cascade, and asks Cascade to publish. Finally, the Harness or contributor opens the production URL and compares it with the approved preview. Only after the public page matches is the update reported as live verified.
