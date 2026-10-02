# Voice and language

How TritonAI copy should read. [Content governance](content-governance.md) decides what may
be published; this page guides how it sounds.

`npm run test:language` flags patterns in page and use-case copy, newsletter descriptions,
the homepage hero, and public roadmap narrative.
It writes `reports/language.json`. Style findings are advisory prompts for editorial
review. Metadata length remains a separate technical check.

## The target

Use your best editorial judgment for the audience, purpose, and surrounding copy.
Prefer active voice, clear verbs, and specific language. Preserve effective existing
copy and make the smallest change that improves it.

The tone can vary across the site:

- **Instructions, access guidance, and policy:** make actions and conditions easy to find.
- **Landing pages, marketing, and outreach:** use inviting language, imagery, and enthusiasm
  when they help readers understand the offer or see themselves using it.
- **Newsletters and event descriptions:** allow conversational commentary and a sense of
  discovery while distinguishing intended benefits from demonstrated outcomes.

For example, this older page has a clear purpose and an inviting voice:

> Struggling to articulate your impact for this year's appraisal? Our new AI-Powered
> Self-Appraisal Guide is now available to help.
> — `src/site/training-resources/index.html`

This heading needs more context to tell readers what they can do:

> A practical path from first prompt to trusted service
> — an earlier homepage `h1`

Ask whether a sentence helps readers understand, act, or become interested. Naming an
actor often helps, but descriptions, questions, and memorable phrases have a place too.
The guidelines below support that judgment. Claim protections remain requirements in
every context.

The examples show possible edits for a particular passage. Use them to inform a choice,
and keep the original when it already serves the page.

## Guidelines

### 1. One idea per heading

Prefer one clear idea per heading. A short two-part heading can work in outreach when it
remains easy to scan and helps readers understand the section.

| Before | After |
|---|---|
| Useful on day one. Governed for what comes next. | Start with chat, grow into a supported service |
| Share the foundation. Focus on the result. | Departments build on shared services |
| DSMLP provides computing. The TritonAI gateway provides model access. | How the two differ |

### 2. A heading says what the section contains

Help readers anticipate the section. An evocative heading can work when nearby copy makes
its meaning clear. If the kicker and heading repeat each other, consider keeping the
stronger one.

| Before | After |
|---|---|
| The architecture carries the policy | What sits around the model |
| The decisions stay connected | What we weigh when we build a service |
| A narrow prototype is the beginning, not the finish line | What a prototype needs before it becomes a service |
| Trust comes from the whole service—not just the model | What we check before a service ships |

### 3. Use counts when they help readers

A count can signal a short guide or a named framework. Omit it when it adds little to a
list readers can already see.

| Before | After |
|---|---|
| Four ways TritonGPT helps | What you can do in TritonGPT |
| Five campus access paths | Supported AI services |
| Three parts work together | The three parts |

"Six principles" on `/about/strategy.html` is the name of a framework and carries a
`lang-ok` marker explaining that choice.

### 4. Make contrasts earn their place

Use contrast when it explains a real distinction or gives a useful emphasis. Review
repeated contrasts that create drama without adding meaning. There is no per-page quota.

| Before | After |
|---|---|
| Evidence, not activity | How we measure |
| Bring a problem, not a product request | Tell us about the task |
| Treat output as material to review—not authority to accept | Check what the model gives you before you use it |
| ...instead of adding avoidable steps | ...so nobody has to learn a new system |

### 5. Keep lists readable

Four items is a useful rule of thumb for a sentence-level list. Use a `<ul>` for longer
lists when readers need to scan or act on individual items. A compact list of familiar
terms can stay in a sentence. Keep the items grammatically parallel.

> **Before:** Useful AI practice combines clear requests, strong source material,
> verification, data awareness, accessibility, authorship expectations, and the confidence
> to stop when a task needs a person.
>
> **After:** Getting good at AI is mostly judgment. Write a clear request, give it the right
> source material, check the answer against something you trust, and know when the task
> needs a person instead.

### 6. Choose adjectives and verbs that contribute

`practical`, `trusted`, `meaningful`, `thoughtful`, `durable`, `robust`, `seamless`,
`powerful`, `leverage`, `empower`, `unlock`. These words can be useful in context. Ask what
each adds: "practical prompting tips" describes a training offer; a claim that a service is
"trusted" needs a basis. Remove vague praise or stacks of adjectives that obscure the
offer. Use the product name when it is the clearest reference.

### 7. Let punctuation support the rhythm

Em dashes can set off an aside, mark a range, or give a sentence useful emphasis. Review
repeated dashes or staged reveals that make the prose harder to follow.

Legitimate, leave alone:

- the newsletter link-lead convention, `**[Title](url)** — description`
- roadmap `period` labels, `"Q1 2026 — Agents"`
- approved `measurementPeriod` strings, `"Production — 91% time savings (120 min to 11 min average)"`

Frontmatter `description` renders as the meta description. Keep it concise and readable;
choose punctuation for clarity within the character limit.

### 8. Read sibling strings top to bottom

Read sets of cards or summaries together. Vary openings when repetition feels mechanical;
keep parallel construction when it helps readers compare related items.

Many use-case summaries once opened with "A supervised workflow that…", "A drafting
workflow for…", or "An assistive workflow that…". Leading with a person or action made
those summaries more specific:

