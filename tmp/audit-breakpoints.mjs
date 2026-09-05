import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const base = process.argv[2] || "http://127.0.0.1:5177"
const viewports = [
  [320, 900], [375, 900], [430, 900], [575, 1066], [640, 900], [700, 900],
  [768, 900], [900, 700], [980, 700], [981, 700], [1024, 768], [1180, 800], [1440, 900],
]

const browser = await chromium.launch({ headless: true })
for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  await page.goto(`${base}/?audit=${width}x${height}#game`, { waitUntil: "domcontentloaded" })
  await page.locator(".site-main").waitFor()
  await page.evaluate(() => document.fonts.ready)
  const card = page.locator('.project-card[data-index="0"]').first()
  await card.scrollIntoViewIfNeeded()
  await card.click()
  await page.waitForTimeout(1000)
  const preview = await card.evaluate((e) => {
    const q = (s) => {
      const x = e.querySelector(s)
      if (!x) return null
      const r = x.getBoundingClientRect(), c = getComputedStyle(x)
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), row: c.gridRow, col: c.gridColumn, opacity: c.opacity, visibility: c.visibility }
    }
    const before = getComputedStyle(e, "::before")
    const after = getComputedStyle(e, "::after")
    const r = e.getBoundingClientRect()
    return {
      attrs: { active: e.dataset.projectPreviewActive, ready: e.dataset.projectPreviewReady, detail: e.dataset.projectDetailOpen },
      card: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), rows: getComputedStyle(e).gridTemplateRows },
      media: q(".project-media"), image: q(".project-media img"), copy: q(".project-preview-copy"), title: q(".project-preview-head h2"),
      rules: { beforeDisplay: before.display, beforeH: before.height, afterDisplay: after.display, afterH: after.height },
    }
  })

  await card.click()
  await page.waitForTimeout(1000)
  const detail = await card.evaluate((e) => {
    const q = (s) => {
      const x = e.querySelector(s)
      if (!x) return null
      const r = x.getBoundingClientRect(), c = getComputedStyle(x)
      return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), row: c.gridRow, col: c.gridColumn, opacity: c.opacity, visibility: c.visibility }
    }
    const r = e.getBoundingClientRect()
    return { attrs: { detail: e.dataset.projectDetailOpen, comp: e.dataset.projectDetailHeaderCompressed, min: e.dataset.projectDetailHeaderMinimized, seam: e.dataset.projectPreviewHeaderSeam }, card: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }, media: q(".project-media"), image: q(".project-media img"), copy: q(".project-preview-copy"), title: q(".project-preview-head h2"), meta: q(".project-preview-meta") }
  })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45))
  await page.waitForTimeout(500)
  const mid = await card.evaluate((e) => {
    const r = e.getBoundingClientRect(), h = e.querySelector(".project-preview-head h2")?.getBoundingClientRect(), m = e.querySelector(".project-preview-meta")?.getBoundingClientRect()
    return { attrs: { comp: e.dataset.projectDetailHeaderCompressed, min: e.dataset.projectDetailHeaderMinimized }, card: { y: +r.y.toFixed(1), h: +r.height.toFixed(1) }, title: h && { y: +h.y.toFixed(1), h: +h.height.toFixed(1) }, meta: m && { y: +m.y.toFixed(1), h: +m.height.toFixed(1) } }
  })
  console.log(JSON.stringify({ width, height, preview, detail, mid }))
  await page.close()
}
await browser.close()
