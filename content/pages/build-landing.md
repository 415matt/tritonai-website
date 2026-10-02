---
title: Build with TritonAI
path: /developer-apis/index.html
description: Get one Gateway key to approved AI models, then build with TritonAI Harness, another compatible client, n8n, or your own code.
eyebrow: Build a service
lastReviewed: 2026-10-02
audiences: [developers, researchers, staff, leaders]
source: TritonAI developer documentation, API access intake and funding guidance, UC Protection Level Classification, TritonAI strategy presentation, ITS-TritonAI n8n service documentation, TritonAI Harness stable v0.3.4 documentation, and the public Model Hub reviewed October 2, 2026
canonicalUrl: /developer-apis/index.html
relatedSlides: [tritonai-developer-api-program, tritongpt-secure-scalable-ai-platform, campus-app-hosting-intake, cabinet-people-10-domain-expert, harness-memory-architecture]
landingHub: true
bannerImage: /_images/hero-abstract/build.webp
bannerPosition: center
bannerMode: abstract
---

<section class="hub-section hub-section-intro" aria-labelledby="build-intro-heading">
<div class="row hub-split hub-split-align-center"><div class="col-md-6 hub-split-copy"><p class="home-kicker">One key, approved models</p><h2 id="build-intro-heading">Build on the models the campus already approved</h2><p class="hub-lede">The TritonAI LLM Gateway gives every campus builder one key to approved cloud and UC-hosted models. Use it from TritonAI Harness, Claude Code, Codex, Hermes, or any client that connects to the Gateway, from an n8n workflow, or from your own code. When other people start to depend on what you built, move it into hosting and support sized to its users, data, and impact.</p><p class="hub-section-action"><a class="btn btn-primary" href="/developer-apis/start.html">Get a Gateway key</a> <a class="btn btn-default" href="/developer-apis/citizen-developer.html">Plan a first project</a></p></div><div class="col-md-6 hub-split-media">
<figure class="build-architecture" aria-describedby="build-architecture-caption">
<p class="build-architecture-label">What comes with the key</p>
<ol class="build-architecture-flow">
<li><span>01</span><div><strong>Campus agreements</strong><small>Cloud models run under UC enterprise contracts. Nothing is trained on your data.</small></div></li>
<li><span>02</span><div><strong>UC-hosted routes</strong><small>Open models on campus infrastructure, the no-recharge default for most campus work.</small></div></li>
<li><span>03</span><div><strong>Approved for P1 to P3</strong><small>The same approval TritonGPT has. P4 data is not approved.</small></div></li>
<li><span>04</span><div><strong>One place for cost and usage</strong><small>Your approval sets the routes, limits, and billing for the key.</small></div></li>
</ol>
<figcaption class="sr-only" id="build-architecture-caption">A Gateway key comes with campus enterprise agreements, UC-hosted model routes, approval for Protection Levels 1 through 3, and usage and billing controls set at approval.</figcaption>
</figure>
</div></div>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" id="builder-entry-points" aria-labelledby="builder-routes-heading">
<div class="container"><div class="hub-heading"><p class="home-kicker">Choose your path</p><h2 id="builder-routes-heading">How do you want to build?</h2><p>All three paths use the same Gateway key. Pick the one that matches the work in front of you. You can change paths later as the audience, data, or support needs change.</p></div>
<div class="row hub-action-grid hub-action-grid-three">
<div class="col-md-4">
<article class="panel panel-default hub-action-card builder-track-card">
<div class="builder-track-header">
<span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span>
<span class="builder-track-pill">Staff, analysts, developers</span>
</div>
<h3>Work with an agent</h3>
<p class="builder-track-summary">TritonAI Harness runs on your computer and works with local files, spreadsheets, code, and Microsoft 365. Choose a task approval mode; use Supervised while learning so file changes and write tools pause for approval.</p>
<div class="builder-track-waypoints">
<p class="builder-track-waypoint-label">On this page:</p>
<ul class="builder-track-links">
<li><a href="#tritonai-harness"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> TritonAI Harness and other clients</a></li>
<li><a href="#service-ladder"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> From prototype to service</a></li>
</ul>
</div>
<div class="hub-action-card-footer builder-track-footer">
<p><a class="btn btn-primary btn-block" href="/developer-apis/harness.html">Explore TritonAI Harness <span aria-hidden="true">→</span></a></p>
<div class="builder-track-sublink"><div><p><a href="/training/harness/">Start Harness training</a></p><p><a href="/developer-apis/harness-release-notes.html">Release notes</a></p><p><small>Prefer Claude Code, Codex, or Hermes? <a href="#tritonai-harness">Any compatible client works</a></small></p></div></div>
</div>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card builder-track-card">
<div class="builder-track-header">
<span class="glyphicon glyphicon-random" aria-hidden="true"></span>
<span class="builder-track-pill">Teams with a known process</span>
</div>
<h3>Automate a process</h3>
<p class="builder-track-summary">n8n runs a defined series of steps from a schedule, webhook, email, or file event. Add a model step where it helps and pause for a person before anything consequential.</p>
<div class="builder-track-waypoints">
<p class="builder-track-waypoint-label">On this page:</p>
<ul class="builder-track-links">
<li><a href="#workflow-automation"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> Workflow automation with n8n</a></li>
<li><a href="#built-on-tritonai"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> What campus teams have built</a></li>
</ul>
</div>
<div class="hub-action-card-footer builder-track-footer">
<p><a class="btn btn-primary btn-block" href="/developer-apis/start.html#n8n">Request n8n access <span aria-hidden="true">→</span></a></p>
<p class="builder-track-sublink"><small>Already approved? <a href="https://n8n.tritonai.ucsd.edu/">Open n8n</a></small></p>
</div>
</article>
</div>
<div class="col-md-4">
<article class="panel panel-default hub-action-card builder-track-card">
<div class="builder-track-header">
<span class="glyphicon glyphicon-transfer" aria-hidden="true"></span>
<span class="builder-track-pill">Developers and research labs</span>
</div>
<h3>Build an app or pipeline</h3>
<p class="builder-track-summary">Build and host applications on the Gateway with the client libraries you already use. Ship on a supported campus hosting path, and start from the Skills Library and the development patterns TritonAI supports.</p>
<div class="builder-track-waypoints">
<p class="builder-track-waypoint-label">On this page:</p>
<ul class="builder-track-links">
<li><a href="#api-gateway"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> Models available through the Gateway</a></li>
<li><a href="#service-ladder"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> Host what you build</a></li>
</ul>
</div>
<div class="hub-action-card-footer builder-track-footer">
<p><a class="btn btn-primary btn-block" href="/developer-apis/start.html">Get started with the API <span aria-hidden="true">→</span></a></p>
<p class="builder-track-sublink"><small>Reusable instructions in the <a href="/skills/index.html">Skills Library</a></small></p>
</div>
</article>
</div>
</div>
<p class="hub-section-action"><small>Teaching a course? <a href="/developer-apis/dsmlp-datahub.html">DataHub and DSMLP</a> supply course compute and are a separate service from the Gateway.</small></p>
</div>
</section>

