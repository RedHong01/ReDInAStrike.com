import { mkdir, readFile, rm, cp, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"

const root = resolve(".")
const dist = join(root, "dist")
const docs = join(root, "docs")
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

const template = await readFile(join(root, "index.html"), "utf8")

async function writeSite(outRoot, { clean = false } = {}) {
  if (clean) await rm(outRoot, { recursive: true, force: true })
  await mkdir(outRoot, { recursive: true })
  await cp(join(root, "public"), outRoot, { recursive: true })
  await cp(join(root, "src"), join(outRoot, "src"), { recursive: true })

  for (const route of routes) {
    const html = template.replaceAll("%BASE%", baseFor(route))
    const outDir = route ? join(outRoot, route) : outRoot
    await mkdir(outDir, { recursive: true })
    await writeFile(join(outDir, "index.html"), html)
  }

  await writeFile(
    join(outRoot, "404.html"),
    template.replaceAll("%BASE%", "./")
  )
}

await writeSite(dist, { clean: true })
await writeSite(docs)

console.log(`Built ${routes.length} routes to ${dist} and ${docs}`)
