import {
  BINARY_MOTION_DEFAULTS,
  binaryBitsEqual,
  buildBinaryOrder,
  drawBinaryBits,
  hash01,
  logicalGridForMedia,
  readBinaryColors,
  sampleBinaryCanvas,
  smooth01,
  writeBinaryPixel,
} from "./binary-surface-core.js?v=20260830-perfaudit1"
import { PUBLISHED_MOTION_CONFIG } from "./motion-default.js"
import {
  paintViewportDitherRevealNow,
  refreshViewportDitherReveals,
  trackViewportDitherReveal,
} from "./reveal-motion.js?v=20260904-edgespread1"
import {
  sampleCurrentBinarySurface,
} from "./binary-visible-surface.js?v=20260903-scrollperf2"

const STYLE_ID = "red-dither-resize-snow-style"
const STYLE_VERSION = "2"
export const DITHER_RESIZE_SNOW_CLASS = "dither-resize-snow-canvas"
export const DITHER_RESIZE_MOTION_ATTRIBUTE = "data-dither-resize-motion"

const TARGET_FRAME_MS = 1000 / 60
const VIEWPORT_MARGIN = 180
const RESIZE_DURATION_MS = BINARY_MOTION_DEFAULTS.durationMs
const INITIAL_DURATION_MS = 560
const RESIZE_SOFTNESS = BINARY_MOTION_DEFAULTS.softness
const REVEAL_HANDOFF_FRAMES = 2

const resizeStates = new WeakMap()
const activeStates = new Set()
let animationFrame = 0

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
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

function cardNearViewport(card) {
  const rect = card?.getBoundingClientRect?.()
  if (!rect) return false
  const viewportHeight = Math.max(
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
  )
  return rect.bottom >= -VIEWPORT_MARGIN && rect.top <= viewportHeight + VIEWPORT_MARGIN
}

function gridForMedia(media, config) {
  const grid = logicalGridForMedia(media, config)
  const rect = media.getBoundingClientRect()
  return {
    ...grid,
    cssWidth: Math.max(1, Math.round(rect.width)),
    cssHeight: Math.max(1, Math.round(rect.height)),
  }
}

function imageSource(img) {
  return img?.currentSrc || img?.src || ""
}

function canTransitionFromCurrentCanvas(img, canvas, grid, config, force) {
  if (force) return true
  if (canvas.dataset.active !== "true") return false
  if (canvas.dataset.ditherSource !== imageSource(img)) return false
  if ((canvas.dataset.ditherMode || "native") !== (config?.mode || "native")) return false

  const oldCols = Number(canvas.dataset.ditherColumns)
  const oldRows = Number(canvas.dataset.ditherRows)
  return oldCols !== grid.cols || oldRows !== grid.rows
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

function changedBinaryIndices(oldBits, newBits) {
  let count = 0
  for (let index = 0; index < oldBits.length; index += 1) {
    if (oldBits[index] !== newBits[index]) count += 1
  }

  const indices = new Uint32Array(count)
  let writeIndex = 0
  for (let index = 0; index < oldBits.length; index += 1) {
    if (oldBits[index] !== newBits[index]) {
      indices[writeIndex] = index
      writeIndex += 1
    }
  }
  return indices
}

function waitFrames(count, callback) {
  let remaining = Math.max(0, Math.round(count))
  const step = () => {
    if (remaining <= 0) {
      callback()
      return
    }
    remaining -= 1
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

function activeFinalCanvas(card) {
  return card?.querySelector?.('.dither-preview-canvas[data-active="true"]') || null
}

function currentCompositeBits(card, baseCanvas, cols, rows, paper, ink, config) {
  return sampleCurrentBinarySurface(card, {
    baseCanvas,
    cols,
    rows,
    paper,
    ink,
    ditherConfig: config,
    motionConfig: window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG,
  })?.bits || null
}

function syncRevealBeforeRemoving(state) {
  const finalCanvas = activeFinalCanvas(state.card)
  if (!finalCanvas || finalCanvas.width < 2 || finalCanvas.height < 2) return

  trackViewportDitherReveal(
    state.card,
    finalCanvas,
    window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG,
  )
  paintViewportDitherRevealNow(
    state.card,
    finalCanvas,
    window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG,
  )
  refreshViewportDitherReveals({ linger: false })
}

function finishState(state) {
  if (state.finishing) return
  state.finishing = true
  activeStates.delete(state)
  drawBinaryBits(state.ctx, state.imageData, state.framePixels, state.newBits, state.paper, state.ink)

  requestAnimationFrame(() => {
    if (resizeStates.get(state.card) !== state || !state.card.isConnected) return
    state.card.removeAttribute(DITHER_RESIZE_MOTION_ATTRIBUTE)
    syncRevealBeforeRemoving(state)

    waitFrames(REVEAL_HANDOFF_FRAMES, () => {
      if (resizeStates.get(state.card) !== state) return
      syncRevealBeforeRemoving(state)
      if (state.canvas.isConnected) state.canvas.remove()
      resizeStates.delete(state.card)
    })
  })
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
    img,
    sourceCanvas,
    grid,
    config,
    options.force === true,
  )) return null

  const { paper, ink } = readBinaryColors()
  const oldBits =
    currentCompositeBits(card, sourceCanvas, grid.cols, grid.rows, paper, ink, config) ||
    sampleBinaryCanvas(sourceCanvas, grid.cols, grid.rows, paper, ink)
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
  drawBinaryBits(ctx, imageData, framePixels, oldBits, paper, ink)

  return {
    card,
    canvas,
    ctx,
    cols: grid.cols,
    rows: grid.rows,
    oldBits,
    paper,
    ink,
    config,
    framePixels,
    imageData,
    reason: options.reason || "resize",
    durationMs: Number(options.durationMs) || RESIZE_DURATION_MS,
  }
}

export function prepareDitherInitialSnow(card, config, options = {}) {
  ensureStyles()
  if (prefersReducedMotion() || !cardNearViewport(card)) return null
  if (card?.getAttribute?.("data-active-color-motion") === "true") return null
  if (card?.classList?.contains("is-muted-restore-intent")) return null

  const media = card?.querySelector(".project-media")
  const img = media?.querySelector("img")
  const sourceCanvas = media?.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!media || !img?.complete || !img.naturalWidth) return null
  if (sourceCanvas && options.force !== true) return null

  const grid = gridForMedia(media, config)
  const { paper, ink } = readBinaryColors()
  const oldBits = new Uint8Array(grid.cols * grid.rows)

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
  drawBinaryBits(ctx, imageData, framePixels, oldBits, paper, ink)

  return {
    card,
    canvas,
    ctx,
    cols: grid.cols,
    rows: grid.rows,
    oldBits,
    paper,
    ink,
    config,
    framePixels,
    imageData,
    reason: options.reason || "initial",
    durationMs: Number(options.durationMs) || INITIAL_DURATION_MS,
  }
}

