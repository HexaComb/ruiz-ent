# Cloudflare Workers Deployment & Preview Guide

This project is configured to deploy directly to **Cloudflare Workers** using the official Astro Cloudflare adapter (`@astrojs/cloudflare`) and Cloudflare's modern Static Assets engine.

---

## 1. Quick Start Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start standard local Astro development server with HMR |
| `npm run build` | Build the project for production (`dist/` directory) |
| `npm run preview` | Preview built static assets locally with Astro |
| `npm run preview:worker` | Build and run locally in Cloudflare's `workerd` runtime (`wrangler dev`) |
| `npm run deploy` | Build and deploy directly to production on Cloudflare Workers |
| `npm run deploy:preview` | Build and deploy a branch preview to Cloudflare Workers |
| `npm run generate-types` | Regenerate TypeScript definitions for Cloudflare bindings |

---

## 2. Architecture & Configuration

- **Adapter**: `@astrojs/cloudflare` in [astro.config.mjs](file:///Users/marcochavez/Desktop/projects/business/ruiz-ent/astro.config.mjs)
- **Wrangler Configuration**: [wrangler.jsonc](file:///Users/marcochavez/Desktop/projects/business/ruiz-ent/wrangler.jsonc)
  - `name`: `ruiz-ent`
  - `main`: `@astrojs/cloudflare/entrypoints/server`
  - `assets`: `{ "directory": "./dist", "binding": "ASSETS" }`
  - `compatibility_flags`: `["global_fetch_strictly_public", "nodejs_compat"]`

---

## 3. Direct Cloudflare Git Integration (Zero-Config Setup)

By connecting your GitHub repository directly in Cloudflare, deployments and deployment previews work out-of-the-box without configuring GitHub Action secrets:

1. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages** $\rightarrow$ **Create Application**.
2. Choose **Connect to Git** and authorize your repository: `HexaComb/ruiz-ent`.
3. Set the build configuration:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. Under **Environment Variables**, add:
   - **Variable name**: `NODE_VERSION`
   - **Value**: `22` (required to fulfill Node `>=22.23.4` in `package.json`)
5. Save and deploy.

### Automated Pull Request Previews
Under **Settings $\rightarrow$ Build $\rightarrow$ Branch Control**, Cloudflare automatically:
- Triggers builds for every pull request and non-production branch.
- Generates isolated, production-like preview URLs.
- Automatically posts sticky preview links as comments on your GitHub pull requests via Cloudflare's GitHub App.

## Contact form email (Resend)

The estimate form posts to `/api/contact`, an on-demand Astro endpoint running in the existing Cloudflare Worker. The rest of the site stays prerendered. The endpoint sends plain-text notifications with all contact and project details:

- **From:** `Ruiz Family Hardscapes <submission@ruizfamilyhardscapes.biz>`
- **To:** `ruizfamilyent@gmail.com`
- **Reply-To:** the customer's email address, so replying in Gmail reaches the customer.

### Production setup

1. Add `ruizfamilyhardscapes.biz` in [Resend Domains](https://resend.com/domains), publish the DNS records Resend provides, and wait for verification. Preserve existing mail records; use the exact record names supplied by Resend.
2. Create a Resend API key with sending access for that domain.
3. Deploy the code on `main` using the existing Cloudflare deployment pipeline first. The `/api/contact` endpoint adds a Worker to the previously static-only deployment. Until this deployment finishes, Cloudflare may say variables cannot be added to a Worker with only static assets.
4. After deployment, reopen **Workers & Pages → ruiz-ent → Settings → Variables and Secrets**. Add a **Secret** named `RESEND_API_KEY`, paste the key there, and deploy/save the change. This must be a Worker runtime secret, not only a build environment variable.
5. Submit an estimate, confirm receipt in `ruizfamilyent@gmail.com`, and check that Reply addresses the submitted customer email.

Alternatively, from this repository, run `npx wrangler secret put RESEND_API_KEY` and paste the key into its interactive prompt. This updates the deployed Worker secret. Never put the value in source, Wrangler config, chat, a PR, or a shell command argument.

No API key is needed to build or deploy the site. Keep `RESEND_API_KEY` out of Wrangler’s `secrets.required`: that setting blocks the first Worker deployment before the dashboard allows you to add a runtime secret. The endpoint reads the secret at request time through Astro’s server-only `getSecret()` helper. A deployment without the runtime secret returns a helpful submission error instead of claiming an email was sent. Resend acceptance is not a guarantee of inbox delivery; use the Resend email dashboard to investigate delivery issues.

### Local development and previews

For optional local delivery testing, copy `.dev.vars.example` to `.dev.vars` and enter a testing key locally. `.dev.vars` and environment-specific variants are ignored by Git. Run `npx astro dev --background`, and manage it with `npx astro dev status`, `npx astro dev logs`, and `npx astro dev stop`.

Keep production credentials out of preview environments unless preview submissions should send real emails to the production inbox. Configure a secret separately for any isolated preview Worker that needs to send email.

The endpoint enforces input and body-size limits, rejects cross-origin browser submissions, ignores honeypot submissions, and uses a Cloudflare rate-limit binding (five attempts per client IP per minute, per Cloudflare location). Provider errors are logged without credentials or customer details. The form preserves entries after errors and prevents concurrent submissions while a request is pending.

Run `npm test` for validation, fixed sender/recipient, reply-to, abuse controls, missing configuration, and provider failure checks. These tests stub outbound Resend calls and do not send real email.
