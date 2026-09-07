import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import vm from "node:vm"
import * as motion from "../src/motion-default.js"

// Run the production ownership and boundary-field code with a small canvas/DOM
// fixture. No browser, server, external package, or wall-clock delay is required.
const failures = []
async function check(name, run) {
  try {
    await run()
    console.log(`PASS ${name}`)
  } catch (error) {
    failures.push({ name, error })
    console.error(`FAIL ${name}: ${error.message}`)
  }
}

async function loadSource(filename, globals, expose) {
  const input = process.argv.includes("--baseline")
    ? execFileSync("git", ["show", `HEAD:src/${filename}`], { encoding: "utf8" })
    : await readFile(new URL(`../src/${filename}`, import.meta.url), "utf8")
  const source = input
    .replace(/^import[\s\S]*?from\s+"[^"\n]+"\s*\n/gm, "")
    .replace(/^export\s+/gm, "")
  const context = vm.createContext({ ...globals })
  vm.runInContext(`${source}\n${expose}`, context, { filename })
  return context.__audit
}

async function fixture(width = 1280, height = 900) {
  let now = 1000
  let nextFrame = 0
  const cards = []
  const listeners = new Map()
  const catalog = {
    dataset: { activeFilter: "ongoing" },
    querySelectorAll: () => cards,
  }
  const window = {
    innerWidth: width, innerHeight: height,
    addEventListener(name, callback) { listeners.set(name, callback) },
    matchMedia: () => ({ matches: false }),
    setTimeout: () => ++nextFrame, clearTimeout() {},
  }
  const document = {
    readyState: "loading", hidden: false,
    documentElement: { clientHeight: height, dataset: {} },
    getElementById: () => ({}),
    addEventListener() {},
    querySelector(selector) {
      if (selector === ".catalog[data-active-filter]") return catalog
      return null
    },
  }
  const globals = {
    window, document, console,
    performance: { now: () => now },
    requestAnimationFrame: () => ++nextFrame,
    cancelAnimationFrame() {}, clearTimeout() {},
    getComputedStyle: (node) => node.style || {},
    ImageData: class {
      constructor(data, width, height) { Object.assign(this, { data, width, height }) }
    },
    ...motion,
  }
  const binary = await loadSource("binary-surface-core.js", globals,
    `globalThis.__audit = { BINARY_MOTION_DEFAULTS, constrainBinaryGridSize, logicalGridFromCanvas };`)
  Object.assign(globals, binary)
  const boundary = await loadSource("viewport-boundary-core.js", globals,
    `globalThis.__audit = { BOUNDARY_DEPTH_MAX_PX, BOUNDARY_HOLD_MAX_PX,
      boundaryMetrics, boundaryStrength, readViewportBoundaryContext, viewportBoundsForCard };`)
  Object.assign(globals, boundary)

  function makeCard() {
    const classes = new Set(["project-card", "is-filter-muted"])
    const attributes = new Map()
    const rect = { top: height - 200, bottom: height + 200, width: width / 2, height: 400 }
    let overlay = null
    const ctx = { clearRect() {}, putImageData() {} }
    const makeCanvas = (className) => ({
      className, width: 4, height: 40, dataset: {}, style: {}, isConnected: true,
      getBoundingClientRect: () => rect, getContext: () => ctx,
      closest: () => card,
      remove() { this.isConnected = false; if (overlay === this) overlay = null },
    })
    const card = {
      isConnected: true,
      classList: { contains: (name) => classes.has(name), add: (name) => classes.add(name),
        remove: (name) => classes.delete(name) },
      getAttribute: (name) => attributes.get(name) ?? null,
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: (name) => attributes.delete(name),
      closest: (selector) => selector === ".catalog" ? catalog : null,
      querySelector(selector) {
        if (selector.startsWith(".dither-preview-canvas")) return finalCanvas
        if (selector.startsWith(".dither-reveal-canvas")) return overlay
        return null
      },
    }
    const finalCanvas = makeCanvas("dither-preview-canvas")
    finalCanvas.dataset.active = "true"
    card.ensureOverlay = () => overlay ||= makeCanvas("dither-reveal-canvas")
    card.finalCanvas = finalCanvas
    cards.push(card)
    return card
  }

  const count = 4 * 40
  globals.fixtureGrid = {
    cols: 4, rows: 40, count,
    pixelOrder: new Float32Array(count).fill(0.5),
    flickerPhase: new Float32Array(count),
    breathRate: new Float32Array(count).fill(1),
    darkness: new Float32Array(count),
  }
  const reveal = await loadSource("reveal-motion.js", globals, `
    // Replace only raster allocation/sampling. Keep field math, tracking,
    // state lifetime, and the entire production handoff path intact.
    buildGrid = () => fixtureGrid;
    ensureRevealCanvas = card => card.ensureOverlay();
    readColors = () => ({ paper: [255,255,255,255], ink: [0,0,0,255] });
    globalThis.__audit = { track: trackViewportDitherReveal, cancel: cancelReveal,
      refresh: refreshViewportDitherReveals, capture: captureViewportDitherBoundaryField,
      handoff: handoffViewportDitherBoundaryField, renderBoundaryField,
      state: card => animationStates.get(card) };
  `)
  const breath = await loadSource("boundary-breath-runtime.js", { ...globals, fixtureReveal: reveal }, `
    revealApi = fixtureReveal;
    ensureRevealApi = async () => fixtureReveal;
    globalThis.__audit = { syncCardNow, syncTrackedCards, syncCardOwnershipNow };
  `)
  return { makeCard, reveal, breath, boundary, now: (value) => { now = value }, listeners }
}

