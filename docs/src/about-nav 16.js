(() => {
  const ABOUT_CATEGORY = "resume"
  const ABOUT_TITLE = "About"
  const ABOUT_DETAIL = "Resume / CV / Contact"
  const SELECTION_LEAD_MS = 150

  let aboutLocked = decodeURIComponent(window.location.hash.slice(1)).toLowerCase() === ABOUT_CATEGORY
  let replayingAboutClick = false
  let patchFrame = 0
  let mutationObserver = null

  function aboutItem() {
    return document.querySelector(`.nav-item[data-nav-category="${ABOUT_CATEGORY}"]`)
  }

  function refreshMetrics(item) {
    if (!item) return
    const title = item.querySelector(".nav-title")
    const detail = item.querySelector(".nav-detail")
    if (!title || !detail) return

    requestAnimationFrame(() => {
      if (!item.isConnected) return
      const titleWidth = title.scrollWidth || title.offsetWidth || title.getBoundingClientRect().width
      const detailWidth = detail.scrollWidth || detail.getBoundingClientRect().width
      const hoverSpace = Math.max(0, Math.min(120, Math.ceil((detailWidth - titleWidth) / 2 + 10)))
      item.style.setProperty("--nav-hover-space", `${hoverSpace}px`)
      item.style.setProperty("--nav-title-width", `${Math.ceil(titleWidth)}px`)
      item.style.setProperty("--nav-detail-layout-width", `${Math.ceil(Math.max(titleWidth, detailWidth))}px`)
    })
  }

  function patchCopy(item) {
    if (!item) return
    const title = item.querySelector(".nav-title")
    const detail = item.querySelector(".nav-detail")
    let changed = false

    if (title && title.textContent !== ABOUT_TITLE) {
      title.textContent = ABOUT_TITLE
      changed = true
    }

    if (detail) {
      if (detail.dataset.typewriterText !== ABOUT_DETAIL) {
        detail.dataset.typewriterText = ABOUT_DETAIL
        changed = true
      }
      if (detail.dataset.typewriterNav !== "true" && detail.textContent !== ABOUT_DETAIL) {
        detail.textContent = ABOUT_DETAIL
        changed = true
      }
    }

    item.setAttribute("aria-label", `${ABOUT_TITLE}: ${ABOUT_DETAIL}`)
    if (changed) refreshMetrics(item)
  }

  function applyAboutLock() {
    const item = aboutItem()
    if (!item) return
    patchCopy(item)

    const nav = item.closest(".nav-list")
    if (!nav) return

    if (aboutLocked) {
      nav.querySelectorAll(".nav-item").forEach((navItem) => {
        navItem.classList.remove("is-nav-active")
        if (navItem === item) {
          navItem.classList.add("is-nav-locked")
          navItem.classList.remove("is-nav-lock-suppressed")
          navItem.dataset.aboutNavLocked = "true"
        } else {
          navItem.classList.remove("is-nav-locked")
          navItem.removeAttribute("data-about-nav-locked")
        }
      })
    } else if (item.dataset.aboutNavLocked === "true") {
      item.classList.remove("is-nav-locked")
      item.removeAttribute("data-about-nav-locked")
    }
  }

  function schedulePatch() {
    if (patchFrame) return
    patchFrame = requestAnimationFrame(() => {
      patchFrame = 0
      applyAboutLock()
    })
  }

  function clearAboutLock() {
    if (!aboutLocked) return
    aboutLocked = false
    schedulePatch()
  }

  function interceptNavigation(event) {
    const link = event.target?.closest?.("a[href]")
    if (!link) return

    const navItem = link.closest?.(".nav-item[data-nav-category]")
    const category = navItem?.dataset.navCategory || null

    if (category !== ABOUT_CATEGORY) {
      if (category || !link.closest?.(".nav-list")) clearAboutLock()
      return
    }

    if (replayingAboutClick || event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (Number.isFinite(event.button) && event.button !== 0) return

    event.preventDefault()
    event.stopImmediatePropagation()
    aboutLocked = true
    applyAboutLock()

    const delay = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? 0 : SELECTION_LEAD_MS
    window.setTimeout(() => {
      if (!navItem.isConnected) return
      replayingAboutClick = true
      try {
        navItem.click()
      } finally {
        replayingAboutClick = false
      }
      schedulePatch()
    }, delay)
  }

  function syncFromLocation() {
    const hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase()
    aboutLocked = hash === ABOUT_CATEGORY
    schedulePatch()
  }

  document.addEventListener("click", interceptNavigation, { capture: true })
  window.addEventListener("popstate", syncFromLocation)
  window.addEventListener("hashchange", syncFromLocation)

  const start = () => {
    schedulePatch()
    if (!("MutationObserver" in window)) return
    mutationObserver = new MutationObserver(schedulePatch)
    const app = document.querySelector("#app") || document.body
    mutationObserver.observe(app, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "data-nav-category"],
    })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true })
  } else {
    start()
  }
})()
