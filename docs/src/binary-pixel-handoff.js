import { ACTIVE_COLOR_PRESETS, PUBLISHED_ACTIVE_COLOR_CONFIG } from "./active-color-default.js?v=20260830-finesignal1"

const STYLE_ID = "red-binary-pixel-handoff-style"
const CANVAS_CLASS = "binary-pixel-handoff-canvas"
const HANDOFF_ATTR = "data-binary-handoff"
const TARGET_FRAME_MS = 1000 / 60
const FINE_SIGNAL = ACTIVE_COLOR_PRESETS.find((preset) => preset.id === "fine-signal")?.values || PUBLISHED_ACTIVE_COLOR_CONFIG
const CELL_PX = Number(FINE_SIGNAL.activeColorCellPx) || 3
const CLUSTER_SIZE = Math.max(1, Math.round(Number(FINE_SIGNAL.activeColorClusterSize) || 3))
const CLUSTER_MIX = clampNumber(Number(FINE_SIGNAL.activeColorClusterMix), 0, 1, 0.16)
const SIGNAL_FLICKER = clampNumber(Number(FINE_SIGNAL.activeColorFlicker), 0, 1, 0.62)
const IN_DURATION_MS = Number(FINE_SIGNAL.activeColorDurationMs) || 660
const OUT_DURATION_MS = Number(FINE_SIGNAL.activeColorExitDurationMs) || 350
const MAX_GRID_CELLS = 36000
const MAX_WAIT_MS = 1800
const TAU = Math.PI * 2

const states = new WeakMap()
const activeStates = new Set()
const pending = new WeakMap()
let animationFrame = 0
let catalogObserver = null
let appObserver = null
let catalog = null

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const smooth01 = (value) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

function hash32(value) {
  let x = value | 0
  x ^= x >>> 16
  x = Math.imul(x, 0x7feb352d)
  x ^= x >>> 15
  x = Math.imul(x, 0x846ca68b)
  x ^= x >>> 16
  return x >>> 0
}

function hash01(seed, a = 0, b = 0, c = 0) {
  return hash32(
    (seed | 0) ^
    Math.imul((a | 0) + 1, 73856093) ^
    Math.imul((b | 0) + 1, 19349663) ^
    Math.imul((c | 0) + 1, 83492791),
  ) / 4294967295
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
}

function ensureStyles() {
  let style = document.getElementById(STYLE_ID)
  if (!style) {
    style = document.createElement("style")
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = `
    .dither-preview-canvas {
      transition: none !important;
    }
    .project-card[${HANDOFF_ATTR}] .dither-preview-canvas {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    .project-card[${HANDOFF_ATTR}] .active-color-snow-canvas {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    .${CANVAS_CLASS} {
      position: absolute;
      inset: 0;
      z-index: 9 !important;
      display: block;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      opacity: 1;
      visibility: visible;
      pointer-events: none;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      contain: strict;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    @media (prefers-reduced-motion: reduce) {
      .${CANVAS_CLASS} { display: none !important; }
    }
  `
}

function nearViewport(card, margin = 260) {
  const rect = card?.getBoundingClientRect?.()
  if (!rect) return false
  const height = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  return rect.bottom >= -margin && rect.top <= height + margin
}

function gridSize(media) {
  const rect = media.getBoundingClientRect()
  let cols = Math.max(1, Math.ceil(Math.max(1, rect.width) / CELL_PX))
  let rows = Math.max(1, Math.ceil(Math.max(1, rect.height) / CELL_PX))
  const count = cols * rows
  if (count > MAX_GRID_CELLS) {
    const scale = Math.sqrt(count / MAX_GRID_CELLS)
    cols = Math.max(1, Math.floor(cols / scale))
    rows = Math.max(1, Math.floor(rows / scale))
  }
  return { cols, rows }
}

function ensureCanvas(card, cols, rows) {
  const media = card?.querySelector(".project-media")
  if (!media) return null
  let canvas = media.querySelector(`:scope > .${CANVAS_CLASS}`)
  if (!canvas) {
    canvas = document.createElement("canvas")
    canvas.className = CANVAS_CLASS
    canvas.setAttribute("aria-hidden", "true")
    media.appendChild(canvas)
  }
  if (canvas.width !== cols) canvas.width = cols
  if (canvas.height !== rows) canvas.height = rows
  return canvas
}

function buildGrid(card, finalCanvas) {
  const media = card?.querySelector(".project-media")
  if (!media || !finalCanvas || finalCanvas.width < 2 || finalCanvas.height < 2) return null
  const { cols, rows } = gridSize(media)
  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const ctx = sample.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false
  try {
    ctx.drawImage(finalCanvas, 0, 0, cols, rows)
  } catch {
    return null
  }
  const pixels = new Uint8ClampedArray(ctx.getImageData(0, 0, cols, rows).data)
  const count = cols * rows
  const order = new Float32Array(count)
  const phase = new Float32Array(count)
  const rate = new Float32Array(count)
  const seed = Number(FINE_SIGNAL.activeColorSeed) || 41

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const offset = index * 4
      const local = hash01(seed, col, row, 1)
      const groupCol = Math.floor(col / CLUSTER_SIZE)
      const groupRow = Math.floor(row / CLUSTER_SIZE)
      const cluster = hash01(seed, groupCol, groupRow, 11)
      const groupPhase = hash01(seed, groupCol, groupRow, 17)
      const individual = hash01(seed, row, col, 23)
      const luma = (
        pixels[offset] * 0.2126 +
        pixels[offset + 1] * 0.7152 +
        pixels[offset + 2] * 0.0722
      ) / 255
      const inkBias = (1 - luma) * 0.075
      order[index] = clamp(local * (1 - CLUSTER_MIX) + cluster * CLUSTER_MIX - inkBias)
      phase[index] = groupPhase * TAU + (individual - 0.5) * 0.82
      rate[index] = 0.18 + hash01(seed, groupRow, groupCol, 31) * 0.22
    }
  }

  return { cols, rows, count, pixels, order, phase, rate }
}

