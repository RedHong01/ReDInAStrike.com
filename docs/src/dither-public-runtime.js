import { PUBLISHED_DITHER_CONFIG } from "./dither-default.js"
import { renderCard } from "./dither-engine.js"

const DITHER_NEAR_MARGIN = 1000
const INITIAL_PRIORITY_CARD_COUNT = 8

const state = {
  renderFrame: 0,
  syncFrame: 0,
  catalog: null,
  observer: null,
  resizeObserver: null,
  cardObserver: null,
  appObserver: null,
  observedMedia: new Set(),
  observedCards: new Set(),
  nearCards: new Set(),
  boundImages: new WeakSet(),
  destroyed: false,
}

function isActiveCard(card) {
  return Boolean(
    card?.isConnected &&
    card.classList.contains("is-filter-muted") &&
    card.closest(".catalog")?.dataset.activeFilter &&
    PUBLISHED_DITHER_CONFIG.mode !== "native"
  )
}

function deactivateCard(card) {
  const canvas = card?.querySelector(":scope .dither-preview-canvas")
  if (canvas?.dataset.active !== "false") canvas.dataset.active = "false"
}

function renderEligibleCards() {
  state.renderFrame = 0
  if (state.destroyed || !state.catalog?.isConnected) return

  const cards = [...state.catalog.querySelectorAll(".project-card")]
  const hasIntersectionObserver = Boolean(state.cardObserver)

  cards.forEach((card, index) => {
    if (!isActiveCard(card)) {
      deactivateCard(card)
      return
    }

    const shouldRender =
      !hasIntersectionObserver ||
      state.nearCards.has(card) ||
      index < INITIAL_PRIORITY_CARD_COUNT

    if (shouldRender) renderCard(card, PUBLISHED_DITHER_CONFIG)
  })
}

function requestRender() {
  if (state.destroyed || state.renderFrame) return
  state.renderFrame = requestAnimationFrame(renderEligibleCards)
}

function bindImageLoad(img) {
  if (!img || img.complete || state.boundImages.has(img)) return
  state.boundImages.add(img)
  img.addEventListener("load", requestRender, { once: true, passive: true })
}

function syncObservedTargets() {
  state.syncFrame = 0
  const catalog = state.catalog
  if (state.destroyed || !catalog?.isConnected) return

  const nextMedia = new Set(catalog.querySelectorAll(".project-media"))
  for (const media of state.observedMedia) {
    if (nextMedia.has(media)) continue
    state.resizeObserver?.unobserve(media)
    state.observedMedia.delete(media)
  }
  for (const media of nextMedia) {
    if (state.observedMedia.has(media)) continue
    state.observedMedia.add(media)
    state.resizeObserver?.observe(media)
  }

  const nextCards = new Set(catalog.querySelectorAll(".project-card"))
  for (const card of state.observedCards) {
    if (nextCards.has(card)) continue
    state.cardObserver?.unobserve(card)
    state.observedCards.delete(card)
    state.nearCards.delete(card)
  }
  for (const card of nextCards) {
    if (state.observedCards.has(card)) continue
    state.observedCards.add(card)
    state.cardObserver?.observe(card)
  }

  catalog.querySelectorAll("img").forEach(bindImageLoad)
  requestRender()
}

function requestSync() {
  if (state.destroyed || state.syncFrame) return
  state.syncFrame = requestAnimationFrame(syncObservedTargets)
}

function disconnectCatalogObservers() {
  state.observer?.disconnect()
  state.resizeObserver?.disconnect()
  state.cardObserver?.disconnect()
  state.observer = null
  state.resizeObserver = null
  state.cardObserver = null
  state.observedMedia.clear()
  state.observedCards.clear()
  state.nearCards.clear()
}

function bindCatalog(nextCatalog = document.querySelector(".catalog")) {
  if (state.destroyed) return
  if (state.catalog === nextCatalog && nextCatalog?.isConnected) {
    requestSync()
    return
  }

  disconnectCatalogObservers()
  state.catalog = nextCatalog || null
  if (!state.catalog) return

  if ("MutationObserver" in window) {
    state.observer = new MutationObserver((mutations) => {
      const structureChanged = mutations.some((mutation) => mutation.type === "childList")
      if (structureChanged) requestSync()
      requestRender()
    })
    state.observer.observe(state.catalog, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "data-active-filter"],
    })
  }

  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver(requestRender)
  }

  if ("IntersectionObserver" in window) {
    state.cardObserver = new IntersectionObserver((entries) => {
      let changed = false
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!state.nearCards.has(entry.target)) {
            state.nearCards.add(entry.target)
            changed = true
          }
        } else if (state.nearCards.delete(entry.target)) {
          changed = true
        }
      })
      if (changed) requestRender()
    }, {
      root: null,
      rootMargin: `${DITHER_NEAR_MARGIN}px 0px`,
      threshold: 0,
    })
  }

  requestSync()
}

function boot() {
  bindCatalog()

  if ("MutationObserver" in window) {
    state.appObserver = new MutationObserver(() => {
      if (state.destroyed) return
      const nextCatalog = document.querySelector(".catalog")
      if (nextCatalog !== state.catalog) bindCatalog(nextCatalog)
    })
    const app = document.querySelector("#app")
    if (app) state.appObserver.observe(app, { childList: true })
  }
}

export function destroyPublicDitherRuntime() {
  state.destroyed = true
  if (state.renderFrame) cancelAnimationFrame(state.renderFrame)
  if (state.syncFrame) cancelAnimationFrame(state.syncFrame)
  state.renderFrame = 0
  state.syncFrame = 0
  disconnectCatalogObservers()
  state.appObserver?.disconnect()
  state.appObserver = null
  state.catalog = null
}

boot()

window.__RED_DITHER_PUBLIC_RUNTIME__ = {
  destroy: destroyPublicDitherRuntime,
}
