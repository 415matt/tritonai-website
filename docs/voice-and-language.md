# Voice and language

How TritonAI copy should read. [Content governance](content-governance.md) decides what may
be published; this page decides how it sounds.

`npm run test:language` checks the mechanical parts of these rules against page and
use-case copy, newsletter descriptions, the homepage hero, and public roadmap narrative.
It writes `reports/language.json`.

## The target

Write the way the older pages on this site already do:

> Struggling to articulate your impact for this year's appraisal? Our new AI-Powered
> Self-Appraisal Guide is now available to help.
> — `src/site/training-resources/index.html`

Not the way a language model does:

> A practical path from first prompt to trusted service
> — the homepage `h1`, before this guide existed

The test for any sentence: **is a specific person doing a specific thing?** If the subject
is an abstraction and the verb is doing no work, rewrite it.

## Rules

### 1. One idea per heading

No heading contains two sentences. `npm run test:language` reports this as an error.

| Before | After |
|---|---|
| Useful on day one. Governed for what comes next. | Start with chat, grow into a supported service |
| Share the foundation. Focus on the result. | Departments build on shared services |
| DSMLP provides computing. The TritonAI gateway provides model access. | How the two differ |

### 2. A heading says what the section contains

Not what you would like the reader to conclude from it. If the kicker and the heading say
the same thing twice, cut one.

| Before | After |
|---|---|
| The architecture carries the policy | What sits around the model |
| The decisions stay connected | What we weigh when we build a service |
| A narrow prototype is the beginning, not the finish line | What a prototype needs before it becomes a service |
| Trust comes from the whole service—not just the model | What we check before a service ships |

### 3. No count in a heading when the list is right there

| Before | After |
|---|---|
| Four ways TritonGPT helps | What you can do in TritonGPT |
| Five campus access paths | Supported AI services |
| Three parts work together | The three parts |

"Six principles" on `/about/strategy.html` is exempt. It is the name of a framework, not a
count of the cards below, and carries a `lang-ok` marker saying so.

### 4. No manufactured contrast

"X, not Y", "not only X but Y", "rather than", "instead of". One per page at most, and only
where the contrast is the actual point.

| Before | After |
|---|---|
| Evidence, not activity | How we measure |
| Bring a problem, not a product request | Tell us about the task |
| Treat output as material to review—not authority to accept | Check what the model gives you before you use it |
| ...instead of adding avoidable steps | ...so nobody has to learn a new system |

### 5. Four items maximum in a sentence-level list

More than that goes in a `<ul>`. Keep the items grammatically parallel.

> **Before:** Useful AI practice combines clear requests, strong source material,
> verification, data awareness, accessibility, authorship expectations, and the confidence
> to stop when a task needs a person.
>
> **After:** Getting good at AI is mostly judgment. Write a clear request, give it the right
> source material, check the answer against something you trust, and know when the task
> needs a person instead.

### 6. Delete the booster and reread

`practical`, `trusted`, `meaningful`, `thoughtful`, `durable`, `robust`, `seamless`,
`powerful`, `leverage`, `empower`, `unlock`. If the sentence lost nothing, leave it deleted.
Usually the product name is more precise than the adjective: "a trusted campus assistant"
is just "TritonGPT".

### 7. Em dashes are not a rhetorical beat

Keep one where it sets off a genuine aside or a numeric range. Replace it where it stages a
reveal. Never use one as the pivot of a contrast.

Legitimate, leave alone:

- the newsletter link-lead convention, `**[Title](url)** — description`
- roadmap `period` labels, `"Q1 2026 — Agents"`
- approved `measurementPeriod` strings, `"Production — 91% time savings (120 min to 11 min average)"`

Frontmatter `description` takes no em dash at all — it renders as the meta description, and
a dash there is always decoration.

### 8. Read sibling strings top to bottom

This is the clearest tell on the site and the one a reader notices without being able to
name it. If a set of strings shares an opening frame, rewrite until it does not.

Nine of eleven use-case summaries once opened the same way — "A supervised workflow
that…", "A drafting workflow for…", "An assistive workflow that…". Nobody writes eleven
descriptions like that. Each now leads with the person or the action:

| Before | After |
|---|---|
| A supervised workflow that compares contract language with approved legal positions and prepares review-ready findings. | Procurement staff get contract language compared against approved UC legal positions, marked up and ready for a qualified reviewer. |
| A drafting workflow for organizing approved faculty activity data into a reviewable BioBib document. | Faculty pull approved activity data into a BioBib draft, then check every section before it goes anywhere. |

A `summary` may not start with "A", "An", or "The". The check reports it as an error,
because that string renders in three places at once: the use-case page lede, the meta
description, and the index card.

The same applies to `description`. At most two of the fourteen may open with "How".

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

## Suppressing a check

Put a marker on the line above, with a reason:

```html
<!-- lang-ok: "Six principles" is the name of the framework, not a count of the cards below -->
```

The build strips these before publishing. The reason is required so suppressions stay
reviewable in a diff — a bare marker is how a style guide quietly stops applying.
