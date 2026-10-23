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

## 3. GitHub Actions CI/CD & Deployment Previews

Two workflows are provided in `.github/workflows/`:

### A. Pull Request Deployment Previews (`.github/workflows/preview.yml`)
- **Trigger**: Any Pull Request (`opened`, `synchronize`, `reopened`, `closed`).
- **Behavior**:
  - Builds the site using Node 22.
  - Deploys an isolated Worker preview named `pr-<PR_NUMBER>` using Cloudflare's native Worker Previews API.
  - Automatically posts (or updates) a sticky comment on the pull request with:
    - **Preview URL (Branch)**: Persistent URL for that pull request that updates with each commit.
    - **Deployment URL (Immutable)**: Commit-specific URL for review.
  - When the PR is closed or merged, the preview environment is cleaned up automatically.

### B. Production Deployment (`.github/workflows/deploy.yml`)
- **Trigger**: Push to the `main` branch or manual `workflow_dispatch`.
- **Behavior**: Builds the project and deploys to the production Cloudflare Worker.

---

## 4. Setting Up GitHub Secrets

To enable GitHub Actions automated deployments and preview comments, add two secrets to your repository at **Settings $\rightarrow$ Secrets and variables $\rightarrow$ Actions**:

1. **`CLOUDFLARE_API_TOKEN`**:
   - Go to [Cloudflare Dashboard $\rightarrow$ My Profile $\rightarrow$ API Tokens](https://dash.cloudflare.com/profile/api-tokens).
   - Click **Create Token**.
   - Use the **Edit Cloudflare Workers** template (or custom token with `Account: Workers Scripts: Edit`, `Account: Workers KV Storage: Edit`, and `Account: Workers R2 Storage: Edit` permissions).
2. **`CLOUDFLARE_ACCOUNT_ID`**:
   - In Cloudflare Dashboard, select your account.
   - Go to **Workers & Pages** in the sidebar.
   - Copy the **Account ID** shown on the right-hand side.

---

## 5. Alternative: Cloudflare Dashboard Git Integration (Zero-Config Builds)

If you prefer connecting your GitHub repository directly in the Cloudflare dashboard instead of GitHub Actions:

1. In the Cloudflare Dashboard, go to **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Workers** (or select your Worker).
2. Go to **Settings** $\rightarrow$ **Build** $\rightarrow$ **Branch control** and connect GitHub repository `HexaComb/ruiz-ent`.
3. Set build configuration:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variable**: `NODE_VERSION=22`
4. Enable **Preview Builds** under Branch Control to automatically receive preview URLs on pull requests.
