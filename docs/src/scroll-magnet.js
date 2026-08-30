const CONFIG = Object.freeze({
  idleMs: 205,
  recentInputMs: 1220,
  suppressAfterUiMs: 760,
  attractionRatio: 0.19,
  minAttractionPx: 78,
  maxAttractionPx: 188,
  snapInsetRatio: 0.047,
  minSnapInsetPx: 16,
  maxSnapInsetPx: 48,
  minDistancePx: 6,
  reverseAllowancePx: 44,
  velocityGatePxMs: 0.062,
  velocityDecayMs: 128,
  springStiffness: 118,
  springDamping: 22.4,
  springMaxSpeedPxS: 920,
  springInitialVelocityLimitPxS: 180,
  settleDistancePx: 0.42,
  settleVelocityPxS: 7,
  maxSpringMs: 1180,
  postSnapSuppressMs: 210,
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

function syncScrollSample({ resetVelocity = false } = {}) {
  lastScrollY = window.scrollY || 0
  lastScrollAt = now()
  if (resetVelocity) lastVelocity = 0
}

function cancelMagnet({ suppress = 0 } = {}) {
  const wasAnimating = Boolean(animationFrame || currentAnimation)
  animationToken += 1
  if (animationFrame) cancelAnimationFrame(animationFrame)
  animationFrame = 0
  delete document.documentElement.dataset.scrollMagnet
  restoreScrollBehavior()
  if (settleTimer) clearTimeout(settleTimer)
  settleTimer = 0
  if (wasAnimating) syncScrollSample({ resetVelocity: true })
  if (suppress > 0) suppressUntil = Math.max(suppressUntil, now() + suppress)
}

function markUserInput(direction = 0) {
  cancelMagnet()
  lastInputAt = now()
  if (direction) lastDirection = Math.sign(direction)
}

function effectiveVelocity() {
  const age = Math.max(0, now() - lastScrollAt)
  return Math.abs(lastVelocity) * Math.exp(-age / CONFIG.velocityDecayMs)
}

function stationTargetY(station) {
  if (!station?.isConnected) return null
  const currentY = window.scrollY || 0
  const rect = station.getBoundingClientRect()
  if (rect.height <= 28 || rect.width <= 8) return null
  const documentTop = currentY + rect.top
  return clamp(documentTop - snapLine(), 0, pageMaxScroll())
}

function animateTo(initialTargetY, station) {
  const startY = window.scrollY || 0
  const initialDistance = initialTargetY - startY
  if (Math.abs(initialDistance) < CONFIG.minDistancePx) return

  const inheritedVelocity = clamp(
    lastVelocity * 1000,
    -CONFIG.springInitialVelocityLimitPxS,
    CONFIG.springInitialVelocityLimitPxS,
  )

  cancelMagnet()
  const token = ++animationToken
  const startedAt = now()
  const previousScrollBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = "auto"

  const animation = {
    token,
    previousScrollBehavior,
    station,
    position: startY,
    velocity: inheritedVelocity,
    lastTime: startedAt,
    targetY: initialTargetY,
  }
  currentAnimation = animation
  document.documentElement.dataset.scrollMagnet = "moving"

  const finish = (targetY) => {
    animationFrame = 0
    const finalY = clamp(targetY, 0, pageMaxScroll())
    window.scrollTo(0, finalY)
    lastScrollY = finalY
    lastVelocity = 0
    lastScrollAt = now()
    lastSnappedElement = station
    lastSnappedY = finalY
    suppressUntil = Math.max(suppressUntil, now() + CONFIG.postSnapSuppressMs)
    delete document.documentElement.dataset.scrollMagnet
    restoreScrollBehavior(animation)
  }

  const frame = (time) => {
    if (token !== animationToken || currentAnimation !== animation) {
      delete document.documentElement.dataset.scrollMagnet
      restoreScrollBehavior(animation)
      return
    }

    const dynamicTarget = stationTargetY(station)
    if (dynamicTarget == null) {
      cancelMagnet({ suppress: 120 })
      return
    }
    animation.targetY = dynamicTarget

    const elapsed = time - startedAt
    const dt = clamp((time - animation.lastTime) / 1000, 1 / 240, 1 / 30)
    animation.lastTime = time

    const displacement = animation.targetY - animation.position
    const acceleration =
      displacement * CONFIG.springStiffness -
      animation.velocity * CONFIG.springDamping

    animation.velocity += acceleration * dt
    animation.velocity = clamp(
      animation.velocity,
      -CONFIG.springMaxSpeedPxS,
      CONFIG.springMaxSpeedPxS,
    )
    animation.position += animation.velocity * dt

    const remaining = animation.targetY - animation.position
    const settled =
      Math.abs(remaining) <= CONFIG.settleDistancePx &&
      Math.abs(animation.velocity) <= CONFIG.settleVelocityPxS

    if (settled || elapsed >= CONFIG.maxSpringMs) {
      finish(animation.targetY)
      return
    }

    window.scrollTo(0, clamp(animation.position, 0, pageMaxScroll()))
    animationFrame = requestAnimationFrame(frame)
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

    const normalizedDistance = distance / Math.max(1, attraction)
    let score = distance * (0.78 + normalizedDistance * 0.22)
    if (oppositeDirection) score += distance * 0.92

    if (
      station === lastSnappedElement &&
      Math.abs(currentY - lastSnappedY) < Math.min(72, attraction * 0.42)
    ) {
      score += attraction * 1.15
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
    lastVelocity = lastVelocity * 0.74 + instantaneous * 0.26
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
    version: 3,
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
