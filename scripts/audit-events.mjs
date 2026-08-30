import { readdir, readFile } from "node:fs/promises"
import { join, resolve } from "node:path"

const root = resolve(".")
const srcDir = join(root, "src")
const files = (await readdir(srcDir))
  .filter((name) => name.endsWith(".js"))
  .sort()

const eventNames = new Map()
const rows = []

function count(source, pattern) {
  return [...source.matchAll(pattern)].length
}

function collectEvents(file, source) {
  const pattern = /addEventListener\(\s*["'`]([^"'`]+)["'`]/g
  for (const match of source.matchAll(pattern)) {
    const event = match[1]
    const list = eventNames.get(event) || []
    list.push(file)
    eventNames.set(event, list)
  }
}

for (const file of files) {
  const source = await readFile(join(srcDir, file), "utf8")
  collectEvents(file, source)

  rows.push({
    file,
    listeners: count(source, /addEventListener\(/g),
    mutation: count(source, /new\s+MutationObserver\s*\(/g),
    resize: count(source, /new\s+ResizeObserver\s*\(/g),
    intersection: count(source, /new\s+IntersectionObserver\s*\(/g),
    raf: count(source, /requestAnimationFrame\s*\(/g),
    timers: count(source, /(?:setTimeout|setInterval)\s*\(/g),
    customEvents: count(source, /new\s+CustomEvent\s*\(/g),
  })
}

const activeRows = rows.filter((row) =>
  row.listeners || row.mutation || row.resize || row.intersection || row.raf || row.timers || row.customEvents,
)

console.log("\nEvent-flow surface by src module\n")
console.table(activeRows)

const hotEvents = new Set([
  "scroll",
  "resize",
  "wheel",
  "touchmove",
  "pointermove",
  "mousemove",
])

const fanout = [...eventNames.entries()]
  .map(([event, owners]) => ({
    event,
    listeners: owners.length,
    modules: [...new Set(owners)].join(", "),
    hot: hotEvents.has(event) ? "yes" : "",
  }))
  .sort((a, b) => b.listeners - a.listeners || a.event.localeCompare(b.event))

console.log("\nGlobal/local event fan-out\n")
console.table(fanout)

const observerTotal = activeRows.reduce(
  (sum, row) => sum + row.mutation + row.resize + row.intersection,
  0,
)
const listenerTotal = activeRows.reduce((sum, row) => sum + row.listeners, 0)

console.log(`\nSummary: ${listenerTotal} addEventListener calls, ${observerTotal} observer constructions across ${files.length} JS modules.`)
console.log("Tip: inspect hot events with multiple owning modules first, then broad subtree MutationObservers.")
