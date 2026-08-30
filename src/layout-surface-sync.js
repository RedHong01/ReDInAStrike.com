const HEADER_WINDOW_MS = 360
const HOME_RETURN_WINDOW_MS = 920
const IDLE_TAIL_MS = 90

let frame = 0
let activeUntil = 0
let lastLogo = ""

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
  const logo = header.style.getPropertyValue("--logo-size").trim()

  // The performance prelude deliberately keeps its own header-height geometry
  // cache. Only refine the horizontal logo/layout proxy here; leave the header
  // height proxy under the prelude's ownership so synthetic rect math stays exact.
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

window.addEventListener("scroll", wakeLayoutSurfaceFromScroll, { passive: true })
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
