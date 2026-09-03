import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require("playwright")) } catch {
  ({ chromium } = require(join(
    homedir(),
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
  )))
}

const origin = process.argv[2] || "http://127.0.0.1:5174"
const browser = await chromium.launch({ headless: true })
const errors = []

async function open(width, height = 932) {
  const page = await browser.newPage({ viewport: { width, height } })
  page.on("pageerror", (error) => errors.push(`${width}: ${error.message}`))
  await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
  await page.evaluate(() => document.fonts.ready)
  return page
}

async function settlePreview(page) {
  await page.waitForFunction(() =>
    !document.documentElement.hasAttribute("data-project-preview-transition") &&
    !document.querySelector(".project-preview-exit-ghost"),
  )
}

async function placePreviewTop(page, card, offset) {
  await card.evaluate((element, targetOffset) => {
    const header = document.querySelector(".site-header").getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    window.scrollTo({
      top: Math.max(0, scrollY + rect.top - header.bottom - targetOffset),
      behavior: "instant",
    })
  }, offset)
  await page.waitForTimeout(100)
}

async function seamSnapshot(card) {
  return card.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const header = document.querySelector(".site-header").getBoundingClientRect()
    const rule = getComputedStyle(element, "::before")
    return {
      gap: rect.top - header.bottom,
      shared: element.hasAttribute("data-project-preview-header-seam"),
      opacity: rule.opacity,
      color: rule.backgroundColor,
    }
  })
}

async function checkHeaderSeam(width) {
  const page = await open(width)
  const card = page.locator('[data-project-card][data-index="4"]')
  await card.click({ position: { x: 80, y: 80 } })
  await settlePreview(page)

  await placePreviewTop(page, card, 72)
  const separated = await seamSnapshot(card)
  assert(separated.gap > 2, `${width}: preview separates from header`)
  assert.equal(separated.shared, false, `${width}: separate preview owns top rule`)
  assert.equal(separated.opacity, "1", `${width}: separate top rule is visible`)
  assert.equal(separated.color, "rgb(255, 255, 255)", `${width}: dark preview keeps white rule`)

  await placePreviewTop(page, card, 0)
  const shared = await seamSnapshot(card)
  assert(shared.gap <= 2, `${width}: preview reaches header`)
  assert.equal(shared.shared, true, `${width}: header owns shared seam`)
  assert.equal(shared.opacity, "0", `${width}: preview top rule is removed at header`)

  await placePreviewTop(page, card, 72)
  const restored = await seamSnapshot(card)
  assert(restored.gap > 2, `${width}: preview leaves header again`)
  assert.equal(restored.shared, false, `${width}: preview retakes separated seam`)
  assert.equal(restored.opacity, "1", `${width}: preview top rule returns`)
  await page.close()
  console.log(`PASS header seam ${width}`)
}

async function sampleOutgoingPreview(page, duration = 260) {
  return page.evaluate(async (sampleDuration) => {
    const samples = []
    let sawSnow = false
    const started = performance.now()
    while (performance.now() - started < sampleDuration) {
      await new Promise(requestAnimationFrame)
      sawSnow ||= Boolean(document.querySelector('[data-active-color-motion="true"] .active-color-snow-canvas'))
      const ghosts = [...document.querySelectorAll(".project-preview-exit-ghost")]
      samples.push(ghosts.map((ghost) => {
        const style = getComputedStyle(ghost)
        return {
          animation: style.animationName,
          clip: style.clipPath,
          opacity: Number(style.opacity),
        }
      }))
    }
    return { frames: samples, sawSnow }
  }, duration)
}

function checkFixedFade(result, label) {
  const samples = result.frames
  assert(samples.some((sample) => sample.length), `${label}: outgoing snapshot appears`)
  assert(samples.every((sample) => sample.length <= 1), `${label}: at most one outgoing snapshot`)
  const frames = samples.flat()
  assert(frames.every((frame) => frame.animation === "none"), `${label}: no geometric retraction`)
  assert.equal(new Set(frames.map((frame) => frame.clip)).size, 1, `${label}: fixed snapshot geometry`)
  for (let index = 1; index < frames.length; index++) {
    assert(frames[index].opacity <= frames[index - 1].opacity + 0.01, `${label}: opacity does not rebound`)
  }
}

async function checkCategoryHandoff() {
  const page = await open(1280, 900)
  const card = page.locator('[data-project-card][data-index="4"]')
  await card.click({ position: { x: 80, y: 80 } })
  await settlePreview(page)
  await page.locator('[data-nav-category="graphic"]').hover()
  await page.waitForFunction(() => document.querySelector('.catalog[data-filter-phase="exiting"]'))
  const samples = await sampleOutgoingPreview(page)
  checkFixedFade(samples, "category handoff")
  assert.equal(samples.sawSnow, true, "category handoff leaves Fine Signal Snow in control")
  assert.equal(await page.locator(".project-card.is-project-preview").count(), 0, "category handoff collapses live full-bleed card")
  await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
  assert.equal(await page.locator(".project-preview-exit-ghost").count(), 0, "category handoff cleans snapshot")
  assert.equal(await page.locator(".is-project-preview-exit-source").count(), 0, "category handoff releases source row")
  await page.close()
  console.log("PASS category preview handoff")
}

async function checkRapidSwitching() {
  const page = await open(1280, 900)
  await page.locator('[data-project-card][data-index="4"]').click({ position: { x: 80, y: 80 } })
  await settlePreview(page)

  for (const index of [6, 8, 10, 12]) {
    await page.locator(`[data-project-card][data-index="${index}"]`).evaluate((card) => card.click())
    const samples = await sampleOutgoingPreview(page, 70)
    checkFixedFade(samples, `rapid switch to ${index}`)
  }
  await settlePreview(page)
  assert.equal(
    await page.locator(".project-card.is-project-preview").getAttribute("data-index"),
    "12",
    "rapid switching settles on latest card",
  )
  assert.equal(await page.locator(".project-preview-exit-ghost").count(), 0, "rapid switching leaves no snapshot")
  assert.equal(await page.locator(".is-project-preview-exit-source").count(), 0, "rapid switching releases all rows")
  await page.close()
  console.log("PASS rapid preview switching")
}

try {
  for (const width of [430, 940, 1280]) await checkHeaderSeam(width)
  await checkCategoryHandoff()
  await checkRapidSwitching()
  assert.deepEqual(errors, [], "page errors")
} finally {
  await browser.close()
}
