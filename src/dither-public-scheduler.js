import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard } from "./dither-engine.js?v=20260830-binarysurface1"
import { PUBLISHED_MOTION_CONFIG } from "./motion-default.js"
import {
  binaryGridNeedsUpdate,
} from "./binary-surface-core.js?v=20260830-binarysurface1"
import {
  cancelReveal,
  refreshViewportDitherReveals,
  resetViewportDitherRevealSequence,
  trackViewportDitherReveal,
} from "./reveal-motion.js?v=20260830-resizesnow3"
import {
  DITHER_RESIZE_MOTION_ATTRIBUTE,
  DITHER_RESIZE_SNOW_CLASS,
  cancelDitherResizeSnow,
  playPreparedDitherResizeSnow,
  prepareDitherInitialSnow,
  prepareDitherResizeSnow,
} from "./dither-resize-snow.js?v=20260830-categorycover1"

const PUBLIC_STYLE_ID = "red-dither-public-runtime-style"
const ROOT_MODE_ATTRIBUTE = "data-red-published-dither"
const ACTIVE_COLOR_MOTION_ATTRIBUTE = "data-active-color-motion"
const ACTIVE_COLOR_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const ONGOING_GAME_PROJECT_PATH = "/ongoing-game-project"
const PRIORITY_MARGIN = 760
const REVEAL_MARGIN = 920
const PRIORITY_FRAME_BUDGET_MS = 5.25
const IDLE_TIMEOUT_MS = 650
const RESIZE_SETTLE_MS = 90

const state = {
  destroyed: false,
  renderFrame: 0,
  priorityFrame: 0,
  idleHandle: 0,
  resizeTimer: 0,
  generation: 0,
  priorityQueue: [],
  idleQueue: [],
  pendingCards: new WeakMap(),
  appObserver: null,
  catalogObserver: null,
  resizeObserver: null,
  cardObserver: null,
  observedMedia: new Set(),
  observedCards: new Set(),
  boundImages: new WeakSet(),
  revealSignatures: new WeakMap(),
  revealSequenceKey: "",
  perf: {
    priorityRendered: 0,
    idleRendered: 0,
    maxCardRenderMs: 0,
    lastCardRenderMs: 0,
    skippedCssResize: 0,
    logicalResizeRenders: 0,
  },
}

function publishedMode() {
  return PUBLISHED_DITHER_CONFIG?.mode || "native"
}

function publishedIsGenerated() {
  return publishedMode() !== "native"
}

function ensurePublicStyles() {
  let style = document.getElementById(PUBLIC_STYLE_ID)
  if (!style) {
    style = document.createElement("style")
    style.id = PUBLIC_STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = `
    .project-media { overflow: hidden; }
    .dither-preview-canvas {
      position: absolute;
      inset: 0;
      z-index: 6 !important;
      display: block;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      background: var(--paper);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      transition: opacity var(--catalog-muted-hover-ms, 475ms) cubic-bezier(0.22, 1, 0.36, 1);
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted .project-halftone {
      opacity: 0 !important;
      visibility: hidden !important;
      display: none !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted
      .dither-preview-canvas[data-active="true"] {
      opacity: 1 !important;
      visibility: visible !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted.is-muted-restore-intent
      .dither-preview-canvas[data-active="true"] {
      opacity: 0 !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted.is-muted-restore-return
      .dither-preview-canvas[data-active="true"] {
      opacity: 1 !important;
    }
  `
}

function applyPublishedModeState() {
  document.documentElement.setAttribute(ROOT_MODE_ATTRIBUTE, publishedMode())
}

function activeCatalog() {
  return document.querySelector(".catalog")
}

function applyCategoryAliases(catalog) {
  if (!catalog || catalog.dataset.activeFilter !== "game") return
  const ongoingGameLink = [...catalog.querySelectorAll("a.project-card[href]")]
    .find((link) => {
      try {
        const pathname = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "")
        return pathname.endsWith(ONGOING_GAME_PROJECT_PATH)
      } catch {
        return String(link.getAttribute("href") || "").includes("ongoing-game-project")
      }
    })
  const card = ongoingGameLink?.closest(".project-card")
  if (!card) return
  card.dataset.categoryAlias = "game"
  card.classList.remove("is-filter-muted", "is-muted-restore-intent", "is-muted-restore-return")
}

function isMutedByActiveFilter(card, catalog) {
  return Boolean(
    publishedIsGenerated() &&
    catalog?.dataset.activeFilter &&
    card?.classList.contains("is-filter-muted")
  )
}

