---
title: TritonAI Harness
path: /developer-apis/harness.html
description: A local-first agent control surface connecting campus builders to approved models, local files, and UC San Diego systems under human supervision.
eyebrow: Build with TritonAI
lastReviewed: 2026-10-02
audiences: [staff, faculty, researchers, developers]
owner: TritonAI
source: "TritonAI Harness stable v0.3.4 release notes and tagged user documentation; packaged plugin composition; UC San Diego AI service guidance"
canonicalUrl: /developer-apis/harness.html
relatedSlides: [Citizen Developer Ecosystem, Reusable Skills and MCP, platform-architecture]
landingHub: true
bannerImage: /_images/hero-abstract/build.webp
bannerPosition: center
bannerMode: abstract
---

<section class="hub-section hub-section-intro" aria-labelledby="harness-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-7 hub-split-copy">
<p class="home-kicker">Agent control surface</p>
<h2 id="harness-intro-heading">Work directly with your code, files, and systems</h2>
<p class="hub-lede">TritonAI Harness is UC San Diego's primary supported agent workspace. It runs on your computer and connects to campus models, local files, and approved campus tools under your supervision. It is in pilot on Mac (Apple Silicon) and Windows, and anyone with a Gateway key can request it.</p>
<p>Use it to work through a task in your project folder: read source material, prepare a draft, and check the result. You supervise the work and review consequential actions.</p>
<p>Prefer another client? Claude Code, Codex, Hermes, OpenCode, and other compatible clients connect to the same Gateway with the same key. <a href="/developer-apis/index.html#tritonai-harness">Compare the client options</a>.</p>
<p>You’ll need an approved TritonAI Gateway key to connect the Harness to campus models.</p>
<p class="hub-section-action">
<a class="btn btn-primary" href="/developer-apis/start.html">Get started</a>
<a class="btn btn-default" href="/skills/index.html">Browse Skills Library</a>
<a class="btn btn-default" href="/developer-apis/harness-release-notes.html">Release notes</a>
</p>
<p>Already have a key? <a href="/developer-apis/start.html#harness">Download and set up</a>. Ready to learn? <a href="#harness-training">Explore the training</a>.</p>
</div>
<div class="col-md-5 hub-split-media">
<figure class="build-architecture" aria-describedby="harness-architecture-caption">
<p class="build-architecture-label">Governed agent execution</p>
<ol class="build-architecture-flow">
<li><span>01</span><div><strong>Local workspace</strong><small>Files and task history are stored locally; selected context is sent to the model.</small></div></li>
<li><span>02</span><div><strong>Campus gateway</strong><small>Zero-retention UC-hosted models on UC San Diego infrastructure.</small></div></li>
<li><span>03</span><div><strong>Task access mode</strong><small>Choose when the agent pauses for your approval.</small></div></li>
</ol>
<figcaption id="harness-architecture-caption">TritonAI Harness isolates credentials and runs within your local workspace under your supervision.</figcaption>
</figure>
</div>
</div>
</section>

<section class="hub-section hub-section-cool" id="harness-stable-release" aria-labelledby="harness-stable-release-heading">
<div class="hub-heading">
<p class="home-kicker">Stable release</p>
<h2 id="harness-stable-release-heading">Harness 0.3.4 stable release</h2>
<p><strong>Current stable version: 0.3.4.</strong> Checked October 2, 2026 against the published release. Available for macOS Apple Silicon and Windows x64. The newer 0.3.5 nightly builds are prereleases on a separate update track.</p>
</div>
<ul>
<li><strong>Computer use:</strong> Opt in to let the agent inspect and operate desktop apps, with visible setup and activity. In this release it works with the Codex provider on a local desktop backend.</li>
<li><strong>Task goals and attachments:</strong> Give Codex tasks persistent goals, attach general files, and drop images into chat.</li>
<li><strong>Search and review:</strong> Search conversation content and project files, organize tasks in the redesigned sidebar, and inspect pull requests and changed lines in the app.</li>
<li><strong>Campus plugins:</strong> Kuali Build and n8n join the included plugin catalog with separately authorized read and write abilities.</li>
<li><strong>Skills and sub-agents:</strong> Share a local skill with UCSD for review and follow delegated work in the Agents panel.</li>
</ul>
<p>To update an existing installation, open <strong>Settings &gt; About &gt; Check for Updates</strong>. For first-time setup, use the <a href="/developer-apis/start.html#harness">stable TritonAI Installer</a>.</p>
<p>Computer use starts off. Enable it in <strong>Settings &gt; General</strong>; on macOS, grant Accessibility and Screen Recording permissions and restart the Harness when prompted.</p>
<p><a href="https://github.com/dbalders/TritonAI-Harness/releases/tag/v0.3.4">Read the Harness 0.3.4 release notes</a> · <a href="https://github.com/dbalders/TritonAI-Harness/blob/v0.3.4/docs/user/permission-modes.md">Review approval modes</a></p>
</section>

