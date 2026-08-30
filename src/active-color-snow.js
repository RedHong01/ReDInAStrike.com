import {
  PUBLISHED_ACTIVE_COLOR_CONFIG,
  decodeActiveColorConfig,
  sanitizeActiveColorConfig,
} from "./active-color-default.js"
import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"

const STYLE_ID = "red-active-color-snow-style"
const STYLE_VERSION = "1"
const CANVAS_CLASS = "active-color-snow-canvas"
const ROOT_ATTRIBUTE = "data-red-active-color-snow"
const RETURN_ATTRIBUTE = "data-active-color-return"
const MOTION_ATTRIBUTE = "data-active-color-motion"
const BOUNDARY_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const EXIT_DURATION_ATTRIBUTE = "data-color-snow-exit-duration-ms"
const ENTER_DURATION_ATTRIBUTE = "data-color-snow-enter-duration-ms"
const ENTER_DEFER_ATTRIBUTE = "data-color-snow-enter-defer-ms"
const BOUNDARY_COOLDOWN_MS = 520
const MAX_GRID_CELLS = 42000
const MAX_PALETTE_CACHE = 72
const VIEWPORT_MARGIN = 620
const TARGET_FRAME_MS = 1000 / 60
const HOVER_SCROLL_SUPPRESS_MS = 260
const CATEGORY_READY_DEFER_STEP_MS = 9
const CATEGORY_READY_DEFER_MAX_MS = 150
const RESTORE_SOURCE_SELECTOR =
  '.dither-preview-canvas[data-active="true"], .project-halftone'
const RUNTIME_OVERLAY_CLASSES = [
  CANVAS_CLASS,
  "active-color-placeholder-canvas",
  "dither-preview-canvas",
  "dither-reveal-canvas",
  "dither-resize-snow-canvas",
  "dither-hover-return-snow-canvas",
  "binary-pixel-handoff-canvas",
]

const cardStates = new WeakMap()
const activeStates = new Set()
const paletteCache = new Map()
const prewarmQueued = new Set()
const prewarmImageBound = new WeakSet()
const playImageBound = new WeakSet()
const hoverCardsBound = new WeakSet()
const motionReleaseFrames = new WeakMap()
const boundaryCooldownTimers = new WeakMap()

let animationFrame = 0
let catalogObserver = null
let appObserver = null
let catalog = null
let lastPhase = ""
let hubLoadPromise = null
let panelWatchObserver = null
let prewarmHandle = 0
let hoverScrollSuppressUntil = 0
let lastHoverScrollCancelAt = 0
let paperCacheKey = ""
let paperCacheValue = [248, 247, 245, 255]
let inkCacheKey = ""
let inkCacheValue = [69, 69, 69, 255]

function configFromUrl() {
  const encoded = new URLSearchParams(location.search).get("activeColorConfig")
  return encoded ? decodeActiveColorConfig(encoded) : null
}

let runtimeConfig = sanitizeActiveColorConfig(configFromUrl() || PUBLISHED_ACTIVE_COLOR_CONFIG)
window.__RED_ACTIVE_COLOR_CONFIG__ = runtimeConfig

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

function pageIsVisible() {
  return document.visibilityState !== "hidden"
}

function suppressHoverSnowDuringScroll() {
  const time = performance.now()
  hoverScrollSuppressUntil = Math.max(
    hoverScrollSuppressUntil,
    time + HOVER_SCROLL_SUPPRESS_MS,
  )
  if (!activeStates.size || time - lastHoverScrollCancelAt < 80) return
  lastHoverScrollCancelAt = time
  for (const state of [...activeStates]) {
    if (state.reason === "hover") cancelCard(state.card)
  }
}

function pointerHoverSnowSuppressed(event) {
  return (
    event?.type?.startsWith?.("pointer") &&
    performance.now() < hoverScrollSuppressUntil
  )
}

