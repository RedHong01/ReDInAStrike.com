import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { mkdir, writeFile } from "node:fs/promises"
import { homedir, tmpdir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
function dependency(name) {
  try { return require(name) } catch {
    return require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules", name))
  }
}
const { chromium } = dependency("playwright")
const { PNG } = dependency("pngjs")
const origin = process.argv[2] || "http://127.0.0.1:5173"
const motionOnly = process.argv.includes("--motion-only")
const motionRepeats = Math.max(1, Number(process.env.AUDIT_MOTION_REPEATS) || 1)
const output = process.env.AUDIT_OUTPUT_DIR || join(tmpdir(), "red-responsive-audit")
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
const errors = []
const viewports = [
  [320, 850], [430, 932], [640, 900], [641, 900], [700, 900],
  [701, 900], [940, 820], [980, 820], [981, 820], [1180, 820],
  [1280, 900], [1440, 900], [1024, 1366], [1366, 1024], [1180, 1366],
]

async function open(viewport, path = "/", options = {}) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, ...options })
  page.on("pageerror", (error) => errors.push(`${viewport.width} ${path}: ${error.message}`))
  // Geometry assertions must not accidentally validate a projected cache entry.
  await page.addInitScript(() => {
    window.__auditRect = Element.prototype.getBoundingClientRect
  })
  await page.goto(new URL(path, origin).href, { waitUntil: "domcontentloaded" })
  await page.locator(".site-main").waitFor()
  await page.evaluate(() => document.fonts.ready)
  return page
}

async function settlePreview(page) {
  await page.waitForFunction(() =>
    !document.documentElement.hasAttribute("data-project-preview-transition") &&
    !document.querySelector(".project-preview-exit-ghost"),
  )
}

async function previewSnapshot(card) {
  return card.evaluate((element) => {
    const rect = window.__auditRect.call(element)
    const row = element.closest(".project-row")
    const copy = element.querySelector(".project-preview-copy")
    const text = [...copy.querySelectorAll("h2, p, span")].map((node) => {
      const style = getComputedStyle(node)
      const r = window.__auditRect.call(node)
      return {
        className: node.className, tag: node.tagName, text: node.textContent,
        size: parseFloat(style.fontSize), leading: parseFloat(style.lineHeight),
        font: style.fontFamily, spacing: parseFloat(style.letterSpacing) || 0,
        overflow: node.scrollWidth > node.clientWidth + 1,
        outside: r.left < rect.left - 1 || r.right > rect.right + 1,
      }
    })
    const rules = ["::before", "::after"].map((pseudo) => {
      const style = getComputedStyle(element, pseudo)
      return {
        width: parseFloat(style.width), height: parseFloat(style.height),
        left: style.left, right: style.right, top: style.top, bottom: style.bottom,
        content: style.content, display: style.display,
      }
    })
    const sibling = [...row.children].find((node) => node !== element)
    const siblingRect = sibling && window.__auditRect.call(sibling)
    return {
      width: innerWidth, left: rect.left, right: rect.right,
      top: rect.top, bottom: rect.bottom, padding: getComputedStyle(element).paddingTop,
      single: matchMedia("(max-width: 980px), (orientation: portrait)").matches,
      rowPosition: getComputedStyle(row).position,
      siblingVisible: sibling && getComputedStyle(sibling).display !== "none",
      followingSiblingTop: element.nextElementSibling === sibling ? siblingRect.top : null,
      rules, text,
      order: [...document.querySelectorAll("[data-project-card]")].map((node) => node.dataset.index),
      active: document.querySelectorAll("[data-project-card].is-project-preview").length,
      ghosts: document.querySelectorAll(".project-preview-exit-ghost").length,
      duration: getComputedStyle(element).getPropertyValue("--project-preview-duration").trim(),
    }
  })
}

