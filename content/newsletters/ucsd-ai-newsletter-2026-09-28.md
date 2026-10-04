---
title: "UC San Diego AI Weekly · September 28, 2026"
date: 2026-09-28
source: "ucsd-ai-newsletter-2026-09-28.md"
items: 13
---
## What's New in Your AI Tools

### Copilot for Microsoft 365

-   **[The new Copilot: Home, Code, and Autopilot](https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/)** — Announced September 25: Microsoft is rebuilding Copilot around three capabilities. Home becomes the single starting point where Chat and Cowork come together, and with Office in Copilot, Word, Excel, and PowerPoint now run directly inside the Copilot app — files stay in sync between Copilot and the desktop Office apps. Code lets anyone build their own apps and automations in plain language, powered by the same underlying technology as GitHub Copilot and running in an IT-governed Copilot Managed Runtime inside your tenant. Autopilot (previously previewed as Scout) is a persistent, proactive agent with its own identity, memory, and workspace that keeps working between prompts — monitoring channels, following up, and resuming projects days later. Home and Code start rolling out through the Frontier program in the coming weeks; Autopilot expands to private preview at the end of the month. Note for budget holders: Cowork, Code, and Autopilot move to usage-based billing in Copilot Credits, and Microsoft says metered services stay disabled until admins establish access through spending policies — new FinOps for AI tooling lets you set those policies, cap spend by group, and choose which model families each group can use.

-   **[More Models, One Copilot: Claude Opus 5.5 and GPT-6 Sol roll out](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/more-models-one-copilot/4559035)** — Announced September 22: Anthropic's Claude Opus 5.5 and OpenAI's GPT-6 Sol are rolling out to Copilot across Word, Excel, PowerPoint, Copilot Chat, Copilot Cowork, and Copilot Studio — added the same day both models launched publicly. Whichever model a user picks, Copilot still works from the same Microsoft 365 context and permissions through Work IQ. Availability varies by license, region, and tenant, so expect the model picker to fill in gradually rather than all at once.

### Google Gemini & NotebookLM

