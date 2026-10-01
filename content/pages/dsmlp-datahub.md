---
title: DSMLP and DataHub
path: /developer-apis/dsmlp-datahub.html
description: DataHub is the browser route into DSMLP, the shared computing platform behind coursework and some TritonAI workloads.
eyebrow: Teaching and course compute
lastReviewed: 2026-07-26
audiences: [students, faculty, researchers, staff, developers, leaders]
source: UC San Diego DataHub and Research Platform, Blink DSMLP guidance, IT Services DSMLP documentation, and TritonAI platform architecture
canonicalUrl: /developer-apis/dsmlp-datahub.html
relatedSlides: [platform-architecture, tritonai-developer-api-program]
landingHub: true
bannerImage: /_images/homepage/TritonAI_Hero_2500.webp
bannerPosition: center 44%
---

<section class="hub-section hub-section-intro dsmlp-intro" aria-labelledby="dsmlp-intro-heading">
<div class="row hub-split hub-split-align-center">
<div class="col-md-6 hub-split-copy">
<p class="home-kicker">One shared computing foundation</p>
<h2 id="dsmlp-intro-heading">Use DataHub to reach the DSMLP computing platform</h2>
<p class="hub-lede">DataHub is UC San Diego’s browser-based way to use DSMLP for coursework, formal independent study, eligible student projects, and selected TritonAI workloads. It is a teaching platform. Research computing outside a course uses the Research Cluster request path, and model access for any workload goes through the TritonAI LLM Gateway.</p>
<p>DSMLP combines managed containers, CPU and GPU resources, storage, and reusable software environments. DataHub provides Jupyter and RStudio in the browser, while command-line tools support advanced machine-learning work.</p>
<p class="dsmlp-intro-actions"><a class="btn btn-primary" href="https://datahub.ucsd.edu/hub/login?next=%2Fhub%2F">Open DataHub</a> <a class="btn btn-default" href="https://support.ucsd.edu/its?id=kb_article_view&amp;sys_kb_id=b096442e9718f650992771611153afed">Read the official FAQ</a></p>
</div>
<div class="col-md-6 hub-split-media">
<figure class="dsmlp-platform-map" aria-describedby="dsmlp-platform-caption">
<p class="dsmlp-map-label">How the pieces fit</p>
<div class="dsmlp-map-entry">
<article><span class="glyphicon glyphicon-blackboard" aria-hidden="true"></span><strong>DataHub</strong><small>Web access to Jupyter, RStudio, and course environments</small></article>
<article><span class="glyphicon glyphicon-console" aria-hidden="true"></span><strong>Command line</strong><small>Advanced container and batch workflows through dsmlp-login</small></article>
</div>
<div class="dsmlp-map-connector" aria-hidden="true"><span>Launch a workspace</span><i></i></div>
<div class="dsmlp-map-core"><span class="glyphicon glyphicon-tasks" aria-hidden="true"></span><div><p>Shared computing platform</p><h3>DSMLP</h3><ul><li>Containers</li><li>CPU and GPU</li><li>Storage</li><li>Datasets</li></ul></div></div>
<div class="dsmlp-map-connector" aria-hidden="true"><span>Support many workloads</span><i></i></div>
<div class="dsmlp-map-outcomes"><span>Coursework and student projects</span><span>Selected TritonAI workloads</span></div>
<figcaption id="dsmlp-platform-caption">People enter through DataHub or command-line tools, launch isolated workspaces on DSMLP shared compute, and use those resources for coursework, formal independent study, eligible student projects, and selected TritonAI workloads.</figcaption>
</figure>
</div>
</div>
</section>
<section class="hub-section hub-section-sand hub-full-bleed dsmlp-learning-value" aria-labelledby="dsmlp-learning-value-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Why shared infrastructure matters</p><h2 id="dsmlp-learning-value-heading">Start supported, grow into advanced work</h2><p>Eligible students and instructors get an environment that already works for computational coursework, and can move to custom tooling when they outgrow it.</p></div>
<div class="dsmlp-feature-grid dsmlp-learning-value-grid">
<article><span class="glyphicon glyphicon-log-in" aria-hidden="true"></span><h3>Access for assigned courses</h3><p>Students in assigned courses receive access automatically through the course setup process.</p></article>
<article><span class="glyphicon glyphicon-duplicate" aria-hidden="true"></span><h3>A consistent setup</h3><p>Everyone in the class gets the same software, course files, and datasets, so nobody loses a week to installation.</p></article>
<article><span class="glyphicon glyphicon-education" aria-hidden="true"></span><h3>Support for instructors</h3><p>ITS and Educational Technology Services help instructors set up software, containers, assignments, and course datasets.</p></article>
</div>
</div>
</section>
<section class="hub-section hub-section-dark hub-full-bleed dsmlp-capabilities" aria-labelledby="dsmlp-capabilities-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Platform capabilities</p><h2 id="dsmlp-capabilities-heading">Start in a notebook or build a custom ML workflow</h2><p>DSMLP turns a notebook or command-line request into an isolated workspace with the computing resources it needs.</p></div>
<div class="dsmlp-feature-grid">
<article><span class="glyphicon glyphicon-edit" aria-hidden="true"></span><h3>Interactive notebooks</h3><p>Jupyter puts live code, equations, charts, and your own notes in one document.</p></article>
<article><span class="glyphicon glyphicon-dashboard" aria-hidden="true"></span><h3>Accelerated ML development</h3><p>Research-class CPU/GPU resources and an Ubuntu CUDA environment support popular languages and GPU-enabled frameworks.</p></article>
<article><span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span><h3>Flexible environments</h3><p>When the default image does not fit, add packages or launch your own Docker container.</p></article>
<article><span class="glyphicon glyphicon-hdd" aria-hidden="true"></span><h3>Storage and datasets</h3><p>Cluster-local storage supports student workspaces, course files, and commonly used training datasets across sessions.</p></article>
</div>
</div>
</section>