await check("handoff owner can prepare and retain the canonical boundary while return class remains", async () => {
  const { makeCard, breath, reveal } = await fixture()
  const card = makeCard()
  card.classList.add("is-muted-restore-return")
  card.setAttribute("data-hover-binary-return", "true")
  assert.equal(await breath.syncCardNow(card), true,
    "a settled hover handoff must be eligible for canonical boundary ownership")
  const state = reveal.state(card)
  assert.ok(state, "canonical boundary was prepared")
  await breath.syncTrackedCards()
  assert.equal(reveal.state(card), state, "full sync must retain the prepared canonical state")
  card.classList.remove("is-muted-restore-return")
  card.removeAttribute("data-hover-binary-return")
  await breath.syncTrackedCards()
  assert.equal(reveal.state(card), state, "completion must retain the same boundary, without reseeding")
})

await check("active color still excludes boundary ownership during reverse motion", async () => {
  const { makeCard, breath, reveal } = await fixture()
  const card = makeCard()
  card.setAttribute("data-active-color-motion", "true")
  card.setAttribute("data-hover-binary-return", "true")
  card.classList.add("is-muted-restore-return")
  assert.equal(await breath.syncCardNow(card), false)
  assert.equal(reveal.state(card), undefined)
})

for (const [width, height] of [[390, 844], [768, 1024], [1280, 900], [1920, 1080]]) {
  await check(`stationary hover handoff does not replay edge spread at ${width}x${height}`, async () => {
    const { makeCard, reveal, boundary, now } = await fixture(width, height)
    const card = makeCard()
    const config = motion.boundaryRevealMotionConfig(motion.PUBLISHED_MOTION_CONFIG)
    assert.equal(reveal.track(card, card.finalCanvas, config), true)
    const previous = reveal.state(card)
    now(3000)
    reveal.renderBoundaryField(previous, 3000, boundary.viewportBoundsForCard(card), true, { immediate: true })
    const snapshot = reveal.capture(card)
    assert.ok(snapshot.range.max > 0, "fixture touches the viewport boundary")
    reveal.cancel(card, { remove: true })
    now(4000)
    assert.equal(reveal.track(card, card.finalCanvas, config), true)
    const next = reveal.state(card)
    assert.ok(next.boundarySpread, "fresh category reveal retains its edge-origin transition")
    const result = reveal.handoff(card, snapshot, { allowBoundaryUpdate: false })
    assert.equal(result.ready, true)
    assert.equal(next.boundarySpread, null, "hover return must consume, rather than restart, the edge spread")
    const target = Array.from(next.boundaryTargetStrengths)
    assert.deepEqual(target, Array.from(snapshot.targetStrengths), "the full clipped boundary is restored atomically")
    now(4033)
    reveal.renderBoundaryField(next, 4033, boundary.viewportBoundsForCard(card), true)
    assert.deepEqual(Array.from(next.boundaryTargetStrengths), target,
      "a stationary following frame must not grow boundary depth again")
  })
}

if (failures.length) {
  console.error(`${failures.length} hover return regression checks failed`)
  process.exitCode = 1
}
