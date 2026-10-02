# Answer key

Try each exercise before you read this. The Harness may word things differently. What matters is that the numbers match and it tells you how it got them.

## Exercise 1: Your first result

| Rating | Responses with a rating | Sum | Average |
|---|---|---|---|
| Pace | 42 | 170 | 4.05 |
| Content | 42 | 186 | 4.43 |
| Room | 38 | 113 | 2.97 |

Most common comments:

1. More hands-on time: 14
2. Room was cold: 10
3. Too fast in part 2: 6

Missing room ratings: 4.

## Exercise 2: Check the result

- Blank room ratings: responses **5, 17, 29, and 38**.
- The correct Room average divides by the 38 ratings that exist: 113 ÷ 38 = **2.97**.
- If the blanks were counted as zeros, you would get 113 ÷ 42 = **2.69**. That is wrong, and it makes the room look worse than people rated it. If you see 2.69, ask how blanks were handled.
- "Room was cold" appears in responses **3, 9, 11, 15, 20, 26, 30, 36, 37, and 39**.
- Something worth noticing: five of those ten people still rated the room a 4. Checking the source is how you catch details like that before they go into a report.

## Exercise 3: Ask well

The vague request usually gets a general paragraph. The specific one should give you the three averages, the missing count, and the math for each number.

## Exercise 4: Stay in control

After you decline, the Harness should either try a different way to do the job or ask you what to do next. Nothing it did before you declined is undone, so decline before, not after, a step you don't want.

## Exercise 5: Follow-up draft

A good draft has:

- Decisions: move the part 2 exercise to part 3; add 15 minutes of hands-on time.
- Actions: Sam (room temperature), Priya (part 2 slides), Alex (registration link). None have dates in the notes, so a careful draft says so rather than inventing dates.
- Open questions: a larger room; sending slides early.

It should be an unsent draft.

## Exercise 6: Build a small app

- The form should refuse to submit with an empty field or a badly formed email, and show a confirmation after a good submission.
- With `$ucsd-branding`, look for the campus header and footer, UC San Diego blue, and a visible outline when you Tab through the fields.
- With n8n connected: one execution where every step is green, and one new row with exactly what you typed. If the page says it couldn't sign you up, n8n probably wasn't listening. Click **Execute workflow** again and resubmit.
- The test address only works while n8n is listening. When a workflow like this is reviewed and published, the app must switch to the production address.

## Exercise 7: The n8n workflow

Two problems to find:

1. **Where the data comes from.** Read Feedback File points to a path on your computer (`/Users/you/harness-practice/...`). n8n runs on a campus server and can't read files on your laptop, so the Monday run would fail. Point it at a shared source, such as a SharePoint list or a Google Sheet, before you test.
2. **The math.** Prepare Summary Data uses `Number(row[field])`. A blank rating becomes `0`, which counts as a real number, so Room would come out **2.69** instead of **2.97**. A fix is to skip blanks first, for example `rows.filter(r => String(r[field]).trim() !== '')` before converting to numbers.

Also check:

- When you create the draft, n8n may link a credential you already have, such as your Outlook account, to Create Outlook Draft, even if you asked for none. Read the workflow back and unlink anything you didn't intend.
- **Saving** stores the workflow and runs nothing. **Testing** runs every step once, for real: this one would create an Outlook draft. **Activating** runs it on its schedule.

## Exercise 8: Daily meeting brief

A good brief starts with the day at a glance (themes, open loops, heads-up, prep). Each meeting then has context, what carried over with owners and status, a suggested agenda that fits the meeting length, the best outcome, prep, and sources. Anything it couldn't find should say so, and anything it guessed should say "(inferred)".

## Exercise 9: Notes to a campus deck

- The deck uses the template's own layouts (title, agenda, bullets, statement, thank you), and none of the template's sample slides remain.
- Decisions: move the part 2 exercise to part 3; add 15 minutes of hands-on time.
- Actions: Sam (room temperature), Priya (part 2 slides), Alex (registration link), with no invented dates.
- Still open: the larger room, and whether slides go out early.
- If a slide says something the notes don't, ask where it came from.