<section class="hub-section dsmlp-access-section" aria-labelledby="dsmlp-access-heading">
<div class="hub-heading"><p class="home-kicker">Getting in</p><h2 id="dsmlp-access-heading">Web or command line</h2><p>Both reach the same DSMLP. Use the browser for a workspace that is already set up, or the command line when you want control.</p></div>
<div class="row dsmlp-access-grid">
<div class="col-md-6"><article class="dsmlp-access-card dsmlp-access-card-web"><header><span class="glyphicon glyphicon-new-window" aria-hidden="true"></span><div><p>Browser-based</p><h3>DataHub</h3></div></header><ul><li>Launch a course or independent-study environment from the web.</li><li>Work in Jupyter notebooks, terminals, and supported graphical tools.</li><li>Use curated software images and shared course resources.</li></ul><p><a href="https://datahub.ucsd.edu/hub/login?next=%2Fhub%2F">Go to DataHub <span aria-hidden="true">→</span></a></p></article></div>
<div class="col-md-6"><article class="dsmlp-access-card dsmlp-access-card-cli"><header><span class="glyphicon glyphicon-console" aria-hidden="true"></span><div><p>Command-line</p><h3>DSMLP launch tools</h3></div></header><ul><li>Start interactive, batch, or custom-container workloads with <code>launch.sh</code>.</li><li>Request CPU, memory, and GPU resources for the container.</li><li>Use advanced workflows without running jobs on the shared login host.</li></ul><p><a href="https://support.ucsd.edu/services?id=kb_article_view&amp;sysparm_article=KB0032269">Read the container launch guide <span aria-hidden="true">→</span></a></p></article></div>
</div>
<div class="dsmlp-access-pathway" aria-labelledby="dsmlp-access-pathway-heading">
<div class="dsmlp-access-pathway-heading"><p class="home-kicker">Eligibility and access</p><h3 id="dsmlp-access-pathway-heading">How students and instructors get access</h3></div>
<ol>
<li><span aria-hidden="true">1</span><div><strong>Enrolled courses</strong><p>Students in courses assigned to DSMLP receive access automatically shortly before the term begins.</p></div></li>
<li><span aria-hidden="true">2</span><div><strong>Independent study and eligible projects</strong><p>Students submit the <a href="https://go.ucsd.edu/2wc5gH0">DSMLP access request</a> with the project scope and computational needs.</p></div></li>
<li><span aria-hidden="true">3</span><div><strong>Instructional course setup</strong><p>Instructors request DataHub/DSMLP through the <a href="https://support.ucsd.edu/services?id=sc_cat_item_guide&amp;sys_id=dc1afcd51b152910484f968f034bcb8b&amp;sysparm_category=90e152651b19a910484f968f034bcbf0">Specialized Instructional Computing form</a>.</p></div></li>
</ol>
<p class="dsmlp-access-pathway-note"><span class="glyphicon glyphicon-envelope" aria-hidden="true"></span> Students exploring DSMLP for personal enrichment, and faculty or staff evaluating it for instructional support, can contact <a href="mailto:datahub@ucsd.edu">datahub@ucsd.edu</a>.</p>
</div>
</section>

