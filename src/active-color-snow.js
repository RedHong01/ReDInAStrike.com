import {
  PUBLISHED_ACTIVE_COLOR_CONFIG,
  decodeActiveColorConfig,
  sanitizeActiveColorConfig,
} from "./active-color-default.js"

const STYLE_ID = "red-active-color-snow-style"
const CANVAS_CLASS = "active-color-snow-canvas"
const ROOT_ATTRIBUTE = "data-red-active-color-snow"
const MAX_GRID_CELLS = 42000
const MAX_PALETTE_CACHE = 72
const VIEWPORT_MARGIN = 620
const TARGET_FRAME_MS = 1000 / 60

const cardStates = new WeakMap()
const activeStates = new Set()
const paletteCache = new Map()
const prewarmQueued = new Set()
const prewarmImageBound = new WeakSet()

let animationFrame = 0
let catalogObserver = null
let appObserver = null
let catalog = null
let previousFilter = null
let lastPhase = ""
let hubLoadPromise = null
let panelWatchObserver = null
let prewarmHandle = 0
let paperCacheKey = ""
let paperCacheValue = [248, 247, 245, 255]

function configFromUrl() {
  const encoded = new URLSearchParams(location.search).get("activeColorConfig")
  return encoded ? decodeActiveColorConfig(encoded) : null
}

let runtimeConfig = sanitizeActiveColorConfig(configFromUrl() || PUBLISHED_ACTIVE_COLOR_CONFIG)
window.__RED_ACTIVE_COLOR_CONFIG__ = runtimeConfig

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

function logicalGridSize(media, config) {
  const rect = media.getBoundingClientRect()
  let cols = Math.max(
    1,
    Math.ceil(Math.max(1, rect.width) / Math.max(1, config.activeColorCellPx)),
  )
  let rows = Math.max(
    1,
    Math.ceil(Math.max(1, rect.height) / Math.max(1, config.activeColorCellPx)),
  )

  const count = cols * rows
  if (count > MAX_GRID_CELLS) {
    const scale = Math.sqrt(count / MAX_GRID_CELLS)
    cols = Math.max(1, Math.floor(cols / scale))
    rows = Math.max(1, Math.floor(rows / scale))
  }
  return { cols, rows }
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
  const clusterSize = Math.max(1, Math.round(config.activeColorClusterSize))
  const clusterMix = clamp(config.activeColorClusterMix)
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

      const localRandom = hash01(config.activeColorSeed, col, row, 1)
      const clusterRandom = hash01(
        config.activeColorSeed,
        Math.floor(col / clusterSize),
        Math.floor(row / clusterSize),
        9,
      )
      order[index] = localRandom * (1 - clusterMix) + clusterRandom * clusterMix
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

function cancelCard(card, { remove = true } = {}) {
  const state = cardStates.get(card)
  if (state) activeStates.delete(state)
  cardStates.delete(card)
  const canvas = card?.querySelector(`.${CANVAS_CLASS}`)
  if (canvas && remove) canvas.remove()
}

function finishState(state) {
  activeStates.delete(state)

  if (state.direction === "out") {
    state.finished = true
    return
  }

  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
  state.canvas.style.opacity = "0"
  cardStates.delete(state.card)
  state.canvas.remove()
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

function playCard(card, direction = "in", index = 0, inputConfig = runtimeConfig) {
  const config = sanitizeActiveColorConfig(inputConfig)
  cancelCard(card)

  if (
    !config.activeColorEnabled ||
    prefersReducedMotion() ||
    !cardNearViewport(card)
  ) {
    return false
  }

  const media = card.querySelector(".project-media")
  const img = media?.querySelector("img")
  if (!media || !img) return false

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

    ctx.imageSmoothingEnabled = false
    canvas.style.transition = "none"
    canvas.style.opacity = "1"
    canvas.style.visibility = "visible"

    const framePixels = new Uint8ClampedArray(grid.count * 4)
    const imageData = new ImageData(framePixels, grid.cols, grid.rows)
    const localConfig = {
      ...config,
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
      paper: readPaperColor(),
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

  if (img.complete && img.naturalWidth) return run()

  if (!prewarmImageBound.has(img)) {
    prewarmImageBound.add(img)
    img.addEventListener(
      "load",
      () => {
        prewarmImageBound.delete(img)
        if (!card.isConnected) return
        schedulePrewarm(card.closest(".catalog"))
        run()
      },
      { once: true, passive: true },
    )
  }
  return false
}

function allCards(targetCatalog = catalog) {
  return [...targetCatalog?.querySelectorAll(".project-card") || []]
}

function activeCards(targetCatalog = catalog) {
  return [
    ...targetCatalog?.querySelectorAll(
      ".project-card:not(.is-filter-muted)",
    ) || [],
  ]
}

function playCatalog(targetCatalog, direction, { force = false } = {}) {
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

  activeCards(targetCatalog).forEach((card, index) =>
    playCard(card, direction, index, runtimeConfig),
  )
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
  if (!prewarmQueued.size || prewarmHandle) return

  if ("requestIdleCallback" in window) {
    prewarmHandle = window.requestIdleCallback(runPrewarm, { timeout: 700 })
  } else {
    prewarmHandle = window.setTimeout(
      () => runPrewarm({ timeRemaining: () => 8, didTimeout: true }),
      32,
    )
  }
}

function clearPaletteCache() {
  paletteCache.clear()
  prewarmQueued.clear()
}

function handleCatalogPhase(targetCatalog) {
  if (!targetCatalog || !runtimeConfig.activeColorEnabled) return
  const phase = targetCatalog.dataset.filterPhase || ""
  if (phase === lastPhase) return
  lastPhase = phase

  if (phase === "exiting") {
    if (previousFilter) playCatalog(targetCatalog, "out", { force: true })
    return
  }

  if (phase === "entering") {
    stopCatalogStates(targetCatalog)
    schedulePrewarm(targetCatalog)
    requestAnimationFrame(() => playCatalog(targetCatalog, "in"))
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
  previousFilter = catalog?.dataset.activeFilter || null
  lastPhase = catalog?.dataset.filterPhase || ""

  if (!catalog || !("MutationObserver" in window)) return

  catalogObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.target === catalog &&
        mutation.attributeName === "data-active-filter"
      ) {
        previousFilter = mutation.oldValue || null
      }
    }

    if (mutations.some((mutation) => mutation.type === "childList")) {
      schedulePrewarm(catalog)
      if (catalog.dataset.filterPhase === "entering") {
        requestAnimationFrame(() => playCatalog(catalog, "in"))
      }
    }

    handleCatalogPhase(catalog)
  })

  catalogObserver.observe(catalog, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["data-filter-phase", "data-active-filter"],
  })

  schedulePrewarm(catalog)
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
  stop: stopCatalogStates,
  prewarm: () => schedulePrewarm(catalog),
  getConfig: () => runtimeConfig,
}
