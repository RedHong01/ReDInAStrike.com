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
await page.goto(`${base}/?inspect=rows#game`, { waitUntil: "domcontentloaded" })
await page.locator(".site-main").waitFor()
await page.evaluate(() => document.fonts.ready)
const result = await page.evaluate(() => {
  const box = (node) => {
    if (!node) return null
    const r = node.getBoundingClientRect()
    return { left:+r.left.toFixed(2), top:+r.top.toFixed(2), right:+r.right.toFixed(2), bottom:+r.bottom.toFixed(2), width:+r.width.toFixed(2), height:+r.height.toFixed(2) }
  }
  const css = (node, name) => getComputedStyle(node).getPropertyValue(name).trim()
  return [...document.querySelectorAll(".project-row")].slice(0, 8).map((row) => ({
    id: row.id,
    row: box(row),
    style: { paddingTop:css(row,"padding-top"), paddingBottom:css(row,"padding-bottom"), rowGap:css(row,"row-gap"), columns:css(row,"grid-template-columns") },
    rule: { after: { display:css(row,"display") }, rect: box(row) },
    cards: [...row.querySelectorAll(":scope > .project-card")].map((card) => ({
      index:card.dataset.index,
      side:card.dataset.cardSide,
      text:card.querySelector(".project-title")?.textContent,
      card:box(card),
      media:box(card.querySelector(".project-media")),
      image:box(card.querySelector(".project-media img")),
      meta:box(card.querySelector(".project-meta")),
      title:box(card.querySelector(".project-title")),
      date:box(card.querySelector(".project-date")),
      vars:{aspect:css(card,"--media-aspect"),captionLeading:css(card,"--project-caption-leading"),captionGap:css(card,"--project-media-caption-gap")},
      imgStyle:{fit:css(card.querySelector("img"),"object-fit"),position:css(card.querySelector("img"),"object-position")},
    })),
  }))
})
console.log(JSON.stringify({width,height,result}, null, 2))
await browser.close()
