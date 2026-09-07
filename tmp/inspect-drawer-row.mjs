import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const base = process.argv[2] || "http://localhost:5173"
const width = Number(process.argv[3] || 1440)
const height = Number(process.argv[4] || 900)
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
await page.goto(`${base}/?inspect=drawer-row#game`, { waitUntil: "domcontentloaded" })
await page.locator(".site-main").waitFor()
await page.evaluate(() => document.fonts.ready)
const card = page.locator('[data-project-card][data-index="0"]')
await card.scrollIntoViewIfNeeded()
await card.click()
await page.waitForTimeout(900)
await card.click()
await page.waitForTimeout(1000)
for (const y of [8000, 8100, 8200, 8250, 8300, 8350, 8400, 8450, 8500, 8600]) {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(120)
  const sample = await page.evaluate(() => {
    const card = document.querySelector('[data-project-card][data-index="0"]')
    const row = card?.closest('.project-row')
    const drawer = row?.querySelector('.project-detail-drawer')
    const header = document.querySelector('.site-header')
    const box = (node) => { const r=node?.getBoundingClientRect(); return r?{top:+r.top.toFixed(2),bottom:+r.bottom.toFixed(2),height:+r.height.toFixed(2)}:null }
    return {scrollY, card:box(card),row:box(row),drawer:box(drawer),siteHeader:box(header),attrs:{min:card?.dataset.projectDetailHeaderMinimized,comp:card?.dataset.projectDetailHeaderCompressed},rowStyle:row?{paddingBottom:getComputedStyle(row).paddingBottom,marginBottom:getComputedStyle(row).marginBottom,gridRows:getComputedStyle(row).gridTemplateRows}:null,cardStyle:card?{marginBottom:getComputedStyle(card).marginBottom,marginTop:getComputedStyle(card).marginTop,position:getComputedStyle(card).position}:null}
  })
  console.log(JSON.stringify({y,sample}))
}
await browser.close()
