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
  if (process.env.AUDIT_ENGINE && process.env.AUDIT_ENGINE !== engineName) continue
  const browser = await engine.launch({ headless: true })
  try {
    for (const width of [430, 940, 1280]) {
      if (process.env.AUDIT_WIDTH && Number(process.env.AUDIT_WIDTH) !== width) continue
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      page.on("pageerror", (error) => errors.push(`${engineName} ${width}: ${error.message}`))
      await page.route("**/src/active-color-snow.js*", async (route) => {
        const response = await route.fetch()
        await route.fulfill({
          response,
          body: `${await response.text()}\nwindow.__hoverAuditState = (card) => cardStates.get(card);`,
        })
      })
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
          window.__hoverAuditState(card)?.mode === "restore" &&
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

      const continuityToken = `${engineName}-${width}`
      await page.evaluate(({ x, y, index, token }) => {
        const card = document.elementFromPoint(x, y)?.closest?.(".project-card")
        assertCard(card, index)
        const canvas = card.querySelector(".active-color-snow-canvas")
        canvas.dataset.auditContinuity = token
        const originalState = window.__hoverAuditState(card)
        const startTime = originalState.startTime
        let progress = originalState.restoreProgress || 0
        const audit = { samples: 0, activeSamples: 0, issues: [] }
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node !== canvas && node.classList?.contains("active-color-snow-canvas")) {
                audit.issues.push("reveal canvas replaced")
              }
            }
          }
        })
        observer.observe(card, { childList: true, subtree: true })
        let frame = 0
        const sample = () => {
          audit.samples++
          const state = window.__hoverAuditState(card)
          if (state) {
            audit.activeSamples++
            if (state !== originalState) audit.issues.push("reveal state replaced")
            if (state.startTime !== startTime) audit.issues.push("reveal clock restarted")
            if ((state.restoreProgress || 0) < progress) audit.issues.push("reveal progress regressed")
            progress = state.restoreProgress || 0
          } else if (card.getAttribute("data-active-color-restore-ready") !== "true") {
            audit.issues.push("reveal removed before completion")
          }
          frame = requestAnimationFrame(sample)
        }
        sample()
        window.__hoverContinuityAudit = {
          stop() {
            cancelAnimationFrame(frame)
            observer.disconnect()
            return audit
          },
        }

        function assertCard(candidate, expectedIndex) {
          if (candidate?.dataset.index !== expectedIndex) {
            throw new Error(`continuity setup hit ${candidate?.dataset.index || "none"}`)
          }
        }
      }, { x: target.x, y: pointerY, index: target.index, token: continuityToken })

      for (const delta of [8, -8, 10, -10]) {
        await page.mouse.wheel(0, delta)
        await page.waitForTimeout(18)
      }
      await page.waitForTimeout(330)
      const continuous = await page.evaluate(({ x, y, index, token }) => {
        const card = document.elementFromPoint(x, y)?.closest?.(".project-card")
        return {
          index: card?.dataset.index,
          token: card?.querySelector(".active-color-snow-canvas")?.dataset.auditContinuity,
          motion: card?.getAttribute("data-active-color-motion"),
          ready: card?.getAttribute("data-active-color-restore-ready"),
          intent: card?.classList.contains("is-muted-restore-intent"),
          audit: window.__hoverContinuityAudit.stop(),
        }
      }, { x: target.x, y: pointerY, index: target.index, token: continuityToken })
      assert.equal(continuous.index, target.index, `${engineName} ${width}: small scroll retains hover card`)
      assert(continuous.audit.activeSamples > 1, `${engineName} ${width}: sampled in-flight reveal`)
      assert.deepEqual(continuous.audit.issues, [], `${engineName} ${width}: reveal identity, clock and progress remain continuous`)
      // Real wheel dispatch can outlast the reveal on slower engines. Natural
      // completion is valid; restarting or removing an unfinished state is not.
      if (continuous.token) {
        assert.equal(continuous.token, continuityToken, `${engineName} ${width}: original reveal canvas retained`)
        assert.equal(continuous.motion, "true", `${engineName} ${width}: in-flight reveal remains active`)
      } else {
        assert.equal(continuous.ready, "true", `${engineName} ${width}: reveal completed naturally`)
        assert.equal(continuous.intent, true, `${engineName} ${width}: completed reveal keeps ownership`)
      }

      await page.waitForFunction((index) => {
        const card = document.querySelector(`[data-project-card][data-index="${index}"]`)
        return (
          card?.getAttribute("data-active-color-restore-ready") === "true" &&
          card.getAttribute("data-active-color-motion") !== "true" &&
          !card.querySelector(".active-color-snow-canvas")
        )
      }, target.index)
      await page.mouse.wheel(0, 12)
      await page.waitForTimeout(340)
      const completed = await page.evaluate(({ x, y }) => {
        const card = document.elementFromPoint(x, y)?.closest?.(".project-card")
        return {
          index: card?.dataset.index,
          intent: card?.classList.contains("is-muted-restore-intent"),
          canvas: Boolean(card?.querySelector(".active-color-snow-canvas")),
          motion: card?.getAttribute("data-active-color-motion"),
        }
      }, { x: target.x, y: pointerY })
      assert.equal(completed.index, target.index, `${engineName} ${width}: completed hover card remains hit`)
      assert.equal(completed.intent, true, `${engineName} ${width}: completed hover ownership remains`)
      assert.equal(completed.canvas, false, `${engineName} ${width}: completed reveal is not replayed`)
      assert.notEqual(completed.motion, "true", `${engineName} ${width}: completed reveal stays settled`)

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
