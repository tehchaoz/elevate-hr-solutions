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
- Remove the `noindex, nofollow` meta tag and the "design preview" footer line.

## Admin (demo)

`admin.html` (footer "Admin" link) lets the owner edit section colors, services, FAQ, team members, other admins and their own password.

- **Browser-only.** Edits are saved in localStorage, so they show only in the browser where they were made, the same as the Lutz Country Store demo. Live publishing and real protection need a server.
- The starting login is `chelsea@elevatehr.org`. The starting password is stored only as a salted PBKDF2 hash in `js/store.js` and must be changed at first log in. Anyone can read that hash in the public repo, so treat the starting password as a placeholder.
- New admins get a temporary password and must choose their own. Five wrong tries lock the screen for five minutes (this lock is also browser-side).
- `js/store.js` holds the content store and applies saved edits to the public pages. `js/admin.js` and `css/admin.css` are the admin screen.
- Backup: Admin > Account > Download backup.
