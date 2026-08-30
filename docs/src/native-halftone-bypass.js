import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"

const generated = Boolean(PUBLISHED_DITHER_CONFIG?.mode && PUBLISHED_DITHER_CONFIG.mode !== "native")
let catalog = null
let catalogObserver = null
let appObserver = null

function stripNativeHalftones(root = document) {
  if (!generated || !root?.querySelectorAll) return 0
  const canvases = [...root.querySelectorAll(".project-halftone")]
  canvases.forEach((canvas) => canvas.remove())
  return canvases.length
}

function bindCatalog(nextCatalog) {
  if (!generated) return
  if (catalog === nextCatalog && catalogObserver) {
    stripNativeHalftones(catalog)
    return
  }
  catalogObserver?.disconnect()
  catalogObserver = null
  catalog = nextCatalog || null
  if (!catalog) return

  // Strip in the MutationObserver microtask, before main.js's queued native-halftone rAF
  // gets a chance to paint canvases that are hidden by the public Floyd renderer anyway.
  stripNativeHalftones(catalog)
  if (!("MutationObserver" in window)) return
  catalogObserver = new MutationObserver(() => stripNativeHalftones(catalog))
  catalogObserver.observe(catalog, { childList: true, subtree: true })
}

function boot() {
  if (!generated) return
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
  active: generated,
  strip: () => stripNativeHalftones(document),
}