function ensureStyles() {
  let style = document.getElementById(STYLE_ID)
  if (style?.dataset.version === STYLE_VERSION) return
  if (!style) {
    style = document.createElement("style")
    style.id = STYLE_ID
    document.head.appendChild(style)
  }
  style.dataset.version = STYLE_VERSION
  style.textContent = `
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase] .project-card {
      opacity: 1 !important;
      transform: none !important;
      clip-path: inset(0 0 0 0) !important;
      transition: none !important;
      will-change: auto !important;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="color-snow"] .project-card {
      pointer-events: auto !important;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="exiting"]
      .project-card:not(.is-filter-muted) .project-meta {
      opacity: 0;
      transition: opacity 120ms ease !important;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="entering"]
      .project-card:not(.is-filter-muted) .project-meta {
      opacity: 0;
      transition: none !important;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="color-snow"]
      .project-card:not(.is-filter-muted) .project-meta {
      opacity: 1;
      transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1) 50ms !important;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="entering"] .project-media::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 7;
      background: var(--paper);
      opacity: 1;
      pointer-events: none;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="entering"]
      .project-media:has(.${CANVAS_CLASS})::after {
      opacity: 0;
    }
    html[${ROOT_ATTRIBUTE}="true"] .project-card[${RETURN_ATTRIBUTE}="true"]
      .dither-preview-canvas[data-active="true"],
    html[${ROOT_ATTRIBUTE}="true"] .project-card[${RETURN_ATTRIBUTE}="true"]
      .project-halftone {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    html[${ROOT_ATTRIBUTE}="true"] .project-card[${MOTION_ATTRIBUTE}="true"]
      .dither-reveal-canvas,
    html[${ROOT_ATTRIBUTE}="true"] .project-card[${BOUNDARY_COOLDOWN_ATTRIBUTE}="true"]
      .dither-reveal-canvas {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    html[${ROOT_ATTRIBUTE}="true"] .project-card[${MOTION_ATTRIBUTE}="true"]
      .dither-resize-snow-canvas {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    .${CANVAS_CLASS} {
      position: absolute;
      inset: 0;
      z-index: 8 !important;
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

function applyEnabledState() {
  document.documentElement.setAttribute(
    ROOT_ATTRIBUTE,
    runtimeConfig.activeColorEnabled ? "true" : "false",
  )
}

function parseColor(css, fallback = [248, 247, 245, 255]) {
  const probe = document.createElement("canvas")
  probe.width = probe.height = 1
  const ctx = probe.getContext("2d", { willReadFrequently: true })
  if (!ctx) return fallback
  try {
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    return [...ctx.getImageData(0, 0, 1, 1).data]
  } catch {
    return fallback
  }
}

function readPaperColor() {
  const value =
    getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() ||
    "#f8f7f5"
  if (value === paperCacheKey) return paperCacheValue
  paperCacheKey = value
  paperCacheValue = parseColor(value)
  return paperCacheValue
}

function readInkColor() {
  const value =
    getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() ||
    "#454545"
  if (value === inkCacheKey) return inkCacheValue
  inkCacheKey = value
  inkCacheValue = parseColor(value, [69, 69, 69, 255])
  return inkCacheValue
}

function parseObjectPositionRatio(value) {
  const parts = String(value || "50% 50%").trim().split(/\s+/).filter(Boolean)
  let x = 0.5
  let y = 0.5

  const assign = (part, axis) => {
    const token = String(part || "").toLowerCase()
    if (token === "left") x = 0
    else if (token === "right") x = 1
    else if (token === "top") y = 0
    else if (token === "bottom") y = 1
    else if (token === "center") axis === "y" ? (y = 0.5) : (x = 0.5)
    else if (token.endsWith("%")) {
      const ratio = clamp(parseFloat(token) / 100)
      if (Number.isFinite(ratio)) axis === "y" ? (y = ratio) : (x = ratio)
    }
  }

  if (parts.length === 1) assign(parts[0], "x")
  else {
    const firstVertical = parts[0] === "top" || parts[0] === "bottom"
    assign(parts[0], firstVertical ? "y" : "x")
    assign(parts[1], firstVertical ? "x" : "y")
  }
  return { x, y }
}

function getImageRect(img, width, height, style = getComputedStyle(img)) {
  if (!img.naturalWidth || !img.naturalHeight) return null
  const fit = style.objectFit || "fill"
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  let w = width
  let h = height

  if (fit === "cover" || fit === "contain" || fit === "scale-down") {
    const coverScale = Math.max(width / iw, height / ih)
    const containScale = Math.min(width / iw, height / ih)
    const scale =
      fit === "cover"
        ? coverScale
        : fit === "scale-down"
          ? Math.min(1, containScale)
          : containScale
    w = iw * scale
    h = ih * scale
  } else if (fit === "none") {
    w = iw
    h = ih
  }

  const pos = parseObjectPositionRatio(style.objectPosition)
  return {
    x: (width - w) * pos.x,
    y: (height - h) * pos.y,
    width: w,
    height: h,
  }
}

function constrainGridSize(cols, rows) {
  cols = Math.max(1, Math.round(cols))
  rows = Math.max(1, Math.round(rows))

  const count = cols * rows
  if (count > MAX_GRID_CELLS) {
    const scale = Math.sqrt(count / MAX_GRID_CELLS)
    cols = Math.max(1, Math.floor(cols / scale))
    rows = Math.max(1, Math.floor(rows / scale))
  }
  return { cols, rows }
}

function renderedDitherGridSize(media) {
  const source = media?.querySelector?.('.dither-preview-canvas[data-active="true"]')
  const cols = Number(source?.dataset.ditherColumns)
  const rows = Number(source?.dataset.ditherRows)
  if (
    Number.isFinite(cols) &&
    cols > 0 &&
    Number.isFinite(rows) &&
    rows > 0
  ) {
    return constrainGridSize(cols, rows)
  }
  return null
}

function publishedDitherGridSize(media) {
  if (!PUBLISHED_DITHER_CONFIG?.mode || PUBLISHED_DITHER_CONFIG.mode === "native") {
    return null
  }

  const rect = media.getBoundingClientRect()
  const cols = Number(PUBLISHED_DITHER_CONFIG.columns)
  if (!Number.isFinite(cols) || cols <= 0) return null

  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height)
  return constrainGridSize(cols, cols * height / width)
}

function configuredSnowGridSize(media, config) {
  const rect = media.getBoundingClientRect()
  return constrainGridSize(
    Math.ceil(Math.max(1, rect.width) / Math.max(1, config.activeColorCellPx)),
    Math.ceil(Math.max(1, rect.height) / Math.max(1, config.activeColorCellPx)),
  )
}

function logicalGridSize(media, config) {
  return (
    renderedDitherGridSize(media) ||
    publishedDitherGridSize(media) ||
    configuredSnowGridSize(media, config)
  )
}

function signalOrder(config, col, row) {
  const clusterSize = Math.max(1, Math.round(config.activeColorClusterSize))
  const clusterMix = clamp(config.activeColorClusterMix)
  const localRandom = hash01(config.activeColorSeed, col, row, 1)
  const clusterRandom = hash01(
    config.activeColorSeed,
    Math.floor(col / clusterSize),
    Math.floor(row / clusterSize),
    9,
  )
  return localRandom * (1 - clusterMix) + clusterRandom * clusterMix
}

function buildPlaceholderGrid(media, config) {
  if (!media) return null
  const { cols, rows } = logicalGridSize(media, config)
  const order = new Float32Array(cols * rows)

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      order[row * cols + col] = signalOrder(config, col, row)
    }
  }

  return {
    key: `placeholder|${cols}x${rows}|${config.activeColorSeed}`,
    cols,
    rows,
    count: cols * rows,
    order,
  }
}

function paletteDescriptor(img, media, config) {
  if (!img?.naturalWidth || !img?.naturalHeight || !media) return null
  const { cols, rows } = logicalGridSize(media, config)
  const imgStyle = getComputedStyle(img)
  const mediaStyle = getComputedStyle(media)
  const background =
    mediaStyle.backgroundColor &&
    mediaStyle.backgroundColor !== "rgba(0, 0, 0, 0)"
      ? mediaStyle.backgroundColor
      : getComputedStyle(document.documentElement)
          .getPropertyValue("--paper")
          .trim() || "#f8f7f5"

  const key = [
    img.currentSrc || img.src || "",
    img.naturalWidth,
    img.naturalHeight,
    `${cols}x${rows}`,
    imgStyle.objectFit || "fill",
    imgStyle.objectPosition || "50% 50%",
    background,
    config.activeColorPaletteLevels,
    config.activeColorNeighborRadius,
    config.activeColorNeighborMix,
    config.activeColorSaturation,
    config.activeColorClusterSize,
    config.activeColorClusterMix,
    config.activeColorSeed,
  ].join("|")

  return { key, cols, rows, imgStyle, background }
}

function ensureCanvas(card, cols, rows) {
  const media = card.querySelector(".project-media")
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

function quantize(value, levels) {
  const steps = Math.max(2, Math.round(levels)) - 1
  return Math.round((clamp(value, 0, 255) / 255) * steps) / steps * 255
}

function saturateColor(r, g, b, amount) {
  const luma = r * 0.2126 + g * 0.7152 + b * 0.0722
  return [
    clamp(luma + (r - luma) * amount, 0, 255),
    clamp(luma + (g - luma) * amount, 0, 255),
    clamp(luma + (b - luma) * amount, 0, 255),
  ]
}

function integralChannels(source, cols, rows) {
  const stride = cols + 1
  const size = (cols + 1) * (rows + 1)
  const r = new Float64Array(size)
  const g = new Float64Array(size)
  const b = new Float64Array(size)

  for (let y = 1; y <= rows; y += 1) {
    let rowR = 0
    let rowG = 0
    let rowB = 0
    for (let x = 1; x <= cols; x += 1) {
      const sourceOffset = ((y - 1) * cols + (x - 1)) * 4
      rowR += source[sourceOffset]
      rowG += source[sourceOffset + 1]
      rowB += source[sourceOffset + 2]
      const index = y * stride + x
      const above = (y - 1) * stride + x
      r[index] = r[above] + rowR
      g[index] = g[above] + rowG
      b[index] = b[above] + rowB
    }
  }

  return { r, g, b, stride }
}

function rectSum(channel, stride, x0, y0, x1, y1) {
  const a = y0 * stride + x0
  const b = y0 * stride + x1
  const c = y1 * stride + x0
  const d = y1 * stride + x1
  return channel[d] - channel[b] - channel[c] + channel[a]
}

function nearestCandidateOffset(source, cols, rows, col, row, radius, avgR, avgG, avgB) {
  if (radius <= 0) return (row * cols + col) * 4

  const xs = [col - radius, col, col + radius]
  const ys = [row - radius, row, row + radius]
  let nearestOffset = (row * cols + col) * 4
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const yRaw of ys) {
    const y = Math.max(0, Math.min(rows - 1, yRaw))
    for (const xRaw of xs) {
      const x = Math.max(0, Math.min(cols - 1, xRaw))
      const offset = (y * cols + x) * 4
      const dr = source[offset] - avgR
      const dg = source[offset + 1] - avgG
      const db = source[offset + 2] - avgB
      const distance = dr * dr + dg * dg + db * db
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestOffset = offset
      }
    }
  }
  return nearestOffset
}

function buildLocalPalette(img, media, config, descriptor = paletteDescriptor(img, media, config)) {
  if (!descriptor) return null
  const cached = paletteCache.get(descriptor.key)
  if (cached) return cached

  const { cols, rows, imgStyle, background } = descriptor
  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const ctx = sample.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.imageSmoothingEnabled = true
  ctx.fillStyle = background
  ctx.fillRect(0, 0, cols, rows)

  const rect = getImageRect(img, cols, rows, imgStyle)
  if (!rect) return null

  try {
    ctx.drawImage(img, rect.x, rect.y, rect.width, rect.height)
  } catch {
    return null
  }

  const source = new Uint8ClampedArray(ctx.getImageData(0, 0, cols, rows).data)
  const palette = new Uint8ClampedArray(source.length)
  const order = new Float32Array(cols * rows)
  const radius = Math.max(0, Math.round(config.activeColorNeighborRadius))
  const mix = clamp(config.activeColorNeighborMix)
  const levels = config.activeColorPaletteLevels
  const saturation = config.activeColorSaturation
  const integral = integralChannels(source, cols, rows)

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const offset = index * 4
      const x0 = Math.max(0, col - radius)
      const y0 = Math.max(0, row - radius)
      const x1 = Math.min(cols, col + radius + 1)
      const y1 = Math.min(rows, row + radius + 1)
      const samples = Math.max(1, (x1 - x0) * (y1 - y0))
      const avgR = rectSum(integral.r, integral.stride, x0, y0, x1, y1) / samples
      const avgG = rectSum(integral.g, integral.stride, x0, y0, x1, y1) / samples
      const avgB = rectSum(integral.b, integral.stride, x0, y0, x1, y1) / samples

      const nearestOffset = nearestCandidateOffset(
        source,
        cols,
        rows,
        col,
        row,
        radius,
        avgR,
        avgG,
        avgB,
      )

      const baseR = source[offset] * (1 - mix) + source[nearestOffset] * mix
      const baseG = source[offset + 1] * (1 - mix) + source[nearestOffset + 1] * mix
      const baseB = source[offset + 2] * (1 - mix) + source[nearestOffset + 2] * mix
      const [satR, satG, satB] = saturateColor(baseR, baseG, baseB, saturation)
      palette[offset] = quantize(satR, levels)
      palette[offset + 1] = quantize(satG, levels)
      palette[offset + 2] = quantize(satB, levels)
      palette[offset + 3] = 255

      order[index] = signalOrder(config, col, row)
    }
  }

  const grid = {
    key: descriptor.key,
    cols,
    rows,
    count: cols * rows,
    palette,
    order,
  }
  paletteCache.set(descriptor.key, grid)
  while (paletteCache.size > MAX_PALETTE_CACHE) {
    const oldestKey = paletteCache.keys().next().value
    paletteCache.delete(oldestKey)
  }
  return grid
}

function writePixel(data, offset, rgba) {
  data[offset] = rgba[0]
  data[offset + 1] = rgba[1]
  data[offset + 2] = rgba[2]
  data[offset + 3] = rgba[3]
}

function rgbaCss(rgba) {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`
}

