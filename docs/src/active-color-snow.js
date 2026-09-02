import {
  PUBLISHED_ACTIVE_COLOR_CONFIG,
  decodeActiveColorConfig,
  sanitizeActiveColorConfig,
} from "./active-color-default.js"
import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import {
  logicalGridForMedia,
} from "./binary-surface-core.js?v=20260830-perfaudit1"
import {
  pixelsFromBinaryBits,
  sampleCurrentBinarySurface,
} from "./binary-visible-surface.js?v=20260902-previewboundary4"

const STYLE_ID = "red-active-color-snow-style"
const STYLE_VERSION = "6"
const CANVAS_CLASS = "active-color-snow-canvas"
const ROOT_ATTRIBUTE = "data-red-active-color-snow"
const RETURN_ATTRIBUTE = "data-active-color-return"
const MOTION_ATTRIBUTE = "data-active-color-motion"
const RESTORE_READY_ATTRIBUTE = "data-active-color-restore-ready"
const BOUNDARY_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const EXIT_DURATION_ATTRIBUTE = "data-color-snow-exit-duration-ms"
const ENTER_DURATION_ATTRIBUTE = "data-color-snow-enter-duration-ms"
const ENTER_DEFER_ATTRIBUTE = "data-color-snow-enter-defer-ms"
const BOUNDARY_COOLDOWN_MS = 520
const HOVER_RESTORE_SOURCE_WAIT_MS = 900
const MAX_GRID_CELLS = 86000
const MAX_PALETTE_CACHE = 72
const VIEWPORT_MARGIN = 620
const TARGET_FRAME_MS = 1000 / 60
const HOVER_SCROLL_SUPPRESS_MS = 260
const HOVER_SCROLL_RETURN_CLASS_MS = 920
const CATEGORY_READY_DEFER_STEP_MS = 9
const CATEGORY_READY_DEFER_MAX_MS = 150
const CATEGORY_BREATH_HOLD_MAX_RATIO = 0.36
const HOVER_MOTION_DURATION_SCALE = 0.75
const RESTORE_IMAGE_HANDOFF_MIN_MS = 110
const RESTORE_IMAGE_HANDOFF_MAX_MS = 190
const RESTORE_IMAGE_HANDOFF_SOFTNESS = 0.12
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
const hoverRestoreRetries = new WeakMap()

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
const TAU = Math.PI * 2

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
  if (time - lastHoverScrollCancelAt < 80) return
  lastHoverScrollCancelAt = time

  for (const state of [...activeStates]) {
    if (state.reason === "hover") returnMutedHoverFromScroll(state.card, state)
  }

  const activeCatalog = document.querySelector(".catalog[data-active-filter]:not([data-filter-phase])")
  activeCatalog
    ?.querySelectorAll(
      ".project-card.is-filter-muted.is-muted-restore-intent, " +
        `.project-card.is-filter-muted[${RESTORE_READY_ATTRIBUTE}="true"]`,
    )
    .forEach((card) => {
      if (cardStates.has(card)) return
      returnMutedHoverFromScroll(card)
    })
}

function hoverSnowSuppressedByScroll() {
  return performance.now() < hoverScrollSuppressUntil
}

function scheduleMutedReturnClassClear(card, delay = HOVER_SCROLL_RETURN_CLASS_MS) {
  if (!card?.isConnected) return
  window.clearTimeout(card.__catalogMutedReturnTimer)
  card.__catalogMutedReturnTimer = window.setTimeout(() => {
    if (
      card.isConnected &&
      !card.hasAttribute(RETURN_ATTRIBUTE) &&
      !card.matches(":hover") &&
      !card.matches(":focus-within")
    ) {
      card.classList.remove("is-muted-restore-return")
    }
    card.__catalogMutedReturnTimer = 0
  }, delay)
}

function markMutedHoverReturning(card) {
  if (!card?.isConnected) return
  window.clearTimeout(card.__catalogMutedReturnTimer)
  card.__catalogMutedReturnTimer = 0
  clearRestoreReady(card)
  card.classList.remove("is-muted-restore-intent")
  card.classList.add("is-muted-restore-return")
  scheduleMutedReturnClassClear(card)
}

function clearMutedHoverIntent(card) {
  if (!card?.isConnected) return
  window.clearTimeout(card.__catalogMutedReturnTimer)
  card.__catalogMutedReturnTimer = 0
  clearRestoreReady(card)
  card.classList.remove("is-muted-restore-intent")
  card.classList.remove("is-muted-restore-return")
}