<section class="hub-section" id="harness-in-action" aria-labelledby="harness-in-action-heading">
<div class="hub-heading">
<h2 id="harness-in-action-heading">See the Harness in action</h2>
<p>This narrated video runs a little over two minutes and shows results from the Harness app. It was recorded with fictional workshop files.</p>
</div>
<video class="img-responsive center-block" width="1920" height="1080" data-playback="manual" controls controlslist="nodownload" muted playsinline preload="none" poster="/_images/harness/tritonai-harness-capabilities-2026-10-01-v2.jpg" aria-label="TritonAI Harness in action" aria-describedby="harness-in-action-description" aria-details="harness-in-action-transcript">
<source src="/_files/harness/tritonai-harness-capabilities-2026-10-02-v4.mp4" type="video/mp4">
<track kind="captions" src="/_files/harness/tritonai-harness-capabilities-2026-10-02-v4.vtt" srclang="en" label="English" default>
Your browser does not support embedded video.
</video>
<p class="small">Tap Play to start. If the embedded player does not work, <a href="/_files/harness/tritonai-harness-capabilities-2026-10-02-v4.mp4">open the video directly</a>.</p>
<p id="harness-in-action-description" class="small">The video starts muted with captions. Turn on sound to hear the narration. It shows a survey summary, an Excel dashboard, a briefing deck on the UC San Diego template, the five campus plugins, an n8n workflow explained step by step, a GitHub code review, and a sign-up app built on the campus design system and wired to an n8n workflow.</p>
<section class="sr-only" id="harness-in-action-transcript" aria-label="Video transcript">
<h3>Introduction (0:00)</h3>
<p>TritonAI Harness is UC San Diego's AI workspace on your desktop. You hand it real work, and it delivers finished results, using your files and campus systems.</p>
<h3>Summarize a survey (0:11)</h3>
<p>Here it is, live, with a made-up project: Jordan's fall workshop pilot. Qualtrics already reports the survey, but Jordan wants the team's own questions answered, so I hand it the raw results. Fourteen seconds later: averages for every question, the top comments, the missing data flagged, and a takeaway for the planning team, saved as a file.</p>
<h3>Build an Excel dashboard (0:35)</h3>
<p>Department leaders want one page, so: a presentation-ready Excel dashboard. It builds the workbook, and a few quick follow-ups polish the layout. Headline numbers up top, three charts in campus colors, and a one-line insight under each.</p>
<h3>Create a briefing deck (0:52)</h3>
<p>Jordan has ten minutes with leaders next week, so the meeting notes and the survey become a briefing deck on the official UC San Diego template. Nine slides with live charts, an owners table, a timeline to the next session, and speaker notes, all built from the source files.</p>
<h3>Work with campus systems (1:10)</h3>
<p>It plugs into the campus systems you already use: Microsoft 365, Google Workspace, Kuali Build, GitHub, and n8n. Here it reads an n8n workflow, explains each step in plain language, and confirms the last run succeeded. With GitHub, it reviews a code change: what changed, which files, and whether the build passed.</p>
<h3>Build a web app (1:39)</h3>
<p>And it builds software. A Microsoft Form would cover a basic sign-up, but Jordan's team wants the campus look and every sign-up in its own n8n workflow. Here's that app, on the official campus design system. Coming soon: self-service hosting, so the apps you build in the Harness can go live for campus.</p>
<h3>Campus tools first (2:01)</h3>
<p>When a campus tool does the job, use it. When you need it your way, build it with the Harness. That's TritonAI Harness: real work, finished on your desktop, with campus tools built in.</p>
</section>
</section>

<section class="hub-section hub-section-cool" id="harness-training" aria-labelledby="harness-training-heading">
<div class="hub-heading"><p class="home-kicker">Self-paced training</p><h2 id="harness-training-heading">Learn to use TritonAI Harness</h2><p>Start with Essentials, then try the feedback-summary exercise with fictional files. Explore the other narrated chapters and knowledge checks when you need them. The training opens as a separate course with its own player and downloadable practice kit.</p></div>
<p class="hub-section-action"><a class="btn btn-primary" href="/training/harness/">Start TritonAI Harness training</a></p>
</section>

<section class="hub-section harness-compare" id="what-a-harness-adds" aria-labelledby="harness-compare-heading">
<div class="hub-heading"><p class="home-kicker">What a harness adds</p><h2 id="harness-compare-heading">The harness is everything around the model</h2><p>The same approved models sit inside TritonGPT and TritonAI Harness. A chat app answers a prompt. The Harness wraps the model with context, tools, permissions, and memory, and runs a loop so it can act on real work.</p><p><strong>Diagram key:</strong> The circled <strong>M</strong> represents the AI model.</p></div>
<div class="row harness-compare-grid">
<div class="col-md-6"><article class="harness-compare-card harness-compare-card-chat" aria-labelledby="harness-compare-chat-title">
<div class="harness-compare-head"><div><p class="harness-compare-title" id="harness-compare-chat-title">Chat app</p><p class="harness-compare-sub">A model answers.</p></div><div class="harness-compare-pills"><span class="harness-pill harness-pill-square">Prompt</span><span class="harness-pill-arrow" aria-hidden="true">→</span><span class="harness-pill">Answer</span></div></div>
<div class="harness-compare-flow"><span class="harness-node harness-node-tint">user asks</span><span class="harness-model" aria-hidden="true">M</span><span class="harness-node">answer returns</span></div>
<svg class="harness-compare-track" viewBox="0 0 400 18" height="18" preserveAspectRatio="none" aria-hidden="true" focusable="false"><line x1="6" y1="9" x2="388" y2="9" stroke="#b9d3dc" stroke-width="1.4" stroke-dasharray="4 5"/><polygon points="388,9 380,4 380,14" fill="#b9d3dc"/><circle class="harness-anim-chat-dot" cx="6" cy="9" r="4.5" fill="#00629b"/></svg>
<div class="harness-compare-result"><span class="harness-compare-label">You get</span><span class="harness-chip harness-chip-quote">“Here’s a summary…”</span><span class="harness-compare-end">End of turn</span></div>
<p class="harness-compare-note">TritonGPT or a browser chat tool is a conversation surface: prompt in, answer back.</p>
</article></div>
<div class="col-md-6"><article class="harness-compare-card harness-compare-card-harness" aria-labelledby="harness-compare-harness-title">
<div class="harness-compare-head"><div><p class="harness-compare-title" id="harness-compare-harness-title">Harness</p><p class="harness-compare-sub">A model works.</p></div><div class="harness-compare-pills"><span class="harness-pill">Context</span><span class="harness-pill">Tools</span><span class="harness-pill">Loop</span></div></div>
<div class="harness-compare-loop"><ul class="harness-stack harness-stack-in" aria-label="What the model is given"><li>files</li><li>rules</li><li>memory</li></ul><div class="harness-model-ring"><svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle cx="60" cy="60" r="55" fill="none" stroke="#e7d9c4" stroke-width="1.2" stroke-dasharray="3 4"/><circle class="harness-anim-arc" cx="60" cy="60" r="55" fill="none" stroke="#c69214" stroke-width="1.6" stroke-dasharray="9 80" stroke-linecap="round"/><circle class="harness-anim-orbit" cx="0" cy="0" r="4" fill="#c69214"/></svg><span class="harness-model harness-model-gold" aria-hidden="true">M<small>↺</small></span></div><ul class="harness-stack harness-stack-out" aria-label="What the model can do"><li>read</li><li>edit</li><li>verify</li></ul></div>
<div class="harness-compare-result"><span class="harness-compare-label">You get</span><span class="harness-chip"><span class="glyphicon glyphicon-file" aria-hidden="true"></span>contract.docx</span><span class="harness-chip"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>routed for sign-off</span><span class="harness-chip"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span>logged</span></div>
<p class="harness-compare-note">TritonAI Harness takes the same model and gives it a workspace, bounded tools, and a person who chooses the approval mode and reviews the result.</p>
</article></div>
</div>
</section>

