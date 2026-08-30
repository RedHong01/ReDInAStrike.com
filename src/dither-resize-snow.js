const STYLE_ID = "red-dither-resize-snow-style"
export const DITHER_RESIZE_SNOW_CLASS = "dither-resize-snow-canvas"
export const DITHER_RESIZE_MOTION_ATTRIBUTE = "data-dither-resize-motion"

const TARGET_FRAME_MS = 1000 / 60
const VIEWPORT_MARGIN = 180
const MAX_GRID_CELLS = 52000
const RESIZE_DURATION_MS = 420
const RESIZE_SOFTNESS = 0.095

const resizeStates = new WeakMap()
const activeStates = new Set()
let animationFrame = 0
let paperCacheKey = ""
let paperCacheValue = [248, 247, 245, 255]
let inkCacheKey = ""
let inkCacheValue = [69, 69, 69, 255]

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
    .${DITHER_RESIZE_SNOW_CLASS} {
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
    .project-card[${DITHER_RESIZE_MOTION_ATTRIBUTE}="true"] .dither-reveal-canvas {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    @media (prefers-reduced-motion: reduce) {
      .${DITHER_RESIZE_SNOW_CLASS} { display: none !important; }
    }
  `
}

function parseColor(css, fallback) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
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
  paperCacheValue = parseColor(value, [248, 247, 245, 255])
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

function colorDistance(data, offset, rgba) {
  const dr = data[offset] - rgba[0]
  const dg = data[offset + 1] - rgba[1]
  const db = data[offset + 2] - rgba[2]
  return dr * dr + dg * dg + db * db
}

function isInk(data, offset, paper, ink) {
  return colorDistance(data, offset, ink) <= colorDistance(data, offset, paper)
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

function gridForMedia(media, config) {
  const rect = media.getBoundingClientRect()
  const cssWidth = Math.max(1, Math.round(rect.width))
  const cssHeight = Math.max(1, Math.round(rect.height))
  const cols = Math.max(1, Math.round(Number(config?.columns) || 240))
  const grid = constrainGridSize(cols, cols * cssHeight / cssWidth)
  return { ...grid, cssWidth, cssHeight }
}

function imageSource(img) {
  return img?.currentSrc || img?.src || ""
}

function canTransitionFromCurrentCanvas(card, media, img, canvas, grid, config, force) {
  if (force) return true
  if (canvas.dataset.active !== "true") return false
  if (!canvas.dataset.ditherCssWidth || !canvas.dataset.ditherCssHeight) return false
  if (canvas.dataset.ditherSource !== imageSource(img)) return false
  if ((canvas.dataset.ditherMode || "native") !== (config?.mode || "native")) return false

  const oldWidth = Number(canvas.dataset.ditherCssWidth)
  const oldHeight = Number(canvas.dataset.ditherCssHeight)
  const oldCols = Number(canvas.dataset.ditherColumns)
  const oldRows = Number(canvas.dataset.ditherRows)
  const widthChanged = Math.abs(oldWidth - grid.cssWidth) >= 1
  const heightChanged = Math.abs(oldHeight - grid.cssHeight) >= 1
  const gridChanged = oldCols !== grid.cols || oldRows !== grid.rows
  return widthChanged || heightChanged || gridChanged
}

function sampleBinaryCanvas(sourceCanvas, cols, rows, paper, ink) {
  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const ctx = sample.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = `rgba(${paper[0]}, ${paper[1]}, ${paper[2]}, ${paper[3] / 255})`
  ctx.fillRect(0, 0, cols, rows)

  try {
    ctx.drawImage(sourceCanvas, 0, 0, cols, rows)
    const data = ctx.getImageData(0, 0, cols, rows).data
    const bits = new Uint8Array(cols * rows)
    for (let index = 0; index < bits.length; index += 1) {
      bits[index] = isInk(data, index * 4, paper, ink) ? 1 : 0
    }
    return bits
  } catch {
    return null
  }
}

function ensureCanvas(card, cols, rows) {
  const media = card?.querySelector(".project-media")
  if (!media) return null
  let canvas = media.querySelector(`:scope > .${DITHER_RESIZE_SNOW_CLASS}`)
  if (!canvas) {
    canvas = document.createElement("canvas")
    canvas.className = DITHER_RESIZE_SNOW_CLASS
    canvas.setAttribute("aria-hidden", "true")
    media.appendChild(canvas)
  }
  if (canvas.width !== cols) canvas.width = cols
  if (canvas.height !== rows) canvas.height = rows
  return canvas
}

function writeBinaryPixel(data, offset, bit, paper, ink) {
  const rgba = bit ? ink : paper
  data[offset] = rgba[0]
  data[offset + 1] = rgba[1]
  data[offset + 2] = rgba[2]
  data[offset + 3] = 255
}

function drawBits(ctx, imageData, framePixels, bits, paper, ink) {
  for (let index = 0; index < bits.length; index += 1) {
    writeBinaryPixel(framePixels, index * 4, bits[index], paper, ink)
  }
  ctx.putImageData(imageData, 0, 0)
}

function buildOrder(cols, rows, seed) {
  const order = new Float32Array(cols * rows)
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const local = hash01(seed, col, row, 17)
      const cluster = hash01(seed, Math.floor(col / 3), Math.floor(row / 3), 31)
      order[row * cols + col] = local * 0.84 + cluster * 0.16
    }
  }
  return order
}

function cancelState(card, remove = true) {
  const state = resizeStates.get(card)
  if (state) activeStates.delete(state)
  resizeStates.delete(card)
  const canvas = card?.querySelector(`.${DITHER_RESIZE_SNOW_CLASS}`)
  if (canvas && remove) canvas.remove()
  card?.removeAttribute(DITHER_RESIZE_MOTION_ATTRIBUTE)
}

export function cancelDitherResizeSnow(card, options = {}) {
  cancelState(card, options.remove !== false)
}

export function prepareDitherResizeSnow(card, config, options = {}) {
  ensureStyles()
  if (prefersReducedMotion() || !cardNearViewport(card)) return null
  if (card?.getAttribute?.("data-active-color-motion") === "true") return null
  if (card?.classList?.contains("is-muted-restore-intent")) return null

  const media = card?.querySelector(".project-media")
  const img = media?.querySelector("img")
  const sourceCanvas = media?.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!media || !img?.complete || !img.naturalWidth || !sourceCanvas) return null
  if (sourceCanvas.width < 2 || sourceCanvas.height < 2) return null

  const grid = gridForMedia(media, config)
  if (!canTransitionFromCurrentCanvas(
    card,
    media,
    img,
    sourceCanvas,
    grid,
    config,
    options.force === true,
  )) return null

  const paper = readPaperColor()
  const ink = readInkColor()
  const oldBits = sampleBinaryCanvas(sourceCanvas, grid.cols, grid.rows, paper, ink)
  if (!oldBits) return null

  cancelState(card)
  const canvas = ensureCanvas(card, grid.cols, grid.rows)
  const ctx = canvas?.getContext("2d", { alpha: true })
  if (!canvas || !ctx) return null

  ctx.imageSmoothingEnabled = false
  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  canvas.style.visibility = "visible"
  card.setAttribute(DITHER_RESIZE_MOTION_ATTRIBUTE, "true")

  const framePixels = new Uint8ClampedArray(oldBits.length * 4)
  const imageData = new ImageData(framePixels, grid.cols, grid.rows)
  drawBits(ctx, imageData, framePixels, oldBits, paper, ink)

  return {
    card,
    canvas,
    ctx,
    cols: grid.cols,
    rows: grid.rows,
    oldBits,
    paper,
    ink,
    framePixels,
    imageData,
    reason: options.reason || "resize",
  }
}

function drawState(state, now) {
  const {
    card,
    canvas,
    ctx,
    cols,
    rows,
    oldBits,
    newBits,
    order,
    paper,
    ink,
    framePixels,
    imageData,
    startTime,
    seed,
  } = state

  if (!card.isConnected || !canvas.isConnected) {
    cancelState(card)
    return
  }
  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) return
  state.lastDraw = now

  const raw = clamp((now - startTime) / RESIZE_DURATION_MS)
  const progress = smooth01(raw)
  const frameTick = Math.floor(now / 46)
  const data = framePixels

  for (let index = 0; index < oldBits.length; index += 1) {
    const oldBit = oldBits[index]
    const newBit = newBits[index]

    if (oldBit === newBit) {
      writeBinaryPixel(data, index * 4, oldBit, paper, ink)
      continue
    }

    let bit = oldBit
    const threshold = 0.035 + order[index] * 0.93
    const local = smooth01(
      (progress - threshold + RESIZE_SOFTNESS) / (RESIZE_SOFTNESS * 2),
    )

    if (local > 0.001 && local < 0.999) {
      const col = index % cols
      const row = Math.floor(index / cols)
      const flicker = hash01(seed, col, row, 9000 + frameTick)
      bit = flicker < local ? newBit : oldBit
    } else if (local >= 0.999) {
      bit = newBit
    }

    writeBinaryPixel(data, index * 4, bit, paper, ink)
  }

  ctx.putImageData(imageData, 0, 0)

  if (raw >= 1) {
    drawBits(ctx, imageData, framePixels, newBits, paper, ink)
    activeStates.delete(state)
    resizeStates.delete(card)
    requestAnimationFrame(() => {
      if (canvas.isConnected) canvas.remove()
      card.removeAttribute(DITHER_RESIZE_MOTION_ATTRIBUTE)
    })
  }
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

export function playPreparedDitherResizeSnow(prepared) {
  if (!prepared?.card?.isConnected) return false
  const finalCanvas = prepared.card.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!finalCanvas || finalCanvas.width < 2 || finalCanvas.height < 2) {
    cancelState(prepared.card)
    return false
  }

  const newBits = sampleBinaryCanvas(
    finalCanvas,
    prepared.cols,
    prepared.rows,
    prepared.paper,
    prepared.ink,
  )
  if (!newBits) {
    cancelState(prepared.card)
    return false
  }

  const seed = 2203 + prepared.cols * 3 + prepared.rows * 5
  const state = {
    ...prepared,
    newBits,
    order: buildOrder(prepared.cols, prepared.rows, seed),
    startTime: performance.now(),
    lastDraw: 0,
    seed,
  }

  resizeStates.set(prepared.card, state)
  activeStates.add(state)
  drawState(state, state.startTime)
  scheduleAnimationLoop()
  return true
}

ensureStyles()

window.__RED_DITHER_RESIZE_SNOW__ = {
  cancel: cancelDitherResizeSnow,
  prepare: prepareDitherResizeSnow,
  playPrepared: playPreparedDitherResizeSnow,
}
