import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const base = process.argv[2] || "http://127.0.0.1:5173"
const width = Number(process.argv[3] || 1280)
const height = Number(process.argv[4] || 900)
const firstIndex = String(process.argv[5] || "2")
const secondIndex = String(process.argv[6] || "0")
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
await page.goto(`${base}/?inspect=exit-motion#game`, { waitUntil: "domcontentloaded" })
await page.locator(".site-main").waitFor()
await page.evaluate(() => document.fonts.ready)
const first = page.locator(`[data-project-card][data-index="${firstIndex}"]`)
const second = page.locator(`[data-project-card][data-index="${secondIndex}"]`)
await first.scrollIntoViewIfNeeded()
await first.click()
await page.waitForTimeout(900)
console.log("expanded", await page.evaluate((i) => {
  const e=document.querySelector(`[data-project-card][data-index="${i}"]`)
  const r=e?.getBoundingClientRect(); return {scrollY, rect:r?.toJSON(), cls:e?.className}
}, firstIndex))
await second.click()
for (const delay of [0, 16, 40, 80, 120, 200, 300, 450, 650]) {
  if (delay) await page.waitForTimeout(delay)
  const sample = await page.evaluate((idx) => {
    const g=document.querySelector('.project-preview-exit-ghost')
    const source=document.querySelector(`[data-project-card][data-index="${idx}"]`)
    const box=(x)=>{const r=x?.getBoundingClientRect();return r?{left:+r.left.toFixed(2),top:+r.top.toFixed(2),right:+r.right.toFixed(2),bottom:+r.bottom.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)}:null}
    const img=g?.querySelector('.project-media img'), style=img?getComputedStyle(img):null
    const gc=g&&getComputedStyle(g)
    return {t:+performance.now().toFixed(1),scrollY,ghost:box(g),source:box(source),image:box(img),imageStyle:style?{width:style.width,height:style.height,left:style.left,top:style.top,fit:style.objectFit,transform:style.transform,inline:img.getAttribute('style')}:null,ghostStyle:gc?{position:gc.position,top:gc.top,left:gc.left,transform:gc.transform,contain:gc.contain,clip:gc.clipPath,animation:gc.animationName}:null,bodyStyle:{transform:getComputedStyle(document.body).transform,position:getComputedStyle(document.body).position},vars:g?{left:gc.getPropertyValue('--project-preview-ghost-left'),top:gc.getPropertyValue('--project-preview-ghost-top'),width:gc.getPropertyValue('--project-preview-ghost-width'),height:gc.getPropertyValue('--project-preview-ghost-height'),exitLeft:gc.getPropertyValue('--project-preview-exit-left'),exitRight:gc.getPropertyValue('--project-preview-exit-right'),exitTop:gc.getPropertyValue('--project-preview-exit-top'),exitBottom:gc.getPropertyValue('--project-preview-exit-bottom')}:null,attrs:g?{exiting:g.dataset.projectPreviewExiting,side:g.dataset.projectPreviewMotionSide}:null}
  }, firstIndex)
  console.log(JSON.stringify(sample))
}
await browser.close()
