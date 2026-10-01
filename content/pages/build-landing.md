---
title: Build with TritonAI
path: /developer-apis/index.html
description: Get one Gateway key to approved AI models, then build with TritonAI Harness, another compatible client, n8n, or your own code.
eyebrow: Build a service
lastReviewed: 2026-09-04
audiences: [developers, researchers, staff, leaders]
source: TritonAI developer documentation, API access intake and funding guidance, UC Protection Level Classification, TritonAI strategy presentation, ITS-TritonAI n8n service documentation, and TritonAI Installer release information reviewed September 4, 2026
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
<p class="builder-track-summary">TritonAI Harness runs on your computer and works with local files, spreadsheets, code, and Microsoft 365. You approve each action before it takes effect.</p>
<div class="builder-track-waypoints">
<p class="builder-track-waypoint-label">On this page:</p>
<ul class="builder-track-links">
<li><a href="#tritonai-harness"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> TritonAI Harness and other clients</a></li>
<li><a href="#service-ladder"><span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span> From prototype to service</a></li>
</ul>
</div>
<div class="hub-action-card-footer builder-track-footer">
<p><a class="btn btn-primary btn-block" href="/developer-apis/harness.html">Explore TritonAI Harness <span aria-hidden="true">→</span></a></p>
<p class="builder-track-sublink"><small>Prefer Claude Code, Codex, or Hermes? <a href="#tritonai-harness">Any compatible client works</a></small></p>
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
<div class="hub-heading"><p class="home-kicker">One API for approved models</p><h2 id="api-gateway-heading">Connect through the TritonAI LLM Gateway</h2><p>Every request from TritonAI Harness, an n8n workflow, or your own code goes through this one endpoint. The Gateway routes each approved key to the models in its approval, and the approval defines access, limits, and billing treatment. The <a href="/developer-apis/start.html">Get Started page</a> covers client setup.</p></div>
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
<section class="hub-section" id="model-catalog" aria-labelledby="model-catalog-heading">
<div class="hub-heading"><p class="home-kicker">Models and routes</p><h2 id="model-catalog-heading">Models available through the Gateway</h2><p>The Gateway lists these models today. UC-hosted open models appear first, followed by approved enterprise cloud models. Start with a UC-hosted route such as <strong>GLM 5.3</strong> (<code class="model-catalog-request-id">api-glm-5.3</code>). Move to a cloud route when a task needs it. The code under each name is the request ID to use through the Gateway, and context length is the amount of input a request can carry. Rates and full details stay in the <a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/">Model Hub</a>.</p></div>
<div class="table-responsive" role="region" aria-label="Current model catalog" tabindex="0"><table class="table table-striped model-catalog-table">
<caption class="sr-only">Models currently listed by the TritonAI gateway with their hosting, type, and context length</caption>
<thead><tr><th scope="col">Model</th><th scope="col">Hosting</th><th scope="col">Type</th><th scope="col">Context length</th></tr></thead>
<tbody>
<tr><td><strong>Gemma 4 31B</strong><br><code class="model-catalog-request-id">api-gemma-4-31b</code></td><td>UC-hosted</td><td>Chat and reasoning</td><td>256K tokens</td></tr>
<tr><td><strong>DeepSeek V4 Flash</strong><br><code class="model-catalog-request-id">api-deepseek-v4-flash</code></td><td>UC-hosted</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>GLM 5.3</strong><br><code class="model-catalog-request-id">api-glm-5.3</code></td><td>UC-hosted</td><td>Chat and reasoning</td><td>320K tokens</td></tr>
<tr><td><strong>LightOn OCR 1B</strong><br><code class="model-catalog-request-id">api-lightonocr-1b</code></td><td>UC-hosted</td><td>Document OCR</td><td>8K tokens</td></tr>
<tr><td><strong>Cohere Transcribe</strong><br><code class="model-catalog-request-id">api-cohere-transcribe</code></td><td>UC-hosted</td><td>Speech to text</td><td>See Model Hub</td></tr>
<tr><td><strong>Claude Opus 5</strong><br><code class="model-catalog-request-id">claude-opus-5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Sonnet 5</strong><br><code class="model-catalog-request-id">claude-sonnet-5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.8</strong><br><code class="model-catalog-request-id">claude-opus-4-8</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.7</strong><br><code class="model-catalog-request-id">claude-opus-4-7</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Sonnet 4.6</strong><br><code class="model-catalog-request-id">claude-sonnet-4-6</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.6</strong><br><code class="model-catalog-request-id">claude-opus-4-6</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Claude Opus 4.6</strong><br><code class="model-catalog-request-id">claude-opus-4-6-v1</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>200K tokens</td></tr>
<tr><td><strong>Gemini 3.6 Flash</strong><br><code class="model-catalog-request-id">gemini-3.6-flash</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Gemini 3.5 Flash</strong><br><code class="model-catalog-request-id">gemini-3.5-flash</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Gemini 3.5 Flash Lite</strong><br><code class="model-catalog-request-id">gemini-3.5-flash-lite</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Gemini 3.7 Flash</strong><br><code class="model-catalog-request-id">gemini-3.7-flash</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>GPT-5.6 Luna</strong><br><code class="model-catalog-request-id">gpt-5.6-luna</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>GPT-5.6 Sol</strong><br><code class="model-catalog-request-id">gpt-5.6-sol</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>GPT-5.6 Terra</strong><br><code class="model-catalog-request-id">gpt-5.6-terra</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>GPT-5.5</strong><br><code class="model-catalog-request-id">gpt-5.5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>GPT-5.4</strong><br><code class="model-catalog-request-id">gpt-5.4</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Kimi K2.6</strong><br><code class="model-catalog-request-id">kimi-k2.6</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>See Model Hub</td></tr>
<tr><td><strong>Kimi K2.5</strong><br><code class="model-catalog-request-id">moonshotai.kimi-k2.5</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>262K tokens</td></tr>
<tr><td><strong>MiniMax M2</strong><br><code class="model-catalog-request-id">minimax.minimax-m2</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>128K tokens</td></tr>
<tr><td><strong>Mistral Large 3</strong><br><code class="model-catalog-request-id">mistral.mistral-large-3-675b-instruct</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>128K tokens</td></tr>
<tr><td><strong>Amazon Nova 2 Lite</strong><br><code class="model-catalog-request-id">us.amazon.nova-2-lite-v1:0</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>Amazon Nova Premier</strong><br><code class="model-catalog-request-id">us.amazon.nova-premier-v1:0</code></td><td>Approved enterprise cloud</td><td>Chat and reasoning</td><td>1M tokens</td></tr>
<tr><td><strong>TritonGPT Embeddings</strong><br><code class="model-catalog-request-id">api-tgpt-embeddings</code></td><td>Approved enterprise cloud</td><td>Embeddings</td><td>33K tokens</td></tr>
</tbody>
</table></div>
<p class="model-catalog-refreshed">List refreshed from the public Model Hub on 2026-09-01. Test registrations and TritonGPT-internal serving entries are excluded.</p>
</section>
<!-- END_AGENT_SECTION -->

