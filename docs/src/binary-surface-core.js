export const BINARY_SURFACE_GRID_DEFAULTS = Object.freeze({
  referenceWidth: 604,
  minColumns: 176,
  maxColumns: 384,
  columnStep: 4,
  widthBucketPx: 16,
  scaleExponent: 0.58,
  minCellPx: 1.95,
  maxCellPx: 3.6,
  maxGridCells: 86000,
})

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

function finiteNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function roundToStep(value, step, mode = "round") {
  const safeStep = Math.max(1, Math.round(step))
  if (mode === "floor") return Math.max(safeStep, Math.floor(value / safeStep) * safeStep)
  if (mode === "ceil") return Math.max(safeStep, Math.ceil(value / safeStep) * safeStep)
  return Math.max(safeStep, Math.round(value / safeStep) * safeStep)
}

function resolveGridContract(config) {
  const defaults = BINARY_SURFACE_GRID_DEFAULTS
  const minColumns = Math.max(1, Math.round(finiteNumber(config?.adaptiveMinColumns, defaults.minColumns)))
  const minCellPx = Math.max(0.5, finiteNumber(config?.adaptiveMinCellPx, defaults.minCellPx))
  return {
    adaptive: config?.adaptiveColumns !== false,
    referenceWidth: Math.max(1, finiteNumber(config?.adaptiveReferenceWidth, defaults.referenceWidth)),
    minColumns,
    maxColumns: Math.max(minColumns, Math.round(finiteNumber(config?.adaptiveMaxColumns, defaults.maxColumns))),
    columnStep: Math.max(1, Math.round(finiteNumber(config?.adaptiveColumnStep, defaults.columnStep))),
    widthBucketPx: Math.max(1, finiteNumber(config?.adaptiveWidthBucketPx, defaults.widthBucketPx)),
    scaleExponent: Math.min(1, Math.max(0, finiteNumber(config?.adaptiveScaleExponent, defaults.scaleExponent))),
    minCellPx,
    maxCellPx: Math.max(minCellPx, finiteNumber(config?.adaptiveMaxCellPx, defaults.maxCellPx)),
    maxGridCells: Math.max(1, Math.round(finiteNumber(config?.adaptiveMaxGridCells, defaults.maxGridCells))),
  }
}

function mediaAspectRatio(media) {
  if (!media) return 16 / 9
  let ratio = null
  try {
    ratio = parseAspectRatio(getComputedStyle(media).aspectRatio)
  } catch {}
  if (ratio) return ratio

  const rect = media.getBoundingClientRect?.()
  const width = Math.max(1, Number(rect?.width) || 1)
  const height = Math.max(1, Number(rect?.height) || 1)
  return width / height
}

function mediaCssWidth(media, fallbackWidth) {
  if (!media) return fallbackWidth
  const rect = media.getBoundingClientRect?.()
  return Math.max(1, Number(rect?.width) || fallbackWidth)
}

export function constrainBinaryGridSize(cols, rows, config = {}) {
  const contract = resolveGridContract(config)
  const step = contract.columnStep
  cols = Math.max(1, Math.round(cols))
  rows = Math.max(1, Math.round(rows))
  const aspect = cols / rows

  if (cols >= step) cols = roundToStep(cols, step)
  rows = Math.max(1, Math.round(cols / Math.max(0.0001, aspect)))

  if (cols * rows <= contract.maxGridCells) return { cols, rows }

  const maxColsForAspect = Math.sqrt(contract.maxGridCells * Math.max(0.0001, aspect))
  cols = roundToStep(maxColsForAspect, step, "floor")
  rows = Math.max(1, Math.round(cols / Math.max(0.0001, aspect)))

  while (cols > step && cols * rows > contract.maxGridCells) {
    cols -= step
    rows = Math.max(1, Math.round(cols / Math.max(0.0001, aspect)))
  }

  return { cols, rows }
}

export function resolveBinarySurfaceGrid(media, config = {}) {
  const contract = resolveGridContract(config)
  const baseColumns = Math.max(1, Math.round(Number(config?.columns) || 240))
  const aspect = mediaAspectRatio(media)
  const cssWidth = mediaCssWidth(media, contract.referenceWidth)
  const bucketWidth = contract.adaptive
    ? Math.max(1, Math.round(cssWidth / contract.widthBucketPx) * contract.widthBucketPx)
    : cssWidth

  let cols = baseColumns
  if (contract.adaptive) {
    const baseCellPx = contract.referenceWidth / baseColumns
    const cellExponent = 1 - contract.scaleExponent
    const targetCellPx = Math.min(
      Math.max(
        baseCellPx * Math.pow(bucketWidth / contract.referenceWidth, cellExponent),
        contract.minCellPx,
      ),
      contract.maxCellPx,
    )
    const lowerFromMaxCell = bucketWidth / contract.maxCellPx
    const upperFromMinCell = bucketWidth / contract.minCellPx
    cols = Math.max(bucketWidth / targetCellPx, lowerFromMaxCell)
    cols = Math.min(cols, upperFromMinCell)
    cols = Math.min(Math.max(cols, contract.minColumns), contract.maxColumns)
    cols = roundToStep(cols, contract.columnStep)
  }

  const constrained = constrainBinaryGridSize(
    cols,
    cols / Math.max(0.0001, aspect),
    config,
  )

  return {
    ...constrained,
    cssWidth,
    cssHeight: media
      ? Math.max(1, Number(media.getBoundingClientRect?.()?.height) || cssWidth / aspect)
      : contract.referenceWidth / aspect,
    cellPx: cssWidth / constrained.cols,
    widthBucket: bucketWidth,
    columnStep: contract.columnStep,
    adaptive: contract.adaptive,
  }
}

export function logicalGridForMedia(media, config) {
  const { cols, rows } = resolveBinarySurfaceGrid(media, config)
  return { cols, rows }
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
  version: 2,
  defaults: BINARY_SURFACE_GRID_DEFAULTS,
  resolveGrid: resolveBinarySurfaceGrid,
  constrainGrid: constrainBinaryGridSize,
  gridForMedia: logicalGridForMedia,
  gridFromCanvas: logicalGridFromCanvas,
  gridNeedsUpdate: binaryGridNeedsUpdate,
  motionDefaults: BINARY_MOTION_DEFAULTS,
})
