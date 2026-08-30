import { PUBLISHED_MOTION_CONFIG, sanitizeMotionConfig } from "./motion-default.js"

const STYLE_ID = "red-dither-reveal-motion-style"
const CANVAS_CLASS = "dither-reveal-canvas"
const TARGET_FRAME_MS = 1000 / 60
const MAX_GRID_CELLS = 52000
const VIEWPORT_LINGER_MS = 220
const VIEWPORT_PROGRESS_EPSILON = 0.0025
const ROW_INTRO_OVERLAP = 0.58
const MAX_GRID_CACHE_PER_CANVAS = 6

const animationStates = new WeakMap()
const activeStates = new Set()
const viewportStates = new Set()
const gridCache = new WeakMap()

let animationFrame = 0
let viewportFrame = 0
let viewportActiveUntil = 0
let rowIntroStarts = new WeakMap()
let nextRowIntroStartAt = 0
let replayFrame = 0
let lastRevealConfigKey = ""

const REVEAL_KEYS = [
  "revealEnabled", "revealMode", "revealDirection", "revealDurationMs",
  "revealDelayMs", "revealStaggerMs", "revealSettleMs", "revealCurve",
  "revealSeed", "revealCellPx", "revealNoisePeak", "revealNoiseFlicker",
  "revealNoisePersistence", "revealThresholdBias", "revealClusterSize",
  "revealClusterCount", "revealClusterSpread", "revealClusterJitter",
  "revealScanFeather", "revealScanNoiseMix", "revealScanOvershoot",
]

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

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

