const MAX_GRID_CELLS = 52000

export const BINARY_DITHER_MODES = new Set([
  "bayer",
  "blue",
  "atkinson",
  "floyd",
])

export const BINARY_MOTION_DEFAULTS = Object.freeze({
  durationMs: 420,
  softness: 0.095,
  seed: 41,
  clusterSize: 3,
  clusterMix: 0.16,
})

let paperCacheKey = ""
let paperCacheValue = [248, 247, 245, 255]
let inkCacheKey = ""
let inkCacheValue = [69, 69, 69, 255]

export const clamp01 = (value) => Math.min(1, Math.max(0, value))

export function smooth01(value) {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

export function isBinaryDitherMode(mode) {
  return BINARY_DITHER_MODES.has(String(mode || ""))
}

function parseAspectRatio(value) {
  const match = String(value || "").match(/([0-9]*\.?[0-9]+)\s*\/\s*([0-9]*\.?[0-9]+)/)
  if (!match) return null
  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  return width / height
}

function constrainedGrid(cols, rows) {
  cols = Math.max(1, Math.round(cols))
  rows = Math.max(1, Math.round(rows))
  const count = cols * rows
  if (count <= MAX_GRID_CELLS) return { cols, rows }
  const scale = Math.sqrt(count / MAX_GRID_CELLS)
  return {
    cols: Math.max(1, Math.floor(cols / scale)),
    rows: Math.max(1, Math.floor(rows / scale)),
  }
}

export function logicalGridForMedia(media, config) {
  const cols = Math.max(1, Math.round(Number(config?.columns) || 240))
  if (!media) return constrainedGrid(cols, Math.round(cols * 9 / 16))

  let ratio = null
  try {
    ratio = parseAspectRatio(getComputedStyle(media).aspectRatio)
  } catch {}

  if (!ratio) {
    const rect = media.getBoundingClientRect?.()
    const width = Math.max(1, Number(rect?.width) || 1)
    const height = Math.max(1, Number(rect?.height) || 1)
    ratio = width / height
  }

  return constrainedGrid(cols, Math.max(1, Math.round(cols / Math.max(0.0001, ratio))))
}

export function logicalGridFromCanvas(canvas) {
  const cols = Number(canvas?.dataset?.ditherColumns)
  const rows = Number(canvas?.dataset?.ditherRows)
  if (!Number.isFinite(cols) || cols <= 0 || !Number.isFinite(rows) || rows <= 0) return null
  return { cols: Math.round(cols), rows: Math.round(rows) }
}

export function binaryGridNeedsUpdate(canvas, media, config) {
  if (!canvas || canvas.dataset.active !== "true") return true
  const current = logicalGridFromCanvas(canvas)
  const next = logicalGridForMedia(media, config)
  return !current || current.cols !== next.cols || current.rows !== next.rows
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

export function readBinaryColors() {
  const styles = getComputedStyle(document.documentElement)
  const paperValue = styles.getPropertyValue("--paper").trim() || "#f8f7f5"
  const inkValue = styles.getPropertyValue("--ink").trim() || "#454545"

  if (paperValue !== paperCacheKey) {
    paperCacheKey = paperValue
    paperCacheValue = parseColor(paperValue, [248, 247, 245, 255])
  }
  if (inkValue !== inkCacheKey) {
    inkCacheKey = inkValue
    inkCacheValue = parseColor(inkValue, [69, 69, 69, 255])
  }

  return { paper: paperCacheValue, ink: inkCacheValue }
}

function colorDistance(data, offset, rgba) {
  const dr = data[offset] - rgba[0]
  const dg = data[offset + 1] - rgba[1]
  const db = data[offset + 2] - rgba[2]
  return dr * dr + dg * dg + db * db
}

export function sampleBinaryCanvas(sourceCanvas, cols, rows, paper, ink) {
  if (!sourceCanvas || cols < 1 || rows < 1) return null
  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const ctx = sample.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = `rgba(${paper[0]}, ${paper[1]}, ${paper[2]}, 1)`
  ctx.fillRect(0, 0, cols, rows)

  try {
    ctx.drawImage(sourceCanvas, 0, 0, cols, rows)
    const data = ctx.getImageData(0, 0, cols, rows).data
    const bits = new Uint8Array(cols * rows)
    for (let index = 0; index < bits.length; index += 1) {
      const offset = index * 4
      bits[index] = colorDistance(data, offset, ink) <= colorDistance(data, offset, paper) ? 1 : 0
    }
    return bits
  } catch {
    return null
  }
}

export function binaryBitsEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false
  }
  return true
}

export function writeBinaryPixel(data, offset, bit, paper, ink) {
  const rgba = bit ? ink : paper
  data[offset] = rgba[0]
  data[offset + 1] = rgba[1]
  data[offset + 2] = rgba[2]
  data[offset + 3] = 255
}

export function drawBinaryBits(ctx, imageData, framePixels, bits, paper, ink) {
  for (let index = 0; index < bits.length; index += 1) {
    writeBinaryPixel(framePixels, index * 4, bits[index], paper, ink)
  }
  ctx.putImageData(imageData, 0, 0)
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

export function hash01(seed, a = 0, b = 0, c = 0) {
  return hash32(
    (seed | 0) ^
    Math.imul((a | 0) + 1, 73856093) ^
    Math.imul((b | 0) + 1, 19349663) ^
    Math.imul((c | 0) + 1, 83492791),
  ) / 4294967295
}

export function buildBinaryOrder(cols, rows, seed = BINARY_MOTION_DEFAULTS.seed) {
  const order = new Float32Array(cols * rows)
  const clusterSize = Math.max(1, Math.round(BINARY_MOTION_DEFAULTS.clusterSize))
  const clusterMix = clamp01(BINARY_MOTION_DEFAULTS.clusterMix)
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const local = hash01(seed, col, row, 17)
      const cluster = hash01(
        seed,
        Math.floor(col / clusterSize),
        Math.floor(row / clusterSize),
        31,
      )
      order[row * cols + col] = local * (1 - clusterMix) + cluster * clusterMix
    }
  }
  return order
}

window.__RED_BINARY_SURFACE__ = Object.freeze({
  version: 1,
  gridForMedia: logicalGridForMedia,
  gridFromCanvas: logicalGridFromCanvas,
  gridNeedsUpdate: binaryGridNeedsUpdate,
  defaults: BINARY_MOTION_DEFAULTS,
})
