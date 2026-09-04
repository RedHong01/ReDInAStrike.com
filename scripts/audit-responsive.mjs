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
const rulesOnly = process.argv.includes("--rules-only")
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
        color: style.backgroundColor,
      }
    })
    const sibling = [...row.children].find((node) => node !== element)
    const siblingRect = sibling && window.__auditRect.call(sibling)
    return {
      width: innerWidth, left: rect.left, right: rect.right,
      top: rect.top, bottom: rect.bottom, padding: getComputedStyle(element).paddingTop,
      background: getComputedStyle(element).backgroundColor,
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

function luminance(color) {
  const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((channel) => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrast(first, second) {
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

function checkPreview(snapshot, label) {
  assert(Math.abs(snapshot.left) < 1 && Math.abs(snapshot.right - snapshot.width) < 1, `${label}: full bleed bounds`)
  assert.equal(snapshot.padding, "0px", `${label}: preview has no sibling-divider inset`)
  for (const [index, rule] of snapshot.rules.entries()) {
    assert.equal(rule.display, "block", `${label}: rule ${index} display`)
    assert(Math.abs(rule.width - snapshot.width) < 1, `${label}: rule ${index} width`)
    assert.equal(rule.height, 1, `${label}: rule ${index} thickness`)
    assert.equal(index ? rule.bottom : rule.top, "0px", `${label}: rule ${index} edge`)
    const white = contrast("rgb(255, 255, 255)", snapshot.background)
    const dark = contrast("rgb(17, 17, 17)", snapshot.background)
    assert.equal(rule.color, white > dark ? "rgb(255, 255, 255)" : "rgb(17, 17, 17)", `${label}: highest-contrast rule ${index}`)
    assert(contrast(rule.color, snapshot.background) >= 3, `${label}: visible rule ${index} contrast`)
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

function checkRulePixels(buffer, controlBuffer, label, edge) {
  const png = PNG.sync.read(buffer)
  const baseline = PNG.sync.read(controlBuffer)
  let painted = 0
  const count = png.width - 8
  for (let x = 4; x < png.width - 4; x++) {
    const hit = [edge - 2, edge - 1, edge, edge + 1, edge + 2].some((y) => {
      if (y < 0 || y >= png.height) return false
      const offset = (y * png.width + x) * 4
      return [0, 1, 2].some((channel) => Math.abs(png.data[offset + channel] - baseline.data[offset + channel]) > 12)
    })
    if (hit) painted++
  }
  assert(painted / count > 0.95, `${label}: painted edge ${edge} covers ${(100 * painted / count).toFixed(1)}%`)
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
    const seam = await card.evaluate((element) => {
      const headerRule = document.querySelector(".header-rule")
      const headerStyle = headerRule ? getComputedStyle(headerRule) : null
      return {
        shared: element.hasAttribute("data-project-preview-header-seam"),
        previewOpacity: getComputedStyle(element, "::before").opacity,
        headerHeight: Number.parseFloat(headerStyle?.height || "0"),
        headerOpacity: Number.parseFloat(headerStyle?.opacity || "0"),
      }
    })
    if (edge === "top" && seam.shared) {
      assert.equal(seam.previewOpacity, "0", `${label}: preview yields shared header seam`)
      assert.equal(seam.headerHeight, 1, `${label}: header keeps its 1px rule`)
      assert(seam.headerOpacity > 0, `${label}: header rule remains visible`)
      continue
    }
    // Repaint only the rule in its opposite color. This proves its full width
    // even where an image edge happens to match the intended rule color.
    const previous = await card.evaluate((element) => {
      const value = element.style.getPropertyValue("--preview-rule")
      const color = getComputedStyle(element, "::before").backgroundColor
      element.style.setProperty("--preview-rule", color === "rgb(255, 255, 255)" ? "#111111" : "#ffffff")
      return value
    })
    try {
      const controlBuffer = await page.screenshot()
      checkRulePixels(buffer, controlBuffer, label, Math.round(y))
    } finally {
      await card.evaluate((element, value) => {
        if (value) element.style.setProperty("--preview-rule", value)
        else element.style.removeProperty("--preview-rule")
      }, previous)
    }
  }
}

async function auditAllCardRules() {
  for (const [width, height] of [[430, 932], [940, 820], [1280, 900]]) {
    const page = await open({ width, height })
    const indices = [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15]
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
    console.log(`PASS all 16 card rules ${width}x${height}`)
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
      const detail = await page.locator(".site-main").evaluate((main) => {
        const lead = main.querySelector(".project-lead")
        const shell = main.querySelector(".detail-shell, .framer-derived-shell, .framer-case-shell")
        const heading = lead.querySelector("h2")
        const intro = shell.querySelector(".framer-derived-intro")
        const style = getComputedStyle(heading)
        const leadRect = lead.getBoundingClientRect()
        return {
          width: shell.getBoundingClientRect().width,
          leadWidth: leadRect.width, leadLeft: leadRect.left, leadRight: leadRect.right,
          leadHeight: leadRect.height, leadSide: lead.dataset.cardSide,
          title: heading.textContent, titleSize: style.fontSize, titleLeading: style.lineHeight,
          titleOverflow: heading.scrollWidth > heading.clientWidth + 1,
          leadOverflow: [...lead.querySelectorAll("h2,p,span")]
            .filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1)
            .map((e) => e.textContent),
          introColumns: intro ? getComputedStyle(intro).gridTemplateColumns.split(" ").length : null,
          overflow: [...shell.querySelectorAll("h1,h2,p,li")].filter((e) => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent),
        }
      })
      assert(Math.abs(detail.width - homeWidth) < 1, `${width} ${path}: shared content bounding`)
      assert(Math.abs(detail.leadLeft) < 1 && Math.abs(detail.leadRight - width) < 1, `${width} ${path}: shared lead full bleed`)
      assert(detail.leadHeight > 0 && ["left", "right"].includes(detail.leadSide), `${width} ${path}: shared lead geometry`)
      assert(!detail.titleOverflow && !detail.leadOverflow.length && !detail.overflow.length, `${width} ${path}: text overflow ${[...detail.leadOverflow, ...detail.overflow]}`)
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
  if (rulesOnly) await auditAllCardRules()
  else {
    if (!motionOnly) await auditLayoutSystems()
    for (let repeat = 0; repeat < motionRepeats; repeat++) {
      for (const width of [430, 940, 1280]) await auditCatalogMotion(width, repeat)
    }
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
