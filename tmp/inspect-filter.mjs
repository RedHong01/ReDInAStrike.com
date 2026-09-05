import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const browser = await chromium.launch({headless:true})
for (const width of [320,375,430,575,768,981]) {
  const page = await browser.newPage({viewport:{width,height:1066},deviceScaleFactor:1})
  await page.goto("http://127.0.0.1:5177/?inspect=filter#game", {waitUntil:"domcontentloaded"})
  await page.locator(".site-main").waitFor()
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForTimeout(1200)
  const out = await page.evaluate(()=>{
    const cat=document.querySelector(".catalog")
    const cards=[...document.querySelectorAll(".catalog .project-card")]
    const rect = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x:r.x, y:r.y, w:r.width, h:r.height }
    }
    const result = {
      url: location.href,
      scrollY,
      bodyH: document.body.scrollHeight,
      html: { active: document.documentElement.dataset.redActiveColorSnow },
      cat: cat && {
        active: cat.dataset.activeFilter,
        phase: cat.dataset.filterPhase,
        preview: cat.dataset.projectPreview,
        previewFilter: cat.dataset.projectPreviewFilter,
        rect: rect(cat),
      },
      cards: cards.map((c, i) => {
        const m = c.querySelector(".project-media")
        const im = c.querySelector("img")
        const h = c.querySelector(".project-halftone")
        return {
          i,
          txt: c.innerText.slice(0,40),
          cls: c.className,
          attrs: { muted:c.dataset.filterMuted, active:c.dataset.projectPreviewActive, dither:c.dataset.ditherCategoryEnterReveal },
          rect: rect(c),
          media: rect(m),
          img: im && { opacity:getComputedStyle(im).opacity, visibility:getComputedStyle(im).visibility },
          half: h && { opacity:getComputedStyle(h).opacity, display:getComputedStyle(h).display, active:h.dataset.active },
        }
      }),
    }
    return result
  })
  console.log(width,JSON.stringify(out))
  await page.close()
}
await browser.close()
