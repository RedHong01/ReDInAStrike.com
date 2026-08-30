import { PUBLISHED_MOTION_CONFIG, sanitizeMotionConfig } from "./motion-default.js"

const STYLE_ID = "red-dither-reveal-motion-style"
const CANVAS_CLASS = "dither-reveal-canvas"
const animationStates = new WeakMap()
const TARGET_FRAME_MS = 1000 / 45
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
      contain: strict;
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

function readColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    paper: styles.getPropertyValue("--paper").trim() || "#fff",
    ink: styles.getPropertyValue("--ink").trim() || "#111",
  }
}

function ensureRevealCanvas(card, finalCanvas) {
  const media = card?.querySelector(".project-media")
  if (!media || !finalCanvas) return null
  let canvas = media.querySelector(`:scope > .${CANVAS_CLASS}`)
  if (!canvas) {
    canvas = document.createElement("canvas")
    canvas.className = CANVAS_CLASS
    canvas.setAttribute("aria-hidden", "true")
    media.appendChild(canvas)
  }
  if (canvas.width !== finalCanvas.width) canvas.width = finalCanvas.width
  if (canvas.height !== finalCanvas.height) canvas.height = finalCanvas.height
  return canvas
}

function cancelReveal(card, { remove = false } = {}) {
  const current = animationStates.get(card)
  if (current?.frame) cancelAnimationFrame(current.frame)
  if (current?.settleTimer) clearTimeout(current.settleTimer)
  animationStates.delete(card)
  const canvas = card?.querySelector(`.${CANVAS_CLASS}`)
  if (!canvas) return
  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  if (remove) canvas.remove()
}

function buildGrid(finalCanvas, config) {
  const rect = finalCanvas.getBoundingClientRect()
  const cssWidth = Math.max(1, rect.width)
  const scale = Math.max(0.25, finalCanvas.width / cssWidth)
  const cellSize = Math.max(1, Math.round(config.revealCellPx * scale))
  const cols = Math.max(1, Math.ceil(finalCanvas.width / cellSize))
  const rows = Math.max(1, Math.ceil(finalCanvas.height / cellSize))

  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const sampleCtx = sample.getContext("2d", { willReadFrequently: true })
  if (!sampleCtx) return []
  sampleCtx.drawImage(finalCanvas, 0, 0, cols, rows)
  const pixels = sampleCtx.getImageData(0, 0, cols, rows).data

  const centers = Array.from({ length: config.revealClusterCount }, (_, index) => ({
    x: hash01(config.revealSeed, index, 91, 7),
    y: hash01(config.revealSeed, index, 37, 11),
  }))

  const cells = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const p = index * 4
      const darkness = 1 - (
        pixels[p] * 0.2126 + pixels[p + 1] * 0.7152 + pixels[p + 2] * 0.0722
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
      cells.push({
        col,
        row,
        x: col * cellSize,
        y: row * cellSize,
        w: Math.min(cellSize, finalCanvas.width - col * cellSize),
        h: Math.min(cellSize, finalCanvas.height - row * cellSize),
        darkness,
        pixelOrder: random,
        thresholdOrder: clamp((1 - darkness + config.revealThresholdBias) * 0.68 + random * 0.32),
        clusterOrder: clamp(
          nearest * clusterScale * (1.25 - config.revealClusterSpread * 0.55) +
          (random - 0.5) * config.revealClusterJitter * 0.38,
        ),
        scanOrder: clamp(
          scanPosition * (1 - config.revealScanNoiseMix * 0.32) +
          random * config.revealScanNoiseMix * 0.32,
        ),
      })
    }
  }
  return cells
}

function cellOrder(cell, mode) {
  if (mode === "threshold-sweep") return cell.thresholdOrder
  if (mode === "cluster-bloom") return cell.clusterOrder
  if (mode === "scan-lock") return cell.scanOrder
  return cell.pixelOrder
}

