import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { homedir, tmpdir } from "node:os"
import { join } from "node:path"
import { mkdir, writeFile } from "node:fs/promises"

const require = createRequire(import.meta.url)
const modules = join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules")
const { chromium, webkit } = require(join(modules, "playwright"))
const { PNG } = require(join(modules, "pngjs"))
const origin = process.argv[2] || "http://127.0.0.1:5173/"
const output = join(tmpdir(), "red-drawer-switch-audit")
await mkdir(output, { recursive: true })
const results = []
const errors = []
const settled = (page) => page.waitForFunction(() =>
  !document.documentElement.hasAttribute("data-project-preview-transition") &&
  !document.querySelector(".project-preview-expand-ghost, .project-preview-exit-ghost"))

async function openDrawer(page, index) {
  await page.goto(origin, { waitUntil: "domcontentloaded" })
  await page.evaluate(() => document.fonts.ready)
  const card = page.locator(`[data-project-card][data-index="${index}"]`)
  await card.click({ position: { x: 50, y: 50 } })
  await settled(page)
  await card.click({ position: { x: 50, y: 50 } })
  await page.waitForSelector('.project-detail-drawer[data-drawer-state="settled"]')
  await page.waitForTimeout(950)
  return card
}

async function checkSwitch(browser, engine, width, source, target, reduced = false) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" })
  page.on("pageerror", (error) => errors.push(`${engine}: ${error.message}`))
  await openDrawer(page, source)
  const next = page.locator(`[data-project-card][data-index="${target}"]`)
  await next.evaluate((el) => scrollTo({ top: scrollY + el.getClientRects()[0].top - 440, behavior: "instant" }))
  await page.waitForTimeout(1100)
  // Capture from the real click event, before the application mutates layout.
  // mouse.click avoids Playwright scrolling a large card into a new position.
  const point = await next.evaluate((el) => {
    window.__switchFrames = []
    window.addEventListener("click", () => {
      const read = () => {
        const ghost = document.querySelector(".project-preview-exit-ghost")
        const r = el.getClientRects()[0]
        return { time: performance.now(), top: r.top, y: scrollY,
          header: document.querySelector(".site-header").getClientRects()[0].bottom,
          ghost: !!ghost, ghostTop: ghost?.getClientRects()[0].top,
          clip: ghost && getComputedStyle(ghost).clipPath,
          expand: !!document.querySelector(".project-preview-expand-ghost") }
      }
      window.__switchBefore = read()
      const start = performance.now()
      const frame = () => {
        window.__switchFrames.push(read())
        if (performance.now() - start < 1250) requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }, { capture: true, once: true })
    const r = el.getClientRects()[0]
    return { x: r.left + Math.min(80, r.width / 2), y: r.top + 55 }
  })
  await page.mouse.click(point.x, point.y)
  await page.waitForTimeout(60)
  if (!reduced) await page.mouse.wheel(0, 20)
  await page.waitForTimeout(1350)
  const trace = await page.evaluate(() => ({ before: __switchBefore, frames: __switchFrames }))
  const first = trace.frames[0]
  const label = `${engine}-${width}-${source}-to-${target}${reduced ? "-reduced" : ""}`
  await writeFile(join(output, `${label}.json`), JSON.stringify(trace, null, 2))
  assert(Math.abs(first.top - trace.before.top) <= 2, `${label}: first paint moved ${first.top - trace.before.top}px`)
  assert(Math.abs(first.header - trace.before.header) <= 2, `${label}: compensation changed header direction`)
  if (!reduced) {
    const during = trace.frames.filter((f) => f.time - first.time < 140)
    assert(during.length > 2 && during.every((f) => f.ghost), `${label}: wheel removed reverse motion`)
    assert(trace.frames.some((f) => f.expand && f.time - first.time > 220), `${label}: reveal interrupted`)
    assert(new Set(during.map((f) => f.clip)).size > 2, `${label}: reverse clip did not advance`)
  }
  const last = trace.frames.at(-1)
  assert(!last.ghost && !last.expand, `${label}: orphaned motion layer`)
  assert.equal(await page.locator(".project-detail-drawer, .project-detail-invert-rule").count(), 0, `${label}: orphaned drawer`)
  assert.equal(await next.getAttribute("aria-expanded"), "true")
  await page.screenshot({ path: join(output, `${label}.png`) })
  results.push({ label, firstPaintDelta: first.top - trace.before.top, endTop: last.top })
  await page.close()
}

async function checkRule(browser, engine) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on("pageerror", (error) => errors.push(`${engine}: ${error.message}`))
  await openDrawer(page, 10)
  await page.evaluate(() => scrollBy({ top: 700, behavior: "instant" }))
  await page.waitForTimeout(1000)
  await page.mouse.move(4, 850)
  const box = await page.locator(".project-detail-invert-rule").boundingBox()
  assert(box && box.height === 1, `${engine}: drawer rule missing`)
  const blended = PNG.sync.read(await page.screenshot({ path: join(output, `${engine}-rule.png`) }))
  await page.locator(".project-detail-invert-rule").evaluate((el) => el.style.visibility = "hidden")
  const base = PNG.sync.read(await page.screenshot())
  let samples = 0
  const colors = new Set()
  for (let x = 180; x < 1100; x += 40) {
    const offset = (Math.round(box.y) * base.width + x) * 4
    colors.add(base.data.subarray(offset, offset + 3).join(","))
    for (let c = 0; c < 3; c++) {
      assert(Math.abs(blended.data[offset + c] + base.data[offset + c] - 255) <= 3,
        `${engine}: rule pixel ${x}/${c} does not invert underlying image`)
    }
    samples++
  }
  assert(colors.size > 8, `${engine}: pixel test must cross actual image content`)
  await page.locator(".project-detail-invert-rule").evaluate((el) => el.style.visibility = "")
  await page.locator(".project-detail-drawer").evaluate((el) => scrollTo({ top: scrollY + el.getClientRects()[0].bottom + 30, behavior: "instant" }))
  await page.waitForTimeout(900)
  assert.equal(await page.locator(".project-detail-invert-rule").isVisible(), false, `${engine}: rule outlived drawer`)
  assert.equal(await page.locator('[data-project-card][data-index="10"]').getAttribute("data-project-detail-header-exited"), "", `${engine}: header outlived drawer`)
  results.push({ label: `${engine}-pixel-inversion-and-boundary`, samples })
  await page.close()
}

try {
  for (const [name, launcher] of [["chromium", chromium], ["webkit", webkit]]) {
    const browser = await launcher.launch({ headless: true })
    try {
      for (const [width, source, target, reduced] of [[1280, 10, 12], [1280, 10, 8], [1280, 0, 2], [700, 10, 11], [430, 10, 12], [700, 10, 12, true]]) {
        await checkSwitch(browser, name, width, source, target, reduced)
        console.log("PASS", results.at(-1))
      }
      await checkRule(browser, name)
      console.log("PASS", results.at(-1))
    } finally { await browser.close() }
  }
  assert.deepEqual(errors, [])
} finally {
  await writeFile(join(output, "results.json"), JSON.stringify({ results, errors }, null, 2))
}
