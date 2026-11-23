# Elevate HR Solutions: Wix handoff

This site is the **design reference** for the Wix build. The page copy, colors, section order and files below are exactly what the reference shows. Wix cannot import this HTML, so the page is rebuilt in the Wix editor from this document.

Reference preview: https://tehchaoz.github.io/elevate-hr-solutions/ (kept until Wix is signed off). Source: the `main` branch of `tehchaoz/elevate-hr-solutions`.

## 1. What replaces the Admin page

The custom Admin is **removed** in this version. It only ever saved edits in one browser, so it could not update the live site. Wix does that natively: the owner clicks any text, types, and presses **Publish**.

| What the Admin did | In Wix |
|--------------------|--------|
| Edit any text, services, FAQ, team, testimonials | Click the text in the Wix editor and type. Publish. Everything is editable, including images. |
| Section colors | Wix site design: set the theme colors below once; change any section background in the editor. |
| Calendly link | Nothing to keep. Point the "Book intro call" buttons at the Calendly link (button settings, "link to a web address"), or embed Calendly. Until the account is active, point them at the contact section. |
| Intro call entries (form service) | Wix Forms: submissions go to the Wix inbox and by email to the owner. Replaces the Formspree idea. |
| Business info (phone, email, location, hours, socials) | Wix business info settings and the site footer/contact section. Edit once there. |
| Who can edit what | Wix site roles and permissions: invite people with limited access. Keep the owner as the full-access person. |

Nothing from the Admin needs to be carried over or re-built. No custom code is required for the site to work.

## 2. Brand

- **Logo:** `assets/logo.png` (on light backgrounds), `assets/logo-light.png` (on navy). Original file: `assets/logo-original.png` (265 × 131). Ask the client for the original vector or a larger file; the current PNGs are small.
- **Typeface:** Plus Jakarta Sans (700 for headings, regular for body, italic for the one supporting sentence under the hero headline). Check it is available in the Wix font list; if not, upload the two `.woff2` files in `assets/fonts/` as custom fonts, or pick the closest Wix font.
- **Colors:**

| Name | Hex | Use |
|------|-----|-----|
| Navy | `#16224f` | Text, buttons, dark sections |
| Deep navy | `#0f1838` | Footer |
| Cream | `#f7f4ea` | Page background |
| Paper | `#fdfbf4` | Cards on cream/mint |
| Light green (mint) | `#d6ece9` | Alternating section |
| Logo green | `#8fc8c2` | Headline words, shapes, accents. **Contrast warning:** on cream it is only about 1.7 to 1; the client asked for it, so keep it on large display text and shapes only, never small text. |
| Dark green | `#40827b` | Small accents and the accordion button when open |
| Muted navy | `#4a5578` | Secondary text |

- **Shape language:** large rounded cards, round buttons, soft circles in the logo green behind cards. No gradients, shadows or thin lines.

## 3. Pages, navigation and section order

**Navigation:** logo (left), Services, Working together, FAQ, then one button "Book intro call". Phone-size: a menu that opens a panel.

**Home page, in order:**

1. Hero: headline, one supporting sentence, name and title, headshot in a circle over a navy and green shape.
2. About Us (light green): heading, two paragraphs, then "Meet the team" with Chelsea's bio card (no photo; the photo is in the hero). This used to be a separate page; it is now the second section of the home page,.
3. Services (navy background): heading, sentence, four open-and-close items.
4. Working together (light green background): heading and three cards.
5. Why partner with us (cream): four short reasons in two columns.
6. Client testimonial (navy): heading, short quote, full testimonial card linking to the LinkedIn post.
7. FAQ (cream): five open-and-close questions.
8. Let's connect (navy): contact details and the form.
9. Footer (deep navy): logo, tagline, contact line, copyright.

There is **no separate About page** any more: one page only.

## 4. Copy (use exactly)

### Hero
- **Headline:** Your partner in People, Performance, and Compliance. (the words "People," "Performance," and "Compliance." are logo green)
- **Supporting sentence (italic):** Strategy with hands-on execution: a solid HR foundation and lasting results for your business.
- **Name:** Chelsea Shumaker, PHR
- **Title:** Founder / Principal HR Consultant · Tampa, Florida
- **Photo:** `assets/chelsea-headshot.jpg` (281 × 281), shown as a circle with a logo-green ring.

