// Local check of the Worker without Cloudflare: an R2 binding backed by a
// package folder on disk. node test/worker.test.mjs [packageDir]
import assert from "node:assert/strict"
import { createReadStream, existsSync, statSync } from "node:fs"
import { Readable } from "node:stream"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import worker from "../src/worker.js"
import { unitywebEncoding } from "../lib/unityweb.mjs"

const here = dirname(fileURLToPath(import.meta.url))
const packageDir = resolve(process.argv[2] || join(here, "..", "..", "..", "public", "frontrooms3d"))
const PREFIX = "frontrooms3d/"

function objectFor(key, withBody) {
  if (!key.startsWith(PREFIX)) return null
  const file = join(packageDir, key.slice(PREFIX.length))
  if (!existsSync(file) || !statSync(file).isFile()) return null
  const st = statSync(file)
  const etag = `${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}`
  const httpMetadata = file.endsWith(".unityweb") ? { contentType: "application/octet-stream", contentEncoding: unitywebEncoding(file) || undefined } : {}
  const o = { key, size: st.size, etag, httpEtag: `"${etag}"`, httpMetadata }
  if (withBody) o.body = Readable.toWeb(createReadStream(file))
  return o
}

const GAME = {
  async get(key, options = {}) {
    const o = objectFor(key, false)
    if (!o) return null
    const inm = options.onlyIf?.get?.("if-none-match")
    if (inm && inm === o.httpEtag) return o // precondition failed: metadata only, no body
    return objectFor(key, true)
  },
  async head(key) {
    return objectFor(key, false)
  },
}
const env = { GAME, PREFIX }
const call = (path, init = {}) => worker.fetch(new Request(`https://frontrooms3d.example.workers.dev${path}`, init), env)
const br = { "accept-encoding": "gzip, deflate, br, zstd" }

const build = (await import("node:fs")).readdirSync(join(packageDir, "Build"))
const wasm = build.find((f) => f.endsWith(".wasm.unityweb"))
const data = build.find((f) => f.endsWith(".data.unityweb"))
const framework = build.find((f) => f.endsWith(".framework.js.unityweb"))
let passed = 0
const ok = (name) => { passed++; console.log("ok  ", name) }

let r = await call("/")
assert.equal(r.status, 200); assert.match(r.headers.get("content-type"), /text\/html/); assert.equal(r.headers.get("cache-control"), "no-cache")
assert.match(await r.text(), /createUnityInstance/); ok("/ serves index.html, not cached")

r = await call("/Build/" + wasm, { headers: br })
assert.equal(r.headers.get("content-encoding"), "br"); assert.equal(r.headers.get("content-type"), "application/wasm")
assert.equal(r.headers.get("vary"), "Accept-Encoding"); assert.match(r.headers.get("cache-control"), /immutable/)
const bytes = Buffer.from(await r.arrayBuffer())
assert.equal(bytes.length, statSync(join(packageDir, "Build", wasm)).size); ok("wasm with br accepted: Content-Encoding br, application/wasm, raw bytes, immutable")

r = await call("/Build/" + framework, { headers: br })
assert.equal(r.headers.get("content-encoding"), "br"); assert.match(r.headers.get("content-type"), /text\/javascript/); await r.arrayBuffer(); ok("framework.js with br: text/javascript")

r = await call("/Build/" + data, { headers: br })
assert.equal(r.headers.get("content-encoding"), "br"); assert.equal(r.headers.get("content-type"), "application/octet-stream"); await r.body.cancel(); ok("data with br: octet-stream")

r = await call("/Build/" + wasm, { headers: { "accept-encoding": "gzip, deflate" } })
assert.equal(r.headers.get("content-encoding"), null); assert.equal(r.headers.get("content-type"), "application/octet-stream"); await r.arrayBuffer(); ok("wasm without br: no Content-Encoding, loader fallback")

r = await call("/Build/" + data, { method: "HEAD", headers: br })
assert.equal(r.status, 200); assert.equal(r.headers.get("content-length"), String(statSync(join(packageDir, "Build", data)).size)); assert.equal(r.body, null); ok("HEAD: length, no body")

const etag = (await call("/Build/" + wasm, { headers: br })).headers.get("etag")
r = await call("/Build/" + wasm, { headers: { ...br, "if-none-match": etag } })
assert.equal(r.status, 304); assert.equal(r.body, null); ok("If-None-Match → 304")

r = await call("/TemplateData/style.css")
assert.match(r.headers.get("content-type"), /text\/css/); assert.equal(r.headers.get("cache-control"), "public, max-age=3600"); await r.text(); ok("TemplateData: css, 1 h cache")

r = await call("/TemplateData")
assert.equal(r.status, 404); await r.text(); ok("folder without index.html → 404")

r = await call("/nope.txt"); assert.equal(r.status, 404); await r.text(); ok("missing → 404")
r = await call("/Build/" + wasm, { method: "POST" }); assert.equal(r.status, 405); await r.text(); ok("POST → 405")
r = await worker.fetch(new Request("https://x.workers.dev/%2e%2e/secret"), env); assert.equal(r.status, 404); await r.text(); ok("%2e%2e is collapsed by URL parsing → stays inside the prefix (404)")
r = await worker.fetch(new Request("https://x.workers.dev/..%2fsecret"), env); assert.equal(r.status, 400); await r.text(); ok("slash-encoded ../ → 400")

console.log(`${passed} passed`)
