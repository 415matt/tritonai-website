---
title: TritonAI Harness Privacy Statement
path: /developer-apis/harness-privacy.html
description: How TritonAI Harness handles data residency, campus network transit, credential protection, and UC Protection Levels.
eyebrow: Build with TritonAI
lastReviewed: 2026-09-03
audiences: [staff, faculty, researchers, developers]
owner: TritonAI
source: "UC San Diego IT Services AI governance and data protection guidance"
canonicalUrl: /developer-apis/harness-privacy.html
relatedSlides: [platform-architecture, Citizen Developer Ecosystem]
landingHub: true
bannerImage: /_images/hero-abstract/build.webp
bannerPosition: center
bannerMode: abstract
---

<section class="hub-section hub-section-intro" aria-labelledby="privacy-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-8 hub-split-copy">
<p class="home-kicker">Data architecture</p>
<h2 id="privacy-intro-heading">Privacy and security in TritonAI Harness</h2>
<p class="hub-lede">TritonAI Harness uses a local-first architecture. Your project files, transcripts, and credentials stay on your computer. This statement explains what data stays local, what passes through the gateway, and how UC policies apply.</p>
<p>Unlike centralized web chat interfaces, the Harness does not retain your work on campus servers. You keep custody of your local files and project history.</p>
</div>
<div class="col-md-4">
<aside class="hub-note-card">
<strong>Approved data levels</strong>
<span>Approved for UC Protection Levels 1 through 3 (P1 through P3) within approved campus setups. Protection Level 4 (P4) data is prohibited.</span>
</aside>
</div>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" aria-labelledby="residency-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Local storage</p>
<h2 id="residency-heading">What remains on your computer</h2>
<p>The Harness stores operational data locally within your user account rather than on central servers.</p>
</div>
<div class="row hub-action-grid">
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span>
<h3>Project files and code</h3>
<p>All source code, spreadsheets, text documents, and configuration files remain in their original directories on your computer. The Harness only reads files in folders you explicitly open.</p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span>
<h3>Transcripts and logs</h3>
<p>Task transcripts, agent execution steps, and interaction histories are written directly to your local application directory. They are not stored on central campus servers.</p>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-book" aria-hidden="true"></span>
<h3>Local memory vaults</h3>
<p>Persistent notes, context summaries, and reference instructions are saved as local Markdown files on your workstation. No cloud indexing or external training takes place.</p>
</article>
</div>
</div>
</div>
</section>

<section class="hub-section" aria-labelledby="transit-heading">
<div class="hub-heading">
<p class="home-kicker">Network transit</p>
<h2 id="transit-heading">What crosses the campus gateway</h2>
<p>Communication between your workstation and TritonAI infrastructure is limited to active model requests and operational telemetry.</p>
</div>
<div class="row hub-action-grid">
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-send" aria-hidden="true"></span>
<h3>Active prompt context &amp; zero silent fallback</h3>
<p>When an agent turn executes, only the prompt text and specific file snippets needed for that turn travel across encrypted HTTPS to the TritonAI Gateway.</p>
<p>UC-hosted models on campus infrastructure process requests with <strong>zero data retention</strong> and <strong>no model training</strong>. Your prompts are discarded after generating the response.</p>
<p>The Harness maintains an <strong>empty cloud fallback list</strong> by default. If a UC-hosted model is temporarily unavailable, the error is surfaced immediately. Private campus context is never silently redirected to external cloud providers.</p>
</article>
</div>
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-stats" aria-hidden="true"></span>
<h3>Usage and billing telemetry</h3>
<p>The Gateway logs request timestamps, model identifiers, token counts, and account identifiers to monitor platform availability, manage quotas, and apply recharge billing where applicable.</p>
<p>The Gateway does not record the text content of your local files, shell command outputs, or conversation transcripts in its telemetry logs.</p>
</article>
</div>
</div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" aria-labelledby="credentials-heading">
<div class="container">
<div class="hub-heading">
<p class="home-kicker">Credential boundaries</p>
<h2 id="credentials-heading">Plugin security and credential isolation</h2>
<p>TritonAI Harness uses host-managed authentication to isolate credentials from language models.</p>
</div>
<div class="row hub-number-grid">
<div class="col-sm-6 col-md-3">
<article>
<span>01</span>
<h3>Host-managed tokens</h3>
<p>OAuth tokens for GitHub, Google Workspace, and Microsoft 365 reside in the local host secret store. Tokens are never passed into model prompt context.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>02</span>
<h3>Application API execution</h3>
<p>The Harness application process makes authorized API calls directly. The AI agent only proposes structured parameters for each action.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>03</span>
<h3>Draft-first safeguards</h3>
<p>Write operations for email and calendar default to draft mode. External changes require explicit human confirmation before sending or publishing.</p>
</article>
</div>
<div class="col-sm-6 col-md-3">
<article>
<span>04</span>
<h3>Immediate tool revocation</h3>
<p>Each plugin can be toggled on or off in Settings. Disabling access immediately revokes tools before the next agent turn.</p>
</article>
</div>
</div>
</div>
</section>