function buildRestoreSourcePixels(card, grid, paper = readPaperColor()) {
  const source = card?.querySelector(RESTORE_SOURCE_SELECTOR)
  if (!source || source.width < 1 || source.height < 1) return null

  const sample = document.createElement("canvas")
  sample.width = grid.cols
  sample.height = grid.rows
  const ctx = sample.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null

  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = rgbaCss(paper)
  ctx.fillRect(0, 0, grid.cols, grid.rows)

  try {
    ctx.drawImage(source, 0, 0, grid.cols, grid.rows)
    return new Uint8ClampedArray(ctx.getImageData(0, 0, grid.cols, grid.rows).data)
  } catch {
    return null
  }
}

function drawPlaceholderState(state, frameTick, now) {
  const { ctx, grid, config, paper, ink } = state
  const data = state.framePixels
  const clusterSize = Math.max(1, Math.round(config.activeColorClusterSize))
  const clusterMix = clamp(config.activeColorClusterMix)
  const ditherThreshold = Number(PUBLISHED_DITHER_CONFIG?.threshold)
  const density = clamp(
    (1 - (Number.isFinite(ditherThreshold) ? ditherThreshold : 0.5)) * 0.78 +
      config.activeColorNoiseDensity * 0.22,
    0.2,
    0.62,
  )
  const timeSeconds = now / 1000

  for (let index = 0; index < grid.count; index += 1) {
    const col = index % grid.cols
    const row = Math.floor(index / grid.cols)
    const clusterCol = Math.floor(col / clusterSize)
    const clusterRow = Math.floor(row / clusterSize)
    const local = hash01(config.activeColorSeed, col, row, 3000 + frameTick)
    const cluster = hash01(
      config.activeColorSeed,
      clusterCol,
      clusterRow,
      4000 + Math.floor(frameTick * 0.72),
    )
    const wave = 0.5 + Math.sin(timeSeconds * 6.4 + grid.order[index] * Math.PI * 2) * 0.5
    const signal = local * (1 - clusterMix) + cluster * clusterMix
    const boundary = Math.abs(signal - density) < 0.055
    const active = signal < density || (boundary && wave > 0.78)
    const offset = index * 4
    const color = active ? ink : paper

    writePixel(data, offset, color)
  }

  ctx.putImageData(state.imageData, 0, 0)
}

