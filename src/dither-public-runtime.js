import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard } from "./dither-engine.js"

const state = {
  raf: 0,
  observer: null,
  resizeObserver: null,
  destroyed: false,
}

function renderAll() {
  state.raf = 0
  if (state.destroyed) return
  document.querySelectorAll(".project-card").forEach((card) => renderCard(card, PUBLISHED_DITHER_CONFIG))
}

function requestRender() {
  if (state.destroyed || state.raf) return
  state.raf = requestAnimationFrame(renderAll)
}

function bind() {
  state.observer?.disconnect()
  state.resizeObserver?.disconnect()

  const catalog = document.querySelector(".catalog")
  if (!catalog || state.destroyed) return

  state.observer = new MutationObserver(requestRender)
  state.observer.observe(catalog, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "data-active-filter"],
  })

  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver(requestRender)
    catalog.querySelectorAll(".project-media").forEach((media) => state.resizeObserver.observe(media))
  }

  catalog.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", requestRender, { once: true, passive: true })
  })

  requestRender()
}

const appObserver = "MutationObserver" in window
  ? new MutationObserver(() => {
      if (state.destroyed) return
      bind()
    })
  : null

function boot() {
  bind()
  const app = document.querySelector("#app")
  if (app) appObserver?.observe(app, { childList: true })
}

export function destroyPublicDitherRuntime() {
  state.destroyed = true
  if (state.raf) cancelAnimationFrame(state.raf)
  state.raf = 0
  state.observer?.disconnect()
  state.resizeObserver?.disconnect()
  appObserver?.disconnect()
  state.observer = null
  state.resizeObserver = null
}

boot()

window.__RED_DITHER_PUBLIC_RUNTIME__ = {
  destroy: destroyPublicDitherRuntime,
}