### Services: "The HR work, handled."
Four areas of support. Open any one to see what is included.

- **HR Infrastructure & Compliance:** Comprehensive HR audit; Employee handbook and policy updates; Employment law compliance and risk management; Process development and optimization; End-to-end M&A support
- **Talent Acquisition & Onboarding:** Customized hiring strategies and recruiting support; New hire orientation; Onboarding program development
- **Performance & Culture:** Employee engagement and retention strategies; Team-building initiatives; Behavioral assessments; Performance management systems; Coaching and leadership development; Workforce planning and organizational design; Customized training programs
- **Payroll, Benefits & Operations Support:** Payroll and benefits administration; Total compensation strategies; Bookkeeping and administrative support

### Working together: "Project, interim, or ongoing support."
- **One-time project partner:** Bring us in for a defined piece of HR work, such as an HR audit, an updated employee handbook, or a structured onboarding program.
- **Interim support:** Temporary HR coverage during a transition, such as personnel changes in your HR department. We step in to manage HR day to day, then scale back as operations return in-house.
- **Ongoing HR support:** Allow us to manage your HR needs, so you can focus on driving your business forward. We help you streamline your processes, stay compliant, and build a stronger organization.
(Cards: cream, white, and navy, each with a soft circle in the bottom right corner. All three circles must be the same size and position; the third is the logo green.)

### Why partner with us?
- **Strategic HR leadership:** Deep expertise in designing and strengthening HR infrastructure for multi-state organizations navigating growth, transformation, and increasing organizational complexity.
- **Trusted advisors:** We partner with leaders to navigate sensitive employee relations, organizational change, and high-stakes personnel matters with sound judgment, discretion, diplomacy, and integrity.
- **Cross-industry perspective:** Experience across engineering, healthcare, technology, hospitality, and construction environments enables us to apply proven practices and deliver adaptable solutions to each engagement.
- **Tailored approach:** We translate complex workforce challenges into practical, actionable strategies aligned with your business priorities, organizational culture, and long-term objectives.

### Client testimonial: "What a client says."
- **Pull quote:** "What stood out most was their incredible flexibility."
- **Supporting line:** Flexible support. Experienced guidance. The right expertise at the right time.
- **Full testimonial (card):**
  I am pleased to highly recommend Chelsea and her team at Elevate HR Solutions for their exceptional human resources consulting services.

  Our organization partnered with Elevate HR Solutions during a critical period of personnel changes within our HR department. What stood out most was their incredible flexibility. They seamlessly stepped into a full-scale HR management role and then scaled down to limited support as we successfully transitioned operations back in-house with a new HR Manager hire.

  Chelsea and her consultants were extremely responsive, highly available, and consistently reliable. They integrated into our workflow perfectly.
- **Name and title:** Marlin Knowles, Director of Operations, USI
- **Link:** "View the original on LinkedIn, August 7, 2026" → https://www.linkedin.com/posts/elevate-hrsolutions_elevatehrsolutions-hrconsulting-fractionalhr-activity-7496007592385748992-28cl (the whole card is clickable)

### FAQ: "Questions owners ask first."
- **Is the first call really free?** Yes. The introductory call is complimentary and carries absolutely no obligation.
- **What if I only need help with one thing?** That works. We can step in as a one-time project partner, such as an HR audit or a handbook update, or stay on as ongoing HR support.
- **Can you handle payroll, benefits and bookkeeping too?** Yes. Alongside HR, we offer payroll and benefits administration, total compensation strategies, and light bookkeeping and administrative support.
- **What kinds of businesses do you work with?** Our experience spans engineering, healthcare, hospitality, technology and construction, including multi-state organizations navigating growth, transformation, and increasing organizational complexity.
- **Where are you based?** Tampa, Florida. You can reach us at 317-796-7914 or chelsea@elevatehr.org.

### Let's connect.
Reach out to schedule a complimentary introductory call. Absolutely no obligation.

Phone 317-796-7914 · Email chelsea@elevatehr.org · LinkedIn https://www.linkedin.com/company/elevate-hrsolutions · Tampa, Florida

