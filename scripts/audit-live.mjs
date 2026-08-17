import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const { chromium } = require(
  "/Users/redwang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"
)
const { writeFile } = await import("node:fs/promises")

const url = process.argv[2] || "https://redinastrike.framer.website"
const out = process.argv[3] || "/private/tmp/redinastrike-live-audit.json"

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: "networkidle", timeout: 90000 })
await page.waitForTimeout(1500)

const audit = await page.evaluate(() => {
  const rectOf = (node) => {
    const rect = node.getBoundingClientRect()
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    }
  }

  const visible = (node) => {
    const rect = node.getBoundingClientRect()
    const style = getComputedStyle(node)
    return rect.width > 1 && rect.height > 1 && style.visibility !== "hidden" && style.display !== "none"
  }

  const textNodes = Array.from(document.querySelectorAll("h1,h2,h3,p,a,span"))
    .filter(visible)
    .map((node) => {
      const style = getComputedStyle(node)
      return {
        tag: node.tagName.toLowerCase(),
        text: node.innerText.trim().replace(/\s+/g, " "),
        href: node.href || "",
        rect: rectOf(node),
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        color: style.color,
      }
    })
    .filter((item) => item.text)

  const images = Array.from(document.images)
    .filter(visible)
    .map((img) => {
      const style = getComputedStyle(img)
      return {
        src: img.currentSrc || img.src,
        alt: img.alt || "",
        rect: rectOf(img),
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
      }
    })

  const links = Array.from(document.querySelectorAll("a[href]"))
    .filter(visible)
    .map((link) => ({
      href: link.href,
      text: link.innerText.trim().replace(/\s+/g, " "),
      rect: rectOf(link),
    }))

  const named = Array.from(document.querySelectorAll("[data-framer-name]"))
    .filter(visible)
    .map((node) => ({
      name: node.getAttribute("data-framer-name"),
      tag: node.tagName.toLowerCase(),
      rect: rectOf(node),
    }))

  return {
    url: location.href,
    title: document.title,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    body: rectOf(document.body),
    textNodes,
    images,
    links,
    named,
  }
})

await writeFile(out, JSON.stringify(audit, null, 2))
await page.screenshot({ path: "/private/tmp/redinastrike-live-desktop.png", fullPage: true })

const snapshots = [
  ["tablet", 900, 1200],
  ["iphone", 430, 932],
]

for (const [name, width, height] of snapshots) {
  await page.setViewportSize({ width, height })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `/private/tmp/redinastrike-live-${name}.png`, fullPage: true })
}

await browser.close()
console.log(`Wrote ${out}`)
