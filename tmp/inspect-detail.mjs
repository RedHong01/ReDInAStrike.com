import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const browser = await chromium.launch({headless:true})
const page = await browser.newPage({viewport:{width:Number(process.argv[3]||575),height:1066},deviceScaleFactor:1})
await page.goto(`${process.argv[2]||"http://127.0.0.1:5177"}/?inspect=1#game`, {waitUntil:"domcontentloaded"})
await page.locator(".site-main").waitFor()
await page.evaluate(()=>document.fonts.ready)
const cards = page.locator("[data-project-card]")
const info = await cards.evaluateAll((els)=>els.map(e=>({i:e.dataset.index, text:e.innerText.slice(0,100), rect:(r=>({x:r.x,y:r.y,w:r.width,h:r.height}))(e.getBoundingClientRect()),side:e.dataset.cardSide})))
console.log("cards", JSON.stringify(info))
const card = cards.filter({hasText:"Serial Deminer"}).first()
await card.scrollIntoViewIfNeeded()
await page.waitForTimeout(300)
console.log("before", JSON.stringify(await snapshot(card)))
await card.click()
await page.waitForTimeout(900)
console.log("preview", JSON.stringify(await snapshot(card)))
await card.click()
await page.waitForTimeout(1000)
console.log("drawer", JSON.stringify(await snapshot(card)))
for (const y of [2200,2300,2400,2450,2500,2550,2600,2650,2700,2800,3000,3400,4000,5000,7000,9000]) {
  await page.evaluate((v)=>window.scrollTo(0,v), y)
  await page.waitForTimeout(300)
  console.log("scroll", y, JSON.stringify(await snapshot(card)))
}
await browser.close()
async function snapshot(locator){ return locator.evaluate(e=>{
  const r=e.getBoundingClientRect(), media=e.querySelector(".project-media"), img=e.querySelector(".project-media img"), copy=e.querySelector(".project-preview-copy"), head=e.querySelector(".project-preview-head"), title=e.querySelector("h2"), meta=e.querySelector(".project-preview-meta"), drawer=e.parentElement?.querySelector?.(".project-detail-drawer")
  const rr=(x)=>x?(()=>{const z=x.getBoundingClientRect();const s=getComputedStyle(x);return {x:z.x,y:z.y,w:z.width,h:z.height,display:s.display,visibility:s.visibility,opacity:s.opacity,overflow:s.overflow,clip:s.clipPath,background:s.backgroundColor}})():null
  return {attrs:{open:e.closest(".project-row")?.dataset.projectDetailOpen,min:e.dataset.projectDetailHeaderMinimized,comp:e.dataset.projectDetailHeaderCompressed,seam:e.dataset.projectPreviewHeaderSeam},card:rr(e),media:rr(media),img:rr(img),copy:rr(copy),head:rr(head),title:rr(title),meta:rr(meta),drawer:rr(drawer),scrollY:scrollY,bodyH:document.body.scrollHeight}
})}