<section class="hub-section harness-explainer" id="how-the-harness-works" aria-labelledby="harness-components-heading">
<div class="harness-components-heading"><div class="hub-heading"><h2 id="harness-components-heading">How the Harness works</h2><p>These capabilities connect your request to the work in your workspace.</p><p><strong>Diagram key:</strong> The circled <strong>M</strong> represents the AI model.</p></div></div>
<div class="harness-component-grid">
<article class="harness-component harness-component-loop" aria-labelledby="harness-loop-heading"><div class="harness-component-top"><div><p class="harness-component-label"><span aria-hidden="true">01</span> Loop</p><h3 id="harness-loop-heading">How does it keep going?</h3></div><figure class="harness-component-visual"><svg viewBox="0 0 300 112" aria-hidden="true" focusable="false"><rect class="" x="5" y="25" width="78" height="28" rx="6"/><text x="44.0" y="44">act</text><rect class="" x="111" y="25" width="78" height="28" rx="6"/><text x="150.0" y="44">observe</text><rect class="" x="217" y="25" width="78" height="28" rx="6"/><text x="256.0" y="44">adjust</text><path class="hc-track" d="M83 39h28m78 0h28M256 58Q150 100 44 58"/><path d="m104 35 7 4-7 4m103-8 7 4-7 4M44 58l4 8m-4-8 9 1"/></svg><figcaption>Repeat within task limits</figcaption></figure></div><p>Takes a step, checks the result, and adjusts within the task’s permissions and stopping conditions.</p></article>
<article class="harness-component harness-component-context" aria-labelledby="harness-context-heading"><div class="harness-component-top"><div><p class="harness-component-label"><span aria-hidden="true">02</span> Context</p><h3 id="harness-context-heading">What does it work from?</h3></div><figure class="harness-component-visual"><svg viewBox="0 0 300 112" aria-hidden="true" focusable="false"><g class="hc-layer hc-layer-one"><rect class="" x="12" y="10" width="198" height="28" rx="6"/><text x="111.0" y="29">instructions</text></g><g class="hc-layer hc-layer-two"><rect class="" x="23" y="36" width="198" height="28" rx="6"/><text x="122.0" y="55">files &amp; memory</text></g><g class="hc-layer hc-layer-three"><rect class="" x="34" y="62" width="198" height="28" rx="6"/><text x="133.0" y="81">prior results</text></g><path class="hc-track" d="M236 50h24"/><path d="m253 45 7 5-7 5"/><circle class="hc-model" cx="278" cy="50" r="17"/><text class="hc-model-letter" x="278" y="56">M</text></svg><figcaption>What’s in view</figcaption></figure></div><p>Brings relevant files, instructions, and earlier results into the task.</p></article>
<article class="harness-component harness-component-action" aria-labelledby="harness-action-heading"><div class="harness-component-top"><div><p class="harness-component-label"><span aria-hidden="true">03</span> Action</p><h3 id="harness-action-heading">What can it access?</h3></div><figure class="harness-component-visual"><svg viewBox="0 0 300 112" aria-hidden="true" focusable="false"><path class="hc-track" d="M125 47 73 25m102 22 52-22M125 65 73 87m102-22 52 22"/><rect class="" x="4" y="10" width="70" height="28" rx="6"/><text x="39.0" y="29">files</text><rect class="" x="226" y="10" width="70" height="28" rx="6"/><text x="261.0" y="29">web</text><rect class="" x="4" y="74" width="70" height="28" rx="6"/><text x="39.0" y="93">API</text><rect class="" x="226" y="74" width="70" height="28" rx="6"/><text x="261.0" y="93">tools</text><circle class="hc-model" cx="150" cy="56" r="27"/><text class="hc-model-letter" x="150" y="64">M</text></svg><figcaption>What it can reach</figcaption></figure></div><p>Uses enabled tools to work with files and connected services within granted permissions.</p><p class="harness-component-links"><a href="#integrations-heading">Explore plugins</a><a href="#skills-heading">Browse skills</a></p></article>
<article class="harness-component harness-component-scale" aria-labelledby="harness-scale-heading"><div class="harness-component-top"><div><p class="harness-component-label"><span aria-hidden="true">04</span> Scale</p><h3 id="harness-scale-heading">How are larger tasks organized?</h3></div><figure class="harness-component-visual"><svg viewBox="0 0 300 112" aria-hidden="true" focusable="false"><path class="hc-track" d="M150 36 49 76m101-40v40m0-40 101 40"/><rect class="" x="111" y="6" width="78" height="28" rx="6"/><text x="150.0" y="25">main</text><rect class="" x="10" y="76" width="78" height="28" rx="6"/><text x="49.0" y="95">plan</text><rect class="" x="111" y="76" width="78" height="28" rx="6"/><text x="150.0" y="95">build</text><rect class="" x="212" y="76" width="78" height="28" rx="6"/><text x="251.0" y="95">verify</text></svg><figcaption>Focused sub-agents</figcaption></figure></div><p>Can divide planning, building, and checking among focused sub-agents.</p><p class="harness-component-links"><a href="#sub-agents">See how sub-agents work</a></p></article>
</div>
<aside class="harness-worked-example" aria-labelledby="harness-example-heading">
<p class="home-kicker">Example task</p><h3 id="harness-example-heading">Create a department meeting brief</h3>
<p>With Microsoft 365 connected, ask the Harness: “Prepare a brief for tomorrow’s department meeting. Find the meeting in my Outlook calendar, review related email conversations from the past two weeks, and draft an agenda with open questions and proposed follow-ups. Include source references.”</p>
<p>The plugin connects through Microsoft Graph using your signed-in account. Access is limited by your existing permissions and the capabilities enabled for the plugin. Review the brief and confirm owners and dates before sharing.</p>
<ol class="harness-example-steps"><li><strong>Describe the meeting</strong><span>Give the department name, meeting date, and topics to cover</span></li><li><strong>Gather and draft</strong><span>The Harness finds calendar details and related email, then drafts the brief</span></li><li><strong>Review before sharing</strong><span>Check sources and confirm owners and dates</span></li></ol>
<p><a href="/developer-apis/citizen-developer.html#practice-meeting">Practice preparing a meeting brief <span aria-hidden="true">→</span></a></p>
</aside>
<aside class="harness-worked-example" aria-labelledby="harness-feedback-heading">
<p class="home-kicker">Example task</p><h3 id="harness-feedback-heading">Summarize workshop feedback</h3>
<p>“Find the feedback spreadsheet for our latest workshop in Google Drive. Summarize the ratings and recurring themes, flag missing responses, and create a chart with a one-page summary. Suggest changes for the next session and show how you calculated the results.”</p>
<p>The Google Workspace plugin reads the spreadsheet. The Harness can analyze the responses and create report files in your workspace for review. The plugin’s Google Sheets access is read-only.</p>
<p><a href="/developer-apis/citizen-developer.html#practice-feedback">Practice analyzing workshop feedback <span aria-hidden="true">→</span></a></p>
</aside>
<aside class="harness-worked-example" aria-labelledby="harness-onboarding-heading">
<p class="home-kicker">Example task</p><h3 id="harness-onboarding-heading">Create a new employee onboarding guide</h3>
<p>“Use our department’s onboarding documents in Google Drive to draft a guide for a new employee. Organize it into a first-week checklist, explain how to request access to common tools, and link to the source documents. Flag conflicting instructions or missing information for me to resolve.”</p>
<p>The Google Workspace plugin reads the documents. The Harness organizes the guide, and the UCSD accessibility skill helps with headings, descriptive links, and readable structure. You review the instructions and fill any gaps before sharing.</p>
<p><a href="/developer-apis/citizen-developer.html#practice-onboarding">Practice creating an onboarding guide <span aria-hidden="true">→</span></a></p>
</aside>
<aside class="harness-worked-example" aria-labelledby="harness-discovery-heading">
<p class="home-kicker">Example task</p><h3 id="harness-discovery-heading">Find information when you don’t know where it lives</h3>
<p>“I’m looking for the latest instructions for requesting department software. I remember a discussion earlier this summer, but I’m not sure whether the instructions were emailed or saved in Google Drive. Search my Outlook email and Google Drive, show me the most relevant matches, and explain which appears to be current. Include source references and flag conflicting versions.”</p>
<p>With Microsoft 365 and Google Workspace connected, the Harness can search supported sources using clues such as a topic, person, or approximate date. It compares what it finds and helps you locate the original information. Access stays within your account permissions and the enabled plugin capabilities.</p>
<p><a href="/developer-apis/citizen-developer.html#practice-discovery">Practice finding information across sources <span aria-hidden="true">→</span></a></p>
</aside>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="comparison-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Choose by task</p>
<h2 id="comparison-heading">Comparing TritonGPT and TritonAI Harness</h2>
<p>Both services use UC San Diego AI infrastructure, but they serve different tasks and handle data differently.</p>
</div>
<div class="comparison-table-wrapper">
<table class="table comparison-table" role="table" aria-labelledby="comparison-heading">
<thead role="rowgroup">
<tr role="row">
<th class="col-feature" scope="col" role="columnheader">Capabilities</th>
<th class="col-tritongpt" scope="col" role="columnheader">
<div class="comparison-table-product">
<strong>TritonGPT</strong>
<span class="comparison-table-badge">Web Platform</span>
</div>
</th>
<th class="col-harness" scope="col" role="columnheader">
<div class="comparison-table-product">
<strong>TritonAI Harness</strong>
<span class="comparison-table-badge comparison-table-badge-gold">Agent Workspace</span>
</div>
</th>
</tr>
</thead>
<tbody role="rowgroup">
<tr role="row">
<th scope="row" role="rowheader"><span class="glyphicon glyphicon-hdd" aria-hidden="true"></span> Where it runs</th>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonGPT</span>
<div class="comparison-table-val">
<strong>Campus web servers</strong>
<small>Access directly in any browser. No local installation or setup required.</small>
</div>
</td>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonAI Harness</span>
<div class="comparison-table-val">
<strong>Local workstation</strong>
<small>Native desktop app installed on your Mac (M1+) or Windows x64 computer.</small>
</div>
</td>
</tr>
<tr role="row">
<th scope="row" role="rowheader"><span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span> System access</th>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonGPT</span>
<div class="comparison-table-val">
<strong>Session uploads</strong>
<small>Reads documents and spreadsheets uploaded into active chat conversations.</small>
</div>
</td>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonAI Harness</span>
<div class="comparison-table-val">
<strong>Local folders, terminal, &amp; git</strong>
<small>Reads project directories, edits local code, and runs shell commands according to the chat’s access mode.</small>
</div>
</td>
</tr>
<tr role="row">
<th scope="row" role="rowheader"><span class="glyphicon glyphicon-lock" aria-hidden="true"></span> Data storage</th>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonGPT</span>
<div class="comparison-table-val">
<strong>Campus server retention (90 days)</strong>
<small>Chat conversations reside on campus servers and purge automatically after 90 days.</small>
</div>
</td>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonAI Harness</span>
<div class="comparison-table-val">
<strong>Local files and task history</strong>
<small>Project files and saved task history stay on your device. Prompts and selected context are sent to the chosen model; connected tools exchange data with their services.</small>
</div>
</td>
</tr>
<tr role="row">
<th scope="row" role="rowheader"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span> Host plugins</th>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonGPT</span>
<div class="comparison-table-val">
<strong>Web widgets &amp; directory</strong>
<small>Connects to university websites, departmental knowledge bases, and directory lookups.</small>
</div>
</td>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonAI Harness</span>
<div class="comparison-table-val">
<strong>Campus service plugins</strong>
<small>Connect the included plugins listed below. Access follows your account permissions and enabled abilities.</small>
</div>
</td>
</tr>
<tr role="row">
<th scope="row" role="rowheader"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span> Human oversight</th>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonGPT</span>
<div class="comparison-table-val">
<strong>Chat window interaction</strong>
<small>You evaluate text responses directly in the browser interface.</small>
</div>
</td>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonAI Harness</span>
<div class="comparison-table-val">
<strong>Per-chat approval modes</strong>
<small>Supervised pauses for file changes and write tools. Full access allows actions without approval prompts. Plugin abilities and account permissions still apply.</small>
</div>
</td>
</tr>
<tr role="row">
<th scope="row" role="rowheader">
<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:8px;fill:none;stroke:var(--triton-blue,#006A96);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
<path d="M9 12l2 2 4-4"/>
</svg>
Data classification
</th>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonGPT</span>
<div class="comparison-table-val">
<strong><span class="glyphicon glyphicon-ok-circle" style="color:#00853E;margin-right:4px;" aria-hidden="true"></span> P1 through P3 Approved</strong>
<small>Approved for institutional campus records. Protection Level 4 (P4) is prohibited.</small>
</div>
</td>
<td role="cell">
<span class="comparison-mobile-label" aria-hidden="true">TritonAI Harness</span>
<div class="comparison-table-val">
<strong><span class="glyphicon glyphicon-ok-circle" style="color:#00853E;margin-right:4px;" aria-hidden="true"></span> P1 through P3 Approved</strong>
<small>Approved for administrative and research work in approved setups. P4 prohibited.</small>
</div>
</td>
</tr>
<tr class="comparison-table-action-row" role="row">
<td role="cell"></td>
<td role="cell">
<a class="btn btn-default btn-block" href="/tritongpt/index.html">Open TritonGPT Web</a>
</td>
<td role="cell">
<a class="btn btn-primary btn-block" href="/developer-apis/start.html">Get started with TritonAI Harness</a>
</td>
</tr>
</tbody>
</table>
</div>
<aside class="hub-note-card">
<strong>Need conversational web chat without installing software?</strong>
<span>Use <a href="/tritongpt/index.html">TritonGPT</a> for direct questions, document review, and campus administrative assistants. Use the Harness when you need an agent to work in a local project folder or run code.</span>
</aside>
</div>
</section>

<section class="hub-section" aria-labelledby="audiences-heading">
<div class="hub-heading">
<p class="home-kicker">Campus roles</p>
<h2 id="audiences-heading">Who uses TritonAI Harness</h2>
<p>The Harness provides structured workspaces tailored to different roles across UC San Diego.</p>
</div>
<div class="row hub-action-grid">
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-user" aria-hidden="true"></span>
<h3>Staff and citizen developers</h3>
<p>Analyze spreadsheets, generate draft reports, and organize intake data using your files and enabled campus plugins. Choose a model route approved for the data you use.</p>
<p><a href="/developer-apis/citizen-developer.html">Citizen Developer Guide <span aria-hidden="true">→</span></a></p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-wrench" aria-hidden="true"></span>
<h3>Software developers</h3>
<p>Build and host applications. Work across a repository with multi-file edits, test runs, and pull-request review, then move the result onto a supported campus hosting path. Start from the Skills Library and the development patterns TritonAI supports.</p>
<p><a href="/developer-apis/index.html#service-ladder">Host what you build <span aria-hidden="true">→</span></a></p>
<p><a href="/skills/index.html">Skills and supported patterns <span aria-hidden="true">→</span></a></p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-education" aria-hidden="true"></span>
<h3>Faculty and researchers</h3>
<p>Work with local datasets and run prompt pipelines through approved campus model routes. Check the requirements of your research project before using its data.</p>
<p><a href="/developer-apis/index.html#api-gateway">Models and routes <span aria-hidden="true">→</span></a></p>
</article>
</div>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="capabilities-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Core capabilities</p>
<h2 id="capabilities-heading">Execution and safety architecture</h2>
<p>TritonAI Harness balances agent capabilities with rigorous institutional guardrails.</p>
</div>
<div class="row hub-number-grid">
<div class="col-sm-6 col-md-3">
<article>
<span>01</span>
<h3>Local-first execution</h3>
<p>Project files and saved task history are stored on your workstation. The selected model receives the prompt and context needed for the task, including relevant file content or images.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>02</span>
<h3>UC-hosted models</h3>
<p>The stable release uses GLM 5.3 Flash as the managed default and also offers GLM 5.3 and Glimmer. Existing selections of available models are preserved. Check the <a href="/developer-apis/index.html#api-gateway">current models and routes</a> for hosting and data-use guidance.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>03</span>
<h3>Supervised execution</h3>
<p>Start with Supervised while learning: safe reads may proceed, while file changes, write tools, and commands needing additional permissions pause for approval. Choose the mode in each chat; exact behavior depends on the provider. Full access allows actions without prompts.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>04</span>
<h3>Credential isolation</h3>
<p>The desktop app encrypts stored API keys and OAuth tokens with a key protected by your operating system. Connected tools receive authorized operation results; stored credentials are kept out of model context.</p>
</article>
</div>
</div>
</div>
</section>

<section class="hub-section" aria-labelledby="integrations-heading">
<div class="hub-heading">
<p class="home-kicker">Host integrations</p>
<h2 id="integrations-heading">Included plugins</h2>
<p>In Settings &gt; Plugins, enable an included plugin, connect your account, and select its abilities under Access where available. Some abilities are granted during sign-in. Account permissions, enabled abilities, and the chat’s approval mode each control what the agent can do.</p>
</div>
<div class="row hub-action-grid">
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<svg class="plugin-logo" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true" fill="#182B49">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
</svg>
<h3>GitHub</h3>
<p>Connect a GitHub account with OAuth to read repositories, draft pull requests, and automate development workflows. Access follows your signed-in permissions.</p>
</article>
</div>
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<svg class="plugin-logo" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
<path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
</svg>
<h3>Google Workspace</h3>
<p>Read UC San Diego Drive files, including Docs, Sheets, and Slides. Gmail and Google Calendar access are also available for accounts that use them. File access is read-only; unsent Gmail drafts and calendar changes are separate opt-in abilities.</p>
</article>
</div>
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<svg class="plugin-logo" viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
<path fill="#F25022" d="M1 1h10v10H1z"/>
<path fill="#7FBA00" d="M13 1h10v10H13z"/>
<path fill="#00A4EF" d="M1 13h10v10H1z"/>
<path fill="#FFB900" d="M13 13h10v10H13z"/>
</svg>
<h3>Microsoft 365</h3>
<p>Read Outlook mail and calendars with your signed-in permissions. Unsent email drafts, mail organization, calendar changes, and Teams chat access are separate opt-in abilities. The plugin has no email-send tool; sending to an existing Teams chat requires its own enabled ability.</p>
</article>
</div>
</div>
<div class="row hub-action-grid">
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<!-- Official vendor artwork: https://www.kuali.co/ -->
<img class="plugin-logo plugin-logo-wordmark" src="https://cdn.prod.website-files.com/6a54fa1c67a49a38a3dfceaf/6a6480d26a966372f1be7f4a_image%2079%20%5BVectorized%5D.webp" alt="" width="140" height="36" loading="lazy">
<h3>UC San Diego Kuali Build</h3>
<p>Connect with your API key to inspect apps, forms, documents, and workflow metadata. Creating, editing, and submitting Build documents require the corresponding write abilities.</p>
</article>
</div>
<div class="col-sm-6 col-md-4">
<article class="panel panel-default hub-action-card">
<!-- Official vendor artwork: https://n8n.io/brandguidelines/ -->
<img class="plugin-logo plugin-logo-wordmark" src="https://n8n.io/brandguidelines/logo-dark.svg" alt="" width="140" height="36" loading="lazy">
<h3>n8n</h3>
<p>Sign in through your browser to inspect and design workflows in UC San Diego’s n8n service. Running, creating, updating, and publishing workflows depend on the abilities granted during sign-in and the chat’s approval mode.</p>
</article>
</div>
</div>
<aside class="hub-note-card">
<strong>Immediate revocation</strong>
<span>Disabling a plugin removes access to its tools immediately. Available tools and skills refresh for the next agent turn.</span>
</aside>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="skills-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Reusable capabilities</p>
<h2 id="skills-heading">UCSD Skills Library</h2>
<p>Skills package instructions, references, and scripts that agents load on demand. Browse AI Team and Community skills in <strong>Settings &gt; Skills</strong>. Skills you create or add locally stay under Your Skills; use <strong>Share with UCSD</strong> to submit a public contribution for review.</p>
</div>
<div class="row hub-action-grid">
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span>
<h3>Accessibility compliance</h3>
<p>Audit and remediate web pages, templates, and documents against WCAG 2.1 AA and UCSD Digital Accessibility standards.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" style="display:block;margin-bottom:12px;fill:none;stroke:var(--triton-blue,#006A96);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
<path d="M9 12l2 2 4-4"/>
</svg>
<h3>Data classification</h3>
<p>Classify application schemas, storage repositories, and API endpoints under UC IS-3 Protection Levels (P1 through P4).</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-th-large" aria-hidden="true"></span>
<h3>Decorator branding</h3>
<p>Build web interfaces matching UC San Diego Decorator 5 standards without altering protected campus chrome.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span>
<h3>Automated code review</h3>
<p>Run defect-first automated reviews before commits or pull requests merge into campus repositories.</p>
</article>
</div>
</div>
<p class="hub-section-action">
<a class="btn btn-primary" href="/skills/index.html">Browse the full Skills Library</a>
<a class="btn btn-default" href="https://github.com/UCSD/UCSD-Skills-Library" target="_blank" rel="noopener noreferrer">View repository on GitHub</a>
</p>
</div>
</section>

<section class="hub-section harness-subagents" id="sub-agents" aria-labelledby="harness-subagents-heading">
<div class="hub-heading"><p class="home-kicker">Scale</p><h2 id="harness-subagents-heading">Bigger tasks split across sub-agents</h2><p>Planning, drafting, and verification can run as separate sub-agents, each with only the tools its job needs, and then roll back up into one coherent result. The person running the Harness still approves what leaves the workspace.</p></div>
<figure class="harness-subagents-figure">
<svg viewBox="0 0 1240 490" role="img" aria-label="How TritonAI Harness splits a bigger task across sub-agents" aria-describedby="harness-subagents-desc" focusable="false"><desc id="harness-subagents-desc">A parent main thread hands out three goals. A plan sub-agent with read-only tools does planning and reconnaissance, a build sub-agent with bounded execution does the everyday work, and a verify sub-agent with execute and read tools tests and confirms the result. All three roll back up into one assembled result that can be a deck, a document, an application, or a workflow.</desc><rect x="480" y="0" width="280" height="58" rx="8" fill="#151a1a"/><text x="620" y="24" text-anchor="middle" fill="#f0c14d" font-size="13" font-weight="700" letter-spacing="3">PARENT</text><text x="620" y="45" text-anchor="middle" fill="#fff" font-size="16" font-weight="700" letter-spacing="1">main thread</text><path class="harness-anim-dash" d="M 620 58 C 620 96, 180 96, 180 138" fill="none" stroke="#2f6f8f" stroke-width="2" stroke-dasharray="4 5"/><rect x="340" y="86" width="120" height="22" rx="5" fill="#fff" stroke="#2f6f8f" stroke-width="1.3"/><text x="400" y="101" text-anchor="middle" fill="#2f6f8f" font-size="13" font-weight="800" letter-spacing="1.5">GOAL · PLAN</text><path class="harness-anim-dash" d="M 620 58 L 620 138" fill="none" stroke="#b4562a" stroke-width="2" stroke-dasharray="4 5"/><rect x="560" y="86" width="120" height="22" rx="5" fill="#fff" stroke="#b4562a" stroke-width="1.3"/><text x="620" y="101" text-anchor="middle" fill="#b4562a" font-size="13" font-weight="800" letter-spacing="1.5">GOAL · BUILD</text><path class="harness-anim-dash" d="M 620 58 C 620 96, 1060 96, 1060 138" fill="none" stroke="#557a2e" stroke-width="2" stroke-dasharray="4 5"/><rect x="780" y="86" width="120" height="22" rx="5" fill="#fff" stroke="#557a2e" stroke-width="1.3"/><text x="840" y="101" text-anchor="middle" fill="#557a2e" font-size="13" font-weight="800" letter-spacing="1.5">GOAL · VERIFY</text><g><rect x="40" y="138" width="280" height="200" rx="10" fill="#eef6f8" stroke="#2f6f8f" stroke-width="2"/><text x="64" y="168" fill="#2f6f8f" font-size="14" font-weight="800" letter-spacing="2">PLAN · READ-ONLY</text><circle cx="100" cy="226" r="36" fill="#f5f0e6" stroke="#2f6f8f" stroke-width="1.6"/><text x="100" y="238" text-anchor="middle" fill="#2f6f8f" font-size="40" font-style="italic">P</text><text x="150" y="202" fill="#52616b" font-size="12.5" font-weight="700" letter-spacing="1.5">restricted tools</text><rect x="150" y="216" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="187" y="231" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">read</text><rect x="230" y="216" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="267" y="231" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">grep</text><rect x="150" y="244" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="187" y="259" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">glob</text><rect x="230" y="244" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="267" y="259" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">web</text><text x="180" y="318" text-anchor="middle" fill="#182b49" font-size="22" font-style="italic" font-weight="500">planning · recon</text></g><g><rect x="480" y="138" width="280" height="200" rx="10" fill="#f8eee6" stroke="#b4562a" stroke-width="2"/><text x="504" y="168" fill="#b4562a" font-size="14" font-weight="800" letter-spacing="2">BUILD · FULL</text><circle cx="540" cy="226" r="36" fill="#f5f0e6" stroke="#b4562a" stroke-width="1.6"/><text x="540" y="238" text-anchor="middle" fill="#b4562a" font-size="40" font-style="italic">B</text><text x="590" y="202" fill="#52616b" font-size="12.5" font-weight="700" letter-spacing="1.5">bounded execution</text><rect x="590" y="216" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="627" y="231" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">bash</text><rect x="670" y="216" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="707" y="231" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">read</text><rect x="590" y="244" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="627" y="259" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">edit</text><rect x="670" y="244" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="707" y="259" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">+more</text><text x="620" y="318" text-anchor="middle" fill="#182b49" font-size="22" font-style="italic" font-weight="500">everyday worker</text></g><g><rect x="920" y="138" width="280" height="200" rx="10" fill="#f6f8ee" stroke="#557a2e" stroke-width="2"/><text x="944" y="168" fill="#557a2e" font-size="14" font-weight="800" letter-spacing="2">VERIFY · EXECUTE+READ</text><circle cx="980" cy="226" r="36" fill="#f5f0e6" stroke="#557a2e" stroke-width="1.6"/><text x="980" y="238" text-anchor="middle" fill="#557a2e" font-size="40" font-style="italic">V</text><text x="1030" y="202" fill="#52616b" font-size="12.5" font-weight="700" letter-spacing="1.5">check the result</text><rect x="1030" y="216" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="1067" y="231" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">bash</text><rect x="1110" y="216" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="1147" y="231" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">read</text><rect x="1030" y="244" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="1067" y="259" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">grep</text><rect x="1110" y="244" width="74" height="22" rx="4" fill="#fff" stroke="#d5d9de"/><text x="1147" y="259" text-anchor="middle" fill="#182b49" font-size="13" font-weight="700">todo</text><text x="1060" y="318" text-anchor="middle" fill="#182b49" font-size="22" font-style="italic" font-weight="500">testing · confirmation</text></g><path class="harness-anim-dash harness-anim-dash-rev" d="M 180 338 C 180 390, 522 390, 522 436" fill="none" stroke="#2f6f8f" stroke-width="2" stroke-dasharray="4 5"/><path class="harness-anim-dash harness-anim-dash-rev" d="M 620 338 L 522 436" fill="none" stroke="#b4562a" stroke-width="2" stroke-dasharray="4 5"/><path class="harness-anim-dash harness-anim-dash-rev" d="M 1060 338 C 1060 390, 522 390, 522 436" fill="none" stroke="#557a2e" stroke-width="2" stroke-dasharray="4 5"/><rect x="402" y="436" width="240" height="44" rx="8" fill="#00629b"/><text x="522" y="464" text-anchor="middle" fill="#fff" font-size="16" font-weight="800" letter-spacing="3">ASSEMBLED RESULT</text><g><rect x="666" y="436" width="38" height="44" rx="6" fill="#fff" stroke="#00629b" stroke-width="1.5"/><rect x="678" y="446" width="14" height="12" rx="1.5" fill="none" stroke="#00629b" stroke-width="1.4"/><line x1="680" y1="450" x2="690" y2="450" stroke="#00629b" stroke-width="1.3"/><line x1="680" y1="453" x2="687" y2="453" stroke="#00629b" stroke-width="1.1"/><line x1="680" y1="456" x2="689" y2="456" stroke="#00629b" stroke-width="1.1"/><text x="685" y="474" text-anchor="middle" fill="#00629b" font-size="11" font-weight="800" letter-spacing="1.3">DECK</text></g><g><rect x="712" y="436" width="38" height="44" rx="6" fill="#fff" stroke="#00629b" stroke-width="1.5"/><path d="M 726 445 L 734 445 L 737 448 L 737 458 L 726 458 Z" fill="none" stroke="#00629b" stroke-width="1.4"/><line x1="728" y1="451" x2="735" y2="451" stroke="#00629b" stroke-width="1.1"/><line x1="728" y1="454" x2="735" y2="454" stroke="#00629b" stroke-width="1.1"/><text x="731" y="474" text-anchor="middle" fill="#00629b" font-size="11" font-weight="800" letter-spacing="1.3">DOC</text></g><g><rect x="758" y="436" width="38" height="44" rx="6" fill="#fff" stroke="#00629b" stroke-width="1.5"/><text x="777" y="456" text-anchor="middle" fill="#00629b" font-size="13" font-weight="800">&lt;/&gt;</text><text x="777" y="474" text-anchor="middle" fill="#00629b" font-size="11" font-weight="800" letter-spacing="1.3">APP</text></g><g><rect x="804" y="436" width="38" height="44" rx="6" fill="#fff" stroke="#00629b" stroke-width="1.5"/><path d="M 827 448 A 6 6 0 1 1 819 456" fill="none" stroke="#00629b" stroke-width="1.4" stroke-linecap="round"/><polygon points="829.5,448 824.5,448 827,444.5" fill="#00629b"/><text x="823" y="474" text-anchor="middle" fill="#00629b" font-size="11" font-weight="800" letter-spacing="1.3">FLOW</text></g></svg>
<figcaption>Each sub-agent gets a goal and a bounded toolset. The assembled result can be a deck, a document, an application, or a workflow.</figcaption>
</figure>
<ul class="harness-subagents-legend">
<li><strong>Plan</strong><span>Read-only tools for reconnaissance: read, search, and browse approved sources. Nothing changes.</span></li>
<li><strong>Build</strong><span>Bounded execution for the everyday work: edit files and run commands inside the workspace you opened.</span></li>
<li><strong>Verify</strong><span>Execute and read to test the result and confirm it before a person signs off.</span></li>
</ul>
</section>

<section class="hub-section hub-subscribe" aria-labelledby="privacy-callout-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-8">
<p class="home-kicker">Data governance</p>
<h2 id="privacy-callout-heading">Privacy and data protection</h2>
<p>TritonAI Harness is approved for UC Protection Levels 1 through 3 (P1 through P3) within approved campus setups. Protection Level 4 (P4) data is prohibited. Because your workspace files and transcripts reside on your local workstation, endpoint encryption and device security standards apply.</p>
</div>
<div class="col-md-4 hub-subscribe-action">
<a class="btn btn-primary btn-lg" href="/developer-apis/harness-privacy.html">Read Privacy Statement</a>
</div>
</div>
</section>
