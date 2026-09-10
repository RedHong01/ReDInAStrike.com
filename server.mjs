import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { createReadStream } from "node:fs"
import { existsSync, statSync } from "node:fs"
import { extname, join, normalize, resolve } from "node:path"

const root = resolve(process.argv[2] || ".")
const port = Number(process.argv[3] || process.env.PORT || 5173)
const htmlPath = join(root, "index.html")

// Single source of truth: read it from build.mjs so dev and build never drift.
// scripts/dev-server.py reads the same constant the same way.
const faviconVersion =
  (await readFile(join(import.meta.dirname, "scripts", "build.mjs"), "utf8"))
    .match(/faviconVersion\s*=\s*"([^"]+)"/)?.[1] ?? "20260904"

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".otf": "font/otf",
  ".woff2": "font/woff2",
}

function cleanPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0])
  const safe = normalize(decoded).replace(/^(\.\.[/\\])+/, "")
  return safe === "/" ? "/index.html" : safe
}

function faviconLinks(base) {
  return [
    `<link rel="icon" type="image/png" sizes="64x64" href="${base}favicon.png?v=${faviconVersion}" />`,
    `<link rel="icon" type="image/svg+xml" href="${base}favicon.svg?v=${faviconVersion}" />`,
    `<link rel="shortcut icon" href="${base}favicon.png?v=${faviconVersion}" />`,
    `<link rel="apple-touch-icon" sizes="180x180" href="${base}apple-touch-icon.png?v=${faviconVersion}" />`,
    `<link rel="apple-touch-icon-precomposed" sizes="180x180" href="${base}apple-touch-icon-precomposed.png?v=${faviconVersion}" />`,
    `<link rel="mask-icon" href="${base}favicon.svg?v=${faviconVersion}" color="#454545" />`,
  ].join("\n    ")
}

function renderHtml(html, base) {
  return html
    .replace(/    <!-- LOCAL_FAVICON_START -->[\s\S]*?<!-- LOCAL_FAVICON_END -->\n/, "")
    .replace("<!-- BUILD_FAVICONS -->", faviconLinks(base))
    .replaceAll("%BASE%", base)
}

async function send(req, res, filePath, status = 200) {
  const ext = extname(filePath)
  const stats = statSync(filePath)
  const isHtml = ext === ".html"
  const isVideo = ext === ".mp4" || ext === ".webm" || ext === ".mov"
  // Asset filenames are stable rather than content-hashed, so cache them for a
  // day without making an updated local build impossible to pick up.
  const cacheControl = isHtml ? "no-cache" : "public, max-age=86400"

  if (isVideo) {
    const range = req.headers.range
    const headers = {
      "content-type": mime[ext] || "application/octet-stream",
      "accept-ranges": "bytes",
      "cache-control": cacheControl,
    }
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range)
      if (match) {
        const start = match[1] ? Number(match[1]) : Math.max(0, stats.size - Number(match[2] || 0))
        const end = match[2] ? Number(match[2]) : stats.size - 1
        if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && start <= end && end < stats.size) {
          headers["content-range"] = `bytes ${start}-${end}/${stats.size}`
          headers["content-length"] = String(end - start + 1)
          res.writeHead(206, headers)
          if (req.method !== "HEAD") createReadStream(filePath, { start, end }).pipe(res)
          else res.end()
          return
        }
      }
      res.writeHead(416, { ...headers, "content-range": `bytes */${stats.size}` })
      res.end()
      return
    }
    res.writeHead(status, { ...headers, "content-length": String(stats.size) })
    if (req.method !== "HEAD") createReadStream(filePath).pipe(res)
    else res.end()
    return
  }

  let content = await readFile(filePath)
  if (ext === ".html") {
    content = Buffer.from(renderHtml(content.toString("utf8"), root.endsWith("dist") ? "./" : "/"))
  }
  res.writeHead(status, {
    "content-type": mime[ext] || "application/octet-stream",
    "cache-control": cacheControl,
    "content-length": String(content.byteLength),
  })
  if (req.method !== "HEAD") res.end(content)
  else res.end()
}

createServer(async (req, res) => {
  try {
    const requestPath = cleanPath(req.url || "/")
    let filePath = join(root, requestPath)

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, "index.html")
    }

    if (!existsSync(filePath)) {
      const publicPath = join(root, "public", requestPath)
      if (existsSync(publicPath)) {
        filePath = publicPath
        if (statSync(filePath).isDirectory()) filePath = join(filePath, "index.html")
      }
    }

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      await send(req, res, filePath)
      return
    }

    if (existsSync(htmlPath)) {
      await send(req, res, htmlPath)
      return
    }

    res.writeHead(404)
    res.end("Not found")
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" })
    res.end(error instanceof Error ? error.stack : String(error))
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Redinastrike code site: http://127.0.0.1:${port}`)
})