<section class="hub-section" aria-labelledby="classification-heading">
<div class="hub-heading">
<p class="home-kicker">Policy compliance</p>
<h2 id="classification-heading">Approved UC protection levels</h2>
<p>Use of the Harness must align with University of California Electronic Information Security Policy (IS-3).</p>
</div>
<div class="row hub-action-grid">
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span>
<h3>Approved for P1 through P3</h3>
<p>TritonAI Harness is approved for UC information classified as Protection Level 1 (Public), Protection Level 2 (Internal), and Protection Level 3 (Sensitive) within approved campus setups.</p>
<p>Because project files and transcripts reside on your local computer, your workstation must meet UC San Diego minimum security standards, including active disk encryption (FileVault on macOS, BitLocker on Windows).</p>
</article>
</div>
<div class="col-md-6">
<article class="panel panel-default hub-action-card">
<span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span>
<h3>Prohibited for P4 data</h3>
<p>Protection Level 4 (P4) data is strictly prohibited in TritonAI Harness. This includes electronic protected health information subject to HIPAA, credit card numbers subject to PCI DSS, and high-consequence regulatory data.</p>
<p>For health system patient-care workflows, consult the approved clinical AI services available through the UC San Diego Health Pulse portal.</p>
</article>
</div>
</div>
</section>

<section class="hub-section hub-section-slate hub-full-bleed" aria-labelledby="deletion-heading">
<div class="container">
<div class="row hub-split hub-split-align-center">
<div class="col-md-8 hub-split-copy">
<p class="home-kicker">User control</p>
<h2 id="deletion-heading">Data deletion and access revocation</h2>
<p class="hub-lede">Because session data is stored locally, you maintain complete control over data removal.</p>
<p>You can delete past task transcripts, remove cached files, or clear memory entries at any time by removing them from your local directory or clearing history within the application interface. Deletion is instantaneous and permanent.</p>
<p>To revoke Microsoft 365 access, use the Disconnect button in Settings under Plugins, or revoke permissions directly in your Microsoft 365 account security settings.</p>
</div>
<div class="col-md-4">
<aside class="hub-quote-card deletion-quote-card">
<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
<h3>Immediate local removal</h3>
<p>Clearing a task or deleting a local workspace folder immediately deletes the associated session records from your system.</p>
</aside>
</div>
</div>
</div>
</section>

<section class="hub-section hub-subscribe" aria-labelledby="contact-governance-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-8">
<p class="home-kicker">Governance contact</p>
<h2 id="contact-governance-heading">Questions about privacy and data use</h2>
<p>For questions regarding TritonAI data governance, security assessments, or approved use cases, contact the service team.</p>
</div>
<div class="col-md-4 hub-subscribe-action">
<a class="btn btn-primary btn-lg" href="mailto:tritonai@ucsd.edu">Email TritonAI team</a>
</div>
</div>
</section>
