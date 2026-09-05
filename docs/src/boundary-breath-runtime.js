import { boundaryRevealMotionConfig } from "./motion-default.js"

const OWNER = "breath8"
const ACTIVE_COLOR_MOTION_ATTRIBUTE = "data-active-color-motion"
const ACTIVE_COLOR_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const DITHER_RESIZE_MOTION_ATTRIBUTE = "data-dither-resize-motion"
const IDLE_FRAME_MS = 1000 / 30
const WATCHDOG_FRAME_MS = 240
const RESIZE_SYNC_MS = 120
const RETRY_DELAYS = [0, 80, 220, 520, 1000, 1800]

const trackedSignatures = new WeakMap()
const trackedCards = new Set()
const ownedOverlays = new Set()
const visibleOverlays = new Set()
const pendingCardSyncs = new Set()

let breathFrame = 0
let breathTimer = 0
let syncFrame = 0
let cardSyncFrame = 0
let lastBreathDraw = 0
let resizeTimer = 0
let revealModulePromise = null
let revealApi = null
let breathWakeQueued = false
let catalog = null
let appObserver = null
let catalogObserver = null
let overlayObserver = null

function ensureRevealApi() {
  if (!revealModulePromise) {
    revealModulePromise = import("./reveal-motion.js?v=20260904-edgespread1").then((module) => {
      revealApi = {
        refresh: module.refreshViewportDitherReveals,
        track: module.trackViewportDitherReveal,
        cancel: module.cancelReveal,
      }
      return revealApi
    })
  }
  return revealModulePromise
}

function currentConfig() {
  return boundaryRevealMotionConfig()
}

function activeCatalog() {
  return document.querySelector(".catalog[data-active-filter]")
}

function cardHasRuntimeOwner(card, attribute) {
  return card?.getAttribute?.(attribute) === "true"
}

function isMutedCardBase(card, targetCatalog) {
  return Boolean(
    card?.isConnected &&
    targetCatalog &&
    card.closest(".catalog") === targetCatalog &&
    card.classList.contains("is-filter-muted"),
  )
}

function isMutedCard(card, targetCatalog) {
  return Boolean(
    isMutedCardBase(card, targetCatalog) &&
    !cardHasRuntimeOwner(card, ACTIVE_COLOR_MOTION_ATTRIBUTE) &&
    !cardHasRuntimeOwner(card, ACTIVE_COLOR_COOLDOWN_ATTRIBUTE) &&
    !cardHasRuntimeOwner(card, DITHER_RESIZE_MOTION_ATTRIBUTE),
  )
}

function shouldKeepTrackedCard(card, targetCatalog) {
  return Boolean(
    isMutedCardBase(card, targetCatalog) &&
    !cardHasRuntimeOwner(card, ACTIVE_COLOR_MOTION_ATTRIBUTE) &&
    !cardHasRuntimeOwner(card, ACTIVE_COLOR_COOLDOWN_ATTRIBUTE),
  )
}

function cardSignature(card, finalCanvas, targetCatalog) {
  const image = card.querySelector(".project-media img")
  return [
    finalCanvas.width,
    finalCanvas.height,
    finalCanvas.dataset.publishedMode || "",
    image?.currentSrc || image?.src || "",
    targetCatalog?.dataset.activeFilter || "",
  ].join("|")
}

function viewportHeight() {
  return Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
}

function overlayLooksVisible(overlay) {
  if (!overlay?.isConnected) return false
  if (overlay.style.visibility === "hidden" || overlay.style.opacity === "0") return false
  return true
}

function ensureOverlayObserver() {
  if (overlayObserver || !("IntersectionObserver" in window)) return overlayObserver

  overlayObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const overlay = entry.target
      if (!overlay?.isConnected) {
        visibleOverlays.delete(overlay)
        continue
      }
      if (entry.isIntersecting) visibleOverlays.add(overlay)
      else visibleOverlays.delete(overlay)
    }
  }, {
    root: null,
    rootMargin: "0px",
    threshold: 0,
  })

  return overlayObserver
}

function ownOverlay(overlay) {
  if (!overlay) return
  overlay.dataset.boundaryBreathOwner = OWNER
  if (ownedOverlays.has(overlay)) return

  ownedOverlays.add(overlay)
  const observer = ensureOverlayObserver()
  if (observer) {
    observer.observe(overlay)
    // Seed visibility once so the breathing loop does not wait for the first
    // IntersectionObserver delivery after a freshly-created canvas appears.
    const rect = overlay.getBoundingClientRect()
    if (rect.bottom > 0 && rect.top < viewportHeight()) visibleOverlays.add(overlay)
  }
}

