import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard } from "./dither-engine.js?v=20260830-binarysurface1"
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
} from "./binary-surface-core.js?v=20260830-binarysurface1"

const STYLE_ID = "red-hover-binary-return-style"
const CANVAS_CLASS = "dither-hover-return-snow-canvas"
const RETURN_ATTRIBUTE = "data-active-color-return"
const ACTIVE_COLOR_MOTION_ATTRIBUTE = "data-active-color-motion"
const ACTIVE_COLOR_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const HANDOFF_ATTRIBUTE = "data-hover-binary-return"

const TARGET_FRAME_MS = 1000 / 60
const DIRECT_HANDOFF_MS = BINARY_MOTION_DEFAULTS.durationMs
const TRANSITION_SOFTNESS = BINARY_MOTION_DEFAULTS.softness
const STABLE_TIMEOUT_MS = 900
const TARGET_PREP_FRAMES = 2
const REMOVE_GUARD_FRAMES = 2
const BOUNDARY_SYNC_TIMEOUT_MS = 180

const snapshots = new WeakMap()
const states = new WeakMap()
const activeStates = new Set()

let animationFrame = 0
let appObserver = null
let catalogObserver = null
let catalog = null

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

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

function sourceCanvas(card) {
  return card?.querySelector?.('.dither-preview-canvas[data-active="true"]') || null
}

function currentRevealCanvas(card) {
  const canvas = card?.querySelector?.(".dither-reveal-canvas")
  return canvas?.isConnected ? canvas : null
}

function canvasHasPixels(canvas) {
  return Boolean(canvas && canvas.width > 1 && canvas.height > 1)
}