**Form: "Send a message"** with fields Your name (required), Email (required), Business name (optional), How can we help? (required), and the button "Send message". Error messages: "Please enter your name." / "Please enter an email like name@company.com." / "Please tell us how we can help."

### About Us (home page section)
- **Heading:** About Elevate HR Solutions
- **Paragraph 1:** Partnering with Elevate HR gives you access to a team of accomplished HR professionals who bring decades of collective experience and a broad range of expertise to every engagement. Our approach blends strategy with practical, hands-on execution as we create a solid foundation and lasting results for our clients.
- **Paragraph 2:** We also offer light bookkeeping and administrative support for businesses that need assistance beyond the traditional scope of HR services.
- **Meet the team (smaller heading under the paragraphs):** Chelsea Shumaker, PHR, Founder / Principal HR Consultant. "I've spent 22 years rolling up my sleeves in HR roles across a wide range of industries, helping organizations establish the right structure, navigate complex people challenges, and create a workplace where teams can thrive. I'm committed to helping companies build and sustain high-performing cultures while ensuring the people, processes, and HR infrastructure behind them operate effectively."

### Footer
Your Partner in People, Performance, and Compliance. · Chelsea Shumaker, PHR · Tampa, Florida · 317-796-7914 · chelsea@elevatehr.org · © 2026 Elevate HR Solutions. All rights reserved.

## 5. Files to upload to Wix

| File | Size | Use |
|------|------|-----|
| `assets/logo.png` | 300 × 148 | Header |
| `assets/logo-light.png` | 300 × 148 | Footer |
| `assets/chelsea-headshot.jpg` | 281 × 281 | Hero |
| `assets/og-image.png` | 1200 × 630 | Social share image |
| `assets/icon-512.png`, `icon-192.png`, `apple-touch-icon.png` | 512 / 192 / 180 | Site icon (Wix asks for one image, use `icon-512.png`) |
| `assets/fonts/*.woff2` | | Only if Plus Jakarta Sans is not in Wix |

## 6. Search and sharing (set in Wix SEO settings)

- **Home title:** Elevate HR Solutions | HR Consulting in Tampa, Florida
- **Home description:** use the sentence from `index.html` (`meta name="description"`).
- **Share image:** `og-image.png`. Add the business name, phone, email, Tampa FL address and the LinkedIn link in Wix business info so Wix writes the structured data.
- Do not publish with the "hide from search engines" setting on, once signed off.

## 7. Client inputs still needed

- [ ] Calendly link (once the account is active), or approval to use Wix Bookings.
- [ ] Original vector logo and a larger or original headshot.
- [ ] Exact brand colors if they differ from the logo.
- [ ] LinkedIn company page URL confirmed.
- [ ] Confirm the five FAQ answers and the services lists are final.
- [ ] More testimonials (with permission), if she has them.
- [ ] Business hours, if she wants them shown.
- [ ] Final sign-off on the Wix preview before the domain is switched.

## 8. Domain checklist (elevatehr.org at GoDaddy)

1. Check whether the business email (chelsea@elevatehr.org) is **hosted at GoDaddy** (Microsoft 365 or GoDaddy email). If it is, connect the domain to Wix by **editing DNS records only**; do **not** change the nameservers, or the email will stop.
2. In Wix: Settings, Domains, Connect a domain you already own. Wix shows the DNS records to add.
3. In GoDaddy DNS: change the root A record and the `www` CNAME to the Wix values. Leave MX, SPF, DKIM and any other email records alone.
4. Wait for DNS to update (usually minutes to a few hours), then confirm Wix shows the domain as connected and the HTTPS padlock appears.
5. Send a test email to and from the business address.
6. Set the preferred domain to `elevatehr.org` (without `www`, or the other way, but be consistent) in Wix.

## 9. Launch checklist

- [ ] Wix site matches this reference at desktop, tablet and phone width.
- [ ] Form submits and the owner receives the email.
- [ ] "Book intro call" buttons go to Calendly or the contact section.
- [ ] Domain connected, HTTPS working, email still works.
- [ ] Search-engine visibility switched on.
- [ ] Remove or redirect the GitHub preview: set the `tehchaoz.github.io` page to point visitors to `elevatehr.org`, or take the repo private/unpublish Pages.
- [ ] Owner can log in to Wix and publish a text change herself (test with one edit).
