---
title: Responsible AI, Privacy and Hosting
path: /about/trust-architecture.html
description: How UC San Diego governs artificial intelligence services across privacy, hosting, data access, and human responsibility.
eyebrow: Trust, privacy and hosting
lastReviewed: 2026-08-30
audiences: [staff, faculty, students, developers, leaders]
source: TritonAI architecture and memory presentations, public developer documentation, UC Protection Level Classification
canonicalUrl: /about/trust-architecture.html
relatedSlides: [tritongpt-secure-scalable-ai-platform, tritongpt-to-tritonai-comparison, the-agentic-ai-stack, harness-memory-architecture, harness-memory-scale-ucsd]
---

<section class="hub-section hub-section-intro trust-intro" aria-labelledby="trust-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-6 hub-split-copy">
<p class="home-kicker">Hosting and ownership</p>
<h2 id="trust-intro-heading">What we check before a service ships</h2>
<p class="hub-lede">TritonAI gives campus services approved routes to AI models and campus information. Anyone can review the privacy, security, and accessibility decisions behind those routes on this site.</p>
<p>The platform does not make a service trustworthy on its own. Each service still needs a stated purpose, data it is allowed to use, a named owner, and people who check the results.</p>
<p class="trust-intro-actions"><a class="btn btn-primary" href="/tritongpt/privacy.html">Read the privacy statement</a> <a class="btn btn-default" href="/developer-apis/index.html">Explore developer resources</a></p>
</div>
<div class="col-md-6 hub-split-media">
<figure class="trust-service-map" aria-describedby="trust-service-map-caption">
<p class="trust-service-map-label">How a supported service fits together</p>
<ol>
<li><span>01</span><div><strong>Campus service</strong><small>A named owner says who it is for, what it does, and how results get reviewed.</small></div></li>
<li><span>02</span><div><strong>TritonAI LLM Gateway</strong><small>One managed route from supported applications to approved models.</small></div></li>
<li class="trust-service-map-routes"><span>03</span><div><strong>Approved model routes</strong><ul><li>Enterprise cloud<br><small>AWS, Microsoft Azure, and Google Cloud Vertex AI</small></li><li>UC-hosted<br><small>Open models on UC San Diego infrastructure at the San Diego Supercomputer Center</small></li></ul></div></li>
<li><span>04</span><div><strong>Approved information sources</strong><small>Assistants look things up when someone asks, from sources they are cleared for.</small></div></li>
<li><span>05</span><div><strong>Bounded tools and review</strong><small>Agentic services use approved capabilities within a stated scope, with people reviewing consequential results and actions.</small></div></li>
</ol>
<figcaption class="sr-only" id="trust-service-map-caption">A campus service with a named owner connects through the TritonAI LLM Gateway to approved enterprise cloud or UC-hosted models, can use approved information sources and tools, and retains human review for consequential results and actions.</figcaption>
</figure>
</div>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" id="protection-levels" aria-labelledby="protection-levels-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">UC data classification</p><h2 id="protection-levels-heading">What the Protection Levels mean</h2><p>UC assigns Institutional Information and IT Resources one of four Protection Levels based on the potential impact of unauthorized disclosure or modification. UC San Diego has approved TritonGPT and TritonAI Harness for use with information up to P3 when the use is within an approved service or setup. P4 data is not approved.</p></div>
<div class="row hub-number-grid hub-number-grid-light">
<div class="col-sm-6 col-md-3"><article><span>P1</span><h3>Minimal</h3><p>Public information or information intended for public access. Protecting its integrity is the primary concern.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>P2</span><h3>Low</h3><p>Internal information that is generally not public. Unauthorized use or loss could cause minor harm, financial loss, or privacy impact.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>P3</span><h3>Moderate</h3><p>Information whose compromise could cause moderate harm, privacy impact, financial loss, or legal action. Examples include student education records, UC personnel records, and some personally identifiable information.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>P4</span><h3>High</h3><p>Information whose compromise could cause significant harm, regulatory action, or civil or criminal penalties. Examples include protected health information, payment-card data, Social Security numbers, and controlled government information.</p></article></div>
</div>
<p class="hub-section-action"><a class="btn btn-default" href="https://security.ucop.edu/policies/institutional-information-and-it-resource-classification.html" rel="noopener noreferrer" target="_blank">Read the UCOP classification page</a> <a class="btn btn-default" href="https://security.ucop.edu/files/documents/uc-protection-level-classification-guide.pdf" rel="noopener noreferrer" target="_blank">Open the UC classification guide (PDF)</a></p>
<p>Approval up to P3 does not grant access to information or approve every use case. The person or office responsible for the information still determines its classification, permitted use, access, and any additional controls.</p>
</div>
</section>