function returnMutedHoverFromScroll(card, state = cardStates.get(card)) {
  if (
    !card?.isConnected ||
    !card.classList.contains("is-filter-muted") ||
    card.closest(".catalog")?.dataset.filterPhase
  ) {
    return false
  }

  cancelHoverRestoreRetry(card)
  markMutedHoverReturning(card)

  if (state?.mode === "restore" && state.reason === "hover") {
    return reverseHoverState(card, state)
  }

  if (state?.reason === "hover") {
    cancelCard(card)
    markMutedHoverReturning(card)
    return false
  }

  if (restoreSourceReady(card)) {
    return playCard(card, "in", 0, runtimeConfig, {
      mode: "restore-reverse",
      reason: "hover-scroll-return",
    })
  }

  card.removeAttribute(RETURN_ATTRIBUTE)
  releaseMotionAfterFrames(card, 1, { cooldown: true })
  return false
}

function pointerHoverSnowSuppressed(event) {
  return (
    event?.type?.startsWith?.("pointer") &&
    hoverSnowSuppressedByScroll()
  )
}

function durationScaleForReason(reason) {
  return String(reason || "").startsWith("hover")
    ? HOVER_MOTION_DURATION_SCALE
    : 1
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
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="entering"]
      .project-card:not(.is-filter-muted) .project-media::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 7;
      background: var(--paper);
      opacity: 1;
      pointer-events: none;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-filter-phase="entering"]
      .project-card:not(.is-filter-muted) .project-media:has(.${CANVAS_CLASS})::after {
      opacity: 0;
    }
    html[${ROOT_ATTRIBUTE}="true"] .catalog[data-active-filter]:not([data-filter-phase])
      .project-card.is-filter-muted.is-muted-restore-return[${RETURN_ATTRIBUTE}="true"]
      .project-media > img {
      opacity: 0 !important;
      visibility: hidden !important;
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

  const grid = logicalGridForMedia(media, PUBLISHED_DITHER_CONFIG)
  return constrainGridSize(grid.cols, grid.rows)
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

function analyzeRestoreBoundary(sourceBits, fullBits, cols, rows) {
  if (!sourceBits || !fullBits || sourceBits.length !== fullBits.length) {
    return { total: 0 }
  }

  let total = 0
  let minRow = rows
  let maxRow = -1
  let minCol = cols
  let maxCol = -1
  for (let index = 0; index < fullBits.length; index += 1) {
    if (sourceBits[index] === fullBits[index]) continue
    total += 1
    const row = Math.floor(index / cols)
    const col = index % cols
    minRow = Math.min(minRow, row)
    maxRow = Math.max(maxRow, row)
    minCol = Math.min(minCol, col)
    maxCol = Math.max(maxCol, col)
  }

  return {
    total,
    minRow,
    maxRow,
    minCol,
    maxCol,
  }
}

function buildRestoreSurface(card, grid, paper = readPaperColor(), ink = readInkColor()) {
  const currentSurface = sampleCurrentBinarySurface(card, {
    cols: grid.cols,
    rows: grid.rows,
    paper,
    ink,
    ditherConfig: PUBLISHED_DITHER_CONFIG,
  })
  const fullSurface = currentSurface?.baseCanvas
    ? sampleCurrentBinarySurface(card, {
        baseCanvas: currentSurface.baseCanvas,
        overlayCanvas: null,
        cols: grid.cols,
        rows: grid.rows,
        paper,
        ink,
        ditherConfig: PUBLISHED_DITHER_CONFIG,
        applyViewportBoundary: false,
      })
    : null
  const currentPixels = currentSurface
    ? pixelsFromBinaryBits(currentSurface.bits, grid.cols, grid.rows, currentSurface.paper, currentSurface.ink)
    : null
  const fullPixels = fullSurface
    ? pixelsFromBinaryBits(fullSurface.bits, grid.cols, grid.rows, fullSurface.paper, fullSurface.ink)
    : null
  if (currentPixels) {
    return {
      sourcePixels: currentPixels,
      fullPixels: fullPixels || currentPixels,
      sourceBits: currentSurface.bits,
      fullBits: fullSurface?.bits || currentSurface.bits,
      boundary: analyzeRestoreBoundary(
        currentSurface.bits,
        fullSurface?.bits || currentSurface.bits,
        grid.cols,
        grid.rows,
      ),
    }
  }

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
    const pixels = new Uint8ClampedArray(ctx.getImageData(0, 0, grid.cols, grid.rows).data)
    return {
      sourcePixels: pixels,
      fullPixels: pixels,
      sourceBits: null,
      fullBits: null,
      boundary: { total: 0, top: false, bottom: false },
    }
  } catch {
    return null
  }
}

