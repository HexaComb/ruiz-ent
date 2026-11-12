# Kingsburg-first SEO and lead tracking — November 11, 2026

## Objective
Earn qualified non-branded searches in **Kingsburg, California** and convert them into completed free on-site estimate requests. Fresno and the other five client-approved service-area pages remain available, but Kingsburg is the immediate optimization priority.

## Implemented in this change
- Kingsburg SEO title emphasizes **concrete contractor** while the copy also covers masonry and general engineering, without implying a retail storefront or additional location.
- All six city guides keep estimate visitors on the same page using the existing accessible /api/contact form, including header, mobile-menu and footer estimate links. The project-city input defaults to that guide's city **but remains editable**.
- Kingsburg includes two existing Ruiz site images. Their job locations are not asserted to be Kingsburg, and no fabricated city-specific reviews, job counts, guarantees or office addresses were added.
- Kingsburg FAQ addresses new/replacement driveways and commercial engineering inquiries.
- The form sends **estimate_form_start**, **estimate_form_error**, and **generate_lead** GA4 events. Successful leads remain gated on a 2xx API response with `sent: true`; a blocked honeypot or unsuccessful delivery never counts as a lead.
- GA4 form-event labels use an allowlisted **service_city** (landing-page context), **project_category** (selected fixed radio choice) and, for errors, **error_category**. No typed project address, name, phone, email, message, free-text city or raw URL is attached to events.

## Steps outside GitHub
1. **GA4:** In Ruiz Main (property `562216562`), verify that `generate_lead` appears after a controlled successful test. Mark it as a **key event**, if not already marked. Configure custom dimensions for `service_city` and `project_category` if reporting by these parameters is desired. Don't count `estimate_form_start` as a completed lead. Browser tests do not send live inquiries.
2. **Resend and Cloudflare:** Verify that `RESEND_API_KEY` is configured on the production Worker. Send one explicitly authorized real form submission and confirm acceptance/delivery. No API keys belong in GitHub.
3. **Google Search Console:** Inspect `https://ruizfamilyhardscapes.biz/service-areas/kingsburg/`, check its chosen canonical/indexing status after deployment, request indexing when useful, and review page-filtered search terms/CTR monthly.
4. **OpenSEO:** Add non-branded Kingsburg mobile organic terms such as `concrete contractor kingsburg ca`, `masonry contractor kingsburg ca`, `concrete driveway kingsburg ca`, and `block wall contractor kingsburg ca`. Track Google Maps visibility separately; rank tracker positions for "ruiz" phrases measure brand discovery, not non-branded demand.
5. **Real local proof:** Ask the client for permission to label verified Kingsburg project photos, the type of work, and an accurate one- or two-sentence job description. Replace generic project captions only after this proof is supplied. Request genuine reviews through normal methods without incentives or review gating.

## How to judge progress
Use Search Console impressions, clicks and query mix for the Kingsburg page; then GA4 organic landing sessions and confirmed `generate_lead` key events by landing city. Treat `service_city` as **the guide viewed**, not a verified customer property location. Compare monthly after sufficient data; do not promise rank or lead gains.

## Test and release
Run `npm test`, `npm run build`, and `npm run test:seo`. The service-area browser check confirms the form appears on all six city guides, city defaults are accurate, the Kingsburg CTA stays on its own page, and no page overflows at supported viewports. Once merged, validate production URLs, the actual form delivery and the GA4 key-event configuration.
