const ACTIVE_WINDOW_MS = 900

let frame = 0
let activeUntil = 0
let lastLogo = ""
let lastHeader = ""

function syncLayoutSurface() {
  frame = 0
  const header = document.querySelector(".site-header")
  if (!header) return

  const root = document.documentElement
  const logo = header.style.getPropertyValue("--logo-size").trim()
  const height = header.style.getPropertyValue("--header-height").trim()

  if (logo && logo !== lastLogo) {
    lastLogo = logo
    root.style.setProperty("--perf-layout-logo-size", logo)
  }
  if (height && height !== lastHeader) {
    lastHeader = height
    root.style.setProperty("--perf-layout-header-height", height)
  }

  if (performance.now() < activeUntil) frame = requestAnimationFrame(syncLayoutSurface)
}

function wakeLayoutSurface() {
  activeUntil = Math.max(activeUntil, performance.now() + ACTIVE_WINDOW_MS)
  if (!frame) frame = requestAnimationFrame(syncLayoutSurface)
}

window.addEventListener("scroll", wakeLayoutSurface, { passive: true })
window.addEventListener("resize", wakeLayoutSurface, { passive: true })
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
