---
title: TritonGPT Class Planner
slug: class-planner
summary: Students say which courses they need and when they cannot meet, and the assistant drafts a schedule without conflicts for them to review.
buildPath: TritonGPT assistant
status: Production
owner: TritonGPT service and the sponsoring enrollment-management team
lastReviewed: 2026-07-25
audiences: [students, staff]
source: TritonGPT Class Scheduling Assistant demonstration and current service status
measurementPeriod: Production as of July 2026
dataClassification: Public description; student prompts and course information follow approved TritonGPT controls
canonicalUrl: /use-cases/class-planner.html
videoSrc: https://tritongpt-deck.vercel.app/media/TritonGPT%20Class%20Scheduling%20Agent%20-%20LinkedIn%20Horizontal.mp4
videoPoster: /_images/use-cases/tritongpt-class-planner-demo.webp
videoLabel: TritonGPT Class Scheduling Assistant demo
videoDescription: One-minute screen recording with on-screen callouts showing the assistant interpreting course requirements, building a conflict-aware schedule, adapting to a work schedule, and preparing a plan for review before official booking.
relatedSlides: [video-tritongpt-class-scheduling-agent]
humanOversight: Students confirm requirements and constraints, review every proposed course and meeting time, and complete official booking in the student system.
measurableOutcome: Successful draft creation, conflict identification, constraint handling, student corrections, and usefulness before official booking.
featured: false
toolHighlights: ["Course Requirements", "Conflict Checking", "Work-Schedule Constraints"]
resourceLinks:
  - label: Open TritonGPT
    href: https://tritongpt.ucsd.edu/
    description: Sign in and open the Class Scheduling Assistant in TritonGPT.
---

## Problem

Getting a workable class schedule means checking course requirements against meeting patterns, a work shift, and everything else already on the calendar, across a lot of possible combinations.

## Solution

The TritonGPT Class Scheduling Assistant asks which courses you need and when you are unavailable, checks for conflicts, and proposes a combination to review. Add a work shift or anything else and ask it to try again.

This assistant is distinct from the standalone <a href="/use-cases/class-planner-app.html">Class Planner web app</a>. Planning happens in TritonGPT; official course review and booking remain in the student system.

## Current status

In production in TritonGPT. It produces a proposed schedule for students to review. Students still have to verify the course requirements, meeting details, and availability, and do the actual booking themselves.
