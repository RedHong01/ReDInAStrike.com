import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const base = process.argv[2] || "http://localhost:5173"
const width = Number(process.argv[3] || 1280)
const height = Number(process.argv[4] || 900)
const cardIndex = String(process.argv[5] || "0")
const forceGutter = process.argv[6] === "gutter"
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
await page.goto(`${base}/?inspect=motion#game`, { waitUntil: "domcontentloaded" })
await page.locator(".site-main").waitFor()
await page.evaluate(() => document.fonts.ready)
if (forceGutter) {
  await page.addStyleTag({ content: "html { scrollbar-gutter: stable; } body { overflow-y: scroll; }" })
  await page.waitForTimeout(80)
}
const card = page.locator(`[data-project-card][data-index="${cardIndex}"]`)
await card.scrollIntoViewIfNeeded()
const before = await card.evaluate((e) => { const r=e.getBoundingClientRect(), m=e.querySelector('.project-media').getBoundingClientRect(), img=e.querySelector('.project-media img'), i=img.getBoundingClientRect(), s=getComputedStyle(img); return {card:r.toJSON(),media:m.toJSON(),image:i.toJSON(),imageStyle:{width:s.width,height:s.height,left:s.left,right:s.right,top:s.top,bottom:s.bottom,transform:s.transform,objectFit:s.objectFit},natural:{width:img.naturalWidth,height:img.naturalHeight},viewport:{innerWidth,clientWidth:document.documentElement.clientWidth,bodyClientWidth:document.body.clientWidth},scrollY} })
console.log("before", JSON.stringify(before))
await card.click({position:{x:30,y:30}})
for (const delay of [0, 16, 40, 80, 120, 200, 320, 480, 640, 800, 1000]) {
  await page.waitForTimeout(delay === 0 ? 0 : delay - ([0,16,40,80,120,200,320,480,640,800,1000].indexOf(delay)>0?[0,16,40,80,120,200,320,480,640,800,1000][[0,16,40,80,120,200,320,480,640,800,1000].indexOf(delay)-1]:0))
  const sample = await page.evaluate((index) => {
    const e=document.querySelector(`[data-project-card][data-index="${index}"]`), g=document.querySelector('.project-preview-expand-ghost')
    const box=(x)=>{const r=x?.getBoundingClientRect();return r?{left:+r.left.toFixed(2),top:+r.top.toFixed(2),right:+r.right.toFixed(2),bottom:+r.bottom.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)}:null}
    const gi=g?.querySelector('.project-media img')
    const gs=gi?getComputedStyle(gi):null
    const li=e?.querySelector('.project-media img'), ls=li?getComputedStyle(li):null
    return {t:performance.now(),scrollY,card:box(e),liveMedia:box(e?.querySelector('.project-media')),liveImage:box(li),liveImageStyle:ls?{width:ls.width,height:ls.height,left:ls.left,top:ls.top,right:ls.right,bottom:ls.bottom,transform:ls.transform,objectFit:ls.objectFit,objectPosition:ls.objectPosition}:null,ghost:box(g),ghostMedia:box(g?.querySelector('.project-media')),ghostImage:box(gi),ghostImageStyle:gs?{width:gs.width,height:gs.height,left:gs.left,top:gs.top,right:gs.right,bottom:gs.bottom,visibility:gs.visibility,opacity:gs.opacity,objectFit:gs.objectFit,objectPosition:gs.objectPosition}:null,ghostImageTransform:gs?gs.transform:null,ghostImageOrigin:gs?gs.transformOrigin:null,ghostImageInline:gi?.getAttribute('style'),ghostCopyInline:g?.querySelector('.project-preview-copy')?.getAttribute('style'),clip:g?getComputedStyle(g).clipPath:null,attrs:{ghosting:e?.dataset.projectPreviewExpandGhosting,ready:e?.dataset.projectPreviewReady}}
  }, cardIndex)
  console.log(JSON.stringify(sample))
}
await browser.close()