function pruneOverlays() {
  for (const overlay of [...ownedOverlays]) {
    if (overlay?.isConnected && overlay.dataset.boundaryBreathOwner === OWNER) continue
    overlayObserver?.unobserve(overlay)
    ownedOverlays.delete(overlay)
    visibleOverlays.delete(overlay)
  }
}

function forgetCard(card) {
  trackedCards.delete(card)
  trackedSignatures.delete(card)
  const overlay = card?.querySelector?.(
    `.dither-reveal-canvas[data-boundary-breath-owner="${OWNER}"]`,
  )
  if (overlay) {
    overlayObserver?.unobserve(overlay)
    ownedOverlays.delete(overlay)
    visibleOverlays.delete(overlay)
  }
}

function cancelTrackedCard(card) {
  revealApi?.cancel?.(card, { remove: true })
  forgetCard(card)
}

async function migrateCard(card, targetCatalog) {
  if (!isMutedCard(card, targetCatalog)) return false

  const finalCanvas = card.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!finalCanvas || finalCanvas.width < 2 || finalCanvas.height < 2) return false

  const signature = cardSignature(card, finalCanvas, targetCatalog)
  const existing = card.querySelector(".dither-reveal-canvas")
  if (
    trackedSignatures.get(card) === signature &&
    existing?.dataset.boundaryBreathOwner === OWNER
  ) {
    trackedCards.add(card)
    ownOverlay(existing)
    return true
  }

  const api = await ensureRevealApi()
  // Route/filter state may have changed while the dynamic import was resolving.
  if (!isMutedCard(card, targetCatalog)) return false
  const currentCanvas = card.querySelector('.dither-preview-canvas[data-active="true"]')
  if (
    currentCanvas !== finalCanvas ||
    !currentCanvas ||
    currentCanvas.width < 2 ||
    currentCanvas.height < 2
  ) return false

  // trackViewportDitherReveal already cancels the previous state for this card,
  // so a second legacy-cancel pass is unnecessary and could race the scheduler.
  const tracked = api.track(card, currentCanvas, currentConfig())
  if (!tracked) return false

  const overlay = card.querySelector(".dither-reveal-canvas")
  ownOverlay(overlay)
  trackedCards.add(card)
  trackedSignatures.set(card, signature)
  return true
}

async function syncTrackedCards() {
  const targetCatalog = activeCatalog()
  if (!targetCatalog) {
    if (revealApi) {
      for (const card of [...trackedCards]) cancelTrackedCard(card)
    } else {
      trackedCards.clear()
    }
    pruneOverlays()
    return false
  }

  const cards = [...targetCatalog.querySelectorAll(".project-card.is-filter-muted")]
  const keepableCards = new Set(cards.filter((card) => shouldKeepTrackedCard(card, targetCatalog)))
  const mutedCards = cards.filter((card) => isMutedCard(card, targetCatalog))
  if (trackedCards.size) {
    await ensureRevealApi()
    for (const card of [...trackedCards]) {
      if (!keepableCards.has(card) || !card.isConnected) cancelTrackedCard(card)
    }
  }

  let hasTrackedCard = false
  for (const card of mutedCards) {
    if (await migrateCard(card, targetCatalog)) hasTrackedCard = true
  }
  pruneOverlays()
  return hasTrackedCard
}

function hasVisibleBreathingField() {
  pruneOverlays()

  if (overlayObserver) {
    for (const overlay of [...visibleOverlays]) {
      if (overlayLooksVisible(overlay)) return true
      if (!overlay?.isConnected) visibleOverlays.delete(overlay)
    }
    return false
  }

  // IntersectionObserver fallback: only inspect the small set of canvases owned
  // by this runtime rather than querying every reveal canvas each frame.
  const height = viewportHeight()
  for (const overlay of ownedOverlays) {
    if (!overlayLooksVisible(overlay)) continue
    const rect = overlay.getBoundingClientRect()
    if (rect.bottom > 0 && rect.top < height) return true
  }
  return false
}

function clearBreathTimer() {
  if (!breathTimer) return
  window.clearTimeout(breathTimer)
  breathTimer = 0
}