function activeColorOwnsCard(card) {
  return (
    card?.getAttribute?.(ACTIVE_COLOR_MOTION_ATTRIBUTE) === "true" ||
    card?.classList?.contains("is-muted-restore-intent")
  )
}

function motionBlocksReveal(card) {
  return (
    activeColorOwnsCard(card) ||
    card?.getAttribute?.(ACTIVE_COLOR_COOLDOWN_ATTRIBUTE) === "true" ||
    card?.getAttribute?.(DITHER_RESIZE_MOTION_ATTRIBUTE) === "true"
  )
}

function viewportDistance(card) {
  const rect = card?.getBoundingClientRect?.()
  if (!rect) return Number.POSITIVE_INFINITY
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  if (rect.bottom >= 0 && rect.top <= viewportHeight) return 0
  if (rect.top > viewportHeight) return rect.top - viewportHeight
  return Math.max(0, -rect.bottom)
}

function revealSignature(card, catalog, canvas) {
  const img = card.querySelector(".project-media img")
  return [
    catalog?.dataset.activeFilter || "",
    publishedMode(),
    img?.currentSrc || img?.src || "",
    canvas?.dataset?.ditherRenderSignature || "",
    `${canvas?.dataset?.ditherColumns || canvas?.width || 0}x${canvas?.dataset?.ditherRows || canvas?.height || 0}`,
  ].join("|")
}

function armReveal(card, catalog) {
  if (!isMutedByActiveFilter(card, catalog)) return false
  if (motionBlocksReveal(card)) {
    releaseReveal(card, { forgetSignature: false })
    return false
  }
  const img = card.querySelector(".project-media img")
  const canvas = card.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!img?.complete || img.naturalWidth <= 0 || !canvas || canvas.width <= 1 || canvas.height <= 1) return false
  const signature = revealSignature(card, catalog, canvas)
  const existing = card.querySelector(".dither-reveal-canvas")
  if (state.revealSignatures.get(card) === signature && existing) return true
  state.revealSignatures.set(card, signature)
  return trackViewportDitherReveal(card, canvas, PUBLISHED_MOTION_CONFIG)
}

function releaseReveal(card, { forgetSignature = true } = {}) {
  cancelReveal(card, { remove: true })
  if (forgetSignature) state.revealSignatures.delete(card)
}

function cancelScheduledWork() {
  state.generation += 1
  state.priorityQueue.length = 0
  state.idleQueue.length = 0
  state.pendingCards = new WeakMap()
  if (state.priorityFrame) cancelAnimationFrame(state.priorityFrame)
  state.priorityFrame = 0
  if (state.idleHandle) {
    if ("cancelIdleCallback" in window) window.cancelIdleCallback(state.idleHandle)
    else clearTimeout(state.idleHandle)
  }
  state.idleHandle = 0
}

function bindImageLoad(img) {
  if (!img || img.complete || state.boundImages.has(img)) return
  state.boundImages.add(img)
  img.addEventListener("load", () => {
    if (state.destroyed) return
    requestRender()
  }, { once: true, passive: true })
}

function renderOne(card, catalog, generation, tier) {
  if (
    state.destroyed ||
    generation !== state.generation ||
    !card?.isConnected ||
    !isMutedByActiveFilter(card, catalog)
  ) return false
  if (activeColorOwnsCard(card)) return false

  const img = card.querySelector(".project-media img")
  bindImageLoad(img)
  if (!img?.complete || img.naturalWidth <= 0) return false

  const media = card.querySelector(".project-media")
  const activeCanvas = media?.querySelector('.dither-preview-canvas[data-active="true"]')
  const preparedSnow = activeCanvas
    ? prepareDitherResizeSnow(card, PUBLISHED_DITHER_CONFIG)
    : prepareDitherInitialSnow(card, PUBLISHED_DITHER_CONFIG, {
        durationMs: tier === "priority" ? 560 : 460,
      })
  const started = performance.now()
  renderCard(card, PUBLISHED_DITHER_CONFIG)
  const elapsed = performance.now() - started
  state.perf.lastCardRenderMs = elapsed
  state.perf.maxCardRenderMs = Math.max(state.perf.maxCardRenderMs, elapsed)
  if (tier === "idle") state.perf.idleRendered += 1
  else state.perf.priorityRendered += 1

  const canvas = card.querySelector(".dither-preview-canvas")
  if (!canvas) {
    cancelDitherResizeSnow(card)
    return false
  }
  canvas.dataset.active = "true"
  canvas.dataset.publishedMode = publishedMode()
  card.removeAttribute("data-dither-pending")
  state.pendingCards.delete(card)
  playPreparedDitherResizeSnow(preparedSnow)

  if (viewportDistance(card) <= REVEAL_MARGIN) {
    if (armReveal(card, catalog)) refreshViewportDitherReveals({ linger: false })
  }
  return true
}

