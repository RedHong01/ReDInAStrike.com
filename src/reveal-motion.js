import { PUBLISHED_MOTION_CONFIG, sanitizeMotionConfig } from "./motion-default.js"

const STYLE_ID = "red-dither-reveal-motion-style"
const CANVAS_CLASS = "dither-reveal-canvas"
const TARGET_FRAME_MS = 1000 / 60
const IDLE_FLICKER_FRAME_MS = 1000 / 30
const MAX_GRID_CELLS = 52000
const VIEWPORT_LINGER_MS = 220
const VIEWPORT_PROGRESS_EPSILON = 0.0025
const MAX_GRID_CACHE_PER_CANVAS = 6

const BOUNDARY_DEPTH_RATIO = 0.19
const BOUNDARY_DEPTH_MIN_PX = 132
const BOUNDARY_DEPTH_MAX_PX = 310
const BOUNDARY_HOLD_RATIO = 0.012
const BOUNDARY_HOLD_MIN_PX = 6
const BOUNDARY_HOLD_MAX_PX = 18
const PIXEL_THRESHOLD_MIN = 0.08
const PIXEL_THRESHOLD_SPAN = 0.84
const TAU = Math.PI * 2

const animationStates = new WeakMap()
const activeStates = new Set()
const viewportStates = new Set()
const gridCache = new WeakMap()

let animationFrame = 0
let viewportFrame = 0
let viewportActiveUntil = 0
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
  const flickerPhase = new Float32Array(count)
  const breathRate = new Float32Array(count)

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
      const randomB = hash01(config.revealSeed, row, col, 73)
      const groupCol = Math.floor(col / 3)
      const groupRow = Math.floor(row / 3)
      const groupPhase = hash01(config.revealSeed, groupCol, groupRow, 211)
      const groupRate = hash01(config.revealSeed, groupRow, groupCol, 313)

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
      flickerPhase[index] = groupPhase * TAU + (random - 0.5) * 0.72
      breathRate[index] = 0.22 + groupRate * 0.24 + (randomB - 0.5) * 0.028
    }
  }

  const grid = {
    cols, rows, count,
    darkness, pixelOrder, thresholdOrder, clusterOrder, scanOrder,
    flickerPhase, breathRate,
  }
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

function writePaperPixel(data, offset, paper, alpha = 1) {
  data[offset] = paper[0]
  data[offset + 1] = paper[1]
  data[offset + 2] = paper[2]
  data[offset + 3] = Math.round(clamp(alpha) * paper[3])
}

function writeMixedPixel(data, offset, paper, ink, inkMix, alpha) {
  const mix = clamp(inkMix)
  data[offset] = Math.round(paper[0] + (ink[0] - paper[0]) * mix)
  data[offset + 1] = Math.round(paper[1] + (ink[1] - paper[1]) * mix)
  data[offset + 2] = Math.round(paper[2] + (ink[2] - paper[2]) * mix)
  data[offset + 3] = Math.round(clamp(alpha) * 255)
}

function writePaperFrame(state) {
  const { grid, colors, framePixels, ctx } = state
  for (let index = 0; index < grid.count; index += 1) {
    writePaperPixel(framePixels, index * 4, colors.paper, 1)
  }
  ctx.putImageData(state.imageData, 0, 0)
}

function pixelSoftness(config, mode = "pixel-snow") {
  const base = 0.052 + config.revealNoisePersistence * 0.052
  if (mode === "scan-lock") return Math.max(base, config.revealScanFeather * 0.72)
  return base
}

function breathingWave(timeSeconds, cellPhase, rate) {
  const primary = Math.sin(timeSeconds * TAU * rate + cellPhase)
  const drift = Math.sin(timeSeconds * TAU * rate * 0.37 + cellPhase * 0.61 + 1.13)
  const secondary = Math.sin(timeSeconds * TAU * rate * 1.61 + cellPhase * 1.37 - 0.47)
  return clamp(0.5 + primary * 0.26 + drift * 0.17 + secondary * 0.055)
}

