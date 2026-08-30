import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard, resetSampleCache } from "./dither-engine.js?v=20260830-snowlock2"
import { PUBLISHED_MOTION_CONFIG } from "./motion-default.js"
import {
  cancelReveal,
  refreshViewportDitherReveals,
  resetViewportDitherRevealSequence,
  trackViewportDitherReveal,
} from "./reveal-motion.js?v=20260830-snowlock2"

const PUBLIC_STYLE_ID = "red-dither-public-runtime-style"
const ROOT_MODE_ATTRIBUTE = "data-red-published-dither"
const ACTIVE_COLOR_MOTION_ATTRIBUTE = "data-active-color-motion"
const ACTIVE_COLOR_COOLDOWN_ATTRIBUTE = "data-active-color-boundary-cooldown"
const RETRY_DELAYS = [0, 60, 160, 360, 800, 1600]
const ONGOING_GAME_PROJECT_PATH = "/ongoing-game-project"

const state = {
  destroyed: false,
  renderFrame: 0,
  appObserver: null,
  catalogObserver: null,
  resizeObserver: null,
  revealObserver: null,
  observedMedia: new Set(),
  observedRevealCards: new Set(),
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

function activeColorOwnsCard(card) {
  return (
    card?.getAttribute?.(ACTIVE_COLOR_MOTION_ATTRIBUTE) === "true" ||
    card?.getAttribute?.(ACTIVE_COLOR_COOLDOWN_ATTRIBUTE) === "true"
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

function cardIntersectsViewport(card) {
  const rect = card?.getBoundingClientRect?.()
  if (!rect) return false
  const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0)
  return rect.bottom > 0 && rect.top < viewportHeight
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

function armViewportReveal(card, catalog) {
  if (!isMutedByActiveFilter(card, catalog)) return false
  if (activeColorOwnsCard(card)) {
    releaseViewportReveal(card, { forgetSignature: false })
    return false
  }
  const img = card.querySelector(".project-media img")
  const canvas = card.querySelector('.dither-preview-canvas[data-active="true"]')
  if (!img?.complete || img.naturalWidth <= 0 || !canvas || canvas.width <= 1 || canvas.height <= 1) {
    return false
  }

  const signature = revealSignature(card, catalog, canvas)
  const existingReveal = card.querySelector(".dither-reveal-canvas")
  if (state.revealSignatures.get(card) === signature && existingReveal) return true

  state.revealSignatures.set(card, signature)
  return trackViewportDitherReveal(card, canvas, PUBLISHED_MOTION_CONFIG)
}

function releaseViewportReveal(card, { forgetSignature = true } = {}) {
  cancelReveal(card, { remove: true })
  if (forgetSignature) state.revealSignatures.delete(card)
}

function handleRevealIntersections(entries) {
  if (state.destroyed) return
  const catalog = activeCatalog()
  if (!catalog) return

  let changed = false
  entries.forEach((entry) => {
    const card = entry.target
    if (!card?.isConnected || !isMutedByActiveFilter(card, catalog)) {
      releaseViewportReveal(card)
      return
    }
    if (activeColorOwnsCard(card)) {
      releaseViewportReveal(card, { forgetSignature: false })
      return
    }

    if (entry.isIntersecting) {
      changed = armViewportReveal(card, catalog) || changed
    } else {
      releaseViewportReveal(card)
    }
  })

  if (changed) refreshViewportDitherReveals({ linger: false })
}

function syncRevealTargets(catalog) {
  if (!state.revealObserver) return
  const nextCards = new Set(catalog?.querySelectorAll(".project-card.is-filter-muted") || [])

  for (const card of [...state.observedRevealCards]) {
    if (nextCards.has(card)) continue
    state.revealObserver.unobserve(card)
    state.observedRevealCards.delete(card)
    releaseViewportReveal(card)
  }

  for (const card of nextCards) {
    if (!state.observedRevealCards.has(card)) {
      state.observedRevealCards.add(card)
      state.revealObserver.observe(card)
    }
    if (cardIntersectsViewport(card)) armViewportReveal(card, catalog)
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
      if (state.revealObserver && state.observedRevealCards.has(card)) {
        state.revealObserver.unobserve(card)
        state.observedRevealCards.delete(card)
      }
      releaseViewportReveal(card)
      return
    }

    renderCard(card, PUBLISHED_DITHER_CONFIG)
    const canvas = card.querySelector(".dither-preview-canvas")
    if (!canvas) return
    canvas.dataset.active = "true"
    canvas.dataset.publishedMode = publishedMode()
  })

  syncRevealTargets(catalog)
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

function activeColorMotionChanged(mutation) {
  return (
    mutation.target instanceof Element &&
    mutation.target.classList.contains("project-card") &&
    (
      mutation.attributeName === ACTIVE_COLOR_MOTION_ATTRIBUTE ||
      mutation.attributeName === ACTIVE_COLOR_COOLDOWN_ATTRIBUTE
    )
  )
}

function revealCanvasMutationOnly(mutation) {
  if (mutation.type !== "childList") return false
  const nodes = [...mutation.addedNodes, ...mutation.removedNodes]
  return nodes.length > 0 && nodes.every((node) =>
    node instanceof Element && node.classList.contains("dither-reveal-canvas"),
  )
}

function bindCatalogObserver() {
  state.catalogObserver?.disconnect()
  state.catalogObserver = null
  const catalog = activeCatalog()
  if (!catalog || !("MutationObserver" in window)) return

  state.catalogObserver = new MutationObserver((mutations) => {
    if (state.destroyed) return
    mutations.forEach((mutation) => {
      if (!activeColorMotionChanged(mutation)) return
      if (activeColorOwnsCard(mutation.target)) {
        releaseViewportReveal(mutation.target, { forgetSignature: false })
      }
    })

    if (mutations.some((mutation) =>
      mutation.type === "childList" ||
      (mutation.type === "attributes" && mutation.target === catalog && mutation.attributeName === "data-active-filter"),
    )) {
      applyCategoryAliases(catalog)
    }

    const shouldRender = mutations.some((mutation) => {
      if (mutation.type === "childList") return !revealCanvasMutationOnly(mutation)
      if (mutation.type !== "attributes") return false
      if (activeColorMotionChanged(mutation)) return !activeColorOwnsCard(mutation.target)
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
    attributeFilter: [
      "class",
      "data-active-filter",
      ACTIVE_COLOR_MOTION_ATTRIBUTE,
      ACTIVE_COLOR_COOLDOWN_ATTRIBUTE,
    ],
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
      requestRender()
    })
  }

  if ("IntersectionObserver" in window) {
    state.revealObserver = new IntersectionObserver(handleRevealIntersections, {
      root: null,
      rootMargin: "0px",
      threshold: 0,
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
  state.revealObserver?.disconnect()
  state.appObserver = null
  state.catalogObserver = null
  state.resizeObserver = null
  state.revealObserver = null
  state.observedMedia.clear()
  state.observedRevealCards.clear()
  state.retryTimers.forEach((timer) => clearTimeout(timer))
  state.retryTimers.clear()
  document.querySelectorAll(".project-card").forEach((card) => releaseViewportReveal(card))
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