<section class="hub-section" id="what-it-costs" aria-labelledby="what-it-costs-heading">
<div class="hub-heading"><p class="home-kicker">Cost and eligibility</p><h2 id="what-it-costs-heading">What a key costs</h2><p>Recharge is the campus term for internal billing to a department chartstring. Your approval sets which of these apply to your key.</p></div>
<div class="row hub-number-grid hub-number-grid-light">
<div class="col-sm-6 col-md-3"><article><span>01</span><h3>Campus work</h3><p>UC-hosted models carry no recharge for campus administrative work. Monthly caps apply.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>02</span><h3>Cloud models</h3><p>Billed to a departmental chartstring from the first token at the rate published in the Model Hub. The request names a budget owner and a spend limit.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>03</span><h3>Grant research</h3><p>UC-hosted and cloud use are charged to the grant or approved project chartstring.</p></article></div>
<div class="col-sm-6 col-md-3"><article><span>04</span><h3>Other campuses</h3><p>Other UC campuses connect through an intercampus recharge agreement arranged with the TritonAI team.</p></article></div>
</div>
<p>Rates and limits for every route stay in the Model Hub, and the Get Started page walks through the request. The FAQ covers sponsored research, Health Sciences, and other UC campuses in more detail.</p>
<p class="hub-section-action"><a class="btn btn-default" href="/developer-apis/start.html">Eligibility and setup</a> <a class="btn btn-default" href="/developer-apis/faq.html">Funding questions in the FAQ</a></p>
</section>