function checkPreview(snapshot, label) {
  assert(Math.abs(snapshot.left) < 1 && Math.abs(snapshot.right - snapshot.width) < 1, `${label}: full bleed bounds`)
  assert.equal(snapshot.padding, "0px", `${label}: preview has no sibling-divider inset`)
  for (const [index, rule] of snapshot.rules.entries()) {
    assert.equal(rule.display, "block", `${label}: rule ${index} display`)
    assert(Math.abs(rule.width - snapshot.width) < 1, `${label}: rule ${index} width`)
    assert.equal(rule.height, 1, `${label}: rule ${index} thickness`)
    assert.equal(index ? rule.bottom : rule.top, "0px", `${label}: rule ${index} edge`)
  }
  assert.equal(snapshot.active, 1, `${label}: one active preview`)
  assert.equal(snapshot.ghosts, 0, `${label}: no outgoing snapshot`)
  assert.equal(snapshot.duration, "420ms", `${label}: shared preview timing`)
  assert.equal(snapshot.siblingVisible, snapshot.single, `${label}: sibling visibility`)
  assert.equal(snapshot.rowPosition, snapshot.single ? "static" : "sticky", `${label}: pin policy`)
  assert.deepEqual(snapshot.order, Array.from({ length: 16 }, (_, i) => String(i)), `${label}: order`)
  if (snapshot.single && snapshot.followingSiblingTop !== null) {
    assert(snapshot.followingSiblingTop >= snapshot.bottom, `${label}: next card follows preview`)
  }
  for (const text of snapshot.text) {
    assert(!text.overflow && !text.outside, `${label}: text overflow: ${text.text}`)
    assert.equal(text.spacing, 0, `${label}: tracking`)
    if (text.tag === "H2") {
      assert([34, 42, 48].includes(text.size), `${label}: title scale`)
      assert(text.font.includes("Red EB Garamond"), `${label}: serif title`)
    } else {
      assert(Math.abs(text.leading - text.size - 2) < 0.1, `${label}: caption/body leading`)
    }
  }
}

function checkRulePixels(buffer, label, edge) {
  const png = PNG.sync.read(buffer)
  let dark = 0
  const count = png.width - 8
  for (let x = 4; x < png.width - 4; x++) {
    const hit = [edge - 2, edge - 1, edge, edge + 1, edge + 2].some((y) => {
      if (y < 0 || y >= png.height) return false
      const offset = (y * png.width + x) * 4
      return png.data[offset] < 190 && png.data[offset + 1] < 190 && png.data[offset + 2] < 190
    })
    if (hit) dark++
  }
  assert(dark / count > 0.95, `${label}: painted edge ${edge} covers ${(100 * dark / count).toFixed(1)}%`)
}

async function checkPaintedRules(page, card, label) {
  for (const edge of ["top", "bottom"]) {
    await card.evaluate((element, edge) => {
      const rect = window.__auditRect.call(element)
      window.scrollTo({ top: scrollY + rect[edge] - innerHeight * 0.6, behavior: "instant" })
    }, edge)
    await page.waitForTimeout(350)
    await page.waitForFunction(() => document.documentElement.dataset.headerMotion !== "moving")
    await page.waitForTimeout(120)
    const y = await card.evaluate((element, edge) => window.__auditRect.call(element)[edge], edge)
    const buffer = await page.screenshot()
    await writeFile(join(output, `${label}-${edge}.png`), buffer)
    checkRulePixels(buffer, label, Math.round(y))
  }
}

async function auditLayoutSystems() {
  for (const [width, height] of viewports) {
    const page = await open({ width, height })
    const indices = [0, 2, 1, ...([430, 940].includes(width) ? [6, 15] : [])]
    for (const index of indices) {
      const card = page.locator("[data-project-card]").nth(index)
      await card.click({ position: { x: 100, y: 100 } })
      await settlePreview(page)
      const label = `${width}x${height}-card${index}`
      const snapshot = await previewSnapshot(card)
      checkPreview(snapshot, label)
      await checkPaintedRules(page, card, label)
      results.push({ label, ...snapshot })
    }
    await page.close()
    console.log(`PASS previews ${width}x${height}`)
  }

  const resizing = await open({ width: 1280, height: 900 })
  const resizingCard = resizing.locator("[data-project-card]").first()
  await resizingCard.click({ position: { x: 100, y: 100 } })
  await settlePreview(resizing)
  for (const [width, height] of [[940, 820], [430, 932], [1024, 1366], [1366, 1024]]) {
    await resizing.setViewportSize({ width, height })
    await resizing.waitForTimeout(800)
    const label = `resize-${width}x${height}`
    checkPreview(await previewSnapshot(resizingCard), label)
    await checkPaintedRules(resizing, resizingCard, label)
  }
  await resizing.close()
  console.log("PASS live breakpoint / orientation changes")

  for (const width of [320, 430, 641, 700, 701, 940, 1280]) {
    const viewport = { width, height: 932 }
    const home = await open(viewport)
    const homeWidth = await home.locator(".catalog").evaluate((e) => e.getBoundingClientRect().width)
    await home.close()
    const titles = []
    for (const path of ["/serialdeminer/", "/pitchfork/", "/ongoing-game-project/"]) {
      const page = await open(viewport, path)
      const detail = await page.locator(".detail-shell, .framer-derived-shell, .framer-case-shell").evaluate((shell) => {
        const heading = shell.querySelector("h1")
        const intro = shell.querySelector(".framer-derived-intro")
        const style = getComputedStyle(heading)
        return {
          width: shell.getBoundingClientRect().width,
          titleSize: style.fontSize, titleLeading: style.lineHeight,
          titleOverflow: heading.scrollWidth > heading.clientWidth + 1,
          introColumns: intro ? getComputedStyle(intro).gridTemplateColumns.split(" ").length : null,
          overflow: [...shell.querySelectorAll("h1,h2,p,li")].filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent),
        }
      })
      assert(Math.abs(detail.width - homeWidth) < 1, `${width} ${path}: shared content bounding`)
      assert(!detail.titleOverflow && !detail.overflow.length, `${width} ${path}: text overflow ${detail.overflow}`)
      if (detail.introColumns && detail.width <= 760) assert.equal(detail.introColumns, 1, `${width}: container layout`)
      titles.push(detail.titleSize)
      results.push({ label: `${width}-${path}`, ...detail })
      await page.close()
    }
    assert.equal(new Set(titles).size, 1, `${width}: shared detail title scale`)
    console.log(`PASS detail systems ${width}`)
  }

}