function drawState(state, now) {
  const {
    card,
    canvas,
    ctx,
    cols,
    oldBits,
    newBits,
    order,
    paper,
    ink,
    framePixels,
    imageData,
    startTime,
    seed,
    changedIndices,
  } = state

  if (!card.isConnected || !canvas.isConnected) {
    cancelState(card)
    return
  }
  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) return
  state.lastDraw = now

  const raw = clamp((now - startTime) / Math.max(1, state.durationMs || RESIZE_DURATION_MS))
  const progress = smooth01(raw)
  const frameTick = Math.floor(now / 46)
  const data = framePixels

  for (let changeIndex = 0; changeIndex < changedIndices.length; changeIndex += 1) {
    const index = changedIndices[changeIndex]
    const oldBit = oldBits[index]
    const newBit = newBits[index]

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
    finishState(state)
  }
}

function animationLoop(now) {
  animationFrame = 0
  for (const state of [...activeStates]) drawState(state, now)
  if (activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function scheduleAnimationLoop() {
  if (!animationFrame && activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

export function playPreparedDitherResizeSnow(prepared) {
  if (!prepared?.card?.isConnected) return false
  const finalCanvas = prepared.card.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!finalCanvas || finalCanvas.width < 2 || finalCanvas.height < 2) {
    cancelState(prepared.card)
    return false
  }

  const newBits =
    currentCompositeBits(
      prepared.card,
      finalCanvas,
      prepared.cols,
      prepared.rows,
      prepared.paper,
      prepared.ink,
      prepared.config,
    ) ||
    sampleBinaryCanvas(
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

  const createState = (changedIndices) => ({
    ...prepared,
    newBits,
    changedIndices,
    order: buildBinaryOrder(
      prepared.cols,
      prepared.rows,
      BINARY_MOTION_DEFAULTS.seed + prepared.cols * 3 + prepared.rows * 5,
    ),
    startTime: performance.now(),
    lastDraw: 0,
    seed: BINARY_MOTION_DEFAULTS.seed + prepared.cols * 3 + prepared.rows * 5,
  })

  if (binaryBitsEqual(prepared.oldBits, newBits)) {
    const state = createState(new Uint32Array(0))
    resizeStates.set(prepared.card, state)
    finishState(state)
    return true
  }

  const changedIndices = changedBinaryIndices(prepared.oldBits, newBits)
  if (!changedIndices.length) {
    const state = createState(changedIndices)
    resizeStates.set(prepared.card, state)
    finishState(state)
    return true
  }

  const state = createState(changedIndices)

  resizeStates.set(prepared.card, state)
  activeStates.add(state)
  drawState(state, state.startTime)
  scheduleAnimationLoop()
  return true
}

ensureStyles()

window.__RED_DITHER_RESIZE_SNOW__ = {
  cancel: cancelDitherResizeSnow,
  prepareInitial: prepareDitherInitialSnow,
  prepare: prepareDitherResizeSnow,
  playPrepared: playPreparedDitherResizeSnow,
}
