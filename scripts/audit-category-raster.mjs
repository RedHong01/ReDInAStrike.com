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

const origin = process.argv[2] || "http://127.0.0.1:5173"
const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.route("**/*active-color-snow.js*", async (route) => {
    const response = await route.fetch()
    await route.fulfill({
      response,
      body: `${await response.text()}
        ;window.__categoryRasterAudit = {
          states: activeStates,
          drawState,
          drawCategoryExitSurface,
          categoryFrontPresence,
          hash01,
          clamp,
          smooth01,
          TAU,
        };
      `,
    })
  })

  await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
  await page.waitForFunction(() => window.__categoryRasterAudit)
  await page.locator('[data-nav-category="graphic"]').evaluate((item) => item.click())
  await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
  await page.waitForFunction(() => [...document.querySelectorAll(
    '.dither-preview-canvas[data-active="true"], .project-halftone',
  )].some((canvas) => canvas.width > 1 && canvas.height > 1))
  await page.waitForTimeout(300)
  await page.locator('[data-nav-category="game"]').evaluate((item) => item.click())
  await page.waitForFunction(() => [...window.__categoryRasterAudit.states]
    .some((state) => state.reason === "category-exit" && state.sourceBits))

  const exitResult = await page.evaluate(() => {
    const api = window.__categoryRasterAudit
    const state = [...api.states]
      .find((candidate) => candidate.reason === "category-exit" && candidate.sourceBits)
    if (!state) throw new Error("No live category surface state")
    const { config, grid, sourceBits, sourcePixels, paper } = state
    const expected = new Uint8ClampedArray(state.framePixels.length)
    let cases = 0
    let comparedBytes = 0
    let inkCount = 0
    for (let index = 0; index < sourceBits.length; index += 1) inkCount += sourceBits[index] ? 1 : 0

    for (const progress of [0.03, 0.26, 0.57, 0.91]) {
      for (const categoryHold of [0, 0.42, 1]) {
        for (const now of [1250, 8375]) {
          const categoryAmount = Math.min(1, Math.max(0, Number(config.activeColorBreathAmount) || 0))
          const frameTick = Math.floor(now / Math.max(16, 92 - config.activeColorFlicker * 68))
          state.framePixels.fill(0)
          api.drawCategoryExitSurface(
            state,
            progress,
            categoryHold,
            categoryAmount,
            frameTick,
            now,
          )
          expected.fill(0)
          const softness = 0.07 + api.clamp(config.activeColorFlicker) * 0.105
          const density = api.clamp(
            config.activeColorNoiseDensity * (0.42 + Math.sin(Math.PI * progress) * 0.58),
          )

          for (let index = 0; index < grid.count; index += 1) {
            if (!sourceBits[index]) continue
            const col = index % grid.cols
            const row = Math.floor(index / grid.cols)
            const order = grid.order[index]
            let effectiveOrder = order
            let frontPulse = 0
            let breath = 0.5

            if (categoryAmount > 0.001) {
              frontPulse = api.categoryFrontPresence(progress, order, config)
              if (frontPulse > 0.001 || categoryHold > 0.001) {
                const clusterSize = Math.max(1, Math.round(config.activeColorClusterSize))
                const clusterCol = Math.floor(col / clusterSize)
                const clusterRow = Math.floor(row / clusterSize)
                const groupPhase = api.hash01(config.activeColorSeed, clusterCol, clusterRow, 3001)
                const cellPhase = api.hash01(config.activeColorSeed, col, row, 3002)
                const groupRate = api.hash01(config.activeColorSeed, clusterCol, clusterRow, 3003)
                const rate = Math.max(0.08, Number(config.activeColorBreathRate) || 0.42) *
                  (0.86 + groupRate * 0.28)
                const phase = groupPhase * api.TAU + cellPhase * 0.76 + order * api.TAU * 0.19
                const timeSeconds = now / 1000
                const primary = Math.sin(timeSeconds * api.TAU * rate + phase)
                const drift = Math.sin(timeSeconds * api.TAU * rate * 0.37 + phase * 0.61 + 1.13)
                const secondary = Math.sin(timeSeconds * api.TAU * rate * 1.61 + phase * 1.37 - 0.47)
                breath = api.clamp(0.5 + primary * 0.26 + drift * 0.17 + secondary * 0.055)
                const breathShift = (breath - 0.5) * 2 * categoryAmount
                effectiveOrder = api.clamp(
                  order + breathShift * (categoryHold * 0.036 + frontPulse * 0.065),
                )
              }
            }

            const offset = index * 4
            if (effectiveOrder > progress) {
              expected[offset] = sourcePixels[offset]
              expected[offset + 1] = sourcePixels[offset + 1]
              expected[offset + 2] = sourcePixels[offset + 2]
              expected[offset + 3] = 255
              continue
            }
            const edge = api.smooth01((softness - Math.abs(effectiveOrder - progress)) / softness)
            if (edge <= 0.001) continue
            const pulse = (breath - 0.5) * 2
            const flicker = api.hash01(config.activeColorSeed, col, row, 1000 + frameTick)
            const colorChance = api.clamp(
              density * (1 - config.activeColorPaperRatio * 0.72) +
                edge * (0.16 + categoryHold * 0.08) +
                pulse * categoryAmount * edge * 0.18,
            )
            const motion = flicker < colorChance ? grid.palette : paper
            const motionMix = api.clamp(edge * (0.32 + density * 0.42))
            expected[offset] = sourcePixels[offset] * (1 - motionMix) + motion[0] * motionMix
            expected[offset + 1] = sourcePixels[offset + 1] * (1 - motionMix) + motion[1] * motionMix
            expected[offset + 2] = sourcePixels[offset + 2] * (1 - motionMix) + motion[2] * motionMix
            expected[offset + 3] = Math.round(255 * edge)
          }

          for (let index = 0; index < expected.length; index += 1) {
            if (expected[index] !== state.framePixels[index]) {
              throw new Error(`pixel mismatch at ${index}, progress=${progress}, hold=${categoryHold}, now=${now}`)
            }
          }
          cases += 1
          comparedBytes += expected.length
        }
      }
    }
    return {
      cases,
      comparedBytes,
      inkCount,
      sparseIndexCount: state.sourceInkIndices?.length || 0,
    }
  })

  await page.waitForFunction(() => [...window.__categoryRasterAudit.states]
    .some((state) => state.reason === "category-enter" && state.mode === "snow"))
  const enterResult = await page.evaluate(() => {
    const api = window.__categoryRasterAudit
    const state = [...api.states]
      .find((candidate) => candidate.reason === "category-enter" && candidate.mode === "snow")
    if (!state?.categoryMotion) throw new Error("No optimized category enter state")
    const fields = state.categoryMotion
    const originalStartTime = state.startTime
    const originalLastDraw = state.lastDraw
    let cases = 0
    let comparedBytes = 0

    try {
      for (const raw of [0.08, 0.31, 0.67, 0.94]) {
        for (const now of [12000, 18750]) {
          state.startTime = now - state.config.activeColorDelayMs -
            raw * state.config.activeColorDurationMs
          state.lastDraw = 0
          state.categoryMotion = fields
          api.drawState(state, now)
          const optimized = Uint8ClampedArray.from(state.framePixels)

          state.lastDraw = 0
          state.categoryMotion = null
          api.drawState(state, now)
          for (let index = 0; index < optimized.length; index += 1) {
            if (optimized[index] !== state.framePixels[index]) {
              throw new Error(`enter pixel mismatch at ${index}, raw=${raw}, now=${now}`)
            }
          }
          cases += 1
          comparedBytes += optimized.length
        }
      }
    } finally {
      state.categoryMotion = fields
      state.startTime = originalStartTime
      state.lastDraw = originalLastDraw
    }
    return { cases, comparedBytes }
  })

  assert.equal(exitResult.sparseIndexCount, exitResult.inkCount, "sparse traversal contains every live ink pixel")
  assert.deepEqual(errors, [], "page errors")
  console.log(`PASS exact category pixels: ${JSON.stringify({ exit: exitResult, enter: enterResult })}`)
} finally {
  await browser.close()
}
