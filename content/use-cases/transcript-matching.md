---
title: Transcript Matching
slug: transcript-matching
summary: Matches incoming transcripts to student records, scores its own confidence, and sends the uncertain ones to staff.
buildPath: TritonAI solutions team build
status: Production
owner: TritonAI solutions team and the sponsoring student-services owner
lastReviewed: 2026-07-25
audiences: [staff, leaders]
source: TritonAI updates and strategy presentation
measurementPeriod: Production service; accuracy result from the published validation sample of 3,700+ transcript records
dataClassification: Public description; student records require approved protected-data controls
canonicalUrl: /use-cases/transcript-matching.html
videoSrc: https://tritongpt-deck.vercel.app/media/tms-onbase-demo.mp4
videoPoster: /_images/use-cases/transcript-matching-public.webp
videoLabel: Transcript Matching staff review demo
videoDescription: Silent screen recording showing confidence-based matching and the staff review interface used to resolve uncertain records.
relatedSlides: [transcript-matching-validation]
humanOversight: Staff review uncertain matches and monitor quality before any broader use.
measurableOutcome: Match precision and recall, review volume, processing time, and exception rate.
featured: true
stats:
  - { value: "60,000", label: "Annual workflow volume", sub: "Approximate transcripts per year" }
  - { value: "225/hr", label: "Processing throughput", sub: "Reported workflow rate" }
  - { value: "99.86%", label: "Published accuracy", sub: "3,700+ records; five reported errors" }
toolHighlights: ["OCR Extraction", "Confidence Scoring", "Human Review Queue"]

---

## Problem

Transcripts arrive in large volumes with inconsistent layouts, identifiers, and scan quality. Matching them by hand is slow, and getting one wrong has real consequences for a student.

## Solution

The workflow extracts candidate identifiers, compares the evidence, and assigns confidence so staff can focus on exceptions. It runs in production with continuous monitoring and human review of uncertain matches.

## Current status

In production for UC San Diego enrollment management. The workflow ingests incoming transcripts, extracts candidate identifiers via OCR, compares each transcript with the appropriate student record, assigns confidence scores, and routes uncertain matches to staff for review. The published validation result reported 99.86% accuracy across more than 3,700 records, with five errors; staff review remains part of the service.

<p><a class="btn btn-default" href="/about/tritonai-updates.html#2026-07-19-production-workflows">Read the published validation note</a></p>
