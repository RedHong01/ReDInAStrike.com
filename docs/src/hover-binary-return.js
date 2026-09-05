import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js?v=20260905-perf1"
import { renderCard } from "./dither-engine.js?v=20260905-perf1"
import {
  captureViewportDitherBoundaryField,
  handoffViewportDitherBoundaryField,
  refreshViewportDitherReveals,
  trackViewportDitherReveal,
} from "./reveal-motion.js?v=20260905-perf1"
import {
  drawBinaryBits,
  logicalGridForMedia,
  readBinaryColors,
  sampleBinaryCanvas,
} from "./binary-surface-core.js?v=20260905-perf1"
import {
  activeBinarySurfaceCanvas,
  activeBoundaryCanvas,
  canvasHasPixels,
  sampleCompositeBinaryBits,
  sampleCurrentBinarySurface,
} from "./binary-visible-surface.js?v=20260905-perf1"

const STYLE_ID = "red-hover-binary-return-style"
const CANVAS_CLASS = "dither-hover-return-snow-canvas"
const RETURN_ATTRIBUTE = "data-active-color-return"
const ACTIVE_COLOR_MOTION_ATTRIBUTE = "data-active-color-motion"
const ACTIVE_COLOR_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const HANDOFF_ATTRIBUTE = "data-hover-binary-return"

const STABLE_TIMEOUT_MS = 900
const BOUNDARY_SYNC_TIMEOUT_MS = 180
const SCROLL_DELTA_EPSILON_PX = 1.5

const snapshots = new WeakMap()
const states = new WeakMap()

