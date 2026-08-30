const CONFIG = Object.freeze({
  idleMs: 168,
  recentInputMs: 1350,
  suppressAfterUiMs: 760,
  attractionRatio: 0.24,
  minAttractionPx: 96,
  maxAttractionPx: 240,
  snapInsetRatio: 0.055,
  minSnapInsetPx: 18,
  maxSnapInsetPx: 58,
  minDistancePx: 10,
  durationMinMs: 360,
  durationMaxMs: 720,
  durationPerPx: 1.05,
  reverseAllowancePx: 64,
  velocityGatePxMs: 0.095,
  velocityDecayMs: 92,
})

const STATION_SELECTORS = [
  ".catalog .project-row",
  ".about-section",
  "#resume",
  ".footer-gallery",
  ".detail-page article > section",
  ".detail-page .framer-case-section",
  ".detail-page .framer-derived-hero",
  ".detail-page .framer-derived-intro",
  ".detail-page .framer-derived-blocks > *",
  ".detail-page .framer-derived-footer",
  ".detail-page .detail-section",
  ".detail-page .detail-block",
].join(",")

let settleTimer = 0
let animationFrame = 0
let animationToken = 0
let lastScrollY = window.scrollY || 0
let lastScrollAt = performance.now()
let lastVelocity = 0
let lastDirection = 0
let lastInputAt = -Infinity
let suppressUntil = 0
let touchY = null
let lastSnappedElement = null
let lastSnappedY = -Infinity
let stationCache = null
let appObserver = null
let currentAnimation = null

function now() {
  return performance.now()
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true
}

function viewportHeight() {
  return Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
}

function pageMaxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - viewportHeight())
}

function headerBottom() {
  const header = document.querySelector(".site-header")
  if (!header) return 0
  const rect = header.getBoundingClientRect()
  return clamp(rect.bottom, 0, viewportHeight() * 0.56)
}

function snapLine() {
  const vh = viewportHeight()
  const inset = clamp(vh * CONFIG.snapInsetRatio, CONFIG.minSnapInsetPx, CONFIG.maxSnapInsetPx)
  return headerBottom() + inset
}

function attractionDistance() {
  const available = Math.max(1, viewportHeight() - headerBottom())
  return clamp(
    available * CONFIG.attractionRatio,
    CONFIG.minAttractionPx,
    CONFIG.maxAttractionPx,
  )
}

function invalidateStations() {
  stationCache = null
}

function isVisibleStation(element) {
  if (!element?.isConnected) return false
  const style = getComputedStyle(element)
  if (style.display === "none" || style.visibility === "hidden") return false
  const rect = element.getBoundingClientRect()
  return rect.height > 28 && rect.width > 8
}

function stations() {
  if (stationCache) return stationCache.filter((element) => element.isConnected)
  const unique = new Set(document.querySelectorAll(STATION_SELECTORS))
  stationCache = [...unique].filter(isVisibleStation)
  return stationCache
}

