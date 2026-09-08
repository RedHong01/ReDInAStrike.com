import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const base = process.argv[2] || "http://127.0.0.1:5173"
const width = Number(process.argv[3] || 1280)
const height = Number(process.argv[4] || 900)
const index = String(process.argv[5] || "0")
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
await page.goto(`${base}/?inspect=collapse-motion#game`, { waitUntil: "domcontentloaded" })
await page.locator(".site-main").waitFor()
await page.evaluate(() => document.fonts.ready)
const card = page.locator(`[data-project-card][data-index="${index}"]`)
await card.scrollIntoViewIfNeeded()
await card.click()
await page.waitForTimeout(900)
await page.keyboard.press("Escape")
for (const delay of [0, 16, 40, 80, 120, 180, 240, 320, 450, 650]) {
  if (delay) await page.waitForTimeout(delay)
  const sample = await page.evaluate((i) => {
    const card = document.querySelector(`[data-project-card][data-index="${i}"]`)
    const ghost = document.querySelector(".project-preview-exit-ghost")
    const box = (node) => { const r=node?.getBoundingClientRect(); return r ? {left:+r.left.toFixed(2),top:+r.top.toFixed(2),right:+r.right.toFixed(2),bottom:+r.bottom.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)} : null }
    const image = card?.querySelector(".project-media img")
    const ghostImage = ghost?.querySelector(".project-media img")
    const style = image ? getComputedStyle(image) : null
    const ghostStyle = ghostImage ? getComputedStyle(ghostImage) : null
    const ghostRoot = ghost ? getComputedStyle(ghost) : null
    return {t:+performance.now().toFixed(1),scrollY,card:box(card),media:box(card?.querySelector(".project-media")),image:box(image),imageStyle:style?{transform:style.transform,fit:style.objectFit,visibility:style.visibility,opacity:style.opacity}:null,ghost:box(ghost),ghostImage:box(ghostImage),ghostImageStyle:ghostStyle?{transform:ghostStyle.transform,fit:ghostStyle.objectFit,visibility:ghostStyle.visibility,opacity:ghostStyle.opacity}:null,ghostRoot:ghostRoot?{position:ghostRoot.position,clip:ghostRoot.clipPath,animation:ghostRoot.animationName}:null,attrs:{motion:card?.dataset.projectPreviewMotion,ready:card?.dataset.projectPreviewReady,source:card?.classList.contains("is-project-preview-exit-source-card")}}
  }, index)
  console.log(JSON.stringify(sample))
}
await browser.close()
