import { mkdir, readFile, rm, cp, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"

const root = resolve(".")
const dist = join(root, "dist")
const docs = join(root, "docs")
const faviconVersion = "20260904"
const routes = [
  "",
  "serialdeminer",
  "pitchfork",
  "analog-game",
  "myfridge",
  "assethub",
  "uiux-prototype",
  "bns_gdd",
  "service-game-ui",
  "alt-controller-2025-a",
  "service-game-ui-2",
  "alt-controller-2025-b",
  "game-prototype",
  "alt-controller-2025-c",
  "monologue",
  "ongoing-game-project",
  "narrative-design-document",
]

function baseFor(route) {
  return route ? "../" : "./"
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

function renderTemplate(base) {
  return template
    .replace(/    <!-- LOCAL_FAVICON_START -->[\s\S]*?<!-- LOCAL_FAVICON_END -->\n/, "")
    .replace("<!-- BUILD_FAVICONS -->", faviconLinks(base))
    .replaceAll("%BASE%", base)
}

const template = await readFile(join(root, "index.html"), "utf8")

async function writeSite(outRoot, { clean = false } = {}) {
  if (clean) await rm(outRoot, { recursive: true, force: true })
  await mkdir(outRoot, { recursive: true })
  await cp(join(root, "public"), outRoot, { recursive: true })
  await cp(join(root, "src"), join(outRoot, "src"), { recursive: true })

  for (const route of routes) {
    const html = renderTemplate(baseFor(route))
    const outDir = route ? join(outRoot, route) : outRoot
    await mkdir(outDir, { recursive: true })
    await writeFile(join(outDir, "index.html"), html)
  }

  await writeFile(join(outRoot, "404.html"), renderTemplate("./"))
}

await writeSite(dist, { clean: true })
await writeSite(docs)

console.log(`Built ${routes.length} routes to ${dist} and ${docs}`)
