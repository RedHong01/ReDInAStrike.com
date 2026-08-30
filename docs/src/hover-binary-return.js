import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard } from "./dither-engine.js?v=20260830-resizesnow3"

const STYLE_ID = "red-hover-binary-return-style"
const CANVAS_CLASS = "dither-hover-return-snow-canvas"
const RETURN_ATTRIBUTE = "data-active-color-return"
const ACTIVE_COLOR_MOTION_ATTRIBUTE = "data-active-color-motion"
const ACTIVE_COLOR_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const HANDOFF_ATTRIBUTE = "data-hover-binary-return"

const TARGET_FRAME_MS = 1000 / 60
const RESIZE_DURATION_MS = 420
const VIEWPORT_RECONCILE_MS = 220
const RESIZE_SOFTNESS = 0.095
const MAX_GRID_CELLS = 52000
const STABLE_TIMEOUT_MS = 900
const VIEWPORT_PREP_FRAMES = 5

const snapshots = new WeakMap()
const states = new WeakMap()
const activeStates = new Set()

let animationFrame = 0
let appObserver = null
let catalogObserver = null
let catalog = null
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
    .${CANVAS_CLASS} {
      position: absolute;
      inset: 0;
      z-index: 10 !important;
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

    .project-card[${HANDOFF_ATTRIBUTE}="true"] .dither-reveal-canvas {
      pointer-events: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .${CANVAS_CLASS} { display: none !important; }
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

function gridForMedia(media) {
  const rect = media.getBoundingClientRect()
  const width = Math.max(1, rect.width)
  const height = Math.max(1, rect.height)
  const columns = Math.max(1, Math.round(Number(PUBLISHED_DITHER_CONFIG?.columns) || 240))
  return constrainGridSize(columns, columns * height / width)
}

function cloneCanvas(source) {
  if (!source || source.width < 2 || source.height < 2) return null
  const clone = document.createElement("canvas")
  clone.width = source.width
  clone.height = source.height
  const ctx = clone.getContext("2d", { alpha: true })
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false
  try {
    ctx.drawImage(source, 0, 0)
    return clone
  } catch {
    return null
  }
}

function sourceCanvas(card) {
  return card?.querySelector?.('.dither-preview-canvas[data-active="true"]') || null
}

function captureSnapshot(card) {
  if (!card?.isConnected || !card.classList.contains("is-filter-muted")) return null
  const source = sourceCanvas(card)
  const canvas = cloneCanvas(source)
  if (!canvas) return null

  const snapshot = {
    canvas,
    source: source?.dataset?.ditherSource || "",
    mode: source?.dataset?.ditherMode || PUBLISHED_DITHER_CONFIG?.mode || "",
    capturedAt: performance.now(),
  }
  snapshots.set(card, snapshot)
  return snapshot
}

function sampleBinary(source, cols, rows, paper, ink, composite = null) {
  if (!source || cols < 1 || rows < 1) return null

  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const ctx = sample.getContext("2d", { willReadFrequently: true, alpha: true })
  if (!ctx) return null

  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = `rgba(${paper[0]}, ${paper[1]}, ${paper[2]}, 1)`
  ctx.fillRect(0, 0, cols, rows)

  try {
    ctx.drawImage(source, 0, 0, cols, rows)

    if (composite?.canvas?.isConnected) {
      const style = getComputedStyle(composite.canvas)
      const opacity = Number.parseFloat(style.opacity)
      if (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        (Number.isFinite(opacity) ? opacity : 1) > 0.001
      ) {
        ctx.save()
        ctx.globalAlpha = Number.isFinite(opacity) ? opacity : 1
        ctx.drawImage(composite.canvas, 0, 0, cols, rows)
        ctx.restore()
      }
    }

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

function writeBinaryPixel(data, offset, bit, paper, ink) {
  const rgba = bit ? ink : paper
  data[offset] = rgba[0]
  data[offset + 1] = rgba[1]
  data[offset + 2] = rgba[2]
  data[offset + 3] = 255
}

function drawBits(state, bits) {
  const { ctx, imageData, framePixels, paper, ink } = state
  for (let index = 0; index < bits.length; index += 1) {
    writeBinaryPixel(framePixels, index * 4, bits[index], paper, ink)
  }
  ctx.putImageData(imageData, 0, 0)
  state.displayBits.set(bits)
}

function ensureOverlay(card, cols, rows) {
  const media = card?.querySelector?.(".project-media")
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

function bitsEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false
  }
  return true
}

function cancelState(card, { keepSnapshot = false } = {}) {
  const state = states.get(card)
  if (state) {
    activeStates.delete(state)
    if (state.waitFrame) cancelAnimationFrame(state.waitFrame)
    if (state.targetFrame) cancelAnimationFrame(state.targetFrame)
    state.waitFrame = 0
    state.targetFrame = 0
  }

  states.delete(card)
  card?.querySelector?.(`.${CANVAS_CLASS}`)?.remove()
  card?.removeAttribute?.(HANDOFF_ATTRIBUTE)
  if (!keepSnapshot) snapshots.delete(card)
}

function scheduleLoop() {
  if (!animationFrame && activeStates.size) {
    animationFrame = requestAnimationFrame(animationLoop)
  }
}

function beginPhase(state, fromBits, toBits, duration, phase) {
  state.fromBits = Uint8Array.from(fromBits)
  state.toBits = Uint8Array.from(toBits)
  state.duration = Math.max(1, duration)
  state.phase = phase
  state.startTime = performance.now()
  state.lastDraw = 0
  state.order = buildOrder(
    state.cols,
    state.rows,
    2203 + state.cols * 3 + state.rows * 5 + (phase === "viewport" ? 97 : 0),
  )
  activeStates.add(state)
  drawState(state, state.startTime)
  scheduleLoop()
}

function drawState(state, now) {
  const { card, canvas, cols, fromBits, toBits, order, paper, ink } = state
  if (!card.isConnected || !canvas.isConnected) {
    cancelState(card)
    return
  }
  if (state.lastDraw && now - state.lastDraw < TARGET_FRAME_MS) return
  state.lastDraw = now

  const raw = clamp((now - state.startTime) / state.duration)
  const progress = smooth01(raw)
  const frameTick = Math.floor(now / 46)
  const data = state.framePixels

  for (let index = 0; index < fromBits.length; index += 1) {
    const oldBit = fromBits[index]
    const newBit = toBits[index]
    let bit = oldBit

    if (oldBit !== newBit) {
      const threshold = 0.035 + order[index] * 0.93
      const local = smooth01(
        (progress - threshold + RESIZE_SOFTNESS) / (RESIZE_SOFTNESS * 2),
      )

      if (local > 0.001 && local < 0.999) {
        const col = index % cols
        const row = Math.floor(index / cols)
        const flicker = hash01(
          6607 + state.cols * 7 + state.rows * 11,
          col,
          row,
          9000 + frameTick,
        )
        bit = flicker < local ? newBit : oldBit
      } else if (local >= 0.999) {
        bit = newBit
      }
    }

    state.displayBits[index] = bit
    writeBinaryPixel(data, index * 4, bit, paper, ink)
  }

  state.ctx.putImageData(state.imageData, 0, 0)

  if (raw < 1) return

  drawBits(state, toBits)
  activeStates.delete(state)

  if (state.phase === "settle") {
    waitForViewportStable(state)
    return
  }

  finishState(state)
}

function animationLoop(now) {
  animationFrame = 0
  for (const state of [...activeStates]) drawState(state, now)
  if (activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function currentRevealCanvas(card) {
  const canvas = card?.querySelector?.(".dither-reveal-canvas")
  if (!canvas?.isConnected) return null
  return canvas
}

function activeColorStillSettling(card) {
  return Boolean(
    card?.getAttribute?.(ACTIVE_COLOR_MOTION_ATTRIBUTE) === "true" ||
    card?.getAttribute?.(ACTIVE_COLOR_COOLDOWN_ATTRIBUTE) === "true"
  )
}

function waitForViewportStable(state) {
  if (!state.card.isConnected || states.get(state.card) !== state) {
    cancelState(state.card)
    return
  }

  const started = performance.now()
  const check = () => {
    state.waitFrame = 0
    if (!state.card.isConnected || states.get(state.card) !== state) {
      cancelState(state.card)
      return
    }

    if (
      activeColorStillSettling(state.card) &&
      performance.now() - started < STABLE_TIMEOUT_MS
    ) {
      state.waitFrame = requestAnimationFrame(check)
      return
    }

    prepareViewportTarget(state)
  }

  state.waitFrame = requestAnimationFrame(check)
}

function nextFrames(count, callback) {
  let remaining = Math.max(0, count | 0)
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

function prepareViewportTarget(state) {
  if (!state.card.isConnected || states.get(state.card) !== state) {
    cancelState(state.card)
    return
  }

  window.__RED_DITHER_PUBLIC_RUNTIME__?.render?.()

  nextFrames(VIEWPORT_PREP_FRAMES, () => {
    if (!state.card.isConnected || states.get(state.card) !== state) {
      cancelState(state.card)
      return
    }

    window.__RED_REVEAL_MOTION__?.refreshViewport?.({ linger: false })

    requestAnimationFrame(() => {
      if (!state.card.isConnected || states.get(state.card) !== state) {
        cancelState(state.card)
        return
      }

      const finalCanvas = sourceCanvas(state.card)
      if (!finalCanvas) {
        finishState(state)
        return
      }

      const targetBits = sampleBinary(
        finalCanvas,
        state.cols,
        state.rows,
        state.paper,
        state.ink,
        { canvas: currentRevealCanvas(state.card) },
      )

      if (!targetBits || bitsEqual(state.displayBits, targetBits)) {
        finishState(state)
        return
      }

      beginPhase(
        state,
        state.displayBits,
        targetBits,
        VIEWPORT_RECONCILE_MS,
        "viewport",
      )
    })
  })
}

function finishState(state) {
  if (states.get(state.card) !== state) return
  drawBits(state, state.toBits || state.displayBits)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (states.get(state.card) !== state) return
      state.canvas.remove()
      state.card.removeAttribute(HANDOFF_ATTRIBUTE)
      states.delete(state.card)
      snapshots.delete(state.card)
      window.dispatchEvent(new CustomEvent("red:hover-binary-return-complete", {
        detail: { card: state.card },
      }))
    })
  })
}

function startHoverReturnHandoff(card) {
  if (
    prefersReducedMotion() ||
    !card?.isConnected ||
    !card.classList.contains("is-filter-muted")
  ) {
    snapshots.delete(card)
    return false
  }

  cancelState(card, { keepSnapshot: true })
  const snapshot = snapshots.get(card) || captureSnapshot(card)
  const media = card.querySelector(".project-media")
  if (!snapshot?.canvas || !media) return false

  const { cols, rows } = gridForMedia(media)
  const paper = readPaperColor()
  const ink = readInkColor()
  const oldBits = sampleBinary(snapshot.canvas, cols, rows, paper, ink)
  if (!oldBits) return false

  const canvas = ensureOverlay(card, cols, rows)
  const ctx = canvas?.getContext("2d", { alpha: true })
  if (!canvas || !ctx) return false

  ctx.imageSmoothingEnabled = false
  canvas.style.transition = "none"
  canvas.style.opacity = "1"
  canvas.style.visibility = "visible"
  card.setAttribute(HANDOFF_ATTRIBUTE, "true")

  const framePixels = new Uint8ClampedArray(oldBits.length * 4)
  const imageData = new ImageData(framePixels, cols, rows)
  const state = {
    card,
    canvas,
    ctx,
    cols,
    rows,
    paper,
    ink,
    framePixels,
    imageData,
    displayBits: new Uint8Array(oldBits.length),
    fromBits: oldBits,
    toBits: oldBits,
    order: buildOrder(cols, rows, 2203 + cols * 3 + rows * 5),
    duration: RESIZE_DURATION_MS,
    phase: "settle",
    startTime: performance.now(),
    lastDraw: 0,
    waitFrame: 0,
    targetFrame: 0,
  }
  states.set(card, state)

  drawBits(state, oldBits)

  const finalCanvas = sourceCanvas(card)
  if (finalCanvas) {
    renderCard(card, PUBLISHED_DITHER_CONFIG)
    finalCanvas.dataset.active = "true"
    finalCanvas.dataset.publishedMode = PUBLISHED_DITHER_CONFIG?.mode || "native"
  }

  const currentFinal = sourceCanvas(card)
  const newBits = currentFinal
    ? sampleBinary(currentFinal, cols, rows, paper, ink)
    : null

  if (!newBits) {
    finishState(state)
    return false
  }

  beginPhase(state, oldBits, newBits, RESIZE_DURATION_MS, "settle")
  return true
}

function handleReturnMutation(mutation) {
  const card = mutation.target
  if (!(card instanceof Element) || !card.classList.contains("project-card")) return

  const returning = card.getAttribute(RETURN_ATTRIBUTE) === "true"
  if (returning) {
    if (!snapshots.has(card)) captureSnapshot(card)
    return
  }

  if (mutation.oldValue === "true") startHoverReturnHandoff(card)
}

function bindCatalog(nextCatalog) {
  if (catalog === nextCatalog && catalogObserver) return

  catalogObserver?.disconnect()
  catalogObserver = null
  catalog = nextCatalog || null
  if (!catalog || !("MutationObserver" in window)) return

  catalogObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === RETURN_ATTRIBUTE
      ) {
        handleReturnMutation(mutation)
      }
    }
  })

  catalogObserver.observe(catalog, {
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [RETURN_ATTRIBUTE],
  })
}