<!-- AGENT_SECTION: ux-about-trust-layers -->
<section class="hub-section hub-section-dark hub-full-bleed trust-layers" id="trust-layers" aria-labelledby="trust-layers-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">The shared foundation</p><h2 id="trust-layers-heading">What the foundation separates</h2><p>Hosting, model access, information sources, and actions solve different problems. Each needs its own approval and operating boundary.</p></div>
<div class="trust-layer-grid trust-layer-grid-four">
<article><span>01</span><h3>Approved hosting choices</h3><p>A service can use approved enterprise cloud models or UC-hosted open models running at the San Diego Supercomputer Center. Which route it takes depends on the data involved and the controls that data requires.</p><ul><li>AWS</li><li>Microsoft Azure</li><li>Google Cloud Vertex AI</li><li>UC-hosted models</li></ul></article>
<article><span>02</span><h3>One gateway for model access</h3><p>Supported applications reach models through a single managed gateway. It gives everyone the same technical path. It does not approve what data a service may send through it.</p></article>
<article><span>03</span><h3>Approved sources at request time</h3><p>When someone asks a question, the assistant looks the answer up in sources it is cleared for. The model itself was not trained on private campus content.</p></article>
<article><span>04</span><h3>Bounded tools and actions</h3><p>Skills and connectors expose only the capabilities approved for a service. The service defines who may use them, where a person reviews the result, and when the workflow must stop or escalate.</p></article>
</div>
</div>
</section>
<!-- END_AGENT_SECTION -->

<section class="hub-section" id="hosting-paths" aria-labelledby="hosting-paths-heading">
<div class="row hub-split"><div class="col-md-5 hub-split-copy"><p class="home-kicker">Where a service runs</p><h2 id="hosting-paths-heading">Hosting follows reach and risk</h2><p>A build moves to a more managed home as more people rely on it, as it touches more data, or as failure starts to cost something. The <a href="/developer-apis/index.html#service-ladder">Build overview</a> explains what each rung needs.</p></div><div class="col-md-7"><dl class="hub-measure-grid"><div><dt>Prototype</dt><dd>Your own workstation or a sandbox, at <code>localhost</code>. Fine for learning. Nothing other people depend on.</dd></div><div><dt>Team workflow</dt><dd>A department-owned application on the approved campus application path with campus sign-in, at <code>apps.ucsd.edu</code>.</dd></div><div><dt>Campus service</dt><dd>A TritonAI or ITS-managed path operated by a named team, at <code>tritonai.ucsd.edu</code>.</dd></div><div><dt>Enterprise service</dt><dd>The enterprise platform with identity and service management behind it, at <code>ucsd.edu</code>.</dd></div></dl></div></div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed trust-surfaces" id="trust-surfaces" aria-labelledby="trust-surfaces-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Where people experience it</p><h2 id="trust-surfaces-heading">Where you actually meet it</h2><p>The same architecture sits behind all of these. Each one still needs its own named owner and an approved support path.</p></div>
<div class="trust-surface-grid">
<article><span class="glyphicon glyphicon-comment" aria-hidden="true"></span><h3>TritonGPT</h3><p>A campus assistant for chat, documents, and available models.</p></article>
<article><span class="glyphicon glyphicon-globe" aria-hidden="true"></span><h3>Website assistants</h3><p>An assistant sitting on a department site, answering from that site's content.</p></article>
<article><span class="glyphicon glyphicon-phone" aria-hidden="true"></span><h3>Mobile experiences</h3><p>AI features delivered through approved campus applications.</p></article>
<article><span class="glyphicon glyphicon-education" aria-hidden="true"></span><h3>Teaching and learning</h3><p>Course tools built around what the instructor wants students to learn.</p></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><h3>Developer applications and agents</h3><p>Department tools and supervised workflows built through supported APIs.</p></article>
</div>
</div>
</section>
