// Upload a FrontRooms3D WebGL package to the R2 bucket the Worker serves.
//
//   node upload.mjs [packageDir] [--bucket frontrooms3d] [--prefix frontrooms3d/] [--dry-run]
//
// packageDir defaults to ../../public/frontrooms3d (the copy the website ships).
// Each Build/*.unityweb file's real compression (br or gzip) is read from the
// file and stored as the object's Content-Encoding, which the Worker uses.
// index.html goes up last, so the live page never points at files that are not
// there yet. Needs `npx wrangler login` first.

import { spawnSync } from "node:child_process"
import { readdirSync, statSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { unitywebEncoding } from "./lib/unityweb.mjs"

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const dryRun = args.includes("--dry-run")
const bucket = flag("--bucket", "frontrooms3d")
const prefix = flag("--prefix", "frontrooms3d/")
const positional = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && ["--bucket", "--prefix"].includes(args[i - 1])))
const packageDir = resolve(positional[0] || join(here, "..", "..", "public", "frontrooms3d"))

const WRANGLER_MAX = 315 * 1000 * 1000 // Wrangler uploads one object at a time, up to 315 MB.
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".svg": "image/svg+xml", ".wasm": "application/wasm",
}
const SKIP = new Set([".DS_Store", ".nojekyll"])

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    // macOS/iCloud files and conflict copies ("name 2.json", ".nojekyll 2") never ship.
    if (SKIP.has(e.name) || / \d+(\.[^.]+)?$/.test(e.name)) return []
    const full = join(dir, e.name)
    return e.isDirectory() ? walk(full) : [full]
  })
}


function ext(file) {
  const base = file.split(sep).pop()
  const dot = base.lastIndexOf(".")
  return dot > 0 ? base.slice(dot).toLowerCase() : ""
}

const files = walk(packageDir)
if (!files.some((f) => relative(packageDir, f) === "index.html")) {
  console.error(`No index.html in ${packageDir}: not a Unity WebGL package.`)
  process.exit(1)
}
const ordered = [...files.filter((f) => relative(packageDir, f) !== "index.html"), join(packageDir, "index.html")]

let total = 0
for (const file of ordered) {
  const rel = relative(packageDir, file).split(sep).join("/")
  const size = statSync(file).size
  total += size
  if (size > WRANGLER_MAX) {
    console.error(`${rel} is ${(size / 1e6).toFixed(0)} MB, over Wrangler's 315 MB upload limit. Use rclone or the S3 API for it.`)
    process.exit(1)
  }
  const cmd = ["wrangler", "r2", "object", "put", `${bucket}/${prefix}${rel}`, "--file", file, "--remote"]
  if (rel.endsWith(".unityweb")) {
    const encoding = unitywebEncoding(file)
    cmd.push("--content-type", "application/octet-stream")
    if (encoding) cmd.push("--content-encoding", encoding)
  } else {
    cmd.push("--content-type", TYPES[ext(file)] || "application/octet-stream")
  }
  console.log(`${dryRun ? "[dry run] " : ""}${rel}  ${(size / 1e6).toFixed(1)} MB  ${cmd.slice(6).join(" ").replace(file, "<file>")}`)
  if (dryRun) continue
  const r = spawnSync("npx", cmd, { cwd: here, stdio: "inherit" })
  if (r.status !== 0) {
    console.error(`Upload failed at ${rel}. Nothing after it was uploaded; index.html is uploaded last, so the live page is unchanged.`)
    process.exit(r.status || 1)
  }
}
console.log(`${dryRun ? "Would upload" : "Uploaded"} ${ordered.length} files, ${(total / 1e6).toFixed(1)} MB, to r2://${bucket}/${prefix}`)