function processPriorityQueue() {
  state.priorityFrame = 0
  if (state.destroyed) return
  const catalog = activeCatalog()
  if (!catalog) return
  const generation = state.generation
  const started = performance.now()
  let rendered = 0

  while (state.priorityQueue.length) {
    const card = state.priorityQueue.shift()
    const pending = state.pendingCards.get(card)
    if (!pending || pending.generation !== generation || pending.tier !== "priority") continue
    renderOne(card, catalog, generation, "priority")
    rendered += 1
    if (rendered >= 1 || performance.now() - started >= PRIORITY_FRAME_BUDGET_MS) break
  }

  if (state.priorityQueue.length) state.priorityFrame = requestAnimationFrame(processPriorityQueue)
  else scheduleIdleQueue()
}

function schedulePriorityQueue() {
  if (state.destroyed || state.priorityFrame || !state.priorityQueue.length) return
  state.priorityFrame = requestAnimationFrame(processPriorityQueue)
}

function processIdleQueue(deadline) {
  state.idleHandle = 0
  if (state.destroyed) return
  const catalog = activeCatalog()
  if (!catalog) return
  const generation = state.generation
  let rendered = 0

  while (state.idleQueue.length) {
    const card = state.idleQueue.shift()
    const pending = state.pendingCards.get(card)
    if (!pending || pending.generation !== generation || pending.tier !== "idle") continue

    const lowTime = deadline?.timeRemaining && deadline.timeRemaining() < 5 && !deadline.didTimeout
    if (lowTime && rendered > 0) {
      state.idleQueue.unshift(card)
      break
    }

    renderOne(card, catalog, generation, "idle")
    rendered += 1
    if (rendered >= 1) break
  }

  if (state.idleQueue.length) scheduleIdleQueue()
}

function scheduleIdleQueue() {
  if (
    state.destroyed ||
    state.idleHandle ||
    state.priorityFrame ||
    state.priorityQueue.length ||
    !state.idleQueue.length
  ) return

  if ("requestIdleCallback" in window) {
    state.idleHandle = window.requestIdleCallback(processIdleQueue, { timeout: IDLE_TIMEOUT_MS })
  } else {
    state.idleHandle = window.setTimeout(
      () => processIdleQueue({ timeRemaining: () => 8, didTimeout: true }),
      48,
    )
  }
}

function promoteCard(card) {
  const pending = state.pendingCards.get(card)
  if (!pending || pending.generation !== state.generation || pending.tier === "priority") return
  pending.tier = "priority"
  state.priorityQueue.push(card)
  schedulePriorityQueue()
}

function handleCardIntersections(entries) {
  if (state.destroyed) return
  const catalog = activeCatalog()
  if (!catalog) return

  for (const entry of entries) {
    const card = entry.target
    if (!card?.isConnected || !isMutedByActiveFilter(card, catalog)) {
      releaseReveal(card)
      continue
    }
    if (motionBlocksReveal(card)) {
      releaseReveal(card, { forgetSignature: false })
      continue
    }
    if (!entry.isIntersecting) continue
    promoteCard(card)
    if (card.querySelector('.dither-preview-canvas[data-active="true"]')) armReveal(card, catalog)
  }
  refreshViewportDitherReveals({ linger: false })
}

function syncCardTargets(catalog) {
  if (!state.cardObserver) return
  const next = new Set(catalog?.querySelectorAll(".project-card.is-filter-muted") || [])
  for (const card of [...state.observedCards]) {
    if (next.has(card)) continue
    state.cardObserver.unobserve(card)
    state.observedCards.delete(card)
    releaseReveal(card)
  }
  for (const card of next) {
    if (state.observedCards.has(card)) continue
    state.observedCards.add(card)
    state.cardObserver.observe(card)
  }
}

function syncResizeTargets(catalog) {
  if (!state.resizeObserver) return
  const next = new Set(catalog?.querySelectorAll(".project-media") || [])
  for (const media of [...state.observedMedia]) {
    if (next.has(media)) continue
    state.resizeObserver.unobserve(media)
    state.observedMedia.delete(media)
  }
  for (const media of next) {
    if (state.observedMedia.has(media)) continue
    state.observedMedia.add(media)
    state.resizeObserver.observe(media)
  }
}

