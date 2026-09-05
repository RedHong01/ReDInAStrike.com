const HEADER_WINDOW_MS = 360
const HOME_RETURN_WINDOW_MS = 920
const IDLE_TAIL_MS = 90
const LAYOUT_SMOOTH_RATE = 18
const LAYOUT_LOGO_SYNC_EPSILON_PX = 0.1
const LAYOUT_HEADER_SYNC_EPSILON_PX = 0.1
const LAYOUT_SETTLE_EPSILON_PX = 0.001
const LAYOUT_LOGO_GEOMETRY_EPSILON_PX = 2

let frame = 0
let activeUntil = 0
let header = null
let smoothLogoPx = NaN
let smoothHeaderPx = NaN
let lastSurfaceLogoPx = NaN
let lastSurfaceHeaderPx = NaN
let lastGeometryLogoPx = NaN
let lastSyncAt = 0

function parsePx(value) {
  const next = Number.parseFloat(value)
  return Number.isFinite(next) ? next : NaN
}

function blend(current, target, dtMs) {
  const dt = Math.min(0.05, Math.max(0, dtMs))
  return current + (target - current) * (1 - Math.exp(-LAYOUT_SMOOTH_RATE * dt))
}

function headerMotionActive() {
  const root = document.documentElement
  if (root.dataset.homeReturnTransition || root.dataset.headerMotion === "moving") return true
  const api = window.__RED_HEADER_MOTION__
  if (api && typeof api.snapshot === "function") {
    try { return Boolean(api.snapshot()?.moving) } catch {}
  }
  return false
}

function syncLayoutSurface() {
  frame = 0
  if (!header?.isConnected) header = document.querySelector(".site-header")
  if (!header) return

  const now = performance.now()
  const root = document.documentElement
  const inlineLogo = header.style.getPropertyValue("--logo-size")
  const inlineHeight = header.style.getPropertyValue("--header-height")
  const computed = inlineLogo && inlineHeight ? null : getComputedStyle(header)
  const logoTarget = parsePx(inlineLogo || computed?.getPropertyValue("--logo-size"))
  const heightTarget = parsePx(inlineHeight || computed?.getPropertyValue("--header-height"))
  const dtMs = lastSyncAt ? now - lastSyncAt : 16
  lastSyncAt = now
  let settled = true

  if (Number.isFinite(logoTarget)) {
    if (!Number.isFinite(smoothLogoPx)) smoothLogoPx = logoTarget
    smoothLogoPx = blend(smoothLogoPx, logoTarget, dtMs)
    const delta = Math.abs(logoTarget - smoothLogoPx)
    if (delta <= LAYOUT_SETTLE_EPSILON_PX) smoothLogoPx = logoTarget
    settled = settled && delta <= LAYOUT_SETTLE_EPSILON_PX
    const value = `${smoothLogoPx.toFixed(2)}px`
    const valuePx = parsePx(value)
    if (!Number.isFinite(lastSurfaceLogoPx) || Math.abs(valuePx - lastSurfaceLogoPx) > LAYOUT_LOGO_SYNC_EPSILON_PX) {
      lastSurfaceLogoPx = valuePx
      root.style.setProperty("--perf-layout-logo-size", value)
      if (!Number.isFinite(lastGeometryLogoPx) || Math.abs(valuePx - lastGeometryLogoPx) >= LAYOUT_LOGO_GEOMETRY_EPSILON_PX) {
        lastGeometryLogoPx = valuePx
        window.dispatchEvent(new Event("red:layout-geometry-invalidated"))
      }
    }
  }

  if (Number.isFinite(heightTarget)) {
    if (!Number.isFinite(smoothHeaderPx)) smoothHeaderPx = heightTarget
    smoothHeaderPx = blend(smoothHeaderPx, heightTarget, dtMs)
    const delta = Math.abs(heightTarget - smoothHeaderPx)
    if (delta <= LAYOUT_SETTLE_EPSILON_PX) smoothHeaderPx = heightTarget
    settled = settled && delta <= LAYOUT_SETTLE_EPSILON_PX
    const value = `${smoothHeaderPx.toFixed(2)}px`
    const valuePx = parsePx(value)
    if (!Number.isFinite(lastSurfaceHeaderPx) || Math.abs(valuePx - lastSurfaceHeaderPx) > LAYOUT_HEADER_SYNC_EPSILON_PX) {
      lastSurfaceHeaderPx = valuePx
      root.style.setProperty("--perf-layout-header-height", value)
    }
  }

  if (headerMotionActive() || !settled) activeUntil = Math.max(activeUntil, now + IDLE_TAIL_MS)
  if (now < activeUntil) frame = requestAnimationFrame(syncLayoutSurface)
}

function wakeLayoutSurface(event) {
  const detail = event?.detail || null
  const duration = detail?.active ? HOME_RETURN_WINDOW_MS : detail?.moving || headerMotionActive() ? HEADER_WINDOW_MS : IDLE_TAIL_MS
  activeUntil = Math.max(activeUntil, performance.now() + duration)
  if (!frame) frame = requestAnimationFrame(syncLayoutSurface)
}

function wakeLayoutSurfaceFromScroll() {
  if (headerMotionActive()) wakeLayoutSurface()
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
document.addEventListener("visibilitychange", () => { if (!document.hidden) wakeLayoutSurface() })
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wakeLayoutSurface, { once: true })
else wakeLayoutSurface()
window.__RED_LAYOUT_SURFACE_SYNC__ = { wake: wakeLayoutSurface, get active() { return Boolean(frame) } }