function bindApp() {
  const app = document.querySelector("#app")
  if (!app || !("MutationObserver" in window)) {
    bindCatalog(document.querySelector(".catalog"))
    return
  }

  appObserver?.disconnect()
  appObserver = new MutationObserver(() => {
    for (const state of [...activeStates]) {
      if (!state.card.isConnected) cancelState(state.card)
    }
    bindCatalog(document.querySelector(".catalog"))
  })
  appObserver.observe(app, { childList: true, subtree: false })
  bindCatalog(document.querySelector(".catalog"))
}

function cardFromPointerEvent(event) {
  const target = event.target
  if (!(target instanceof Element)) return null
  const card = target.closest(".project-card.is-filter-muted")
  if (!card) return null
  if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return null
  return card
}

function captureOnPointerOver(event) {
  if (event.pointerType === "touch") return
  const card = cardFromPointerEvent(event)
  if (!card) return
  cancelState(card)
  captureSnapshot(card)
}

function captureOnFocusIn(event) {
  const target = event.target
  if (!(target instanceof Element)) return
  const card = target.closest(".project-card.is-filter-muted")
  if (!card) return
  if (event.relatedTarget instanceof Node && card.contains(event.relatedTarget)) return
  cancelState(card)
  captureSnapshot(card)
}

function start() {
  ensureStyles()
  bindApp()
  document.addEventListener("pointerover", captureOnPointerOver, {
    passive: true,
    capture: true,
  })
  document.addEventListener("focusin", captureOnFocusIn, true)

  window.__RED_HOVER_BINARY_RETURN__ = {
    capture: captureSnapshot,
    play: startHoverReturnHandoff,
    cancel: cancelState,
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
