# Bows for Battle Website - Handoff

Snapshot date: 2026-11-19. Written so a new chat/developer can pick up with no prior context.

---

## 1. What this is

- Public website for **Bows for Battle, Inc.** (veteran archery nonprofit, Menomonee Falls, WI).
- Live at **https://bowsforbattle.org** (and www). Formerly hosted on **Squarespace**; now a hand-built **static site** hosted on **Netlify**.
- Local repo: `C:\GitKracken\BFB`.
- Org contact used on the site: `jessehall@bowsforbattle.org`, mailing address N64W14960 Mill Rd, Menomonee Falls, WI 53051.

---

## 2. How the code works

### The golden rule
**`build.py` is the source of truth. Do not hand-edit the `.html` files.** Netlify runs `build.py` on every deploy, so hand edits to HTML are overwritten. (This has bitten us before: the "Our Story" link worked locally but vanished live because it was only in the HTML.)

Workflow for any content change:
1. Edit `build.py` (or `data.js` for events).
2. Bump `REV` near the top of `build.py` (format `YYYY.MM.DD.N`) - it is appended as `?v=` to CSS/JS for cache-busting.
3. Run `python build.py` (prints `Wrote N pages (rev ...)`).
4. Commit `build.py` **and** the regenerated HTML together.

### Files

| File | Purpose |
|---|---|
| `build.py` | Static site generator (pure Python, no dependencies). Holds `NAV`, `SECTIONS` (hub -> child pages), header, footer, crisis band, and every page body via `page('name.html', ...)` calls. |
| `data.js` | `ORG` facts + `EVENTS` list. **Only place to edit events.** `example: true` = placeholder; `tag: "..."` = amber "to confirm" note. Events auto-move Upcoming -> Past by date. |
| `events.js` | Renders the events table, filters, Google Calendar links and .ics downloads. |
| `forms.js` | Client-side form handler for every `form.email-form` (see section 5). Loaded on every page. |
| `share.js` | "Share with a Vet" button (`[data-share-vet]`). Native share sheet on phones, clipboard fallback. Always shares `https://bowsforbattle.org/...`. |
| `netlify/functions/form-submit.js` | Netlify serverless function that emails form submissions via Resend (see section 5). |
| `netlify.toml` | Functions dir + redirect `/api/form-submit` -> `/.netlify/functions/form-submit`. |
| `styles.css`, `styles-v2.css`, `styles-v3-events.css` | Base, structural additions, events-page-only styles. |
| `Pictures/` | All images (board portraits, sponsor logos, flyers). Must deploy with the HTML. |
| `Reference/` | Source material (e.g. `sponsorship_packages.csv`). Not served content. |
| `*.md` | Planning/docs. `README.md` is **outdated** (still says "draft, not live" and "forms are inert"). |

### Site map (from `NAV` / `SECTIONS` in build.py)

- Home `index.html` (only page with the Veterans Crisis Line dial band)
- About `about.html` -> `story.html`, `mission.html`, `board.html`, `team.html`
- Programs `programs.html` -> `eligibility.html`
- Events `events.html`
- Get Involved `get-involved.html` -> `equip.html` (Donate Gear), `host.html`, `volunteer.html`
- Give `give.html` -> `donate.html`, `sponsors.html`, `sponsorship.html`
- Contact `contact.html`
- Footer-only: `legal.html`
- Generated but **unlinked**: `transparency.html`, `_what-happens.html`. `safety.html` was removed.

Content conventions: "one fact, one home" - each fact lives on one page, others link to it. Board bios are in the `page('board.html', ...)` block (2 bios per row). Coaches/volunteers on `team.html`.

### Encoding gotcha (Windows)
Editing tools on this machine have written non-ASCII characters (en dash, ellipsis, etc.) as invalid UTF-8. Keep source ASCII and use HTML entities (`&ndash;`, `&mdash;`, `&amp;`, `&middot;`).

---

## 3. Hosting, Git and deploy