let appObserver = null
let catalogObserver = null
let catalog = null

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

    .project-card[${HANDOFF_ATTRIBUTE}="true"] .dither-preview-canvas[data-active="true"],
    .project-card[${HANDOFF_ATTRIBUTE}="true"] .project-halftone {
      opacity: 0 !important;
      visibility: hidden !important;
    }

    .project-card.is-muted-restore-intent[${HANDOFF_ATTRIBUTE}="true"] .${CANVAS_CLASS} {
      opacity: 0 !important;
      visibility: hidden !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .${CANVAS_CLASS} { display: none !important; }
    }
  `
}

function sourceCanvas(card) {
  return activeBinarySurfaceCanvas(card)
}

function currentRevealCanvas(card) {
  return activeBoundaryCanvas(card)
}

function sampleCompositeBinary(baseCanvas, overlayCanvas, cols, rows, paper, ink, { respectVisibility = true } = {}) {
  return sampleCompositeBinaryBits(baseCanvas, overlayCanvas, cols, rows, paper, ink, {
    respectOverlayVisibility: respectVisibility,
  })
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

function scrollPosition() {
  const viewport = window.visualViewport
  return {
    x: Number.isFinite(viewport?.pageLeft) ? viewport.pageLeft : window.scrollX,
    y: Number.isFinite(viewport?.pageTop) ? viewport.pageTop : window.scrollY,
  }
}

function scrollChangedSince(snapshot) {
  const before = snapshot?.scrollPosition
  if (!before) return false
  const current = scrollPosition()
  return (
    Math.abs(current.x - before.x) > SCROLL_DELTA_EPSILON_PX ||
    Math.abs(current.y - before.y) > SCROLL_DELTA_EPSILON_PX
  )
}

function captureSnapshot(card) {
  if (!card?.isConnected || !card.classList.contains("is-filter-muted")) return null
  const media = card.querySelector(".project-media")
  const source = sourceCanvas(card)
  if (!media || !canvasHasPixels(source)) return null

  const { cols, rows } = logicalGridForMedia(media, PUBLISHED_DITHER_CONFIG)
  const { paper, ink } = readBinaryColors()
  // Capture what the user actually sees, not the full static Floyd surface.
  // pointerover runs before the active-color hover takes ownership, so an
  // edge card keeps its current viewport-boundary mask in the snapshot.
  const surface = sampleCurrentBinarySurface(card, {
    baseCanvas: source,
    cols,
    rows,
    paper,
    ink,
    ditherConfig: PUBLISHED_DITHER_CONFIG,
  })
  const bits = surface?.bits || sampleCompositeBinary(
    source,
    currentRevealCanvas(card),
    cols,
    rows,
    paper,
    ink,
  )
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
    boundaryField: captureViewportDitherBoundaryField(card),
    scrollPosition: scrollPosition(),
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
    if (state.waitFrame) cancelAnimationFrame(state.waitFrame)
    state.waitFrame = 0
  }
  states.delete(card)
  card?.querySelector?.(`.${CANVAS_CLASS}`)?.remove()
  card?.removeAttribute?.(HANDOFF_ATTRIBUTE)
  if (!keepSnapshot) snapshots.delete(card)
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
  let synced = false
  if (sync) {
    const result = await Promise.race([
      Promise.resolve(sync()),
      waitForMs(BOUNDARY_SYNC_TIMEOUT_MS).then(() => false),
    ])
    synced = result === true
  }
  return synced
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
    state.handoff = {
      ready: false,
      reason: "missing-final-canvas",
      didScroll: scrollChangedSince(state.snapshot),
    }
    state.phase = "canonical-fallback"
    await finishOwnerHandoff(state)
    return
  }
  finalCanvas.dataset.active = "true"
  finalCanvas.dataset.publishedMode = PUBLISHED_DITHER_CONFIG?.mode || "native"

  await syncBoundarySurface(state)
  if (!isCurrentState(state)) {
    cancelState(state.card)
    return
  }

  if (!currentRevealCanvas(state.card)) {
    trackViewportDitherReveal(state.card, finalCanvas, window.__RED_MOTION_CONFIG__ || null)
  }
  const didScroll = scrollChangedSince(state.snapshot)
  const handoff = handoffViewportDitherBoundaryField(
    state.card,
    state.snapshot?.boundaryField,
    { allowBoundaryUpdate: didScroll },
  )
  state.handoff = { ...handoff, didScroll }
  state.phase = handoff.ready
    ? handoff.changed && didScroll
      ? "canonical-boundary-continue"
      : "canonical-direct-sync"
    : "canonical-fallback"

  refreshViewportDitherReveals({ linger: false })
  await finishOwnerHandoff(state)
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

async function finishOwnerHandoff(state) {
  if (!isCurrentState(state)) return
  // The snapshot never redraws a target. It remains the visible owner for one
  // painted frame while the canonical boundary surface is ready underneath.
  await waitFrames(1)
  if (!isCurrentState(state)) return

  state.canvas.remove()
  state.card.removeAttribute(HANDOFF_ATTRIBUTE)
  states.delete(state.card)
  snapshots.delete(state.card)
  window.dispatchEvent(new CustomEvent("red:hover-binary-return-complete", {
    detail: { card: state.card, handoff: state.handoff, phase: state.phase },
  }))
}

function canStartReturnHandoff(card) {
  const returning =
    card?.classList?.contains("is-muted-restore-return") ||
    card?.getAttribute?.(RETURN_ATTRIBUTE) === "true"
  return Boolean(
    card?.isConnected &&
      card.classList.contains("is-filter-muted") &&
      returning &&
      !card.classList.contains("is-muted-restore-intent") &&
      !card.matches(":hover") &&
      !card.matches(":focus-within"),
  )
}

function startHoverReturnHandoff(card) {
  if (prefersReducedMotion() || !canStartReturnHandoff(card)) {
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
    snapshot,
    handoff: null,
    phase: "hold-visible-snapshot",
    waitFrame: 0,
  }
  states.set(card, state)
  drawBinaryBits(ctx, imageData, framePixels, oldBits, paper, ink)

  // Hold the pre-hover visible state until the canonical boundary owner is
  // ready. This overlay never runs a second pixel transition.
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
  if (
    mutation.oldValue === "true" &&
    !states.has(card) &&
    canStartReturnHandoff(card)
  ) {
    startHoverReturnHandoff(card)
  }
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