function cancelMotionRelease(card) {
  const frame = motionReleaseFrames.get(card)
  if (frame) cancelAnimationFrame(frame)
  motionReleaseFrames.delete(card)
}

function clearBoundaryCooldown(card) {
  const timer = boundaryCooldownTimers.get(card)
  if (timer) window.clearTimeout(timer)
  boundaryCooldownTimers.delete(card)
  card?.removeAttribute(BOUNDARY_COOLDOWN_ATTRIBUTE)
}

function startBoundaryCooldown(card) {
  if (!card?.isConnected) return
  clearBoundaryCooldown(card)
  card.setAttribute(BOUNDARY_COOLDOWN_ATTRIBUTE, "true")
  const timer = window.setTimeout(() => {
    boundaryCooldownTimers.delete(card)
    if (card.isConnected) card.removeAttribute(BOUNDARY_COOLDOWN_ATTRIBUTE)
  }, BOUNDARY_COOLDOWN_MS)
  boundaryCooldownTimers.set(card, timer)
}

function holdMotion(card) {
  if (!card) return
  cancelMotionRelease(card)
  clearBoundaryCooldown(card)
  window.__RED_DITHER_RESIZE_SNOW__?.cancel?.(card)
  card.setAttribute(MOTION_ATTRIBUTE, "true")
}

function releaseMotionAfterFrames(card, frames = 1, { cooldown = false } = {}) {
  if (!card) return
  cancelMotionRelease(card)

  let remaining = Math.max(0, Math.round(frames))
  const release = () => {
    if (!card.isConnected) {
      motionReleaseFrames.delete(card)
      return
    }
    if (remaining > 0) {
      remaining -= 1
      motionReleaseFrames.set(card, requestAnimationFrame(release))
      return
    }

    motionReleaseFrames.delete(card)
    if (!cardStates.has(card)) {
      if (cooldown) startBoundaryCooldown(card)
      card.removeAttribute(MOTION_ATTRIBUTE)
    }
  }

  motionReleaseFrames.set(card, requestAnimationFrame(release))
}

function cancelCard(card, { remove = true } = {}) {
  const state = cardStates.get(card)
  if (state) {
    activeStates.delete(state)
    if (state.handoffFrame) cancelAnimationFrame(state.handoffFrame)
    if (state.cleanupFrame) cancelAnimationFrame(state.cleanupFrame)
    if (state.readyFrame) cancelAnimationFrame(state.readyFrame)
    if (state.readyTimer) window.clearTimeout(state.readyTimer)
    clearRestoreSourceInline(state.hiddenSource)
  }
  cardStates.delete(card)
  card?.removeAttribute(RETURN_ATTRIBUTE)
  const canvas = card?.querySelector(`.${CANVAS_CLASS}`)
  if (canvas && remove) canvas.remove()
  releaseMotionAfterFrames(card, remove ? 1 : 0)
}

function exposeRestoreSource(card) {
  const source = card?.querySelector(RESTORE_SOURCE_SELECTOR)
  if (!source) return null

  source.style.setProperty("transition", "none", "important")
  source.style.setProperty("opacity", "1", "important")
  source.style.setProperty("visibility", "visible", "important")
  return source
}

function hideRestoreSource(card) {
  const source = card?.querySelector(RESTORE_SOURCE_SELECTOR)
  if (!source) return null

  source.style.setProperty("transition", "none", "important")
  source.style.setProperty("opacity", "0", "important")
  source.style.setProperty("visibility", "hidden", "important")
  return source
}

function clearRestoreSourceInline(source) {
  source?.style.removeProperty("transition")
  source?.style.removeProperty("opacity")
  source?.style.removeProperty("visibility")
}

function rawFromCurvedProgress(progress, curve) {
  return 1 - Math.pow(1 - clamp(progress), 1 / Math.max(0.05, curve))
}

