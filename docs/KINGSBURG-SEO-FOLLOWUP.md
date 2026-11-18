# Kingsburg SEO follow-up — November 2026

## Scope
- Preserve the existing homepage hero, media, and layout.
- Strengthen the **existing** Kingsburg page for driveway installation/replacement, patios, stamped concrete, block walls and larger engineering inquiries. This does not add thin keyword-only URLs.
- Link visitors to the existing concrete, masonry and engineering service pages, with a local on-page free-estimate CTA.
- Use only services already advertised by Ruiz. Existing site photos remain unassigned to any specific job location; there are no fabricated Kingsburg projects, reviews, prices, promises or additional offices.
- Shorten Kingsburg's 163-character meta description without changing its central positioning.

## Lead measurement: what is already implemented
The existing `QuoteBuilder.astro` calls `trackEvent('generate_lead', ...)` **once** only when `/api/contact` returns HTTP success and JSON `sent: true`. Failures and honeypot responses must not create a lead. The analytics helper sends a fixed `service_city` landing-page label and an allowlisted `project_category`; it never sends customer free text, addresses or contact information.

The checked OpenSEO GA4 property **Ruiz Main** (`properties/562216562`, web stream `G-G35MWF4BT4`) has `purchase`, `close_convert_lead` and `qualify_lead` as key events, but **not `generate_lead`**. That is a GA4 Admin property setting, not a change safely accomplished by shipping a frontend file. Do not add another `generate_lead` listener or count button clicks as submissions.

## Deployment/measurement acceptance
1. In GA4 Admin > Events / Key events, register **`generate_lead`** as a key event on Ruiz Main. Do not register `estimate_form_start` as a completed lead.
2. On deployed production, after confirming the Resend configuration and with permission to send a real inquiry, submit **one** test estimate form, verify API `sent: true`, and confirm a single `generate_lead` in GA4 DebugView / Realtime. No automated test should submit a real production lead.
3. Inspect `/service-areas/kingsburg/` in Search Console, confirm the HTTPS canonical and indexability, and compare page impressions/clicks and queries month-over-month.
4. Investigate why Search Console reports organic clicks while GA4 reports no Organic Search sessions; check consent/ad blocking, source attribution, and actual landing-page requests before claiming traffic or lead gains.
5. Obtain verified, permissioned Kingsburg job photos/details before identifying any photo as a local project. Monitor Maps rankings separately from organic results.

## Validation
Run `npm test`, `npm run build` and `npm run test:seo`. Confirm responsive page layout and the live `#quote-builder` anchor in preview. No hero files changed.
