# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally with Astro            |
| `npm run preview:worker`  | Test in Cloudflare `workerd` runtime locally      |
| `npm run deploy`          | Build & deploy to Cloudflare Workers production  |
| `npm run deploy:preview`  | Build & deploy a branch preview to Cloudflare    |
| `npm run generate-types`  | Generate TypeScript types for Cloudflare bindings|

## 🚀 Deployment & Previews

This project is configured for Cloudflare Workers with automated pull request deployment previews.

See [docs/DEPLOYMENT.md](file:///Users/marcochavez/Desktop/projects/business/ruiz-ent/docs/DEPLOYMENT.md) for full instructions on configuring GitHub Actions secrets (`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`) or dashboard integration.

## 📐 Spacing System

See [docs/SPACING.md](file:///Users/marcochavez/Desktop/projects/business/ruiz-ent/docs/SPACING.md) for layout rhythm and spacing rules.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