function reverseHoverState(card, state) {
  if (
    !state ||
    state.reason !== "hover" ||
    state.mode !== "restore" ||
    !state.sourcePixels
  ) {
    return false
  }

  const now = performance.now()
  const duration = Math.max(1, state.config.activeColorDurationMs)
  const reverseProgress = 1 - clamp(state.restoreProgress ?? 1)
  const raw = rawFromCurvedProgress(reverseProgress, state.config.activeColorCurve)
  state.mode = "restore-reverse"
  state.reason = "hover-return"
  state.startTime = now - state.config.activeColorDelayMs - raw * duration
  state.lastDraw = 0
  holdMotion(card)
  state.hiddenSource = hideRestoreSource(card)
  card.setAttribute(RETURN_ATTRIBUTE, "true")
  activeStates.add(state)
  drawState(state, now)
  scheduleAnimationLoop()
  return true
}

function finishState(state) {
  activeStates.delete(state)

  if (state.mode === "restore-reverse") {
    const source = exposeRestoreSource(state.card)
    state.card.removeAttribute(RETURN_ATTRIBUTE)
    state.handoffFrame = requestAnimationFrame(() => {
      if (state.canvas.isConnected) state.canvas.remove()
      cardStates.delete(state.card)
      state.cleanupFrame = requestAnimationFrame(() => {
        clearRestoreSourceInline(source)
        releaseMotionAfterFrames(state.card, 2, { cooldown: true })
      })
    })
    return
  }

  if (state.direction === "out") {
    state.finished = true
    return
  }

  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
  state.canvas.style.opacity = "0"
  cardStates.delete(state.card)
  state.canvas.remove()
  releaseMotionAfterFrames(state.card, 1)
}

function drawState(state, now) {
  const { card, canvas, ctx, grid, config, paper, startTime, direction } = state
  if (!card.isConnected || !canvas.isConnected) {
    cancelCard(card)
    return
  }
  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) return
  state.lastDraw = now

  const elapsed = now - startTime
  const duration =
    direction === "out"
      ? config.activeColorExitDurationMs
      : config.activeColorDurationMs
  const raw = clamp(
    (elapsed - config.activeColorDelayMs) / Math.max(1, duration),
  )
  const progress = 1 - Math.pow(1 - raw, Math.max(0.05, config.activeColorCurve))
  const frameTick = Math.floor(
    now / Math.max(16, 92 - config.activeColorFlicker * 68),
  )
  const envelope = 0.42 + Math.sin(Math.PI * progress) * 0.58
  const density = clamp(config.activeColorNoiseDensity * envelope)
  const data = state.framePixels
  data.fill(0)

  if (state.mode === "placeholder") {
    drawPlaceholderState(state, frameTick, now)
    return
  }

  if (
    (state.mode === "restore" || state.mode === "restore-reverse") &&
    state.sourcePixels
  ) {
    if (state.mode === "restore" && progress <= 0.001) {
      data.set(state.sourcePixels)
      ctx.putImageData(state.imageData, 0, 0)
      return
    }

    const restoring = state.mode === "restore"
    const restoreProgress = restoring ? progress : 1 - progress
    state.restoreProgress = restoreProgress
    const decodeProgress = smooth01(restoreProgress / 0.62)
    const rebuildProgress =
      restoreProgress <= 0.42 ? 0 : smooth01((restoreProgress - 0.42) / 0.58)
    const decodeSoftness = 0.085
    const rebuildSoftness = 0.1

    for (let index = 0; index < grid.count; index += 1) {
      const decodeThreshold = 0.035 + grid.order[index] * 0.93
      const decoded = smooth01(
        (decodeProgress - decodeThreshold + decodeSoftness) /
          (decodeSoftness * 2),
      )
      const rebuildThreshold = 0.035 + (1 - grid.order[index]) * 0.93
      const rebuilt = smooth01(
        (rebuildProgress - rebuildThreshold + rebuildSoftness) /
          (rebuildSoftness * 2),
      )
      if (rebuilt >= 0.995) continue

      const col = index % grid.cols
      const row = Math.floor(index / grid.cols)
      const offset = index * 4
      const decodeBand = 4 * decoded * (1 - decoded)
      const rebuildBand = 4 * rebuilt * (1 - rebuilt)
      const transitionBand = Math.max(decodeBand, rebuildBand)
      const flicker = hash01(
        config.activeColorSeed,
        col,
        row,
        2000 + frameTick,
      )
      const colorChance = clamp(
        density * (1 - config.activeColorPaperRatio * 0.48) +
          transitionBand * 0.3,
      )
      const useColorSnow = flicker < colorChance
      const snow = useColorSnow ? grid.palette : paper
      const snowMix = clamp(transitionBand * (0.24 + density * 0.24))
      const overlayAlpha = clamp(1 - rebuilt)
      const baseR =
        state.sourcePixels[offset] * (1 - decoded) + grid.palette[offset] * decoded
      const baseG =
        state.sourcePixels[offset + 1] * (1 - decoded) +
        grid.palette[offset + 1] * decoded
      const baseB =
        state.sourcePixels[offset + 2] * (1 - decoded) +
        grid.palette[offset + 2] * decoded

      data[offset] = baseR * (1 - snowMix) + snow[0] * snowMix
      data[offset + 1] = baseG * (1 - snowMix) + snow[1] * snowMix
      data[offset + 2] = baseB * (1 - snowMix) + snow[2] * snowMix
      data[offset + 3] = Math.round(state.sourcePixels[offset + 3] * overlayAlpha)
    }

    ctx.putImageData(state.imageData, 0, 0)
    if (raw >= 1) finishState(state)
    return
  }

  for (let index = 0; index < grid.count; index += 1) {
    const covered =
      direction === "out"
        ? grid.order[index] <= progress
        : grid.order[index] > progress
    if (!covered) continue

    const col = index % grid.cols
    const row = Math.floor(index / grid.cols)
    const offset = index * 4
    const flicker = hash01(
      config.activeColorSeed,
      col,
      row,
      1000 + frameTick,
    )
    let colorChance = density * (1 - config.activeColorPaperRatio * 0.72)
    if (direction === "out") colorChance *= 1 - progress * 0.34

    if (flicker < colorChance) {
      data[offset] = grid.palette[offset]
      data[offset + 1] = grid.palette[offset + 1]
      data[offset + 2] = grid.palette[offset + 2]
      data[offset + 3] = 255
    } else {
      writePixel(data, offset, paper)
    }
  }

  ctx.putImageData(state.imageData, 0, 0)
  if (raw >= 1) finishState(state)
}

