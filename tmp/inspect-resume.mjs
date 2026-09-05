import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: Number(process.argv[3] || 575), height: 1066 }, deviceScaleFactor: 1 })
await page.goto(`${process.argv[2] || "http://127.0.0.1:5177"}/?inspect=resume#resume`, { waitUntil: "domcontentloaded" })
await page.locator(".site-main").waitFor()
await page.evaluate(() => document.fonts.ready)
for (const y of [0, 120, 240, 360, 500, 800, 1200, 1800, 2400, 3200]) {
  await page.evaluate((v) => scrollTo(0, v), y)
  await page.waitForTimeout(250)
  console.log(y, JSON.stringify(await page.evaluate(() => {
    const q = (s) => document.querySelector(s)
    const R = (e) => {
      if (!e) return null
      const r = e.getBoundingClientRect(); const s = getComputedStyle(e)
      return { x: r.x, y: r.y, w: r.width, h: r.height, position: s.position, transform: s.transform, z: s.zIndex, background: s.backgroundColor, borderTop: s.borderTopWidth, paddingTop: s.paddingTop, overflow: s.overflow, clip: s.clipPath }
    }
    const about = q('.about-section')
    return { header: R(q('.site-header')), about: R(about), aboutCard: R(q('.about-card')), resume: R(q('.resume-card')), band: R(q('.about-resume-band')), word: R(q('.resume-word')), detail: R(q('.resume-detail')), first: R(q('.resume-project')), styles: { aboutPull: getComputedStyle(about).getPropertyValue('--about-pull-y'), resumeOffset: getComputedStyle(about).getPropertyValue('--resume-card-offset-y') } }
  })))
}
await browser.close()
