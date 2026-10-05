# FrontRooms3D on Cloudflare (R2 + Worker)

The FrontRooms3D WebGL package is served by a Cloudflare Worker in front of an R2 bucket,
so the browser gets `Content-Encoding: br` and decodes Unity's Brotli files natively.
The rest of the website stays on GitHub Pages and embeds the game from the Worker's address.

**Why not GitHub Pages:** the data file is ~200 MB. GitHub refuses files over 100 MB without
Git LFS, and Pages serves LFS files as 134-byte pointers, so the game cannot load there.
Pages also cannot set `Content-Encoding`. **Why not Cloudflare Pages:** 25 MiB per-file limit.
**Why R2:** no per-file limit, free egress, 10 GB free storage.

Measured 2026-10-03 (cold start, same package, local server): JavaScript decompression
13.9 s / 13.7 s → native Brotli 4.5 s / 4.1 s.

## One-time setup (Red)

1. Sign in to (or create) a Cloudflare account at https://dash.cloudflare.com.
2. Open **R2 Object Storage** once. Cloudflare asks for a payment method the first time R2 is
   used; it is a verification step and the free tier (10 GB storage, free egress) is not billed.
3. In this folder, run `npx wrangler login` and approve the browser prompt.

## Publish (after setup)

```bash
cd deploy/frontrooms3d-cloudflare
npx wrangler r2 bucket create frontrooms3d   # first time only
node upload.mjs                              # uploads ../../public/frontrooms3d, index.html last
npx wrangler deploy                          # prints https://frontrooms3d.<subdomain>.workers.dev
```

`node upload.mjs --dry-run` lists what would be uploaded. Another package folder can be passed
as the first argument. Wrangler uploads files up to 315 MB each; the script stops if one is larger.

## Check

```bash
node test/worker.test.mjs     # local, no Cloudflare: headers, 304, 404, traversal
curl -sI -H "Accept-Encoding: br" https://frontrooms3d.<subdomain>.workers.dev/Build/<hash>.wasm.unityweb
# expect: content-encoding: br, content-type: application/wasm
```

## Website cutover (after the Worker answers)

- `src/main.js`: `asset()` must pass absolute URLs through unchanged, and the FrontRooms 3D
  project's `webglEmbed` becomes the Worker URL.
- Stop shipping the broken Pages copy: leave `frontrooms3d/` out of `docs/` and stop tracking
  its LFS files (`.gitattributes`), then rebuild (`npm run build`) and push. A local copy in
  `public/frontrooms3d/` can stay for the dev server, which now sends `Content-Encoding: br` too.

## Updating the game

Build with **FrontRooms 3D → Cloud Build WebGL**, copy the package into `public/frontrooms3d/`
(or pass its folder to `upload.mjs`), run `node upload.mjs`. Build files are content-hashed, so
old and new versions never collide; `index.html` switches over last.
