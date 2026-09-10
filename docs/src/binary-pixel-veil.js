// A full-viewport dissolve written in the shared binary vocabulary. The page is
// taken apart into paper/ink cells in the canonical order, and what is left is
// the plain paper field a centred plate needs behind it.
//
// Everything visible is a pure function of one coverage scalar, so the veil has
// no history to keep in sync: a close that interrupts an open continues from
// the frame on screen instead of snapping to full coverage first, and the same
// cells come back in the same grain they left by.
//
// Cell colour stays paper and ink (MOTION_SYSTEM_SPEC section 4). Alpha is the
// one addition: a veil has to let the page through before it takes it, so a
// cell is either the page (clear) or the surface (opaque), never a blend.

import {
  BINARY_MOTION_DEFAULTS,
  buildBinaryOrder,
  clamp01,
  constrainBinaryGridSize,
  hash01,
  readBinaryColors,
  smooth01,
} from "./binary-surface-core.js?v=20260905-perf1"

const STYLE_ID = "binary-pixel-veil-style"
const CANVAS_CLASS = "binary-pixel-veil"

const SOFTNESS = BINARY_MOTION_DEFAULTS.softness
const SEED = BINARY_MOTION_DEFAULTS.seed
// Same threshold ramp the resize reconcile uses, so a cell's place in the
// dissolve is the one place the canonical order already gave it.
const THRESHOLD_BASE = 0.035
const THRESHOLD_SPAN = 0.93
const TARGET_FRAME_MS = 1000 / 60
const FLICKER_TICK_MS = 46
// The lightbox backdrop this replaces was paper at 0.965; keep that value so a
// settled veil and the plain backdrop are the same surface.
const VEIL_ALPHA = 246
// Peak ink density at the middle of a cell's flight. Half the taken cells read
// as ink there, which is what makes the leading edge look like the page being
// resolved into bits rather than a sheet sliding over it.
const SNOW_INK_PEAK = 0.5
// A viewport is a much larger surface than a card, so the field is coarser than
// a card's 1.95-3.6px cell: fine enough to read as pixels, cheap enough that
// the active band stays a few thousand cells.
const TARGET_CELL_PX = 3.4
// Cells are bucketed by their order value so a frame only touches the band that
// is actually in flight; everything behind and ahead of it is already painted.
const ORDER_BUCKETS = 512

let canvas = null
let ctx = null
let imageData = null
let pixels = null
let field = null
let state = null
let animationFrame = 0

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement("style")
  style.id = STYLE_ID
  style.textContent = `
    .${CANVAS_CLASS} {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  `
  document.head.appendChild(style)
}

function bucketOf(order) {
  const bucket = (order * ORDER_BUCKETS) | 0
  return bucket < 0 ? 0 : bucket >= ORDER_BUCKETS ? ORDER_BUCKETS - 1 : bucket
}

function clampBucket(value) {
  return value < 0 ? 0 : value > ORDER_BUCKETS ? ORDER_BUCKETS : value
}

function veilGrid(width, height) {
  const cols = Math.max(8, Math.round(width / TARGET_CELL_PX))
  const rows = Math.max(8, Math.round(height / TARGET_CELL_PX))
  return constrainBinaryGridSize(cols, rows)
}

// One counting sort per grid turns the canonical order into a bucket-ordered
// index list. A bucket range is then a contiguous slice, which is what lets a
// frame paint only the cells whose threshold the coverage scalar is crossing.
function ensureField(cols, rows) {
  if (field && field.cols === cols && field.rows === rows) return field

  const count = cols * rows
  const order = buildBinaryOrder(cols, rows, SEED)
  const bucketStart = new Int32Array(ORDER_BUCKETS + 1)
  for (let index = 0; index < count; index += 1) bucketStart[bucketOf(order[index]) + 1] += 1
  for (let bucket = 0; bucket < ORDER_BUCKETS; bucket += 1) bucketStart[bucket + 1] += bucketStart[bucket]

  const cursor = bucketStart.slice(0, ORDER_BUCKETS)
  const sorted = new Int32Array(count)
  for (let index = 0; index < count; index += 1) {
    const bucket = bucketOf(order[index])
    sorted[cursor[bucket]] = index
    cursor[bucket] += 1
  }

  field = { cols, rows, count, order, sorted, bucketStart }
  return field
}

function writeCell(index, taken, inked) {
  const offset = index * 4
  if (!taken) {
    pixels[offset + 3] = 0
    return
  }
  const rgba = inked ? state.ink : state.paper
  pixels[offset] = rgba[0]
  pixels[offset + 1] = rgba[1]
  pixels[offset + 2] = rgba[2]
  pixels[offset + 3] = VEIL_ALPHA
}

function fillBuckets(from, to, taken) {
  if (to <= from) return
  const { sorted, bucketStart } = field
  const end = bucketStart[to]
  for (let cursor = bucketStart[from]; cursor < end; cursor += 1) writeCell(sorted[cursor], taken, false)
}

function paintBand(from, to, progress, tick) {
  if (to <= from) return
  const { sorted, bucketStart, order, cols } = field
  const end = bucketStart[to]
  for (let cursor = bucketStart[from]; cursor < end; cursor += 1) {
    const index = sorted[cursor]
    const threshold = THRESHOLD_BASE + order[index] * THRESHOLD_SPAN
    const local = smooth01((progress - threshold + SOFTNESS) / (SOFTNESS * 2))
    const col = index % cols
    const row = (index / cols) | 0
    if (hash01(SEED, col, row, 9000 + tick) < local) {
      // A hump, not a ramp: a cell is at its noisiest halfway through its own
      // flight and lands clean, so the field resolves instead of greying out.
      const ink = 4 * local * (1 - local) * SNOW_INK_PEAK
      writeCell(index, true, hash01(SEED, col, row, 4400 + tick) < ink)
    } else {
      writeCell(index, false, false)
    }
  }
}

