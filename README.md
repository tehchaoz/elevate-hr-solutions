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

## Admin (preview only)

`admin.html` (footer "Admin" link) lets the owner try editing section colors, services, FAQ, team, testimonials (with links), the Calendly link, a form-service link, other admins and their password.

Edits are saved in the browser where they were made, so they are **not** shown to visitors. Publishing to the live site was built and then removed (git history: commit `ec794c0` and the Publish tab in `9b1b284`) because the site is expected to move to Wix, where the owner edits directly in Wix. Until then, set the Calendly link and form endpoint in `js/main.js` (`CALENDLY_URL`, `FORM_ENDPOINT`).

The starting login is `chelsea@elevatehr.org`; its password is stored only as a salted hash and must be changed at first log in. The admin password and lockout are browser-side and are not real security.
