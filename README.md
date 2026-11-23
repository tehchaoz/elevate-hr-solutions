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
- Replace `https://tehchaoz.github.io/elevate-hr-solutions/` with `https://elevatehr.org/` in `index.html` (canonical, og tags, structured data). The phone, email and location in the structured data are static text in `index.html`.
- Remove the `noindex, nofollow` meta tag (the visible "design preview" footer line is already gone).

## Admin removed; the site moves to Wix

The browser-only Admin page was removed. It could only save edits in the browser where they were made, so visitors never saw them. On Wix the owner edits text directly in the Wix editor and presses Publish. See `docs/wix-handoff.md` for the copy, colors, section order, files, the Admin-to-Wix map, the domain steps (GoDaddy) and the launch checklist. Earlier Admin versions are in git history if ever needed.