function animationLoop(now) {
  animationFrame = 0
  for (const state of [...activeStates]) drawState(state, now)
  if (activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function scheduleAnimationLoop() {
  if (!animationFrame && activeStates.size) {
    animationFrame = requestAnimationFrame(animationLoop)
  }
}

function cardNearViewport(card) {
  const rect = card?.getBoundingClientRect?.()
  if (!rect) return false
  const viewportHeight = Math.max(
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
  )
  return (
    rect.bottom >= -VIEWPORT_MARGIN &&
    rect.top <= viewportHeight + VIEWPORT_MARGIN
  )
}

function playCard(card, direction = "in", index = 0, inputConfig = runtimeConfig, options = {}) {
  const config = sanitizeActiveColorConfig(inputConfig)
  cancelCard(card)

  if (
    !config.activeColorEnabled ||
    prefersReducedMotion() ||
    (!options.includeOffscreen && !cardNearViewport(card))
  ) {
    return false
  }

  const media = card.querySelector(".project-media")
  const img = media?.querySelector("img")
  if (!media || !img) return false

  const startPlaceholder = () => {
    if (options.placeholder === false) return null
    const grid = buildPlaceholderGrid(media, config)
    if (!grid) return null
    const canvas = ensureCanvas(card, grid.cols, grid.rows)
    const ctx = canvas?.getContext("2d", { alpha: true })
    if (!canvas || !ctx) return null

    holdMotion(card)
    ctx.imageSmoothingEnabled = false
    canvas.style.transition = "none"
    canvas.style.opacity = "1"
    canvas.style.visibility = "visible"

    const framePixels = new Uint8ClampedArray(grid.count * 4)
    const imageData = new ImageData(framePixels, grid.cols, grid.rows)
    const state = {
      card,
      canvas,
      ctx,
      grid,
      config,
      direction,
      mode: "placeholder",
      reason: options.reason || "loading",
      paper: readPaperColor(),
      ink: readInkColor(),
      framePixels,
      imageData,
      startTime: performance.now(),
      lastDraw: 0,
      finished: false,
    }

    cardStates.set(card, state)
    activeStates.add(state)
    drawState(state, state.startTime)
    scheduleAnimationLoop()
    return state
  }

  const run = () => {
    if (!card.isConnected || !img.complete || !img.naturalWidth) return false

    const descriptor = paletteDescriptor(img, media, config)
    if (!descriptor) return false
    const grid =
      paletteCache.get(descriptor.key) ||
      buildLocalPalette(img, media, config, descriptor)
    if (!grid) return false

    const canvas = ensureCanvas(card, grid.cols, grid.rows)
    const ctx = canvas?.getContext("2d", { alpha: true })
    if (!canvas || !ctx) return false

    holdMotion(card)
    const paper = readPaperColor()
    const mode =
      options.mode ||
      (
        options.reason === "hover" &&
        card.classList.contains("is-filter-muted")
          ? "restore"
          : "snow"
      )
    const sourcePixels =
      mode === "restore" || mode === "restore-reverse"
        ? buildRestoreSourcePixels(card, grid, paper)
        : null
    if (mode === "restore-reverse" && sourcePixels) {
      card.setAttribute(RETURN_ATTRIBUTE, "true")
    }
    const hiddenSource =
      mode === "restore-reverse" && sourcePixels
        ? hideRestoreSource(card)
        : null

    ctx.imageSmoothingEnabled = false
    canvas.style.transition = "none"
    canvas.style.opacity = "1"
    canvas.style.visibility = "visible"

    const framePixels = new Uint8ClampedArray(grid.count * 4)
    const imageData = new ImageData(framePixels, grid.cols, grid.rows)
    const previous = cardStates.get(card)
    if (previous) activeStates.delete(previous)
    const durationOverride = Number(options.durationMs)
    const hasDurationOverride =
      Number.isFinite(durationOverride) && durationOverride > 0
    const localConfig = {
      ...config,
      activeColorExitDurationMs:
        direction === "out" && hasDurationOverride
          ? Math.max(1, durationOverride)
          : config.activeColorExitDurationMs,
      activeColorDurationMs:
        direction !== "out" && hasDurationOverride
          ? Math.max(1, durationOverride)
          : sourcePixels
            ? config.activeColorDurationMs + config.activeColorSettleMs
            : config.activeColorDurationMs,
      activeColorDelayMs:
        config.activeColorDelayMs +
        Math.max(0, index) * config.activeColorStaggerMs,
    }
    const state = {
      card,
      canvas,
      ctx,
      grid,
      config: localConfig,
      direction,
      mode: sourcePixels ? mode : "snow",
      reason: options.reason || "transition",
      paper,
      sourcePixels,
      hiddenSource,
      framePixels,
      imageData,
      startTime: performance.now(),
      lastDraw: 0,
      finished: false,
    }

    cardStates.set(card, state)
    activeStates.add(state)
    drawState(state, state.startTime)
    scheduleAnimationLoop()
    return true
  }

  const scheduleDeferredRun = (placeholderState = null) => {
    const baseDelay = Math.max(0, Number(options.deferBaseMs) || 0)
    const stepDelay = Math.max(0, Number(options.deferStepMs) || 0)
    const maxDelay = Math.max(0, Number(options.deferMaxMs) || 0)
    const indexedDelay = baseDelay + Math.max(0, index) * stepDelay
    const delay = maxDelay > 0 ? Math.min(indexedDelay, maxDelay) : indexedDelay
    const targetState = placeholderState || cardStates.get(card)

    const begin = () => {
      const state = cardStates.get(card)
      if (state) {
        state.readyFrame = 0
        state.readyTimer = 0
      }
      run()
    }

    const frame = requestAnimationFrame(() => {
      const state = cardStates.get(card)
      if (state) state.readyFrame = 0

      if (delay > 0) {
        const timer = window.setTimeout(begin, delay)
        const latestState = cardStates.get(card)
        if (latestState) latestState.readyTimer = timer
        return
      }

      begin()
    })

    if (targetState) targetState.readyFrame = frame
  }

  if (img.complete && img.naturalWidth) {
    if (options.deferReady) {
      const placeholderState = startPlaceholder()
      if (placeholderState) {
        scheduleDeferredRun(placeholderState)
        return true
      }
    }
    return run()
  }

  const placeholderStarted = startPlaceholder()
  if (!playImageBound.has(img)) {
    playImageBound.add(img)
    img.addEventListener(
      "load",
      () => {
        playImageBound.delete(img)
        if (!card.isConnected) return
        schedulePrewarm(card.closest(".catalog"))
        const placeholderState = cardStates.get(card)
        if (options.deferReady && placeholderState) {
          scheduleDeferredRun(placeholderState)
        } else {
          run()
        }
      },
      { once: true, passive: true },
    )
  }
  return Boolean(placeholderStarted)
}

function allCards(targetCatalog = catalog) {
  return [...targetCatalog?.querySelectorAll(".project-card") || []]
}

function playableCards(targetCatalog = catalog, { includeMuted = false } = {}) {
  return includeMuted
    ? allCards(targetCatalog)
    : [
        ...targetCatalog?.querySelectorAll(
          ".project-card:not(.is-filter-muted)",
        ) || [],
      ]
}

function readDurationAttribute(targetCatalog, attribute) {
  const value = Number(targetCatalog?.getAttribute?.(attribute))
  return Number.isFinite(value) && value > 0 ? value : null
}

function catalogPlaybackOptions(targetCatalog, direction, options = {}) {
  const durationMs = readDurationAttribute(
    targetCatalog,
    direction === "out" ? EXIT_DURATION_ATTRIBUTE : ENTER_DURATION_ATTRIBUTE,
  )
  if (direction !== "in") return { ...options, durationMs }

  return {
    ...options,
    durationMs,
    deferReady: options.deferReady ?? durationMs !== null,
    deferBaseMs:
      readDurationAttribute(targetCatalog, ENTER_DEFER_ATTRIBUTE) ??
      options.deferBaseMs ??
      0,
    deferStepMs: options.deferStepMs ?? CATEGORY_READY_DEFER_STEP_MS,
    deferMaxMs: options.deferMaxMs ?? CATEGORY_READY_DEFER_MAX_MS,
  }
}

function playCatalog(
  targetCatalog,
  direction,
  {
    force = false,
    includeMuted = false,
    includeOffscreen = false,
    ...options
  } = {},
) {
  if (
    !targetCatalog ||
    !runtimeConfig.activeColorEnabled ||
    prefersReducedMotion()
  ) {
    return
  }
  if (
    direction === "in" &&
    !targetCatalog.dataset.activeFilter &&
    !force
  ) {
    return
  }

  let played = 0
  const playbackOptions = catalogPlaybackOptions(targetCatalog, direction, {
    ...options,
    includeOffscreen,
  })
  playableCards(targetCatalog, { includeMuted }).forEach((card, index) => {
    if (playCard(card, direction, index, runtimeConfig, playbackOptions)) {
      played += 1
    }
  })
  return played
}

function stopCatalogStates(targetCatalog = catalog) {
  targetCatalog?.querySelectorAll(`.${CANVAS_CLASS}`).forEach((canvas) => {
    const card = canvas.closest(".project-card")
    if (card) cancelCard(card)
    else canvas.remove()
  })
}

function prewarmCard(card, config = runtimeConfig) {
  const media = card?.querySelector(".project-media")
  const img = media?.querySelector("img")
  if (!media || !img) return

  if (!img.complete || !img.naturalWidth) {
    if (prewarmImageBound.has(img)) return
    prewarmImageBound.add(img)
    img.addEventListener(
      "load",
      () => {
        prewarmImageBound.delete(img)
        if (card.isConnected) {
          prewarmQueued.add(card)
          schedulePrewarm(card.closest(".catalog"))
        }
      },
      { once: true, passive: true },
    )
    return
  }

  const descriptor = paletteDescriptor(img, media, config)
  if (!descriptor || paletteCache.has(descriptor.key)) return
  buildLocalPalette(img, media, config, descriptor)
}

function runPrewarm(deadline) {
  prewarmHandle = 0
  if (!pageIsVisible()) return
  let processed = 0

  for (const card of [...prewarmQueued]) {
    prewarmQueued.delete(card)
    if (!card.isConnected) continue
    prewarmCard(card, runtimeConfig)
    processed += 1

    const lowTime =
      deadline?.timeRemaining &&
      deadline.timeRemaining() < 4 &&
      !deadline.didTimeout
    if (lowTime || processed >= 2) break
  }

  if (prewarmQueued.size) schedulePrewarm()
}

function schedulePrewarm(targetCatalog = catalog) {
  if (targetCatalog) {
    allCards(targetCatalog).forEach((card) => prewarmQueued.add(card))
  }
  if (!prewarmQueued.size || prewarmHandle || !pageIsVisible()) return

  if ("requestIdleCallback" in window) {
    prewarmHandle = window.requestIdleCallback(runPrewarm, { timeout: 700 })
  } else {
    prewarmHandle = window.setTimeout(
      () => runPrewarm({ timeRemaining: () => 8, didTimeout: true }),
      32,
    )
  }
}

function cancelPrewarmHandle() {
  if (!prewarmHandle) return
  if ("cancelIdleCallback" in window) window.cancelIdleCallback(prewarmHandle)
  else window.clearTimeout(prewarmHandle)
  prewarmHandle = 0
}

function handleVisibilityChange() {
  if (!pageIsVisible()) {
    cancelPrewarmHandle()
    return
  }
  schedulePrewarm(catalog)
}

function bindCardHoverSnow(targetCatalog = catalog) {
  if (!targetCatalog) return

  allCards(targetCatalog).forEach((card) => {
    if (hoverCardsBound.has(card)) return
    hoverCardsBound.add(card)

    const playHoverSnow = (event) => {
      if (event?.pointerType === "touch") return
      if (pointerHoverSnowSuppressed(event)) return
      const parentCatalog = card.closest(".catalog")
      if (!parentCatalog || parentCatalog.dataset.filterPhase) return
      if (
        !parentCatalog.dataset.activeFilter ||
        !card.classList.contains("is-filter-muted")
      ) {
        return
      }
      playCard(card, "in", 0, runtimeConfig, { reason: "hover" })
    }

    const cancelHoverSnow = (event) => {
      if (event?.pointerType === "touch") return
      if (pointerHoverSnowSuppressed(event)) {
        const state = cardStates.get(card)
        if (state?.reason === "hover") cancelCard(card)
        return
      }
      const parentCatalog = card.closest(".catalog")
      const state = cardStates.get(card)
      if (
        parentCatalog?.dataset.activeFilter &&
        !parentCatalog.dataset.filterPhase &&
        card.classList.contains("is-filter-muted")
      ) {
        if (state?.mode === "restore-reverse") return
        if (reverseHoverState(card, state)) return
        playCard(card, "in", 0, runtimeConfig, {
          mode: "restore-reverse",
          reason: "hover-return",
        })
        return
      }

      if (state?.reason === "hover") cancelCard(card)
    }

    card.addEventListener("pointerenter", playHoverSnow, { passive: true })
    card.addEventListener("pointerleave", cancelHoverSnow, { passive: true })
    card.addEventListener("pointercancel", cancelHoverSnow, { passive: true })
    card.addEventListener("focusin", playHoverSnow)
    card.addEventListener("focusout", cancelHoverSnow)
  })
}

function clearPaletteCache() {
  paletteCache.clear()
  prewarmQueued.clear()
}

function isRuntimeOverlayNode(node) {
  return node instanceof Element &&
    RUNTIME_OVERLAY_CLASSES.some((className) => node.classList.contains(className))
}

function runtimeOverlayMutationOnly(mutation) {
  if (mutation.type !== "childList") return false
  const nodes = [...mutation.addedNodes, ...mutation.removedNodes]
  return Boolean(nodes.length) && nodes.every(isRuntimeOverlayNode)
}

function handleCatalogPhase(targetCatalog) {
  if (!targetCatalog || !runtimeConfig.activeColorEnabled) return
  const phase = targetCatalog.dataset.filterPhase || ""
  if (phase === lastPhase) return
  lastPhase = phase

  if (phase === "exiting") {
    playCatalog(targetCatalog, "out", {
      force: true,
      includeMuted: true,
      includeOffscreen: true,
      reason: "category-exit",
    })
    return
  }

  if (phase === "entering") {
    stopCatalogStates(targetCatalog)
    schedulePrewarm(targetCatalog)
    playCatalog(targetCatalog, "in", {
      force: true,
      includeMuted: true,
      includeOffscreen: true,
      reason: "category-enter",
    })
    return
  }

  if (phase === "settling") {
    targetCatalog.dataset.filterPhase = "color-snow"
    delete targetCatalog.dataset.halftonePhase
  }
}

function bindCatalog(nextCatalog) {
  if (catalog === nextCatalog && catalogObserver) {
    schedulePrewarm(catalog)
    return
  }

  catalogObserver?.disconnect()
  catalogObserver = null
  catalog = nextCatalog || null
  lastPhase = catalog?.dataset.filterPhase || ""

  if (!catalog || !("MutationObserver" in window)) return

  catalogObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) =>
      mutation.type === "childList" && !runtimeOverlayMutationOnly(mutation)
    )) {
      schedulePrewarm(catalog)
      bindCardHoverSnow(catalog)
    }

    handleCatalogPhase(catalog)
  })

  catalogObserver.observe(catalog, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-filter-phase"],
  })

  schedulePrewarm(catalog)
  bindCardHoverSnow(catalog)
  handleCatalogPhase(catalog)
}

