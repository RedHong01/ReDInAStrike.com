const DETAIL_OPEN_SELECTOR = '.project-card.is-project-preview[data-project-detail-open="true"]'
const EPSILON = 0.0005

let activeCard = null
let styleObserver = null
let frame = 0
let correcting = false

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function activeDrawerFor(card) {
  if (!card?.isConnected) return null
  const controlledId = card.getAttribute('aria-controls')
  if (controlledId) {
    const controlled = document.getElementById(controlledId)
    if (controlled?.classList.contains('project-detail-drawer')) return controlled
  }
  const sibling = card.nextElementSibling
  return sibling?.classList?.contains('project-detail-drawer') ? sibling : null
}

function readLength(style, name) {
  const value = Number.parseFloat(style.getPropertyValue(name))
  return Number.isFinite(value) ? value : Number.NaN
}

function reconcile(card = activeCard) {
  if (correcting || !card?.isConnected) return
  const drawer = activeDrawerFor(card)
  if (!drawer?.isConnected || drawer.dataset.drawerState === 'closing') return

  const style = getComputedStyle(card)
  const openHeight = readLength(style, '--project-detail-header-expanded-height')
  const minHeight = readLength(style, '--project-detail-header-min-height')
  const travel = openHeight - minHeight
  if (!(openHeight > 0) || !(minHeight > 0) || !(travel > 0)) return

  const cardRect = card.getBoundingClientRect()
  const drawerRect = drawer.getBoundingClientRect()
  if (!Number.isFinite(cardRect.top) || !Number.isFinite(drawerRect.top)) return

  // The detail lead and article are one physical surface while their edges
  // overlap. Derive the lead height from that live seam instead of from a
  // remembered scroll origin: desiredHeight = articleTop - leadTop.
  // This remains correct if the site header, responsive rows, fonts, or the
  // drawer's opening layout move after the article was first activated.
  const desiredHeight = clamp(drawerRect.top - cardRect.top, minHeight, openHeight)
  const progress = clamp((openHeight - desiredHeight) / travel, 0, 1)
  const current = Number.parseFloat(card.style.getPropertyValue('--project-detail-header-progress'))

  if (Number.isFinite(current) && Math.abs(current - progress) <= EPSILON) return

  correcting = true
  card.style.setProperty('--project-detail-header-progress', progress.toFixed(4))
  correcting = false
}

function requestReconcile() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    syncActiveCard()
    reconcile()
  })
}

function observeCard(card) {
  styleObserver?.disconnect()
  styleObserver = null
  activeCard = card || null
  if (!activeCard) return

  styleObserver = new MutationObserver((records) => {
    if (correcting) return
    if (records.some((record) => record.attributeName === 'style')) reconcile(activeCard)
  })
  styleObserver.observe(activeCard, { attributes: true, attributeFilter: ['style'] })
  reconcile(activeCard)
}

function syncActiveCard() {
  const next = document.querySelector(DETAIL_OPEN_SELECTOR)
  if (next !== activeCard) observeCard(next)
}

const treeObserver = new MutationObserver(() => {
  syncActiveCard()
  requestReconcile()
})

treeObserver.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['data-project-detail-open', 'data-drawer-state', 'aria-controls'],
})

window.addEventListener('scroll', requestReconcile, { passive: true })
window.addEventListener('resize', requestReconcile, { passive: true })
window.visualViewport?.addEventListener('resize', requestReconcile, { passive: true })

syncActiveCard()
requestReconcile()
