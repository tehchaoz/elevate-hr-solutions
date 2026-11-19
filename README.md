# elevate-hr-solutions

One-page marketing site for Elevate HR Solutions (Chelsea Shumaker, PHR, Tampa, FL). Plain HTML/CSS/JS, no build step. Deploy the folder to any static host.

- `index.html`, `css/styles.css`, `js/main.js`: the site.
- `assets/`: `logo*.png` and `chelsea-headshot.jpg` extracted from the client's profile PDF (low resolution: 265x131 logo, 281x281 photo; ask for originals). `og-image.png` is a screenshot of the hero. Fonts: Plus Jakarta Sans, self-hosted.
- `PRODUCT.md`: product truth and what must not be invented. `docs/design-spec.md`: design decisions.
- Preview locally: `python3 -m http.server 4173` in this folder.

## Still needed from the client
1. Calendly URL: set `CALENDLY_URL` in `js/main.js` (booking buttons scroll to the contact form until then).
2. Form endpoint (e.g. Formspree): set `FORM_ENDPOINT`. Until then the form opens the visitor's email app.
3. Exact LinkedIn URL (card prints `elevate-hrsolutions`; site uses `linkedin.com/company/elevate-hrsolutions`).
4. Confirm domain `elevatehr.org` (used in canonical, sitemap and schema), and exact brand colors (estimated from a photo of the business card).
5. High-resolution logo and headshot. Real testimonials, if she wants them (none are invented).

## At launch (preview to production)
- Replace `https://tehchaoz.github.io/elevate-hr-solutions/` with `https://elevatehr.org/` in `index.html` (canonical, og tags, structured data).
- Remove the `noindex, nofollow` meta tag (the visible "design preview" footer line is already gone).

## Admin and publishing

`admin.html` (footer "Admin" link) lets the owner edit section colors, services, FAQ, team and testimonials (each with its own link), set the Calendly link, connect a form service that keeps intro-call requests, manage other admins, and change their own password.

**How edits reach the live site (no third-party backend):**

1. Admin edits are saved as a *draft* in the admin's browser (localStorage). A banner shows what is not live yet.
2. **Admin > Publish** commits `content.json` to this repo through the GitHub API. GitHub Pages rebuilds (about a minute) and every visitor gets the new content.
3. Public pages load `content.json` on every visit (`js/store.js`), cache the last copy to avoid flicker, and render it with text-only DOM calls. Colors, URLs and photo sources are validated before use. An empty `content.json` means "use the text built into the HTML".
4. Only `theme`, `services`, `faq`, `team`, `testimonials` and `settings` (Calendly link, form-service link, entries page link) are published. Admin accounts and password hashes are never written to `content.json`.

**One-time setup per publisher:** a GitHub fine-grained token limited to this repository with *Contents: Read and write* (steps are shown in Admin > Publish). The token is kept only in that browser (session by default, or "remember on this computer"). It is the real protection: without it nobody can publish, whatever the admin password is.

**Launch checklist:** if the repo moves or the default branch changes, edit `CFG` at the top of `js/store.js` (`repo`, `branch`, `file`). Each publish is a git commit, so any earlier version can be restored from GitHub history (`git revert <commit>`).

**Known limits:**
- Admin accounts, the password and the lockout live in each browser. The starting password hash is readable in the public repo, so treat the starting password as a placeholder. This is a convenience gate, not security; the token is the security.
- Two people publishing at once: the later publish warns if the live site changed since it opened Admin.
- Team photos are stored inside `content.json` (resized to 360 px). A large team makes the file bigger.
- Backup of the draft and admin list: Admin > Account > Download backup.
