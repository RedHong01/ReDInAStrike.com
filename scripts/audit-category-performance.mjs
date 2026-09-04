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

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  let instrumentedRequests = 0
  page.on("pageerror", (error) => errors.push(error.message))

  await page.route("**/*active-color-snow.js*", async (route) => {
    instrumentedRequests += 1
    const response = await route.fetch()
    const source = await response.text()
    await route.fulfill({
      response,
      body: `${source}
        ;(() => {
          const samples = [];
          const draws = [];
          const palettes = [];
          const motionFields = [];
          const playCards = [];
          const playCatalogs = [];
          let originalBuildSurface = buildCategoryExitSurface;
          let originalBuildPalette = buildLocalPalette;
          let originalMotionFields = categoryMotionFields;
          let originalDrawState = drawState;
          let originalPlayCard = playCard;
          let originalPlayCatalog = playCatalog;
          buildCategoryExitSurface = (...args) => {
            const started = performance.now();
            const result = originalBuildSurface(...args);
            samples.push(performance.now() - started);
            return result;
          };
          buildLocalPalette = (...args) => {
            const started = performance.now();
            const result = originalBuildPalette(...args);
            palettes.push(performance.now() - started);
            return result;
          };
          categoryMotionFields = (...args) => {
            const started = performance.now();
            const result = originalMotionFields(...args);
            motionFields.push(performance.now() - started);
            return result;
          };
          playCard = (...args) => {
            const started = performance.now();
            const result = originalPlayCard(...args);
            if (String(args[4]?.reason || "").startsWith("category")) {
              playCards.push(performance.now() - started);
            }
            return result;
          };
          playCatalog = (...args) => {
            const started = performance.now();
            const result = originalPlayCatalog(...args);
            playCatalogs.push(performance.now() - started);
            return result;
          };
          drawState = (state, now) => {
            const started = performance.now();
            const result = originalDrawState(state, now);
            if (String(state.reason || "").startsWith("category")) {
              draws.push({ duration: performance.now() - started, reason: state.reason });
            }
            return result;
          };
          window.__categoryPerfAudit = {
            reset() { samples.length = 0; draws.length = 0; palettes.length = 0; motionFields.length = 0; playCards.length = 0; playCatalogs.length = 0; },
            read() { return { samples: [...samples], draws: [...draws], palettes: [...palettes], motionFields: [...motionFields], playCards: [...playCards], playCatalogs: [...playCatalogs] }; },
          };
        })();
      `,
    })
  })

  await page.goto(new URL("/", origin).href, { waitUntil: "domcontentloaded" })
  try {
    await page.waitForFunction(() => window.__categoryPerfAudit &&
      !document.querySelector(".catalog[data-filter-phase]"), null, { timeout: 10000 })
  } catch (error) {
    const state = await page.evaluate(() => ({
      root: document.documentElement.getAttribute("data-red-active-color-snow"),
      scripts: [...document.scripts].map((script) => script.src).filter(Boolean),
    }))
    throw new Error(`instrumentation unavailable: requests=${instrumentedRequests} errors=${JSON.stringify(errors)} state=${JSON.stringify(state)}`, { cause: error })
  }
  await page.waitForTimeout(1200)

  const runs = []
  for (const category of ["graphic", "game", "interaction"]) {
    await page.evaluate(() => {
      window.__categoryPerfAudit.reset()
      const timing = { gaps: [], longTasks: [], phases: [] }
      let previous = performance.now()
      let frame = 0
      const sample = (now) => {
        timing.gaps.push(now - previous)
        previous = now
        frame = requestAnimationFrame(sample)
      }
      frame = requestAnimationFrame(sample)
      const observer = typeof PerformanceObserver === "function"
        ? new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              timing.longTasks.push({ startTime: entry.startTime, duration: entry.duration })
            }
          })
        : null
      try { observer?.observe({ type: "longtask", buffered: false }) } catch {}
      const catalog = document.querySelector(".catalog")
      const phaseObserver = new MutationObserver(() => {
        timing.phases.push({
          time: performance.now(),
          phase: catalog?.dataset.filterPhase || "idle",
        })
      })
      if (catalog) phaseObserver.observe(catalog, { attributes: true, attributeFilter: ["data-filter-phase"] })
      window.__categoryFrameAudit = {
        stop() {
          cancelAnimationFrame(frame)
          observer?.disconnect()
          phaseObserver.disconnect()
          return timing
        },
      }
    })

    await page.locator(`[data-nav-category="${category}"]`).click()
    await page.waitForFunction(() => !document.querySelector(".catalog[data-filter-phase]"))
    const result = await page.evaluate((name) => {
      const internal = window.__categoryPerfAudit.read()
      const timing = window.__categoryFrameAudit.stop()
      const sum = (values) => values.reduce((total, value) => total + value, 0)
      const drawDurations = internal.draws.map((entry) => entry.duration)
      const paletteTotalMs = sum(internal.palettes)
      const motionFieldTotalMs = sum(internal.motionFields)
      const exitDraws = internal.draws
        .filter((entry) => entry.reason === "category-exit")
        .map((entry) => entry.duration)
      const enterDraws = internal.draws
        .filter((entry) => entry.reason === "category-enter")
        .map((entry) => entry.duration)
      return {
        category: name,
        cardCount: document.querySelectorAll(".project-card").length,
        sampleCount: internal.samples.length,
        sampleTotalMs: sum(internal.samples),
        sampleMaxMs: Math.max(0, ...internal.samples),
        paletteCount: internal.palettes.length,
        paletteTotalMs,
        motionFieldCount: internal.motionFields.length,
        motionFieldTotalMs,
        playCardTotalMs: sum(internal.playCards),
        playCardMaxMs: Math.max(0, ...internal.playCards),
        playCatalogTotalMs: sum(internal.playCatalogs),
        playCatalogMaxMs: Math.max(0, ...internal.playCatalogs),
        drawCount: drawDurations.length,
        drawTotalMs: sum(drawDurations),
        drawMaxMs: Math.max(0, ...drawDurations),
        exitDrawTotalMs: sum(exitDraws),
        enterDrawTotalMs: sum(enterDraws),
        frameCount: timing.gaps.length,
        frameMaxMs: Math.max(0, ...timing.gaps),
        framesOver20Ms: timing.gaps.filter((gap) => gap > 20).length,
        framesOver32Ms: timing.gaps.filter((gap) => gap > 32).length,
        longTaskCount: timing.longTasks.length,
        longTaskTotalMs: sum(timing.longTasks.map((entry) => entry.duration)),
        longTasks: timing.longTasks,
        phases: timing.phases,
      }
    }, category)
    runs.push(result)
    await page.waitForTimeout(220)
  }

  assert.deepEqual(errors, [], "page errors")
  assert(runs.every((run) => run.drawCount > 0), "category pixel motion rendered")
  assert(runs.every((run) => run.drawMaxMs < 4), "each instrumented pixel draw stays inside a 4ms budget")
  assert(
    runs.slice(1).every((run) => run.framesOver32Ms === 0 && run.longTaskCount === 0),
    "warm category switches avoid dropped-frame spikes and long tasks",
  )
  assert(
    runs[0].longTasks.every((task) => task.duration < 75),
    "cold category initialization stays below the previous 75ms spike",
  )
  console.log(JSON.stringify(runs, null, 2))
} finally {
  await browser.close()
}
