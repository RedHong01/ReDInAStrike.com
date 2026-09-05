const PIN_EPSILON_PX = 1.5
const PREVIEW_HEADER_SEAM_EPSILON_PX = 2
const PREVIEW_ABOUT_SEAM_EPSILON_PX = 2
let cachedBoundaryFrame = null
let cachedBoundaryContext = null

export const BOUNDARY_DEPTH_RATIO = 0.19
export const BOUNDARY_DEPTH_MIN_PX = 132
export const BOUNDARY_DEPTH_MAX_PX = 310
export const BOUNDARY_HOLD_RATIO = 0.012
export const BOUNDARY_HOLD_MIN_PX = 6
export const BOUNDARY_HOLD_MAX_PX = 18

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function viewportHeight() {
  return Math.max(
    window.innerHeight || 0,
    document.documentElement.clientHeight || 0,
    window.visualViewport?.height || 0,
    1,
  )
}

function headerBottom(viewportBottom) {
  const header = document.querySelector(".site-header")
  return clamp(header?.getBoundingClientRect?.().bottom || 0, 0, viewportBottom)
}

function followingRow(expandedRow, targetCard) {
  const targetRow = targetCard?.closest?.(".project-row")
  if (!expandedRow || !targetRow || expandedRow === targetRow) return false

  // Some embedded WebKit/page-evaluation contexts do not expose
  // compareDocumentPosition. The catalog rows are sibling sections, so walk
  // the same sibling chain instead of relying on that optional DOM API.
  if (expandedRow.parentElement !== targetRow.parentElement) return false
  for (let row = expandedRow.nextElementSibling; row; row = row.nextElementSibling) {
    if (row === targetRow) return true
  }
  return false
}

function livePreviewRect(expandedCard) {
  const rect = expandedCard?.getBoundingClientRect?.()
  if (!rect || rect.width <= 0 || rect.height <= 0) return null
  return rect
}

/**
 * True once the expanded preview's own top edge has reached the header's
 * painted bottom edge. The header already draws a rule there, so the card must
 * not draw a second one directly under it.
 * Deliberately independent of the sticky test below: below the two-column
 * breakpoint the expanded row stays in normal flow and scrolls its top edge
 * under the header instead of pinning against it.
 */
function previewMeetsHeaderEdge(cardRect, headerEdge) {
  if (!cardRect) return false
  return cardRect.top <= headerEdge + PREVIEW_HEADER_SEAM_EPSILON_PX
}

function pinnedPreviewBoundary(expandedRow, cardRect, headerEdge, viewportBottom, expandedCard = null) {
  if (!expandedRow || !cardRect) return null
  const rowSticky = getComputedStyle(expandedRow).position === "sticky"
  const cardSticky = expandedCard?.dataset?.projectDetailOpen === "true" &&
    getComputedStyle(expandedCard).position === "sticky"
  if (!rowSticky && !cardSticky) return null

  const rowRect = expandedRow.getBoundingClientRect?.()
  if (!rowRect || rowRect.width <= 0 || rowRect.height <= 0) return null

  const pinned = cardSticky
    ? cardRect.top <= headerEdge + PIN_EPSILON_PX && cardRect.bottom > headerEdge + PIN_EPSILON_PX
    : rowRect.top <= headerEdge + PIN_EPSILON_PX &&
      rowRect.bottom > headerEdge + PIN_EPSILON_PX &&
      cardRect.top <= headerEdge + PIN_EPSILON_PX &&
      cardRect.bottom > headerEdge + PIN_EPSILON_PX
  if (!pinned) return null

  return clamp(cardSticky ? cardRect.bottom : Math.max(rowRect.bottom, cardRect.bottom), 0, viewportBottom)
}

/**
 * Return the live paper/ink clipping window for one card.
 * Later cards use the pinned expanded preview's lower edge as their upper
 * occlusion line, so every binary surface agrees on what is physically hidden.
 */
export function readViewportBoundaryContext(frameTime = null) {
  if (
    Number.isFinite(frameTime) &&
    frameTime === cachedBoundaryFrame &&
    cachedBoundaryContext
  ) {
    return cachedBoundaryContext
  }

  const bottom = viewportHeight()
  const headerEdge = headerBottom(bottom)
  const expandedCard = document.querySelector(".project-card.is-project-preview:not(.project-preview-exit-ghost)")
  const expandedRow = expandedCard?.closest?.(".project-row")
  const expandedRect = livePreviewRect(expandedCard)
  const aboutCard = expandedCard ? document.querySelector(".about-card") : null
  const aboutRect = livePreviewRect(aboutCard)
  const expandedBoundary = pinnedPreviewBoundary(
    expandedRow,
    expandedRect,
    headerEdge,
    bottom,
    expandedCard,
  )

  const context = {
    bottom,
    headerEdge,
    expandedCard,
    expandedRow,
    expandedBoundary,
    expandedMeetsHeader: previewMeetsHeaderEdge(expandedRect, headerEdge),
    expandedMeetsAbout: Boolean(
      expandedRect &&
      aboutRect &&
      Math.abs(expandedRect.bottom - aboutRect.top) <= PREVIEW_ABOUT_SEAM_EPSILON_PX,
    ),
  }
  if (Number.isFinite(frameTime)) {
    cachedBoundaryFrame = frameTime
    cachedBoundaryContext = context
  }
  return context
}

export function viewportBoundsForCard(card = null, context = null) {
  const boundaryContext = context || readViewportBoundaryContext()
  let top = boundaryContext.headerEdge
  if (
    boundaryContext.expandedBoundary !== null &&
    followingRow(boundaryContext.expandedRow, card)
  ) {
    top = boundaryContext.expandedBoundary
  }

  return { top, bottom: boundaryContext.bottom }
}

export function boundaryMetrics(bounds) {
  const span = Math.max(1, bounds.bottom - bounds.top)
  return {
    depth: Math.min(
      BOUNDARY_DEPTH_MAX_PX,
      Math.max(BOUNDARY_DEPTH_MIN_PX, span * BOUNDARY_DEPTH_RATIO),
    ),
    hold: Math.min(
      BOUNDARY_HOLD_MAX_PX,
      Math.max(BOUNDARY_HOLD_MIN_PX, span * BOUNDARY_HOLD_RATIO),
    ),
  }
}

export function boundaryStrength(y, bounds, metrics, smooth = (value) => value) {
  const fromTop = y - bounds.top
  const fromBottom = bounds.bottom - y
  if (fromTop <= 0 || fromBottom <= 0) return 1

  const nearest = Math.min(fromTop, fromBottom)
  if (nearest <= metrics.hold) return 1
  if (nearest >= metrics.hold + metrics.depth) return 0
  return 1 - smooth((nearest - metrics.hold) / metrics.depth)
}

export function boundaryVisibility(y, bounds, metrics, smooth = (value) => value) {
  return 1 - boundaryStrength(y, bounds, metrics, smooth)
}