function restoreSourceReady(card) {
  const source = card?.querySelector?.(RESTORE_SOURCE_SELECTOR)
  return Boolean(source && source.width > 0 && source.height > 0)
}

function clearRestoreReady(card) {
  card?.removeAttribute?.(RESTORE_READY_ATTRIBUTE)
}

function markRestoreReady(card) {
  card?.setAttribute?.(RESTORE_READY_ATTRIBUTE, "true")
}

function cancelHoverRestoreRetry(card) {
  const retry = hoverRestoreRetries.get(card)
  if (!retry) return false
  if (retry.frame) cancelAnimationFrame(retry.frame)
  hoverRestoreRetries.delete(card)
  return true
}

function requestBinaryRestoreSource() {
  window.__RED_DITHER_PUBLIC_RUNTIME__?.render?.()
}

function scheduleHoverRestoreRetry(card, direction, index, inputConfig, options = {}) {
  if (!card?.isConnected) return false
  if (hoverRestoreRetries.has(card)) return true

  const retry = {
    frame: 0,
    startedAt: performance.now(),
  }

  const attempt = () => {
    retry.frame = 0
    if (
      !card.isConnected ||
      !card.classList.contains("is-filter-muted") ||
      !card.classList.contains("is-muted-restore-intent") ||
      card.closest(".catalog")?.dataset.filterPhase
    ) {
      hoverRestoreRetries.delete(card)
      return
    }

    if (restoreSourceReady(card)) {
      hoverRestoreRetries.delete(card)
      playCard(card, direction, index, inputConfig, {
        ...options,
        restoreRetry: true,
      })
      return
    }

    requestBinaryRestoreSource()
    if (performance.now() - retry.startedAt > HOVER_RESTORE_SOURCE_WAIT_MS) {
      hoverRestoreRetries.delete(card)
      return
    }

    retry.frame = requestAnimationFrame(attempt)
  }

  hoverRestoreRetries.set(card, retry)
  requestBinaryRestoreSource()
  retry.frame = requestAnimationFrame(attempt)
  return true
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
  cancelHoverRestoreRetry(card)
  clearRestoreReady(card)
  const state = cardStates.get(card)
  if (state) {
    activeStates.delete(state)
    if (state.handoffFrame) cancelAnimationFrame(state.handoffFrame)
    if (state.cleanupFrame) cancelAnimationFrame(state.cleanupFrame)
    if (state.readyFrame) cancelAnimationFrame(state.readyFrame)
    if (state.readyTimer) window.clearTimeout(state.readyTimer)
    if (state.cleanupTimer) window.clearTimeout(state.cleanupTimer)
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
  if (state.cleanupFrame) {
    cancelAnimationFrame(state.cleanupFrame)
    state.cleanupFrame = 0
  }
  if (state.cleanupTimer) {
    window.clearTimeout(state.cleanupTimer)
    state.cleanupTimer = 0
  }
  const duration = Math.max(1, state.config.activeColorDurationMs)
  const reverseProgress = 1 - clamp(state.restoreProgress ?? 1)
  const raw = rawFromCurvedProgress(reverseProgress, state.config.activeColorCurve)
  state.mode = "restore-reverse"
  state.reason = "hover-return"
  state.startTime = now - state.config.activeColorDelayMs - raw * duration
  state.lastDraw = 0
  clearRestoreReady(card)
  holdMotion(card)
  state.hiddenSource = hideRestoreSource(card)
  state.canvas.style.transition = "none"
  state.canvas.style.opacity = "1"
  state.canvas.style.visibility = "visible"
  activeStates.add(state)
  drawState(state, now)
  card.setAttribute(RETURN_ATTRIBUTE, "true")
  scheduleAnimationLoop()
  return true
}

function keepRunningHoverRestore(state) {
  return Boolean(
    state &&
      state.reason === "hover" &&
      (state.mode === "restore" || state.mode === "placeholder"),
  )
}

function retargetHoverReturnToRestore(card, state) {
  if (
    !state ||
    state.mode !== "restore-reverse" ||
    !state.sourcePixels ||
    !state.canvas?.isConnected
  ) {
    return false
  }

  const now = performance.now()
  if (state.handoffFrame) {
    cancelAnimationFrame(state.handoffFrame)
    state.handoffFrame = 0
  }
  if (state.cleanupFrame) {
    cancelAnimationFrame(state.cleanupFrame)
    state.cleanupFrame = 0
  }
  if (state.readyFrame) {
    cancelAnimationFrame(state.readyFrame)
    state.readyFrame = 0
  }
  if (state.readyTimer) {
    window.clearTimeout(state.readyTimer)
    state.readyTimer = 0
  }
  if (state.cleanupTimer) {
    window.clearTimeout(state.cleanupTimer)
    state.cleanupTimer = 0
  }

  const restoreProgress = clamp(state.restoreProgress ?? 0)
  const duration = Math.max(1, state.config.activeColorDurationMs)
  const raw = rawFromCurvedProgress(restoreProgress, state.config.activeColorCurve)
  state.mode = "restore"
  state.reason = "hover"
  state.startTime = now - state.config.activeColorDelayMs - raw * duration
  state.lastDraw = 0
  state.finished = false
  clearRestoreReady(card)
  clearRestoreSourceInline(state.hiddenSource)
  state.hiddenSource = null
  card.classList.remove("is-muted-restore-return")
  card.classList.add("is-muted-restore-intent")
  card.removeAttribute(RETURN_ATTRIBUTE)
  holdMotion(card)
  state.canvas.style.transition = "none"
  state.canvas.style.opacity = "1"
  state.canvas.style.visibility = "visible"
  activeStates.add(state)
  drawState(state, now)
  scheduleAnimationLoop()
  return true
}

function drawPaletteFrame(state) {
  const { ctx, grid } = state
  const data = state.framePixels
  for (let index = 0; index < grid.count; index += 1) {
    const offset = index * 4
    data[offset] = grid.palette[offset]
    data[offset + 1] = grid.palette[offset + 1]
    data[offset + 2] = grid.palette[offset + 2]
    data[offset + 3] = 255
  }
  ctx.putImageData(state.imageData, 0, 0)
}

function binaryPixelColor(bit, paper, ink) {
  return bit ? ink : paper
}

function boundaryFillOrder(boundary, col, row, noiseOrder, seed, frameTick) {
  if (!boundary?.total) return noiseOrder
  const patchWidth = Math.max(1, boundary.maxCol - boundary.minCol + 1)
  const patchHeight = Math.max(1, boundary.maxRow - boundary.minRow + 1)
  const nx = (col - boundary.minCol + 0.5) / patchWidth
  const ny = (row - boundary.minRow + 0.5) / patchHeight
  const localCluster = hash01(
    seed,
    Math.floor(nx * 9),
    Math.floor(ny * 9),
    1800 + Math.floor(frameTick * 0.28),
  )
  return clamp(noiseOrder * 0.82 + localCluster * 0.18)
}

function curvedActiveColorProgress(raw, config) {
  return 1 - Math.pow(1 - clamp(raw), Math.max(0.05, config.activeColorCurve))
}

function categorySnowState(state) {
  return state.reason === "category-exit" || state.reason === "category-enter"
}

function categoryBreathAmount(config) {
  return clamp(Number(config?.activeColorBreathAmount) || 0)
}

function categoryBreathHoldRatio(state, duration) {
  if (!categorySnowState(state)) return 0
  const holdMs = Math.max(0, Number(state.config?.activeColorBreathHoldMs) || 0)
  if (!holdMs) return 0
  return clamp(holdMs / Math.max(1, duration), 0, CATEGORY_BREATH_HOLD_MAX_RATIO)
}

function categorySnowProgress(state, raw, duration) {
  const holdRatio = categoryBreathHoldRatio(state, duration)
  if (!holdRatio) return { progress: curvedActiveColorProgress(raw, state.config), holdRatio }

  const scanSpan = Math.max(0.08, 1 - holdRatio)
  const scanRaw = state.direction === "out"
    ? raw / scanSpan
    : (raw - holdRatio) / scanSpan
  return {
    progress: curvedActiveColorProgress(scanRaw, state.config),
    holdRatio,
  }
}

function categoryHoldPresence(state, raw, holdRatio) {
  if (!holdRatio) return 0
  const fade = Math.max(0.001, holdRatio * 0.34)
  if (state.direction === "out") {
    return smooth01((raw - (1 - holdRatio)) / fade)
  }

  const fadeIn = smooth01(raw / fade)
  const fadeOut = 1 - smooth01((raw - holdRatio * 0.72) / Math.max(0.001, holdRatio * 0.28))
  return clamp(fadeIn * fadeOut)
}

function categoryFrontPresence(progress, order, config) {
  if (progress <= 0.012 || progress >= 0.988) return 0
  const softness = 0.07 + clamp(config.activeColorFlicker) * 0.105
  return smooth01((softness - Math.abs(order - progress)) / softness)
}

function categoryBreathingWave(state, index, col, row, now) {
  const { config, grid } = state
  const clusterSize = Math.max(1, Math.round(config.activeColorClusterSize))
  const clusterCol = Math.floor(col / clusterSize)
  const clusterRow = Math.floor(row / clusterSize)
  const groupPhase = hash01(config.activeColorSeed, clusterCol, clusterRow, 3001)
  const cellPhase = hash01(config.activeColorSeed, col, row, 3002)
  const groupRate = hash01(config.activeColorSeed, clusterCol, clusterRow, 3003)
  const rate = Math.max(0.08, Number(config.activeColorBreathRate) || 0.42) *
    (0.86 + groupRate * 0.28)
  const phase = groupPhase * TAU + cellPhase * 0.76 + grid.order[index] * TAU * 0.19
  const timeSeconds = now / 1000
  const primary = Math.sin(timeSeconds * TAU * rate + phase)
  const drift = Math.sin(timeSeconds * TAU * rate * 0.37 + phase * 0.61 + 1.13)
  const secondary = Math.sin(timeSeconds * TAU * rate * 1.61 + phase * 1.37 - 0.47)
  return clamp(0.5 + primary * 0.26 + drift * 0.17 + secondary * 0.055)
}

function restoreImageHandoffProgress(state, restoreProgress) {
  const duration = Math.max(1, Number(state.config?.activeColorDurationMs) || 1)
  const settleMs = Math.max(0, Number(state.config?.activeColorImageHandoffMs) || 0)
  const span = clamp(settleMs / duration, 0.12, 0.28)
  return clamp((restoreProgress - (1 - span)) / span)
}

function restoreImageHandoffAlpha(state, index, col, row, handoffProgress, frameTick) {
  if (handoffProgress <= 0.001) return 255
  if (handoffProgress >= 0.999) return 0

  const clusterSize = Math.max(1, Math.round(state.config.activeColorClusterSize))
  const clusterMix = clamp(state.config.activeColorClusterMix)
  const clusterOrder = hash01(
    state.config.activeColorSeed,
    Math.floor(col / clusterSize),
    Math.floor(row / clusterSize),
    2400,
  )
  const order = clamp(state.grid.order[index] * (1 - clusterMix) + clusterOrder * clusterMix)
  const threshold = 0.025 + order * 0.76
  const release = smooth01(
    (handoffProgress - threshold + RESTORE_IMAGE_HANDOFF_SOFTNESS) /
      (RESTORE_IMAGE_HANDOFF_SOFTNESS * 2),
  )
  if (release <= 0.001) return 255

  const flicker = hash01(
    state.config.activeColorSeed,
    col,
    row,
    2450 + frameTick,
  )
  const sparkleClear = flicker < release * clamp(0.32 + state.config.activeColorFlicker * 0.46)
  if (sparkleClear) return 0
  return Math.round(255 * (1 - release))
}

function finishState(state) {
  activeStates.delete(state)

  if (state.mode === "restore-reverse") {
    clearRestoreReady(state.card)
    const handoffStarted = window.__RED_HOVER_BINARY_RETURN__?.play?.(state.card) === true
    const source = handoffStarted ? state.hiddenSource : exposeRestoreSource(state.card)
    state.handoffFrame = requestAnimationFrame(() => {
      if (state.canvas.isConnected) state.canvas.remove()
      cardStates.delete(state.card)
      state.card.removeAttribute(RETURN_ATTRIBUTE)
      state.cleanupFrame = requestAnimationFrame(() => {
        clearRestoreSourceInline(source)
        releaseMotionAfterFrames(state.card, handoffStarted ? 0 : 2, {
          cooldown: !handoffStarted,
        })
      })
    })
    return
  }

  if (state.mode === "restore" && state.sourcePixels) {
    state.finished = true
    state.restoreProgress = 1
    markRestoreReady(state.card)
    state.cleanupFrame = requestAnimationFrame(() => {
      state.cleanupFrame = 0
      if (cardStates.get(state.card) !== state || !state.canvas.isConnected) return
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
      state.canvas.style.transition = "none"
      state.canvas.style.opacity = "0"
      state.cleanupTimer = window.setTimeout(() => {
        state.cleanupTimer = 0
        if (cardStates.get(state.card) !== state) return
        if (state.canvas.isConnected) state.canvas.remove()
        cardStates.delete(state.card)
        releaseMotionAfterFrames(state.card, 1)
      }, 34)
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
  const { card, canvas, ctx, grid, config, paper, ink, startTime, direction } = state
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
  const isCategorySnow = categorySnowState(state)
  const categoryProgress = isCategorySnow
    ? categorySnowProgress(state, raw, duration)
    : null
  const progress = categoryProgress
    ? categoryProgress.progress
    : curvedActiveColorProgress(raw, config)
  const categoryHold = categoryProgress
    ? categoryHoldPresence(state, raw, categoryProgress.holdRatio)
    : 0
  const categoryAmount = isCategorySnow ? categoryBreathAmount(config) : 0
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
    if (!restoring) {
      const returnProgress = progress
      state.restoreProgress = 1 - returnProgress
      const settleProgress = smooth01(returnProgress)
      const settleSoftness = 0.1

      for (let index = 0; index < grid.count; index += 1) {
        const settleThreshold = 0.035 + (1 - grid.order[index]) * 0.93
        const settled = smooth01(
          (settleProgress - settleThreshold + settleSoftness) /
            (settleSoftness * 2),
        )
        const col = index % grid.cols
        const row = Math.floor(index / grid.cols)
        const offset = index * 4
        const transitionBand = 4 * settled * (1 - settled)
        const flicker = hash01(
          config.activeColorSeed,
          col,
          row,
          2200 + frameTick,
        )
        const colorChance = clamp(
          density * (1 - config.activeColorPaperRatio * 0.5) +
            transitionBand * 0.28,
        )
        const useColorSnow = flicker < colorChance
        const snow = useColorSnow ? grid.palette : paper
        const snowMix = clamp(transitionBand * (0.24 + density * 0.24))
        const baseR =
          grid.palette[offset] * (1 - settled) + state.sourcePixels[offset] * settled
        const baseG =
          grid.palette[offset + 1] * (1 - settled) +
          state.sourcePixels[offset + 1] * settled
        const baseB =
          grid.palette[offset + 2] * (1 - settled) +
          state.sourcePixels[offset + 2] * settled

        data[offset] = baseR * (1 - snowMix) + snow[0] * snowMix
        data[offset + 1] = baseG * (1 - snowMix) + snow[1] * snowMix
        data[offset + 2] = baseB * (1 - snowMix) + snow[2] * snowMix
        data[offset + 3] = 255
      }

      ctx.putImageData(state.imageData, 0, 0)
      if (raw >= 1) finishState(state)
      return
    }

    const restoreProgress = restoring ? progress : 1 - progress
    state.restoreProgress = restoreProgress
    if (restoring) {
      const boundary = state.restoreBoundary
      const hasBoundaryPatch = Boolean(boundary?.total)
      const binaryProgress = hasBoundaryPatch ? restoreProgress : 1
      const fillSoftness = 0.13
      const colorSoftness = 0.085
      const colorDelay = hasBoundaryPatch ? 0.18 : 0.035
      const colorSpan = hasBoundaryPatch ? 0.78 : 0.93
      const imageHandoff = restoreImageHandoffProgress(state, restoreProgress)
      if (imageHandoff > 0.001 && !state.imageHandoffStarted) {
        state.imageHandoffStarted = true
        markRestoreReady(state.card)
      }
      const fullPixels = state.fullPixels || state.sourcePixels
      const fullBits = state.fullBits
      const sourceBits = state.sourceBits

      for (let index = 0; index < grid.count; index += 1) {
        const col = index % grid.cols
        const row = Math.floor(index / grid.cols)
        const offset = index * 4
        let binaryR = state.sourcePixels[offset]
        let binaryG = state.sourcePixels[offset + 1]
        let binaryB = state.sourcePixels[offset + 2]
        let fillThreshold = 0
        let filled = 1
        const boundaryPixel =
          hasBoundaryPatch &&
          fullBits &&
          sourceBits &&
          sourceBits[index] !== fullBits[index]

        if (boundaryPixel) {
          const fillOrder = boundaryFillOrder(
            boundary,
            col,
            row,
            grid.order[index],
            config.activeColorSeed,
            frameTick,
          )
          fillThreshold = 0.025 + fillOrder * 0.72
          filled = smooth01(
            (binaryProgress - fillThreshold + fillSoftness) /
              (fillSoftness * 2),
          )
          const transitionBand = 4 * filled * (1 - filled)
          const cellPulse = hash01(
            config.activeColorSeed,
            col,
            row,
            1900 + frameTick,
          )
          const sparkle = hash01(
            config.activeColorSeed,
            col,
            row,
            1950 + frameTick,
          )
          const bit = cellPulse < filled ? fullBits[index] : sourceBits[index]
          const rgba = binaryPixelColor(bit, paper, ink)
          binaryR = rgba[0]
          binaryG = rgba[1]
          binaryB = rgba[2]
          const sparkleChance = transitionBand *
            (0.16 + density * 0.28) *
            (1 - config.activeColorPaperRatio * 0.3)
          if (transitionBand > 0.001 && sparkle < sparkleChance) {
            const snow = binaryPixelColor(hash01(config.activeColorSeed, row, col, 1970 + frameTick) > 0.5 ? 1 : 0, paper, ink)
            binaryR = snow[0]
            binaryG = snow[1]
            binaryB = snow[2]
          }
        } else if (!hasBoundaryPatch || binaryProgress >= 0.999) {
          binaryR = fullPixels[offset]
          binaryG = fullPixels[offset + 1]
          binaryB = fullPixels[offset + 2]
        }

        if (restoreProgress <= colorDelay - colorSoftness) {
          data[offset] = binaryR
          data[offset + 1] = binaryG
          data[offset + 2] = binaryB
          data[offset + 3] = restoreImageHandoffAlpha(
            state,
            index,
            col,
            row,
            imageHandoff,
            frameTick,
          )
          continue
        }

        const decodeThreshold = boundaryPixel
          ? Math.max(colorDelay + grid.order[index] * colorSpan, fillThreshold + 0.08)
          : colorDelay + grid.order[index] * colorSpan
        const decoded = smooth01(
          (restoreProgress - decodeThreshold + colorSoftness) /
            (colorSoftness * 2),
        )
        const visibleDecoded = boundaryPixel ? decoded * filled : decoded
        const transitionBand = 4 * visibleDecoded * (1 - visibleDecoded)
        const flicker = hash01(
          config.activeColorSeed,
          col,
          row,
          2100 + frameTick,
        )
        const colorChance = clamp(
          density * (1 - config.activeColorPaperRatio * 0.48) +
            transitionBand * 0.3,
        )
        const useColorSnow = flicker < colorChance
        const snow = useColorSnow ? grid.palette : paper
        const snowMix = clamp(transitionBand * (0.24 + density * 0.24))
        const baseR =
          binaryR * (1 - visibleDecoded) + grid.palette[offset] * visibleDecoded
        const baseG =
          binaryG * (1 - visibleDecoded) + grid.palette[offset + 1] * visibleDecoded
        const baseB =
          binaryB * (1 - visibleDecoded) + grid.palette[offset + 2] * visibleDecoded

        data[offset] = baseR * (1 - snowMix) + snow[0] * snowMix
        data[offset + 1] = baseG * (1 - snowMix) + snow[1] * snowMix
        data[offset + 2] = baseB * (1 - snowMix) + snow[2] * snowMix
        data[offset + 3] = restoreImageHandoffAlpha(
          state,
          index,
          col,
          row,
          imageHandoff,
          frameTick,
        )
      }

      ctx.putImageData(state.imageData, 0, 0)
      if (raw >= 1) finishState(state)
      return
    }

    return
  }

  for (let index = 0; index < grid.count; index += 1) {
    const col = index % grid.cols
    const row = Math.floor(index / grid.cols)
    const order = grid.order[index]
    let effectiveOrder = order
    let categoryPulse = 0
    let breath = 0.5

    if (isCategorySnow && categoryAmount > 0.001) {
      const frontPulse = categoryFrontPresence(progress, order, config)
      categoryPulse = Math.max(categoryHold, frontPulse)
      if (categoryPulse > 0.001) {
        breath = categoryBreathingWave(state, index, col, row, now)
        const breathShift = (breath - 0.5) * 2 * categoryAmount
        effectiveOrder = clamp(
          order + breathShift * (categoryHold * 0.036 + frontPulse * 0.065),
        )
      }
    }

    const covered =
      direction === "out"
        ? effectiveOrder <= progress
        : effectiveOrder > progress
    if (!covered) continue

    const offset = index * 4
    const flicker = hash01(
      config.activeColorSeed,
      col,
      row,
      1000 + frameTick,
    )
    let colorChance = density * (1 - config.activeColorPaperRatio * 0.72)
    if (direction === "out") colorChance *= 1 - progress * 0.34
    if (categoryPulse > 0.001) {
      const pulse = (breath - 0.5) * 2
      colorChance = clamp(
        colorChance +
          pulse * categoryAmount * categoryPulse * 0.18 +
          categoryPulse * categoryAmount * 0.07,
      )
    }

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

  if (
    !config.activeColorEnabled ||
    prefersReducedMotion() ||
    (!options.includeOffscreen && !cardNearViewport(card))
  ) {
    cancelCard(card)
    return false
  }

  const existingState = cardStates.get(card)
  const hoverRestore =
    direction !== "out" &&
    options.reason === "hover" &&
    card?.classList?.contains("is-filter-muted")
  if (hoverRestore) {
    if (keepRunningHoverRestore(existingState) || hoverRestoreRetries.has(card)) {
      return true
    }
    if (retargetHoverReturnToRestore(card, existingState)) {
      return true
    }
  }

  cancelCard(card)

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

    const mode =
      options.mode ||
      (
        options.reason === "hover" &&
        card.classList.contains("is-filter-muted")
          ? "restore"
          : "snow"
      )
    const requiresRestoreSource = mode === "restore" || mode === "restore-reverse"
    const waitForHoverSource =
      mode === "restore" &&
      options.reason === "hover" &&
      card.classList.contains("is-filter-muted")

    if (requiresRestoreSource && !restoreSourceReady(card)) {
      clearRestoreReady(card)
      return waitForHoverSource
        ? scheduleHoverRestoreRetry(card, direction, index, inputConfig, options)
        : false
    }

    const descriptor = paletteDescriptor(img, media, config)
    if (!descriptor) return false
    const grid =
      paletteCache.get(descriptor.key) ||
      buildLocalPalette(img, media, config, descriptor)
    if (!grid) return false

    const paper = readPaperColor()
    const ink = readInkColor()
    const restoreSurface =
      requiresRestoreSource
        ? buildRestoreSurface(card, grid, paper, ink)
        : null
    const sourcePixels = restoreSurface?.sourcePixels || null
    if (requiresRestoreSource && !sourcePixels) {
      clearRestoreReady(card)
      return waitForHoverSource
        ? scheduleHoverRestoreRetry(card, direction, index, inputConfig, options)
        : false
    }

    const canvas = ensureCanvas(card, grid.cols, grid.rows)
    const ctx = canvas?.getContext("2d", { alpha: true })
    if (!canvas || !ctx) return false

    holdMotion(card)
    if (mode === "restore-reverse" && sourcePixels) clearRestoreReady(card)
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
    const durationScale = durationScaleForReason(options.reason)
    const scaledDuration = (duration) =>
      Math.max(1, Math.round(Math.max(1, duration) * durationScale))
    const baseEnterDuration = sourcePixels
      ? config.activeColorDurationMs + config.activeColorSettleMs
      : config.activeColorDurationMs
    const localConfig = {
      ...config,
      activeColorExitDurationMs:
        direction === "out" && hasDurationOverride
          ? Math.max(1, durationOverride)
          : scaledDuration(config.activeColorExitDurationMs),
      activeColorDurationMs:
        direction !== "out" && hasDurationOverride
          ? Math.max(1, durationOverride)
          : scaledDuration(baseEnterDuration),
      activeColorDelayMs:
        config.activeColorDelayMs +
        Math.max(0, index) * config.activeColorStaggerMs,
      activeColorImageHandoffMs: Math.round(clamp(
        Math.max(RESTORE_IMAGE_HANDOFF_MIN_MS, Number(config.activeColorSettleMs || 0) + 44) *
          durationScale,
        RESTORE_IMAGE_HANDOFF_MIN_MS,
        RESTORE_IMAGE_HANDOFF_MAX_MS,
      )),
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
      ink,
      sourcePixels,
      fullPixels: restoreSurface?.fullPixels || null,
      sourceBits: restoreSurface?.sourceBits || null,
      fullBits: restoreSurface?.fullBits || null,
      restoreBoundary: restoreSurface?.boundary || null,
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
    if (mode === "restore-reverse" && sourcePixels) {
      card.setAttribute(RETURN_ATTRIBUTE, "true")
    }
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
  const cards = playableCards(targetCatalog, { includeMuted })
    .filter((card) => includeOffscreen || cardNearViewport(card))
  cards.forEach((card, index) => {
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
        cancelHoverRestoreRetry(card)
        if (state?.reason === "hover") cancelCard(card)
        return
      }
      const parentCatalog = card.closest(".catalog")
      const state = cardStates.get(card)
      const canceledPendingRestore = cancelHoverRestoreRetry(card)
      if (
        parentCatalog?.dataset.activeFilter &&
        !parentCatalog.dataset.filterPhase &&
        card.classList.contains("is-filter-muted")
      ) {
        if (canceledPendingRestore && !state) return
        if (state?.mode === "placeholder" && state.reason === "hover") {
          cancelCard(card)
          return
        }
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
      includeOffscreen: false,
      reason: "category-exit",
    })
    return
  }

  if (phase === "entering") {
    stopCatalogStates(targetCatalog)
    schedulePrewarm(targetCatalog)
    playCatalog(targetCatalog, "in", {
      force: true,
      includeMuted: false,
      includeOffscreen: false,
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
    hubLoadPromise = import("./active-color-hub.js?v=20260901-categorybreath1")
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
  hoverSuppressed: hoverSnowSuppressedByScroll,
  getConfig: () => runtimeConfig,
}
