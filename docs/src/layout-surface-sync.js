const HEADER_WINDOW_MS = 360
const HOME_RETURN_WINDOW_MS = 920
const IDLE_TAIL_MS = 90

let frame = 0
let activeUntil = 0
let header = null
let lastLogo = ""

function headerMotionActive() {
  const root = document.documentElement
  if (root.dataset.homeReturnTransition) return true
  if (root.dataset.headerMotion === "moving") return true
  const api = window.__RED_HEADER_MOTION__
  if (api && typeof api.snapshot === "function") {
    try {
      if (api.snapshot()?.moving) return true
    } catch {}
  }
  return false
}

function syncLayoutSurface() {
  frame = 0
  if (!header?.isConnected) header = document.querySelector(".site-header")
  if (!header) return

  const now = performance.now()
  const root = document.documentElement
  const headerInlineLogo = header.style.getPropertyValue("--logo-size")
  const logoText = headerInlineLogo || getComputedStyle(header).getPropertyValue("--logo-size")
  const logo = logoText.trim()

  // Keep the layout proxy behind the painted header value so content width
  // changes continuously instead of following the prelude's coarse buckets.
  // Keep the layout proxy in lockstep with the painted header value. The
  // inline style is present during header motion; computed style covers the
  // initial frame before the header controller has written one.
  if (logo && logo !== lastLogo) {
    lastLogo = logo
    root.style.setProperty("--perf-layout-logo-size", logo)
  }

  if (headerMotionActive()) activeUntil = Math.max(activeUntil, now + IDLE_TAIL_MS)
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