function queueMutedCards(catalog, cards) {
  cancelScheduledWork()
  const generation = state.generation
  const ranked = []

  for (const card of cards) {
    const img = card.querySelector(".project-media img")
    bindImageLoad(img)

    if (!isMutedByActiveFilter(card, catalog)) {
      const canvas = card.querySelector(".dither-preview-canvas")
      if (canvas) canvas.dataset.active = "false"
      card.removeAttribute("data-dither-pending")
      cancelDitherResizeSnow(card)
      releaseReveal(card)
      continue
    }

    if (activeColorOwnsCard(card)) {
      card.removeAttribute("data-dither-pending")
      releaseReveal(card, { forgetSignature: false })
      continue
    }

    const distance = viewportDistance(card)
    ranked.push({ card, distance })
  }

  ranked.sort((a, b) => a.distance - b.distance)
  for (const { card, distance } of ranked) {
    const tier = distance <= PRIORITY_MARGIN ? "priority" : "idle"
    card.setAttribute("data-dither-pending", tier)
    state.pendingCards.set(card, { generation, tier })
    if (tier === "priority") state.priorityQueue.push(card)
    else state.idleQueue.push(card)
  }

  schedulePriorityQueue()
  scheduleIdleQueue()
}

function renderPublishedDither() {
  state.renderFrame = 0
  if (state.destroyed) return
  applyPublishedModeState()
  ensurePublicStyles()

  const catalog = activeCatalog()
  if (!catalog) return
  applyCategoryAliases(catalog)
  if (!publishedIsGenerated()) return

  syncResizeTargets(catalog)
  syncCardTargets(catalog)

  const sequenceKey = `${catalog.dataset.activeFilter || ""}|${publishedMode()}`
  if (sequenceKey !== state.revealSequenceKey) {
    resetViewportDitherRevealSequence()
    state.revealSequenceKey = sequenceKey
  }

  queueMutedCards(catalog, [...catalog.querySelectorAll(".project-card")])
}

function requestRender() {
  if (state.destroyed || state.renderFrame) return
  state.renderFrame = requestAnimationFrame(renderPublishedDither)
}

function mediaNeedsLogicalResize(media) {
  const card = media?.closest?.(".project-card")
  const catalog = card?.closest?.(".catalog")
  if (!card || !isMutedByActiveFilter(card, catalog)) return false
  const canvas = media.querySelector('.dither-preview-canvas[data-active="true"]')
  return binaryGridNeedsUpdate(canvas, media, PUBLISHED_DITHER_CONFIG)
}

function requestSettledResizeRender(entries = null) {
  if (state.destroyed) return
  const targets = Array.isArray(entries)
    ? entries.map((entry) => entry?.target).filter(Boolean)
    : entries && typeof entries.length === "number"
      ? [...entries].map((entry) => entry?.target).filter(Boolean)
      : [...state.observedMedia]

  const needsRender = targets.some(mediaNeedsLogicalResize)
  if (!needsRender) {
    state.perf.skippedCssResize += Math.max(1, targets.length)
    return
  }

  clearTimeout(state.resizeTimer)
  state.resizeTimer = window.setTimeout(() => {
    state.resizeTimer = 0
    state.perf.logicalResizeRenders += 1
    requestRender()
  }, RESIZE_SETTLE_MS)
}

function mutedClassChanged(mutation) {
  const target = mutation.target
  if (!(target instanceof Element) || !target.classList.contains("project-card")) return false
  const before = new Set(String(mutation.oldValue || "").split(/\s+/).filter(Boolean))
  return before.has("is-filter-muted") !== target.classList.contains("is-filter-muted")
}

function motionAttributeChanged(mutation) {
  return (
    mutation.target instanceof Element &&
    mutation.target.classList.contains("project-card") &&
    (
      mutation.attributeName === ACTIVE_COLOR_MOTION_ATTRIBUTE ||
      mutation.attributeName === ACTIVE_COLOR_COOLDOWN_ATTRIBUTE ||
      mutation.attributeName === DITHER_RESIZE_MOTION_ATTRIBUTE
    )
  )
}