<section class="hub-section build-harness" id="tritonai-harness" aria-labelledby="harness-heading">
<div class="hub-heading"><p class="home-kicker">Choose a client</p><h2 id="harness-heading">TritonAI Harness and other clients</h2><p>TritonAI Harness is UC San Diego's primary supported client. It is in pilot, runs on Mac (Apple Silicon) and Windows, and anyone with a Gateway key can request it. Claude Code and Codex are supported alternatives. Other compatible clients can connect with the same endpoint and key, though their features and setup differ.</p></div>
<div class="build-tool-grid">
<article class="build-tool-preferred"><span class="glyphicon glyphicon-star" aria-hidden="true"></span><p class="build-tool-label">Primary supported client</p><h3>TritonAI Harness</h3><p>A desktop workspace with the Gateway connection, campus skills, and Microsoft 365, Google Workspace, and GitHub connections set up for UC San Diego use.</p></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><p class="build-tool-label">Supported alternatives</p><h3>Claude Code and Codex</h3><p>Keep a terminal or desktop workflow you already use and point it at the model routes approved for your key.</p></article>
<article><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><p class="build-tool-label">Compatible clients</p><h3>Hermes, OpenCode, and others</h3><p>Connect with the Gateway endpoint and key from your approval. Setup and support are yours.</p></article>
</div>
<p class="hub-section-action"><a class="btn btn-primary" href="/developer-apis/harness.html">Explore TritonAI Harness</a> <a class="btn btn-default" href="/developer-apis/start.html#harness">Download and set up</a></p>
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

<nav class="hub-section hub-link-panel" id="builder-resources" aria-labelledby="build-resources-heading"><div class="hub-heading"><p class="home-kicker">Builder resources</p><h2 id="build-resources-heading">Where to go next</h2></div><div class="row hub-link-columns"><div class="col-sm-6 col-md-4"><a href="/developer-apis/start.html"><strong>Get Started</strong><span>Eligibility, keys, installers, and setup</span></a></div><div class="col-sm-6 col-md-4"><a href="/developer-apis/citizen-developer.html"><strong>Plan a first project</strong><span>Pick a task you can check and a path that fits</span></a></div><div class="col-sm-6 col-md-4"><a href="https://tritonai-api.ucsd.edu/ui/model_hub_table/"><strong>Model Hub</strong><span>Live capabilities, rates, and limits</span></a></div><div class="col-sm-6 col-md-4"><a href="/skills/index.html"><strong>Skills Library</strong><span>Reusable instructions for campus jobs</span></a></div><div class="col-sm-6 col-md-4"><a href="/about/trust-architecture.html"><strong>Trust, privacy, and hosting</strong><span>Protection Levels, routes, and oversight</span></a></div><div class="col-sm-6 col-md-4"><a href="/about/roadmap.html"><strong>Roadmap</strong><span>What the platform team is building next</span></a></div></div></nav>

<section class="hub-section hub-subscribe" id="build-start" aria-labelledby="prototype-heading"><div class="row hub-split hub-split-align-center"><div class="col-md-8"><p class="home-kicker">Get a Gateway key</p><h2 id="prototype-heading">Request access and run a first test</h2><p>The Get Started page covers eligibility, funding, key protection, client choice, and installation. Most requests need only the form and a short description of the task.</p></div><div class="col-md-4 hub-subscribe-action"><a class="btn btn-primary btn-lg" href="/developer-apis/start.html">Request API access</a></div></div></section>