| Before | After |
|---|---|
| A supervised workflow that compares contract language with approved legal positions and prepares review-ready findings. | Procurement staff get contract language compared against approved UC legal positions, marked up and ready for a qualified reviewer. |
| A drafting workflow for organizing approved faculty activity data into a reviewable BioBib document. | Faculty pull approved activity data into a BioBib draft, then check every section before it goes anywhere. |

A `summary` renders in the use-case page lede, the meta description, and the index card.
Check that it works in all three places. Starting with "A", "An", or "The" is fine when
the sentence remains specific and the set reads naturally.

Apply the same judgment to `description`; there is no quota for an opening word.

### 9. Prefer active voice and clear verbs

When the source names who acts, active voice usually makes the action clearer. Choose
verbs for meaning and tone. Direct verbs help in instructions; more expressive language
can suit an invitation or introduction. Keep an unknown actor unknown.

| Before | After |
|---|---|
| Staff can perform a review of the draft. | Staff can review the draft. |

"TritonGPT serves as a campus assistant" and "TritonGPT is a campus assistant" can both
work. Choose the construction that fits the passage.

Use source evidence for claims about outcomes. Enthusiasm can support an invitation;
claims of impact need evidence. Review phrases such as "marking a pivotal moment" for
whether the source supports their significance.

### 10. Name sources and keep real uncertainty

For a sourced claim, use the source's name and retain its link. When source material names
a source, replace vague attribution such as "experts say" with that name.

Flag missing evidence for the content owner. Never invent a source or fill a gap with a
plausible detail. Keep uncertainty and scope where they describe a real limitation. The
claim protections below apply to every copy edit.

### 11. Give each paragraph a purpose

Give each paragraph a purpose. Instructions usually benefit from starting with the action.
Outreach can open with a question, scene, or invitation and end on an encouraging note.
Review repeated introductions and endings for what they contribute to the passage.

| Before | After |
|---|---|
| Let's explore how to review a draft. | Read the draft and check its claims against the source. |
| In order to review the draft, it is important to check each claim. | To review the draft, check each claim. |

An optimistic ending works best when it connects to a specific opportunity or next step.
Keep stated plans and invitations. Vary sentence length and occasional fragments when
they improve the rhythm; read the paragraph as a whole.

### 12. Keep names consistent

Use one name for each service or concept. Keep product names, defined status words, and
governance terms exact. Use pronouns where their referent is clear.

To fix repetition, change the sentence construction or combine related sentences. Repeated
mentions of TritonGPT do not need substitutes such as "the platform" or "the AI solution".

## Editorial review

Review the copy in the context of the page and its audience. Preserve quoted material,
official titles, and the author's voice where it works. Opinions or personal anecdotes
can suit outreach and newsletters when clearly framed and appropriate to the page.
Apply the claim protections below in every context.

Before finishing a copy change:

1. Read the affected passage aloud or at speaking pace. Check clarity, tone, rhythm, and
   repeated openings. Keep wording that already works.
2. Compare the revision with its source. Account for every fact, name, number, and date.
   Preserve quotes, citations, scope qualifiers, and uncertainty. Correct any unsupported
   addition or lost claim.
3. Run `npm run test:language` and assess its findings in context. A style warning calls
   for judgment, and does not require a rewrite. Check source attribution and claim
   accuracy separately.

## Words that carry meaning here

These are **not** boosters. They qualify a real control, several are validated, and some are
contractual. Keep them where they modify something real; cut them only where they modify
nothing.

`approved` · `governed` · `bounded` · `supervised` · `supported` · `named owner` ·
`human oversight` · `service owner` · `data classification`

The five status words are defined in [content governance](content-governance.md) and
validated against an allow-list. Never reword, re-case, or pluralize them:

`Production` · `Shipped` · `Pilot` · `In development` · `Exploring`

## What a copy edit may not change

- **Numbers, units, scope qualifiers, and hedges** in any quantitative claim. Tightening
  "reduced review time from 120 minutes to 11 minutes **for the measured NDA and terms-and-
  conditions workflow**" will drop the scope qualifier, which is the part doing the work.
  Same for "**in the validation sample**" and "**of respondents**". Punctuation only;
  anything else goes to the claim's named owner.
- **`lastReviewed` dates.** These attest that someone checked the content for accuracy. A
  wording change is not a re-review, and bumping the date resets the validator's 120-day
  freshness clock for nothing.
- **Structure.** Every `id`, `aria-labelledby` target, heading level, `alt` text, and
  `AGENT_SECTION` marker. `validate.mjs` asserts element counts and id order on several
  pages. Change text nodes only.
- **`content/skills/library.json`**, which is synced from an external repository. Fix a bad
  skill description upstream.
- The dead `src/site/` files whose `<main>` the build overwrites. Editing them produces a
  clean diff, a passing build, and no change on the site.

## Recording an editorial choice

When a recurring style warning is intentional, you may put a marker on the line above
with a reason. A marker is optional; reasonable wording does not need an exception to
this guide.

```html
<!-- lang-ok: "Six principles" is the name of the framework, not a count of the cards below -->
```

The build strips these before publishing. Include the editorial reason so future
reviewers can understand the choice.
