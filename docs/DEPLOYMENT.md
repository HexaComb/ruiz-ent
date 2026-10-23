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
