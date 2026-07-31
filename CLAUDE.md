# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bilingual (FR/EN) static marketing site for Arkonium (arkonium.tech), built with **Astro 5** and TypeScript. No backend, no client-side framework — pure static site generation with scoped component styles and minimal JS for interactivity.

## Commands

```bash
npm run dev       # Dev server at http://localhost:4321
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

### Routing & i18n

Astro file-based routing with built-in i18n. French is the default locale with **no URL prefix** (`/`), English lives under `/en/`. This is configured in `astro.config.mjs` with `prefixDefaultLocale: false`.

Translation strings for nav/footer are in `src/i18n/ui.ts`. The `t(lang)` helper returns a typed accessor: `const tr = t(lang); tr('nav.approche')`.

### Content Collections (Devlog)

Blog posts are markdown files in `src/content/devlog/`. Schema defined in `src/content.config.ts` with Zod:
- Required: `title` (string), `date` (date), `numero` (string), `tag` (string)
- Optional: `description` (string), `draft` (boolean)

Posts with `draft: true` are filtered out in page queries. Dynamic routing via `src/pages/devlog/[...slug].astro` using `getStaticPaths()`.

### Design System

Brand tokens live in `src/styles/global.css` as CSS custom properties, following the `08_Identite_visuelle` brand doc (Google Drive). Key conventions:

- **Colors:** `--creme`, `--cuivre` (copper/accent), `--graphite` (dark bg), `--acier` (steel/blue, used on dark backgrounds), `--anthracite` (text)
- **Fonts:** `--font-display` (Fraunces serif), `--font-body` (Public Sans), `--font-mono` (IBM Plex Mono)
- **Rule:** Cuivre (copper) accents on light backgrounds, acier (steel) accents on graphite backgrounds (`.zone-graphite`)
- **Utility classes:** `.conteneur` (container), `.btn` / `.btn-plein` / `.btn-contour`, `.carte` (card), `.etiquette` (mono eyebrow label), `.barre` (copper bar)

### Layout

`src/layouts/Base.astro` wraps all pages — accepts `lang`, `titre`, `description` props. Contains header/nav and footer. Pages pass content via the default slot.

### Naming Conventions

The codebase uses **French naming** for variables, CSS classes, components, and content: `billets` (posts), `billet`, `preuves` (proofs), `.barre-nav`, `BandePreuves.astro`. Follow this convention.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) auto-deploys on push to `main`: builds with Node 22, rsyncs `dist/` to OVH server. Secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `DEPLOY_PATH`.
