---
title: "Example: Review gates every AI change passes through"
slug: example-ai-review-gates
summary: Follow the checks between an AI-drafted change and the public website, from automated tests to the human merge decision.
series: Foundations
status: Published
owner: TritonAI training program (example entry)
lastReviewed: 2026-08-02
audiences: [faculty, staff]
source: Recorded TritonAI Harness demonstration, August 2026
dataClassification: Public description; recording shows only public website content
canonicalUrl: /training-resources/videos/example-ai-review-gates.html
relatedSlides: []
order: 91
# Sample knowledge check and discussion prompts for the preview; the
# production team replaces these when the recording is produced.
quiz:
  - question: "What is the main focus of this video?"
    options:
      - "Purchasing procedures for campus software"
      - "Understanding the checks between an AI-drafted change and the public website"
      - "Configuring your campus email account"
    answer: 1
    explanation: "This video centers on the checks between an AI-drafted change and the public website."
  - question: "Who stays responsible for consequential decisions when AI supports campus work?"
    options:
      - "The AI tool that produced the output"
      - "A person who reviews the output"
      - "Nobody; reviewed output is automatic"
    answer: 1
    explanation: "Campus AI work keeps a person accountable for reviewing output before it matters."
discussionPoints:
  - "Where does review gates already show up in your team's work, and where could it help next?"
  - "What would need to be true before your team relied on AI for this, and who would review the results?"
  - "Pick one workflow from this discussion to try within two weeks, and name who owns the follow-up."
durationMinutes: 2
videoSrc: /presentations/_resources/tritonai-harness-editing-publishing-demo-v2.mp4
videoPoster: /presentations/_resources/tritonai-harness-editing-demo-poster.jpg
videoCaptionsSrc: /presentations/_resources/tritonai-harness-editing-publishing-demo.vtt
videoLabel: Recorded demonstration of review gates on an AI-assisted website change
videoDescription: Screen recording with captions following one change through automated checks, pull-request review, and live verification.
---

- Why AI-drafted work stops for human review before anything publishes
- What the automated accessibility, language, and build checks cover
- What "live verified" means and who makes the final call

## Transcript

This example entry reuses the Harness demonstration footage while the first training recordings are in production. The recording follows a single website change through every gate: automated checks run while the work is local, a person reviews the complete diff and rendered preview, a pull request records the decision, and an authorized person merges. Publishing runs as a separate workflow, and the final step is comparing the public page against the approved preview before reporting the change as live.