function motionAttributeShouldRender(mutation) {
  if (!motionAttributeChanged(mutation)) return false
  if (mutation.attributeName === DITHER_RESIZE_MOTION_ATTRIBUTE) return false
  if (mutation.attributeName === ACTIVE_COLOR_COOLDOWN_ATTRIBUTE) return true
  return !activeColorOwnsCard(mutation.target)
}

function generatedCanvasMutationOnly(mutation) {
  if (mutation.type !== "childList") return false
  const nodes = [...mutation.addedNodes, ...mutation.removedNodes]
  if (!nodes.length) return false
  return nodes.every((node) =>
    node instanceof Element && (
      node.classList.contains("dither-preview-canvas") ||
      node.classList.contains("dither-reveal-canvas") ||
      node.classList.contains("active-color-snow-canvas") ||
      node.classList.contains(DITHER_RESIZE_SNOW_CLASS) ||
      node.classList.contains("dither-hover-return-snow-canvas")
    )
  )
}

function bindCatalogObserver() {
  state.catalogObserver?.disconnect()
  state.catalogObserver = null
  const catalog = activeCatalog()
  if (!catalog || !("MutationObserver" in window)) return

  state.catalogObserver = new MutationObserver((mutations) => {
    if (state.destroyed) return
    mutations.forEach((mutation) => {
      if (!motionAttributeChanged(mutation)) return
      if (motionBlocksReveal(mutation.target)) {
        releaseReveal(mutation.target, { forgetSignature: false })
      }
    })
    if (mutations.some((mutation) =>
      mutation.type === "childList" ||
      (mutation.type === "attributes" && mutation.target === catalog && mutation.attributeName === "data-active-filter"),
    )) applyCategoryAliases(catalog)

    const shouldRender = mutations.some((mutation) => {
      if (mutation.type === "childList") return !generatedCanvasMutationOnly(mutation)
      if (mutation.type !== "attributes") return false
      if (motionAttributeChanged(mutation)) return motionAttributeShouldRender(mutation)
      if (mutation.target === catalog && mutation.attributeName === "data-active-filter") return true
      return mutation.attributeName === "class" && mutedClassChanged(mutation)
    })
    if (shouldRender) requestRender()
  })

  state.catalogObserver.observe(catalog, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [
      "class",
      "data-active-filter",
      ACTIVE_COLOR_MOTION_ATTRIBUTE,
      ACTIVE_COLOR_COOLDOWN_ATTRIBUTE,
      DITHER_RESIZE_MOTION_ATTRIBUTE,
    ],
  })
}

function bindAppObserver() {
  if (!("MutationObserver" in window)) return
  const app = document.querySelector("#app")
  if (!app) return
  state.appObserver?.disconnect()
  state.appObserver = new MutationObserver((mutations) => {
    if (state.destroyed) return
    if (!mutations.some((mutation) => mutation.type === "childList" && mutation.target === app)) return
    bindCatalogObserver()
    requestRender()
  })
  state.appObserver.observe(app, { childList: true })
}

function boot() {
  applyPublishedModeState()
  ensurePublicStyles()
  bindAppObserver()
  bindCatalogObserver()

  if (!publishedIsGenerated()) return

  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver(requestSettledResizeRender)
  } else {
    window.addEventListener("resize", requestRender, { passive: true })
  }

  if ("IntersectionObserver" in window) {
    state.cardObserver = new IntersectionObserver(handleCardIntersections, {
      root: null,
      rootMargin: `${REVEAL_MARGIN}px 0px`,
      threshold: 0,
    })
  }

  requestRender()
}

export function destroyPublicDitherRuntime() {
  if (state.destroyed) return
  state.destroyed = true
  cancelScheduledWork()
  if (state.renderFrame) cancelAnimationFrame(state.renderFrame)
  state.renderFrame = 0
  clearTimeout(state.resizeTimer)
  state.resizeTimer = 0
  state.appObserver?.disconnect()
  state.catalogObserver?.disconnect()
  state.resizeObserver?.disconnect()
  state.cardObserver?.disconnect()
  state.observedMedia.clear()
  state.observedCards.clear()
  document.querySelectorAll(".project-card").forEach((card) => releaseReveal(card))
  window.removeEventListener("resize", requestRender)
  document.documentElement.removeAttribute(ROOT_MODE_ATTRIBUTE)
  document.getElementById(PUBLIC_STYLE_ID)?.remove()
}

boot()

window.__RED_DITHER_PUBLIC_RUNTIME__ = {
  destroy: destroyPublicDitherRuntime,
  render: requestRender,
  mode: publishedMode(),
  perf: state.perf,
}
