import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { existsSync, statSync } from "node:fs"
import { extname, join, normalize, resolve } from "node:path"

const root = resolve(process.argv[2] || ".")
const port = Number(process.argv[3] || process.env.PORT || 5173)
const htmlPath = join(root, "index.html")
const faviconVersion = "20260824"

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".otf": "font/otf",
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

async function send(res, filePath, status = 200) {
  const ext = extname(filePath)
  let content = await readFile(filePath)
  if (ext === ".html") {
    content = Buffer.from(renderHtml(content.toString("utf8"), root.endsWith("dist") ? "./" : "/"))
  }
  res.writeHead(status, {
    "content-type": mime[ext] || "application/octet-stream",
    "cache-control": "no-store",
  })
  res.end(content)
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
      if (existsSync(publicPath)) filePath = publicPath
    }

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      await send(res, filePath)
      return
    }

    if (existsSync(htmlPath)) {
      await send(res, htmlPath)
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
