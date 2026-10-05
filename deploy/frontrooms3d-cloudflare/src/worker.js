// Serves the FrontRooms3D Unity WebGL package from an R2 bucket.
//
// Why a Worker: the package's data file is ~200 MB (over the 25 MiB per-file
// limit of Cloudflare Pages, over GitHub's 100 MB file limit), and Unity's
// Build/*.unityweb files are already Brotli-compressed. Sent with
// `Content-Encoding: br` the browser decodes them natively; without it Unity's
// loader decompresses ~200 MB in JavaScript, about 3x slower to start
// (13.8 s vs 4.3 s cold, measured 2026-10-03).
//
// Objects are uploaded by upload.mjs, which records each .unityweb file's real
// compression (br or gzip) as the object's Content-Encoding metadata.

const HASHED = /\/Build\/[0-9a-f]{32}\./ // nameFilesAsHashes: content-addressed, safe to cache forever

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
}

function extOf(path) {
  const slash = path.lastIndexOf("/")
  const dot = path.lastIndexOf(".")
  return dot > slash ? path.slice(dot).toLowerCase() : ""
}

// Build/<hash>.wasm.unityweb → the type of what is inside (.wasm, .js, .data).
function innerType(path) {
  return TYPES[extOf(path.slice(0, -".unityweb".length))] || "application/octet-stream"
}

function accepts(request, encoding) {
  return new RegExp(`(^|[\\s,])${encoding}(\\s*(;|,|$))`).test(request.headers.get("accept-encoding") || "")
}

function cacheControl(path) {
  if (HASHED.test(path)) return "public, max-age=31536000, immutable"
  if (path.endsWith(".html")) return "no-cache"
  return "public, max-age=3600"
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } })
    }
    const url = new URL(request.url)
    let path
    try {
      path = decodeURIComponent(url.pathname)
    } catch {
      return new Response("Bad request", { status: 400 })
    }
    if (path.split("/").includes("..")) return new Response("Bad request", { status: 400 })
    if (path.endsWith("/")) path += "index.html"
    const key = (env.PREFIX || "") + path.replace(/^\/+/, "")

    const object = await env.GAME.get(key, { onlyIf: request.headers })
    if (object === null) {
      // A folder asked for without its trailing slash: send it to the folder.
      if (!extOf(path) && (await env.GAME.head(`${key}/index.html`))) {
        return Response.redirect(`${url.origin}${url.pathname}/${url.search}`, 301)
      }
      return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } })
    }

    const headers = new Headers()
    headers.set("etag", object.httpEtag)
    headers.set("cache-control", cacheControl(path))
    headers.set("x-content-type-options", "nosniff")

    let manual = false
    if (path.endsWith(".unityweb")) {
      headers.set("vary", "Accept-Encoding")
      const encoding = object.httpMetadata?.contentEncoding
      if (encoding && accepts(request, encoding)) {
        // Pass the stored bytes through untouched; the browser decodes them.
        headers.set("content-encoding", encoding)
        headers.set("content-type", innerType(path))
        manual = true
      } else {
        // Unity's loader decompresses it itself (decompression fallback).
        headers.set("content-type", "application/octet-stream")
      }
    } else {
      headers.set("content-type", TYPES[extOf(path)] || object.httpMetadata?.contentType || "application/octet-stream")
    }

    // A conditional request whose precondition failed: R2 returns no body.
    if (!object.body) return new Response(null, { status: 304, headers })
    if (request.method === "HEAD") {
      headers.set("content-length", String(object.size))
      return new Response(null, { headers })
    }
    return new Response(object.body, { headers, encodeBody: manual ? "manual" : "automatic" })
  },
}
