import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { mkdir, writeFile } from "node:fs/promises"
import { homedir, tmpdir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require("playwright")) } catch {
  ({ chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")))
}
const origin = process.argv[2] || "http://127.0.0.1:5174"
const baseline = process.argv.includes("--baseline")
const output = process.env.AUDIT_OUTPUT_DIR || join(tmpdir(), "red-event-performance-audit")
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
const errors = []

async function open(width = 1280, path = "/") {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  page.on("pageerror", (error) => errors.push(error.message))
  await page.addInitScript(() => {
    const counters = { boundaryScans: 0, settleTimers: 0, sweeps: 0 }
    const listenerAdds = { window: 0, document: 0 }
    const addEventListener = EventTarget.prototype.addEventListener
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (this === window) listenerAdds.window++
      if (this === document) listenerAdds.document++
      return addEventListener.call(this, type, listener, options)
    }
    const queryAll = Element.prototype.querySelectorAll
    Element.prototype.querySelectorAll = function (selector) {
      if (selector === ".project-card.is-filter-muted" && new Error().stack.includes("syncTrackedCards")) counters.boundaryScans++
      return queryAll.call(this, selector)
    }
    const timeout = window.setTimeout
    window.setTimeout = function (callback, delay, ...args) {
      if (new Error().stack.includes("scheduleSettledDitherWork")) counters.settleTimers++
      return timeout.call(this, callback, delay, ...args)
    }
    const raf = window.requestAnimationFrame
    window.requestAnimationFrame = function (callback) {
      if (new Error().stack.includes("scheduleObserverSweep")) counters.sweeps++
      return raf.call(this, callback)
    }
    window.__eventAudit = {
      counters,
      listenerAdds,
      reset() { for (const key of Object.keys(counters)) counters[key] = 0 },
    }
  })
  await page.goto(new URL(path, origin).href, { waitUntil: "domcontentloaded" })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(2200)
  return page
}

async function scrollProbe(page, label) {
  await page.evaluate(() => scrollTo(0, 700))
  await page.waitForTimeout(1800)
  await page.evaluate(() => window.__eventAudit.reset())
  const traces = await page.evaluate(async () => {
    const traces = []
    for (let i = 0; i < 120; i++) {
      scrollTo(0, 700 + (i < 60 ? i : 120 - i) * 6)
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))
      const canvases = [...document.querySelectorAll(".dither-reveal-canvas")].filter((canvas) => {
        const rect = canvas.getBoundingClientRect()
        return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight
      })
      const hidden = canvases.filter((canvas) =>
        getComputedStyle(canvas).visibility === "hidden" || getComputedStyle(canvas).opacity === "0",
      )
      const missed = hidden.filter((canvas) => {
        const card = canvas.closest(".project-card")
        const hoverOwnsSurface = card?.matches(":hover") && (
          card.getAttribute("data-active-color-motion") === "true" ||
          card.getAttribute("data-hover-binary-return") === "true" ||
          (
            card.classList.contains("is-muted-restore-intent") &&
            card.getAttribute("data-active-color-restore-ready") === "true"
          )
        )
        if (hoverOwnsSurface) return false
        return window.__RED_REVEAL_MOTION__?.paintViewportNow?.(card)?.visible === true
      })
      traces.push({
        visible: canvases.length,
        hidden: missed.length,
        hiddenCards: missed.map((canvas) => ({
          index: canvas.closest(".project-card").dataset.index,
          card: { ...canvas.closest(".project-card").dataset },
          canvas: { ...canvas.dataset },
          top: canvas.getBoundingClientRect().top,
          bottom: canvas.getBoundingClientRect().bottom,
        })),
      })
    }
    return traces
  })
  const counts = await page.evaluate(() => ({ ...window.__eventAudit.counters }))
  assert(traces.some((trace) => trace.visible), `${label}: boundary must exist`)
  if (!baseline) assert(traces.every((trace) => !trace.hidden), `${label}: no hidden boundary during continuous scrolling`)
  if (!baseline) {
    assert(counts.boundaryScans < 8, `${label}: no periodic full-catalog scan`)
    assert(counts.settleTimers < 35, `${label}: bounded settle timer allocation`)
  }
  results.push({ label, frames: traces.length, counts, hiddenFrames: traces.filter((trace) => trace.hidden) })
  console.log(`${label}: ${JSON.stringify(counts)}`)
}

