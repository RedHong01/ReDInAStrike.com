// Frame-cost profiler for the event flow.
//
// Drives a scripted scroll gesture at several widths and reads Chrome's own
// layout/style/script counters around it, so an optimisation can be judged by
// numbers instead of by feel. Companion to audit-event-performance.mjs: that
// one asserts the section 11 contract (scan/timer counts), this one measures
// what a frame actually costs.
//
//   node scripts/perf-profile.mjs http://127.0.0.1:5173 [--json out.json] [--label name]
//
// Add --preview to expand a catalog card before scrolling, which is the state
// where the boundary/rule work is most expensive.
import { createRequire } from "node:module"
import { writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require("playwright")) } catch {
  ({ chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")))
}

const origin = process.argv[2] || "http://127.0.0.1:5173"
const jsonFlag = process.argv.indexOf("--json")
const jsonPath = jsonFlag > -1 ? process.argv[jsonFlag + 1] : null
const labelFlag = process.argv.indexOf("--label")
const runLabel = labelFlag > -1 ? process.argv[labelFlag + 1] : "run"
const withPreview = process.argv.includes("--preview")

const WIDTHS = [430, 940, 1280]
const SCROLL_FRAMES = 180
const SCROLL_STEP = 7

const browser = await chromium.launch({ headless: true })
const rows = []

function pick(metrics) {
  const map = Object.fromEntries(metrics.map((m) => [m.name, m.value]))
  return {
    layoutCount: map.LayoutCount ?? 0,
    recalcCount: map.RecalcStyleCount ?? 0,
    layoutMs: +(1000 * (map.LayoutDuration ?? 0)).toFixed(1),
    recalcMs: +(1000 * (map.RecalcStyleDuration ?? 0)).toFixed(1),
    scriptMs: +(1000 * (map.ScriptDuration ?? 0)).toFixed(1),
    taskMs: +(1000 * (map.TaskDuration ?? 0)).toFixed(1),
    nodes: map.Nodes ?? 0,
    listeners: map.JSEventListeners ?? 0,
  }
}

function delta(before, after) {
  const out = {}
  for (const key of Object.keys(before)) out[key] = +(after[key] - before[key]).toFixed(1)
  return out
}

async function profile(width, path = "/") {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))

  // Count how many times each hot global handler actually runs, and how many
  // forced synchronous layouts the page performs, so a "we coalesced it" claim
  // can be checked rather than trusted.
  await page.addInitScript(() => {
    const probe = { rectReads: 0, styleReads: 0, rafs: 0, scrollHandlers: 0, resizeHandlers: 0, wheelHandlers: 0, longFrames: 0 }
    const rect = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () { probe.rectReads++; return rect.call(this) }
    const styles = window.getComputedStyle
    window.getComputedStyle = function (...args) { probe.styleReads++; return styles.apply(this, args) }
    const raf = window.requestAnimationFrame
    window.requestAnimationFrame = function (cb) { probe.rafs++; return raf.call(window, cb) }
    const add = EventTarget.prototype.addEventListener
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      const hot = type === "scroll" || type === "resize" || type === "wheel"
      if (hot && (this === window || this === document || this === document.documentElement) && typeof listener === "function") {
        const key = `${type}Handlers`
        const wrapped = function (...args) { probe[key]++; return listener.apply(this, args) }
        return add.call(this, type, wrapped, options)
      }
      return add.call(this, type, listener, options)
    }
    window.__perfProbe = { probe, reset() { for (const k of Object.keys(probe)) probe[k] = 0 } }
  })

  await page.goto(new URL(path, origin).href, { waitUntil: "domcontentloaded" })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(2600)

  if (withPreview && path === "/") {
    await page.evaluate(async () => {
      scrollTo(0, 900)
      await new Promise((r) => setTimeout(r, 500))
      const cards = [...document.querySelectorAll(".project-card")]
      const card = cards.find((c) => {
        const r = c.getBoundingClientRect()
        return r.top > 120 && r.top < innerHeight - 160
      })
      card?.click()
    })
    await page.waitForTimeout(1800)
  }

  const client = await page.context().newCDPSession(page)
  await client.send("Performance.enable")

  // Settle first so first-paint work is not attributed to the scroll.
  await page.evaluate(() => scrollTo(0, 700))
  await page.waitForTimeout(1600)
  await page.evaluate(() => window.__perfProbe.reset())
  const before = pick((await client.send("Performance.getMetrics")).metrics)

  const frames = await page.evaluate(async ({ SCROLL_FRAMES, SCROLL_STEP }) => {
    const stamps = []
    let y = 700
    let last = performance.now()
    for (let i = 0; i < SCROLL_FRAMES; i++) {
      y += i < SCROLL_FRAMES / 2 ? SCROLL_STEP : -SCROLL_STEP
      scrollTo(0, y)
      await new Promise((resolve) => requestAnimationFrame(resolve))
      const now = performance.now()
      stamps.push(now - last)
      last = now
    }
    return stamps
  }, { SCROLL_FRAMES, SCROLL_STEP })

  const after = pick((await client.send("Performance.getMetrics")).metrics)
  const probe = await page.evaluate(() => ({ ...window.__perfProbe.probe }))

  const sorted = [...frames].sort((a, b) => a - b)
  const p = (q) => +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))].toFixed(2)
  const row = {
    label: `${runLabel}:${path === "/" ? "home" : path.replace(/\W+/g, "")}${withPreview && path === "/" ? "+preview" : ""}:${width}`,
    width,
    path,
    delta: delta(before, after),
    perFrame: {
      layout: +(delta(before, after).layoutCount / frames.length).toFixed(2),
      recalc: +(delta(before, after).recalcCount / frames.length).toFixed(2),
      rectReads: +(probe.rectReads / frames.length).toFixed(2),
      styleReads: +(probe.styleReads / frames.length).toFixed(2),
      rafs: +(probe.rafs / frames.length).toFixed(2),
    },
    handlerCalls: {
      scroll: probe.scrollHandlers,
      wheel: probe.wheelHandlers,
      resize: probe.resizeHandlers,
    },
    frameMs: { p50: p(0.5), p90: p(0.9), p99: p(0.99), max: +Math.max(...frames).toFixed(2) },
    nodes: after.nodes,
    listeners: after.listeners,
    errors,
  }
  rows.push(row)
  console.log(
    `${row.label.padEnd(30)} ` +
    `layout/f=${String(row.perFrame.layout).padStart(6)} recalc/f=${String(row.perFrame.recalc).padStart(6)} ` +
    `rect/f=${String(row.perFrame.rectReads).padStart(7)} gcs/f=${String(row.perFrame.styleReads).padStart(6)} ` +
    `raf/f=${String(row.perFrame.rafs).padStart(5)} ` +
    `scriptMs=${String(row.delta.scriptMs).padStart(7)} layoutMs=${String(row.delta.layoutMs).padStart(6)} ` +
    `recalcMs=${String(row.delta.recalcMs).padStart(6)} ` +
    `p90=${String(row.frameMs.p90).padStart(6)} max=${String(row.frameMs.max).padStart(7)}`,
  )
  if (errors.length) console.log(`  !! pageerror: ${errors.join(" | ")}`)
  await page.close()
}

for (const width of WIDTHS) await profile(width, "/")
await profile(1280, "/uiux-prototype/")

await browser.close()

if (jsonPath) {
  await writeFile(jsonPath, JSON.stringify({ label: runLabel, origin, rows }, null, 2))
  console.log(`\nwrote ${jsonPath}`)
}
