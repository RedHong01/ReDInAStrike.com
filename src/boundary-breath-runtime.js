import {
  refreshViewportDitherReveals,
  trackViewportDitherReveal,
} from "./reveal-motion.js?v=20260830-breath2"
import { PUBLISHED_MOTION_CONFIG, sanitizeMotionConfig } from "./motion-default.js"

const OWNER = "breath2"
const IDLE_FRAME_MS = 1000 / 30
const RETRY_DELAYS = [0, 80, 220, 520, 1000, 1800]

const trackedSignatures = new WeakMap()
let breathFrame = 0
let syncFrame = 0
let lastBreathDraw = 0

function currentConfig() {
  const base = sanitizeMotionConfig(
    window.__RED_MOTION_CONFIG__ || PUBLISHED_MOTION_CONFIG,
  )
  return {
    ...base,
    // Keep the motion slow, but make the breathing visible enough to read
    // while the page itself is completely still.
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

function migrateCard(card, catalog) {
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

  const tracked = trackViewportDitherReveal(
    card,
    finalCanvas,
    currentConfig(),
  )
  if (!tracked) return false

  const overlay = card.querySelector(".dither-reveal-canvas")
  if (overlay) overlay.dataset.boundaryBreathOwner = OWNER
  trackedSignatures.set(card, signature)
  return true
}

function syncTrackedCards() {
  const catalog = activeCatalog()
  if (!catalog) return false

  let hasTrackedCard = false
  for (const card of catalog.querySelectorAll(".project-card")) {
    if (migrateCard(card, catalog)) hasTrackedCard = true
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
  if (document.hidden) return

  if (!lastBreathDraw || now - lastBreathDraw >= IDLE_FRAME_MS) {
    // Scroll defines WHERE the snow boundary sits. This refresh supplies the
    // independent time axis, so the same boundary keeps breathing at rest.
    refreshViewportDitherReveals({ linger: false })
    lastBreathDraw = now
  }

  if (hasVisibleBreathingField()) {
    breathFrame = requestAnimationFrame(breathLoop)
  }
}

function wakeBreathing({ sync = true } = {}) {
  if (document.hidden) return
  if (sync) syncTrackedCards()
  refreshViewportDitherReveals({ linger: false })
  if (!breathFrame) breathFrame = requestAnimationFrame(breathLoop)
}

function scheduleSync() {
  if (syncFrame) return
  syncFrame = requestAnimationFrame(() => {
    syncFrame = 0
    wakeBreathing({ sync: true })
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
    window.setTimeout(() => wakeBreathing({ sync: true }), delay)
  }

  window.addEventListener("scroll", () => wakeBreathing({ sync: true }), { passive: true })
  window.addEventListener("resize", () => wakeBreathing({ sync: true }), { passive: true })
  window.addEventListener("red:motion-config", () => scheduleSync())
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) wakeBreathing({ sync: true })
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
