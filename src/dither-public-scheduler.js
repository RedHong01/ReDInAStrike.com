import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard } from "./dither-engine.js?v=20260830-perfaudit1"
import { PUBLISHED_MOTION_CONFIG } from "./motion-default.js"
import {
  binaryGridNeedsUpdate,
} from "./binary-surface-core.js?v=20260830-perfaudit1"
import {
  cancelReveal,
  refreshViewportDitherReveals,
  resetViewportDitherRevealSequence,
  trackViewportDitherReveal,
} from "./reveal-motion.js?v=20260830-perfaudit1"
import {
  DITHER_RESIZE_MOTION_ATTRIBUTE,
  DITHER_RESIZE_SNOW_CLASS,
  cancelDitherResizeSnow,
  playPreparedDitherResizeSnow,
  prepareDitherInitialSnow,
  prepareDitherResizeSnow,
} from "./dither-resize-snow.js?v=20260830-perfaudit1"

const PUBLIC_STYLE_ID = "red-dither-public-runtime-style"
const PUBLIC_STYLE_VERSION = "7"
const ROOT_MODE_ATTRIBUTE = "data-red-published-dither"
const ACTIVE_COLOR_RETURN_ATTRIBUTE = "data-active-color-return"
const ACTIVE_COLOR_MOTION_ATTRIBUTE = "data-active-color-motion"
const ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE = "data-active-color-restore-ready"
const ACTIVE_COLOR_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const CATEGORY_ENTER_DITHER_ATTRIBUTE = "data-dither-category-enter-reveal"
const ONGOING_GAME_PROJECT_PATH = "/ongoing-game-project"
const HOVER_BINARY_RETURN_ATTRIBUTE = "data-hover-binary-return"
const PRIORITY_MARGIN = 760
const REVEAL_MARGIN = 920
const PRIORITY_FRAME_BUDGET_MS = 5.25
const IDLE_TIMEOUT_MS = 650
const RESIZE_SETTLE_MS = 90

const state = {
  destroyed: false,
  renderFrame: 0,
  revealRefreshFrame: 0,
  priorityFrame: 0,
  idleHandle: 0,
  resizeTimer: 0,
  layoutSettleTimers: new Set(),
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
  initialRevealSequenceKey: null,
  initialRevealActive: true,
  lastModeBroadcast: "",
  perf: {
    priorityRendered: 0,
    idleRendered: 0,
    maxCardRenderMs: 0,
    lastCardRenderMs: 0,
    skippedCssResize: 0,
    logicalResizeRenders: 0,
    skippedUpToDate: 0,
    enqueued: 0,
    revealRefreshes: 0,
  },
}

function currentSequenceKey(catalog) {
  return `${catalog?.dataset.activeFilter || ""}|${publishedMode()}`
}

function allowInitialDitherSnow(catalog) {
  const sequenceKey = currentSequenceKey(catalog)
  if (state.initialRevealSequenceKey === null) {
    state.initialRevealSequenceKey = sequenceKey
  } else if (sequenceKey !== state.initialRevealSequenceKey) {
    state.initialRevealActive = false
  }

  return (
    state.initialRevealActive &&
    sequenceKey === state.initialRevealSequenceKey &&
    !catalog?.dataset.filterPhase
  )
}

function catalogIsEnteringFilter(catalog) {
  const phase = catalog?.dataset?.filterPhase || ""
  return Boolean(
    catalog?.dataset?.activeFilter &&
    (phase === "entering" || phase === "settling" || phase === "color-snow")
  )
}

function allowCategoryEnterDitherSnow(card, catalog, activeCanvas) {
  return Boolean(
    !activeCanvas &&
    isMutedByActiveFilter(card, catalog) &&
    (catalogIsEnteringFilter(catalog) || card?.hasAttribute?.(CATEGORY_ENTER_DITHER_ATTRIBUTE))
  )
}

function initialDitherSnowDuration(catalog, tier, reason) {
  const fallback = tier === "priority" ? 560 : 460
  if (reason !== "category-enter") return fallback

  const planned = Number(catalog?.dataset?.colorSnowEnterDurationMs)
  if (!Number.isFinite(planned) || planned <= 0) return tier === "priority" ? 660 : 540
  return Math.round(Math.min(920, Math.max(fallback, planned * 0.72)))
}

function publishedMode() {
  return PUBLISHED_DITHER_CONFIG?.mode || "native"
}

function publishedIsGenerated() {
  return publishedMode() !== "native"
}

function imageSource(img) {
  return img?.currentSrc || img?.src || ""
}