function breathingWave(timeSeconds, phase, rate) {
  const primary = Math.sin(timeSeconds * TAU * rate + phase)
  const drift = Math.sin(timeSeconds * TAU * rate * 0.41 + phase * 0.63 + 1.07)
  const secondary = Math.sin(timeSeconds * TAU * rate * 1.47 + phase * 1.29 - 0.62)
  return clamp(0.5 + primary * 0.25 + drift * 0.16 + secondary * 0.045)
}

function cancelState(card, { removeCanvas = true, keepAttribute = false } = {}) {
  const state = states.get(card)
  if (state) activeStates.delete(state)
  states.delete(card)
  if (!keepAttribute) card?.removeAttribute(HANDOFF_ATTR)
  if (removeCanvas) card?.querySelector(`.${CANVAS_CLASS}`)?.remove()
  return state || null
}

function renderState(state, now) {
  const { card, canvas, ctx, grid } = state
  if (!card.isConnected || !canvas.isConnected) {
    cancelState(card)
    return
  }
  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) return
  state.lastDraw = now

  const elapsed = now - state.startTime
  const raw = clamp(elapsed / Math.max(1, state.duration))
  const eased = 1 - Math.pow(1 - raw, 1.42)
  state.coverage = state.fromCoverage + (state.toCoverage - state.fromCoverage) * eased
  const coverage = clamp(state.coverage)
  const timeSeconds = now / 1000
  const data = state.framePixels
  data.fill(0)

  const softness = 0.092
  const breatheAmount = 0.045 + SIGNAL_FLICKER * 0.035
  for (let index = 0; index < grid.count; index += 1) {
    const threshold = 0.035 + grid.order[index] * 0.93
    let alpha = smooth01((coverage - threshold + softness) / (softness * 2))
    if (alpha <= 0.001) continue

    const transitionBand = 4 * alpha * (1 - alpha)
    if (transitionBand > 0.001) {
      const breath = breathingWave(timeSeconds, grid.phase[index], grid.rate[index])
      alpha = clamp(alpha + (breath - 0.5) * 2 * breatheAmount * transitionBand)
    }

    const offset = index * 4
    data[offset] = grid.pixels[offset]
    data[offset + 1] = grid.pixels[offset + 1]
    data[offset + 2] = grid.pixels[offset + 2]
    data[offset + 3] = Math.round(grid.pixels[offset + 3] * alpha)
  }

  ctx.putImageData(state.imageData, 0, 0)
  if (raw < 1) return

  activeStates.delete(state)
  states.delete(card)
  state.coverage = state.toCoverage

  if (state.direction === "in") {
    card.removeAttribute(HANDOFF_ATTR)
    requestAnimationFrame(() => {
      if (canvas.isConnected) canvas.remove()
      window.dispatchEvent(new CustomEvent("red:binary-handoff-complete", { detail: { card, direction: "in" } }))
    })
  } else {
    card.removeAttribute(HANDOFF_ATTR)
    canvas.remove()
    window.dispatchEvent(new CustomEvent("red:binary-handoff-complete", { detail: { card, direction: "out" } }))
  }
}

