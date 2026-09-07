import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"
const require = createRequire(import.meta.url)
const { chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"))
const base = process.argv[2] || "http://127.0.0.1:5173"
const width = Number(process.argv[3] || 700), height = Number(process.argv[4] || 900)
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport:{width,height}, deviceScaleFactor:1 })
await page.goto(`${base}/?check=rule#game`, {waitUntil:"domcontentloaded"})
await page.locator(".site-main").waitFor(); await page.evaluate(()=>document.fonts.ready)
const card=page.locator('[data-project-card][data-index="0"]'); await card.scrollIntoViewIfNeeded(); await card.click(); await page.waitForTimeout(900); await card.click(); await page.waitForTimeout(1000)
const out=await page.evaluate(()=>{
 const row=document.querySelector('[data-project-card][data-index="0"]')?.closest('.project-row')
 const tail=row?.querySelector(':scope > .project-detail-sticky-tail'), sib=[...(row?.children||[])].find(x=>x.classList.contains('project-card')&&!x.classList.contains('is-project-preview'))
 const b=x=>{const r=x?.getBoundingClientRect();return r?{top:+r.top.toFixed(2),bottom:+r.bottom.toFixed(2),height:+r.height.toFixed(2)}:null}
 const ps=getComputedStyle(row,'::after')
 return {row:b(row),drawer:b(row?.querySelector('.project-detail-drawer')),tail:b(tail),sibling:b(sib),rowAfter:{display:ps.display,bottom:ps.bottom,top:ps.top,height:ps.height,transform:ps.transform}}
})
console.log(JSON.stringify(out)); await browser.close()
