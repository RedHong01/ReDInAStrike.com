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
const origin = process.argv[2] || "http://127.0.0.1:4174"
const output = process.env.AUDIT_OUTPUT_DIR || join(tmpdir(), "red-playable-audit")
await mkdir(output, { recursive: true })
const cases = [
  { name: "DAD", route: "/ongoing-game-project/", build: "/dad/", ready: () => document.querySelector("#unity-loading-bar")?.style.display === "none" },
  { name: "Slow’em Down", route: "/game-prototype/", build: "/innovative-game-mechanic-redw/", ready: () => document.querySelector("#unity-loading")?.classList.contains("complete") },
  { name: "Curtain", route: "/bns_gdd/", build: "/curtain/", ready: () => !!window.unityInstance },
].filter(item => !process.env.AUDIT_PROJECT || item.name === process.env.AUDIT_PROJECT)
const browser = await chromium.launch({ headless: true })
const results = []
async function assertBounds(page, scope) {
  const bounds = await scope.locator(".detail-playable").evaluate(e => {
    const r = e.getBoundingClientRect()
    return { left: r.left, right: r.right, width: r.width, height: r.height, viewport: innerWidth, body: document.documentElement.scrollWidth }
  })
  assert(bounds.width > 0 && bounds.height > 0, "Playable area has visible dimensions")
  assert(bounds.left >= -1 && bounds.right <= bounds.viewport + 1, "Playable area fits the viewport")
  assert(bounds.body <= bounds.viewport + 1, "No page overflow")
  return bounds
}
try {
  for (const item of cases) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } })
    const errors = [], failedAssets = []
    page.on("pageerror", error => errors.push(error.message))
    page.on("response", response => {
      if (response.url().includes(`${item.build}Build/`) && !response.ok()) failedAssets.push(`${response.status()} ${response.url()}`)
    })
    await page.goto(new URL(item.route, origin).href, { waitUntil: "domcontentloaded" })
    const section = page.locator(".case-study-playable-section")
    await section.waitFor()
    assert.equal(await section.locator("iframe").count(), 1, `${item.name}: one inline game`)
    await section.locator("iframe").scrollIntoViewIfNeeded()
    const iframe = await section.locator("iframe").elementHandle()
    const frame = await iframe.contentFrame()
    await frame.waitForURL(url => url.pathname.endsWith(item.build))
    await frame.waitForFunction(item.ready, null, { timeout: 60000 })
    // Initialization resolves before Unity's splash has finished fading.
    await page.waitForTimeout(2500)
    await frame.locator("#unity-canvas").click()
    await page.waitForTimeout(500)
    const desktop = await assertBounds(page, section)
    assert(await page.locator(".case-study-source-section,.case-study-text-section,.case-study-system-section").count() > 0, "Design content remains beside the game")
    const canvas = await frame.locator("#unity-canvas").evaluate(e => ({ width: e.width, height: e.height }))
    assert(canvas.width > 0 && canvas.height > 0, "Unity canvas is initialized")
    await section.screenshot({ path: join(output, `${item.build.split('/')[1]}-desktop.png`) })
    // Curtain requests fullscreen on the first canvas gesture itself. When
    // already fullscreen, its canvas is above the wrapper's button.
    const fullscreenOnFocus = await page.evaluate(() => !!document.fullscreenElement)
    if (!fullscreenOnFocus) await frame.locator("#dad-fullscreen-button, #fullscreen-button, #fullscreen").click()
    await page.waitForFunction(() => !!document.fullscreenElement)
    await page.evaluate(() => document.exitFullscreen())
    await page.waitForFunction(() => !document.fullscreenElement)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(300)
    const mobile = await assertBounds(page, section)
    await section.screenshot({ path: join(output, `${item.build.split('/')[1]}-mobile.png`) })
    assert.deepEqual(failedAssets, [], `${item.name}: build assets load`)
    assert.deepEqual(errors, [], `${item.name}: no page errors`)
    results.push({ mode: "standalone", name: item.name, initialized: true, fullscreen: true, fullscreenOnFocus, canvas, desktop, mobile, failedAssets, errors })
    console.log(`PASS initialized ${item.name}; fullscreen, desktop/mobile bounds and article content`)
    await page.close()
  }
  for (const item of cases) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 960 } })
    const errors = []
    page.on("pageerror", error => errors.push(error.message))
    await page.goto(origin, { waitUntil: "domcontentloaded" })
    await page.locator("[data-project-card]").first().waitFor()
    assert.equal(page.frames().length, 1, "Homepage does not boot games in the background")
    const card = page.locator(`[data-project-card][href*="${item.route.replaceAll('/', '')}"]`)
    await card.click({ position: { x: 80, y: 80 } })
    await page.waitForFunction(() => !document.documentElement.hasAttribute("data-project-preview-transition"))
    await card.click({ position: { x: 80, y: 80 } })
    const drawer = page.locator(".project-detail-drawer")
    await page.waitForFunction(() => document.querySelector(".project-detail-drawer")?.dataset.drawerState === "settled")
    assert.equal(await drawer.locator(".detail-playable iframe").count(), 1, `${item.name}: drawer includes one game`)
    const frame = await (await drawer.locator(".detail-playable iframe").elementHandle()).contentFrame()
    await drawer.locator(".detail-playable iframe").scrollIntoViewIfNeeded()
    await frame.waitForURL(url => url.pathname.endsWith(item.build))
    await frame.waitForFunction(item.ready, null, { timeout: 60000 })
    const bounds = await assertBounds(page, drawer)
    await card.click({ position: { x: 80, y: 30 } })
    await drawer.waitFor({ state: "detached" })
    assert(frame.isDetached(), `${item.name}: closing drawer unloads the game`)
    assert.deepEqual(errors, [], `${item.name}: drawer has no page errors`)
    results.push({ mode: "drawer", name: item.name, initialized: true, bounds, unloadedOnClose: true, errors })
    console.log(`PASS drawer ${item.name}; initialized and unloaded on close`)
    await page.close()
  }
} finally {
  await writeFile(join(output, "results.json"), JSON.stringify(results, null, 2))
  await browser.close()
}
console.log(`PASS ${results.length} playable route/drawer checks; screenshots: ${output}`)