### GitHub
| Remote | Repo | Role |
|---|---|---|
| `origin` | `https://github.com/BowsForBattle/bowforbattle` | **Production.** Netlify deploys `origin/develop`. |
| `staging` | `https://github.com/BowsForBattle/bowsforbattle-staging.git` | Old staging copy; far behind (stuck at `7c46365`). Not used for the live site. |

Branches:
- `develop` - **the live branch.** Latest: `72f74e0` (Tanya name fix + mailto fallback link).
- `main` - stale (origin/main at `14cee78`). Not deployed. Do not assume it is current.
- `addJason-bio` - merged, can be ignored.
- `automatic-emails` - abandoned email experiment; has a **stash** (see section 5 warning).

Publish live: `git push origin develop:develop`.
Push auth: must be a GitHub account with write access to the `BowsForBattle` org repo. The personal `langsdorfd` account gets **403**; if pushes fail, clear the cached `git:https://github.com` entry in Windows Credential Manager and re-auth as the correct account. Commits are authored as `dlangsdorf`.

Before Netlify, the draft was shared via GitHub Pages.

### Netlify
- Team: **BowsForBattle**. Project/site: `polite-twilight-36fbc9` (named "bowforbattle"). Default URL: https://polite-twilight-36fbc9.netlify.app
- Build settings: branch `develop`, base dir blank, **build command `python3 build.py`**, publish dir `.`, functions dir `netlify/functions`.
- Every push to `develop` auto-deploys. No DNS re-verification needed for normal deploys.
- A "Powered by Netlify" badge appeared once; it is a Netlify dashboard setting, not in our code.
- Environment variables: see section 5.

### Domain and DNS
- Domain `bowsforbattle.org` - originally Google Domains, now managed through **Squarespace Domains** (Google sold Domains to Squarespace). Nameservers `ns-cloud-c1..c4.googledomains.com`. Access is via Google Workspace Admin -> Domains -> Manage domain (sign in with Google as `jessehall@bowsforbattle.org`), which opens the Squarespace domain portal.
- Registrar expiry **2027-05-03**, auto-renew ON. Transfer/delete locks ON (leave them).
- **DNS records are edited in the Squarespace domain portal** (DNS Settings).
- Web records set for the Netlify cutover (old Squarespace A records 198.185.159.144/145 and 198.49.23.144/145 were removed):
  - `A  @    75.2.60.5` (Netlify apex load balancer; Squarespace does not support ALIAS at apex)
  - `CNAME  www  polite-twilight-36fbc9.netlify.app`
- **Email/MX/TXT records were left untouched** - org email runs on **Google Workspace** (`@bowsforbattle.org` mailboxes). Never change root MX records.

### Squarespace
- No longer hosts the website. Still in play for **domain/DNS management** only.
- Migration plan and rollback steps (revert the A/CNAME records): `Squarespace-to-Static-Migration-Guide.md`.
- Open question: whether the Squarespace **website** subscription has been cancelled/downgraded. Keep the **domain** subscription active.

---

## 4. Other services referenced on the site

| Service | Where | Notes |
|---|---|---|
| Google Workspace | Org email for all board addresses | Form recipients live here. |
| Facebook page | Footer | `facebook.com/profile.php?id=61590572042307` |
| Veterans Crisis Line | Home page crisis band | Dial 988 press 1 / text 838255 / chat link. |
| Sherwood Forest Bowmen (Sussex, WI) | Home sponsor logos, `sponsors.html`, events | Sponsor/partner; links to sherwoodforestbowmen.com + Facebook. |
| BK III Archery | Home sponsor logos, `sponsors.html` | Facebook link only. |
| Google Calendar | `events.js` | "Add to calendar" links (no account/API). |
| IRS Tax Exempt Org Search | `transparency.html` | Link only. |
| Resend | `netlify/functions/form-submit.js` | Transactional email API for auto-send forms. **Not working yet** - see section 5. |