function drawFrame(state, now) {
  const { card, finalCanvas, canvas, ctx, cells, config, colors, startTime } = state
  if (!card.isConnected || !finalCanvas.isConnected || !canvas.isConnected) {
    cancelReveal(card, { remove: true })
    return
  }

  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) {
    state.frame = requestAnimationFrame((time) => drawFrame(state, time))
    return
  }
  state.lastDraw = now

  const elapsed = now - startTime
  const raw = clamp((elapsed - config.revealDelayMs) / Math.max(1, config.revealDurationMs))
  const progress = 1 - Math.pow(1 - raw, Math.max(0.05, config.revealCurve))
  const scanProgress = clamp(progress * (1 + config.revealScanOvershoot))
  const frameTick = Math.floor(Math.max(0, elapsed) / Math.max(16, 78 - config.revealNoiseFlicker * 56))
  const snowEnvelope = Math.sin(Math.PI * clamp(raw * 1.05))
  const remainingNoise = 1 - raw * (1 - config.revealNoisePersistence)
  const baseNoise = clamp(config.revealNoisePeak * (0.25 + snowEnvelope * 0.75) * remainingNoise)

  // Draw the exact final dither once, then mask only unresolved screen cells.
  ctx.globalAlpha = 1
  ctx.drawImage(finalCanvas, 0, 0, canvas.width, canvas.height)
  ctx.fillStyle = colors.paper

  for (const cell of cells) {
    const order = cellOrder(cell, config.revealMode)
    let resolved = progress >= order

    if (config.revealMode === "scan-lock") {
      const feather = Math.max(0.01, config.revealScanFeather)
      const edge = scanProgress - cell.scanOrder
      if (edge >= feather) resolved = true
      else if (edge > -feather) {
        const edgeProgress = clamp((edge + feather) / (feather * 2))
        resolved = hash01(config.revealSeed, cell.col, cell.row, 500 + frameTick) < edgeProgress
      } else resolved = false
    }

    if (resolved) continue

    ctx.fillStyle = colors.paper
    ctx.fillRect(cell.x, cell.y, cell.w, cell.h)

    let noiseDensity = baseNoise
    if (config.revealMode === "threshold-sweep") noiseDensity *= 0.52
    else if (config.revealMode === "cluster-bloom") noiseDensity *= 0.42
    else if (config.revealMode === "scan-lock") {
      const distance = Math.abs(scanProgress - cell.scanOrder)
      noiseDensity *= distance < config.revealScanFeather * 1.7 ? 1.2 : 0.22
    }

    if (hash01(config.revealSeed, cell.col, cell.row, 1000 + frameTick) >= noiseDensity) continue
    const inkChance = clamp(
      0.5 + config.revealThresholdBias * 0.26 + (cell.darkness - 0.5) * 0.18,
      0.08,
      0.92,
    )
    if (hash01(config.revealSeed, cell.row, cell.col, 2000 + frameTick) < inkChance) {
      ctx.fillStyle = colors.ink
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h)
    }
  }

  if (raw >= 1) {
    ctx.drawImage(finalCanvas, 0, 0, canvas.width, canvas.height)
    canvas.style.transition = config.revealSettleMs > 0
      ? `opacity ${config.revealSettleMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : "none"
    requestAnimationFrame(() => { canvas.style.opacity = "0" })
    state.settleTimer = window.setTimeout(() => {
      if (animationStates.get(card) !== state) return
      animationStates.delete(card)
      canvas.remove()
    }, config.revealSettleMs + 80)
    return
  }

  state.frame = requestAnimationFrame((time) => drawFrame(state, time))
}

export function playDitherReveal(card, finalCanvas, inputConfig = null, options = {}) {
  ensureStyles()
  const config = sanitizeMotionConfig(inputConfig || window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG)
  cancelReveal(card, { remove: true })
  if (
    !card || !finalCanvas || !config.revealEnabled || config.revealMode === "none" ||
    prefersReducedMotion() || finalCanvas.width < 2 || finalCanvas.height < 2
  ) return false

  const canvas = ensureRevealCanvas(card, finalCanvas)
  const ctx = canvas?.getContext("2d", { alpha: false })
  if (!canvas || !ctx) return false

  const runtimeConfig = {
    ...config,
    revealDelayMs: config.revealDelayMs + Math.max(0, Number(options.index) || 0) * config.revealStaggerMs,
  }
  const cells = buildGrid(finalCanvas, runtimeConfig)
  if (!cells.length) return false

  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  const state = {
    card,
    finalCanvas,
    canvas,
    ctx,
    cells,
    config: runtimeConfig,
    colors: readColors(),
    startTime: performance.now(),
    lastDraw: 0,
    frame: 0,
    settleTimer: 0,
  }
  animationStates.set(card, state)
  state.frame = requestAnimationFrame((time) => drawFrame(state, time))
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
  replay: replayAllDitherReveals,
  cancel: cancelReveal,
}