<section class="hub-section hub-section-sand hub-full-bleed dsmlp-tritonai-section" aria-labelledby="dsmlp-tritonai-heading">
<div class="container">
<div class="hub-heading"><p class="home-kicker">Where TritonAI fits</p><h2 id="dsmlp-tritonai-heading">How the two differ</h2><p>DSMLP supplies computing. The TritonAI gateway supplies model access. Some TritonAI services run workloads on DSMLP, but the apps, their service owners, and the approved model routes stay separate from it.</p></div>
<figure class="dsmlp-tritonai-flow" aria-describedby="dsmlp-tritonai-caption">
<ol>
<li><span class="glyphicon glyphicon-tasks" aria-hidden="true"></span><div><small>Shared compute</small><strong>DSMLP</strong><p>Containerized CPU/GPU capacity, storage, and platform operations</p></div></li>
<li><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><div><small>Selected workloads</small><strong>TritonAI services</strong><p>Applications, evaluation, automation, and supporting processes</p></div></li>
<li><span class="glyphicon glyphicon-transfer" aria-hidden="true"></span><div><small>Approved model access</small><strong>TritonAI LLM Gateway</strong><p>Managed routes to enterprise cloud and UC-hosted models</p></div></li>
</ol>
<figcaption id="dsmlp-tritonai-caption">DSMLP provides shared compute for selected TritonAI workloads. Model requests continue through the TritonAI LLM Gateway to approved enterprise or UC-hosted model routes.</figcaption>
</figure>
<div class="dsmlp-distinction"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span><p><strong>Related, but not the same service:</strong> DataHub is the web interface for authorized notebook and computational work. TritonAI users work through TritonGPT, the TritonAI Harness, APIs, or department applications. <a href="/developer-apis/index.html#api-gateway">See the TritonAI gateway architecture.</a></p></div>
</div>
</section>

<section class="hub-section dsmlp-responsibility" aria-labelledby="dsmlp-responsibility-heading">
<div class="row hub-split">
<div class="col-md-7 hub-split-copy">
<p class="home-kicker">Use the right operating path</p>
<h2 id="dsmlp-responsibility-heading">Know which work belongs on DSMLP</h2>
<p>DSMLP is limited to student-focused activities with authorized access and published usage policies. Eligible uses include assigned coursework, formal independent study and student research, state-supported capstone projects, and approved campus-sponsored student activities. Self-supported professional degree coursework and capstone projects are not currently eligible.</p>
<p>Non-course or non-credit research computing should follow the <a href="https://forms.gle/FLVRfBUDzUfmQ8up6">UC San Diego Research Cluster request path</a>. UC San Diego documentation also states that DataHub/DSMLP is not suitable for P3/P4 protected data. Projects involving sensitive data, production service commitments, or specialized operating requirements need an appropriate review and hosting path.</p>
<p>DSMLP is built and operated by UC San Diego IT Services, with additional financial contributions from Cognitive Science and the Jacobs School of Engineering.</p>
</div>
<div class="col-md-5 hub-split-media"><aside class="dsmlp-resource-panel" aria-labelledby="dsmlp-resources-heading"><p class="home-kicker">Official resources</p><h3 id="dsmlp-resources-heading">Learn more and get help</h3><ul><li><a href="https://blink.ucsd.edu/faculty/instruction/tech-guide/dsmlp/">DSMLP overview and eligibility</a></li><li><a href="https://datahub.ucsd.edu/hub/login?next=%2Fhub%2F">DataHub and Research Platform</a></li><li><a href="https://support.ucsd.edu/its?id=kb_article_view&amp;sys_kb_id=b096442e9718f650992771611153afed">DataHub and DSMLP FAQ</a></li><li><a href="https://support.ucsd.edu/its?id=kb_article_view&amp;sysparm_article=KB0030588">Instructor guidance</a></li><li><a href="https://datahub.ucsd.edu/hub/status">Cluster status</a></li></ul><p>Support: <a href="mailto:datahub@ucsd.edu">datahub@ucsd.edu</a></p></aside></div>
</div>
</section>