function transitionPresence(value) {
  const progress = clamp(value)
  return smooth01(progress / 0.18) * (1 - smooth01((progress - 0.82) / 0.18))
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
  const order = orderArray(grid, config.revealMode)
  const softness = pixelSoftness(config, config.revealMode)
  const data = state.framePixels
  const timeSeconds = now / 1000
  const breathAmount = 0.024 + config.revealNoiseFlicker * 0.058
  data.fill(0)

  for (let index = 0; index < grid.count; index += 1) {
    const baseOrder = config.revealMode === "scan-lock" ? grid.scanOrder[index] : order[index]
    const threshold = PIXEL_THRESHOLD_MIN + baseOrder * PIXEL_THRESHOLD_SPAN
    const localProgress = config.revealMode === "scan-lock" ? scanProgress : progress
    const revealT = smooth01((localProgress - threshold + softness) / (softness * 2))
    let overlayAlpha = 1 - revealT
    if (overlayAlpha <= 0.001) continue

    const transitionBand = 4 * overlayAlpha * (1 - overlayAlpha)
    const breath = breathingWave(timeSeconds, grid.flickerPhase[index], grid.breathRate[index])
    overlayAlpha = clamp(
      overlayAlpha + (breath - 0.5) * 2 * breathAmount * transitionBand,
    )

    const inkPulse = 0.28 + breath * 0.72
    const inkMix = transitionBand *
      inkPulse *
      config.revealNoisePeak *
      0.24 *
      (0.24 + grid.darkness[index] * 0.34)

    writeMixedPixel(
      data,
      index * 4,
      colors.paper,
      colors.ink,
      inkMix,
      overlayAlpha,
    )
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

function boundaryMetrics(bounds) {
  const span = Math.max(1, bounds.bottom - bounds.top)
  return {
    depth: clamp(span * BOUNDARY_DEPTH_RATIO, BOUNDARY_DEPTH_MIN_PX, BOUNDARY_DEPTH_MAX_PX),
    hold: clamp(span * BOUNDARY_HOLD_RATIO, BOUNDARY_HOLD_MIN_PX, BOUNDARY_HOLD_MAX_PX),
  }
}

function boundaryStrength(y, bounds, metrics) {
  const fromTop = y - bounds.top
  const fromBottom = bounds.bottom - y
  if (fromTop <= 0 || fromBottom <= 0) return 1

  const nearest = Math.min(fromTop, fromBottom)
  if (nearest <= metrics.hold) return 1
  if (nearest >= metrics.hold + metrics.depth) return 0
  return 1 - smooth01((nearest - metrics.hold) / metrics.depth)
}

function renderBoundaryField(state, now, bounds) {
  const { card, finalCanvas, canvas, grid, config, colors } = state
  if (!card.isConnected || !finalCanvas.isConnected || !canvas.isConnected) {
    cancelReveal(card, { remove: true })
    return false
  }

  const rect = canvas.getBoundingClientRect()
  if (rect.height <= 0 || rect.width <= 0) return false

  const metrics = boundaryMetrics(bounds)
  const softness = pixelSoftness(config, "pixel-snow")
  const breathAmount = 0.045 + config.revealNoiseFlicker * 0.11
  const timeSeconds = now / 1000
  const data = state.framePixels
  data.fill(0)

  let hasInfluence = false
  let hasTransition = false
  let maxStrength = 0
  let minStrength = 1

  for (let row = 0; row < grid.rows; row += 1) {
    const viewportY = rect.top + ((row + 0.5) / grid.rows) * rect.height
    const strength = boundaryStrength(viewportY, bounds, metrics)
    maxStrength = Math.max(maxStrength, strength)
    minStrength = Math.min(minStrength, strength)

    if (strength <= 0.0005) continue
    hasInfluence = true

    const rowStart = row * grid.cols
    const rowEnd = rowStart + grid.cols

    if (strength >= 0.9995) {
      for (let index = rowStart; index < rowEnd; index += 1) {
        writePaperPixel(data, index * 4, colors.paper, 1)
      }
      continue
    }

    hasTransition = true

    for (let index = rowStart; index < rowEnd; index += 1) {
      const threshold = PIXEL_THRESHOLD_MIN + grid.pixelOrder[index] * PIXEL_THRESHOLD_SPAN
      const breath = breathingWave(timeSeconds, grid.flickerPhase[index], grid.breathRate[index])
      const breathShift = (breath - 0.5) * 2 * breathAmount * transitionPresence(strength)
      let coverAlpha = smooth01((strength + breathShift - threshold + softness) / (softness * 2))
      if (coverAlpha <= 0.001) continue

      const transitionBand = 4 * coverAlpha * (1 - coverAlpha)
      coverAlpha = clamp(
        coverAlpha + (breath - 0.5) * 2 * breathAmount * 0.42 * transitionBand,
      )

      const inkPulse = 0.25 + breath * 0.75
      const inkMix = transitionBand *
        inkPulse *
        config.revealNoisePeak *
        0.26 *
        (0.27 + grid.darkness[index] * 0.36)

      writeMixedPixel(
        data,
        index * 4,
        colors.paper,
        colors.ink,
        inkMix,
        coverAlpha,
      )
    }
  }

  if (!hasInfluence || maxStrength <= 0.0005) {
    if (state.boundaryVisible !== false) {
      state.ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.style.opacity = "0"
      canvas.style.visibility = "hidden"
    }
    state.boundaryVisible = false
    state.lastBoundaryStrength = 0
    return false
  }

  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  canvas.style.visibility = "visible"
  state.ctx.putImageData(state.imageData, 0, 0)
  state.boundaryVisible = true
  state.lastBoundaryStrength = maxStrength

  return hasTransition && minStrength < 0.9995
}

function drawViewportState(state, now, bounds, forceScrollFrame) {
  if (!forceScrollFrame && state.lastViewportDraw && now - state.lastViewportDraw < IDLE_FLICKER_FRAME_MS) {
    return state.hasBoundaryTransition === true
  }
  state.lastViewportDraw = now
  state.hasBoundaryTransition = renderBoundaryField(state, now, bounds)
  return state.hasBoundaryTransition
}

function viewportLoop(now) {
  viewportFrame = 0
  if (!viewportStates.size || document.hidden) return

  const bounds = viewportBounds()
  const forceScrollFrame = now < viewportActiveUntil
  let hasBoundaryTransition = false

  for (const state of [...viewportStates]) {
    if (drawViewportState(state, now, bounds, forceScrollFrame)) {
      hasBoundaryTransition = true
    }
  }

  if (forceScrollFrame || hasBoundaryTransition) {
    viewportFrame = requestAnimationFrame(viewportLoop)
  }
}

export function resetViewportDitherRevealSequence() {
  // Public reveal is spatial now: the viewport rules are the only origins.
  // Keep this export for runtime compatibility; there is no row-timed sequence to reset.
}

export function refreshViewportDitherReveals({ linger = true } = {}) {
  if (!viewportStates.size || document.hidden) return
  if (linger) {
    viewportActiveUntil = Math.max(viewportActiveUntil, performance.now() + VIEWPORT_LINGER_MS)
  }
  if (!viewportFrame) viewportFrame = requestAnimationFrame(viewportLoop)
}

function createState(card, finalCanvas, config, grid, canvas, ctx, mode) {
  const framePixels = new Uint8ClampedArray(grid.count * 4)
  const imageData = new ImageData(framePixels, grid.cols, grid.rows)
  return {
    mode, card, finalCanvas, canvas, ctx, grid, config,
    colors: readColors(),
    lastProgress: -1,
    framePixels,
    imageData,
    settleTimer: 0,
    lastViewportDraw: 0,
    hasBoundaryTransition: false,
    boundaryVisible: null,
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
