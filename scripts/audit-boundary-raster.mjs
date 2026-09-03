import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { homedir } from "node:os"
import { join } from "node:path"

const require = createRequire(import.meta.url)
let chromium
try { ({ chromium } = require("playwright")) } catch {
  ({ chromium } = require(join(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright")))
}
const origin = process.argv[2] || "http://127.0.0.1:5174"
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 932 } })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  // Expose private helpers only in this isolated test page, not in production.
  await page.route("**/src/reveal-motion.js*", async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, body: `${await response.text()}
      window.__rasterAudit = { states: viewportStates, renderBoundaryField,
        pixelSoftness, transitionPresence, breathingWave, writePaperPixel,
        writeMixedPixel, clamp, smooth01 };
    ` })
  })
  await page.goto(new URL("/#graphic", origin).href)
  await page.waitForFunction(() => window.__rasterAudit?.states.size > 0 &&
    !document.querySelector(".catalog[data-filter-phase]") &&
    document.documentElement.dataset.headerMotion !== "moving")
  await page.waitForTimeout(1500)
  const result = await page.evaluate(() => {
    const api = window.__rasterAudit
    const state = [...api.states].find((s) => !s.card.hasAttribute("data-active-color-motion"))
    if (!state) throw new Error("No boundary state for raster audit")
    const referenceCanvas = document.createElement("canvas")
    referenceCanvas.width = state.canvas.width
    referenceCanvas.height = state.canvas.height
    const referenceContext = referenceCanvas.getContext("2d", { alpha: true })
    let comparedBytes = 0
    let comparedCanvasBytes = 0
    let referenceSinCalls = 0
    let optimizedSinCalls = 0
    let cases = 0
    const originalSin = Math.sin
    try {
      for (const height of [220, 540, 1100]) {
        for (const top of [-190, 80, 250, 520, 840]) {
          for (const flicker of [0, 0.5, 1]) {
            for (const now of [1250, 8375]) {
              state.viewportRect = { top, bottom: top + height, width: 500, height }
              state.config.revealNoiseFlicker = flicker
              Math.sin = (value) => { optimizedSinCalls++; return originalSin(value) }
              api.renderBoundaryField(state, now, { top: 160, bottom: 932 }, false, { immediate: true })
              Math.sin = (value) => { referenceSinCalls++; return originalSin(value) }
              const { grid, config, colors } = state
              const expected = new Uint8ClampedArray(state.framePixels.length)
              const softness = api.pixelSoftness(config, "pixel-snow")
              const breathAmount = 0.07 + config.revealNoiseFlicker * 0.16
              // Scalar oracle: the original per-pixel formula, with no envelope
              // pruning. Compare every RGBA byte, including transparent pixels.
              for (let row = 0; row < grid.rows; row++) {
                const strength = state.boundaryStrengths[row]
                if (strength <= 0.0005) continue
                for (let index = row * grid.cols; index < (row + 1) * grid.cols; index++) {
                  if (strength >= 0.9995) {
                    api.writePaperPixel(expected, index * 4, colors.paper, 1)
                    continue
                  }
                  const threshold = 0.08 + grid.pixelOrder[index] * 0.84
                  const breath = api.breathingWave(now / 1000, grid.flickerPhase[index], grid.breathRate[index])
                  const presence = api.transitionPresence(strength)
                  const shift = (breath - 0.5) * 2 * breathAmount * presence
                  let alpha = api.smooth01((strength + shift - threshold + softness) / (softness * 2))
                  if (alpha <= 0.001) continue
                  const band = 4 * alpha * (1 - alpha)
                  alpha = api.clamp(alpha + (breath - 0.5) * 2 * breathAmount * 0.58 * band)
                  const inkMix = band * (0.25 + breath * 0.75) * config.revealNoisePeak * 0.34 *
                    (0.32 + grid.darkness[index] * 0.46)
                  api.writeMixedPixel(expected, index * 4, colors.paper, colors.ink, inkMix, alpha)
                }
              }
              for (let i = 0; i < expected.length; i++) {
                if (expected[i] !== state.framePixels[i]) {
                  throw new Error(`RGBA mismatch at ${i}: ${expected[i]} != ${state.framePixels[i]}, top=${top}, height=${height}, flicker=${flicker}, time=${now}`)
                }
              }
              const canvasPixels = state.ctx.getImageData(
                0,
                0,
                state.canvas.width,
                state.canvas.height,
              ).data
              referenceContext.putImageData(new ImageData(expected, state.grid.cols, state.grid.rows), 0, 0)
              const referencePixels = referenceContext.getImageData(
                0,
                0,
                referenceCanvas.width,
                referenceCanvas.height,
              ).data
              for (let i = 0; i < referencePixels.length; i++) {
                if (referencePixels[i] !== canvasPixels[i]) {
                  throw new Error(`Canvas mismatch at ${i}: ${referencePixels[i]} != ${canvasPixels[i]}, top=${top}, height=${height}, flicker=${flicker}, time=${now}`)
                }
              }
              comparedBytes += expected.length
              comparedCanvasBytes += canvasPixels.length
              cases++
            }
          }
        }
      }
    } finally { Math.sin = originalSin }
    state.viewportRect = { top: -320, bottom: -220, width: 500, height: 100 }
    api.renderBoundaryField(state, 9100, { top: 160, bottom: 932 }, false, { immediate: true })
    api.renderBoundaryField(state, 9120, { top: 160, bottom: 932 }, false, { immediate: true })
    const repeatedPaperUploadRows = state.boundaryUploadRanges.reduce(
      (total, value, index, ranges) => index % 2 ? total + value - ranges[index - 1] : total,
      0,
    )
    return {
      cases,
      comparedBytes,
      comparedCanvasBytes,
      repeatedPaperUploadRows,
      optimizedSinCalls,
      referenceSinCalls,
    }
  })
  assert(result.optimizedSinCalls < result.referenceSinCalls * 0.7, "prune at least 30% of waveform calls")
  assert.equal(result.comparedCanvasBytes, result.comparedBytes, "visible canvas matches every reference byte")
  assert.equal(result.repeatedPaperUploadRows, 0, "stable paper rows are not uploaded twice")
  assert.deepEqual(errors, [], "page errors")
  console.log(`PASS exact boundary pixels: ${JSON.stringify(result)}`)
} finally {
  await browser.close()
}
