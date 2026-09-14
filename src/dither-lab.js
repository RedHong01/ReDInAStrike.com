import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js?v=20260905-perf1"
import "./native-halftone-bypass.js?v=20260905-perf1"
import "./layout-surface-sync.js?v=20260905-perf1"

const params = new URLSearchParams(window.location.search)
const autoOpen =
  params.get("ditherHub") === "1" ||
  params.has("ditherConfig") ||
  params.has("motionConfig") ||
  params.has("activeColorConfig")
const publishedNeedsRuntime = PUBLISHED_DITHER_CONFIG?.mode && PUBLISHED_DITHER_CONFIG.mode !== "native"
const FILTER_CATEGORIES = new Set(["game", "ongoing", "interaction", "graphic"])

let productionPromise = null
let productionModule = null
let productionLoaded = false
let corePromise = null
let coreLoaded = false
let coreRequested = false
let cssPromise = null
let replayingFilterClick = false
let idleWarmHandle = 0

function activeCatalog() {
  return document.querySelector(".catalog")
}

function isFilterNavItem(node) {
  const item = node?.closest?.(".nav-item[data-nav-category]")
  if (!item) return null
  return FILTER_CATEGORIES.has(item.dataset.navCategory || "") ? item : null
}

function ensureCss() {
  if (cssPromise) return cssPromise
  const existing = [...document.styleSheets]
    .map((sheet) => sheet.href || "")
    .find((href) => href.endsWith("/dither-lab.css") || href.endsWith("dither-lab.css"))
  if (existing) {
    cssPromise = Promise.resolve()
    return cssPromise
  }

  cssPromise = new Promise((resolve) => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = new URL("./dither-lab.css", import.meta.url).href
    link.addEventListener("load", resolve, { once: true })
    link.addEventListener("error", resolve, { once: true })
    document.head.appendChild(link)
  })
  return cssPromise
}

async function loadProductionRuntime() {
  if (!publishedNeedsRuntime || coreRequested || coreLoaded) return null
  if (!activeCatalog()) return null
  if (!productionPromise) {
    productionPromise = import("./dither-production-runtime.js?v=20260908-perf2")
      .then((module) => {
        productionModule = module
        productionLoaded = true
        return module
      })
      .catch((error) => {
        productionPromise = null
        throw error
      })
  }
  return productionPromise
}

function destroyProductionRuntime() {
  productionModule?.destroyPublicDitherRuntime?.()
  window.__RED_DITHER_PUBLIC_RUNTIME__?.destroy?.()
}

function cancelIdleWarmup() {
  if (!idleWarmHandle) return
  if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleWarmHandle)
  else window.clearTimeout(idleWarmHandle)
  idleWarmHandle = 0
}

async function loadCore() {
  if (!corePromise) {
    coreRequested = true
    cancelIdleWarmup()
    corePromise = (async () => {
      // If intent prewarming was already in flight, let it finish and then
      // tear it down before the developer hub takes ownership.
      if (productionPromise) {
        try { await productionPromise } catch {}
      }
      window.__RED_NATIVE_HALFTONE_BYPASS__?.destroy?.()
      destroyProductionRuntime()
      await ensureCss()
      const module = await import("./dither-hub-entry.js?v=20260905-perf1")
      coreLoaded = true
      return module
    })()
  }
  return corePromise
}

function warmProductionRuntime() {
  idleWarmHandle = 0
  if (coreRequested || coreLoaded || productionLoaded || !publishedNeedsRuntime || !activeCatalog()) return
  loadProductionRuntime().catch(() => {})
}

function scheduleIdleWarmup() {
  if (autoOpen || coreRequested || coreLoaded || productionLoaded || idleWarmHandle || !publishedNeedsRuntime) return
  if (!activeCatalog()) return
  if ("requestIdleCallback" in window) {
    idleWarmHandle = window.requestIdleCallback(warmProductionRuntime, { timeout: 2400 })
  } else {
    idleWarmHandle = window.setTimeout(warmProductionRuntime, 1400)
  }
}

function startRuntimeFromIntent(event) {
  if (!isFilterNavItem(event.target)) return
  loadProductionRuntime().catch(() => {})
}

function gateFirstFilterClick(event) {
  if (replayingFilterClick || coreRequested || coreLoaded || productionLoaded || !publishedNeedsRuntime) return
  const item = isFilterNavItem(event.target)
  if (!item || !activeCatalog()) return

  // The filter motion listeners live in the deferred graph. On an immediate
  // first click (especially touch, where there is no hover prewarm), hold that
  // single click until the graph is ready, then replay it. main.js explicitly
  // ignores defaultPrevented clicks, so the state machine cannot start halfway
  // through initialization.
  event.preventDefault()
  event.stopImmediatePropagation()

  loadProductionRuntime()
    .catch(() => null)
    .then(() => {
      if (!item.isConnected) return
      replayingFilterClick = true
      try {
        item.click()
      } finally {
        replayingFilterClick = false
      }
    })
}

if (!publishedNeedsRuntime) {
  window.__RED_DITHER_PUBLIC_RUNTIME__?.destroy?.()
} else if (autoOpen) {
  loadCore()
} else {
  // Pointer/focus intent usually hides all network latency before activation.
  document.addEventListener("pointerover", startRuntimeFromIntent, { passive: true, capture: true })
  document.addEventListener("pointerdown", startRuntimeFromIntent, { passive: true, capture: true })
  document.addEventListener("focusin", startRuntimeFromIntent, { passive: true, capture: true })
  document.addEventListener("click", gateFirstFilterClick, { capture: true })

  // A URL/state restore may already have selected a category before this module
  // executes. In that case there is no reason to wait for user intent.
  if (document.querySelector(".catalog[data-active-filter]")) loadProductionRuntime().catch(() => {})

  if (document.readyState === "complete") scheduleIdleWarmup()
  else window.addEventListener("load", scheduleIdleWarmup, { once: true, passive: true })
}

window.addEventListener("keydown", async (event) => {
  if (coreLoaded) return
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const tag = document.activeElement?.tagName
  const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
  if (typing || !event.shiftKey || event.key.toLowerCase() !== "d") return

  event.preventDefault()
  await loadCore()
  requestAnimationFrame(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", {
      key: "d",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }))
  })
}, { passive: false })