function nestedScrollableTarget(target, deltaY = 0) {
  if (!(target instanceof Element)) return false
  if (target.closest(".dither-lab, .project-lightbox")) return true

  let node = target
  while (node && node !== document.body && node !== document.documentElement) {
    const style = getComputedStyle(node)
    const overflowY = style.overflowY
    const scrollable = /(auto|scroll|overlay)/.test(overflowY) && node.scrollHeight > node.clientHeight + 2
    if (scrollable) {
      if (deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true
      if (deltaY < 0 && node.scrollTop > 1) return true
      if (deltaY === 0) return true
    }
    node = node.parentElement
  }
  return false
}

function restoreScrollBehavior(animation = currentAnimation) {
  if (!animation) return
  document.documentElement.style.scrollBehavior = animation.previousScrollBehavior
  if (currentAnimation === animation) currentAnimation = null
}

function cancelMagnet({ suppress = 0 } = {}) {
  animationToken += 1
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
  restoreScrollBehavior()
  if (settleTimer) clearTimeout(settleTimer)
  settleTimer = 0
  if (suppress > 0) suppressUntil = Math.max(suppressUntil, now() + suppress)
}

function markUserInput(direction = 0) {
  cancelMagnet()
  lastInputAt = now()
  if (direction) lastDirection = Math.sign(direction)
}

function softMagnetStep(t) {
  const x = clamp(t, 0, 1)
  const x2 = x * x
  const x4 = x2 * x2
  return x4 * (35 + x * (-84 + x * (70 - 20 * x)))
}

function effectiveVelocity() {
  const age = Math.max(0, now() - lastScrollAt)
  return Math.abs(lastVelocity) * Math.exp(-age / CONFIG.velocityDecayMs)
}

function animateTo(targetY, station) {
  const startY = window.scrollY || 0
  const distance = targetY - startY
  if (Math.abs(distance) < CONFIG.minDistancePx) return

  cancelMagnet()
  const token = ++animationToken
  const duration = clamp(
    CONFIG.durationMinMs + Math.abs(distance) * CONFIG.durationPerPx,
    CONFIG.durationMinMs,
    CONFIG.durationMaxMs,
  )
  const startedAt = now()
  const previousScrollBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = "auto"
  currentAnimation = { token, previousScrollBehavior }
  document.documentElement.dataset.scrollMagnet = "moving"

  const frame = (time) => {
    if (token !== animationToken) {
      delete document.documentElement.dataset.scrollMagnet
      restoreScrollBehavior(currentAnimation)
      return
    }

    const progress = clamp((time - startedAt) / duration, 0, 1)
    const eased = softMagnetStep(progress)
    window.scrollTo(0, startY + distance * eased)

    if (progress < 1) {
      animationFrame = requestAnimationFrame(frame)
      return
    }

    animationFrame = 0
    window.scrollTo(0, targetY)
    lastScrollY = targetY
    lastVelocity = 0
    lastScrollAt = now()
    lastSnappedElement = station
    lastSnappedY = targetY
    suppressUntil = Math.max(suppressUntil, now() + 230)
    delete document.documentElement.dataset.scrollMagnet
    restoreScrollBehavior(currentAnimation)
  }

  animationFrame = requestAnimationFrame(frame)
}

function candidateForCurrentPosition() {
  const currentY = window.scrollY || 0
  const line = snapLine()
  const attraction = attractionDistance()
  const maxScroll = pageMaxScroll()
  let best = null

  for (const station of stations()) {
    const rect = station.getBoundingClientRect()
    if (rect.height <= 28 || rect.width <= 8) continue

    const targetY = clamp(currentY + rect.top - line, 0, maxScroll)
    const delta = targetY - currentY
    const distance = Math.abs(delta)
    if (distance < CONFIG.minDistancePx || distance > attraction) continue

    const oppositeDirection = lastDirection !== 0 && Math.sign(delta) !== lastDirection
    if (oppositeDirection && distance > CONFIG.reverseAllowancePx) continue

    let score = distance
    if (oppositeDirection) score += distance * 0.72

    if (
      station === lastSnappedElement &&
      Math.abs(currentY - lastSnappedY) < Math.min(84, attraction * 0.38)
    ) {
      score += attraction
    }

    if (!best || score < best.score) best = { station, targetY, delta, score }
  }

  return best
}

function shouldAttemptSnap() {
  const time = now()
  if (reducedMotion()) return false
  if (document.hidden) return false
  if (time < suppressUntil) return false
  if (time - lastInputAt > CONFIG.recentInputMs) return false
  if (effectiveVelocity() > CONFIG.velocityGatePxMs) return false
  if (document.body.style.overflow === "hidden") return false
  if (document.querySelector(".catalog[data-filter-phase]")) return false
  return true
}

function attemptSnap() {
  settleTimer = 0
  if (!shouldAttemptSnap()) {
    if (now() - lastInputAt <= CONFIG.recentInputMs && effectiveVelocity() > CONFIG.velocityGatePxMs) {
      scheduleSettle()
    }
    return
  }
  const candidate = candidateForCurrentPosition()
  if (!candidate) return
  animateTo(candidate.targetY, candidate.station)
}

function scheduleSettle() {
  if (reducedMotion() || document.hidden) return
  clearTimeout(settleTimer)
  settleTimer = window.setTimeout(attemptSnap, CONFIG.idleMs)
}

function handleScroll() {
  if (animationFrame) return
  const time = now()
  const y = window.scrollY || 0
  const delta = y - lastScrollY
  const dt = Math.max(1, time - lastScrollAt)
  if (Math.abs(delta) > 0.25) {
    lastDirection = Math.sign(delta)
    const instantaneous = delta / dt
    lastVelocity = lastVelocity * 0.68 + instantaneous * 0.32
  }
  lastScrollY = y
  lastScrollAt = time
  scheduleSettle()
}

function handleWheel(event) {
  if (nestedScrollableTarget(event.target, event.deltaY)) {
    cancelMagnet({ suppress: 120 })
    return
  }
  markUserInput(event.deltaY)
}

function handleTouchStart(event) {
  cancelMagnet()
  lastInputAt = now()
  touchY = event.touches?.[0]?.clientY ?? null
}

function handleTouchMove(event) {
  const nextY = event.touches?.[0]?.clientY
  if (!Number.isFinite(nextY)) return
  if (Number.isFinite(touchY)) {
    const fingerDelta = touchY - nextY
    if (Math.abs(fingerDelta) > 0.5) lastDirection = Math.sign(fingerDelta)
  }
  touchY = nextY
  lastInputAt = now()
}

function handleTouchEnd() {
  touchY = null
  scheduleSettle()
}

function handleKeyDown(event) {
  const tag = document.activeElement?.tagName
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.activeElement?.isContentEditable) return

  const key = event.key
  if (key === "Home" || key === "End") {
    cancelMagnet({ suppress: 650 })
    return
  }

  const down = key === "ArrowDown" || key === "PageDown" || (key === " " && !event.shiftKey)
  const up = key === "ArrowUp" || key === "PageUp" || (key === " " && event.shiftKey)
  if (down || up) markUserInput(down ? 1 : -1)
}