function scheduleBreathLoop(delay = 0) {
  if (breathFrame || breathTimer || document.hidden) return

  if (delay > 0) {
    breathTimer = window.setTimeout(() => {
      breathTimer = 0
      if (!breathFrame && !document.hidden) breathFrame = requestAnimationFrame(breathLoop)
    }, delay)
    return
  }

  breathFrame = requestAnimationFrame(breathLoop)
}

function breathLoop(now) {
  breathFrame = 0
  if (document.hidden || !revealApi) return

  if (!lastBreathDraw || now - lastBreathDraw >= IDLE_FRAME_MS) {
    // Scroll controls WHERE the boundary sits; this advances only TIME so a
    // stationary boundary keeps breathing at 30fps instead of freezing.
    revealApi.refresh({ linger: false })
    lastBreathDraw = now
  }

  if (hasVisibleBreathingField()) scheduleBreathLoop(WATCHDOG_FRAME_MS)
}

function wakeLoopOnly() {
  if (document.hidden || !trackedCards.size) return

  // Scroll can dispatch faster than the dynamic import resolves. Keep one
  // pending wake instead of adding a Promise continuation for every event.
  if (revealApi) {
    clearBreathTimer()
    scheduleBreathLoop()
    return
  }
  if (breathWakeQueued) return

  breathWakeQueued = true
  void ensureRevealApi()
    .then(() => {
      breathWakeQueued = false
      if (document.hidden) return
      // Always allow one frame after input. It refreshes visibility, then stops
      // immediately if no owned reveal canvas is on screen.
      clearBreathTimer()
      scheduleBreathLoop()
    })
    .catch(() => {
      breathWakeQueued = false
    })
}

async function wakeBreathing({ sync = false, refresh = true } = {}) {
  if (document.hidden) return
  await ensureRevealApi()
  if (sync) await syncTrackedCards()
  if (refresh) revealApi.refresh({ linger: false })
  scheduleBreathLoop()
}

function scheduleSync() {
  if (syncFrame) return
  syncFrame = requestAnimationFrame(() => {
    syncFrame = 0
    void wakeBreathing({ sync: true, refresh: true })
  })
}

function handleScroll() {
  // Scroll changes only the reveal boundary. Card ownership and signatures are
  // synchronized by the catalog observer, resize settle, and explicit handoffs.
  // Avoid rescanning every muted card while the viewport is moving.
  wakeLoopOnly()
}

async function syncNow({ refresh = true } = {}) {
  if (document.hidden) return false
  await ensureRevealApi()
  const hasTrackedCard = await syncTrackedCards()
  if (refresh) revealApi.refresh({ linger: false })
  scheduleBreathLoop()
  return hasTrackedCard
}

async function syncCardNow(card, { refresh = true } = {}) {
  if (document.hidden) return false
  const targetCatalog = activeCatalog()
  if (!targetCatalog || !card?.isConnected || card.closest(".catalog") !== targetCatalog) {
    return false
  }

  await ensureRevealApi()
  const tracked = await migrateCard(card, targetCatalog)
  pruneOverlays()
  if (refresh) revealApi.refresh({ linger: false })
  scheduleBreathLoop()
  return tracked
}

async function syncCardOwnershipNow(cards, { refresh = true } = {}) {
  const targetCatalog = activeCatalog()
  await ensureRevealApi()

  let hasTrackedCard = false
  for (const card of cards) {
    if (!isMutedCardBase(card, targetCatalog)) {
      if (trackedCards.has(card)) cancelTrackedCard(card)
      continue
    }
    if (!shouldKeepTrackedCard(card, targetCatalog)) {
      cancelTrackedCard(card)
      continue
    }
    if (!isMutedCard(card, targetCatalog)) continue
    if (await migrateCard(card, targetCatalog)) hasTrackedCard = true
  }

  pruneOverlays()
  if (refresh) revealApi.refresh({ linger: false })
  scheduleBreathLoop()
  return hasTrackedCard
}

function mutedClassChanged(mutation) {
  const target = mutation.target
  if (!(target instanceof Element) || !target.classList.contains("project-card")) return false
  const before = new Set(String(mutation.oldValue || "").split(/\s+/).filter(Boolean))
  return before.has("is-filter-muted") !== target.classList.contains("is-filter-muted")
}

