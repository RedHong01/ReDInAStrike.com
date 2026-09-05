const HEADER_WINDOW_MS = 360
const HOME_RETURN_WINDOW_MS = 920
const IDLE_TAIL_MS = 90
const LAYOUT_LOGO_SMOOTH_RATE = 18
const LAYOUT_LOGO_SYNC_EPSILON_PX = 0.02
const LAYOUT_LOGO_SETTLE_EPSILON_PX = 0.001
const LAYOUT_LOGO_GEOMETRY_EPSILON_PX = 0.5

let frame = 0
let activeUntil = 0
let smoothLogoPx = NaN
let lastSurfaceLogoPx = NaN
let lastGeometryLogoPx = NaN
let lastSyncAt = 0

function parseLogoValue(value) {
  const next = Number.parseFloat(value)
  return Number.isFinite(next) ? next : NaN
}

function blendLinear(current, target, dtMs) {
  const dt = Math.min(0.05, Math.max(0, dtMs))
  const weight = 1 - Math.exp(-LAYOUT_LOGO_SMOOTH_RATE * dt)
  return current + (target - current) * weight
}

function headerMotionActive() {
  if (document.documentElement.dataset.homeReturnTransition) return true
  const api = window.__RED_HEADER_MOTION__
  if (api && typeof api.snapshot === "function") {
    try {
      if (api.snapshot()?.moving) return true
    } catch {}
  }
  return document.documentElement.dataset.headerMotion === "moving"
}

function syncLayoutSurface() {
  frame = 0
  const header = document.querySelector(".site-header")
  if (!header) return

  const now = performance.now()
  const root = document.documentElement
  const headerInlineLogo = header.style.getPropertyValue("--logo-size")
  const logoText = headerInlineLogo || getComputedStyle(header).getPropertyValue("--logo-size")
  const nextLogoPx = parseLogoValue(logoText)
  let logoSettled = true

  // Keep the layout proxy behind the painted header value so content width
  // changes continuously instead of following the prelude's coarse buckets.
  if (Number.isFinite(nextLogoPx)) {
    const dtMs = lastSyncAt ? now - lastSyncAt : 16
    lastSyncAt = now

    if (!Number.isFinite(smoothLogoPx)) smoothLogoPx = nextLogoPx
    smoothLogoPx = blendLinear(smoothLogoPx, nextLogoPx, dtMs / 1000)
    const logoDelta = Math.abs(nextLogoPx - smoothLogoPx)
    if (logoDelta <= LAYOUT_LOGO_SETTLE_EPSILON_PX) smoothLogoPx = nextLogoPx
    logoSettled = logoDelta <= LAYOUT_LOGO_SETTLE_EPSILON_PX

    const nextLogo = `${smoothLogoPx.toFixed(2)}px`
    const nextLogoPxRounded = parseLogoValue(nextLogo)
    if (
      !Number.isFinite(lastSurfaceLogoPx) ||
      Math.abs(nextLogoPxRounded - lastSurfaceLogoPx) > LAYOUT_LOGO_SYNC_EPSILON_PX
    ) {
      lastSurfaceLogoPx = nextLogoPxRounded
      root.style.setProperty("--perf-layout-logo-size", nextLogo)

      // Rows cached by performance-prelude contain their width and height.
      // Invalidate them after a material horizontal change so boundary reads
      // cannot keep using geometry from the previous content width.
      if (
        !Number.isFinite(lastGeometryLogoPx) ||
        Math.abs(nextLogoPxRounded - lastGeometryLogoPx) >= LAYOUT_LOGO_GEOMETRY_EPSILON_PX
      ) {
        lastGeometryLogoPx = nextLogoPxRounded
        window.dispatchEvent(new Event("red:layout-geometry-invalidated"))
      }
    }
  }

  if (headerMotionActive() || !logoSettled) activeUntil = Math.max(activeUntil, now + IDLE_TAIL_MS)
  if (now < activeUntil) frame = requestAnimationFrame(syncLayoutSurface)
}

function wakeLayoutSurface(event) {
  const detail = event?.detail || null
  const duration = detail?.active
    ? HOME_RETURN_WINDOW_MS
    : detail?.moving || headerMotionActive()
      ? HEADER_WINDOW_MS
      : IDLE_TAIL_MS
  activeUntil = Math.max(activeUntil, performance.now() + duration)
  if (!frame) frame = requestAnimationFrame(syncLayoutSurface)
}

function wakeLayoutSurfaceFromScroll() {
  if (!headerMotionActive()) return
  wakeLayoutSurface()
}

if (window.__RED_SCROLL_FRAME__?.subscribe) {
  window.__RED_SCROLL_FRAME__.subscribe((snapshot) => {
    if (snapshot.windowScroll) wakeLayoutSurfaceFromScroll()
  }, { priority: 60 })
} else {
  window.addEventListener("scroll", wakeLayoutSurfaceFromScroll, { passive: true })
}
window.addEventListener("resize", wakeLayoutSurface, { passive: true })
window.addEventListener("red:header-motion", wakeLayoutSurface)
window.addEventListener("red:home-return-transition", wakeLayoutSurface)
window.addEventListener("hashchange", wakeLayoutSurface, { passive: true })

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) wakeLayoutSurface()
})

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wakeLayoutSurface, { once: true })
} else {
  wakeLayoutSurface()
}

window.__RED_LAYOUT_SURFACE_SYNC__ = {
  wake: wakeLayoutSurface,
  get active() { return Boolean(frame) },
}
