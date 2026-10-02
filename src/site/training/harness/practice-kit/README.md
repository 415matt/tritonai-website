# TritonAI Harness practice kit

Everything in this folder is made up. There is no real person, class, or survey behind it, so it is safe to use while you learn.

## The scenario

The training follows one made-up project, and so do these exercises. Jordan runs a fall workshop series for campus staff. The first session just ended. The feedback survey ran in Qualtrics, and `workshop-feedback.csv` is a simplified export of it. `meeting-notes.md` comes from the team's pilot review. This week the team needs a feedback summary, a dashboard and a deck for department leaders, a follow-up email, and a sign-up page for session two.

Campus tools such as Qualtrics reports, Microsoft Forms, and the brand.ucsd.edu templates cover the standard version of each. The exercises practice the parts shaped to this project.

## What's here

| File | What it is |
|---|---|
| `workshop-feedback.csv` | 42 fictional survey responses, a simplified Qualtrics export: pace, content, and room ratings (1 to 5) plus one comment each. Four responses left the room rating blank. |
| `meeting-notes.md` | Fictional notes from a pilot review meeting, for the follow-up draft exercise. |
| `weekly-feedback-digest.n8n.json` | An inactive n8n workflow the Harness designed during the training. It has two problems for you to find. |
| `.agents/skills/daily-meeting-brief/SKILL.md` | A skill for a daily meeting brief. It's in a hidden `.agents` folder so the practice project picks it up. |
| `answer-key.md` | Expected results and what to look for. Try each exercise before you open it. |

## Set up (2 minutes)

1. Download the kit and unzip it somewhere you can find, such as `Documents/harness-practice`. If you saved the files one at a time, put them in one folder, and put `SKILL.md` in `.agents/skills/daily-meeting-brief/` inside it.
2. In the Harness, click **New project**, choose **Local folder**, and pick the `harness-practice` folder.
3. In the composer, open the lock menu and pick an access mode. **Supervised** is a good start while you learn: the Harness asks before it runs a command or changes a file.

Exercises 1 to 4, 6, and 9 need no accounts or plugins. Exercises 5, 7, and 8, and the second half of 6, are optional and need the plugin named.

## Exercise 1: Your first result (video chapter 2)

Ask:

> Summarize the ratings in workshop-feedback.csv for our planning team. Write the averages and the three most common comments to summary.md, and note how many Room ratings are missing.

Read each approval before you approve it. When it finishes, open `summary.md`.

## Exercise 2: Check the result

Ask:

> Show how you calculated the Room average in summary.md. List any responses you left out, and don't change any files.

Then check it yourself:

1. Open `workshop-feedback.csv` and find the rows with an empty `room` value.
2. Add up the room ratings that exist and divide by how many there are.
3. Ask: *Which response IDs mention the room being cold?* Open the file and confirm two of them.

Compare with the answer key.

## Exercise 3: Ask well (video chapter 3)

Try a vague request first, then a specific one, and compare:

> Summarize the feedback.

> Summarize the ratings and recurring themes in @workshop-feedback.csv for our planning team. Flag missing responses and show how you calculated each number.

## Exercise 4: Stay in control (video chapter 4)

Switch this thread to **Supervised** so you see the approvals, then ask:

> List the files in this project and tell me what each one is for. Don't change anything.

Choose **Decline** on one approval and watch what the Harness does instead.

## Exercise 5 (optional, Microsoft 365 plugin with Create mail drafts switched on)

> Draft a follow-up email from meeting-notes.md with decisions, owners, and dates. Leave anything unconfirmed as an open question. Save it as a draft only.

Open the draft in Outlook. It is not sent until you send it.

## Exercise 6: Build a small app (video chapter 11)

Ask:

> Build a one-page workshop sign-up app in a signup-app folder: name, email, department, and a choice of the Oct 14 or Oct 21 session. Validate the fields and show a confirmation. Leave the save address empty in config.js for now.

Then ask:

> Use $ucsd-branding to restyle signup-app so it follows campus brand standards. Keep the same fields and behavior.

To see it, open the right panel, choose **Browser**, and type the local address the Harness gives you (it looks like `http://127.0.0.1:4173/`). Try the form: leave a field empty, then fill it in and submit.

**Optional, with the campus n8n plugin (Write access):**

1. In n8n, create an empty data table named `workshop_signups` with the columns `name`, `email`, `department`, and `session`. The plugin can find data tables but can't create them.
2. Ask:

> Use the campus n8n plugin to create an INACTIVE workflow named "PRACTICE - workshop sign-ups": a webhook that receives each sign-up, saves it to my workshop_signups data table, and replies ok. Validate it first. Put the test URL in signup-app/config.js. Don't publish it.

3. Open the workflow in n8n and click **Execute workflow**. It listens for one sign-up.
4. In the Browser surface, submit a made-up sign-up, such as Jordan Lee, jordan.lee@example.edu, Library, Oct 14.
5. In n8n, check that each step turned green and the row is in the data table.

Use made-up data only. The test address stops listening after one sign-up, so don't share the page.

When you build an app you want others on campus to use, submit it for review: type `$tritonai-feedback` and describe the app. The skill drafts an email to tritonai@ucsd.edu, which opens a ticket with the TritonAI team.

## Exercise 7 (optional, campus n8n plugin with Write access)

First, review the workflow without sending anything to n8n:

> Read weekly-feedback-digest.n8n.json. For each step, tell me where it gets its data and whether it needs a credential. Then check the math in Prepare Summary Data: how does it handle a blank room rating?

Only then, if you want to try the plugin:

> Use the campus n8n plugin to create the workflow in weekly-feedback-digest.n8n.json as an INACTIVE draft in n8n named "PRACTICE - weekly feedback digest". Validate it first. Don't publish, activate, test, or run it, and don't add credentials. Then read it back and tell me whether it is active and which steps have credentials.

Do not click **Execute workflow** in n8n for this one. A test runs every step for real, and this workflow would create an Outlook draft.

## Exercise 8 (optional, Microsoft 365 plugin)

The kit includes a daily meeting brief skill in `.agents/skills/daily-meeting-brief`. In this project, type `$daily-meeting-brief` and ask:

> Brief me on today's meetings.

Check two things against Outlook: one carried-over action (was it really left open?), and one source it cites. If the skill doesn't show up in the `$` menu, ask: *Read .agents/skills/daily-meeting-brief/SKILL.md and follow it to brief me on today's meetings.*

## Exercise 9: Notes to a campus deck (video chapter 10)

1. Download a PowerPoint template from [brand.ucsd.edu › Downloads](https://brand.ucsd.edu/using-the-brand/downloads/index.html), such as **Blue and Gold**, and unzip it.
2. Make a `templates` folder in this project and put the template's `.pptx` file in it. The zip also includes the Teko and Source Sans 3 fonts; install them so the headings look right.
3. Ask (change the file name to match your template):

> Turn meeting-notes.md into a short slide deck for our planning team, using the UC San Diego template in templates/<template>.pptx. Use the template's own layouts and remove its sample slides. Aim for 6 to 8 slides: title, agenda, what we heard, decisions, actions with owners, still open, next steps. Use only what's in the notes, and don't invent dates or owners. Save it as pilot-review-deck.pptx.

4. Open the deck in PowerPoint and check each slide against `meeting-notes.md`.