// Buckets behind the band are painted taken, buckets ahead of it are painted
// clear, and the band itself is repainted every frame. Only the two edges can
// go stale, and each edge is repaired by the span between its old and new
// position -- which also covers a reversal, where the band walks back over
// cells it had already settled.
function renderProgress(progress, now) {
  const lowOrder = (progress - SOFTNESS - THRESHOLD_BASE) / THRESHOLD_SPAN
  const highOrder = (progress + SOFTNESS - THRESHOLD_BASE) / THRESHOLD_SPAN
  const coveredEnd = clampBucket(Math.floor(lowOrder * ORDER_BUCKETS))
  const clearStart = clampBucket(Math.ceil(highOrder * ORDER_BUCKETS))

  if (coveredEnd > state.coveredUpTo) fillBuckets(state.coveredUpTo, coveredEnd, true)
  if (clearStart < state.clearFrom) fillBuckets(clearStart, state.clearFrom, false)
  state.coveredUpTo = coveredEnd
  state.clearFrom = clearStart

  paintBand(coveredEnd, clearStart, progress, Math.floor(now / FLICKER_TICK_MS))
  ctx.putImageData(imageData, 0, 0)
}

function finishRun() {
  const settled = state.to
  const onDone = state.onDone
  state.from = settled
  state.progress = settled
  state.onDone = null
  if (settled <= 0) unmount()
  onDone?.()
}

function step(now) {
  animationFrame = 0
  if (!state || !canvas?.isConnected) return
  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) {
    animationFrame = requestAnimationFrame(step)
    return
  }
  state.lastDraw = now

  const raw = state.durationMs > 0 ? clamp01((now - state.startedAt) / state.durationMs) : 1
  const progress = state.from + (state.to - state.from) * smooth01(raw)
  renderProgress(progress, now)
  state.progress = progress

  if (raw >= 1) {
    finishRun()
    return
  }
  animationFrame = requestAnimationFrame(step)
}

function scheduleStep() {
  if (!animationFrame && state) animationFrame = requestAnimationFrame(step)
}

function mount(host) {
  ensureStyles()
  if (!canvas) {
    canvas = document.createElement("canvas")
    canvas.className = CANVAS_CLASS
    canvas.setAttribute("aria-hidden", "true")
  }
  if (canvas.parentElement !== host) host.prepend(canvas)

  const { cols, rows } = veilGrid(window.innerWidth, window.innerHeight)
  const grid = ensureField(cols, rows)
  if (canvas.width !== cols || canvas.height !== rows || !imageData) {
    canvas.width = cols
    canvas.height = rows
    ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return null
    ctx.imageSmoothingEnabled = false
    imageData = ctx.createImageData(cols, rows)
    pixels = imageData.data
  }
  return grid
}

function unmount() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  state = null
  imageData = null
  pixels = null
  ctx = null
  canvas?.remove()
}

function run(host, to, { durationMs, onDone } = {}) {
  if (!mount(host)) return false

  const colors = readBinaryColors()
  const from = state ? state.progress : 1 - to
  const distance = Math.abs(to - from)
  if (!state) {
    // A fresh field starts clear: nothing behind the band, everything ahead of
    // it still the page.
    state = { coveredUpTo: 0, clearFrom: ORDER_BUCKETS, progress: from }
    pixels.fill(0)
  }

  state.paper = colors.paper
  state.ink = colors.ink
  state.from = from
  state.to = to
  state.progress = from
  state.startedAt = performance.now()
  // A close that interrupts a half-built veil should not spend the full budget
  // taking apart a fifth of a field.
  state.durationMs = Math.max(90, (durationMs || BINARY_MOTION_DEFAULTS.durationMs) * Math.max(0.35, distance))
  state.lastDraw = 0
  state.onDone = onDone || null

  renderProgress(from, performance.now())
  scheduleStep()
  return true
}

// Take the page apart down to the paper field. Returns false when the surface
// is unavailable, so the caller can fall back to its own backdrop.
export function openBinaryPixelVeil(host, options) {
  if (!host) return false
  return run(host, 1, options)
}

// Put it back. `onDone` fires on the frame the last cell returns the page.
export function closeBinaryPixelVeil(options) {
  if (!state || !canvas?.isConnected) {
    options?.onDone?.()
    return false
  }
  return run(canvas.parentElement, 0, options)
}

export function cancelBinaryPixelVeil() {
  unmount()
}

// A settled veil is a flat field, so a resize only matters for the dissolve
// that has to run back out of it at the new aspect.
export function syncBinaryPixelVeil() {
  if (!state || !canvas?.isConnected) return
  if (state.progress < 1 || animationFrame) return
  const host = canvas.parentElement
  const { cols, rows } = veilGrid(window.innerWidth, window.innerHeight)
  if (canvas.width === cols && canvas.height === rows) return
  imageData = null
  if (!mount(host)) return
  state.coveredUpTo = ORDER_BUCKETS
  state.clearFrom = ORDER_BUCKETS
  pixels.fill(0)
  fillBuckets(0, ORDER_BUCKETS, true)
  ctx.putImageData(imageData, 0, 0)
}

export function binaryPixelVeilActive() {
  return Boolean(state && canvas?.isConnected)
}
