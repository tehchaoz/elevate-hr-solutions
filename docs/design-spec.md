# Elevate HR Solutions: design spec

Approved by the user in chat on 2026-11-17 ("go, build it"). Product truth lives in `../PRODUCT.md`.

## Goal
Mobile-first one-page site for Chelsea Shumaker's HR consultancy. Primary action: book the free intro call. Secondary: call 317-796-7914 or email.

## Direction (pinned from the client's business card)
- Ground: cream. Ink and structure: deep navy. Accent: card teal.
- Shapes lifted from the card: navy quarter-disc, teal sweep, dotted triangle, rounded corners, circular headshot with navy and teal rings.
- Type: Plus Jakarta Sans (geometric sans like the card), self-hosted. Display weight 700, tracking tightened with size.
- Hero device: "People", "Performance" and "Compliance" in teal inside the tagline.
- No faith messaging. Logo used exactly as supplied.
- No invented testimonials, metrics, pricing or process steps.

## Sections
Hero, credentials band, services (accordion, four services verbatim from profile), ways to work together (project / ongoing), why partner, about, FAQ (facts only), contact, footer.

## Motion (apple-design)
- One authored moment: hero load sequence (headline words rise, headshot springs in via `linear()` spring, teal sweep draws).
- Press feedback on pointer-down; hover lift on buttons.
- Translucent sticky nav with blur; services accordion animates height from its current state.
- Reduced motion and reduced transparency fall back to cross-fades and solid surfaces.

## Open items
Real Calendly URL (`CALENDLY_URL` in `js/main.js`), form endpoint (`FORM_ENDPOINT`), exact LinkedIn URL, domain, confirmation of brand colors, a higher-resolution logo and headshot (the PDF embeds a 265x131 logo and a 281x281 photo).
