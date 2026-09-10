# ReDInAStrikE Code Site

This is a GitHub-ready static code version of the current Framer site.

## Local

Double-click **`~/Applications/ReDInAStrikE.app`** (drag it to the Dock once and
it is a single click from then on). It guarantees exactly one local server and
opens the site in your default browser — reusing the existing tab rather than
piling up new ones.

The app serves the working tree directly, so whatever is saved in `src/` and
`public/` is what you see; no build step is involved.

From the terminal:

```bash
./scripts/serve-local.sh            # start/reuse the server, then open the window
./scripts/serve-local.sh --status   # what is running right now
./scripts/serve-local.sh --stop     # stop every local server for this project
./scripts/make-mac-app.sh           # rebuild the .app (after moving the project
                                    # or changing public/favicon.svg)
```

Environment overrides: `REDINASTRIKE_PORT` (default `5173`) and
`REDINASTRIKE_BROWSER` (`default` | `safari` | `chrome` | `system`). Chrome gets
a true chrome-less `--app` window; Safari has no such mode, so it opens a normal
window — use Safari's **File → Add to Dock** if you want a chrome-less web app.

`npm run dev` still runs the original node server on the same port, if node is
installed. The app deliberately uses `scripts/dev-server.py` instead, which
needs nothing beyond the python3 that ships with macOS; both render identical
HTML.

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

## Preserve playable project pages

DAD (`/ongoing-game-project/`), Slow’em Down (`/game-prototype/`), and Curtain
(`/bns_gdd/`) include local Unity games alongside their case-study text. Keep
`projectPlayableMarkup()` in the case-study renderer when changing the article
layout. The homepage drawer reuses that renderer; an Access link alone does not
replace the embedded game.

After changing the detail renderer or a game package, build the site and run:

```sh
npm run audit:playable -- http://127.0.0.1:4174
```

The check starts all three Unity builds, verifies fullscreen and narrow-screen
bounds, and checks that closing a drawer removes its game frame. Replace game
packages as matched HTML/loader/framework/data/WASM sets. Slow’em Down's copied
package hashes are recorded in its `package-verification.json`.
