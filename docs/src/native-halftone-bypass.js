import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"

const generated = Boolean(PUBLISHED_DITHER_CONFIG?.mode && PUBLISHED_DITHER_CONFIG.mode !== "native")
const BYPASSED_CLASS = "project-halftone-bypassed"
const BYPASSED_ATTRIBUTE = "data-red-native-halftone-bypassed"
let catalog = null
let catalogObserver = null
let appObserver = null
let enabled = generated

function bypassNativeHalftones(root = document) {
  if (!enabled || !root?.querySelectorAll) return 0
  const canvases = [...root.querySelectorAll(".project-halftone")]
  canvases.forEach((canvas) => {
    canvas.classList.remove("project-halftone")
    canvas.classList.add(BYPASSED_CLASS)
    canvas.setAttribute(BYPASSED_ATTRIBUTE, "true")
    canvas.style.display = "none"
  })
  return canvases.length
}

function restoreNativeHalftones(root = document) {
  if (!root?.querySelectorAll) return 0
  const canvases = [...root.querySelectorAll(`.${BYPASSED_CLASS}[${BYPASSED_ATTRIBUTE}]`)]
  canvases.forEach((canvas) => {
    canvas.classList.remove(BYPASSED_CLASS)
    canvas.classList.add("project-halftone")
    canvas.removeAttribute(BYPASSED_ATTRIBUTE)
    canvas.style.removeProperty("display")
  })
  return canvases.length
}

function bindCatalog(nextCatalog) {
  if (!enabled) return
  if (catalog === nextCatalog && catalogObserver) {
    bypassNativeHalftones(catalog)
    return
  }
  catalogObserver?.disconnect()
  catalogObserver = null
  catalog = nextCatalog || null
  if (!catalog) return

  // Bypass in the MutationObserver microtask, before main.js's queued native-halftone
  // rAF paints work that is hidden by the public Floyd renderer. Keep the actual
  // canvas node so Shift+D can restore Native Dot without rebuilding the catalog.
  bypassNativeHalftones(catalog)
  if (!("MutationObserver" in window)) return
  catalogObserver = new MutationObserver(() => bypassNativeHalftones(catalog))
  catalogObserver.observe(catalog, { childList: true, subtree: true })
}

function destroy() {
  if (!enabled) return
  enabled = false
  catalogObserver?.disconnect()
  appObserver?.disconnect()
  catalogObserver = null
  appObserver = null
  restoreNativeHalftones(document)
}

function boot() {
  if (!enabled) return
  const app = document.querySelector("#app")
  bindCatalog(document.querySelector(".catalog"))
  if (!app || !("MutationObserver" in window)) return
  appObserver?.disconnect()
  appObserver = new MutationObserver(() => bindCatalog(document.querySelector(".catalog")))
  appObserver.observe(app, { childList: true, subtree: false })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}

window.__RED_NATIVE_HALFTONE_BYPASS__ = {
  get active() { return enabled },
  bypass: () => bypassNativeHalftones(document),
  restore: () => restoreNativeHalftones(document),
  destroy,
}