function handlePointerDown(event) {
  if (event.pointerType === "mouse") return
  cancelMagnet()
}

function handleUiClick(event) {
  if (event.target.closest?.("a, button, [role='button']")) {
    cancelMagnet({ suppress: CONFIG.suppressAfterUiMs })
  }
}

function bindMutationObserver() {
  const app = document.querySelector("#app")
  if (!app || !("MutationObserver" in window)) return
  appObserver?.disconnect()
  appObserver = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.type === "childList")) invalidateStations()
  })
  appObserver.observe(app, { childList: true, subtree: true })
}

function boot() {
  if (window.__RED_SCROLL_MAGNET__?.version) return
  lastScrollY = window.scrollY || 0
  lastScrollAt = now()
  bindMutationObserver()

  window.addEventListener("scroll", handleScroll, { passive: true })
  window.addEventListener("wheel", handleWheel, { passive: true, capture: true })
  window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true })
  window.addEventListener("touchmove", handleTouchMove, { passive: true, capture: true })
  window.addEventListener("touchend", handleTouchEnd, { passive: true, capture: true })
  window.addEventListener("pointerdown", handlePointerDown, { passive: true, capture: true })
  window.addEventListener("keydown", handleKeyDown, { passive: true })
  window.addEventListener("click", handleUiClick, { passive: true, capture: true })
  window.addEventListener("resize", () => {
    invalidateStations()
    cancelMagnet({ suppress: 180 })
  }, { passive: true })
  window.addEventListener("hashchange", () => cancelMagnet({ suppress: 780 }))
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelMagnet()
  })

  window.__RED_SCROLL_MAGNET__ = {
    version: 2,
    config: CONFIG,
    refresh: invalidateStations,
    snap: attemptSnap,
    cancel: cancelMagnet,
    stations: () => [...stations()],
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}