function bindApp() {
  const app = document.querySelector("#app")
  if (!app || !("MutationObserver" in window)) return

  appObserver?.disconnect()
  appObserver = new MutationObserver(() => {
    bindCatalog(document.querySelector(".catalog"))
  })
  appObserver.observe(app, { childList: true, subtree: false })
  bindCatalog(document.querySelector(".catalog"))
}

function replayActiveColorSnow(inputConfig = runtimeConfig) {
  runtimeConfig = sanitizeActiveColorConfig(inputConfig)
  window.__RED_ACTIVE_COLOR_CONFIG__ = runtimeConfig
  applyEnabledState()

  clearPaletteCache()
  schedulePrewarm(catalog)
  bindCardHoverSnow(catalog)
  if (!catalog?.dataset.activeFilter) return
  playCatalog(catalog, "in", { force: true })
}

function ensureHubExtension() {
  if (!document.querySelector(".dither-lab")) return
  if (!hubLoadPromise) {
    hubLoadPromise = import("./active-color-hub.js?v=20260829-activecolor1")
  }
}

function watchForHub() {
  ensureHubExtension()
  if (
    !("MutationObserver" in window) ||
    panelWatchObserver ||
    !document.body
  ) {
    return
  }
  panelWatchObserver = new MutationObserver(ensureHubExtension)
  panelWatchObserver.observe(document.body, { childList: true, subtree: true })
}