**No payment processor.** The donate form collects pledge info only; no card data touches the site. Checks can be mailed. A future online-giving service (e.g. a hosted donation platform) is an open item.

---

## 5. Forms and the email problem (UNFINISHED)

### The problem
Forms currently use `mailto:`, which opens the visitor's **default mail app**. Visitors with no mail app/handler configured (common on desktops using webmail) **cannot submit at all** - clicking does nothing. The `72f74e0` fix added a visible "click here to send your email" fallback link, but it is still a `mailto:` link, so it does not help those users. The real fix is server-side auto-send.

### Forms on the site
All are `<form class="email-form" data-form-title="...">` in `build.py`. The title must match the allow-list in `form-submit.js`:
Veteran Interest Form, Event Notification Signup, Equipment Donation Form, Host Offer Form, Volunteer Form, Donation Form, Sponsorship Inquiry Form, Contact Form.

### How `forms.js` works
- Mode comes from `window.BFB_FORM_CONFIG.mode`, defaulting to **`'mailto'`**. Nothing in the live site sets it, so **every form is in mailto mode**.
- `mode: 'api'` POSTs JSON to `/api/form-submit` (-> Netlify function).
- Client protections: honeypot field `company_website`, 2.5 s minimum fill time, 20 s per-form cooldown (localStorage), button disabled while sending.
- mailto recipients (hard-coded `TO`): jessehall, dustinlangsdorf, jasonturner, amberhall, tanya `@bowsforbattle.org`.

### How the Netlify function works (`netlify/functions/form-submit.js`)
- Validates: POST only, JSON content type, optional origin allow-list, form-title allow-list, 30 KB body limit, max 40 fields / 2000 chars each, blocks `<script`/`javascript:`/`onerror=`, max 5 links, honeypot, min elapsed time, in-memory per-IP rate limit (6 per 10 min per function instance).
- Sends via `POST https://api.resend.com/emails` with `Authorization: Bearer RESEND_API_KEY`.
- Env vars it reads:

| Var | Purpose | Default if unset |
|---|---|---|
| `RESEND_API_KEY` | Required. Resend API key (`re_...`). | Function returns 500. |
| `FORM_FROM` | Sender. Domain must be verified in Resend. | `Bows for Battle Forms <forms@bowsforbattle.org>` |
| `FORM_TO` | Comma-separated recipients. | The same 5 board addresses as forms.js |
| `FORM_REPLY_TO` | Reply-to. | `jessehall@bowsforbattle.org` |
| `ALLOWED_ORIGINS` | Comma-separated allowed `Origin`s. | Any origin allowed |

- On any send failure it returns a generic 500 and **does not log the error**, so failures are invisible in Netlify function logs. Adding `console.error(err)` in the catch is the first debugging step.

### What was done so far (Sept 2026 session)
1. Built the function + `forms.js` api mode (commit `7ddd511`).
2. Created a Resend account and an API key.
3. In Netlify env vars: added `RESEND_API_KEY` as **Secret** (secret vars require a per-context value - must be filled for **Production**). Was walked through adding `FORM_FROM`, `FORM_TO`, `FORM_REPLY_TO`, `ALLOWED_ORIGINS` (Secret OFF, all scopes, same value all contexts). **Not confirmed** which of these were actually saved.
4. Tested by adding `window.BFB_FORM_CONFIG = { mode: 'api' }` to `equip.html` only, on branch `automatic-emails`. That change was **never committed to a branch** - it sits in a git stash - and it was a hand edit to HTML, so it would have been overwritten by the Netlify build anyway.
   - WIP commit: `646de646777ba232762b603a7326a8e0cfdb5467` ("index on automatic-emails", parent `ceecb3b`). This is the staged-index half of `stash@{0}` (stash commit `43c548d`); both hold the same content. Inspect file names with `git show --stat 646de64` (avoid printing `.resend-api`).
5. It never worked end-to-end, and the effort stalled.