function structuralMutationNeedsSync(mutation) {
  if (mutation.type !== "childList") return false
  const nodes = [...mutation.addedNodes, ...mutation.removedNodes]
  return nodes.some((node) => {
    if (!(node instanceof Element)) return false
    if (node.matches?.(".project-card, .dither-preview-canvas")) return true
    return Boolean(node.querySelector?.(".project-card, .dither-preview-canvas"))
  })
}

function catalogMutationNeedsFullSync(mutation, targetCatalog) {
  if (mutation.type === "childList") return structuralMutationNeedsSync(mutation)
  if (mutation.type !== "attributes") return false
  if (mutation.target === targetCatalog && mutation.attributeName === "data-active-filter") return true
  if (mutation.attributeName === "class") return mutedClassChanged(mutation)
  return false
}

function catalogMutationCardTarget(mutation) {
  if (mutation.type !== "attributes") return null
  if (
    mutation.target instanceof Element &&
    mutation.target.classList.contains("project-card") &&
    (
      mutation.attributeName === ACTIVE_COLOR_MOTION_ATTRIBUTE ||
      mutation.attributeName === ACTIVE_COLOR_COOLDOWN_ATTRIBUTE ||
      mutation.attributeName === DITHER_RESIZE_MOTION_ATTRIBUTE
    )
  ) return mutation.target
  if (mutation.attributeName === "data-active") {
    return mutation.target instanceof Element && mutation.target.classList.contains("dither-preview-canvas")
      ? mutation.target.closest(".project-card")
      : null
  }
  return null
}

function scheduleCardSync(card) {
  if (!card) return
  pendingCardSyncs.add(card)
  if (cardSyncFrame) return

  cardSyncFrame = requestAnimationFrame(() => {
    cardSyncFrame = 0
    const cards = [...pendingCardSyncs]
    pendingCardSyncs.clear()
    void syncCardOwnershipNow(cards)
  })
}

function bindCatalog(nextCatalog) {
  if (catalog === nextCatalog && catalogObserver) return

  catalogObserver?.disconnect()
  catalogObserver = null
  catalog = nextCatalog || null

  if (!catalog || !("MutationObserver" in window)) {
    scheduleSync()
    return
  }

  const boundCatalog = catalog
  catalogObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => catalogMutationNeedsFullSync(mutation, boundCatalog))) {
      scheduleSync()
      return
    }
    for (const mutation of mutations) {
      scheduleCardSync(catalogMutationCardTarget(mutation))
    }
  })
  catalogObserver.observe(catalog, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [
      "class",
      "data-active",
      "data-active-filter",
      ACTIVE_COLOR_MOTION_ATTRIBUTE,
      ACTIVE_COLOR_COOLDOWN_ATTRIBUTE,
      DITHER_RESIZE_MOTION_ATTRIBUTE,
    ],
  })
  scheduleSync()
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
  // main.js replaces the app's top-level page markup on navigation. Nested
  // canvas work is handled by the targeted catalog observer instead.
  appObserver.observe(app, { childList: true, subtree: false })
  bindCatalog(document.querySelector(".catalog"))
}

function scheduleResizeSync() {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    resizeTimer = 0
    scheduleSync()
  }, RESIZE_SYNC_MS)
}

function start() {
  bindApp()

  // Keep the startup retries for slow image/dither creation, but funnel all of
  // them through the same rAF-coalesced targeted sync.
  for (const delay of RETRY_DELAYS) window.setTimeout(scheduleSync, delay)

  if (window.__RED_SCROLL_FRAME__?.subscribe) {
    window.__RED_SCROLL_FRAME__.subscribe(handleScroll, { priority: 50 })
  } else {
    window.addEventListener("scroll", handleScroll, { passive: true })
  }
  window.addEventListener("resize", scheduleResizeSync, { passive: true })
  window.addEventListener("red:motion-config", scheduleSync)
  window.addEventListener("red:hover-binary-return-complete", scheduleSync)
  window.addEventListener("red:home-return-transition", (event) => {
    if (!event.detail?.active) scheduleSync()
  })
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearBreathTimer()
      if (breathFrame) cancelAnimationFrame(breathFrame)
      breathFrame = 0
      return
    }
    scheduleSync()
  })

  window.__RED_BOUNDARY_BREATH__ = {
    version: 10,
    sync: scheduleSync,
    syncNow,
    syncCardNow,
    wake: wakeLoopOnly,
    get trackedCards() { return trackedCards.size },
    get ownedOverlays() { return ownedOverlays.size },
    get visibleOverlays() { return visibleOverlays.size },
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