async function auditCatalogMotion(width, repeat) {
    const page = await open({ width, height: 932 })
    await page.locator('[data-nav-category="graphic"]').click()
    await page.waitForFunction(() => document.querySelector(".active-color-snow-canvas"))
    await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
    await page.waitForTimeout(650)
    const card = page.locator(".project-card.is-filter-muted").first()
    await card.scrollIntoViewIfNeeded()
    await page.mouse.move(0, 0)
    await page.waitForTimeout(500)
    await card.hover()
    await page.waitForFunction(() => document.querySelector('[data-active-color-motion="true"] .active-color-snow-canvas'))
    await page.mouse.move(0, 0)
    await page.waitForTimeout(1200)
    const traces = []
    for (const delta of [...Array(8).fill(80), ...Array(6).fill(-80)]) {
      await page.mouse.wheel(0, delta)
      await page.waitForTimeout(45)
      traces.push(await page.evaluate(() => {
        const visible = [...document.querySelectorAll(".dither-reveal-canvas")].filter((el) => {
          const r = el.getBoundingClientRect()
          return r.bottom > 0 && r.top < innerHeight
        })
        return {
          visible: visible.length,
          hidden: visible.filter((el) => getComputedStyle(el).opacity === "0" || getComputedStyle(el).visibility === "hidden").length,
          hiddenCards: visible.filter((el) => getComputedStyle(el).opacity === "0" || getComputedStyle(el).visibility === "hidden").map((el) => ({
            index: el.closest(".project-card").dataset.index,
            card: { ...el.closest(".project-card").dataset },
            rect: window.__auditRect.call(el).toJSON(),
            headerBottom: window.__auditRect.call(document.querySelector(".site-header")).bottom,
            hover: el.closest(".project-card").matches(":hover"),
          })),
          invalidGrid: [...document.querySelectorAll('.dither-preview-canvas[data-active="true"]')].filter((c) =>
            c.width !== Number(c.dataset.ditherColumns) || c.height !== Number(c.dataset.ditherRows),
          ).length,
        }
      }))
    }
    results.push({ label: `${width}-motion-${repeat}`, traces })
    assert(traces.some((trace) => trace.visible > 0), `${width}: boundary canvases present`)
    assert(traces.every((trace) => !trace.hidden && !trace.invalidGrid), `${width}: continuous boundary/grid ownership`)
    await page.close()
    console.log(`PASS category, hover, scroll ${width}`)
}

try {
  if (!motionOnly) await auditLayoutSystems()
  for (let repeat = 0; repeat < motionRepeats; repeat++) {
    for (const width of [430, 940, 1280]) await auditCatalogMotion(width, repeat)
  }

  const reduced = await open({ width: 430, height: 932 }, "/", { reducedMotion: "reduce", isMobile: true, hasTouch: true })
  await reduced.locator("[data-project-card]").first().tap({ position: { x: 100, y: 100 } })
  await settlePreview(reduced)
  checkPreview(await previewSnapshot(reduced.locator("[data-project-card]").first()), "reduced-motion-touch")
  await reduced.keyboard.press("Escape")
  assert.equal(await reduced.locator(".project-preview-exit-ghost").count(), 0)
  await reduced.close()
  assert.deepEqual(errors, [], "page errors")
  console.log(`PASS reduced motion / touch; ${results.length} checks; screenshots: ${output}`)
} finally {
  await writeFile(join(output, "results.json"), JSON.stringify({ results, errors }, null, 2))
  await browser.close()
}