### Likely reasons it did not work (check in this order)
1. **Resend domain not verified.** `bowsforbattle.org` must show "Verified" in Resend (DKIM/SPF records added in the Squarespace DNS portal). If not verified, Resend rejects `forms@bowsforbattle.org`. Quick test workaround: `FORM_FROM = Bows for Battle Forms <onboarding@resend.dev>` (Resend test sender; only delivers to the Resend account owner's email).
2. **api mode never actually deployed** (see step 4 above).
3. `RESEND_API_KEY` missing for the Production context, or no redeploy after adding vars (functions only pick up env changes on a new deploy).
4. `ALLOWED_ORIGINS` missing the origin being tested (e.g. the `netlify.app` URL) -> 403.
5. If `FORM_TO` was saved with only jessehall + dustinlangsdorf (the value suggested at the time), Jason/Amber/Tanya will not receive auto-sent email. Update it to all 5 or delete it to use the defaults.

### Suggested path to finish
1. Resend dashboard: confirm `bowsforbattle.org` is Verified. If not, add the records Resend lists in Squarespace DNS. Do **not** touch the root MX records (Google Workspace).
2. Netlify -> Environment variables: verify the five vars above (fix `FORM_TO`, include `https://bowsforbattle.org,https://www.bowsforbattle.org` in `ALLOWED_ORIGINS`).
3. Add `console.error` logging in the function's catch so Netlify -> Logs -> Functions shows the Resend error text.
4. Enable api mode **through `build.py`** (e.g. inject the `BFB_FORM_CONFIG` script for `equip.html` in `write_all()`, or flip the default in `forms.js`). Bump `REV`, build, commit, push.
5. Submit the equip form on the live site (wait > 2.5 s before submitting). Check Netlify function logs and Resend's Emails log.
6. Once it works, enable for all forms. Consider keeping the mailto link only as a fallback when the API call fails.

### SECURITY WARNING
The stash on `automatic-emails` (`stash@{0}` / WIP commit `646de64`) contains a file named **`.resend-api`** that appears to hold the Resend API key. It was never pushed (stashes are local) and there is no `.gitignore` in the repo. Recommended:
- Treat the key as exposed: **rotate it** in Resend and update `RESEND_API_KEY` in Netlify.
- Drop the stash once nothing else in it is needed (it also holds the story .docx, `Reference/_extracted_story.txt`, `.vscode/settings.json`, and the equip.html test edit).
- Add a `.gitignore` covering `.resend-api`, `.env*`, `.venv/`, `.vscode/`.
- Never put API keys in the repo or in chat - Netlify env vars only.

---

## 6. Open items / known gaps

- Email auto-send (section 5) - top priority; some visitors cannot submit forms today.
- `README.md` is out of date (says draft/not live, forms inert).
- `Remaining-Placeholder-Checklist.md` lists placeholder content still to replace (legal, eligibility, donate amounts, sponsorship, equip/host/volunteer lists, transparency).
- `transparency.html` and `_what-happens.html` are generated but unlinked.
- No online donation/payment processor yet.
- `main` and the `staging` remote are stale; decide whether to sync or retire them.
- Squarespace website plan cancellation status unconfirmed.

---

## 7. Recent history (develop)

```
72f74e0 Fix Tanya Christensen name spelling and make form mailto open reliably with fallback link
e4bcbef Add Coaches & Volunteers page with Keven Stelzel profile
7acb921 Show crisis dial band on home page only
03d7df1 Add Tanya bio; Jason as Treasurer; 2 bios per row; remove pending-bios note
a300bc1 Add tanya@bowsforbattle.org to form recipients
225d094 Add amberhall@bowsforbattle.org to form recipients
d1b67ea Update Jesse bio/photo, refresh Dustin bio, fix portrait crop
6431110 Eligibility: simplify Sign Up, add Jason to form recipients, fix Share button URL
4c84a58 Eligibility: statewide WI, add Share with a Vet button (share.js)
7ddd511 Finalize launch content updates and add secure form pipeline
```
