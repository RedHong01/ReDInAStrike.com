import { PUBLISHED_MOTION_CONFIG, sanitizeMotionConfig } from "./motion-default.js"

const OWNER = "breath3"
const IDLE_FRAME_MS = 1000 / 30
const RETRY_DELAYS = [0, 80, 220, 520, 1000, 1800]

const trackedSignatures = new WeakMap()
const legacyCancelledCards = new WeakSet()
let breathFrame = 0
let syncFrame = 0
let lastBreathDraw = 0
let revealModulePromise = null
let revealApi = null
let legacyRevealApi = null

function ensureRevealApi() {
  if (!revealModulePromise) {
    // Capture the scheduler's currently loaded reveal instance first. The new
    // cache-busted module will replace window.__RED_REVEAL_MOTION__ afterwards.
    legacyRevealApi = window.__RED_REVEAL_MOTION__ || null
    revealModulePromise = import("./reveal-motion.js?v=20260830-breath3").then((module) => {
      revealApi = {
        refresh: module.refreshViewportDitherReveals,
        track: module.trackViewportDitherReveal,
      }
      return revealApi
    })
  }
  return revealModulePromise
}

function currentConfig() {
  const base = sanitizeMotionConfig(
    window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG,
  )
  return {
    ...base,
    // Frequency remains slow; this only increases how legible the breathing is
    // while the scroll position itself is perfectly still.
    revealNoiseFlicker: Math.max(base.revealNoiseFlicker, 0.82),
  }
}

function activeCatalog() {
  return document.querySelector(".catalog[data-active-filter]")
}

function isMutedCard(card, catalog) {
  return Boolean(
    card?.isConnected &&
    catalog &&
    card.closest(".catalog") === catalog &&
    card.classList.contains("is-filter-muted"),
  )
}

function cardSignature(card, finalCanvas) {
  const image = card.querySelector(".project-media img")
  return [
    finalCanvas.width,
    finalCanvas.height,
    finalCanvas.dataset.publishedMode || "",
    image?.currentSrc || image?.src || "",
    activeCatalog()?.dataset.activeFilter || "",
  ].join("|")
}

async function migrateCard(card, catalog) {
  if (!isMutedCard(card, catalog)) return false
  const finalCanvas = card.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!finalCanvas || finalCanvas.width < 2 || finalCanvas.height < 2) return false

  const signature = cardSignature(card, finalCanvas)
  const existing = card.querySelector(".dither-reveal-canvas")
  if (
    trackedSignatures.get(card) === signature &&
    existing?.dataset.boundaryBreathOwner === OWNER
  ) {
    return true
  }

  const api = await ensureRevealApi()

  // Retire the old cached module's state before the new overlay is created.
  // Otherwise its next RAF can see its old canvas detached and accidentally
  // remove the newly-created canvas while cleaning itself up.
  if (!legacyCancelledCards.has(card) && legacyRevealApi?.cancel) {
    legacyRevealApi.cancel(card, { remove: true })
    legacyCancelledCards.add(card)
  }

  const tracked = api.track(card, finalCanvas, currentConfig())
  if (!tracked) return false

  const overlay = card.querySelector(".dither-reveal-canvas")
  if (overlay) overlay.dataset.boundaryBreathOwner = OWNER
  trackedSignatures.set(card, signature)
  return true
}

async function syncTrackedCards() {
  const catalog = activeCatalog()
  if (!catalog) return false

  let hasTrackedCard = false
  for (const card of catalog.querySelectorAll(".project-card")) {
    if (await migrateCard(card, catalog)) hasTrackedCard = true
  }
  return hasTrackedCard
}

function viewportRange() {
  const bottom = Math.max(
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
  )
  const header = document.querySelector(".site-header")
  const top = Math.max(0, Math.min(bottom, header?.getBoundingClientRect?.().bottom || 0))
  return { top, bottom }
}

function hasVisibleBreathingField() {
  const { top, bottom } = viewportRange()
  for (const overlay of document.querySelectorAll(
    `.dither-reveal-canvas[data-boundary-breath-owner="${OWNER}"]`,
  )) {
    if (!overlay.isConnected) continue
    if (overlay.style.visibility === "hidden" || overlay.style.opacity === "0") continue
    const rect = overlay.getBoundingClientRect()
    if (rect.bottom > top && rect.top < bottom) return true
  }
  return false
}

function breathLoop(now) {
  breathFrame = 0
  if (document.hidden || !revealApi) return

  if (!lastBreathDraw || now - lastBreathDraw >= IDLE_FRAME_MS) {
    // Scroll determines WHERE the boundary is. This call advances only TIME,
    // so a stationary boundary keeps breathing instead of freezing.
    revealApi.refresh({ linger: false })
    lastBreathDraw = now
  }

  if (hasVisibleBreathingField()) {
    breathFrame = requestAnimationFrame(breathLoop)
  }
}

async function wakeBreathing({ sync = true } = {}) {
  if (document.hidden) return
  await ensureRevealApi()
  if (sync) await syncTrackedCards()
  revealApi.refresh({ linger: false })
  if (!breathFrame) breathFrame = requestAnimationFrame(breathLoop)
}

function scheduleSync() {
  if (syncFrame) return
  syncFrame = requestAnimationFrame(() => {
    syncFrame = 0
    void wakeBreathing({ sync: true })
  })
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      if (mutation.addedNodes.length || mutation.removedNodes.length) {
        scheduleSync()
        return
      }
    }
    if (mutation.type === "attributes") {
      scheduleSync()
      return
    }
  }
})

function start() {
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "data-active", "data-active-filter"],
  })

  for (const delay of RETRY_DELAYS) {
    window.setTimeout(() => void wakeBreathing({ sync: true }), delay)
  }

  window.addEventListener("scroll", () => void wakeBreathing({ sync: true }), { passive: true })
  window.addEventListener("resize", () => void wakeBreathing({ sync: true }), { passive: true })
  window.addEventListener("red:motion-config", () => scheduleSync())
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void wakeBreathing({ sync: true })
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
