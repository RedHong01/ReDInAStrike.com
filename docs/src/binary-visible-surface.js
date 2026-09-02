import { PUBLISHED_MOTION_CONFIG, sanitizeMotionConfig } from "./motion-default.js"
import {
  hash01,
  logicalGridForMedia,
  readBinaryColors,
  sampleBinaryCanvas,
  smooth01,
} from "./binary-surface-core.js?v=20260830-perfaudit1"
import {
  boundaryMetrics,
  boundaryStrength,
  viewportBoundsForCard,
} from "./viewport-boundary-core.js?v=20260902-previewboundary5"

const BINARY_SOURCE_SELECTOR =
  '.dither-preview-canvas[data-active="true"], .project-halftone'
const BOUNDARY_SELECTOR = ".dither-reveal-canvas"
const PIXEL_THRESHOLD_MIN = 0.08
const PIXEL_THRESHOLD_SPAN = 0.84

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export function activeBinarySurfaceCanvas(card) {
  return card?.querySelector?.(BINARY_SOURCE_SELECTOR) || null
}

export function activeBoundaryCanvas(card) {
  const canvas = card?.querySelector?.(BOUNDARY_SELECTOR)
  return canvas?.isConnected ? canvas : null
}

export function canvasHasPixels(canvas) {
  return Boolean(canvas && canvas.width > 1 && canvas.height > 1)
}

function rgbaCss(rgba) {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`
}

function surfaceRect(card, baseCanvas) {
  const target = baseCanvas || card?.querySelector?.(".project-media")
  const rect = target?.getBoundingClientRect?.()
  if (!rect || rect.width <= 0 || rect.height <= 0) return null
  return rect
}

function revealPixelOrder(config, col, row) {
  return hash01(config.revealSeed, col, row, 1)
}

function applyViewportBoundary(bits, card, baseCanvas, cols, rows, inputConfig) {
  const rect = surfaceRect(card, baseCanvas)
  if (!rect) return bits

  const bounds = viewportBoundsForCard(card)
  const metrics = boundaryMetrics(bounds)
  const topLimit = bounds.top + metrics.hold + metrics.depth
  const bottomLimit = bounds.bottom - metrics.hold - metrics.depth
  if (rect.top >= topLimit && rect.bottom <= bottomLimit) return bits

  const config = sanitizeMotionConfig(
    inputConfig || window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG,
  )
  const softness = 0.052 + config.revealNoisePersistence * 0.052
  const next = Uint8Array.from(bits)

  for (let row = 0; row < rows; row += 1) {
    const viewportY = rect.top + ((row + 0.5) / rows) * rect.height
    const strength = boundaryStrength(viewportY, bounds, metrics, smooth01)
    if (strength <= 0.0005) continue

    const rowStart = row * cols
    const rowEnd = rowStart + cols
    if (strength >= 0.9995) {
      next.fill(0, rowStart, rowEnd)
      continue
    }

    for (let index = rowStart; index < rowEnd; index += 1) {
      if (!next[index]) continue
      const col = index % cols
      const threshold =
        PIXEL_THRESHOLD_MIN + revealPixelOrder(config, col, row) * PIXEL_THRESHOLD_SPAN
      const cover = smooth01((strength - threshold + softness) / (softness * 2))
      if (hash01(config.revealSeed, col, row, 503) < cover) next[index] = 0
    }
  }

  return next
}

function overlayVisible(canvas, respectVisibility) {
  if (!canvasHasPixels(canvas)) return false
  if (!respectVisibility) return true

  const style = getComputedStyle(canvas)
  const opacity = Number.parseFloat(style.opacity)
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    (Number.isFinite(opacity) ? opacity : 1) > 0.001
  )
}

export function sampleCompositeBinaryBits(baseCanvas, overlayCanvas, cols, rows, paper, ink, options = {}) {
  if (!canvasHasPixels(baseCanvas)) return null
  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const ctx = sample.getContext("2d", { willReadFrequently: true, alpha: true })
  if (!ctx) return null

  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = rgbaCss(paper)
  ctx.fillRect(0, 0, cols, rows)

  try {
    ctx.drawImage(baseCanvas, 0, 0, cols, rows)
    if (overlayVisible(overlayCanvas, options.respectOverlayVisibility !== false)) {
      const style = getComputedStyle(overlayCanvas)
      const opacity = Number.parseFloat(style.opacity)
      ctx.save()
      ctx.globalAlpha = Number.isFinite(opacity) ? opacity : 1
      ctx.drawImage(overlayCanvas, 0, 0, cols, rows)
      ctx.restore()
    }
    return sampleBinaryCanvas(sample, cols, rows, paper, ink)
  } catch {
    return null
  }
}

export function pixelsFromBinaryBits(bits, cols, rows, paper, ink) {
  if (!bits || bits.length !== cols * rows) return null
  const pixels = new Uint8ClampedArray(bits.length * 4)
  for (let index = 0; index < bits.length; index += 1) {
    const rgba = bits[index] ? ink : paper
    const offset = index * 4
    pixels[offset] = rgba[0]
    pixels[offset + 1] = rgba[1]
    pixels[offset + 2] = rgba[2]
    pixels[offset + 3] = 255
  }
  return pixels
}

export function sampleCurrentBinarySurface(card, options = {}) {
  const media = card?.querySelector?.(".project-media")
  const baseCanvas = options.baseCanvas || activeBinarySurfaceCanvas(card)
  if (!media || !canvasHasPixels(baseCanvas)) return null

  const grid = options.cols && options.rows
    ? { cols: Math.round(options.cols), rows: Math.round(options.rows) }
    : logicalGridForMedia(media, options.ditherConfig || {})
  const { paper, ink } = options.paper && options.ink
    ? { paper: options.paper, ink: options.ink }
    : readBinaryColors()
  const overlayCanvas = options.overlayCanvas === null
    ? null
    : options.overlayCanvas || activeBoundaryCanvas(card)
  let bits = sampleCompositeBinaryBits(
    baseCanvas,
    overlayCanvas,
    grid.cols,
    grid.rows,
    paper,
    ink,
    { respectOverlayVisibility: options.respectOverlayVisibility !== false },
  )
  if (!bits) return null

  if (options.applyViewportBoundary !== false) {
    bits = applyViewportBoundary(
      bits,
      card,
      baseCanvas,
      grid.cols,
      grid.rows,
      options.motionConfig,
    )
  }

  return {
    bits,
    cols: grid.cols,
    rows: grid.rows,
    paper,
    ink,
    baseCanvas,
    overlayCanvas,
  }
}
