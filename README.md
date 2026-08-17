# ReDInAStrikE Code Site

This is a GitHub-ready static code version of the current Framer site.

## Local

```bash
npm run dev
```

Open `http://127.0.0.1:5173`.

## Build

```bash
npm run build
```

The generated site is written to `dist/`. For GitHub Pages branch deploys, the
current build is also committed in `docs/`.

## Fonts

The site packages Minion Pro Regular in `public/fonts/` and loads it through
`@font-face`, so the typography is stable after deploying to GitHub Pages.

## GitHub Pages

This repo uses the free GitHub Pages project URL:

```text
https://redhong01.github.io/ReDInAStrike.com/
```

Enable **Settings -> Pages** with:

```text
Source: Deploy from a branch
Branch: main
Folder: /docs
```

Leave **Custom domain** empty unless you later buy and configure a domain.
