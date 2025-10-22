This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Raw Materials Module

- Ouvrez `/raw-materials` pour la liste des matières. Les colonnes et filtres dynamiques restent disponibles.
- Cliquez sur une ligne pour ouvrir la nouvelle vue détail persistante (`/raw-materials/[id]?q=...`) avec la barre transverse Précédent/Suivant.
- Depuis la vue détail, pressez `⌘K` (ou `Ctrl+K`) pour lancer la palette de recherche, essayer des tokens comme `inci:tocopherol cas:10191-41-0`, et naviguer dans les résultats.
- Naviguez jusqu’à la section **CAS / EINECS** via la nav latérale (`g`, `c`, `d`, `t`), puis ajoutez/éditez des couplages dans la grille (validation CAS, sources obligatoires).
- Le switcher propose aussi les vues sauvegardées, récents et favoris (mémorisés en localStorage).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