<section class="hub-section hub-section-sand hub-full-bleed api-gateway-section" id="api-gateway" aria-labelledby="api-gateway-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">One API for approved models</p><h2 id="api-gateway-heading">Connect through the TritonAI LLM Gateway</h2><p>Every request from TritonAI Harness, an n8n workflow, or your own code goes through this one endpoint. The Gateway routes each approved key to the models in its approval, and the approval defines access, limits, and billing treatment. The <a href="/developer-apis/start.html">Get Started page</a> covers access and installation. See the <a href="https://docs.tritonai.ucsd.edu/llm-api/api-reference">API reference</a> for endpoints and request details.</p></div>
<figure class="api-gateway-workflow" aria-describedby="api-gateway-caption">
<div class="api-gateway-map">
<div class="api-gateway-source-cluster">
<section class="api-gateway-lane api-gateway-builders" aria-labelledby="api-gateway-builders-heading">
<p class="api-gateway-lane-label">Start with a campus need</p>
<h3 id="api-gateway-builders-heading">Campus builders</h3>
<ul class="api-gateway-node-list"><li><span class="glyphicon glyphicon-user" aria-hidden="true"></span>Department staff</li><li><span class="glyphicon glyphicon-education" aria-hidden="true"></span>Research labs</li><li><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>Administrative analysts</li><li><span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span>Faculty teams</li></ul>
</section>
<section class="api-gateway-lane api-gateway-workspaces" aria-labelledby="api-gateway-workspaces-heading">
<p class="api-gateway-lane-label">Connect a client or application</p>
<h3 id="api-gateway-workspaces-heading">API clients</h3>
<ul class="api-gateway-node-list"><li class="api-gateway-node-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><span><strong>TritonAI Harness</strong><small>Primary supported client</small></span></li><li><span class="glyphicon glyphicon-console" aria-hidden="true"></span><span><strong>Supported alternatives</strong><small>Claude Code and Codex</small></span></li><li><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><span><strong>Compatible clients</strong><small>Hermes, OpenCode, and others</small></span></li></ul>
</section>
</div>
<div class="api-gateway-connector api-gateway-connector-in" aria-hidden="true"><i></i></div>
<section class="api-gateway-core" aria-labelledby="api-gateway-core-heading"><div><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><p>Shared API endpoint</p><h3 id="api-gateway-core-heading">TritonAI<br>LLM Gateway</h3></div></section>
<div class="api-gateway-connector api-gateway-connector-out" aria-hidden="true"><span>Access</span><i></i></div>
<div class="api-gateway-target-cluster">
<section class="api-gateway-lane api-gateway-routes" aria-labelledby="api-gateway-routes-heading">
<p class="api-gateway-lane-label">Choose an approved route</p>
<h3 id="api-gateway-routes-heading">Model routes</h3>
<ul class="api-gateway-node-list"><li><span class="glyphicon glyphicon-cloud" aria-hidden="true"></span><span><strong>Enterprise cloud</strong><small>AWS, Microsoft Azure, and Google Cloud Vertex AI</small></span></li><li><span class="glyphicon glyphicon-hdd" aria-hidden="true"></span><span><strong>UC-hosted</strong><small>Open models on UC San Diego infrastructure</small></span></li></ul>
</section>
<section class="api-gateway-capabilities" aria-labelledby="api-gateway-capabilities-heading"><p class="api-gateway-lane-label">Capabilities vary by model</p><h3 id="api-gateway-capabilities-heading">Available capabilities</h3><ul><li>Chat</li><li>Reasoning</li><li>Vision</li><li>Image generation</li><li>OCR</li><li>Coding</li></ul></section>
</div>
</div>
<figcaption id="api-gateway-caption">The Gateway key controls model access and limits. The client or application remains responsible for data permissions, testing, accessibility, support, and human review.</figcaption>
</figure>
</div>
</section>

