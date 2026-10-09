// Lightweight boundary-breath loader.
// The full runtime is only useful while the homepage catalog has an active
// category filter, so detail routes and the unfiltered first frame should not
// parse/evaluate the full breath implementation or its motion config.

let runtimePromise = null
let appObserver = null
let catalogObserver = null

function disconnectLoaderObservers() {
  appObserver?.disconnect()
  catalogObserver?.disconnect()
  appObserver = null
  catalogObserver = null
}

function loadRuntime() {
  if (runtimePromise) return runtimePromise
  if (!document.querySelector(".catalog")) return Promise.resolve(null)

  runtimePromise = import("./boundary-breath-runtime-impl.js?v=20260908-perf2")
    .then((module) => {
      disconnectLoaderObservers()
      return module
    })
    .catch((error) => {
      runtimePromise = null
      throw error
    })
  return runtimePromise
}

function bindCatalog(nextCatalog) {
  catalogObserver?.disconnect()
  catalogObserver = null
  if (!nextCatalog || runtimePromise) return

  if (nextCatalog.dataset.activeFilter) {
    loadRuntime().catch(() => {})
    return
  }

  if (!("MutationObserver" in window)) return
  catalogObserver = new MutationObserver(() => {
    if (nextCatalog.dataset.activeFilter) loadRuntime().catch(() => {})
  })
  catalogObserver.observe(nextCatalog, {
    attributes: true,
    attributeFilter: ["data-active-filter"],
  })
}

function bindApp() {
  const app = document.querySelector("#app")
  if (!app || !("MutationObserver" in window)) {
    bindCatalog(document.querySelector(".catalog"))
    return
  }

  appObserver?.disconnect()
  appObserver = new MutationObserver(() => bindCatalog(document.querySelector(".catalog")))
  appObserver.observe(app, { childList: true, subtree: false })
  bindCatalog(document.querySelector(".catalog"))
}

function start() {
  bindApp()
  window.__RED_BOUNDARY_BREATH_LOADER__ = Object.freeze({ load: loadRuntime })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true })
} else {
  start()
}
