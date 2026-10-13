---
title: "UC San Diego AI Weekly · October 12, 2026"
date: 2026-10-12
source: "ucsd-ai-newsletter-2026-10-12.md"
items: 15
---
## What's New in Your AI Tools

### Google Gemini & Workspace

-   **[Markdown files now open natively in Docs and Drive](https://workspaceupdates.googleblog.com/2026/10/preview-edit-and-collaborate-on-Markdown-files-natively-across-Drive-and-Docs.html)** — Announced October 5, gradual rollout (up to 15 days): you can now view, edit, and collaborate on Markdown (.md) files directly in Google Docs without converting them, and Drive shows rendered previews with clickable links and formatted tables. Google explicitly built this for AI-era workflows: Markdown is the format LLMs use to preserve structure like tables and headers, and the update lets people and AI agents work on the same file with Docs' real-time editing and commenting intact. No admin or end-user settings; available to all Workspace customers. If your team's AI workflows involve round-tripping generated content through Google Docs, this removes a long-standing friction point.

-   **[Google announces the Gemini agent at Gemini at Work 2026](https://cloud.google.com/blog/products/ai-machine-learning/welcome-to-gemini-at-work-2026)** — Announced October 8: Google introduced a single, universal Gemini agent for work that answers questions, handles knowledge work, creates images and media, and writes and runs code from one prompt box. The same agent now works inline inside Gmail, Drive, Docs, Slides, Sheets, Chat, and Calendar, carrying its memory, skills, and controls across surfaces. Google paired the launch with enterprise governance controls (identity and policy management, permission enforcement, secure sandboxing) and cost controls including multi-model orchestration, Smart Routing, and real-time spend caps. Nothing lands in a UCSD domain until Google's October feature releases reach Workspace and admins see the corresponding Admin console settings, but the direction is clear: Gemini is consolidating into one persistent agent rather than a collection of per-app features. Watch for the Workspace-specific rollout announcements that follow.

-   **[Workspace Studio gains nested logic, Gmail reply filtering, and a Drive search step](https://workspaceupdates.googleblog.com/2026/10/new-logic-and-search-steps-in-workspace-Studio-help-expand-automation-capabilities.html)** — Announced October 9, gradual rollout starting October 13: the October Workspace Studio release adds nested conditionals for multi-layered branching, a Gmail trigger option that ignores follow-up replies so flows fire only on primary incoming email, Meet steps that output Calendar metadata (including full invitee lists) with templates for post-meeting follow-up drafts, and a dedicated Drive step that searches for documents by parameters instead of hardcoding file references. Features are ON by default for anyone with Workspace Studio access and inherit your existing domain and OU-level policies. This builds on the custom starters, steps, and webhooks that landed in September, so automations that needed workarounds a month ago are now first-class.

### Copilot for Microsoft 365

-   **[Chat is now embedded in Copilot Search](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)** — In the October 6 release notes (covering September 22 through October 6): Microsoft 365 Copilot Search now embeds conversational chat directly in search results, so you can ask follow-up questions, synthesize findings, and generate content from what you found without switching to a separate chat tool. The same release adds a Regenerate action in Copilot Chat with "Try Again" and "Switch Model" options, so getting a different answer no longer means re-entering the prompt.

-   **[Copilot in PowerPoint gains custom skills and file references](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)** — Also in the October 6 notes: you can now create custom skills in Copilot in PowerPoint, defining your own commands for repetitive presentation tasks, and Copilot on Mac can reference files stored in SharePoint and OneDrive by name in a prompt without manual uploads. Both run inside Microsoft 365's security and compliance boundary.

-   **Admin note: Copilot billing split and spending policies** — Per Microsoft's October 1 partner announcement, everyday AI stays on the flat per-user Copilot license, while frontier models and advanced capabilities (Cowork, Code, Autopilot) move to usage-based billing in Copilot Credits, and nothing usage-based activates in a tenant until an admin creates a spending policy in the Microsoft 365 admin center under Copilot > Cost management. Usage-based billing starts rolling out in Q4. Units evaluating Copilot should factor this in now: the license line item no longer tells the whole cost story.

### Zoom AI Companion

-   **[ZoomMate expands from a side panel into the Workplace Home tab](https://www.zoom.com/en/products/whats-new/)** — New on Zoom's What's New roundup: ZoomMate now lives as a fully integrated home-tab experience in the Zoom Workplace desktop app, with agentic search, workflows, and AI agents running where the rest of your work is. My Notes gained Q&A (ask what you missed, with or without summaries enabled) and post-meeting follow-ups that send notes to a Google Doc or Gmail, update your CRM, or apply a note template automatically. ZM+ (Zoom-Hosted Models Plus) now routes to OpenAI and Gemma models through Amazon Bedrock alongside Anthropic, with data staying inside Zoom's trust boundary. ZoomMate is also now available to K-12 institutions and organizations that require a Business Associate Agreement. Some capabilities require a ZoomMate license and consume AI credits.

* * *

## Coming Up: Trainings & Workshops

-   **Six more Discovery Series videos land October 15** — The next batch of TritonAI Discovery Series trainings goes live Thursday, covering the approved tools hands-on: Zoom AI, TritonGPT, Google Gemini, and Gemini Notebook overviews, plus the two Citizen Developer sessions on AI strategy at the leadership level and building with harnesses and automation. Each video pairs a tool with campus use cases you can repeat at your own desk. Watch at [tritonai.ucsd.edu/training-resources/videos](https://tritonai.ucsd.edu/training-resources/videos/index.html) — your progress from the first nine videos carries over.

-   **[Bridging Biomedical Breakthroughs Summit: AI in Biomedical Innovation](https://calendar.ucsd.edu/event/bbb-ai)** — Wednesday, November 4, 1–6:30 p.m. on campus. The School of Biological Sciences' fourth summit brings together faculty innovators, entrepreneurs, investors, and healthcare leaders on how AI is accelerating therapeutics, diagnostics, and medical imaging. Open to faculty, postdocs, students, and industry partners.

Self-paced options in the meantime:

-   Take the **[AI Foundations course](https://go.ucsd.edu/3FvH9Hf)** to learn core AI concepts and UC policies on AI tools.
-   Watch the **[AI Webinar #6 recording](https://tritonai.ucsd.edu/training-resources/webinars.html)** — a practical walkthrough of TritonGPT's first year, including MyDocuments, model switching, and chat sharing.
-   Explore the **[Everyday I AI video series](https://www.youtube.com/playlist?list=PLZoL-14Q0aIkY5gnibNuZZh3X0ikY6VGA)** for short, practical prompting tips that work across TritonGPT and other AI tools.

* * *

## TritonAI News

-   **UC San Diego's departmental AI deliberation is drawing external attention** — An October 5 piece in the AHigherVision higher-ed daily brief flagged UCSD's approach of asking every academic department to formally deliberate on AI before the university writes its next set of principles and policies, framing it as a leading model for discipline-aware governance: AI questions differ across engineering, medicine, and the arts, and governance should consume those differences as input rather than issue one blanket rule. Third-party validation of the deliberation-first approach is worth citing in your own departmental conversations.

-   **[Instructure's first higher-ed EdTech Top 40: no dedicated AI tool cracks the top 100](https://www.prnewswire.com/news-releases/instructure-launches-first-edtech-top-40-for-higher-education-finds-dedicated-ai-tools-outside-the-top-100-302892355.html)** — Released September 29: Instructure's first higher-ed edition of its EdTech Top 40 research, based on Canvas LTI launch data from 19.5 million users between September 2025 and April 2026, found that despite the intense attention on AI in education, no dedicated AI tool ranks among the top 100 in actual instructional usage. Google Gemini, the most-adopted dedicated AI tool, reached about 88,000 users across 211 institutions — still outside the top 100. The report also notes only 11% of higher-ed instructors have received comprehensive AI training. The takeaway for campus: generic AI tools aren't embedding themselves in real workflows; task-specific tools that meet people where they already work are what gain traction, which is exactly the design principle behind TritonAI's vertical assistants and embedded experiences.

-   **[Ai2's budget-based GPU scheduling offers a model for shared campus clusters](https://allenai.org/blog/impactful-scheduling)** — Published October 9: the Allen Institute for AI replaced priority-based GPU scheduling with time budgets, hierarchical fair-share allocation, and time-slicing contracts, treating compute as a budget set by leadership rather than a queueing problem. With demand running 2–3x supply, debug-workload p90 queue wait fell from 2 hours to 30 seconds, and researchers described the change as feeling like 30% more compute. Directly relevant reading for anyone thinking about how campus GPU capacity across colleges and research programs gets governed as demand keeps climbing.

* * *