function revealConfigKey(config) {
  return REVEAL_KEYS.map((key) => `${key}:${config[key]}`).join("|")
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    .${CANVAS_CLASS} {
      position: absolute;
      inset: 0;
      z-index: 7 !important;
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
    .project-card.is-muted-restore-intent .${CANVAS_CLASS} {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    @media (prefers-reduced-motion: reduce) {
      .${CANVAS_CLASS} { display: none !important; }
    }
  `
  document.head.appendChild(style)
}

function parseColor(css) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return [0, 0, 0, 255]
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  return [...ctx.getImageData(0, 0, 1, 1).data]
}

let colorCacheKey = ""
let colorCacheValue = null

function readColors() {
  const styles = getComputedStyle(document.documentElement)
  const paper = styles.getPropertyValue("--paper").trim() || "#fff"
  const ink = styles.getPropertyValue("--ink").trim() || "#111"
  const key = `${paper}|${ink}`
  if (key === colorCacheKey && colorCacheValue) return colorCacheValue
  colorCacheKey = key
  colorCacheValue = { paper: parseColor(paper), ink: parseColor(ink) }
  return colorCacheValue
}

export function cancelReveal(card, { remove = false } = {}) {
  const current = animationStates.get(card)
  if (current?.settleTimer) clearTimeout(current.settleTimer)
  if (current) {
    activeStates.delete(current)
    viewportStates.delete(current)
  }
  animationStates.delete(card)
  const canvas = card?.querySelector(`.${CANVAS_CLASS}`)
  if (!canvas) return
  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  canvas.style.visibility = "visible"
  if (remove) canvas.remove()
}

function logicalGridSize(finalCanvas, config) {
  const rect = finalCanvas.getBoundingClientRect()
  const cssWidth = Math.max(1, rect.width)
  const cssHeight = Math.max(1, rect.height)
  let cols = Math.max(1, Math.ceil(cssWidth / Math.max(1, config.revealCellPx)))
  let rows = Math.max(1, Math.ceil(cssHeight / Math.max(1, config.revealCellPx)))
  const cellCount = cols * rows
  if (cellCount > MAX_GRID_CELLS) {
    const scale = Math.sqrt(cellCount / MAX_GRID_CELLS)
    cols = Math.max(1, Math.floor(cols / scale))
    rows = Math.max(1, Math.floor(rows / scale))
  }
  return { cols, rows }
}

function ensureRevealCanvas(card, cols, rows) {
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

function gridCacheKey(finalCanvas, config, cols, rows) {
  const card = finalCanvas.closest(".project-card")
  const img = card?.querySelector(".project-media img")
  return [
    `${finalCanvas.width}x${finalCanvas.height}`,
    `${cols}x${rows}`,
    finalCanvas.dataset.publishedMode || "",
    img?.currentSrc || img?.src || "",
    config.revealSeed,
    config.revealDirection,
    config.revealThresholdBias,
    config.revealClusterSize,
    config.revealClusterCount,
    config.revealClusterSpread,
    config.revealClusterJitter,
    config.revealScanNoiseMix,
  ].join("|")
}

function buildGrid(finalCanvas, config) {
  const { cols, rows } = logicalGridSize(finalCanvas, config)
  const cacheKey = gridCacheKey(finalCanvas, config, cols, rows)
  let perCanvas = gridCache.get(finalCanvas)
  if (perCanvas?.has(cacheKey)) return perCanvas.get(cacheKey)

  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const sampleCtx = sample.getContext("2d", { willReadFrequently: true })
  if (!sampleCtx) return null
  sampleCtx.imageSmoothingEnabled = false
  sampleCtx.drawImage(finalCanvas, 0, 0, cols, rows)
  const sampled = sampleCtx.getImageData(0, 0, cols, rows).data

  const count = cols * rows
  const darkness = new Float32Array(count)
  const pixelOrder = new Float32Array(count)
  const thresholdOrder = new Float32Array(count)
  const clusterOrder = new Float32Array(count)
  const scanOrder = new Float32Array(count)

  const centers = Array.from({ length: config.revealClusterCount }, (_, index) => ({
    x: hash01(config.revealSeed, index, 91, 7),
    y: hash01(config.revealSeed, index, 37, 11),
  }))

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const p = index * 4
      const dark = 1 - (
        sampled[p] * 0.2126 + sampled[p + 1] * 0.7152 + sampled[p + 2] * 0.0722
      ) / 255
      const nx = (col + 0.5) / cols
      const ny = (row + 0.5) / rows
      const random = hash01(config.revealSeed, col, row, 1)
      let scanPosition = ny
      if (config.revealDirection === "bottom") scanPosition = 1 - ny
      else if (config.revealDirection === "left") scanPosition = nx
      else if (config.revealDirection === "right") scanPosition = 1 - nx
      else if (config.revealDirection === "center") {
        scanPosition = Math.max(Math.abs(nx - 0.5) * 2, Math.abs(ny - 0.5) * 2)
      }
      let nearest = 1
      for (const center of centers) {
        nearest = Math.min(nearest, Math.hypot(nx - center.x, ny - center.y) / Math.SQRT2)
      }
      const clusterScale = 5.5 / Math.max(1, config.revealClusterSize)
      darkness[index] = dark
      pixelOrder[index] = random
      thresholdOrder[index] = clamp((1 - dark + config.revealThresholdBias) * 0.68 + random * 0.32)
      clusterOrder[index] = clamp(
        nearest * clusterScale * (1.25 - config.revealClusterSpread * 0.55) +
          (random - 0.5) * config.revealClusterJitter * 0.38,
      )
      scanOrder[index] = clamp(
        scanPosition * (1 - config.revealScanNoiseMix * 0.32) +
          random * config.revealScanNoiseMix * 0.32,
      )
    }
  }

  const grid = { cols, rows, count, darkness, pixelOrder, thresholdOrder, clusterOrder, scanOrder }
  if (!perCanvas) {
    perCanvas = new Map()
    gridCache.set(finalCanvas, perCanvas)
  }
  perCanvas.set(cacheKey, grid)
  while (perCanvas.size > MAX_GRID_CACHE_PER_CANVAS) {
    const oldestKey = perCanvas.keys().next().value
    perCanvas.delete(oldestKey)
  }
  return grid
}

function orderArray(grid, mode) {
  if (mode === "threshold-sweep") return grid.thresholdOrder
  if (mode === "cluster-bloom") return grid.clusterOrder
  if (mode === "scan-lock") return grid.scanOrder
  return grid.pixelOrder
}

function writePixel(data, offset, rgba) {
  data[offset] = rgba[0]
  data[offset + 1] = rgba[1]
  data[offset + 2] = rgba[2]
  data[offset + 3] = rgba[3]
}

function writePaperFrame(state) {
  const { grid, colors, framePixels, ctx } = state
  for (let index = 0; index < grid.count; index += 1) {
    writePixel(framePixels, index * 4, colors.paper)
  }
  ctx.putImageData(state.imageData, 0, 0)
}

function renderProgress(state, rawProgress, now) {
  const { canvas, grid, config, colors } = state
  const raw = clamp(rawProgress)
  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  canvas.style.visibility = "visible"

  if (raw >= 1 - VIEWPORT_PROGRESS_EPSILON) {
    state.ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvas.style.opacity = "0"
    canvas.style.visibility = "hidden"
    state.lastProgress = 1
    return
  }

  if (raw <= VIEWPORT_PROGRESS_EPSILON) {
    if (state.lastProgress !== 0) writePaperFrame(state)
    state.lastProgress = 0
    return
  }

  const progress = 1 - Math.pow(1 - raw, Math.max(0.05, config.revealCurve))
  const scanProgress = clamp(progress * (1 + config.revealScanOvershoot))
  const frameTick = Math.floor(now / Math.max(16, 78 - config.revealNoiseFlicker * 56))
  const snowEnvelope = Math.sin(Math.PI * raw)
  const baseNoise = clamp(config.revealNoisePeak * (0.18 + snowEnvelope * 0.82))
  const order = orderArray(grid, config.revealMode)
  const data = state.framePixels
  data.fill(0)

  for (let index = 0; index < grid.count; index += 1) {
    let resolved = progress >= order[index]
    if (config.revealMode === "scan-lock") {
      const feather = Math.max(0.01, config.revealScanFeather)
      const edge = scanProgress - grid.scanOrder[index]
      if (edge >= feather) resolved = true
      else if (edge > -feather) {
        const edgeProgress = clamp((edge + feather) / (feather * 2))
        const col = index % grid.cols
        const row = Math.floor(index / grid.cols)
        resolved = hash01(config.revealSeed, col, row, 500 + frameTick) < edgeProgress
      } else resolved = false
    }
    if (resolved) continue

    const offset = index * 4
    writePixel(data, offset, colors.paper)
    let noiseDensity = baseNoise
    if (config.revealMode === "threshold-sweep") noiseDensity *= 0.52
    else if (config.revealMode === "cluster-bloom") noiseDensity *= 0.42
    else if (config.revealMode === "scan-lock") {
      const distance = Math.abs(scanProgress - grid.scanOrder[index])
      noiseDensity *= distance < config.revealScanFeather * 1.7 ? 1.2 : 0.22
    }
    const col = index % grid.cols
    const row = Math.floor(index / grid.cols)
    if (hash01(config.revealSeed, col, row, 1000 + frameTick) >= noiseDensity) continue
    const inkChance = clamp(
      0.5 + config.revealThresholdBias * 0.26 + (grid.darkness[index] - 0.5) * 0.18,
      0.08,
      0.92,
    )
    if (hash01(config.revealSeed, row, col, 2000 + frameTick) < inkChance) {
      writePixel(data, offset, colors.ink)
    }
  }

  state.ctx.putImageData(state.imageData, 0, 0)
  state.lastProgress = raw
}

function finishReveal(state) {
  activeStates.delete(state)
  const { card, canvas } = state
  state.ctx.clearRect(0, 0, canvas.width, canvas.height)
  canvas.style.transition = "none"
  canvas.style.opacity = "0"
  canvas.style.visibility = "hidden"
  if (animationStates.get(card) === state) animationStates.delete(card)
  canvas.remove()
}

function drawState(state, now) {
  const { card, finalCanvas, canvas, config, startTime } = state
  if (!card.isConnected || !finalCanvas.isConnected || !canvas.isConnected) {
    cancelReveal(card, { remove: true })
    return
  }
  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) return
  state.lastDraw = now
  const elapsed = now - startTime
  const raw = clamp((elapsed - config.revealDelayMs) / Math.max(1, config.revealDurationMs))
  renderProgress(state, raw, now)
  if (raw >= 1) finishReveal(state)
}

function animationLoop(now) {
  animationFrame = 0
  for (const state of [...activeStates]) drawState(state, now)
  if (activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function scheduleAnimationLoop() {
  if (!animationFrame && activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function viewportBounds() {
  const viewportBottom = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  const header = document.querySelector(".site-header")
  const headerBottom = clamp(header?.getBoundingClientRect?.().bottom || 0, 0, viewportBottom)
  return { top: headerBottom, bottom: viewportBottom }
}

function viewportRevealProgress(card, bounds) {
  const rect = card?.getBoundingClientRect?.()
  if (!rect || rect.height <= 0 || bounds.bottom <= bounds.top) return 0
  const visibleTop = Math.max(rect.top, bounds.top)
  const visibleBottom = Math.min(rect.bottom, bounds.bottom)
  const visibleHeight = Math.max(0, visibleBottom - visibleTop)
  const availableHeight = Math.max(1, bounds.bottom - bounds.top)
  const denominator = Math.max(1, Math.min(rect.height, availableHeight))
  return clamp(visibleHeight / denominator)
}

function rowIntroProgress(state, now, viewportProgress) {
  if (state.introDone) return 1
  if (viewportProgress <= 0) return 0
  const row = state.card.closest(".project-row") || state.card
  let start = rowIntroStarts.get(row)
  if (start == null) {
    const duration = Math.max(1, state.config.revealDurationMs)
    const rowSpacing = Math.max(90, duration * ROW_INTRO_OVERLAP)
    start = Math.max(now + state.config.revealDelayMs, nextRowIntroStartAt)
    rowIntroStarts.set(row, start)
    nextRowIntroStartAt = start + rowSpacing
  }
  const raw = clamp((now - start) / Math.max(1, state.config.revealDurationMs))
  if (raw >= 1) state.introDone = true
  return raw
}

function drawViewportState(state, now, bounds) {
  const { card, finalCanvas, canvas } = state
  if (!card.isConnected || !finalCanvas.isConnected || !canvas.isConnected) {
    cancelReveal(card, { remove: true })
    return false
  }
  const viewportProgress = viewportRevealProgress(card, bounds)
  const introProgress = rowIntroProgress(state, now, viewportProgress)
  const progress = Math.min(viewportProgress, introProgress)
  const needsIntroFrame = viewportProgress > 0 && !state.introDone
  if (
    state.lastProgress >= 0 &&
    Math.abs(progress - state.lastProgress) < VIEWPORT_PROGRESS_EPSILON &&
    progress !== 0 && progress !== 1
  ) return needsIntroFrame
  renderProgress(state, progress, now)
  return needsIntroFrame
}

function viewportLoop(now) {
  viewportFrame = 0
  if (!viewportStates.size || document.hidden) return
  const bounds = viewportBounds()
  let hasLiveIntro = false
  for (const state of [...viewportStates]) {
    if (drawViewportState(state, now, bounds)) hasLiveIntro = true
  }
  if (now < viewportActiveUntil || hasLiveIntro) viewportFrame = requestAnimationFrame(viewportLoop)
}

export function resetViewportDitherRevealSequence() {
  rowIntroStarts = new WeakMap()
  nextRowIntroStartAt = 0
}

export function refreshViewportDitherReveals({ linger = true } = {}) {
  if (!viewportStates.size || document.hidden) return
  if (linger) viewportActiveUntil = Math.max(viewportActiveUntil, performance.now() + VIEWPORT_LINGER_MS)
  if (!viewportFrame) viewportFrame = requestAnimationFrame(viewportLoop)
}

function createState(card, finalCanvas, config, grid, canvas, ctx, mode) {
  const framePixels = new Uint8ClampedArray(grid.count * 4)
  const imageData = new ImageData(framePixels, grid.cols, grid.rows)
  return {
    mode, card, finalCanvas, canvas, ctx, grid, config,
    colors: readColors(), lastProgress: -1, introDone: false,
    framePixels, imageData, settleTimer: 0,
  }
}

export function trackViewportDitherReveal(card, finalCanvas, inputConfig = null) {
  ensureStyles()
  const config = sanitizeMotionConfig(inputConfig || window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG)
  cancelReveal(card, { remove: true })
  if (
    !card || !finalCanvas || !config.revealEnabled || config.revealMode === "none" ||
    prefersReducedMotion() || finalCanvas.width < 2 || finalCanvas.height < 2
  ) return false

  const grid = buildGrid(finalCanvas, config)
  if (!grid) return false
  const canvas = ensureRevealCanvas(card, grid.cols, grid.rows)
  const ctx = canvas?.getContext("2d", { alpha: true })
  if (!canvas || !ctx) return false
  ctx.imageSmoothingEnabled = false
  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  canvas.style.visibility = "visible"

  const state = createState(card, finalCanvas, config, grid, canvas, ctx, "viewport")
  animationStates.set(card, state)
  viewportStates.add(state)
  refreshViewportDitherReveals({ linger: false })
  return true
}

export function playDitherReveal(card, finalCanvas, inputConfig = null, options = {}) {
  ensureStyles()
  const config = sanitizeMotionConfig(inputConfig || window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG)
  cancelReveal(card, { remove: true })
  if (
    !card || !finalCanvas || !config.revealEnabled || config.revealMode === "none" ||
    prefersReducedMotion() || finalCanvas.width < 2 || finalCanvas.height < 2
  ) return false

  const runtimeConfig = {
    ...config,
    revealDelayMs: config.revealDelayMs + Math.max(0, Number(options.index) || 0) * config.revealStaggerMs,
  }
  const grid = buildGrid(finalCanvas, runtimeConfig)
  if (!grid) return false
  const canvas = ensureRevealCanvas(card, grid.cols, grid.rows)
  const ctx = canvas?.getContext("2d", { alpha: true })
  if (!canvas || !ctx) return false
  ctx.imageSmoothingEnabled = false
  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  canvas.style.visibility = "visible"

  const state = createState(card, finalCanvas, runtimeConfig, grid, canvas, ctx, "time")
  state.startTime = performance.now()
  state.lastDraw = 0
  animationStates.set(card, state)
  activeStates.add(state)
  renderProgress(state, 0, state.startTime)
  scheduleAnimationLoop()
  return true
}

export function replayAllDitherReveals(inputConfig = null) {
  const config = sanitizeMotionConfig(inputConfig || window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG)
  const cards = [...document.querySelectorAll(".catalog[data-active-filter] .project-card.is-filter-muted")]
  cards.forEach((card, index) => {
    const finalCanvas = card.querySelector('.dither-preview-canvas[data-active="true"]')
    if (finalCanvas) playDitherReveal(card, finalCanvas, config, { index })
  })
}

function requestHubReplay(config) {
  if (replayFrame) cancelAnimationFrame(replayFrame)
  replayFrame = requestAnimationFrame(() => {
    replayFrame = 0
    requestAnimationFrame(() => replayAllDitherReveals(config))
  })
}

window.addEventListener("scroll", () => refreshViewportDitherReveals(), { passive: true })
window.addEventListener("resize", () => refreshViewportDitherReveals(), { passive: true })
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshViewportDitherReveals({ linger: false })
})
window.addEventListener("red:motion-config", (event) => {
  const config = sanitizeMotionConfig(event.detail || PUBLISHED_MOTION_CONFIG)
  const key = revealConfigKey(config)
  const panelOpen = document.querySelector(".dither-lab")?.dataset.open === "true"
  if (panelOpen && key !== lastRevealConfigKey) requestHubReplay(config)
  lastRevealConfigKey = key
})

ensureStyles()
lastRevealConfigKey = revealConfigKey(sanitizeMotionConfig(window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG))
window.__RED_REVEAL_MOTION__ = {
  play: playDitherReveal,
  trackViewport: trackViewportDitherReveal,
  refreshViewport: refreshViewportDitherReveals,
  resetViewportSequence: resetViewportDitherRevealSequence,
  replay: replayAllDitherReveals,
  cancel: cancelReveal,
}
