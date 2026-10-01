---
title: BioBib
slug: biobib
summary: Faculty pull approved activity data into a BioBib draft, then check every section before it goes anywhere.
buildPath: TritonAI solutions team build
status: Pilot
owner: TritonAI solutions team and the sponsoring academic service owner
lastReviewed: 2026-07-25
audiences: [faculty, staff]
source: TritonAI strategy presentation
measurementPeriod: 2026 pilot
dataClassification: Public description; faculty records follow approved service controls
canonicalUrl: /use-cases/biobib.html
videoSrc: https://tritongpt-deck.vercel.app/media/product-previews/biobib-formatter-preview.mp4
videoPoster: https://tritongpt-deck.vercel.app/media/product-previews/biobib-formatter-poster.png
videoLabel: BioBib Formatter demo
videoDescription: Silent screen recording showing a Word CV upload, section-level review, TritonAI routing, and a downloadable BioBib draft.
stats:
  - { value: "20", label: "Review parts", sub: "Section-level routing" }
  - { value: ".docx", label: "Output", sub: "BioBib draft" }
  - { value: "UCSD", label: "Workflow", sub: "Academic personnel" }
toolHighlights: ["Word CV Input", "Section Review", "TritonAI Routing"]

relatedSlides: [the-flywheel-in-action-biobib-formatter]
humanOversight: The faculty member or authorized reviewer validates every section before submission.
measurableOutcome: Draft completion time, missing items, corrections, and reviewer satisfaction.
featured: false
---

## Problem

Putting a BioBib together means sorting, categorizing, and formatting the same kinds of record over and over, then checking all of it.

## Solution

The pilot splits a Word CV into 20 parts and runs each one through TritonAI for formatting and extraction. You get back a .docx BioBib draft laid out in the expected UCSD biography and bibliography sections. It will point out items that look missing or ambiguous, but it does not claim the draft is complete or correct.

## Current status

Pilot. The faculty member or service owner is still the source of truth for the final record. It all runs in the browser, so faculty and academic personnel teams go from upload to download without installing anything.
