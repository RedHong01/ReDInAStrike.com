import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 575, height: 1066 }, deviceScaleFactor: 1 })
await page.goto("http://127.0.0.1:5177/?inspect=one#game", { waitUntil: "domcontentloaded" })
await page.locator(".site-main").waitFor()
await page.evaluate(() => document.fonts.ready)
const card = page.locator("[data-project-card]").filter({ hasText: "Serial Deminer" }).first()
await card.scrollIntoViewIfNeeded()
await card.click()
await page.waitForTimeout(1000)
console.log(JSON.stringify(await card.evaluate((e) => {
  const q = (s) => {
    const x = e.querySelector(s)
    const r = x?.getBoundingClientRect()
    const c = x && getComputedStyle(x)
    return x ? { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, display: c.display, position: c.position, gridColumn: c.gridColumn, gridRow: c.gridRow, maxHeight: c.maxHeight, aspect: c.aspectRatio } : null
  }
  return {
    innerWidth,
    innerHeight,
    orientation: matchMedia("(orientation: portrait)").matches,
    card: { cls: e.className, attrs: [...e.attributes].map((a) => [a.name, a.value]), rect: e.getBoundingClientRect().toJSON(), display: getComputedStyle(e).display, rows: getComputedStyle(e).gridTemplateRows, cols: getComputedStyle(e).gridTemplateColumns },
    media: q(".project-media"),
    img: q(".project-media img"),
    copy: q(".project-preview-copy"),
    ready: e.dataset.projectPreviewReady,
  }
})))
await browser.close()
