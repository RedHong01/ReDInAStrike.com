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
  dirtyCards: new Set(),
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

function markCardDirty(card) {
  if (card?.isConnected) state.dirtyCards.add(card)
}

function markAllCardsDirty() {
  state.catalog?.querySelectorAll(".project-card").forEach(markCardDirty)
}

function renderEligibleCards() {
  state.renderFrame = 0
  if (state.destroyed || !state.catalog?.isConnected) return

  const cards = [...state.catalog.querySelectorAll(".project-card")]
  const hasIntersectionObserver = Boolean(state.cardObserver)

  cards.forEach((card, index) => {
    if (!isActiveCard(card)) {
      deactivateCard(card)
      state.dirtyCards.delete(card)
      return
    }

    const canvas = card.querySelector(":scope .dither-preview-canvas")
    const needsRender = state.dirtyCards.has(card) || !canvas
    if (!needsRender) return

    const shouldRender =
      !hasIntersectionObserver ||
      state.nearCards.has(card) ||
      index < INITIAL_PRIORITY_CARD_COUNT

    if (!shouldRender) return
    renderCard(card, PUBLISHED_DITHER_CONFIG)
    state.dirtyCards.delete(card)
  })
}

function requestRender() {
  if (state.destroyed || state.renderFrame) return
  state.renderFrame = requestAnimationFrame(renderEligibleCards)
}

function bindImageLoad(img) {
  if (!img || img.complete || state.boundImages.has(img)) return
  state.boundImages.add(img)
  img.addEventListener("load", () => {
    markCardDirty(img.closest(".project-card"))
    requestRender()
  }, { once: true, passive: true })
}

function syncObservedTargets() {
  state.syncFrame = 0
  const catalog = state.catalog
  if (state.destroyed || !catalog?.isConnected) return

  const nextMedia = new Set(catalog.querySelectorAll(".project-media"))
  for (const media of [...state.observedMedia]) {
    if (nextMedia.has(media)) continue
    state.resizeObserver?.unobserve(media)
    state.observedMedia.delete(media)
  }
  for (const media of nextMedia) {
    if (state.observedMedia.has(media)) continue
    state.observedMedia.add(media)
    state.resizeObserver?.observe(media)
    markCardDirty(media.closest(".project-card"))
  }

  const nextCards = new Set(catalog.querySelectorAll(".project-card"))
  for (const card of [...state.observedCards]) {
    if (nextCards.has(card)) continue
    state.cardObserver?.unobserve(card)
    state.observedCards.delete(card)
    state.nearCards.delete(card)
    state.dirtyCards.delete(card)
  }
  for (const card of nextCards) {
    if (state.observedCards.has(card)) continue
    state.observedCards.add(card)
    state.cardObserver?.observe(card)
    markCardDirty(card)
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
  state.dirtyCards.clear()
}

function classListContains(classValue, token) {
  return String(classValue || "").split(/\s+/).includes(token)
}

function mutedStateChanged(mutation) {
  if (mutation.type !== "attributes" || mutation.attributeName !== "class") return false
  const hadMuted = classListContains(mutation.oldValue, "is-filter-muted")
  const hasMuted = mutation.target?.classList?.contains("is-filter-muted") === true
  return hadMuted !== hasMuted
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
      let structureChanged = false
      let filterChanged = false
      let mutedChanged = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          structureChanged = true
          return
        }
        if (mutation.attributeName === "data-active-filter") {
          filterChanged = true
          return
        }
        if (mutedStateChanged(mutation)) {
          mutedChanged = true
          markCardDirty(mutation.target.closest?.(".project-card") || mutation.target)
        }
      })

      if (structureChanged) requestSync()
      if (filterChanged) markAllCardsDirty()
      if (structureChanged || filterChanged || mutedChanged) requestRender()
    })
    state.observer.observe(state.catalog, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["class", "data-active-filter"],
    })
  }

  if ("ResizeObserver" in window) {
    state.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => markCardDirty(entry.target.closest(".project-card")))
      requestRender()
    })
  }

  if ("IntersectionObserver" in window) {
    state.cardObserver = new IntersectionObserver((entries) => {
      let shouldRender = false
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          state.nearCards.add(entry.target)
          if (state.dirtyCards.has(entry.target)) shouldRender = true
        } else {
          state.nearCards.delete(entry.target)
        }
      })
      if (shouldRender) requestRender()
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
