const DESKTOP_QUERY = window.matchMedia("(min-width: 981px)")
const NAV_GAP_PX = 10

let hoveredCategory = null
let frame = 0
let observer = null

function getNavList() {
  return document.querySelector(".nav-list")
}

function getCatalogFilter() {
  return document.querySelector(".catalog")?.dataset.activeFilter || null
}

function getEffectiveCategory() {
  return hoveredCategory || getCatalogFilter()
}

function clearOffsets(items) {
  items.forEach((item) => item.style.removeProperty("--nav-collision-x"))
}

function applyCollision() {
  frame = 0
  const nav = getNavList()
  if (!nav) return

  const items = [...nav.querySelectorAll(".nav-item[data-nav-category]")]
  clearOffsets(items)
  if (!DESKTOP_QUERY.matches) return

  const category = getEffectiveCategory()
  if (!category) return

  const activeIndex = items.findIndex((item) => item.dataset.navCategory === category)
  if (activeIndex <= 0) return

  const activeItem = items[activeIndex]
  const detail = activeItem.querySelector(".nav-detail")
  if (!detail) return

  const activeRect = activeItem.getBoundingClientRect()
  const detailWidth = Math.max(detail.getBoundingClientRect().width, detail.scrollWidth || 0)
  if (!Number.isFinite(detailWidth) || detailWidth <= 1) return

  // Every nav detail is right-anchored to its category title, so its occupied region
  // grows to the left. Preserve the selected category's anchor and fan only the
  // preceding categories left until the subtitle has a clean horizontal lane.
  let rightBoundary = activeRect.right - detailWidth - NAV_GAP_PX

  for (let index = activeIndex - 1; index >= 0; index -= 1) {
    const item = items[index]
    const rect = item.getBoundingClientRect()
    const shift = Math.min(0, rightBoundary - rect.right)
    item.style.setProperty("--nav-collision-x", `${shift.toFixed(2)}px`)
    rightBoundary = rect.left + shift - NAV_GAP_PX
  }
}

function scheduleCollision() {
  if (frame) cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => requestAnimationFrame(applyCollision))
}

function bindNavPointer() {
  const nav = getNavList()
  if (!nav || nav.dataset.collisionBound === "true") return
  nav.dataset.collisionBound = "true"

  nav.addEventListener("pointerover", (event) => {
    const item = event.target.closest?.(".nav-item[data-nav-category]")
    if (!item || !nav.contains(item)) return
    hoveredCategory = item.dataset.navCategory || null
    scheduleCollision()
  })

  nav.addEventListener("pointerout", (event) => {
    const item = event.target.closest?.(".nav-item[data-nav-category]")
    if (!item || !nav.contains(item)) return
    const nextItem = event.relatedTarget?.closest?.(".nav-item[data-nav-category]")
    if (nextItem && nav.contains(nextItem)) return
    hoveredCategory = null
    scheduleCollision()
  })
}

function bindObserver() {
  if (observer) observer.disconnect()
  const app = document.querySelector("#app")
  if (!app) return

  observer = new MutationObserver((mutations) => {
    const relevant = mutations.some((mutation) =>
      mutation.type === "childList" ||
      (mutation.type === "attributes" && mutation.attributeName === "data-active-filter")
    )
    if (!relevant) return
    bindNavPointer()
    scheduleCollision()
  })

  observer.observe(app, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-active-filter"],
  })
}

function boot() {
  bindNavPointer()
  bindObserver()
  scheduleCollision()

  window.addEventListener("resize", scheduleCollision, { passive: true })
  window.addEventListener("hashchange", scheduleCollision)
  DESKTOP_QUERY.addEventListener?.("change", scheduleCollision)
  document.fonts?.ready.then(scheduleCollision).catch(() => {})
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true })
} else {
  boot()
}
