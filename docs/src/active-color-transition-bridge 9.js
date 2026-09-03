const WATCH_ATTRIBUTE = "data-filter-phase"
let catalog = null
let observer = null
let appObserver = null

function activeCards(target) {
  return [...target?.querySelectorAll(".project-card:not(.is-filter-muted)") || []]
}

function ensureExitSnow(target) {
  if (!target || target.dataset.filterPhase !== "exiting") return
  requestAnimationFrame(() => {
    if (!target.isConnected || target.dataset.filterPhase !== "exiting") return
    if (target.querySelector(".active-color-snow-canvas")) return
    const runtime = window.__RED_ACTIVE_COLOR_SNOW__
    if (!runtime?.play) return
    activeCards(target).forEach((card, index) => runtime.play(card, "out", index))
  })
}

function bindCatalog(next) {
  if (catalog === next && observer) return
  observer?.disconnect()
  observer = null
  catalog = next || null
  if (!catalog || !("MutationObserver" in window)) return
  observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === WATCH_ATTRIBUTE)) ensureExitSnow(catalog)
  })
  observer.observe(catalog, { attributes: true, attributeFilter: [WATCH_ATTRIBUTE] })
  ensureExitSnow(catalog)
}

function boot() {
  const app = document.querySelector("#app")
  bindCatalog(document.querySelector(".catalog"))
  if (!app || !("MutationObserver" in window)) return
  appObserver?.disconnect()
  appObserver = new MutationObserver(() => bindCatalog(document.querySelector(".catalog")))
  appObserver.observe(app, { childList: true })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true })
else boot()