try {
  for (const width of [430, 940, 1280]) {
    const page = await open(width)
    await page.locator('[data-nav-category="graphic"]').click()
    await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
    await page.waitForTimeout(1200)
    await scrollProbe(page, `scroll-${width}`)
    // Text/canvas child mutations must not provoke a detached-target sweep.
    await page.evaluate(() => window.__eventAudit.reset())
    await page.evaluate(async () => {
      const media = document.querySelector(".project-media")
      for (let i = 0; i < 12; i++) {
        const canvas = document.createElement("canvas")
        canvas.className = "dither-reveal-canvas"
        media.append(canvas)
        await new Promise((resolve) => requestAnimationFrame(resolve))
        canvas.remove()
        await new Promise((resolve) => requestAnimationFrame(resolve))
      }
    })
    await page.waitForTimeout(300)
    const mutationCounts = await page.evaluate(() => ({ ...window.__eventAudit.counters }))
    if (!baseline) assert.equal(mutationCounts.sweeps, 0, `${width}: no cleanup sweep for leaf overlay churn`)
    results.push({ label: `overlay-${width}`, counts: mutationCounts })
    console.log(`overlay-${width}: ${JSON.stringify(mutationCounts)}`)
    await page.close()
  }
  const detail = await open(1280, "/uiux-prototype/")
  await detail.evaluate(() => window.__eventAudit.reset())
  await detail.evaluate(async () => {
    for (let i = 0; i < 60; i++) {
      scrollTo(0, i * 10)
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
  })
  const detailCounts = await detail.evaluate(() => ({ ...window.__eventAudit.counters }))
  if (!baseline) assert.equal(detailCounts.settleTimers, 0, "detail page has no catalog settle work")
  results.push({ label: "detail-scroll", counts: detailCounts })
  console.log(`detail-scroll: ${JSON.stringify(detailCounts)}`)
  await detail.close()

  const routes = await open(1280)
  const listenerBaseline = await routes.evaluate(() => ({ ...window.__eventAudit.listenerAdds }))
  let listenerAfterFirstRoute = null
  for (let iteration = 0; iteration < 3; iteration++) {
    await routes.waitForFunction(() => !document.documentElement.dataset.homeReturnTransition)
    await routes.evaluate(() => document.querySelector("[data-project-card]")?.click())
    await routes.waitForFunction(() => document.querySelector(".project-card.is-project-preview"))
    await routes.waitForFunction(() => !document.documentElement.hasAttribute("data-project-preview-transition"))
    await routes.evaluate(() => document.querySelector("[data-project-card]")?.click())
    await routes.waitForFunction(() => document.querySelector(".detail-page"))
    await routes.evaluate(() => history.back())
    await routes.waitForFunction(() => document.querySelector(".catalog"))
    await routes.waitForFunction(() => !document.documentElement.dataset.homeReturnTransition)
    if (iteration === 0) {
      listenerAfterFirstRoute = await routes.evaluate(() => ({ ...window.__eventAudit.listenerAdds }))
    }
  }
  const listenerFinal = await routes.evaluate(() => ({ ...window.__eventAudit.listenerAdds }))
  // Playwright installs its own browser-side input listeners on first history
  // interaction. Subsequent route cycles must remain stable.
  assert.deepEqual(listenerFinal, listenerAfterFirstRoute, "SPA route cycles do not add global listeners")
  results.push({
    label: "route-listeners",
    baseline: listenerBaseline,
    afterFirstRoute: listenerAfterFirstRoute,
    final: listenerFinal,
  })
  console.log(`route-listeners: ${JSON.stringify(listenerFinal)}`)
  await routes.close()
  assert.deepEqual(errors, [], "page errors")
} finally {
  await writeFile(join(output, baseline ? "baseline.json" : "results.json"), JSON.stringify({ results, errors }, null, 2))
  await browser.close()
}
