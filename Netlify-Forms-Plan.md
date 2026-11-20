# Plan: Move site forms to Netlify Forms

Written 2026-11-19. Replaces the unfinished Resend setup (see `HANDOFF.md` section 5).

## Goal

Visitors can submit every form on bowsforbattle.org without needing a mail app on their
device. Each submission is stored in the Netlify dashboard and emailed to the board.

## Decisions made

- **Rollout:** the Equipment Donation form goes live first, then the other 7 forms.
- **Test recipient:** notifications go only to `dustinlangsdorf@bowsforbattle.org` until
  the setup is verified. The board list is decided after that.
- **Resend:** the code is removed in phase 1. Nothing on the live site uses it, so the
  other forms keep working through the first test.
- **After submit:** the visitor stays on the page and sees "Message sent. Thank you."
  under the form. If sending fails, they get a link that opens an email with their
  message already filled in.

## Time estimate

| Phase | Who | Hands-on time | Notes |
|---|---|---|---|
| 0. Turn on form detection | Dustin | 5 min | One dashboard switch |
| 1. Switch Equipment Donation form | Claude, Dustin reviews | 45-60 min | Includes rebuild, commit and push approval |
| 1. Test | Both | 20-30 min | Plus ~2-5 min per Netlify deploy |
| 2. Switch the other 7 forms | Claude, Dustin reviews | 30-45 min | Mostly repeating phase 1 |
| 2. Test + set board recipients | Both | 20-30 min | One test submission per form |
| 3. Cleanup + docs | Both | 20-30 min | |
| **Total** | | **about 2.5-3.5 hours** | |

Phases 0-1 fit in one sitting (about 1.5 hours). Phase 2 can follow the same day, but in
practice it waits on the board agreeing who receives which emails. Allow extra time if
the first test turns up a problem (for example, emails landing in spam).

## Phase 0: Netlify setting (Dustin)

1. Netlify -> site `polite-twilight-36fbc9` -> **Forms** -> turn on **form detection**.
   Netlify only finds forms on deploys made after this is on.

## Phase 1: Switch the Equipment Donation form (Claude, push needs Dustin's OK)

1. **`build.py`:** mark the equipment form as a Netlify form: add a form `name`,
   `data-netlify="true"`, and a spam-trap field written into the HTML.
2. **`forms.js`:**
   - Forms marked for Netlify post their fields to Netlify and show the inline thank-you.
   - If the send fails, show a link that opens a pre-filled email.
   - Forms not yet marked keep today's mail-app behavior exactly.
   - Remove the unused Resend ("api") mode.
3. **Remove Resend:** delete `netlify/functions/form-submit.js`, the `/api/form-submit`
   redirect in `netlify.toml`, and `Form-Autosend-Setup.md`.
4. **Housekeeping:** add a `.gitignore` (`.resend-api`, `.env*`, `.venv/`, `.vscode/`),
   bump `REV`, run `python build.py`, and commit (Bows for Battle git identity) together
   with `CLAUDE.md`, `HANDOFF.md` and this plan.
5. **Push** `develop` only after Dustin approves; the push deploys the live site.

## Phase 1 test (both)

1. Dustin: after the deploy, confirm the equipment form appears on Netlify's Forms page,
   then add an email notification for it to `dustinlangsdorf@bowsforbattle.org`.
2. Submit the equipment form on the live site (wait a few seconds before submitting) and check:
   - [ ] The submission shows in the Netlify dashboard.
   - [ ] The email arrives (check spam too).
   - [ ] The email is readable: field names make sense.
   - [ ] Replying goes to the visitor. Unconfirmed: Netlify may use a field named
         `email` for the reply-to address; this test settles it.
   - [ ] Another form (e.g. Contact) still opens the mail app as before.
3. Claude fixes anything found (e.g. renaming fields so the email reads well).

## Phase 2: The other 7 forms (Claude, push needs Dustin's OK)

Forms: Veteran Interest, Event Notification Signup, Host Offer, Volunteer, Donation,
Sponsorship Inquiry, Contact.

1. Mark them the same way, bump `REV`, rebuild, commit, push on approval.
2. Dustin: set notification recipients to the agreed board list.
3. Submit each form once to confirm.
4. Claude drafts a line for `legal.html` noting that form submissions are stored with
   our hosting provider (Netlify).

## Phase 3: Cleanup

1. Dustin: delete the Resend API key (or the Resend account) and remove the five Resend
   variables from Netlify (`RESEND_API_KEY`, `FORM_FROM`, `FORM_TO`, `FORM_REPLY_TO`,
   `ALLOWED_ORIGINS`).
2. Claude, on approval: drop the local `automatic-emails` stash that holds `.resend-api`.
   Its other files (story .docx, `Reference/_extracted_story.txt`, `.vscode/settings.json`)
   get listed first so nothing needed is lost.
3. Claude: update `HANDOFF.md`, `CLAUDE.md` and `README.md` to describe the new setup.

## Things to know

- **Submission cap:** Netlify's free tier limits form submissions per month. Check the
  current limit on the plan; site volume is expected to be well under it.
- **Stored data:** Netlify keeps each submission (names, emails, messages) in its
  dashboard. That is the safety net, and it is why `legal.html` gets a line about it.
