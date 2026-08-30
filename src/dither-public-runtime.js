import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard, resetSampleCache } from "./dither-engine.js"
import { PUBLISHED_MOTION_CONFIG } from "./motion-default.js"
import {
  cancelReveal,
  refreshViewportDitherReveals,
  resetViewportDitherRevealSequence,
  trackViewportDitherReveal,
} from "./reveal-motion.js?v=20260829-viewport1"

const PUBLIC_STYLE_ID = "red-dither-public-runtime-style"
const ROOT_MODE_ATTRIBUTE = "data-red-published-dither"
const RETRY_DELAYS = [0, 60, 160, 360, 800, 1600]
const ONGOING_GAME_PROJECT_PATH = "/ongoing-game-project"

const state = {
  destroyed: false,
  renderFrame: 0,
  appObserver: null,
  catalogObserver: null,
  resizeObserver: null,
  observedMedia: new Set(),
  boundImages: new WeakSet(),
  retryTimers: new Set(),
  revealSignatures: new WeakMap(),
  revealSequenceKey: "",
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
    .project-media { overflow: hidden; }
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
      .catalog[data-active-filter] .project-card.is-filter-muted .project-halftone {
      opacity: 0 !important;
      visibility: hidden !important;
      display: none !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted
      .dither-preview-canvas[data-active="true"] {
      opacity: 1 !important;
      visibility: visible !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted.is-muted-restore-intent
      .dither-preview-canvas[data-active="true"] {
      opacity: 0 !important;
    }
    html[${ROOT_MODE_ATTRIBUTE}]:not([${ROOT_MODE_ATTRIBUTE}="native"])
      .catalog[data-active-filter] .project-card.is-filter-muted.is-muted-restore-return
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

function applyCategoryAliases(catalog) {
  if (!catalog || catalog.dataset.activeFilter !== "game") return

  const ongoingGameLink = [...catalog.querySelectorAll(".project-card a[href]")]
    .find((link) => {
      try {
        const pathname = new URL(link.href, window.location.href).pathname.replace(/\/+$/, "")
        return pathname.endsWith(ONGOING_GAME_PROJECT_PATH)
      } catch {
        return String(link.getAttribute("href") || "").includes("ongoing-game-project")
      }
    })
  const card = ongoingGameLink?.closest(".project-card")
  if (!card) return

  card.dataset.categoryAlias = "game"
  card.classList.remove(
    "is-filter-muted",
    "is-muted-restore-intent",
    "is-muted-restore-return",
  )
}

function isMutedByActiveFilter(card, catalog) {
  return Boolean(
    publishedIsGenerated() &&
    catalog?.dataset.activeFilter &&
    card?.classList.contains("is-filter-muted")
  )
}

function revealSignature(card, catalog, canvas) {
  const img = card.querySelector(".project-media img")
  const rect = canvas?.getBoundingClientRect?.()
  const cssSize = rect ? `${Math.round(rect.width)}x${Math.round(rect.height)}` : "0x0"
  return [
    catalog?.dataset.activeFilter || "",
    publishedMode(),
    img?.currentSrc || img?.src || "",
    `${canvas?.width || 0}x${canvas?.height || 0}`,
    cssSize,
  ].join("|")
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
  applyCategoryAliases(catalog)
  if (!publishedIsGenerated()) return
  syncResizeTargets(catalog)

  const sequenceKey = `${catalog.dataset.activeFilter || ""}|${publishedMode()}`
  if (sequenceKey !== state.revealSequenceKey) {
    resetViewportDitherRevealSequence()
    state.revealSequenceKey = sequenceKey
  }

  const cards = [...catalog.querySelectorAll(".project-card")]
  cards.forEach((card) => {
    const img = card.querySelector(".project-media img")
    bindImageLoad(img)

    if (!isMutedByActiveFilter(card, catalog)) {
      const canvas = card.querySelector(".dither-preview-canvas")
      if (canvas) canvas.dataset.active = "false"
      cancelReveal(card, { remove: true })
      state.revealSignatures.delete(card)
      return
    }

    renderCard(card, PUBLISHED_DITHER_CONFIG)
    const canvas = card.querySelector(".dither-preview-canvas")
    if (!canvas) return
    canvas.dataset.active = "true"
    canvas.dataset.publishedMode = publishedMode()

    const canReveal = img?.complete && img.naturalWidth > 0 && canvas.width > 1 && canvas.height > 1
    const signature = revealSignature(card, catalog, canvas)
    if (canReveal && state.revealSignatures.get(card) !== signature) {
      state.revealSignatures.set(card, signature)
      trackViewportDitherReveal(card, canvas, PUBLISHED_MOTION_CONFIG)
    }
  })

  refreshViewportDitherReveals({ linger: false })
}

function requestRender() {
  if (state.destroyed || state.renderFrame) return
  state.renderFrame = requestAnimationFrame(renderPublishedDither)
}

function mutedClassChanged(mutation) {
  const target = mutation.target
  if (!(target instanceof Element) || !target.classList.contains("project-card")) return false
  const before = new Set(String(mutation.oldValue || "").split(/\s+/).filter(Boolean))
  return before.has("is-filter-muted") !== target.classList.contains("is-filter-muted")
}

function bindCatalogObserver() {
  state.catalogObserver?.disconnect()
  state.catalogObserver = null
  const catalog = activeCatalog()
  if (!catalog || !("MutationObserver" in window)) return

  state.catalogObserver = new MutationObserver((mutations) => {
    if (state.destroyed) return
    const shouldRender = mutations.some((mutation) => {
      if (mutation.type === "childList") return true
      if (mutation.type !== "attributes") return false
      if (mutation.target === catalog && mutation.attributeName === "data-active-filter") return true
      return mutation.attributeName === "class" && mutedClassChanged(mutation)
    })
    if (shouldRender) requestRender()
  })

  state.catalogObserver.observe(catalog, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["class", "data-active-filter"],
  })
}

function bindAppObserver() {
  if (!("MutationObserver" in window)) return
  const app = document.querySelector("#app")
  if (!app) return
  state.appObserver?.disconnect()
  state.appObserver = new MutationObserver((mutations) => {
    if (state.destroyed) return
    if (!mutations.some((mutation) => mutation.type === "childList" && mutation.target === app)) return
    bindCatalogObserver()
    requestRender()
  })
  state.appObserver.observe(app, { childList: true })
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
  bindAppObserver()
  bindCatalogObserver()
  requestRender()
  scheduleRetries()

  if (!publishedIsGenerated()) return

  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver(() => {
      if (state.destroyed) return
      // dither-engine's sample key already contains logical rows / object-fit / position.
      // Do not globally discard every image sample for an ordinary settled media resize.
      requestRender()
    })
  }

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
  document.querySelectorAll(".project-card").forEach((card) => cancelReveal(card, { remove: true }))
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