<!-- AGENT_SECTION: model-catalog -->
<section class="hub-section" id="model-catalog" aria-labelledby="model-catalog-heading" data-model-catalog-endpoint="https://docs.tritonai.ucsd.edu/api/model-catalog">
<div class="hub-heading"><p class="home-kicker">Models and routes</p><h2 id="model-catalog-heading">Models available through the Gateway</h2><p>This view highlights the Gateway's most recent model series; it does not include every available model. Expand a family for request IDs and route limits. See the <a href="https://docs.tritonai.ucsd.edu/models">full model list and details</a> for capabilities and rates.</p></div>
<div data-model-catalog-list><section class="model-catalog-hosting" aria-label="UCSD-Hosted"><h3>UCSD-Hosted</h3><table class="table model-catalog-table"><caption class="sr-only">UCSD-Hosted model families. Expand a family for request IDs and individual route limits.</caption><thead><tr><th scope="col">Model family</th><th scope="col">Context (tokens)</th></tr></thead><tbody><tr><td><details class="model-catalog-family" data-model-family="[&quot;UC-hosted&quot;,&quot;Chat and reasoning&quot;,&quot;Gemma&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/gemma.svg" alt="Gemma" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Gemma 4 31B</strong></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Gemma 4 31B"><li data-model-id="api-gemma-4-31b"><code class="model-catalog-request-id">api-gemma-4-31b</code><span>256K tokens</span></li></ul></details></td><td class="model-catalog-context">256K</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;UC-hosted&quot;,&quot;Privacy filtering&quot;,&quot;Privacy Filter&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/openmed.webp" alt="OpenMed" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Privacy Filter</strong><span>Privacy filtering</span></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Privacy Filter"><li data-model-id="openai-privacy-filter"><code class="model-catalog-request-id">openai-privacy-filter</code><span>128K tokens</span></li></ul></details></td><td class="model-catalog-context">128K</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;UC-hosted&quot;,&quot;Chat and reasoning&quot;,&quot;GLM&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/zai.webp" alt="Z.ai" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>GLM 5.3</strong><span>Standard · Flash</span></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for GLM 5.3"><li data-model-id="api-glm-5.3"><code class="model-catalog-request-id">api-glm-5.3</code><span>320K tokens</span></li><li data-model-id="api-glm-5.3-flash"><code class="model-catalog-request-id">api-glm-5.3-flash</code><span>500K tokens</span></li></ul></details></td><td class="model-catalog-context">320K–500K</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;UC-hosted&quot;,&quot;Speech to text&quot;,&quot;Cohere Transcribe&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/cohere.webp" alt="Cohere Labs" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Cohere Transcribe</strong><span>Speech to text</span></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Cohere Transcribe"><li data-model-id="api-cohere-transcribe"><code class="model-catalog-request-id">api-cohere-transcribe</code><span>See model details</span></li></ul></details></td><td class="model-catalog-context">See details</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;UC-hosted&quot;,&quot;Chat and reasoning&quot;,&quot;Muse Glimmer 30B&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/meta.webp" alt="Meta" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Muse Glimmer 30B</strong></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Muse Glimmer 30B"><li data-model-id="api-muse-glimmer-30b"><code class="model-catalog-request-id">api-muse-glimmer-30b</code><span>262K tokens</span></li></ul></details></td><td class="model-catalog-context">262K</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;UC-hosted&quot;,&quot;Embeddings&quot;,&quot;Qwen3 Embedding 4B&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/qwen.webp" alt="Qwen" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Qwen3 Embedding 4B</strong><span>Embeddings</span></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Qwen3 Embedding 4B"><li data-model-id="api-tgpt-embeddings"><code class="model-catalog-request-id">api-tgpt-embeddings</code><span>4K tokens</span></li></ul></details></td><td class="model-catalog-context">4K</td></tr></tbody></table></section><section class="model-catalog-hosting" aria-label="Approved enterprise cloud"><h3>Approved enterprise cloud</h3><table class="table model-catalog-table"><caption class="sr-only">Approved enterprise cloud model families. Expand a family for request IDs and individual route limits.</caption><thead><tr><th scope="col">Model family</th><th scope="col">Context (tokens)</th></tr></thead><tbody><tr><td><details class="model-catalog-family" data-model-family="[&quot;Approved enterprise cloud&quot;,&quot;Chat and reasoning&quot;,&quot;Claude&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/anthropic.png" alt="Anthropic" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Claude 5.5</strong><span>Opus · Sonnet</span></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Claude 5.5"><li data-model-id="claude-opus-5-5"><code class="model-catalog-request-id">claude-opus-5-5</code><span>1M tokens</span></li><li data-model-id="claude-sonnet-5-5"><code class="model-catalog-request-id">claude-sonnet-5-5</code><span>1M tokens</span></li></ul></details></td><td class="model-catalog-context">1M</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;Approved enterprise cloud&quot;,&quot;Chat and reasoning&quot;,&quot;Gemini&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/google.webp" alt="Google" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Gemini 3.8 Flash</strong></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Gemini 3.8 Flash"><li data-model-id="gemini-3.8-flash"><code class="model-catalog-request-id">gemini-3.8-flash</code><span>1M tokens</span></li></ul></details></td><td class="model-catalog-context">1M</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;Approved enterprise cloud&quot;,&quot;Chat and reasoning&quot;,&quot;GPT&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/openai.webp" alt="OpenAI" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>GPT 6 series</strong><span>6.1 Sol · 6 Astra · 6 Luna</span></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for GPT 6 series"><li data-model-id="gpt-6.1-sol"><code class="model-catalog-request-id">gpt-6.1-sol</code><span>922K tokens</span></li><li data-model-id="gpt-6-astra"><code class="model-catalog-request-id">gpt-6-astra</code><span>922K tokens</span></li><li data-model-id="gpt-6-luna"><code class="model-catalog-request-id">gpt-6-luna</code><span>922K tokens</span></li></ul></details></td><td class="model-catalog-context">922K</td></tr><tr><td><details class="model-catalog-family" data-model-family="[&quot;Approved enterprise cloud&quot;,&quot;Chat and reasoning&quot;,&quot;Kimi&quot;]"><summary><img class="model-catalog-logo" src="https://docs.tritonai.ucsd.edu/images/model-logos/moonshot.webp" alt="Moonshot AI" width="32" height="32" loading="lazy" decoding="async"><span class="model-catalog-name"><strong>Kimi K2.6</strong></span><span class="sr-only"> (request IDs and route limits)</span></summary><ul class="model-catalog-routes" aria-label="Request IDs for Kimi K2.6"><li data-model-id="kimi-k2.6"><code class="model-catalog-request-id">kimi-k2.6</code><span>See model details</span></li></ul></details></td><td class="model-catalog-context">See details</td></tr></tbody></table></section></div>
<p class="model-catalog-refreshed" data-model-catalog-status role="status">Saved model list from 2026-10-02. Checking for updates.</p>
<script type="module" src="/_resources/js/model-catalog.js"></script>
</section>
<!-- END_AGENT_SECTION -->

<section class="hub-section build-harness" id="tritonai-harness" aria-labelledby="harness-heading">
<div class="hub-heading"><p class="home-kicker">Choose a client</p><h2 id="harness-heading">TritonAI Harness and other clients</h2><p>TritonAI Harness is UC San Diego's primary supported client. It is in pilot, runs on Mac (Apple Silicon) and Windows, and anyone with a Gateway key can request it. Claude Code and Codex are supported alternatives. Other compatible clients can connect with the same endpoint and key, though their features and setup differ.</p></div>
<div class="build-tool-grid">
<article class="build-tool-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><p class="build-tool-label">Primary supported client</p><h3>TritonAI Harness</h3><p>A desktop workspace with the Gateway connection, campus skills, and included campus plugins. Connect Microsoft 365 or Google Workspace for workplace tasks, GitHub for code, Kuali Build for forms, and n8n for workflows.</p></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><p class="build-tool-label">Supported alternatives</p><h3>Claude Code and Codex</h3><p>Keep a terminal or desktop workflow you already use and point it at the model routes approved for your key.</p></article>
<article><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><p class="build-tool-label">Compatible clients</p><h3>Hermes, OpenCode, and others</h3><p>Connect with the Gateway endpoint and key from your approval. Setup and support are yours.</p></article>
</div>
<p class="hub-section-action"><a class="btn btn-primary" href="/developer-apis/harness.html">Explore TritonAI Harness</a> <a class="btn btn-default" href="/developer-apis/start.html#harness">Download and set up</a> <a class="btn btn-default" href="/training/harness/">Start Harness training</a></p>
</section>

<section class="hub-section hub-section-dark hub-full-bleed" id="workflow-automation" aria-labelledby="workflow-automation-heading">
<div class="container"><div class="row hub-split hub-split-align-center"><div class="col-md-7 hub-split-copy">
<p class="home-kicker">Workflow automation</p>
<h2 id="workflow-automation-heading">Build repeatable workflows with n8n</h2>
<p>UC San Diego hosts n8n, a visual workflow platform that connects applications and APIs with little or no code. A workflow starts from a schedule, webhook, email, or file event and runs a defined series of steps. Model requests inside a workflow go through the Gateway with your key, and a workflow can pause for a person before selected actions.</p>
<p>n8n fits best once you know the process and how it should handle exceptions. For work that changes shape every time, start in TritonAI Harness.</p>
<p><a class="btn btn-primary" href="/developer-apis/start.html#n8n">Request n8n access</a> <a class="btn btn-default" href="https://n8n.tritonai.ucsd.edu/">Open n8n</a></p>
</div><div class="col-md-5 hub-split-media">
<aside class="shared-compute-mini" aria-labelledby="n8n-fits-heading">
<p id="n8n-fits-heading">Good first workflows</p>
<ol>
<li><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span><div><strong>A scheduled report</strong><small>Pull an export, reshape it, and send it on the same day each week.</small></div></li>
<li><span class="glyphicon glyphicon-inbox" aria-hidden="true"></span><div><strong>Intake routing</strong><small>Read a submission, spot missing fields, and route it to the right team.</small></div></li>
<li><span class="glyphicon glyphicon-file" aria-hidden="true"></span><div><strong>Document extraction</strong><small>Pull approved fields from PDFs into a tracker and flag anything uncertain for review.</small></div></li>
</ol>
</aside>
</div></div></div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed" id="built-on-tritonai" aria-labelledby="built-on-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Built on TritonAI</p><h2 id="built-on-heading">What campus teams have built</h2><p>These three run in production today. Each one started as a bounded campus problem with a named owner, and each keeps a person checking the results. Start with the one that looks most like your problem.</p></div>
<div data-featured-use-cases="class-planner-app,passport-app,ai-use-case-meeting"></div>
<p class="hub-section-action"><a class="btn btn-default" href="/use-cases/index.html">View all use cases</a></p>
</div>
</section>

<section class="hub-section gateway-usage-section" id="gateway-usage" aria-labelledby="gateway-usage-heading">
<div data-gateway-usage="true"></div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed hosting-lanes-section" id="service-ladder" aria-labelledby="service-ladder-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">From prototype to service</p><h2 id="service-ladder-heading">Add hosting and support as more people rely on it</h2><p>Something useful is not yet a service. As more people depend on it, as it touches more data, or as failure starts to cost something, move it up a rung. The <a href="/about/strategy.html">strategy page</a> describes the program lifecycle behind this ladder.</p></div>
<figure class="hosting-lanes-figure" aria-describedby="service-ladder-caption">
<ol class="hosting-lanes">
<li class="hosting-lane hosting-lane-personal">
<div class="hosting-lane-tier"><span>Rung 1</span><span class="glyphicon glyphicon-user" aria-hidden="true"></span><strong>Prototype</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>Testing an idea</strong><p>Working on your own with sample data you are approved to use.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>Your own workspace</strong><p>TritonAI Harness or a local sandbox. Fine for learning. Not something to hand other people.</p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>You</strong><p>You protect the data, check the results, and keep the scope small.</p></div>
</li>
<li class="hosting-lane hosting-lane-department">
<div class="hosting-lane-tier"><span>Rung 2</span><span class="glyphicon glyphicon-th-large" aria-hidden="true"></span><strong>Team workflow</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>A recurring job for a known group</strong><p>One application or workflow, a defined set of users, and a business owner who wants it.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>Department-owned application or n8n workflow</strong><p>Published through an approved campus application path with campus sign-in.</p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>Initial risk and scope review</strong><p>Say who maintains it, who answers support, and what data it may touch.</p></div>
</li>
<li class="hosting-lane hosting-lane-managed">
<div class="hosting-lane-tier"><span>Rung 3</span><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><strong>Campus service</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>Serving people outside your team</strong><p>A shared workflow, usually with integrations, that other units now depend on.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>TritonAI or ITS-managed path</strong><p>A named team operates and supports the service.</p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>Recurring review</strong><p>A named team monitors quality, security, accessibility, and uptime, and owns support.</p></div>
</li>
<li class="hosting-lane hosting-lane-enterprise">
<div class="hosting-lane-tier"><span>Rung 4</span><span class="glyphicon glyphicon-tower" aria-hidden="true"></span><strong>Enterprise service</strong></div>
<div class="hosting-lane-purpose"><span class="hosting-lane-label">Best for</span><strong>Campus-wide delivery</strong><p>Something the whole university uses, or something that hurts badly when it breaks.</p></div>
<div class="hosting-lane-host"><span class="hosting-lane-label">Hosting</span><strong>Enterprise platform</strong><p>Architecture, identity, and service management behind it.</p></div>
<div class="hosting-lane-review"><span class="hosting-lane-label">Accountability</span><strong>Formal operating ownership</strong><p>Governance, monitoring, continuity, and support come with the service.</p></div>
</li>
</ol>
<div class="hosting-lane-triggers" aria-label="Reasons to move to a higher rung"><strong>Move up when:</strong><ul><li><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>Audience or reliance grows</li><li><span class="glyphicon glyphicon-lock" aria-hidden="true"></span>Data or integrations expand</li><li><span class="glyphicon glyphicon-alert" aria-hidden="true"></span>Failure or support impact rises</li></ul></div>
<figcaption id="service-ladder-caption">The platform team runs the Gateway, publishes the patterns, and reviews the service path you propose. Your department owns the application, its data, accessibility, testing, user support, and a named technical owner. <a href="/about/team.html">See who owns what</a>.</figcaption>
</figure>
</div>
</section>

<nav class="hub-section hub-link-panel" id="builder-resources" aria-labelledby="build-resources-heading"><div class="hub-heading"><p class="home-kicker">Builder resources</p><h2 id="build-resources-heading">Where to go next</h2></div><div class="row hub-link-columns"><div class="col-sm-6 col-md-4"><a href="/developer-apis/start.html"><strong>Get Started</strong><span>Eligibility, keys, installers, and setup</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/citizen-developer.html"><strong>Plan a first project</strong><span>Pick a task you can check and a path that fits</span></a></div><div class="col-sm-6 col-md-4"><a href="https://docs.tritonai.ucsd.edu/models"><strong>Model Hub</strong><span>Live capabilities, rates, and limits</span></a></div><div class="col-sm-6 col-md-4"><a href="/skills/index.html"><strong>Skills Library</strong><span>Reusable instructions for campus jobs</span></a></div><div class="col-sm-6 col-md-4"><a href="/about/trust-architecture.html"><strong>Trust, privacy, and hosting</strong><span>Protection Levels, routes, and oversight</span></a></div><div class="col-sm-6 col-md-4"><a href="/about/roadmap.html"><strong>Roadmap</strong><span>What the platform team is building next</span></a></div></div></nav>

<section class="hub-section hub-subscribe" id="build-start" aria-labelledby="prototype-heading"><div class="row hub-split hub-split-align-center"><div class="col-md-8"><p class="home-kicker">Get a Gateway key</p><h2 id="prototype-heading">Request access and run a first test</h2><p>The Get Started page covers eligibility, funding, key protection, client choice, and installation. Most requests need only the form and a short description of the task.</p></div><div class="col-md-4 hub-subscribe-action"><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Request API access</a></div></div></section>
