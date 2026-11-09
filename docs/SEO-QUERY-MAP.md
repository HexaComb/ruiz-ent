# Premium + family copy / search-intent map

Reviewed November 2, 2026. This is a proposed query map, not measured keyword volume, ranking or a promise of results. Hero component, hero media, shared styles, navigation and behavior remain unchanged.

| Search intent / plausible query | Page section |
| --- | --- |
| General engineering contractor Central Valley; industrial, commercial, residential and custom projects | Title, description, services intro, contractor FAQ, family story, footer |
| Concrete contractor Central Valley; masonry contractor Central Valley | Specialty descriptions, service directory and specific service FAQs |
| Concrete patio contractor; concrete driveway contractor; pool deck concrete | Services directory, custom concrete card, FAQ |
| Stamped concrete Central Valley | Services directory, custom concrete card, FAQ |
| Block wall contractor; retaining wall contractor Central Valley | Masonry directory, FAQ |
| Natural stone masonry; architectural stone; brick work | Stone card, masonry directory |
| Concrete sidewalks; commercial concrete flatwork | Sidewalk card, engineering/public works |
| 3/8-inch concrete pump service | Pump service card and existing service FAQ |
| Free concrete estimate Central Valley; how long will concrete work take | Process, estimate section, FAQ |
| Family concrete contractor; Ruiz Family Enterprises reviews | Family story and unchanged customer quotations |
| Concrete contractor in Kingsburg, CA | Dedicated `/service-areas/kingsburg/` guide, prioritized in hub and homepage links |
| Concrete and masonry services in Fresno, Madera, Visalia, Fowler and Hanford | Five city guides with individual project-planning copy and official local resources |

## Evidence and approach

- Company service list: https://ruizfamilyhardscapes.biz/
- Company contact location: https://ruizfamilyhardscapes.biz/contact-us
- Existing copy sources: CONTENT-SOURCES.md. Current main's source-linked project cards and engineering scope are preserved.
- Public search results sampled for Kingsburg concrete/patio/masonry intent showed local service pages including https://valenciavalleyconcrete.net/ and https://www.ransomconstruction.net/home.html. These establish query intent, not Ruiz service coverage or competitor keywords to copy.
- Commercial/public works intent sampled against https://kerncountycustomconcrete.com/services/commercial-and-public-works and https://www.grahamconcrete.com/public-works.
- Google's supplied guide recommends useful natural-language content, anticipating customer wording, descriptive headings, titles and links: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- AI search guidance does not require special AI files or special schema: https://developers.google.com/search/docs/appearance/ai-features

## Boundaries and launch follow-ups

- November 9 client direction supersedes the old corridor: serve Kingsburg, Fresno, Madera, Visalia, Fowler and Hanford, with no public walk-in office. City guides must answer project-planning questions and must not invent city-specific projects, testimonials, offices or regulatory claims.
- Review quotations and provenance notices remain intact. No invented reviews or ratings/schema.
- Form submission is implemented through `/api/contact`; runtime setup and delivery caveats are documented in `docs/DEPLOYMENT.md`. No new forms or live test messages are introduced by the SEO work.
- Every indexable page uses a self-canonical on the existing HTTPS non-www production domain, with matching OG URL and sitemap entry. Preview URLs do not replace production canonicals. Recheck redirects, indexability and Search Console after an authorized launch.
- Test script's stale CSLB A/DIR/Fresno/Clovis/Visalia expectations were replaced with actual main-branch supported copy. No such claims were reintroduced.

## November 9 implementation and measurement

- Kingsburg focuses on concrete-contractor intent while retaining masonry and general engineering context. Exact-city keyword-volume gaps are unknown, not zero; no traffic or ranking promises are made.
- Homepage and hub link directly to all six pages. Each guide supplies services, a distinct planning checklist, an official municipal resource, relevant questions and a direct inquiry route. No page claims a local job or local customer without evidence.
- Shared JSON-LD uses one Organization and city-level Service/Breadcrumb entities, with no fabricated street address, hours, ratings or current-license-status assertions.
- Build verification: `npm test`, `npm run build`, `npm run test:seo`; browser regression coverage lives in `scripts/service-area-preview.mjs` and the matching GitHub workflow.
- GA4 uses the build-rendered canonical page path, preserving city-page reporting while retaining existing UTM filtering and excluding arbitrary missing-page paths and form values.
- After publication, verify the sitemap in Search Console and inspect priority URLs. Indexing and search performance require observation over time; adding pages does not guarantee rankings.

## November 8 lead-focused service pages (review PR)

- New /services/ overview and three distinct intent pages: /services/concrete/, /services/masonry/, and /services/general-engineering/.
- Each page has its own title, description, H1, existing site photography with descriptive alt text, relevant service copy, organization-linked Service/Breadcrumb schema, six-city internal links and an on-page estimate request form.
- The shared QuoteBuilder accepts a default project type, preserving the unchanged homepage default and existing Resend endpoint and confirmed-success GA4 generate_lead event. A form submission still depends on production Resend configuration; this PR does not claim live delivery tests.
- Homepage service-directory headings, navigation, footer services and city guide cards link to the new service pages; the homepage hero itself is unchanged.
- The six authorized city guides are Kingsburg, Fresno, Madera, Visalia, Fowler and Hanford. Do not add Selma or Clovis from the older search strategy without explicit coverage confirmation.
- OpenSEO competitive research suggests commercial-intent concrete and masonry topics, but the monthly volume estimates were largely U.S.-scoped and may group close variants. No ranking or lead lift is guaranteed.
- After review/merge: confirm all generated pages deploy, check their URLs and sitemap in Search Console, confirm the contact endpoint works on the production Worker, and mark GA4 generate_lead as a key event in the GA4 property if not already configured.

## November 9 service-page review fixes

- Rechecked the latest saved [Competitive Landscape report, November 8](https://app.openseo.so/p/cf8803e0-942b-4de5-aed0-2f6c0c125514/reports/85d93fa4-6b69-4e90-8066-a3fc0abb3ce4). Its immediate opportunity is locally relevant concrete and masonry service pages, genuine work evidence and completed estimate requests. This review keeps that intent, the three service specialties, six approved cities and homepage hero unchanged.
- Shared header, mobile-menu and footer estimate links now stay on pages that contain a form, preserving the selected service, draft input and campaign query. The service hub, city guides and missing pages retain the homepage form fallback.
- Service navigation uses fixed GA4 labels for the service hub and three service routes; no query, free-form path or form value is included in event labels. Confirmed-success-only generate_lead behavior is unchanged.
- Browser regression coverage now includes all four service routes at 1440, 1024, 768, 390 and 320 pixels, repeated estimate CTAs, retained form drafts/defaults/campaigns, menu dismissal, history, navigation tracking and no-JavaScript form defaults. It blocks the contact endpoint and sends no live estimate requests.
