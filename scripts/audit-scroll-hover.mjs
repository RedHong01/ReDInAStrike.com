import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require("playwright")) } catch {
  ({ chromium } = require(join(
    homedir(),
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
  )))
}

const origin = process.argv[2] || "http://127.0.0.1:5174"
const browser = await chromium.launch({ headless: true })
const errors = []

try {
  for (const width of [430, 940, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    page.on("pageerror", (error) => errors.push(`${width}: ${error.message}`))
    await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
    await page.locator('[data-nav-category="graphic"]').click()
    await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
    await page.waitForTimeout(700)

    const target = await page.evaluate(() => {
      const card = [...document.querySelectorAll(".project-card.is-filter-muted")]
        .find((item) => item.getBoundingClientRect().top > innerHeight + 150)
      const rect = card.getBoundingClientRect()
      return {
        index: card.dataset.index,
        x: rect.left + rect.width / 2,
        documentCenter: rect.top + scrollY + rect.height / 2,
      }
    })
    const pointerY = 450
    await page.mouse.move(target.x, pointerY)
    await page.evaluate(
      ({ top }) => scrollTo({ top, behavior: "instant" }),
      { top: target.documentCenter - pointerY },
    )

    await page.waitForFunction(({ x, y, index }) => {
      const card = document.elementFromPoint(x, y)?.closest?.(".project-card")
      return (
        card?.dataset.index === index &&
        card.matches(":hover") &&
        card.classList.contains("is-muted-restore-intent") &&
        card.getAttribute("data-active-color-motion") === "true" &&
        Boolean(card.querySelector(".active-color-snow-canvas"))
      )
    }, { x: target.x, y: pointerY, index: target.index })

    const entered = await page.evaluate(({ x, y }) => {
      const card = document.elementFromPoint(x, y)?.closest?.(".project-card")
      return {
        index: card?.dataset.index,
        hover: card?.matches(":hover"),
        intent: card?.classList.contains("is-muted-restore-intent"),
        motion: card?.getAttribute("data-active-color-motion"),
      }
    }, { x: target.x, y: pointerY })
    assert.equal(entered.index, target.index, `${width}: stationary pointer hit target`)
    assert.equal(entered.hover, true, `${width}: native hover follows scroll`)
    assert.equal(entered.intent, true, `${width}: motion intent reconciled`)
    assert.equal(entered.motion, "true", `${width}: Fine Signal motion resumed`)

    await page.evaluate(() => scrollBy({ top: 500, behavior: "instant" }))
    await page.waitForFunction((index) => {
      const card = document.querySelector(`[data-project-card][data-index="${index}"]`)
      return card && !card.classList.contains("is-muted-restore-intent")
    }, target.index)
    console.log(`PASS stationary scroll hover ${width}`)
    await page.close()
  }
  assert.deepEqual(errors, [], "page errors")
} finally {
  await browser.close()
}
