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

Push this folder to a GitHub repository, then enable **Settings -> Pages** with:

```text
Source: Deploy from a branch
Branch: main
Folder: /docs
```

The intended production domain is `redinastrike.com` (`ReDInAStrike.com` is the
same domain at the DNS level). GitHub's **Custom domain** setting is the source
of truth; the repo also includes `public/CNAME` and `docs/CNAME` so the intended
domain stays documented in the source and copied into static artifacts.

In GitHub, set **Settings -> Pages -> Custom domain** to:

```text
redinastrike.com
```

At the domain registrar, point the apex domain to GitHub Pages:

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

Optional `www` redirect:

```text
www  CNAME  <your-github-username>.github.io
```