function sampleCompositeBinary(baseCanvas, overlayCanvas, cols, rows, paper, ink, { respectVisibility = true } = {}) {
  if (!canvasHasPixels(baseCanvas)) return null
  if (!canvasHasPixels(overlayCanvas)) {
    return sampleBinaryCanvas(baseCanvas, cols, rows, paper, ink)
  }

  const sample = document.createElement("canvas")
  sample.width = cols
  sample.height = rows
  const ctx = sample.getContext("2d", { willReadFrequently: true, alpha: true })
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = `rgba(${paper[0]}, ${paper[1]}, ${paper[2]}, 1)`
  ctx.fillRect(0, 0, cols, rows)

  try {
    ctx.drawImage(baseCanvas, 0, 0, cols, rows)

    let shouldComposite = true
    let opacity = 1
    if (respectVisibility) {
      const style = getComputedStyle(overlayCanvas)
      opacity = Number.parseFloat(style.opacity)
      shouldComposite = (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        (Number.isFinite(opacity) ? opacity : 1) > 0.001
      )
    }

    if (shouldComposite) {
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

function bitsCanvas(bits, cols, rows, paper, ink) {
  const canvas = document.createElement("canvas")
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext("2d", { alpha: true })
  if (!ctx) return null
  const framePixels = new Uint8ClampedArray(bits.length * 4)
  const imageData = new ImageData(framePixels, cols, rows)
  drawBinaryBits(ctx, imageData, framePixels, bits, paper, ink)
  return canvas
}

function captureSnapshot(card) {
  if (!card?.isConnected || !card.classList.contains("is-filter-muted")) return null
  const media = card.querySelector(".project-media")
  const source = sourceCanvas(card)
  if (!media || !canvasHasPixels(source)) return null

  const { cols, rows } = logicalGridForMedia(media, PUBLISHED_DITHER_CONFIG)
  const { paper, ink } = readBinaryColors()
  const reveal = currentRevealCanvas(card)

  // Capture what the user actually sees, not the full static Floyd surface.
  // pointerover runs before the active-color hover takes ownership, so an
  // edge card keeps its current viewport-boundary mask in the snapshot.
  const bits = sampleCompositeBinary(source, reveal, cols, rows, paper, ink)
  if (!bits) return null
  const canvas = bitsCanvas(bits, cols, rows, paper, ink)
  if (!canvas) return null

  const snapshot = {
    canvas,
    bits,
    cols,
    rows,
    source: source.dataset.ditherSource || "",
    mode: source.dataset.ditherMode || PUBLISHED_DITHER_CONFIG?.mode || "",
    signature: source.dataset.ditherRenderSignature || "",
    capturedAt: performance.now(),
  }
  snapshots.set(card, snapshot)
  return snapshot
}

function snapshotBitsForGrid(snapshot, cols, rows, paper, ink) {
  if (!snapshot) return null
  if (snapshot.cols === cols && snapshot.rows === rows && snapshot.bits?.length === cols * rows) {
    return Uint8Array.from(snapshot.bits)
  }
  return sampleBinaryCanvas(snapshot.canvas, cols, rows, paper, ink)
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

function cancelState(card, { keepSnapshot = false } = {}) {
  const state = states.get(card)
  if (state) {
    activeStates.delete(state)
    if (state.waitFrame) cancelAnimationFrame(state.waitFrame)
    state.waitFrame = 0
  }
  states.delete(card)
  card?.querySelector?.(`.${CANVAS_CLASS}`)?.remove()
  card?.removeAttribute?.(HANDOFF_ATTRIBUTE)
  if (!keepSnapshot) snapshots.delete(card)
}

function scheduleLoop() {
  if (!animationFrame && activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function beginDirectTransition(state, targetBits) {
  if (!targetBits) {
    finishState(state)
    return
  }

  if (binaryBitsEqual(state.displayBits, targetBits)) {
    drawBinaryBits(
      state.ctx,
      state.imageData,
      state.framePixels,
      targetBits,
      state.paper,
      state.ink,
    )
    state.displayBits.set(targetBits)
    finishState(state)
    return
  }

  state.fromBits = Uint8Array.from(state.displayBits)
  state.toBits = Uint8Array.from(targetBits)
  state.duration = DIRECT_HANDOFF_MS
  state.startTime = performance.now()
  state.lastDraw = 0
  state.seed = BINARY_MOTION_DEFAULTS.seed + state.cols * 3 + state.rows * 5 + 97
  state.order = buildBinaryOrder(state.cols, state.rows, state.seed)
  state.phase = "viewport-direct"
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

  const raw = clamp((now - state.startTime) / Math.max(1, state.duration))
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
        (progress - threshold + TRANSITION_SOFTNESS) / (TRANSITION_SOFTNESS * 2),
      )
      if (local > 0.001 && local < 0.999) {
        const col = index % cols
        const row = Math.floor(index / cols)
        const flicker = hash01(state.seed, col, row, 9000 + frameTick)
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

  drawBinaryBits(state.ctx, state.imageData, state.framePixels, toBits, paper, ink)
  state.displayBits.set(toBits)
  activeStates.delete(state)
  finishState(state)
}

function animationLoop(now) {
  animationFrame = 0
  for (const state of [...activeStates]) drawState(state, now)
  if (activeStates.size) animationFrame = requestAnimationFrame(animationLoop)
}

function activeColorStillSettling(card) {
  return Boolean(
    card?.getAttribute?.(ACTIVE_COLOR_MOTION_ATTRIBUTE) === "true" ||
    card?.getAttribute?.(ACTIVE_COLOR_COOLDOWN_ATTRIBUTE) === "true"
  )
}

function isCurrentState(state) {
  return Boolean(state?.card?.isConnected && states.get(state.card) === state)
}

function waitForMs(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
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

function waitFrames(count) {
  return new Promise((resolve) => nextFrames(count, resolve))
}

async function syncBoundarySurface(state) {
  const breath = window.__RED_BOUNDARY_BREATH__
  const sync =
    typeof breath?.syncCardNow === "function"
      ? () => breath.syncCardNow(state.card, { refresh: true })
      : typeof breath?.syncNow === "function"
        ? () => breath.syncNow({ refresh: true })
        : null
  if (!sync) return false
  const result = await Promise.race([
    Promise.resolve(sync()),
    waitForMs(BOUNDARY_SYNC_TIMEOUT_MS).then(() => false),
  ])
  return result === true
}

function sampleCurrentTargetBits(state) {
  const currentFinal = sourceCanvas(state.card)
  if (!canvasHasPixels(currentFinal)) return null
  return sampleCompositeBinary(
    currentFinal,
    currentRevealCanvas(state.card),
    state.cols,
    state.rows,
    state.paper,
    state.ink,
  )
}

function drawDisplayBits(state, bits) {
  if (!bits || bits.length !== state.displayBits.length) return false
  drawBinaryBits(
    state.ctx,
    state.imageData,
    state.framePixels,
    bits,
    state.paper,
    state.ink,
  )
  state.displayBits.set(bits)
  return true
}

async function prepareCurrentViewportTarget(state) {
  if (!isCurrentState(state)) {
    cancelState(state.card)
    return
  }

  // Keep the handoff overlay opaque while the canonical static surface and
  // viewport boundary are rebuilt underneath it. The full static card is
  // never exposed between active-color and edge clipping.
  renderCard(state.card, PUBLISHED_DITHER_CONFIG)
  const finalCanvas = sourceCanvas(state.card)
  if (!canvasHasPixels(finalCanvas)) {
    finishState(state)
    return
  }
  finalCanvas.dataset.active = "true"
  finalCanvas.dataset.publishedMode = PUBLISHED_DITHER_CONFIG?.mode || "native"

  await syncBoundarySurface(state)
  if (!isCurrentState(state)) {
    cancelState(state.card)
    return
  }

  const revealApi = window.__RED_REVEAL_MOTION__
  if (!currentRevealCanvas(state.card)) {
    revealApi?.trackViewport?.(state.card, finalCanvas, window.__RED_MOTION_CONFIG__ || null)
  }
  revealApi?.refreshViewport?.({ linger: false })

  await waitFrames(TARGET_PREP_FRAMES)
  await syncBoundarySurface(state)
  if (!isCurrentState(state)) {
    cancelState(state.card)
    return
  }

  revealApi?.refreshViewport?.({ linger: false })
  requestAnimationFrame(() => {
    if (!isCurrentState(state)) {
      cancelState(state.card)
      return
    }

    const targetBits = sampleCurrentTargetBits(state)
    if (!targetBits) {
      finishState(state)
      return
    }
    beginDirectTransition(state, targetBits)
  })
}

function waitForViewportStable(state) {
  const started = performance.now()
  const check = () => {
    state.waitFrame = 0
    if (!state.card.isConnected || states.get(state.card) !== state) {
      cancelState(state.card)
      return
    }

    if (activeColorStillSettling(state.card) && performance.now() - started < STABLE_TIMEOUT_MS) {
      state.waitFrame = requestAnimationFrame(check)
      return
    }

    void prepareCurrentViewportTarget(state)
  }
  state.waitFrame = requestAnimationFrame(check)
}

function finishState(state) {
  if (states.get(state.card) !== state) return

  // Keep the overlay for two guarded frames so the already-prepared reveal
  // field is guaranteed to own the exact next painted frame.
  nextFrames(REMOVE_GUARD_FRAMES, () => {
    if (states.get(state.card) !== state) return
    void syncBoundarySurface(state).then(() => {
      if (states.get(state.card) !== state) return
      window.__RED_REVEAL_MOTION__?.refreshViewport?.({ linger: false })
      requestAnimationFrame(() => {
        if (states.get(state.card) !== state) return
        const targetBits = sampleCurrentTargetBits(state)
        drawDisplayBits(state, targetBits)
        state.canvas.remove()
        state.card.removeAttribute(HANDOFF_ATTRIBUTE)
        states.delete(state.card)
        snapshots.delete(state.card)
        window.dispatchEvent(new CustomEvent("red:hover-binary-return-complete", {
          detail: { card: state.card },
        }))
      })
    })
  })
}

function startHoverReturnHandoff(card) {
  if (prefersReducedMotion() || !card?.isConnected || !card.classList.contains("is-filter-muted")) {
    snapshots.delete(card)
    return false
  }

  cancelState(card, { keepSnapshot: true })
  const snapshot = snapshots.get(card) || captureSnapshot(card)
  const media = card.querySelector(".project-media")
  if (!snapshot || !media) return false

  const { cols, rows } = logicalGridForMedia(media, PUBLISHED_DITHER_CONFIG)
  const { paper, ink } = readBinaryColors()
  const oldBits = snapshotBitsForGrid(snapshot, cols, rows, paper, ink)
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
    displayBits: Uint8Array.from(oldBits),
    fromBits: Uint8Array.from(oldBits),
    toBits: Uint8Array.from(oldBits),
    order: buildBinaryOrder(cols, rows, BINARY_MOTION_DEFAULTS.seed),
    duration: DIRECT_HANDOFF_MS,
    phase: "hold-visible-snapshot",
    startTime: performance.now(),
    lastDraw: 0,
    waitFrame: 0,
    seed: BINARY_MOTION_DEFAULTS.seed,
  }
  states.set(card, state)
  drawBinaryBits(ctx, imageData, framePixels, oldBits, paper, ink)

  // Important: do not resolve to the full static Floyd image first. Hold the
  // pre-hover visible state until the current viewport edge field is ready,
  // then transition directly to that clipped target.
  waitForViewportStable(state)
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
      if (mutation.type === "attributes" && mutation.attributeName === RETURN_ATTRIBUTE) {
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
  document.addEventListener("pointerover", captureOnPointerOver, { passive: true, capture: true })
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
