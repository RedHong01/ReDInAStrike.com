import { mkdir, readFile, rm, cp, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"

const root = resolve(".")
const dist = join(root, "dist")
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

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await cp(join(root, "public"), dist, { recursive: true })
await cp(join(root, "src"), join(dist, "src"), { recursive: true })

const template = await readFile(join(root, "index.html"), "utf8")

for (const route of routes) {
  const html = template.replaceAll("%BASE%", baseFor(route))
  const outDir = route ? join(dist, route) : dist
  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, "index.html"), html)
}

await writeFile(
  join(dist, "404.html"),
  template.replaceAll("%BASE%", "./")
)

console.log(`Built ${routes.length} routes to ${dist}`)
