# Arkonium — site arkonium.tech

Site statique Astro, bilingue FR/EN, blog-ready pour le devlog de la codebase.
Charte graphique : voir `08_Identite_visuelle` (Drive).

## Démarrage

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production -> dist/
```

## Structure

- `/` page d'accueil FR (langue par défaut, sans préfixe)
- `/en/` page d'accueil EN
- `/devlog/` liste des billets (FR)
- `src/content/devlog/*.md` — un fichier markdown par billet ; frontmatter :
  `title`, `date`, `numero`, `tag`, `description`
- `src/styles/global.css` — les jetons de la charte (couleurs, polices, règle cuivre/acier)
- `src/i18n/ui.ts` — chaînes de la nav et du pied de page

## À remplacer avant la mise en ligne

- L'adresse `contact@arkonium.tech` (ou la remplacer par un lien Calendly/Cal.com)
- Le rond « AO » par une vraie photo (section À propos)
- Les chiffres GroupeAlesco dans les piliers, une fois validés
- Le billet d'exemple du devlog

## Déploiement

Compatible Cloudflare Pages / Netlify / Vercel (build : `npm run build`, dossier : `dist`).
