# Bows for Battle website - Claude notes

Public site for Bows for Battle, Inc. (veteran archery nonprofit, Menomonee Falls, WI).
Live at https://bowsforbattle.org. Static site on Netlify. Full background: `HANDOFF.md`.

## Git identity (overrides the global Vortex rule)
This is NOT a Vortex project. Commits here use the Bows for Battle identity:
- `user.name` = `Dustin Langsdorf`
- `user.email` = `dustinlangsdorf@bowsforbattle.org`

It is set in this repo's local git config. Before committing, check
`git config user.email` returns the address above; if not, stop and tell the user.
Pushes must use a GitHub account with write access to the `BowsForBattle` org
(the personal `langsdorfd` account gets 403).

## Git permissions
- Commit freely on `develop` (or a feature branch).
- **Always ask before pushing.** `git push origin develop:develop` deploys the live site.
- `main` and the `staging` remote are stale; do not treat them as current.

## Build workflow (the golden rule)
`build.py` is the source of truth. **Never hand-edit the generated `.html` files** -
Netlify runs `python3 build.py` on every deploy and overwrites them.
1. Edit `build.py` (pages, nav, header/footer) or `data.js` (events only).
2. Bump `REV` near the top of `build.py` (format `YYYY.MM.DD.N`; used for `?v=` cache-busting).
3. Run `python build.py` (prints `Wrote N pages (rev ...)`).
4. Commit `build.py` and the regenerated HTML together.

## Encoding
Keep source files ASCII. Editing tools on this Windows machine have written
non-ASCII characters as invalid UTF-8. Use HTML entities instead:
`&ndash;`, `&mdash;`, `&amp;`, `&middot;`, `&hellip;`, `&rsquo;`.

## Content conventions
- "One fact, one home": each fact lives on one page; other pages link to it.
- Events live only in `data.js` (`EVENTS`). `example: true` = placeholder,
  `tag: "..."` = amber "to confirm" note. Events auto-move Upcoming -> Past by date.
- Board bios: `page('board.html', ...)` block in `build.py`, 2 bios per row.
  Coaches/volunteers go on `team.html`.
- Every form is a Netlify Form: `<form class="email-form" data-form-title="..."
  name="..." method="POST" data-netlify="true" netlify-honeypot="company_website">`,
  plus a hidden `form-name` input matching `name` and a static `company_website`
  honeypot input. Copy an existing form when adding one. Netlify only detects forms
  present in the built HTML, and each new form name needs its notification set in
  the Netlify dashboard.
- Field `name`s are plain words (`name`, `email`, `phone`, ...) because they label the
  notification email. The email field is always `name="email"` (so replies reach the
  visitor) with `required` and the same `pattern` as the other forms.
- Images live in `Pictures/`. `Reference/` is source material, not served content.

## Writing tone
TODO: describe the voice for site copy.

## Secrets and infrastructure
- Never put API keys, tokens or passwords in the repo, in commits or in chat.
  Secrets go in Netlify environment variables only (e.g. `RESEND_API_KEY`).
- Never print or commit `.resend-api`, `.env*` or similar files.
- DNS is managed in the Squarespace domain portal. **Never change the root MX/TXT
  records** - org email runs on Google Workspace.
- No payment processor: the donate form collects pledge info only. Never add
  card fields to the site.