window.addEventListener("red:active-color-config", (event) => {
  runtimeConfig = sanitizeActiveColorConfig(
    event.detail || PUBLISHED_ACTIVE_COLOR_CONFIG,
  )
  window.__RED_ACTIVE_COLOR_CONFIG__ = runtimeConfig
  applyEnabledState()
  clearPaletteCache()
  schedulePrewarm(catalog)

  if (document.querySelector(".dither-lab")?.dataset.open === "true") {
    replayActiveColorSnow(runtimeConfig)
  }
})

window.addEventListener(
  "resize",
  () => {
    window.clearTimeout(window.__redActiveColorPrewarmResizeTimer)
    window.__redActiveColorPrewarmResizeTimer = window.setTimeout(() => {
      schedulePrewarm(catalog)
    }, 160)
  },
  { passive: true },
)
window.addEventListener("scroll", suppressHoverSnowDuringScroll, { passive: true, capture: true })
window.addEventListener("wheel", suppressHoverSnowDuringScroll, { passive: true, capture: true })
document.addEventListener("visibilitychange", handleVisibilityChange)

document.addEventListener(
  "DOMContentLoaded",
  () => {
    bindApp()
    watchForHub()
  },
  { once: true },
)

ensureStyles()
applyEnabledState()

if (document.readyState !== "loading") {
  bindApp()
  watchForHub()
}

window.__RED_ACTIVE_COLOR_SNOW__ = {
  replay: replayActiveColorSnow,
  play: playCard,
  playCatalog,
  stop: stopCatalogStates,
  prewarm: () => schedulePrewarm(catalog),
  getConfig: () => runtimeConfig,
}