-   **[Custom starters, custom steps, third-party integrations, and webhooks in Workspace Studio](https://workspaceupdates.googleblog.com/2026/09/automate-workflows-with-custom-starters-and-steps-third-party-integrations-and-webhooks-in-Workspace-Studio.html)** — Announced September 17, now fully rolled out: Workspace Studio flows gain four new building blocks. Custom starters trigger flows from events in other applications; custom steps run your own Apps Script logic inside a flow; third-party integrations (beta) connect Asana, Confluence, HubSpot, Jira, Mailchimp, QuickBooks, Salesforce, and Slack; and webhooks send HTTP requests to external endpoints. Note for admins: all four features are OFF by default, managed under Apps > Google Workspace > Workspace Studio, with per-feature approval settings and a URL allowlist for webhook access. If your unit has been waiting to build real automations beyond Google's own apps, this is the release that opens the door — just decide your approval workflow before turning it on.

-   **[Notebooks in Gemini now available for schools and organizations](https://workspaceupdates.googleblog.com/2026/09/notebooks-in-gemini-dedicated-workspace-for-focused-organized-work-now-for-schools-and-organizations.html)** — Gradual rollout began September 14: Notebooks — the dedicated workspace that combines the Gemini app and Gemini Notebook — is now available to organizational accounts (outside the EEA). Users can gather up to 10 sources on one topic in a single notebook and work with them as a set: course materials become a study partner, rubrics and templates generate aligned coursework. Admins: access is on by default and governed by the existing Gemini App and Gemini Notebook access settings, so your current Gemini controls apply as-is.

-   **[Gemini Omni 1.1 Flash in Vids, with 1080p and duration control](https://workspaceupdates.googleblog.com/2026/09/gemini-omni-11-flash-now-in-vids-with-improved-extension-quality-1080p-and-duration-control.html)** — Announced September 23: Google Vids now generates AI video scenes in full 1080p HD (or upscales existing AI clips to match), extends scenes with more consistent characters, lighting, and audio, and lets you set exact clip durations to align with voiceovers. No admin control for this one — it rides along with Vids. Relevant if your team produces training or communications videos.

### Zoom AI Companion

-   **[ZM+ brings Anthropic models inside Zoom's trust boundary](https://www.zoom.com/en/products/whats-new/)** — New on Zoom's What's New page: ZM+ (Zoom-Hosted Models Plus) adds Anthropic's Claude models to ZoomMate through Amazon Bedrock's managed service, with all processing handled inside Zoom's trust boundary by a designated provider. The pitch for institutions watching data flows: you get a second frontier model without your meeting and chat content making a detour through a vendor you haven't vetted. If your unit has residency or third-party-processing concerns about AI features in Zoom, ZM+ is the configuration worth reviewing — the details are in Zoom's AI models and processing documentation.

* * *

## Coming Up: Trainings & Workshops

-   **[Bridging Biomedical Breakthroughs Summit: AI in Biomedical Innovation](https://calendar.ucsd.edu/event/bbb-ai)** — Wednesday, November 4, 1–6:30 p.m. on the UC San Diego campus. The School of Biological Sciences' fourth summit brings together faculty innovators, entrepreneurs, investors, and healthcare leaders to explore how AI is accelerating therapeutics, diagnostics, and medical imaging, with faculty innovation pitches and sessions on moving discovery toward real-world impact. Open to faculty, postdocs, students, and industry partners.

Self-paced options in the meantime:

-   Take the **[AI Foundations course](https://go.ucsd.edu/3FvH9Hf)** to learn core AI concepts and UC policies on AI tools.
-   Watch the **[AI Webinar #6 recording](https://tritonai.ucsd.edu/training-resources/webinars.html)** — a practical walkthrough of TritonGPT's first year, including MyDocuments, model switching, and chat sharing.
-   Explore the **[Everyday I AI video series](https://www.youtube.com/playlist?list=PLZoL-14Q0aIkY5gnibNuZZh3X0ikY6VGA)** for short, practical prompting tips that work across TritonGPT and other AI tools.

* * *

## TritonAI News

-   **[SCOUT is now broadly available at UC Merced](https://tritonai.ucsd.edu/about/tritonai-updates.html)** — TritonAI's multi-institution footprint keeps growing: SCOUT, the campus AI assistant built on the TritonAI platform, moved from production beta to broad availability at UC Merced on September 18. TritonAI's multi-tenant deployments now span BearGPT (Berkeley), ANR AI, FredGPT (Fairleigh Dickinson), and SCOUT — the strongest evidence yet that the UC-hosted, model-agnostic approach scales beyond a single campus.

-   **[UC San Diego holds steady as the nation's No. 6 public university — and climbs in AI](https://today.ucsd.edu/story/uc-san-diego-holds-steady-as-nations-no-6-public-university)** — Published September 22: in the new U.S. News Best Colleges rankings, UC San Diego held its No. 6 public-university position and rose in several AI-relevant measures — a four-spot jump into the top 20 of Most Innovative Schools, and a five-spot rise to No. 8 in the undergraduate computer science artificial intelligence specialty ranking, based on peer assessment surveys of deans and senior faculty.

-   **[UC system charts systemwide, human-centered AI course](https://www.universityofcalifornia.edu/press-room/university-california-leverages-systemwide-expertise-advance-purposeful-human-centered)** — The UC systemwide AI Steering Committee delivered its first report to the Board of Regents on September 16, outlining five working groups (health and longevity, learning and work, discovery, protecting humans, and public good), campus showcase events over the coming year, and a push toward coordinated approaches with AI developers and cloud providers so UC is not reliant on a single vendor. UC also noted it was the first university to address AI explicitly in a Digital Risk Appetite statement — the same governance-first posture that shapes how TritonAI reviews and approves campus AI tools.

* * *