function ensurePublicStyles() {
  let style = document.getElementById(PUBLIC_STYLE_ID)
  if (style?.dataset.version === PUBLIC_STYLE_VERSION) return
  if (!style) {
    style = document.createElement("style")
    style.id = PUBLIC_STYLE_ID
    document.head.appendChild(style)
  }
  style.dataset.version = PUBLIC_STYLE_VERSION
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
      .catalog[data-active-filter] .project-card.is-filter-muted .project-media::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 5;
      display: block;
      background: var(--paper);
      opacity: 1;
      pointer-events: none;
      transition: opacity 90ms linear;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted .project-media > img {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted.is-muted-restore-intent[${ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE}="true"]
      .project-media > img {
      opacity: 1 !important;
      visibility: visible !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter][data-filter-phase]
      .project-card.is-filter-muted .project-media > img {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter]:not([data-filter-phase])
      .project-card.is-filter-muted.is-muted-restore-return[${ACTIVE_COLOR_RETURN_ATTRIBUTE}="true"]
      .project-media > img {
      opacity: 0 !important;
      visibility: hidden !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted
      .project-media[data-dither-ready="true"]::before,
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted.is-muted-restore-intent[${ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE}="true"]
      .project-media::before {
      opacity: 0;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter][data-filter-phase]
      .project-card.is-filter-muted .project-media::before {
      opacity: 1;
      transition-duration: 0ms;
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
      .catalog[data-active-filter] .project-card.is-filter-muted.is-muted-restore-intent[${ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE}="true"]
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
  const mode = publishedMode()
  document.documentElement.setAttribute(ROOT_MODE_ATTRIBUTE, mode)
  if (state.lastModeBroadcast === mode) return
  state.lastModeBroadcast = mode
  window.dispatchEvent(new CustomEvent("red:public-dither-ready", {
    detail: { mode, generated: mode !== "native" },
  }))
}

function activeCatalog() {
  return document.querySelector(".catalog")
}

function pageIsVisible() {
  return document.visibilityState !== "hidden"
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
    (
      card?.classList?.contains("is-muted-restore-intent") &&
      card?.getAttribute?.(ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE) === "true"
    )
  )
}

function hoverBinaryReturnOwnsCard(card) {
  return card?.getAttribute?.(HOVER_BINARY_RETURN_ATTRIBUTE) === "true"
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

function requestRevealRefresh(options = {}) {
  if (state.destroyed || state.revealRefreshFrame || !pageIsVisible()) return
  state.revealRefreshFrame = requestAnimationFrame(() => {
    state.revealRefreshFrame = 0
    if (state.destroyed || !pageIsVisible()) return
    state.perf.revealRefreshes += 1
    refreshViewportDitherReveals({ linger: false, ...options })
  })
}

function ditherCanvasIsCurrent(card, catalog) {
  if (!isMutedByActiveFilter(card, catalog)) return false
  const media = card?.querySelector?.(".project-media")
  const img = media?.querySelector?.("img")
  const canvas = media?.querySelector?.('.dither-preview-canvas[data-active="true"]')
  if (!img?.complete || img.naturalWidth <= 0 || !canvas || canvas.width <= 1 || canvas.height <= 1) return false
  if ((canvas.dataset.ditherMode || "native") !== publishedMode()) return false
  if (canvas.dataset.ditherSource !== imageSource(img)) return false
  if (canvas.dataset.ditherSurfaceVersion !== "1" && publishedIsGenerated()) return false
  return !binaryGridNeedsUpdate(canvas, media, PUBLISHED_DITHER_CONFIG)
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
  if (activeColorOwnsCard(card) || hoverBinaryReturnOwnsCard(card)) return false

  const img = card.querySelector(".project-media img")
  bindImageLoad(img)
  if (!img?.complete || img.naturalWidth <= 0) return false

  const media = card.querySelector(".project-media")
  const activeCanvas = media?.querySelector('.dither-preview-canvas[data-active="true"]')
  const initialSnowReason = allowCategoryEnterDitherSnow(card, catalog, activeCanvas)
    ? "category-enter"
    : allowInitialDitherSnow(catalog)
      ? "initial"
      : ""
  const preparedSnow = activeCanvas
    ? prepareDitherResizeSnow(card, PUBLISHED_DITHER_CONFIG)
    : initialSnowReason
      ? prepareDitherInitialSnow(card, PUBLISHED_DITHER_CONFIG, {
          reason: initialSnowReason,
          durationMs: initialDitherSnowDuration(catalog, tier, initialSnowReason),
        })
      : null
  const started = performance.now()
  renderCard(card, PUBLISHED_DITHER_CONFIG)
  const elapsed = performance.now() - started
  state.perf.lastCardRenderMs = elapsed
  state.perf.maxCardRenderMs = Math.max(state.perf.maxCardRenderMs, elapsed)
  if (tier === "idle") state.perf.idleRendered += 1
  else state.perf.priorityRendered += 1

  const canvas = card.querySelector(".dither-preview-canvas")
  if (!canvas) {
    media?.removeAttribute("data-dither-ready")
    cancelDitherResizeSnow(card)
    return false
  }
  canvas.dataset.active = "true"
  canvas.dataset.publishedMode = publishedMode()
  media?.setAttribute("data-dither-ready", "true")
  card.removeAttribute("data-dither-pending")
  card.removeAttribute(CATEGORY_ENTER_DITHER_ATTRIBUTE)
  state.pendingCards.delete(card)
  playPreparedDitherResizeSnow(preparedSnow)

  if (viewportDistance(card) <= REVEAL_MARGIN) {
    if (armReveal(card, catalog)) requestRevealRefresh()
  }
  return true
}

function processPriorityQueue() {
  state.priorityFrame = 0
  if (state.destroyed || !pageIsVisible()) return
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

  if (state.priorityQueue.length && pageIsVisible()) {
    state.priorityFrame = requestAnimationFrame(processPriorityQueue)
  }
  else scheduleIdleQueue()
}

function schedulePriorityQueue() {
  if (state.destroyed || state.priorityFrame || !pageIsVisible() || !state.priorityQueue.length) return
  state.priorityFrame = requestAnimationFrame(processPriorityQueue)
}

function processIdleQueue(deadline) {
  state.idleHandle = 0
  if (state.destroyed || !pageIsVisible()) return
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
    !pageIsVisible() ||
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
    if (hoverBinaryReturnOwnsCard(card)) continue
    if (!entry.isIntersecting) continue
    promoteCard(card)
    if (card.querySelector('.dither-preview-canvas[data-active="true"]')) {
      if (armReveal(card, catalog)) requestRevealRefresh()
    }
  }
  requestRevealRefresh()
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

function queueMutedCards(catalog, cards, { restart = false } = {}) {
  if (restart) cancelScheduledWork()
  const generation = state.generation
  const markCategoryEnterReveal = catalogIsEnteringFilter(catalog)
  const ranked = []
  let shouldRefreshReveal = false

  for (const card of cards) {
    const img = card.querySelector(".project-media img")
    bindImageLoad(img)

    if (!isMutedByActiveFilter(card, catalog)) {
      const canvas = card.querySelector(".dither-preview-canvas")
      if (canvas) canvas.dataset.active = "false"
      card.querySelector(".project-media")?.removeAttribute("data-dither-ready")
      card.removeAttribute("data-dither-pending")
      card.removeAttribute(CATEGORY_ENTER_DITHER_ATTRIBUTE)
      cancelDitherResizeSnow(card)
      releaseReveal(card)
      continue
    }

    if (markCategoryEnterReveal && !card.querySelector('.dither-preview-canvas[data-active="true"]')) {
      card.setAttribute(CATEGORY_ENTER_DITHER_ATTRIBUTE, "true")
    }

    if (activeColorOwnsCard(card)) {
      card.removeAttribute("data-dither-pending")
      releaseReveal(card, { forgetSignature: false })
      continue
    }
    if (hoverBinaryReturnOwnsCard(card)) {
      card.removeAttribute("data-dither-pending")
      state.pendingCards.delete(card)
      continue
    }

    if (ditherCanvasIsCurrent(card, catalog)) {
      card.removeAttribute("data-dither-pending")
      state.pendingCards.delete(card)
      card.querySelector(".project-media")?.setAttribute("data-dither-ready", "true")
      state.perf.skippedUpToDate += 1
      if (viewportDistance(card) <= REVEAL_MARGIN && armReveal(card, catalog)) {
        shouldRefreshReveal = true
      }
      continue
    }

    const distance = viewportDistance(card)
    ranked.push({ card, distance })
  }

  ranked.sort((a, b) => a.distance - b.distance)
  for (const { card, distance } of ranked) {
    const tier = distance <= PRIORITY_MARGIN ? "priority" : "idle"
    const pending = state.pendingCards.get(card)
    if (pending?.generation === generation) {
      if (pending.tier !== "priority" && tier === "priority") {
        pending.tier = "priority"
        card.setAttribute("data-dither-pending", "priority")
        state.priorityQueue.push(card)
      }
      continue
    }
    card.setAttribute("data-dither-pending", tier)
    state.pendingCards.set(card, { generation, tier })
    state.perf.enqueued += 1
    if (tier === "priority") state.priorityQueue.push(card)
    else state.idleQueue.push(card)
  }

  schedulePriorityQueue()
  scheduleIdleQueue()
  if (shouldRefreshReveal) requestRevealRefresh()
}

function renderPublishedDither() {
  state.renderFrame = 0
  if (state.destroyed || !pageIsVisible()) return
  applyPublishedModeState()
  ensurePublicStyles()

  const catalog = activeCatalog()
  if (!catalog) return
  applyCategoryAliases(catalog)
  if (!publishedIsGenerated()) return

  syncResizeTargets(catalog)
  syncCardTargets(catalog)

  const sequenceKey = currentSequenceKey(catalog)
  const sequenceChanged = sequenceKey !== state.revealSequenceKey
  if (sequenceChanged) {
    resetViewportDitherRevealSequence()
    state.revealSequenceKey = sequenceKey
  }

  queueMutedCards(catalog, [...catalog.querySelectorAll(".project-card")], {
    restart: sequenceChanged,
  })
}

function requestRender() {
  if (state.destroyed || state.renderFrame || !pageIsVisible()) return
  state.renderFrame = requestAnimationFrame(renderPublishedDither)
}

function handleVisibilityChange() {
  if (state.destroyed) return
  if (!pageIsVisible()) {
    cancelScheduledWork()
    if (state.renderFrame) cancelAnimationFrame(state.renderFrame)
    state.renderFrame = 0
    if (state.revealRefreshFrame) cancelAnimationFrame(state.revealRefreshFrame)
    state.revealRefreshFrame = 0
    return
  }
  requestRender()
  requestRevealRefresh()
}

function handleHoverBinaryReturnComplete(event) {
  const card = event?.detail?.card
  const catalog = card?.closest?.(".catalog")
  if (card?.isConnected && catalog) {
    queueMutedCards(catalog, [card])
  } else {
    requestRender()
  }
}

function mediaNeedsLogicalResize(media) {
  const card = media?.closest?.(".project-card")
  const catalog = card?.closest?.(".catalog")
  if (!card || !isMutedByActiveFilter(card, catalog)) return false
  if (hoverBinaryReturnOwnsCard(card)) return false
  if (state.pendingCards.get(card)?.generation === state.generation) return false
  return !ditherCanvasIsCurrent(card, catalog)
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

function requestLayoutSettleRender() {
  if (state.destroyed || !pageIsVisible() || !publishedIsGenerated()) return
  const catalog = activeCatalog()
  if (!catalog) return
  const needsRender = [...catalog.querySelectorAll(".project-media")]
    .some(mediaNeedsLogicalResize)
  if (needsRender) requestRender()
}

function scheduleInitialLayoutSettleChecks() {
  if (state.destroyed || state.layoutSettleTimers.size || !publishedIsGenerated()) return
  ;[180, 520, 980].forEach((delay) => {
    const timer = window.setTimeout(() => {
      state.layoutSettleTimers.delete(timer)
      requestLayoutSettleRender()
    }, delay)
    state.layoutSettleTimers.add(timer)
  })
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
      mutation.attributeName === ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE ||
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

    let shouldRender = false
    const motionCards = new Set()
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        if (!generatedCanvasMutationOnly(mutation)) shouldRender = true
        continue
      }
      if (mutation.type !== "attributes") continue
      if (motionAttributeChanged(mutation)) {
        if (motionAttributeShouldRender(mutation)) motionCards.add(mutation.target)
        continue
      }
      if (mutation.target === catalog && mutation.attributeName === "data-active-filter") {
        shouldRender = true
        continue
      }
      if (mutation.attributeName === "class" && mutedClassChanged(mutation)) {
        shouldRender = true
      }
    }

    if (shouldRender) {
      requestRender()
    } else if (motionCards.size) {
      queueMutedCards(catalog, [...motionCards])
    }
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
      ACTIVE_COLOR_RESTORE_READY_ATTRIBUTE,
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
  document.addEventListener("visibilitychange", handleVisibilityChange)
  window.addEventListener("red:hover-binary-return-complete", handleHoverBinaryReturnComplete)
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
  scheduleInitialLayoutSettleChecks()
}

export function destroyPublicDitherRuntime() {
  if (state.destroyed) return
  state.destroyed = true
  cancelScheduledWork()
  if (state.renderFrame) cancelAnimationFrame(state.renderFrame)
  state.renderFrame = 0
  if (state.revealRefreshFrame) cancelAnimationFrame(state.revealRefreshFrame)
  state.revealRefreshFrame = 0
  clearTimeout(state.resizeTimer)
  state.resizeTimer = 0
  for (const timer of state.layoutSettleTimers) window.clearTimeout(timer)
  state.layoutSettleTimers.clear()
  state.appObserver?.disconnect()
  state.catalogObserver?.disconnect()
  state.resizeObserver?.disconnect()
  state.cardObserver?.disconnect()
  state.observedMedia.clear()
  state.observedCards.clear()
  document.querySelectorAll(".project-card").forEach((card) => releaseReveal(card))
  window.removeEventListener("resize", requestRender)
  window.removeEventListener("red:hover-binary-return-complete", handleHoverBinaryReturnComplete)
  document.removeEventListener("visibilitychange", handleVisibilityChange)
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
