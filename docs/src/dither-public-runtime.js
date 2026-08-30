import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard, resetSampleCache } from "./dither-engine.js"

const PUBLIC_STYLE_ID = "red-dither-public-runtime-style"
const ROOT_MODE_ATTRIBUTE = "data-red-published-dither"
const RETRY_DELAYS = [0, 60, 160, 360, 800, 1600]

const state = {
  destroyed: false,
  renderFrame: 0,
  appObserver: null,
  catalogObserver: null,
  resizeObserver: null,
  observedMedia: new Set(),
  boundImages: new WeakSet(),
  retryTimers: new Set(),
}

function publishedMode() {
  return PUBLISHED_DITHER_CONFIG?.mode || "native"
}

function publishedIsGenerated() {
  return publishedMode() !== "native"
}

function ensurePublicStyles() {
  let style = document.getElementById(PUBLIC_STYLE_ID)
  if (!style) {
    style = document.createElement("style")
    style.id = PUBLIC_STYLE_ID
    document.head.appendChild(style)
  }

  style.textContent = `
    .project-media {
      overflow: hidden;
    }

    .dither-preview-canvas {
      position: absolute;
      inset: 0;
      z-index: 6 !important;
      display: block;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      background: var(--paper);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity var(--catalog-muted-hover-ms, 475ms) cubic-bezier(0.22, 1, 0.36, 1);
    }

    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter]
      .project-card.is-filter-muted
      .project-halftone {
      opacity: 0 !important;
      visibility: hidden !important;
      display: none !important;
    }

    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter]
      .project-card.is-filter-muted
      .dither-preview-canvas[data-active="true"] {
      opacity: 1 !important;
      visibility: visible !important;
    }

    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter]
      .project-card.is-filter-muted.is-muted-restore-intent
      .dither-preview-canvas[data-active="true"] {
      opacity: 0 !important;
    }

    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter]
      .project-card.is-filter-muted.is-muted-restore-return
      .dither-preview-canvas[data-active="true"] {
      opacity: 1 !important;
    }
  `
}

function applyPublishedModeState() {
  document.documentElement.setAttribute(ROOT_MODE_ATTRIBUTE, publishedMode())
}

function activeCatalog() {
  return document.querySelector(".catalog")
}

function isMutedByActiveFilter(card, catalog) {
  return Boolean(
    publishedIsGenerated() &&
    catalog?.dataset.activeFilter &&
    card?.classList.contains("is-filter-muted")
  )
}

function bindImageLoad(img) {
  if (!img || img.complete || state.boundImages.has(img)) return
  state.boundImages.add(img)
  img.addEventListener("load", () => {
    if (state.destroyed) return
    resetSampleCache?.()
    requestRender()
  }, { once: true, passive: true })
}

function syncResizeTargets(catalog) {
  if (!state.resizeObserver) return
  const nextMedia = new Set(catalog?.querySelectorAll(".project-media") || [])

  for (const media of [...state.observedMedia]) {
    if (nextMedia.has(media)) continue
    state.resizeObserver.unobserve(media)
    state.observedMedia.delete(media)
  }

  for (const media of nextMedia) {
    if (state.observedMedia.has(media)) continue
    state.observedMedia.add(media)
    state.resizeObserver.observe(media)
  }
}

function renderPublishedDither() {
  state.renderFrame = 0
  if (state.destroyed) return

  applyPublishedModeState()
  ensurePublicStyles()

  const catalog = activeCatalog()
  if (!catalog) return

  syncResizeTargets(catalog)

  const cards = [...catalog.querySelectorAll(".project-card")]
  cards.forEach((card) => {
    const img = card.querySelector(".project-media img")
    bindImageLoad(img)

    if (!isMutedByActiveFilter(card, catalog)) {
      const canvas = card.querySelector(".dither-preview-canvas")
      if (canvas) canvas.dataset.active = "false"
      return
    }

    renderCard(card, PUBLISHED_DITHER_CONFIG)

    const canvas = card.querySelector(".dither-preview-canvas")
    if (canvas) {
      canvas.dataset.active = "true"
      canvas.dataset.publishedMode = publishedMode()
    }
  })
}

function requestRender() {
  if (state.destroyed || state.renderFrame) return
  state.renderFrame = requestAnimationFrame(renderPublishedDither)
}

function bindCatalogObserver() {
  state.catalogObserver?.disconnect()
  state.catalogObserver = null

  const catalog = activeCatalog()
  if (!catalog || !("MutationObserver" in window)) return

  state.catalogObserver = new MutationObserver((mutations) => {
    if (state.destroyed) return
    let shouldRender = false

    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        shouldRender = true
        break
      }
      if (mutation.type === "attributes") {
        shouldRender = true
        break
      }
    }

    if (shouldRender) requestRender()
  })

  state.catalogObserver.observe(catalog, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: false,
    attributeFilter: ["class", "data-active-filter"],
  })
}

function bindAppObserver() {
  if (!("MutationObserver" in window)) return
  const app = document.querySelector("#app")
  if (!app) return

  state.appObserver = new MutationObserver(() => {
    if (state.destroyed) return
    bindCatalogObserver()
    requestRender()
  })

  state.appObserver.observe(app, {
    childList: true,
    subtree: true,
  })
}

function scheduleRetries() {
  RETRY_DELAYS.forEach((delay) => {
    const timer = window.setTimeout(() => {
      state.retryTimers.delete(timer)
      if (state.destroyed) return
      bindCatalogObserver()
      requestRender()
    }, delay)
    state.retryTimers.add(timer)
  })
}

function boot() {
  applyPublishedModeState()
  ensurePublicStyles()

  if (!publishedIsGenerated()) return

  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver(() => {
      if (state.destroyed) return
      resetSampleCache?.()
      requestRender()
    })
  }

  bindAppObserver()
  bindCatalogObserver()
  requestRender()
  scheduleRetries()

  window.addEventListener("resize", requestRender, { passive: true })
}

export function destroyPublicDitherRuntime() {
  if (state.destroyed) return
  state.destroyed = true

  if (state.renderFrame) cancelAnimationFrame(state.renderFrame)
  state.renderFrame = 0

  state.appObserver?.disconnect()
  state.catalogObserver?.disconnect()
  state.resizeObserver?.disconnect()
  state.appObserver = null
  state.catalogObserver = null
  state.resizeObserver = null
  state.observedMedia.clear()

  state.retryTimers.forEach((timer) => clearTimeout(timer))
  state.retryTimers.clear()

  window.removeEventListener("resize", requestRender)
  document.documentElement.removeAttribute(ROOT_MODE_ATTRIBUTE)
  document.getElementById(PUBLIC_STYLE_ID)?.remove()
}

boot()

window.__RED_DITHER_PUBLIC_RUNTIME__ = {
  destroy: destroyPublicDitherRuntime,
  render: requestRender,
  mode: publishedMode(),
}
