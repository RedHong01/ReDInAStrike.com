import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
let chromium
let firefox
let webkit
try { ({ chromium, firefox, webkit } = require("playwright")) } catch {
  ({ chromium, firefox, webkit } = require(join(
    homedir(),
    ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
  )))
}

const origin = process.argv[2] || "http://127.0.0.1:5174"
const errors = []

for (const [engineName, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch({ headless: true })
  try {
    for (const width of [430, 940, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      page.on("pageerror", (error) => errors.push(`${engineName} ${width}: ${error.message}`))
      await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })

      const unfilteredCard = page.locator(".project-card").first()
      await unfilteredCard.hover()
      await page.waitForTimeout(180)
      assert.equal(
        await unfilteredCard.locator(".active-color-snow-canvas").count(),
        0,
        `${engineName} ${width}: unfiltered card has no hover snow`,
      )
      assert.notEqual(
        await unfilteredCard.getAttribute("data-active-color-motion"),
        "true",
        `${engineName} ${width}: unfiltered card has no hover motion`,
      )

      await page.locator('[data-nav-category="graphic"]').click()
      await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
      await page.waitForFunction(() => !document.querySelector('[data-active-color-motion="true"]'))

      const includedCard = page.locator(".project-card:not(.is-filter-muted)").first()
      await includedCard.hover()
      await page.waitForTimeout(180)
      assert.equal(
        await includedCard.locator(".active-color-snow-canvas").count(),
        0,
        `${engineName} ${width}: included filtered card has no hover snow`,
      )
      assert.notEqual(
        await includedCard.getAttribute("data-active-color-motion"),
        "true",
        `${engineName} ${width}: included filtered card has no hover motion`,
      )

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
      const pointerY = 600
      await page.mouse.move(target.x, pointerY)
      await page.mouse.wheel(0, target.documentCenter - pointerY)

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
      assert.equal(entered.index, target.index, `${engineName} ${width}: stationary pointer hit target`)
      assert.equal(entered.hover, true, `${engineName} ${width}: native hover follows scroll`)
      assert.equal(entered.intent, true, `${engineName} ${width}: motion intent reconciled`)
      assert.equal(entered.motion, "true", `${engineName} ${width}: Fine Signal motion resumed`)

      await page.mouse.wheel(0, -500)
      await page.waitForFunction((index) => {
        const card = document.querySelector(`[data-project-card][data-index="${index}"]`)
        return card && !card.classList.contains("is-muted-restore-intent")
      }, target.index)
      console.log(`PASS stationary scroll hover ${engineName} ${width}`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
}

assert.deepEqual(errors, [], "page errors")