function animationLoop(now) {
  animationFrame = 0
  for (const state of [...activeStates]) renderState(state, now)
  if (activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function scheduleLoop() {
  if (!animationFrame && activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function startHandoff(card, direction, finalCanvas) {
  if (!card?.isConnected || !nearViewport(card) || prefersReducedMotion()) {
    card?.removeAttribute(HANDOFF_ATTR)
    return false
  }
  const grid = buildGrid(card, finalCanvas)
  if (!grid) return false

  const previous = states.get(card)
  const fromCoverage = previous?.coverage ?? (direction === "in" ? 0 : 1)
  if (previous) activeStates.delete(previous)

  const canvas = ensureCanvas(card, grid.cols, grid.rows)
  const ctx = canvas?.getContext("2d", { alpha: true })
  if (!canvas || !ctx) return false
  ctx.imageSmoothingEnabled = false

  const framePixels = new Uint8ClampedArray(grid.count * 4)
  const state = {
    card,
    direction,
    canvas,
    ctx,
    grid,
    framePixels,
    imageData: new ImageData(framePixels, grid.cols, grid.rows),
    fromCoverage,
    toCoverage: direction === "in" ? 1 : 0,
    coverage: fromCoverage,
    duration: direction === "in" ? IN_DURATION_MS : OUT_DURATION_MS,
    startTime: performance.now(),
    lastDraw: 0,
  }
  card.setAttribute(HANDOFF_ATTR, direction)
  states.set(card, state)
  activeStates.add(state)
  renderState(state, state.startTime)
  scheduleLoop()
  return true
}

function finalCanvasFor(card) {
  return card?.querySelector(".dither-preview-canvas") || null
}

function clearPending(card) {
  const ticket = pending.get(card)
  if (ticket?.timer) clearTimeout(ticket.timer)
  pending.delete(card)
}

function waitForBinary(card, direction, startedAt = performance.now()) {
  clearPending(card)
  if (!card?.isConnected) return

  if (direction === "out") {
    const finalCanvas = finalCanvasFor(card)
    if (finalCanvas?.width > 1 && finalCanvas.height > 1) {
      startHandoff(card, direction, finalCanvas)
      return
    }
    card.removeAttribute(HANDOFF_ATTR)
    return
  }

  card.setAttribute(HANDOFF_ATTR, "in-pending")
  const attempt = () => {
    if (!card.isConnected || !card.classList.contains("is-filter-muted")) {
      clearPending(card)
      card.removeAttribute(HANDOFF_ATTR)
      return
    }
    const finalCanvas = finalCanvasFor(card)
    if (
      finalCanvas?.dataset.active === "true" &&
      finalCanvas.width > 1 &&
      finalCanvas.height > 1
    ) {
      clearPending(card)
      startHandoff(card, "in", finalCanvas)
      return
    }
    if (performance.now() - startedAt >= MAX_WAIT_MS) {
      clearPending(card)
      card.removeAttribute(HANDOFF_ATTR)
      return
    }
    const timer = window.setTimeout(attempt, 54)
    pending.set(card, { direction, timer })
  }
  attempt()
}

function handleMutedChange(card, oldClassName) {
  if (!(card instanceof Element) || !card.classList.contains("project-card")) return
  const wasMuted = String(oldClassName || "").split(/\s+/).includes("is-filter-muted")
  const isMuted = card.classList.contains("is-filter-muted")
  if (wasMuted === isMuted) return

  const previous = states.get(card)
  if (previous) {
    const finalCanvas = finalCanvasFor(card)
    if (finalCanvas?.width > 1 && finalCanvas.height > 1) {
      startHandoff(card, isMuted ? "in" : "out", finalCanvas)
      return
    }
  }
  waitForBinary(card, isMuted ? "in" : "out")
}

function bindCatalog(nextCatalog) {
  if (catalog === nextCatalog && catalogObserver) return
  catalogObserver?.disconnect()
  catalogObserver = null
  catalog = nextCatalog || null
  if (!catalog || !("MutationObserver" in window)) return

  catalogObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "attributes" || mutation.attributeName !== "class") continue
      handleMutedChange(mutation.target, mutation.oldValue)
    }
  })
  catalogObserver.observe(catalog, {
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["class"],
  })
}

function boot() {
  ensureStyles()
  const app = document.querySelector("#app")
  bindCatalog(document.querySelector(".catalog"))
  if (!app || !("MutationObserver" in window)) return
  appObserver?.disconnect()
  appObserver = new MutationObserver(() => bindCatalog(document.querySelector(".catalog")))
  appObserver.observe(app, { childList: true, subtree: false })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}

window.__RED_BINARY_PIXEL_HANDOFF__ = {
  enabled: true,
  preset: "fine-signal",
  play(card, direction = "in") {
    const finalCanvas = finalCanvasFor(card)
    if (!finalCanvas) return false
    return startHandoff(card, direction, finalCanvas)
  },
  cancel(card) {
    clearPending(card)
    cancelState(card)
  },
}
